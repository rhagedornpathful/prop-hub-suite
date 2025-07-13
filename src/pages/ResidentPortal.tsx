import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Camera, 
  Upload, 
  X, 
  AlertTriangle, 
  Wrench, 
  Home,
  Zap,
  Droplets,
  Wind,
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MaintenanceCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  examples: string[];
}

const categories: MaintenanceCategory[] = [
  {
    id: "plumbing",
    name: "Plumbing",
    icon: Droplets,
    color: "bg-blue-500",
    examples: ["Leaky faucet", "Clogged drain", "Running toilet", "Low water pressure"]
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: Zap,
    color: "bg-yellow-500",
    examples: ["Outlet not working", "Light switch issues", "Flickering lights", "Circuit breaker tripped"]
  },
  {
    id: "hvac",
    name: "HVAC",
    icon: Wind,
    color: "bg-green-500",
    examples: ["AC not cooling", "Heater not working", "Strange noises", "Air filter replacement"]
  },
  {
    id: "appliances",
    name: "Appliances",
    icon: Home,
    color: "bg-purple-500",
    examples: ["Refrigerator issues", "Dishwasher problems", "Washer/dryer repair", "Oven not heating"]
  },
  {
    id: "general",
    name: "General Maintenance",
    icon: Wrench,
    color: "bg-gray-500",
    examples: ["Door/window issues", "Paint touch-ups", "Cabinet repairs", "Flooring problems"]
  }
];

const ResidentPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("normal");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unitAddress, setUnitAddress] = useState("123 Main St, Apt 4B"); // This would come from user profile

  // Mock existing requests for demonstration
  const [existingRequests] = useState([
    {
      id: "1",
      title: "Kitchen Faucet Leaking",
      category: "plumbing",
      status: "in_progress",
      createdAt: "2024-01-15",
      priority: "normal",
      lastUpdate: "Plumber scheduled for tomorrow at 2 PM"
    },
    {
      id: "2", 
      title: "Living Room Light Not Working",
      category: "electrical",
      status: "completed",
      createdAt: "2024-01-10",
      priority: "normal",
      lastUpdate: "Completed on Jan 12, 2024"
    },
    {
      id: "3",
      title: "AC Making Strange Noise",
      category: "hvac", 
      status: "pending",
      createdAt: "2024-01-20",
      priority: "high",
      lastUpdate: "Request received, will schedule technician"
    }
  ]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...imageFiles]);
      toast({
        title: "Images uploaded",
        description: `${imageFiles.length} image(s) added to your request`
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitRequest = async () => {
    if (!selectedCategory || !title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a category and provide a title",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would upload images to Supabase storage and create the maintenance request
      // For now, we'll just show a success message
      
      toast({
        title: "Request Submitted Successfully!",
        description: "Your maintenance request has been received. You'll get updates via email and in your portal."
      });

      // Reset form
      setShowRequestForm(false);
      setSelectedCategory("");
      setTitle("");
      setDescription("");
      setPriority("normal");
      setUploadedImages([]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "in_progress": return "bg-blue-500";
      case "completed": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pending";
      case "in_progress": return "In Progress";
      case "completed": return "Completed";
      default: return "Unknown";
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || Wrench;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Mobile Header */}
      <header className="bg-card border-b border-border p-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Maintenance Portal</h1>
              <p className="text-sm text-muted-foreground">{unitAddress}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowRequestForm(true)}
            className="bg-gradient-primary hover:bg-primary-dark"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </header>

      <main className="p-4 pb-20 max-w-4xl mx-auto space-y-6">
        {/* Quick Actions */}
        <Card className="shadow-md border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setShowRequestForm(true)}
              >
                <Plus className="h-6 w-6 text-primary" />
                <span className="text-sm">New Request</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => {
                  // Navigate to emergency contact or call function
                  toast({
                    title: "Emergency Contact",
                    description: "For emergencies, call (555) 123-4567 immediately"
                  });
                }}
              >
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <span className="text-sm">Emergency</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Requests */}
        <Card className="shadow-md border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Maintenance Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingRequests.map((request) => {
              const CategoryIcon = getCategoryIcon(request.category);
              return (
                <div
                  key={request.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    // Navigate to request details
                    toast({
                      title: "Request Details",
                      description: "Opening detailed view..."
                    });
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${categories.find(c => c.id === request.category)?.color || 'bg-gray-500'}`}>
                        <CategoryIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{request.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(request.status)} text-white`}>
                      {getStatusText(request.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{request.lastUpdate}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>

      {/* New Request Dialog */}
      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Maintenance Request</DialogTitle>
            <DialogDescription>
              Describe your maintenance issue and we'll get it resolved quickly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Issue Category *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && (
                <div className="text-xs text-muted-foreground">
                  Examples: {categories.find(c => c.id === selectedCategory)?.examples.join(", ")}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                placeholder="Provide more details about the issue, when it started, and any relevant information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Can wait a few days</SelectItem>
                  <SelectItem value="normal">Normal - Within a week</SelectItem>
                  <SelectItem value="high">High - Needs attention soon</SelectItem>
                  <SelectItem value="emergency">Emergency - Immediate attention</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Photos (Optional)</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 h-6 w-6 flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRequestForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={isSubmitting || !selectedCategory || !title.trim()}
              className="bg-gradient-primary hover:bg-primary-dark"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResidentPortal;