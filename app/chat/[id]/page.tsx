// Página de detalle de una conversación.
import Link from "next/link";
import { getConversation } from "@/lib/stats";
import { notFound } from "next/navigation";

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white p-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              {conv.lead?.name || "Sin nombre"}
            </h1>
            <div className="text-sm text-slate-600 mt-1">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 mr-2">
                {channelNames[conv.channel] || conv.channel}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  conv.lead?.status === "QUALIFIED"
                    ? "bg-green-100 text-green-800"
                    : conv.lead?.status === "DISQUALIFIED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {statusNames[conv.lead?.status || "NEW"] || "Nuevo"}
              </span>
            </div>
          </div>

          {/* Info del lead */}
          {conv.lead && (
            <div className="text-right text-sm text-slate-600">
              {conv.lead.email && <div>{conv.lead.email}</div>}
              {conv.lead.phone && <div>{conv.lead.phone}</div>}
              <div className="mt-2">
                <span className="text-xs">
                  {conv.lead.operation && (
                    <>
                      {conv.lead.operation === "BUY"
                        ? "Compra"
                        : "Alquiler"}
                      {conv.lead.propertyType && ` • ${conv.lead.propertyType}`}
                      {conv.lead.zone && ` • ${conv.lead.zone}`}
                    </>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conversación */}
      <div className="mx-auto max-w-2xl p-4 py-8">
        <div className="space-y-4">
          {conv.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.direction === "INBOUND" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.direction === "INBOUND"
                    ? "bg-slate-100 text-slate-900"
                    : "bg-blue-500 text-white"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.direction === "INBOUND"
                      ? "text-slate-600"
                      : "text-blue-100"
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
          <p className="text-center text-slate-600 mt-8">
            No hay mensajes en esta conversación.
          </p>
        )}
      </div>
    </div>
  );
}
