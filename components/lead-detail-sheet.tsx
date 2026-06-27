"use client";

// Panel de detalle de un lead: datos de cualificación + resultado comercial
// (abierto/ganado/perdido y monto).
import { useState, useTransition } from "react";
import type { DealStatus } from "@prisma/client";
import type { LeadRow } from "@/components/leads-table";
import { setDealOutcome } from "@/app/(dashboard)/leads/actions";
import { dealStatusNames, operationNames } from "@/lib/labels";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
}: {
  lead: LeadRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [dealStatus, setDealStatusValue] = useState<DealStatus>(lead.dealStatus);
  const [dealAmount, setDealAmount] = useState(lead.dealAmount?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    if (dealStatus === "WON" && !dealAmount) {
      setError("Ingresá el monto del cierre.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await setDealOutcome(
        lead.id,
        dealStatus,
        dealAmount ? Math.round(Number(dealAmount)) : null,
        lead.channel,
      );
      onOpenChange(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{lead.name || "Sin nombre"}</SheetTitle>
          <SheetDescription>{lead.email || lead.phone || "Sin contacto"}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Operación</dt>
              <dd>{lead.operation ? operationNames[lead.operation] : "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tipo</dt>
              <dd>{lead.propertyType || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Zona</dt>
              <dd>{lead.zone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Dormitorios</dt>
              <dd>{lead.bedrooms ?? "—"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Timeline</dt>
              <dd>{lead.timeline || "—"}</dd>
            </div>
          </dl>

          {lead.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notas</p>
              <p className="text-sm">{lead.notes}</p>
            </div>
          )}

          <div className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="dealStatus">Resultado comercial</Label>
              <Select
                items={dealStatusNames}
                value={dealStatus}
                onValueChange={(value) => setDealStatusValue(value as DealStatus)}
              >
                <SelectTrigger id="dealStatus" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">{dealStatusNames.OPEN}</SelectItem>
                  <SelectItem value="WON">{dealStatusNames.WON}</SelectItem>
                  <SelectItem value="LOST">{dealStatusNames.LOST}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealAmount">
                Monto {dealStatus === "WON" ? "(requerido)" : "(opcional)"}
              </Label>
              <Input
                id="dealAmount"
                type="number"
                min={0}
                value={dealAmount}
                onChange={(e) => setDealAmount(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSave} disabled={pending}>
            {pending ? "Guardando..." : "Guardar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
