// Detalle de una propiedad publicada.
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bath, Bed, MapPin, Ruler } from "lucide-react";
import { getProperty } from "@/lib/properties";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const operationLabels: Record<string, string> = {
  BUY: "Venta",
  RENT: "Alquiler",
};

const priceFormatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <Link
          href="/properties"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.coverPhotoUrl}
          alt={property.title}
          className="aspect-video w-full rounded-xl object-cover"
        />

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{property.title}</h1>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {property.zone}
            </p>
          </div>
          <Badge>{operationLabels[property.operation] ?? property.operation}</Badge>
        </div>

        <p className="mt-2 text-2xl font-semibold tabular-nums">
          {priceFormatter.format(property.price)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="capitalize">{property.propertyType}</span>
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed className="size-4" />
              {property.bedrooms} dormitorios
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="size-4" />
              {property.bathrooms} baños
            </span>
          )}
          {property.areaM2 != null && (
            <span className="flex items-center gap-1">
              <Ruler className="size-4" />
              {property.areaM2} m²
            </span>
          )}
        </div>

        <p className="mt-6 whitespace-pre-wrap text-sm text-foreground">
          {property.description}
        </p>
      </div>
    </>
  );
}
