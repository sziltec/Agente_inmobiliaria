"use client";

// Barra lateral de navegación: resumen, propiedades, prospectos y mensajes.
//
// Usamos <a> nativo (no next/link) para los links de este sidebar: en esta
// versión de Next.js, un <Link> dentro del layout raíz (persistente entre
// navegaciones) no completa la transición del lado del cliente. Con <a>
// nativo la navegación es una recarga completa de página, pero funciona de
// forma confiable.
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  House,
  LayoutDashboard,
  MessageSquare,
  UserCog,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarUserMenu } from "@/components/sidebar-user-menu";

type SidebarUser = { name: string; email: string; role: "ADMIN" | "AGENT" };

export function AppSidebar({ user }: { user: SidebarUser | null }) {
  const pathname = usePathname();

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
          <SidebarGroupLabel>Tablas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  // eslint-disable-next-line @next/next/no-html-link-for-pages -- ver comentario arriba
                  render={<a href="/" />}
                  isActive={pathname === "/"}
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href="/leads" />}
                  isActive={pathname.startsWith("/leads")}
                >
                  <Users />
                  <span>Prospectos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  // eslint-disable-next-line @next/next/no-html-link-for-pages -- ver comentario arriba
                  render={<a href="/messages" />}
                  isActive={pathname.startsWith("/messages")}
                >
                  <MessageSquare />
                  <span>Mensajes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href="/estadisticas" />}
                  isActive={pathname.startsWith("/estadisticas")}
                >
                  <BarChart3 />
                  <span>Estadísticas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user?.role === "ADMIN" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<a href="/agentes" />}
                    isActive={pathname.startsWith("/agentes")}
                  >
                    <UserCog />
                    <span>Agentes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {user && <SidebarUserMenu name={user.name} email={user.email} role={user.role} />}
    </Sidebar>
  );
}
