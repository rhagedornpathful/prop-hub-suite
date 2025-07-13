import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  Home,
  Zap,
  Shield,
  Wind,
  Save,
  Navigation,
  FileText
} from "lucide-react";
import { PropertyCheckItemCard } from "@/components/PropertyCheckItemCard";
import { SummarySection } from "@/components/SummarySection";
import { usePropertyCheck } from "@/hooks/usePropertyCheck";
import { useToast } from "@/hooks/use-toast";

const PropertyCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState(0);
  const [generalNotes, setGeneralNotes] = useState("");
  
  const {
    checklistItems,
    isLoading,
    isSaving,
    handleItemToggle,
    handleNotesChange,
    handlePhotosUpdate,
    getSectionProgress,
    getOverallProgress,
    getRequiredItemsProgress,
    canCompleteCheck,
    savePropertyCheckData
  } = usePropertyCheck();

  const sections = [
    { name: "Exterior", key: "exterior", icon: Home, color: "bg-gradient-primary" },
    { name: "Interior", key: "interior", icon: Wind, color: "bg-gradient-secondary" },
    { name: "Security", key: "security", icon: Shield, color: "bg-gradient-accent" },
    { name: "Utilities", key: "utilities", icon: Zap, color: "bg-gradient-success" },
    { name: "Summary", key: "summary", icon: FileText, color: "bg-gradient-primary" },
  ];

  const currentSectionData = sections[currentSection];
  const currentItems = checklistItems[currentSectionData.key as keyof typeof checklistItems];
  const requiredProgress = getRequiredItemsProgress();

  const handleCompleteCheck = async () => {
    if (!canCompleteCheck()) {
      toast({
        title: "Incomplete required items",
        description: `Please complete all required items (${requiredProgress.completed}/${requiredProgress.total})`,
        variant: "destructive"
      });
      return;
    }

    await savePropertyCheckData();
    toast({
      title: "Property check completed",
      description: "All inspection data has been saved successfully"
    });
    navigate('/house-watching');
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
            <Badge 
              variant={canCompleteCheck() ? "default" : "secondary"} 
              className="text-xs"
            >
              Required: {requiredProgress.completed}/{requiredProgress.total}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={savePropertyCheckData}
              disabled={isSaving}
              className="p-1"
            >
              <Save className={`h-3 w-3 ${isSaving ? 'animate-spin' : ''}`} />
            </Button>
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
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    if ('geolocation' in navigator) {
                      navigator.geolocation.getCurrentPosition(() => {
                        toast({
                          title: "Location verified",
                          description: "Your location has been verified for this property check"
                        });
                      });
                    }
                  }}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Verify Location
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
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading property check...</p>
                </div>
              ) : currentSectionData.key === 'summary' ? (
                <SummarySection
                  items={currentItems}
                  onToggle={(itemId) => handleItemToggle(itemId, currentSectionData.key as keyof typeof checklistItems)}
                  onNotesChange={(itemId, notes) => handleNotesChange(itemId, notes, currentSectionData.key as keyof typeof checklistItems)}
                  onPhotosUpdate={(itemId, photos) => handlePhotosUpdate(itemId, photos, currentSectionData.key as keyof typeof checklistItems)}
                  generalNotes={generalNotes}
                  onGeneralNotesChange={setGeneralNotes}
                />
              ) : (
                currentItems.map((item) => (
                  <PropertyCheckItemCard
                    key={item.id}
                    item={item}
                    onToggle={(itemId) => handleItemToggle(itemId, currentSectionData.key as keyof typeof checklistItems)}
                    onNotesChange={(itemId, notes) => handleNotesChange(itemId, notes, currentSectionData.key as keyof typeof checklistItems)}
                    onPhotosUpdate={(itemId, photos) => handlePhotosUpdate(itemId, photos, currentSectionData.key as keyof typeof checklistItems)}
                  />
                ))
              )}
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
              onClick={handleCompleteCheck}
              disabled={!canCompleteCheck()}
              className={`${canCompleteCheck() ? 'bg-gradient-success hover:bg-success-dark' : 'opacity-50'}`}
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