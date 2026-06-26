"use client";

// Barra lateral de navegación: resumen general + accesos por canal.
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { House, LayoutDashboard } from "lucide-react";
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
  { channel: "WHATSAPP", label: "WhatsApp", icon: SiWhatsapp, color: "#25D366" },
  { channel: "MESSENGER", label: "Messenger", icon: SiMessenger, color: "#0084FF" },
  { channel: "INSTAGRAM", label: "Instagram", icon: SiInstagram, color: "#E1306C" },
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
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
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
                  render={<Link href="/" />}
                  isActive={pathname === "/" && !activeChannel}
                >
                  <LayoutDashboard />
                  <span>Resumen</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Canales</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {channelLinks.map(({ channel, label, icon: Icon, color }) => (
                <SidebarMenuItem key={channel}>
                  <SidebarMenuButton
                    render={<Link href={`/?channel=${channel}`} />}
                    isActive={pathname === "/" && activeChannel === channel}
                  >
                    <Icon style={{ color }} />
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
