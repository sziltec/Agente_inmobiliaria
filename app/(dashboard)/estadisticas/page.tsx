// Panel de Estadísticas: embudo/conversión, canal y bot, demanda de mercado
// y desempeño por agente.
import { Clock3, MessageCircleReply, UserX } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { getAgencyStats } from "@/lib/stats-agency";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { StatCard } from "@/components/stat-card";
import { FunnelConversionChart } from "@/components/funnel-conversion-chart";
import { NewLeadsTrendChart } from "@/components/new-leads-trend-chart";
import { ChannelConversionChart } from "@/components/channel-conversion-chart";
import { BotHandoffChart } from "@/components/bot-handoff-chart";
import { TopZonesChart } from "@/components/top-zones-chart";
import { TopPropertyTypesChart } from "@/components/top-property-types-chart";
import { BudgetDistributionChart } from "@/components/budget-distribution-chart";
import { BuyRentSplitChart } from "@/components/buy-rent-split-chart";
import { AgentPerformanceTable } from "@/components/agent-performance-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function EstadisticasPage() {
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const stats = await getAgencyStats({
    scopeToAgentId: isAdmin ? undefined : currentUser?.id,
  });

  return (
    <>
      <DashboardTopbar breadcrumb="Estadísticas" notifications={[]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Estadísticas</h1>
          <p className="text-sm text-muted-foreground">
            Embudo de leads, desempeño de canal/bot, demanda de mercado y resultados comerciales.
          </p>
        </div>

        <Tabs defaultValue="funnel">
          <TabsList>
            <TabsTrigger value="funnel">Embudo</TabsTrigger>
            <TabsTrigger value="channel">Canal y bot</TabsTrigger>
            <TabsTrigger value="market">Mercado</TabsTrigger>
            <TabsTrigger value="agents">Agentes</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel" className="flex flex-col gap-4 pt-4">
            <StatCard
              label="Tiempo promedio a cualificación"
              value={
                stats.qualificationTime.avgHours == null
                  ? "—"
                  : `${stats.qualificationTime.avgHours.toFixed(1)} hs`
              }
              icon={Clock3}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FunnelConversionChart
                counts={stats.funnel.counts}
                total={stats.funnel.total}
                rates={stats.funnel.rates}
              />
              <NewLeadsTrendChart data={stats.newLeadsTrend} />
            </div>
          </TabsContent>

          <TabsContent value="channel" className="flex flex-col gap-4 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                label="Tiempo de primera respuesta"
                value={
                  stats.firstResponseTime.avgSeconds == null
                    ? "—"
                    : `${stats.firstResponseTime.avgSeconds.toFixed(1)} s`
                }
                icon={MessageCircleReply}
              />
              <StatCard
                label="Conversaciones abandonadas"
                value={stats.abandonedConversations.count}
                icon={UserX}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ChannelConversionChart data={stats.channelConversion} />
              </div>
              <BotHandoffChart
                total={stats.botHandoff.total}
                handedOff={stats.botHandoff.handedOff}
              />
            </div>
          </TabsContent>

          <TabsContent value="market" className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-2">
            <TopZonesChart data={stats.topZones} />
            <TopPropertyTypesChart data={stats.topPropertyTypes} />
            <BudgetDistributionChart data={stats.budgetDistribution} />
            <BuyRentSplitChart counts={stats.buyRentSplit} />
          </TabsContent>

          <TabsContent value="agents" className="pt-4">
            <AgentPerformanceTable data={stats.agentPerformance} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
