// Formulario para publicar una propiedad nueva.
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/property-form";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function NewPropertyPage() {
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
        <h1 className="text-2xl font-semibold">Nueva propiedad</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Subí la foto de portada y los datos del inmueble.
        </p>
        <PropertyForm />
      </div>
    </>
  );
}
