// Tarjeta de propiedad para el listado, con foto de portada y características.
import Link from "next/link";
import { Bath, Bed, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Property } from "@prisma/client";

const operationLabels: Record<string, string> = {
  BUY: "Venta",
  RENT: "Alquiler",
};

const priceFormatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="relative w-full pt-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={property.coverPhotoUrl}
        alt={property.title}
        className="aspect-video w-full rounded-t-xl object-cover"
      />
      <CardHeader>
        <CardAction>
          <Badge>{operationLabels[property.operation] ?? property.operation}</Badge>
        </CardAction>
        <CardTitle>{property.title}</CardTitle>
        <CardDescription className="line-clamp-2">{property.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-4" />
          {property.zone}
        </span>
        {property.bedrooms != null && (
          <span className="flex items-center gap-1">
            <Bed className="size-4" />
            {property.bedrooms}
          </span>
        )}
        {property.bathrooms != null && (
          <span className="flex items-center gap-1">
            <Bath className="size-4" />
            {property.bathrooms}
          </span>
        )}
        {property.areaM2 != null && (
          <span className="flex items-center gap-1">
            <Ruler className="size-4" />
            {property.areaM2} m²
          </span>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4">
        <span className="text-lg font-semibold tabular-nums">
          {priceFormatter.format(property.price)}
        </span>
        <Link href={`/properties/${property.id}`} className={buttonVariants()}>
          Ver propiedad
        </Link>
      </CardFooter>
    </Card>
  );
}
