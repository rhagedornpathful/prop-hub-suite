import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2, Users } from "lucide-react";

interface AddHouseWatcherDialogProps {
  onHouseWatcherAdded: () => void;
}

interface ExistingUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
}

const AddHouseWatcherDialog = ({ onHouseWatcherAdded }: AddHouseWatcherDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: ""
  });
  const { toast } = useToast();

  // Fetch users without house_watcher role when dialog opens
  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
    }
  }, [open]);

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      // Get all profiles and then filter by checking roles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .order('first_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Filter users who don't have house_watcher role
      const usersWithoutHWRole = profilesData?.filter(profile => {
        const userRoles = rolesData?.filter(role => role.user_id === profile.user_id) || [];
        return !userRoles.some(role => role.role === 'house_watcher');
      }) || [];

      // Transform to match expected interface
      const data = usersWithoutHWRole.map(profile => ({
        id: profile.user_id,
        email: '', // Email not available in profiles table
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        role: null
      }));

      setExistingUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load available users",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const resetForm = () => {
    setMode('existing');
    setSelectedUserId("");
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userId = selectedUserId;

      if (mode === 'new') {
        // Create new user
        if (!formData.email || !formData.password) {
          throw new Error("Email and password are required for new users");
        }

        const redirectUrl = `${window.location.origin}/`;
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create user");

        userId = authData.user.id;

        // Create profile for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here as the user was created successfully
        }
      } else {
        // Using existing user
        if (!selectedUserId) {
          throw new Error("Please select a user");
        }
      }

      // Assign house_watcher role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'house_watcher',
          updated_at: new Date().toISOString()
        });

      if (roleError) throw roleError;

      // Create house_watcher record
      const { error: watcherError } = await supabase
        .from('house_watchers')
        .insert({
          user_id: userId,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (watcherError) throw watcherError;

      toast({
        title: "House Watcher Added",
        description: mode === 'new' 
          ? "New house watcher has been created and added to the system"
          : "User has been assigned as a house watcher",
      });

      setOpen(false);
      resetForm();
      onHouseWatcherAdded();
    } catch (error: any) {
      console.error('Error adding house watcher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add house watcher",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedUserDisplay = () => {
    const user = existingUsers.find(u => u.id === selectedUserId);
    if (!user) return "";
    return user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name} (${user.email})`
      : user.email;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          Add House Watcher
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add House Watcher</DialogTitle>
          <DialogDescription>
            Add a new house watcher to monitor properties. You can assign an existing user or create a new account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Assignment Method</Label>
            <Select value={mode} onValueChange={(value: 'existing' | 'new') => setMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="existing">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assign Existing User
                  </div>
                </SelectItem>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New User
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === 'existing' ? (
            /* Existing User Selection */
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              {loadingUsers ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading available users...
                </div>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to assign as house watcher">
                      {selectedUserId ? getSelectedUserDisplay() : "Choose a user to assign as house watcher"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {existingUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span>
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : user.email
                            }
                          </span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                          {user.role && (
                            <span className="text-xs text-muted-foreground">Current role: {user.role}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {existingUsers.length === 0 && !loadingUsers && (
                <p className="text-sm text-muted-foreground">
                  No available users found. All users may already be house watchers or have other roles.
                </p>
              )}
            </div>
          ) : (
            /* New User Form */
            <div className="mobile-form-spacing">
              <div className="mobile-stack">
                <div className="mobile-form-field">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    inputType="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="mobile-form-field">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    inputType="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="mobile-form-field">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  inputType="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="mobile-form-field">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  inputType="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter secure password"
                  required
                />
              </div>

              <div className="mobile-form-field">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  inputType="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="mobile-form-field">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  inputType="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter street address"
                />
              </div>

              <div className="mobile-stack">
                <div className="mobile-form-field">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    inputType="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                  />
                </div>
                <div className="mobile-form-field">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    inputType="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div className="mobile-form-field">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  inputType="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="Enter zip code"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mobile-form-field">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this house watcher..."
              rows={3}
            />
          </div>

          <DialogFooter className="mobile-form-buttons">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="mobile-form-button"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (mode === 'existing' && !selectedUserId)}
              className="bg-gradient-primary hover:bg-primary-dark mobile-form-button"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'existing' ? 'Assign as House Watcher' : 'Create House Watcher'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHouseWatcherDialog;