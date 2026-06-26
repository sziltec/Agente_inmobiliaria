// Barra superior: trigger del sidebar, breadcrumb y notificaciones.
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationsBell, type NotificationItem } from "@/components/notifications-bell";

export function DashboardTopbar({
  breadcrumb,
  notifications,
}: {
  breadcrumb: string;
  notifications: NotificationItem[];
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <span className="text-sm text-muted-foreground">Tablas</span>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm font-medium">{breadcrumb}</span>
      </div>
      <NotificationsBell items={notifications} />
    </header>
  );
}
