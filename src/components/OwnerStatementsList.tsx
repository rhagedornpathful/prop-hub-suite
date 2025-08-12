import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

interface OwnerStatement {
  id: string;
  owner_id: string;
  property_id: string | null;
  statement_period_start: string; // date
  statement_period_end: string;   // date
  total_rent_collected: number | null;
  total_expenses: number | null;
  management_fees: number | null;
  net_amount: number | null;
  generated_at: string | null; // timestamp
  status: string | null;
}

export default function OwnerStatementsList() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [statements, setStatements] = useState<OwnerStatement[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("owner_statements")
          .select("*")
          .order("statement_period_end", { ascending: false })
          .limit(100);
        if (error) throw error;
        if (isMounted) setStatements((data as OwnerStatement[]) ?? []);
      } catch (err: any) {
        toast({ title: "Failed to load statements", description: err.message, variant: "destructive" });
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [toast]);

  const csv = useMemo(() => {
    if (!statements.length) return "";
    const headers = [
      "Statement ID",
      "Status",
      "Period Start",
      "Period End",
      "Total Rent",
      "Total Expenses",
      "Mgmt Fees",
      "Net Amount",
      "Generated At",
      "Property ID",
    ];
    const rows = statements.map((s) => [
      s.id,
      s.status ?? "draft",
      s.statement_period_start,
      s.statement_period_end,
      (s.total_rent_collected ?? 0).toString(),
      (s.total_expenses ?? 0).toString(),
      (s.management_fees ?? 0).toString(),
      (s.net_amount ?? 0).toString(),
      s.generated_at ?? "",
      s.property_id ?? "",
    ]);
    const esc = (val: string) => `"${String(val).replace(/\"/g, '""')}"`;
    return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  }, [statements]);

  const handleExport = () => {
    if (!csv) {
      toast({ title: "No data to export", description: "There are no statements visible to you yet." });
      return;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `owner-statements-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export started", description: "Your CSV download should begin shortly." });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Owner Statements</CardTitle>
          <CardDescription>View and export your owner statements</CardDescription>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : statements.length === 0 ? (
          <div className="text-sm text-muted-foreground">No owner statements found.</div>
        ) : (
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Total Rent</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Mgmt Fees</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statements.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="capitalize">{s.status ?? "draft"}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {new Date(s.statement_period_start).toLocaleDateString()} – {new Date(s.statement_period_end).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">{s.generated_at ? `Generated ${new Date(s.generated_at).toLocaleDateString()}` : "Not generated"}</div>
                    </TableCell>
                    <TableCell className="text-right">${(s.total_rent_collected ?? 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">${(s.total_expenses ?? 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">${(s.management_fees ?? 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">${(s.net_amount ?? 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
