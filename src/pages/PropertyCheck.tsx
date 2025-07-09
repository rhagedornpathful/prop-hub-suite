import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  Eye,
  Home,
  TreePine,
  Droplets,
  Zap,
  Shield,
  Wind,
  Thermometer
} from "lucide-react";

const PropertyCheck = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [checklistItems, setChecklistItems] = useState({
    exterior: [
      { id: 1, item: "Roof condition", completed: false, photos: [], notes: "", required: true },
      { id: 2, item: "Gutters and downspouts", completed: false, photos: [], notes: "", required: true },
      { id: 3, item: "Exterior walls and siding", completed: false, photos: [], notes: "", required: true },
      { id: 4, item: "Windows and doors", completed: false, photos: [], notes: "", required: true },
      { id: 5, item: "Driveway and walkways", completed: false, photos: [], notes: "", required: false },
      { id: 6, item: "Landscaping and lawn", completed: false, photos: [], notes: "", required: false },
      { id: 7, item: "Pool area (if applicable)", completed: false, photos: [], notes: "", required: false },
    ],
    interior: [
      { id: 8, item: "HVAC system check", completed: false, photos: [], notes: "", required: true },
      { id: 9, item: "Plumbing inspection", completed: false, photos: [], notes: "", required: true },
      { id: 10, item: "Electrical systems", completed: false, photos: [], notes: "", required: true },
      { id: 11, item: "Appliances functionality", completed: false, photos: [], notes: "", required: true },
      { id: 12, item: "Interior walls and ceilings", completed: false, photos: [], notes: "", required: false },
      { id: 13, item: "Flooring condition", completed: false, photos: [], notes: "", required: false },
    ],
    security: [
      { id: 14, item: "Door locks and security", completed: false, photos: [], notes: "", required: true },
      { id: 15, item: "Window locks", completed: false, photos: [], notes: "", required: true },
      { id: 16, item: "Alarm system test", completed: false, photos: [], notes: "", required: true },
      { id: 17, item: "Smoke detector test", completed: false, photos: [], notes: "", required: true },
      { id: 18, item: "Carbon monoxide detector", completed: false, photos: [], notes: "", required: true },
    ],
    utilities: [
      { id: 19, item: "Water meter reading", completed: false, photos: [], notes: "", required: true },
      { id: 20, item: "Electrical meter reading", completed: false, photos: [], notes: "", required: true },
      { id: 21, item: "Gas meter reading", completed: false, photos: [], notes: "", required: false },
      { id: 22, item: "Water pressure test", completed: false, photos: [], notes: "", required: false },
    ]
  });

  const sections = [
    { name: "Exterior", key: "exterior", icon: Home, color: "bg-gradient-primary" },
    { name: "Interior", key: "interior", icon: Wind, color: "bg-gradient-secondary" },
    { name: "Security", key: "security", icon: Shield, color: "bg-gradient-accent" },
    { name: "Utilities", key: "utilities", icon: Zap, color: "bg-gradient-success" },
  ];

  const currentSectionData = sections[currentSection];
  const currentItems = checklistItems[currentSectionData.key as keyof typeof checklistItems];

  const handleItemToggle = (itemId: number) => {
    const sectionKey = currentSectionData.key as keyof typeof checklistItems;
    setChecklistItems(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const handleNotesChange = (itemId: number, notes: string) => {
    const sectionKey = currentSectionData.key as keyof typeof checklistItems;
    setChecklistItems(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => 
        item.id === itemId ? { ...item, notes } : item
      )
    }));
  };

  const simulatePhotoCapture = (itemId: number) => {
    // Simulate photo capture - in real app would use camera API
    const sectionKey = currentSectionData.key as keyof typeof checklistItems;
    setChecklistItems(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => 
        item.id === itemId 
          ? { ...item, photos: [...item.photos, `photo_${Date.now()}.jpg`] }
          : item
      )
    }));
  };

  const getSectionProgress = (sectionKey: keyof typeof checklistItems) => {
    const items = checklistItems[sectionKey];
    const completed = items.filter(item => item.completed).length;
    return `${completed}/${items.length}`;
  };

  const getOverallProgress = () => {
    const allItems = Object.values(checklistItems).flat();
    const completed = allItems.filter(item => item.completed).length;
    return Math.round((completed / allItems.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Mobile-First Header */}
      <header className="bg-card border-b border-border p-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/house-watching')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Property Check</h1>
              <p className="text-sm text-muted-foreground">Oak Street Property</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getOverallProgress()}% Complete
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Started 10:30 AM</span>
            </div>
          </div>
        </div>
      </header>

      {/* Section Navigation */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const progress = getSectionProgress(section.key as keyof typeof checklistItems);
            const isActive = currentSection === index;
            
            return (
              <Button
                key={section.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentSection(index)}
                className={`flex items-center gap-2 min-w-fit ${isActive ? section.color : ""}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.name}</span>
                <Badge variant="secondary" className="text-xs ml-1">
                  {progress}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 pb-20">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Property Info */}
          <Card className="shadow-md border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">456 Oak Street</span>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Weekly check • Owner: Sarah Johnson
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  GPS Verify
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Section Items */}
          <Card className="shadow-md border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <currentSectionData.icon className="h-5 w-5" />
                {currentSectionData.name} Inspection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentItems.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={() => handleItemToggle(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`item-${item.id}`} 
                        className={`text-sm font-medium cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                      >
                        {item.item}
                        {item.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      
                      {/* Photo Section */}
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => simulatePhotoCapture(item.id)}
                          className="flex items-center gap-1"
                        >
                          <Camera className="h-3 w-3" />
                          Take Photo
                        </Button>
                        {item.photos.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {item.photos.length} photo{item.photos.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="mt-2">
                        <Textarea
                          placeholder="Add notes or observations..."
                          value={item.notes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          className="min-h-[60px] text-sm"
                        />
                      </div>
                      
                      {/* Issue Flag */}
                      {item.notes && item.notes.toLowerCase().includes('issue') && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span>Issue flagged for review</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="outline"
            disabled={currentSection === 0}
            onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">
              {Object.values(checklistItems).flat().filter(item => item.completed).length} / {Object.values(checklistItems).flat().length} items
            </span>
          </div>
          
          {currentSection < sections.length - 1 ? (
            <Button
              onClick={() => setCurrentSection(prev => Math.min(sections.length - 1, prev + 1))}
              className="bg-gradient-primary hover:bg-primary-dark"
            >
              Next Section
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/house-watching')}
              className="bg-gradient-success hover:bg-success-dark"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Check
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCheck;