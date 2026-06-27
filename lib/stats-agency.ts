// Estadísticas para el panel de Estadísticas: embudo/conversión, canal y
// bot, demanda de mercado y desempeño por agente. Mismo estilo que
// lib/stats.ts (funciones simples, en paralelo, objetos planos).
import { db } from "@/lib/db";

const NEW_LEADS_TREND_DAYS = 30;
const ABANDONED_THRESHOLD_HOURS = 48;

function bucketByDay<T>(items: T[], getDate: (item: T) => Date, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const item of items) {
    const key = getDate(item).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

// --- Embudo y conversión de leads -----------------------------------------

async function getFunnelConversion() {
  const byStatus = await db.lead.groupBy({ by: ["status"], _count: true });
  const counts = Object.fromEntries(byStatus.map((s) => [s.status, s._count]));
  const total = byStatus.reduce((sum, s) => sum + s._count, 0);

  return {
    counts,
    total,
    rates: {
      QUALIFYING: total ? (counts.QUALIFYING ?? 0) / total : 0,
      QUALIFIED: total ? (counts.QUALIFIED ?? 0) / total : 0,
      DISQUALIFIED: total ? (counts.DISQUALIFIED ?? 0) / total : 0,
    },
  };
}

async function getQualificationTime() {
  const events = await db.event.findMany({
    where: { type: "lead_qualified", conversationId: { not: null } },
    select: {
      createdAt: true,
      conversation: { select: { lead: { select: { createdAt: true } } } },
    },
  });

  const deltasMs = events
    .filter((e) => e.conversation?.lead)
    .map((e) => e.createdAt.getTime() - e.conversation!.lead!.createdAt.getTime());

  if (deltasMs.length === 0) return { avgHours: null, sampleSize: 0 };

  const avgMs = deltasMs.reduce((sum, d) => sum + d, 0) / deltasMs.length;
  return { avgHours: avgMs / (1000 * 60 * 60), sampleSize: deltasMs.length };
}

async function getNewLeadsTrend() {
  const since = new Date();
  since.setDate(since.getDate() - (NEW_LEADS_TREND_DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const leads = await db.lead.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  return bucketByDay(leads, (l) => l.createdAt, NEW_LEADS_TREND_DAYS);
}

// --- Canal y desempeño del bot ---------------------------------------------

async function getFirstResponseTime() {
  const conversations = await db.conversation.findMany({
    select: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 5,
        select: { direction: true, createdAt: true },
      },
    },
  });

  const deltasMs: number[] = [];
  for (const conv of conversations) {
    const firstInbound = conv.messages.find((m) => m.direction === "INBOUND");
    const firstOutbound = conv.messages.find((m) => m.direction === "OUTBOUND");
    if (firstInbound && firstOutbound && firstOutbound.createdAt > firstInbound.createdAt) {
      deltasMs.push(firstOutbound.createdAt.getTime() - firstInbound.createdAt.getTime());
    }
  }

  if (deltasMs.length === 0) return { avgSeconds: null, sampleSize: 0 };
  const avgMs = deltasMs.reduce((sum, d) => sum + d, 0) / deltasMs.length;
  return { avgSeconds: avgMs / 1000, sampleSize: deltasMs.length };
}

async function getBotHandoffRate() {
  const byBotEnabled = await db.conversation.groupBy({
    by: ["botEnabled"],
    _count: true,
  });
  const total = byBotEnabled.reduce((sum, b) => sum + b._count, 0);
  const handedOff = byBotEnabled.find((b) => !b.botEnabled)?._count ?? 0;

  return { total, handedOff, rate: total ? handedOff / total : 0 };
}

async function getChannelConversion() {
  const byChannelStatus = await db.lead.groupBy({
    by: ["channel", "status"],
    _count: true,
  });

  const byChannel = new Map<string, { total: number; qualified: number }>();
  for (const row of byChannelStatus) {
    const entry = byChannel.get(row.channel) ?? { total: 0, qualified: 0 };
    entry.total += row._count;
    if (row.status === "QUALIFIED") entry.qualified += row._count;
    byChannel.set(row.channel, entry);
  }

  return Array.from(byChannel.entries()).map(([channel, { total, qualified }]) => ({
    channel,
    total,
    qualified,
    rate: total ? qualified / total : 0,
  }));
}

async function getAbandonedConversations() {
  const threshold = new Date();
  threshold.setHours(threshold.getHours() - ABANDONED_THRESHOLD_HOURS);

  const conversations = await db.conversation.findMany({
    where: {
      lastMessageAt: { lt: threshold },
      lead: { status: { in: ["NEW", "QUALIFYING"] } },
    },
    select: { id: true, channel: true, lastMessageAt: true },
    orderBy: { lastMessageAt: "asc" },
  });

  return { thresholdHours: ABANDONED_THRESHOLD_HOURS, count: conversations.length, conversations };
}

// --- Demanda de mercado ------------------------------------------------------

async function getTopZones() {
  const rows = await db.lead.groupBy({
    by: ["zone"],
    _count: true,
    where: { zone: { not: null } },
    orderBy: { _count: { zone: "desc" } },
    take: 10,
  });
  return rows.map((r) => ({ zone: r.zone as string, count: r._count }));
}

async function getTopPropertyTypes() {
  const rows = await db.lead.groupBy({
    by: ["propertyType"],
    _count: true,
    where: { propertyType: { not: null } },
    orderBy: { _count: { propertyType: "desc" } },
    take: 10,
  });
  return rows.map((r) => ({ propertyType: r.propertyType as string, count: r._count }));
}

async function getBudgetDistribution() {
  const leads = await db.lead.findMany({
    where: { OR: [{ budgetMin: { not: null } }, { budgetMax: { not: null } }] },
    select: { budgetMin: true, budgetMax: true },
  });

  const buckets = [
    { label: "< 50k", max: 50_000 },
    { label: "50k - 100k", max: 100_000 },
    { label: "100k - 200k", max: 200_000 },
    { label: "200k - 400k", max: 400_000 },
    { label: "400k+", max: Infinity },
  ];

  const counts = buckets.map((b) => ({ label: b.label, count: 0 }));
  for (const lead of leads) {
    const amount = lead.budgetMax ?? lead.budgetMin ?? 0;
    const idx = buckets.findIndex((b) => amount <= b.max);
    counts[idx === -1 ? counts.length - 1 : idx].count += 1;
  }

  return counts;
}

async function getBuyRentSplit() {
  const rows = await db.lead.groupBy({
    by: ["operation"],
    _count: true,
    where: { operation: { not: null } },
  });
  return Object.fromEntries(rows.map((r) => [r.operation as string, r._count]));
}

// --- Desempeño por agente ----------------------------------------------------

async function getAgentPerformance(scopeToAgentId?: string) {
  const agentFilter = scopeToAgentId
    ? { agentId: scopeToAgentId }
    : { agentId: { not: null } };

  const [leadCounts, dealCounts, revenue, agents] = await Promise.all([
    db.lead.groupBy({ by: ["agentId"], _count: true, where: agentFilter }),
    db.lead.groupBy({ by: ["agentId", "dealStatus"], _count: true, where: agentFilter }),
    db.lead.groupBy({
      by: ["agentId"],
      _sum: { dealAmount: true },
      where: { ...agentFilter, dealStatus: "WON" },
    }),
    db.profile.findMany({ select: { id: true, name: true } }),
  ]);

  const agentNames = new Map(agents.map((a) => [a.id, a.name]));

  return leadCounts
    .filter((row) => row.agentId)
    .map((row) => {
      const agentId = row.agentId as string;
      const won = dealCounts.find((d) => d.agentId === agentId && d.dealStatus === "WON")?._count ?? 0;
      const lost = dealCounts.find((d) => d.agentId === agentId && d.dealStatus === "LOST")?._count ?? 0;
      const open = dealCounts.find((d) => d.agentId === agentId && d.dealStatus === "OPEN")?._count ?? 0;
      const agentRevenue = revenue.find((r) => r.agentId === agentId)?._sum.dealAmount ?? 0;

      return {
        agentId,
        agentName: agentNames.get(agentId) ?? "Desconocido",
        leadCount: row._count,
        won,
        lost,
        open,
        winRate: won + lost > 0 ? won / (won + lost) : null,
        revenue: agentRevenue,
      };
    });
}

// --- Función principal -------------------------------------------------------

export async function getAgencyStats({ scopeToAgentId }: { scopeToAgentId?: string } = {}) {
  const [
    funnel,
    qualificationTime,
    newLeadsTrend,
    firstResponseTime,
    botHandoff,
    channelConversion,
    abandonedConversations,
    topZones,
    topPropertyTypes,
    budgetDistribution,
    buyRentSplit,
    agentPerformance,
  ] = await Promise.all([
    getFunnelConversion(),
    getQualificationTime(),
    getNewLeadsTrend(),
    getFirstResponseTime(),
    getBotHandoffRate(),
    getChannelConversion(),
    getAbandonedConversations(),
    getTopZones(),
    getTopPropertyTypes(),
    getBudgetDistribution(),
    getBuyRentSplit(),
    getAgentPerformance(scopeToAgentId),
  ]);

  return {
    funnel,
    qualificationTime,
    newLeadsTrend,
    firstResponseTime,
    botHandoff,
    channelConversion,
    abandonedConversations,
    topZones,
    topPropertyTypes,
    budgetDistribution,
    buyRentSplit,
    agentPerformance,
  };
}
