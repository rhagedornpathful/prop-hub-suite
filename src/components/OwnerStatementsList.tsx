import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DateRange } from "react-day-picker";

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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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
  const statusOptions = useMemo(() => {
    const unique = Array.from(new Set(statements.map((s) => (s.status ?? "draft"))));
    return ["all", ...unique];
  }, [statements]);

  const filteredStatements = useMemo(() => {
    let list = [...statements];
    if (statusFilter !== "all") {
      list = list.filter((s) => (s.status ?? "draft") === statusFilter);
    }
    if (dateRange?.from || dateRange?.to) {
      const from = dateRange?.from;
      const to = dateRange?.to;
      list = list.filter((s) => {
        const start = new Date(s.statement_period_start);
        const end = new Date(s.statement_period_end);
        const afterFrom = from ? end >= from : true;
        const beforeTo = to ? start <= to : true;
        return afterFrom && beforeTo; // overlap within selected range
      });
    }
    return list;
  }, [statements, statusFilter, dateRange]);

  const csv = useMemo(() => {
    if (!filteredStatements.length) return "";
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
    const rows = filteredStatements.map((s) => [
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
  }, [filteredStatements]);

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
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="w-[200px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt === "all" ? "All statuses" : opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${dateRange.from.toLocaleDateString()} – ${dateRange.to.toLocaleDateString()}`
                      ) : (
                        `${dateRange.from.toLocaleDateString()}`
                      )
                    ) : (
                      "Date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="p-3 pointer-events-auto"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button variant="outline" onClick={() => { setStatusFilter("all"); setDateRange(undefined); }}>
                Clear filters
              </Button>

              <div className="ml-auto text-sm text-muted-foreground">
                {filteredStatements.length} result{filteredStatements.length !== 1 ? "s" : ""}
              </div>
            </div>

            {filteredStatements.length === 0 ? (
              <div className="text-sm text-muted-foreground">No statements match the selected filters.</div>
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
                    {filteredStatements.map((s) => (
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
          </>

        )}
      </CardContent>
    </Card>
  );
}
