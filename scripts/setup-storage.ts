// Crea el bucket de Supabase Storage para las fotos de propiedades, si no
// existe. Solo hace falta correrlo una vez por proyecto de Supabase:
//   npx tsx --env-file=.env scripts/setup-storage.ts
import { supabaseAdmin, PROPERTIES_BUCKET } from "../lib/supabase";

async function main() {
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) throw listError;

  const exists = buckets?.some((b) => b.name === PROPERTIES_BUCKET);
  if (exists) {
    console.log(`El bucket "${PROPERTIES_BUCKET}" ya existe.`);
    return;
  }

  const { error } = await supabaseAdmin.storage.createBucket(PROPERTIES_BUCKET, {
    public: true,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (error) throw error;
  console.log(`Bucket "${PROPERTIES_BUCKET}" creado correctamente.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
