import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  FileText,
  Play,
  Square,
  Timer
} from "lucide-react";
import { PropertyCheckItemCard } from "@/components/PropertyCheckItemCard";
import { SummarySection } from "@/components/SummarySection";
import { usePropertyCheck } from "@/hooks/usePropertyCheck";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PropertyCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole, isAdmin, isPropertyManager } = useUserRole();

  // Restrict Property Checks to Property Managers and Admins only
  if (!isAdmin() && !isPropertyManager()) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-4">Property checks are only available to Property Managers and Administrators.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  const { id: propertyId } = useParams();
  const [currentSection, setCurrentSection] = useState(0);
  const [generalNotes, setGeneralNotes] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState<{ duration: number; completedItems: number; totalItems: number } | null>(null);

  // Fetch property details
  const { data: property, isLoading: isLoadingProperty, error: propertyError } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
  });
  
  const {
    checklistItems,
    isLoading,
    isSaving,
    isSubmitting,
    sessionStarted,
    sessionId,
    elapsedTime,
    startTime,
    lastSaveTime,
    hasUnsavedChanges,
    handleItemToggle,
    handleNotesChange,
    handlePhotosUpdate,
    getSectionProgress,
    getOverallProgress,
    getRequiredItemsProgress,
    canCompleteCheck,
    savePropertyCheckData,
    recoverFromLocalStorage,
    startSession,
    submitSession,
    formatElapsedTime
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
    console.log('Handle complete check called');
    console.log('Can complete check:', canCompleteCheck());
    console.log('Required progress:', requiredProgress);
    
    if (!canCompleteCheck()) {
      toast({
        title: "Incomplete required items",
        description: `Please complete all required items (${requiredProgress.completed}/${requiredProgress.total})`,
        variant: "destructive"
      });
      return;
    }

    const success = await submitSession(generalNotes);
    if (success) {
      // Calculate submission details for confirmation
      const totalItems = Object.values(checklistItems).flat().length;
      const completedItems = Object.values(checklistItems).flat().filter(item => item.completed).length;
      const durationMinutes = Math.floor(elapsedTime / 60);
      
      setSubmissionDetails({
        duration: durationMinutes,
        completedItems,
        totalItems
      });
      setShowSuccessDialog(true);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    // Redirect based on user role
    if (userRole === 'house_watcher') {
      navigate('/'); // House watchers go to their dashboard (root)
    } else {
      navigate('/house-watching'); // Admins/property managers go to house watching management
    }
  };

  const handleStartSession = () => {
    startSession();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle overflow-safe">
      {/* Phone-Optimized Header */}
      <header className="bg-card border-b border-border px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Navigate back based on user role
                if (userRole === 'house_watcher') {
                  navigate('/'); // House watchers go to their dashboard (root)
                } else {
                  navigate('/house-watching'); // Admins/property managers go to house watching management
                }
              }}
              className="min-h-[44px] min-w-[44px] p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground leading-tight">Property Check</h1>
              {isLoadingProperty ? (
                <p className="text-sm text-muted-foreground truncate">Loading...</p>
              ) : propertyError ? (
                <p className="text-sm text-destructive truncate">Failed to load</p>
              ) : property ? (
                <p className="text-sm text-muted-foreground truncate">{property.address}</p>
              ) : (
                <p className="text-sm text-muted-foreground truncate">Unknown property</p>
              )}
            </div>
          </div>
          
          {/* Compact Status Display */}
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs px-2 py-1">
              {getOverallProgress()}%
            </Badge>
            {sessionStarted && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {formatElapsedTime(elapsedTime)}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Required: {requiredProgress.completed}/{requiredProgress.total}</span>
            <span className={canCompleteCheck() ? "text-success font-medium" : ""}>
              {canCompleteCheck() ? "Ready to submit" : "In progress"}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getOverallProgress()}%` }}
            />
          </div>
        </div>
      </header>
      {/* Phone-Optimized Section Navigation */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
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
                className={`flex flex-col items-center gap-1 min-w-[80px] h-16 text-xs whitespace-nowrap ${
                  isActive ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium leading-tight">{section.name}</span>
                <span className="text-xs opacity-75">{progress}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Phone-Optimized Main Content */}
      <main className="px-4 py-4 pb-24 overflow-safe">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Phone-Optimized Start Session Card */}
          {!sessionStarted && (
            <Card className="shadow-lg border-0 bg-gradient-primary rounded-2xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Start Property Check
                    </h3>
                    <p className="text-white/90 text-base mb-6">
                      Tap to begin your inspection session
                    </p>
                    <Button
                      onClick={handleStartSession}
                      size="lg"
                      className="bg-white text-primary hover:bg-white/95 font-semibold px-8 py-4 text-lg min-h-[56px] rounded-xl shadow-lg"
                    >
                      <Play className="h-5 w-5 mr-3" />
                      Start Check
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Info */}
          {sessionStarted && (
            <>
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
              <Button
                size="sm"
                variant="outline"
                onClick={recoverFromLocalStorage}
                className="mt-4"
              >
                Try to recover from local backup
              </Button>
            </div>
                  ) : currentSectionData.key === 'summary' ? (
                    <SummarySection
                      items={currentItems}
                      onToggle={(itemId) => handleItemToggle(itemId, currentSectionData.key as keyof typeof checklistItems)}
                      onNotesChange={(itemId, notes) => handleNotesChange(itemId, notes, currentSectionData.key as keyof typeof checklistItems)}
                      onPhotosUpdate={(itemId, photos) => handlePhotosUpdate(itemId, photos, currentSectionData.key as keyof typeof checklistItems)}
                      generalNotes={generalNotes}
                      onGeneralNotesChange={setGeneralNotes}
                      elapsedTime={elapsedTime}
                      formatElapsedTime={formatElapsedTime}
                      startTime={startTime}
                      onSubmit={handleCompleteCheck}
                      canSubmit={canCompleteCheck()}
                      isSubmitting={isSubmitting}
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
            </>
          )}
        </div>
      </main>

      {/* Phone-Optimized Bottom Navigation */}
      {sessionStarted && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 shadow-2xl safe-area-pb">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={currentSection === 0}
              onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
              className="min-h-[48px] px-6 rounded-xl"
            >
              Previous
            </Button>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                <span>
                  {Object.values(checklistItems).flat().filter(item => item.completed).length} / {Object.values(checklistItems).flat().length}
                </span>
              </div>
              <span className="text-xs font-medium">Items Complete</span>
            </div>
            
            {currentSection < sections.length - 1 ? (
              <Button
                onClick={() => setCurrentSection(prev => Math.min(sections.length - 1, prev + 1))}
                className="bg-primary hover:bg-primary/90 min-h-[48px] px-6 rounded-xl font-medium"
              >
                Next
              </Button>
            ) : currentSectionData.key !== 'summary' ? (
              <Button
                onClick={handleCompleteCheck}
                disabled={!canCompleteCheck() || isSubmitting}
                className={`min-h-[48px] px-6 rounded-xl font-medium ${
                  canCompleteCheck() 
                    ? 'bg-success hover:bg-success/90 text-white' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            ) : null}
          </div>
        </div>
        )}

      {/* Success Confirmation Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Property Check Submitted Successfully!
            </DialogTitle>
            <DialogDescription>
              Your property inspection has been completed and submitted.
            </DialogDescription>
          </DialogHeader>
          
          {submissionDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold">
                    {Math.floor(submissionDetails.duration / 60)}h {submissionDetails.duration % 60}m
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Items Completed</p>
                  <p className="text-lg font-semibold">
                    {submissionDetails.completedItems}/{submissionDetails.totalItems}
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <Badge variant="default" className="bg-success text-success-foreground">
                  Report Generated
                </Badge>
                <p className="text-sm text-muted-foreground">
                  The property owner and management team have been notified.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleCloseSuccessDialog} className="w-full">
              Return to House Watching
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyCheck;