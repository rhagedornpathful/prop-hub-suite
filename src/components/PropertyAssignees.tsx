import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { UserCircle2, Shield, Eye, UserCog } from "lucide-react";

interface PropertyAssigneesProps {
  propertyId: string;
}

interface Profile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
}

interface HouseWatcherRow {
  id: string;
  user_id: string;
}

export function PropertyAssignees({ propertyId }: PropertyAssigneesProps) {
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const { toast } = useToast();

  const isAdmin = userRole === "admin";

  const [loading, setLoading] = useState(true);
  const [managerUserId, setManagerUserId] = useState<string | null>(null);
  const [managerProfile, setManagerProfile] = useState<Profile | null>(null);

  const [watcherId, setWatcherId] = useState<string | null>(null);
  const [watcherProfile, setWatcherProfile] = useState<Profile | null>(null);

  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [watcherDialogOpen, setWatcherDialogOpen] = useState(false);

  const [managerOptions, setManagerOptions] = useState<Profile[]>([]);
  const [watcherOptions, setWatcherOptions] = useState<Array<HouseWatcherRow & { profile?: Profile }>>([]);

  // Derived labels
  const managerName = useMemo(() => {
    if (!managerProfile) return "Unassigned";
    const fn = managerProfile.first_name || "";
    const ln = managerProfile.last_name || "";
    const full = `${fn} ${ln}`.trim();
    return full || managerProfile.user_id;
  }, [managerProfile]);

  const watcherName = useMemo(() => {
    if (!watcherProfile) return "Unassigned";
    const fn = watcherProfile.first_name || "";
    const ln = watcherProfile.last_name || "";
    const full = `${fn} ${ln}`.trim();
    return full || watcherProfile.user_id;
  }, [watcherProfile]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const load = async () => {
      setLoading(true);
      try {
        // Load current manager assignment
        const { data: pma } = await supabase
          .from("property_manager_assignments")
          .select("manager_user_id")
          .eq("property_id", propertyId)
          .maybeSingle();

        const mgrId = (pma as { manager_user_id?: string } | null)?.manager_user_id || null;
        setManagerUserId(mgrId);

        if (mgrId) {
          const { data: mgrProfile } = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name")
            .eq("user_id", mgrId)
            .maybeSingle();
          setManagerProfile((mgrProfile as Profile) || null);
        } else {
          setManagerProfile(null);
        }

        // Load current house watcher assignment (one per property by convention)
        const { data: hwp } = await supabase
          .from("house_watcher_properties")
          .select("id, house_watcher_id")
          .eq("property_id", propertyId)
          .limit(1)
          .maybeSingle();

        const hwAssignment = hwp as { id?: string; house_watcher_id?: string } | null;
        const hwId = hwAssignment?.house_watcher_id || null;
        setWatcherId(hwId);

        if (hwId) {
          const { data: hwRow } = await supabase
            .from("house_watchers")
            .select("user_id")
            .eq("id", hwId)
            .maybeSingle();
          const watcherUserId = (hwRow as { user_id?: string } | null)?.user_id || null;
          if (watcherUserId) {
            const { data: hwProfile } = await supabase
              .from("profiles")
              .select("user_id, first_name, last_name")
              .eq("user_id", watcherUserId)
              .maybeSingle();
            setWatcherProfile((hwProfile as Profile) || null);
          } else {
            setWatcherProfile(null);
          }
        } else {
          setWatcherProfile(null);
        }

        // Preload options if admin
        if (isAdmin) {
          // Manager options: users with role property_manager
          const { data: roleRows } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("role", "property_manager");
          const managerIds = (roleRows || []).map((r: any) => r.user_id);
          if (managerIds.length) {
            const { data: mgrProfiles } = await supabase
              .from("profiles")
              .select("user_id, first_name, last_name")
              .in("user_id", managerIds);
            setManagerOptions((mgrProfiles as Profile[]) || []);
          } else {
            setManagerOptions([]);
          }

          // House watcher options
          const { data: hwRows } = await supabase
            .from("house_watchers")
            .select("id, user_id");
          const hwUserIds = (hwRows || []).map((r: any) => r.user_id);
          let profilesByUser: Record<string, Profile> = {};
          if (hwUserIds.length) {
            const { data: hwProfiles } = await supabase
              .from("profiles")
              .select("user_id, first_name, last_name")
              .in("user_id", hwUserIds);
            (hwProfiles as Profile[] | null)?.forEach((p) => {
              profilesByUser[p.user_id] = p;
            });
          }
          setWatcherOptions(
            ((hwRows as HouseWatcherRow[]) || []).map((hw) => ({
              ...hw,
              profile: profilesByUser[hw.user_id],
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();

    // realtime subscriptions
    channel = supabase
      .channel("property-assignees-" + propertyId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "property_manager_assignments", filter: `property_id=eq.${propertyId}` },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "house_watcher_properties", filter: `property_id=eq.${propertyId}` },
        () => load()
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [propertyId, isAdmin]);

  const handleAssignManager = async (newManagerUserId: string | null) => {
    if (!isAdmin) return;
    try {
      if (!newManagerUserId) {
        // Unassign
        await supabase.from("property_manager_assignments").delete().eq("property_id", propertyId);
        toast({ title: "Unassigned", description: "Property manager removed." });
        return;
      }
      const payload: any = {
        property_id: propertyId,
        manager_user_id: newManagerUserId,
      };
      if (user?.id) payload.assigned_by = user.id;

      // Ensure only one manager per property, then insert
      await supabase
        .from("property_manager_assignments")
        .delete()
        .eq("property_id", propertyId);

      const { error } = await supabase
        .from("property_manager_assignments")
        .insert(payload);
      if (error) throw error;
      toast({ title: "Saved", description: "Property manager assigned." });
      setManagerDialogOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleAssignWatcher = async (newWatcherId: string | null) => {
    if (!isAdmin) return;
    try {
      if (!newWatcherId) {
        await supabase.from("house_watcher_properties").delete().eq("property_id", propertyId);
        toast({ title: "Unassigned", description: "House watcher removed." });
        return;
      }
      // Ensure only one per property: replace existing assignment
      await supabase.from("house_watcher_properties").delete().eq("property_id", propertyId);
      const { error } = await supabase
        .from("house_watcher_properties")
        .insert({ house_watcher_id: newWatcherId, property_id: propertyId });
      if (error) throw error;
      toast({ title: "Saved", description: "House watcher assigned." });
      setWatcherDialogOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assignees</CardTitle>
          {!isAdmin && (
            <Badge variant="secondary" className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" /> Read-only
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Manager */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserCog className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Property Manager</div>
              <div className="text-base font-medium">{loading ? "Loading..." : managerName}</div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setManagerDialogOpen(true)} disabled={loading}>
                {managerUserId ? "Change" : "Assign"}
              </Button>
              {managerUserId && (
                <Button variant="ghost" size="sm" onClick={() => handleAssignManager(null)} disabled={loading}>
                  Unassign
                </Button>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* House Watcher */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">House Watcher</div>
              <div className="text-base font-medium">{loading ? "Loading..." : watcherName}</div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setWatcherDialogOpen(true)} disabled={loading}>
                {watcherId ? "Change" : "Assign"}
              </Button>
              {watcherId && (
                <Button variant="ghost" size="sm" onClick={() => handleAssignWatcher(null)} disabled={loading}>
                  Unassign
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Assign Manager Dialog */}
        <Dialog open={managerDialogOpen} onOpenChange={setManagerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Property Manager</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Select manager</Label>
              <Select onValueChange={(v) => setManagerUserId(v)} value={managerUserId ?? undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a property manager" />
                </SelectTrigger>
                <SelectContent>
                  {managerOptions.length === 0 && (
                    <SelectItem value="" disabled>
                      No managers available
                    </SelectItem>
                  )}
                  {managerOptions.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {`${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || m.user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setManagerDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => handleAssignManager(managerUserId)}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign House Watcher Dialog */}
        <Dialog open={watcherDialogOpen} onOpenChange={setWatcherDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign House Watcher</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Select house watcher</Label>
              <Select onValueChange={(v) => setWatcherId(v)} value={watcherId ?? undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a house watcher" />
                </SelectTrigger>
                <SelectContent>
                  {watcherOptions.length === 0 && (
                    <SelectItem value="" disabled>
                      No house watchers available
                    </SelectItem>
                  )}
                  {watcherOptions.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {`${w.profile?.first_name ?? ""} ${w.profile?.last_name ?? ""}`.trim() || w.user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setWatcherDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => handleAssignWatcher(watcherId)}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
