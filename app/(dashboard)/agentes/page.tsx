// Listado de agentes/admins con acceso al dashboard (solo ADMIN).
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { getAgents } from "@/lib/agents";
import { roleNames } from "@/lib/labels";
import { timeAgo } from "@/lib/utils";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AgentsPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "ADMIN") redirect("/");

  const agents = await getAgents();

  return (
    <>
      <DashboardTopbar breadcrumb="Agentes" notifications={[]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Agentes</h1>
            <p className="text-sm text-muted-foreground">
              Usuarios con acceso al dashboard.
            </p>
          </div>
          <Link href="/agentes/new" className={buttonVariants()}>
            <Plus />
            Nuevo agente
          </Link>
        </div>

        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay agentes.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell className="text-muted-foreground">{agent.email}</TableCell>
                  <TableCell>
                    <Badge variant={agent.role === "ADMIN" ? "default" : "secondary"}>
                      {roleNames[agent.role] || agent.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {timeAgo(agent.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
