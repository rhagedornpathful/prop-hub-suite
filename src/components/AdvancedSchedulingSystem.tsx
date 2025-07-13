import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  AlertTriangle,
  CheckCircle,
  Repeat,
  Bell,
  Users,
  Settings
} from "lucide-react";
import { useState } from "react";
import { format, addDays, startOfWeek, addWeeks } from "date-fns";

interface SchedulingProps {
  requestId?: string;
  onSchedule: (scheduleData: any) => void;
  onClose: () => void;
}

const AdvancedSchedulingSystem = ({ requestId, onSchedule, onClose }: SchedulingProps) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [appointmentWindows, setAppointmentWindows] = useState<string[]>([]);
  const [residentPresence, setResidentPresence] = useState("required");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState("weekly");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
    inApp: true
  });

  // Time slots for scheduling
  const timeSlots = [
    { value: "08:00-10:00", label: "8:00 AM - 10:00 AM", type: "morning" },
    { value: "10:00-12:00", label: "10:00 AM - 12:00 PM", type: "morning" },
    { value: "12:00-14:00", label: "12:00 PM - 2:00 PM", type: "afternoon" },
    { value: "14:00-16:00", label: "2:00 PM - 4:00 PM", type: "afternoon" },
    { value: "16:00-18:00", label: "4:00 PM - 6:00 PM", type: "evening" },
    { value: "18:00-20:00", label: "6:00 PM - 8:00 PM", type: "evening" },
  ];

  // Mock vendor data
  const vendors = [
    {
      id: "1",
      name: "Mike's Plumbing",
      category: "Plumbing",
      rating: 4.8,
      responseTime: "2 hours",
      availability: "Available today",
      phone: "(555) 123-4567"
    },
    {
      id: "2", 
      name: "Cool Air HVAC",
      category: "HVAC",
      rating: 4.6,
      responseTime: "Same day",
      availability: "Available tomorrow",
      phone: "(555) 234-5678"
    },
    {
      id: "3",
      name: "Bright Electric", 
      category: "Electrical",
      rating: 4.9,
      responseTime: "1 hour",
      availability: "Available now",
      phone: "(555) 345-6789"
    }
  ];

  const toggleAppointmentWindow = (timeSlot: string) => {
    setAppointmentWindows(prev => 
      prev.includes(timeSlot) 
        ? prev.filter(slot => slot !== timeSlot)
        : [...prev, timeSlot]
    );
  };

  const getNextWeekDates = () => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i + 1));
  };

  const handleSchedule = () => {
    const scheduleData = {
      requestId,
      scheduledDate: selectedDate,
      timeSlot: selectedTimeSlot,
      appointmentWindows,
      residentPresence,
      vendorId: selectedVendor,
      isRecurring,
      recurrencePattern,
      specialInstructions,
      notificationPrefs
    };
    
    onSchedule(scheduleData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Advanced Scheduling System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="schedule" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="vendor">Vendor</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
            </TabsList>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Select Date</Label>
                <div className="grid grid-cols-7 gap-2">
                  {getNextWeekDates().map((date) => (
                    <Button
                      key={date.toISOString()}
                      variant={selectedDate === format(date, "yyyy-MM-dd") ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDate(format(date, "yyyy-MM-dd"))}
                      className="flex flex-col p-2 h-auto"
                    >
                      <span className="text-xs">{format(date, "EEE")}</span>
                      <span className="text-sm font-bold">{format(date, "dd")}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Preferred Time Slot</Label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.value}
                      variant={selectedTimeSlot === slot.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeSlot(slot.value)}
                      className="justify-start"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {slot.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Appointment Windows */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Available Windows (Select Multiple)
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {appointmentWindows.length} selected
                  </Badge>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={`window-${slot.value}`}
                      variant={appointmentWindows.includes(slot.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAppointmentWindow(slot.value)}
                      className="justify-start"
                    >
                      <CheckCircle className={`w-4 h-4 mr-2 ${
                        appointmentWindows.includes(slot.value) ? "opacity-100" : "opacity-30"
                      }`} />
                      {slot.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Resident Presence */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Resident Presence</Label>
                <Select value={residentPresence} onValueChange={setResidentPresence}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Resident must be present</SelectItem>
                    <SelectItem value="optional">Resident presence optional</SelectItem>
                    <SelectItem value="not-needed">No resident presence needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Vendor Tab */}
            <TabsContent value="vendor" className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Select Vendor</Label>
                <div className="space-y-3">
                  {vendors.map((vendor) => (
                    <Card 
                      key={vendor.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedVendor === vendor.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedVendor(vendor.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{vendor.name}</h4>
                              <Badge variant="secondary">{vendor.category}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                ★ {vendor.rating}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {vendor.responseTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {vendor.phone}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={vendor.availability.includes("now") ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {vendor.availability}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              {/* Special Instructions */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Special Instructions</Label>
                <Textarea
                  placeholder="Enter any special instructions for the vendor..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Notification Preferences</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>Email notifications</span>
                    </div>
                    <Switch
                      checked={notificationPrefs.email}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>SMS notifications</span>
                    </div>
                    <Switch
                      checked={notificationPrefs.sms}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs(prev => ({ ...prev, sms: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <span>In-app notifications</span>
                    </div>
                    <Switch
                      checked={notificationPrefs.inApp}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs(prev => ({ ...prev, inApp: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Recurring Tab */}
            <TabsContent value="recurring" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Enable Recurring Schedule</Label>
                  <Switch
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                </div>

                {isRecurring && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Repeat className="w-4 h-4 text-primary" />
                      <span className="font-medium">Recurrence Settings</span>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-sm">Recurrence Pattern</Label>
                      <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="text-xs text-muted-foreground p-2 bg-blue-50 rounded border border-blue-200">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Recurring appointments will be automatically scheduled based on your selected pattern.
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              onClick={handleSchedule}
              disabled={!selectedDate || !selectedTimeSlot}
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSchedulingSystem;