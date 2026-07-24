// Panel de Configuración global (solo ADMIN): canales activos y quién maneja
// las conversaciones (esta app con Gemini, o Hermes).
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { getSettings } from "@/lib/settings";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { SettingsPanel } from "@/components/settings-panel";

export default async function ConfiguracionPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "ADMIN") redirect("/");

  const settings = await getSettings();

  return (
    <>
      <DashboardTopbar breadcrumb="Configuración" notifications={[]} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Configuración</h1>
          <p className="text-sm text-muted-foreground">
            Activá o desactivá los canales y elegí quién responde las conversaciones.
          </p>
        </div>

        <SettingsPanel
          channels={{
            WHATSAPP: settings.whatsappEnabled,
            MESSENGER: settings.messengerEnabled,
            INSTAGRAM: settings.instagramEnabled,
          }}
          runtime={settings.runtime}
        />
      </div>
    </>
  );
}
