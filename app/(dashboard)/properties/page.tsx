// Listado de propiedades publicadas.
import Link from "next/link";
import { Plus } from "lucide-react";
import { getProperties } from "@/lib/properties";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { PropertyCard } from "@/components/property-card";
import { buttonVariants } from "@/components/ui/button";

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <>
      <DashboardTopbar breadcrumb="Propiedades" notifications={[]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Propiedades</h1>
            <p className="text-sm text-muted-foreground">
              Publicá las propiedades que tu agente puede ofrecer a los leads.
            </p>
          </div>
          <Link href="/properties/new" className={buttonVariants()}>
            <Plus />
            Nueva propiedad
          </Link>
        </div>

        {properties.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no publicaste ninguna propiedad.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
