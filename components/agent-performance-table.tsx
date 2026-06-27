// Tabla de desempeño por agente: leads, cierres y revenue.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const revenueFormatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export type AgentPerformanceRow = {
  agentId: string;
  agentName: string;
  leadCount: number;
  won: number;
  lost: number;
  open: number;
  winRate: number | null;
  revenue: number;
};

export function AgentPerformanceTable({ data }: { data: AgentPerformanceRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempeño por agente</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay leads asignados a un agente.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agente</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Ganados</TableHead>
                <TableHead>Perdidos</TableHead>
                <TableHead>Abiertos</TableHead>
                <TableHead>Tasa de cierre</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.agentId}>
                  <TableCell className="font-medium">{row.agentName}</TableCell>
                  <TableCell>{row.leadCount}</TableCell>
                  <TableCell>{row.won}</TableCell>
                  <TableCell>{row.lost}</TableCell>
                  <TableCell>{row.open}</TableCell>
                  <TableCell>
                    {row.winRate == null ? "—" : `${Math.round(row.winRate * 100)}%`}
                  </TableCell>
                  <TableCell>{revenueFormatter.format(row.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
