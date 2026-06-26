"use client";

// Tabla de prospectos (leads): selección de filas, orden, filtro por email,
// visibilidad de columnas y paginación (mismo patrón que la tabla de pagos
// de shadcn, con los datos de los leads).
import { useState } from "react";
import Link from "next/link";
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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import type { Channel, LeadStatus, Operation } from "@prisma/client";
import { channelNames, statusNames, operationNames } from "@/lib/labels";
import { timeAgo } from "@/lib/utils";
import { LeadAvatar } from "@/components/lead-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
  zone: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  createdAt: string;
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
  createdAt: "Creado",
};

const budgetFormatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatBudget(min: number | null, max: number | null) {
  if (min == null && max == null) return "—";
  if (min != null && max != null) {
    return `${budgetFormatter.format(min)} - ${budgetFormatter.format(max)}`;
  }
  if (min != null) return `Desde ${budgetFormatter.format(min)}`;
  return `Hasta ${budgetFormatter.format(max!)}`;
}

const columns: ColumnDef<LeadRow>[] = [
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
    cell: ({ row }) => formatBudget(row.original.budgetMin, row.original.budgetMax),
  },
  {
    accessorKey: "zone",
    header: "Zona",
    cell: ({ row }) => row.original.zone || "—",
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{timeAgo(row.original.createdAt)}</span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const lead = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
      );
    },
  },
];

export function LeadsTable({ data }: { data: LeadRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

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
