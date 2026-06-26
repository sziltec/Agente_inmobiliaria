"use client";

// Barra lateral de navegación: resumen general + accesos por canal.
//
// Usamos <a> nativo (no next/link) para los links de este sidebar: en esta
// versión de Next.js, un <Link> dentro del layout raíz (persistente entre
// navegaciones) no completa la transición del lado del cliente. Con <a>
// nativo la navegación es una recarga completa de página, pero funciona de
// forma confiable.
import { usePathname, useSearchParams } from "next/navigation";
import { Building2, House, LayoutDashboard } from "lucide-react";
import { SiWhatsapp, SiMessenger, SiInstagram } from "react-icons/si";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const channelLinks = [
  { channel: "WHATSAPP", label: "WhatsApp", icon: SiWhatsapp },
  { channel: "MESSENGER", label: "Messenger", icon: SiMessenger },
  { channel: "INSTAGRAM", label: "Instagram", icon: SiInstagram },
];

export function AppSidebar({
  channelCounts,
}: {
  channelCounts: Record<string, number>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeChannel = searchParams.get("channel");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- ver comentario arriba */}
            <SidebarMenuButton size="lg" render={<a href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <House className="size-4" />
              </div>
              <span className="font-semibold">Agente Inmobiliario</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  // eslint-disable-next-line @next/next/no-html-link-for-pages -- ver comentario arriba
                  render={<a href="/" />}
                  isActive={pathname === "/" && !activeChannel}
                >
                  <LayoutDashboard />
                  <span>Resumen</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  // eslint-disable-next-line @next/next/no-html-link-for-pages -- ver comentario arriba
                  render={<a href="/properties" />}
                  isActive={pathname.startsWith("/properties")}
                >
                  <Building2 />
                  <span>Propiedades</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Canales</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {channelLinks.map(({ channel, label, icon: Icon }) => (
                <SidebarMenuItem key={channel}>
                  <SidebarMenuButton
                    render={<a href={`/?channel=${channel}`} />}
                    isActive={pathname === "/" && activeChannel === channel}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                  {channelCounts[channel] ? (
                    <SidebarMenuBadge>{channelCounts[channel]}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
