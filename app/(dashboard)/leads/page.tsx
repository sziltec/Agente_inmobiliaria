// Tabla de prospectos (leads) capturados por el agente.
import { getLeads } from "@/lib/leads";
import { getAgents } from "@/lib/agents";
import { getCurrentUser } from "@/lib/dal";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { LeadsTable, type LeadRow } from "@/components/leads-table";

export default async function LeadsPage() {
  const [leads, agents, currentUser] = await Promise.all([
    getLeads(),
    getAgents(),
    getCurrentUser(),
  ]);

  const rows: LeadRow[] = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    avatarUrl: lead.avatarUrl,
    email: lead.email,
    phone: lead.phone,
    channel: lead.channel,
    status: lead.status,
    operation: lead.operation,
    propertyType: lead.propertyType,
    zone: lead.zone,
    budgetMin: lead.budgetMin,
    budgetMax: lead.budgetMax,
    budgetCurrency: lead.budgetCurrency,
    bedrooms: lead.bedrooms,
    timeline: lead.timeline,
    notes: lead.notes,
    agentId: lead.agentId,
    agentName: lead.agent?.name ?? lead.assignedAdvisorName ?? null,
    dealStatus: lead.dealStatus,
    dealAmount: lead.dealAmount,
    updatedAt: lead.updatedAt.toISOString(),
    conversationId: lead.conversations[0]?.id ?? null,
  }));

  return (
    <>
      <DashboardTopbar breadcrumb="Prospectos" notifications={[]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Prospectos</h1>
          <p className="text-sm text-muted-foreground">
            Todos los leads que capturó el agente, con su estado de cualificación.
          </p>
        </div>
        <LeadsTable
          data={rows}
          agents={agents.map((a) => ({ id: a.id, name: a.name }))}
          isAdmin={currentUser?.role === "ADMIN"}
        />
      </div>
    </>
  );
}
