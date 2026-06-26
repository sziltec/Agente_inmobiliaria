// Dashboard principal: estadísticas y bandeja de chats.
import Link from "next/link";
import { Suspense } from "react";
import { Inbox, BadgeCheck } from "lucide-react";
import { SiWhatsapp, SiMessenger, SiInstagram } from "react-icons/si";
import { getStats } from "@/lib/stats";
import { timeAgo } from "@/lib/utils";
import { channelNames, statusNames } from "@/lib/labels";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { ChannelTabs } from "@/components/channel-tabs";
import { StatCard } from "@/components/stat-card";
import { LeadsDonutChart } from "@/components/leads-donut-chart";
import { MessagesAreaChart } from "@/components/messages-area-chart";
import { ActivityFeed } from "@/components/activity-feed";
import { LeadSearch } from "@/components/lead-search";
import { LeadAvatar } from "@/components/lead-avatar";
import type { NotificationItem } from "@/components/notifications-bell";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type ValidChannel = "WHATSAPP" | "MESSENGER" | "INSTAGRAM";
const validChannels: ValidChannel[] = ["WHATSAPP", "MESSENGER", "INSTAGRAM"];

function MessengerInstagramIcon({ className }: { className?: string }) {
  return (
    <span className="flex items-center gap-0.5">
      <SiMessenger className={className} />
      <SiInstagram className={className} />
    </span>
  );
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; q?: string }>;
}) {
  const { channel: rawChannel, q: search } = await searchParams;
  const channel = validChannels.includes(rawChannel as ValidChannel)
    ? (rawChannel as ValidChannel)
    : undefined;

  const stats = await getStats(channel, search);

  const notifications: NotificationItem[] = stats.recentEvents.map((e) => ({
    id: e.id,
    type: e.type,
    channel: e.channel,
    leadName: e.conversation?.lead?.name ?? null,
    createdAt: e.createdAt.toISOString(),
  }));

  const breadcrumb = channel ? channelNames[channel] : "Resumen";

  return (
    <>
      <DashboardTopbar breadcrumb={breadcrumb} notifications={notifications} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Suspense>
          <ChannelTabs />
        </Suspense>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total de chats" value={stats.totalChats} icon={Inbox} accent />
          <StatCard
            label="Leads cualificados"
            value={stats.qualifiedLeads}
            icon={BadgeCheck}
          />
          <StatCard
            label="WhatsApp"
            value={stats.chatsByChannel.WHATSAPP || 0}
            icon={SiWhatsapp}
          />
          <StatCard
            label="Messenger + IG"
            value={
              (stats.chatsByChannel.MESSENGER || 0) +
              (stats.chatsByChannel.INSTAGRAM || 0)
            }
            icon={MessengerInstagramIcon}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MessagesAreaChart data={stats.messagesPerDay} />
          </div>
          <LeadsDonutChart leadsByStatus={stats.leadsByStatus} />
        </div>

        {/* Bandeja de conversaciones + actividad */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle>Conversaciones recientes</CardTitle>
              <CardAction>
                <Suspense>
                  <LeadSearch />
                </Suspense>
              </CardAction>
            </CardHeader>
            <CardContent>
              {stats.recentConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {search
                    ? `No encontramos ningún lead que coincida con "${search}".`
                    : "No hay conversaciones aún. Cuando recibas mensajes, aparecerán aquí."}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Último mensaje</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentConversations.map((conv) => {
                      const lastMsg =
                        conv.messages.length > 0 ? conv.messages[0] : null;
                      const timeStr = lastMsg ? timeAgo(lastMsg.createdAt) : "";

                      return (
                        <TableRow key={conv.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <LeadAvatar
                                name={conv.lead?.name}
                                avatarUrl={conv.lead?.avatarUrl}
                                channel={conv.channel}
                              />
                              <div>
                                <div className="font-medium">
                                  {conv.lead?.name || "Sin nombre"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {conv.lead?.email || conv.lead?.phone || "Sin contacto"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {channelNames[conv.channel] || conv.channel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                conv.lead?.status === "QUALIFIED"
                                  ? "bg-primary text-primary-foreground"
                                  : conv.lead?.status === "DISQUALIFIED"
                                    ? "bg-destructive text-white"
                                    : undefined
                              }
                              variant={
                                conv.lead?.status === "QUALIFIED" ||
                                conv.lead?.status === "DISQUALIFIED"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {statusNames[conv.lead?.status || "NEW"] || "Nuevo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {timeStr}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              href={`/chat/${conv.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              Ver →
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <ActivityFeed items={notifications} />
        </div>
      </div>
    </>
  );
}
