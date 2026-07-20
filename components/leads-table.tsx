"use client";

// Tabla de prospectos (leads): selección de filas, orden, filtro por email,
// visibilidad de columnas y paginación (mismo patrón que la tabla de pagos
// de shadcn, con los datos de los leads).
import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import type { Channel, DealStatus, LeadStatus, Operation } from "@prisma/client";
import { channelNames, statusNames, operationNames } from "@/lib/labels";
import { timeAgo } from "@/lib/utils";
import { LeadAvatar } from "@/components/lead-avatar";
import { LeadAgentSelect } from "@/components/lead-agent-select";
import { LeadRowActions } from "@/components/lead-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type LeadRow = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  channel: Channel;
  status: LeadStatus;
  operation: Operation | null;
  propertyType: string | null;
  zone: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetCurrency: string | null;
  bedrooms: number | null;
  timeline: string | null;
  notes: string | null;
  agentId: string | null;
  agentName: string | null;
  dealStatus: DealStatus;
  dealAmount: number | null;
  updatedAt: string;
  conversationId: string | null;
};

const columnLabels: Record<string, string> = {
  lead: "Lead",
  email: "Email",
  phone: "Teléfono",
  channel: "Canal",
  status: "Estado",
  operation: "Operación",
  budget: "Presupuesto",
  zone: "Zona",
  agent: "Agente",
  updatedAt: "Actividad",
};

function formatBudget(
  min: number | null,
  max: number | null,
  currency: string | null,
) {
  if (min == null && max == null) return "—";
  const safeCurrency =
    currency && /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  const formatter = new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 0,
  });
  if (min != null && max != null) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  if (min != null) return `Desde ${formatter.format(min)}`;
  return `Hasta ${formatter.format(max!)}`;
}

function buildColumns({
  agents,
  isAdmin,
}: {
  agents: { id: string; name: string }[];
  isAdmin: boolean;
}): ColumnDef<LeadRow>[] {
  return [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "lead",
    accessorKey: "name",
    header: "Lead",
    cell: ({ row }) => {
      const lead = row.original;
      return (
        <div className="flex items-center gap-3">
          <LeadAvatar
            name={lead.name}
            avatarUrl={lead.avatarUrl}
            channel={lead.channel}
            size="sm"
          />
          <div className="font-medium">{lead.name || "Sin nombre"}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2.5"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-1.5 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => row.original.email || "—",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ row }) => row.original.phone || "—",
  },
  {
    accessorKey: "channel",
    header: "Canal",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {channelNames[row.original.channel] || row.original.channel}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={
            status === "QUALIFIED"
              ? "bg-primary text-primary-foreground"
              : status === "DISQUALIFIED"
                ? "bg-destructive text-white"
                : undefined
          }
          variant={
            status === "QUALIFIED" || status === "DISQUALIFIED"
              ? "default"
              : "secondary"
          }
        >
          {statusNames[status] || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "operation",
    header: "Operación",
    cell: ({ row }) =>
      row.original.operation ? operationNames[row.original.operation] : "—",
  },
  {
    id: "budget",
    header: "Presupuesto",
    cell: ({ row }) =>
      formatBudget(
        row.original.budgetMin,
        row.original.budgetMax,
        row.original.budgetCurrency,
      ),
  },
  {
    accessorKey: "zone",
    header: "Zona",
    cell: ({ row }) => row.original.zone || "—",
  },
  {
    id: "agent",
    header: "Agente",
    cell: ({ row }) => {
      const lead = row.original;
      if (!isAdmin) return lead.agentName || "Sin asignar";
      return (
        <div className="flex flex-col gap-1">
          <LeadAgentSelect
            leadId={lead.id}
            channel={lead.channel}
            agentId={lead.agentId}
            agents={agents}
          />
          {!lead.agentId && lead.agentName ? (
            <span className="text-xs text-muted-foreground">
              Sugerido: {lead.agentName}
            </span>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Actividad",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{timeAgo(row.original.updatedAt)}</span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <LeadRowActions lead={row.original} />,
  },
  ];
}

export function LeadsTable({
  data,
  agents,
  isAdmin,
}: {
  data: LeadRow[];
  agents: { id: string; name: string }[];
  isAdmin: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const columns = useMemo(() => buildColumns({ agents, isAdmin }), [agents, isAdmin]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-2 pb-4">
        <Input
          placeholder="Filtrar emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Columnas <ChevronDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(checked) => column.toggleVisibility(checked)}
                >
                  {columnLabels[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin prospectos todavía.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-2 pt-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
