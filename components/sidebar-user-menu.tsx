"use client";

// Pie del sidebar: usuario logueado + cerrar sesión.
import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SidebarUserMenu({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: "ADMIN" | "AGENT";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
              <div className="flex flex-col overflow-hidden text-left">
                <span className="truncate text-sm font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem disabled>
                {role === "ADMIN" ? "Administrador" : "Agente"}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={pending}
                onClick={() => startTransition(() => logout())}
              >
                <LogOut />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
