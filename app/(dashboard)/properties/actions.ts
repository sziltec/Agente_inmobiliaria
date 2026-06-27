"use server";

// Alta de una propiedad: sube la foto de portada a Supabase Storage y crea
// el registro en la base.
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSupabaseAdmin, PROPERTIES_BUCKET } from "@/lib/supabase";
import { verifySession } from "@/lib/dal";

export type CreatePropertyState = { error?: string };

export async function createProperty(
  _prevState: CreatePropertyState,
  formData: FormData,
): Promise<CreatePropertyState> {
  await verifySession();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const operation = String(formData.get("operation") ?? "");
  const propertyType = String(formData.get("propertyType") ?? "").trim();
  const zone = String(formData.get("zone") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "");
  const bedroomsRaw = String(formData.get("bedrooms") ?? "");
  const bathroomsRaw = String(formData.get("bathrooms") ?? "");
  const areaM2Raw = String(formData.get("areaM2") ?? "");
  const photo = formData.get("photo");

  if (!title || !description || !propertyType || !zone) {
    return { error: "Completá todos los campos obligatorios." };
  }
  if (operation !== "BUY" && operation !== "RENT") {
    return { error: "Elegí si es venta o alquiler." };
  }
  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "El precio tiene que ser un número mayor a 0." };
  }
  if (!(photo instanceof File) || photo.size === 0) {
    return { error: "Subí una foto de portada." };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const ext = photo.name.split(".").pop() || "jpg";
  const path = `${randomUUID()}.${ext}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from(PROPERTIES_BUCKET)
    .upload(path, photo, { contentType: photo.type });
  if (uploadError) {
    return { error: `No se pudo subir la foto: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(PROPERTIES_BUCKET).getPublicUrl(path);

  await db.property.create({
    data: {
      title,
      description,
      operation,
      propertyType,
      zone,
      price: Math.round(price),
      bedrooms: bedroomsRaw ? Math.round(Number(bedroomsRaw)) : null,
      bathrooms: bathroomsRaw ? Math.round(Number(bathroomsRaw)) : null,
      areaM2: areaM2Raw ? Math.round(Number(areaM2Raw)) : null,
      coverPhotoUrl: publicUrl,
    },
  });

  revalidatePath("/properties");
  redirect("/properties");
}
