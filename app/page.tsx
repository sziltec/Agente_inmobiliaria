// Dashboard principal: estadísticas y bandeja de chats.
import Link from "next/link";
import { getStats } from "@/lib/stats";

export default async function Dashboard() {
  const stats = await getStats();

  const channelNames: Record<string, string> = {
    WHATSAPP: "WhatsApp",
    MESSENGER: "Messenger",
    INSTAGRAM: "Instagram",
  };

  const statusNames: Record<string, string> = {
    NEW: "Nuevos",
    QUALIFYING: "Cualificando",
    QUALIFIED: "Cualificados",
    DISQUALIFIED: "Descartados",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            🏠 Agente Inmobiliario
          </h1>
          <p className="text-slate-600">Dashboard de leads y estadísticas</p>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total de chats */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-slate-600">
              Total de chats
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {stats.totalChats}
            </div>
          </div>

          {/* Leads cualificados */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-slate-600">
              Leads cualificados
            </div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {stats.qualifiedLeads}
            </div>
          </div>

          {/* Por canal: WhatsApp */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-slate-600">WhatsApp</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {stats.chatsByChannel.WHATSAPP || 0}
            </div>
          </div>

          {/* Por canal: Messenger + Instagram */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-slate-600">
              Messenger + IG
            </div>
            <div className="mt-2 text-3xl font-bold text-purple-600">
              {(stats.chatsByChannel.MESSENGER || 0) +
                (stats.chatsByChannel.INSTAGRAM || 0)}
            </div>
          </div>
        </div>

        {/* Estado de leads */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Estado de leads
            </h2>
            <div className="space-y-2">
              {Object.entries(stats.leadsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="text-slate-600">
                    {statusNames[status] || status}
                  </span>
                  <span className="font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chats por red social */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Chats por red social
            </h2>
            <div className="space-y-2">
              {Object.entries(stats.chatsByChannel).map(([channel, count]) => (
                <div key={channel} className="flex justify-between">
                  <span className="text-slate-600">
                    {channelNames[channel] || channel}
                  </span>
                  <span className="font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bandeja de conversaciones */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Conversaciones recientes
          </h2>

          {stats.recentConversations.length === 0 ? (
            <p className="text-slate-600">
              No hay conversaciones aún. Cuando recibas mensajes en WhatsApp,
              aparecerán aquí.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-2 font-semibold text-slate-700">
                      Lead
                    </th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-700">
                      Canal
                    </th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-700">
                      Estado
                    </th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-700">
                      Último mensaje
                    </th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-700">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentConversations.map((conv) => {
                    const lastMsg =
                      conv.messages.length > 0 ? conv.messages[0] : null;
                    const timeDiff = lastMsg
                      ? Math.floor(
                          (Date.now() - lastMsg.createdAt.getTime()) / 1000,
                        )
                      : null;
                    let timeStr = "";
                    if (timeDiff) {
                      if (timeDiff < 60)
                        timeStr = `hace ${timeDiff}s`;
                      else if (timeDiff < 3600)
                        timeStr = `hace ${Math.floor(timeDiff / 60)}m`;
                      else if (timeDiff < 86400)
                        timeStr = `hace ${Math.floor(timeDiff / 3600)}h`;
                      else
                        timeStr = `hace ${Math.floor(timeDiff / 86400)}d`;
                    }

                    return (
                      <tr
                        key={conv.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-2">
                          <div className="font-medium text-slate-900">
                            {conv.lead?.name || "Sin nombre"}
                          </div>
                          <div className="text-xs text-slate-600">
                            {conv.lead?.email || conv.lead?.phone || "Sin contacto"}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            {channelNames[conv.channel] || conv.channel}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              conv.lead?.status === "QUALIFIED"
                                ? "bg-green-100 text-green-800"
                                : conv.lead?.status === "DISQUALIFIED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {statusNames[conv.lead?.status || "NEW"] || "Nuevo"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-600">{timeStr}</td>
                        <td className="py-3 px-2">
                          <Link
                            href={`/chat/${conv.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
