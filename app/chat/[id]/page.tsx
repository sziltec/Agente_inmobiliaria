// Página de detalle de una conversación.
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getConversation } from "@/lib/stats";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function ChatDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conv = await getConversation(id);

  if (!conv) {
    notFound();
  }

  const channelNames: Record<string, string> = {
    WHATSAPP: "WhatsApp",
    MESSENGER: "Messenger",
    INSTAGRAM: "Instagram",
  };

  const statusNames: Record<string, string> = {
    NEW: "Nuevo",
    QUALIFYING: "Cualificando",
    QUALIFIED: "Cualificado",
    DISQUALIFIED: "Descartado",
  };

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>
      </header>

      <div className="flex flex-1 flex-col">
        {/* Encabezado del lead */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">
              {conv.lead?.name || "Sin nombre"}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">
                {channelNames[conv.channel] || conv.channel}
              </Badge>
              <Badge
                variant={
                  conv.lead?.status === "QUALIFIED" ||
                  conv.lead?.status === "DISQUALIFIED"
                    ? "default"
                    : "secondary"
                }
                className={
                  conv.lead?.status === "QUALIFIED"
                    ? "bg-primary text-primary-foreground"
                    : conv.lead?.status === "DISQUALIFIED"
                      ? "bg-destructive text-white"
                      : undefined
                }
              >
                {statusNames[conv.lead?.status || "NEW"] || "Nuevo"}
              </Badge>
            </div>
          </div>

          {conv.lead && (
            <div className="text-right text-sm text-muted-foreground">
              {conv.lead.email && <div>{conv.lead.email}</div>}
              {conv.lead.phone && <div>{conv.lead.phone}</div>}
              {conv.lead.operation && (
                <div className="mt-1 text-xs">
                  {conv.lead.operation === "BUY" ? "Compra" : "Alquiler"}
                  {conv.lead.propertyType && ` • ${conv.lead.propertyType}`}
                  {conv.lead.zone && ` • ${conv.lead.zone}`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conversación */}
        <div className="mx-auto w-full max-w-2xl flex-1 p-4 py-8">
          <div className="space-y-4">
            {conv.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.direction === "INBOUND" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    msg.direction === "INBOUND"
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`mt-1 text-xs ${
                      msg.direction === "INBOUND"
                        ? "text-muted-foreground"
                        : "text-primary-foreground/70"
                    }`}
                  >
                    {msg.createdAt.toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {conv.messages.length === 0 && (
            <p className="mt-8 text-center text-muted-foreground">
              No hay mensajes en esta conversación.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
