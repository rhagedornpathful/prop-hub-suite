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
  const { userRole, isAdmin } = useUserRole();

  // Restrict Home Checks to House Watchers and Admins only
  if (!isAdmin() && userRole !== 'house_watcher') {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-4">Home checks are only available to House Watchers and Administrators.</p>
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
    startSession,
    submitSession,
    formatElapsedTime
  } = useHomeCheck(propertyId);

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
      {/* Phone-Optimized Header */}
      <header className="bg-card border-b border-border px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/house-watching')}
              className="min-h-[44px] min-w-[44px] p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground leading-tight">Home Check</h1>
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

      {/* Section Navigation Progress Bar */}
      <div className="bg-card border-b border-border">
        <div className="container-responsive py-8">
          {/* Progress Steps */}
          <div className="relative max-w-4xl mx-auto">
            {/* Progress Line Container */}
            <div className="absolute top-6 left-0 right-0 flex items-center px-6">
              <div className="flex-1 h-0.5 bg-muted"></div>
              <div 
                className="h-0.5 bg-gradient-primary transition-all duration-500 ease-in-out"
                style={{ 
                  width: `${Math.max(0, (currentSection / Math.max(1, sections.length - 1)) * 100)}%`,
                  position: 'absolute',
                  left: '24px',
                  right: '24px'
                }}
              ></div>
            </div>
            
            {/* Steps Container */}
            <div className="relative flex justify-between items-start px-0">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const progress = section.key === 'summary' 
                  ? getOverallProgress() >= 100 ? 100 : getOverallProgress()
                  : parseInt(getSectionProgress(section.key as keyof typeof checklistItems).toString().replace('%', '')) || 0;
                const isActive = currentSection === index;
                const isCompleted = index < currentSection || progress === 100;
                const isAccessible = index <= currentSection || isCompleted;
                
                return (
                  <div key={section.key} className="flex flex-col items-center min-w-0 flex-1">
                    {/* Step Circle */}
                    <button
                      onClick={() => isAccessible && setCurrentSection(index)}
                      disabled={!isAccessible}
                      className={`
                        relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-4 z-10
                        ${isActive 
                          ? 'bg-gradient-primary text-white shadow-lg scale-110 ring-4 ring-primary/20' 
                          : isCompleted 
                            ? 'bg-success text-white shadow-md' 
                            : isAccessible
                              ? 'bg-background border-2 border-muted text-foreground hover:border-primary hover:text-primary hover:shadow-md'
                              : 'bg-muted/50 text-muted-foreground cursor-not-allowed border-2 border-muted/50'
                        }
                        ${isAccessible ? 'cursor-pointer' : ''}
                      `}
                    >
                      {isCompleted && section.key !== 'summary' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </button>
                    
                    {/* Step Label */}
                    <div className="text-center px-2">
                      <h3 className={`text-sm font-semibold mb-2 ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {section.name}
                      </h3>
                      <div className={`
                        inline-flex items-center justify-center text-xs font-medium px-3 py-1 rounded-full min-w-[3rem] 
                        ${isActive 
                          ? 'bg-primary text-white' 
                          : isCompleted 
                            ? 'bg-success text-white'
                            : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {section.key === 'summary' ? (
                          `${Math.round(progress)}%`
                        ) : (
                          `${progress}%`
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Phone-Optimized Main Content */}
      <main className="px-4 py-4 pb-24 overflow-safe">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Start Session Card */}
          {!sessionStarted && (
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-primary p-8 text-center">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Ready to Start Home Check?
                    </h3>
                    <p className="text-white/90 text-base mb-6 max-w-md mx-auto">
                      Click start to begin timing your home inspection session
                    </p>
                    <Button
                      onClick={handleStartSession}
                      size="lg"
                      className="bg-white text-primary hover:bg-white/95 font-semibold px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Play className="h-5 w-5 mr-3" />
                      Start Home Check
                    </Button>
                  </div>
                </div>
              </div>
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