import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Filter, MoreHorizontal, Search, Star } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  accessor?: (item: T) => any;
  className?: string;
}

interface SavedView {
  name: string;
  search: string;
  status?: string;
  service?: string;
}

interface ResourceListProps<T> {
  items: T[];
  loading?: boolean;
  columns: Column<T>[];
  getRowId: (item: T) => string;
  onRowClick?: (item: T) => void;
  storageKey: string; // for saved views
  searchKeys?: (keyof T)[];
  statusKey?: keyof T;
  serviceKey?: keyof T;
}

function toCsv(rows: any[], headers: string[], accessors: ((row: any) => any)[]) {
  const escape = (val: any) => {
    if (val == null) return "";
    const s = String(val).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(accessors.map(fn => escape(fn(row))).join(","));
  }
  return lines.join("\n");
}

export function ResourceList<T>({
  items,
  loading,
  columns,
  getRowId,
  onRowClick,
  storageKey,
  searchKeys = [],
  statusKey,
  serviceKey,
}: ResourceListProps<T>) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [views, setViews] = useState<SavedView[]>([]);
  const [currentView, setCurrentView] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${storageKey}:views`);
      if (raw) setViews(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  const filtered = useMemo(() => {
    let r = [...items];
    if (search) {
      const s = search.toLowerCase();
      r = r.filter((item) =>
        searchKeys.some((k) => String((item as any)[k] ?? "").toLowerCase().includes(s))
      );
    }
    if (status && statusKey && status !== "all") {
      r = r.filter((i) => String((i as any)[statusKey] ?? "") === status);
    }
    if (service && serviceKey && service !== "all") {
      r = r.filter((i) => String((i as any)[serviceKey] ?? "") === service);
    }
    return r;
  }, [items, search, status, service, searchKeys, statusKey, serviceKey]);

  const allChecked = filtered.length > 0 && filtered.every((i) => selected.has(getRowId(i)));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) {
      filtered.forEach((i) => next.delete(getRowId(i)));
    } else {
      filtered.forEach((i) => next.add(getRowId(i)));
    }
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const saveView = () => {
    const name = prompt("Save view as:")?.trim();
    if (!name) return;
    const view: SavedView = { name, search, status, service };
    const next = [...views.filter((v) => v.name !== name), view];
    setViews(next);
    localStorage.setItem(`${storageKey}:views`, JSON.stringify(next));
    setCurrentView(name);
  };

  const applyView = (name: string) => {
    const v = views.find((x) => x.name === name);
    if (!v) return;
    setSearch(v.search);
    setStatus(v.status || "");
    setService(v.service || "");
    setCurrentView(name);
  };

  const clearView = () => {
    setSearch("");
    setStatus("");
    setService("");
    setCurrentView("");
  };

  const exportCsv = () => {
    const headers = columns.map((c) => c.header);
    const accessors = columns.map((c) => c.accessor || ((row: any) => (row as any)[c.key]));
    const csv = toCsv(filtered, headers, accessors);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${storageKey}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2 items-center w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="vacant">Vacant</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="property_management">Property Mgmt</SelectItem>
              <SelectItem value="house_watching">House Watching</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Views
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {views.length === 0 && (
                <DropdownMenuItem disabled>No saved views</DropdownMenuItem>
              )}
              {views.map((v) => (
                <DropdownMenuItem key={v.name} onClick={() => applyView(v.name)}>
                  <Star className="h-4 w-4 mr-2" /> {v.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={saveView}>Save current view…</DropdownMenuItem>
              {currentView && (
                <DropdownMenuItem onClick={clearView}>Clear view</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="Select all" />
                </TableHead>
                {columns.map((c) => (
                  <TableHead key={c.key} className={c.className}>{c.header}</TableHead>
                ))}
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={columns.length + 2}>
                      <div className="h-10 animate-pulse bg-muted rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="py-10 text-center text-muted-foreground">
                    No results
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => {
                  const id = getRowId(item);
                  return (
                    <TableRow key={id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onRowClick?.(item)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected.has(id)} onCheckedChange={() => toggleOne(id)} aria-label={`Select row ${id}`} />
                      </TableCell>
                      {columns.map((c) => (
                        <TableCell key={c.key} className={c.className}>
                          {c.render ? c.render(item) : String((item as any)[c.key] ?? "")}
                        </TableCell>
                      ))}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onRowClick?.(item)}>Open details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
