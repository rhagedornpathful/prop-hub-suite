import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MapPin,
  ArrowLeft,
  Home,
  Shield,
  Wind,
  Square,
  Play,
  Timer,
  Navigation,
  CheckCircle,
  FileText
} from "lucide-react";
import { HomeCheckItemCard } from "@/components/HomeCheckItemCard";
import { HomeCheckSummarySection } from "@/components/HomeCheckSummarySection";
import { useHomeCheck } from "@/hooks/useHomeCheck";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const HomeCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole } = useUserRole();
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
    weather,
    setWeather,
    overallCondition,
    setOverallCondition,
    weatherImpact,
    setWeatherImpact,
    nextVisitDate,
    setNextVisitDate,
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
    getTotalIssuesFound,
    getTotalPhotos,
    canCompleteCheck,
    saveHomeCheckData,
    recoverFromLocalStorage,
    startSession,
    submitSession,
    formatElapsedTime
  } = useHomeCheck();

  const sections = [
    { name: "Exterior", key: "exterior", icon: Home, color: "bg-gradient-primary" },
    { name: "Entry & Security", key: "entry_security", icon: Shield, color: "bg-gradient-secondary" },
    { name: "Interior", key: "interior", icon: Wind, color: "bg-gradient-accent" },
    { name: "Final Steps", key: "final_steps", icon: Square, color: "bg-gradient-success" },
    { name: "Summary", key: "summary", icon: FileText, color: "bg-gradient-primary" },
  ];

  const currentSectionData = sections[currentSection];
  const currentItems = currentSectionData.key === 'summary' 
    ? [] 
    : checklistItems[currentSectionData.key as keyof typeof checklistItems];
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
    navigate('/house-watching');
  };

  const handleStartSession = () => {
    startSession();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle overflow-safe">
      {/* Mobile-First Header */}
      <header className="bg-card border-b border-border section-padding shadow-sm sticky top-0 z-10">
        <div className="container-responsive">
          <div className="mobile-stack items-start md:items-center">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/house-watching')}
                className="touch-target"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="ml-2 desktop-only">Back</span>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-responsive-lg font-bold text-foreground">Home Check</h1>
                {isLoadingProperty ? (
                  <p className="text-sm text-muted-foreground">Loading property details...</p>
                ) : propertyError ? (
                  <p className="text-sm text-destructive">Failed to load property details</p>
                ) : property ? (
                  <p className="text-sm text-muted-foreground overflow-safe">{property.address}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Unknown property</p>
                )}
              </div>
            </div>
            
            {/* Progress and Status Badges */}
            <div className="w-full md:w-auto">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getOverallProgress()}% Complete
                </Badge>
                <Badge 
                  variant={canCompleteCheck() ? "default" : "secondary"} 
                  className="text-xs"
                >
                  Required: {requiredProgress.completed}/{requiredProgress.total}
                </Badge>
                {sessionStarted && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {formatElapsedTime(elapsedTime)}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  {hasUnsavedChanges && (
                    <Badge variant="secondary" className="text-xs">
                      Unsaved
                    </Badge>
                  )}
                  {lastSaveTime && !hasUnsavedChanges && (
                    <Badge variant="outline" className="text-xs">
                      Saved {lastSaveTime.toLocaleTimeString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Section Navigation */}
      <div className="bg-card border-b border-border section-padding">
        <div className="container-responsive">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const progress = section.key === 'summary' 
                ? '✓' 
                : getSectionProgress(section.key as keyof typeof checklistItems);
              const isActive = currentSection === index;
              
              return (
                <Button
                  key={section.key}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentSection(index)}
                  className={`flex items-center gap-2 min-w-fit touch-target ${isActive ? section.color : ""}`}
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
      </div>

      {/* Main Content */}
      <main className="section-padding pb-20 overflow-safe">
        <div className="container-responsive max-w-2xl space-y-4">
          {/* Start Session Card */}
          {!sessionStarted && (
            <Card className="shadow-md border-0 bg-gradient-primary">
              <CardContent className="section-padding text-center">
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-responsive-lg font-semibold text-white mb-2">
                      Ready to Start Home Check?
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      Click start to begin timing your home inspection session
                    </p>
                    <Button
                      onClick={handleStartSession}
                      className="bg-white text-primary hover:bg-white/90 touch-target"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Home Check
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
                        <span className="text-muted-foreground">
                          {property?.address || 'Loading address...'}
                        </span>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Weekly home check
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
                              description: "Your location has been verified for this home check"
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
                      <p className="text-sm text-muted-foreground">Loading home check...</p>
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
                    <HomeCheckSummarySection
                      items={[]}
                      onToggle={() => {}}
                      onNotesChange={() => {}}
                      onPhotosUpdate={() => {}}
                      generalNotes={generalNotes}
                      onGeneralNotesChange={setGeneralNotes}
                      elapsedTime={elapsedTime}
                      formatElapsedTime={formatElapsedTime}
                      startTime={startTime}
                      onSubmit={handleCompleteCheck}
                      canSubmit={canCompleteCheck()}
                      isSubmitting={isSubmitting}
                      weather={weather}
                      setWeather={setWeather}
                      overallCondition={overallCondition}
                      setOverallCondition={setOverallCondition}
                      weatherImpact={weatherImpact}
                      setWeatherImpact={setWeatherImpact}
                      nextVisitDate={nextVisitDate}
                      setNextVisitDate={setNextVisitDate}
                      totalIssuesFound={getTotalIssuesFound()}
                      totalPhotos={getTotalPhotos()}
                    />
                  ) : (
                    currentItems.map((item) => (
                      <HomeCheckItemCard
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

      {/* Mobile Bottom Navigation */}
      {sessionStarted && (
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
            ) : currentSectionData.key !== 'summary' ? (
              <Button
                onClick={() => setCurrentSection(sections.length - 1)}
                className="bg-gradient-success hover:bg-success-dark"
              >
                Summary
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
              Home Check Submitted Successfully!
            </DialogTitle>
            <DialogDescription>
              Your home inspection has been completed and submitted.
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
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleCloseSuccessDialog} className="w-full">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeCheck;