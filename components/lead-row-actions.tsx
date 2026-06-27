"use client";

// Menú de acciones de una fila de la tabla de Prospectos: copiar email, ver
// la conversación y abrir el detalle (cualificación + resultado comercial).
import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import type { LeadRow } from "@/components/leads-table";
import { LeadDetailSheet } from "@/components/lead-detail-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LeadRowActions({ lead }: { lead: LeadRow }) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDetailOpen(true)}>Ver detalle</DropdownMenuItem>
          {lead.email && (
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(lead.email!)}>
              Copiar email
            </DropdownMenuItem>
          )}
          {lead.conversationId && (
            <DropdownMenuItem render={<Link href={`/messages/${lead.conversationId}`} />}>
              Ver conversación
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <LeadDetailSheet lead={lead} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  );
}
