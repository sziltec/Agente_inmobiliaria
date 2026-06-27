// Alta de un agente/admin nuevo (solo ADMIN).
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { AgentForm } from "@/components/agent-form";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function NewAgentPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "ADMIN") redirect("/");

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <Link
          href="/agentes"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>
      </header>

      <div className="mx-auto w-full max-w-md flex-1 p-6">
        <h1 className="text-2xl font-semibold">Nuevo agente</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Crea el acceso al dashboard para un agente o admin nuevo.
        </p>
        <AgentForm />
      </div>
    </>
  );
}
