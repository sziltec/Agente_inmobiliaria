// Avatar de un lead: su foto de perfil (si la conseguimos) con sus iniciales
// como respaldo, y una insignia con el ícono del canal de origen.
import type { ComponentType } from "react";
import type { Channel } from "@prisma/client";
import { SiWhatsapp, SiMessenger, SiInstagram } from "react-icons/si";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const channelIcons: Record<Channel, ComponentType<{ className?: string }>> = {
  WHATSAPP: SiWhatsapp,
  MESSENGER: SiMessenger,
  INSTAGRAM: SiInstagram,
};

function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function LeadAvatar({
  name,
  avatarUrl,
  channel,
  size = "default",
}: {
  name?: string | null;
  avatarUrl?: string | null;
  channel: Channel;
  size?: "sm" | "default" | "lg";
}) {
  const Icon = channelIcons[channel];
  return (
    <Avatar size={size}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? "Lead"} />}
      <AvatarFallback>{initials(name)}</AvatarFallback>
      <AvatarBadge>
        <Icon />
      </AvatarBadge>
    </Avatar>
  );
}
