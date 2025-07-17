import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PropertyCheckItem {
  id: number;
  item: string;
  completed: boolean;
  photos: string[];
  notes: string;
  required: boolean;
}

interface PropertyCheckData {
  exterior: PropertyCheckItem[];
  interior: PropertyCheckItem[];
  security: PropertyCheckItem[];
  utilities: PropertyCheckItem[];
  summary: PropertyCheckItem[];
}

export const usePropertyCheck = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // The ID in the URL could be either a property_id or session_id
  // We'll determine which one it is by checking if it's a valid session
  const urlId = id;

  // Session tracking state
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Loading and saving states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [checklistItems, setChecklistItems] = useState<PropertyCheckData>({
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
    ],
    summary: [
      { id: 23, item: "Overall property condition", completed: false, photos: [], notes: "", required: false },
      { id: 24, item: "General visit notes", completed: false, photos: [], notes: "", required: false },
      { id: 25, item: "Recommendations or concerns", completed: false, photos: [], notes: "", required: false },
    ]
  });

  // Timer effect to update elapsed time
  useEffect(() => {
    if (sessionStarted && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionStarted, startTime]);

  // Clean up timers on unmount and auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        // Perform immediate save
        savePropertyCheckData(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save on unmount if there are unsaved changes
      if (hasUnsavedChanges) {
        savePropertyCheckData(false);
      }
    };
  }, [hasUnsavedChanges]);

  // Load existing check data if available
  useEffect(() => {
    if (urlId && user) {
      loadPropertyCheckData();
    }
  }, [urlId, user]);

  // Recovery function to restore from localStorage
  const recoverFromLocalStorage = useCallback(() => {
    if (!propertyId && !urlId) return false;
    
    const currentPropertyId = propertyId || urlId;
    
    try {
      const savedData = localStorage.getItem(`property-check-${currentPropertyId}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Check if we have the new format with metadata
        if (parsed.checklistItems && parsed.lastSaveTime) {
          setChecklistItems(parsed.checklistItems);
          setLastSaveTime(new Date(parsed.lastSaveTime));
          
          toast({
            title: "Progress recovered",
            description: `Restored from ${new Date(parsed.lastSaveTime).toLocaleTimeString()}`,
            variant: "default"
          });
          
          return true;
        } else if (parsed.exterior || parsed.interior) {
          // Legacy format
          setChecklistItems(parsed);
          return true;
        }
      }
    } catch (error) {
      console.error('Error recovering from localStorage:', error);
    }
    
    return false;
  }, [propertyId, urlId, toast]);

  const savePropertyCheckData = useCallback(async (showToast = false) => {
    const currentPropertyId = propertyId || urlId;
    if (!currentPropertyId) return;
    
    setIsSaving(true);
    const saveData = {
      checklistItems,
      lastSaveTime: new Date().toISOString(),
      sessionId,
      propertyId: currentPropertyId
    };

    try {
      // Always save to localStorage first (immediate backup)
      localStorage.setItem(`property-check-${currentPropertyId}`, JSON.stringify(saveData));
      
      // Save to database if session is active
      if (sessionStarted && sessionId) {
        const { error } = await supabase
          .from('property_check_sessions')
          .update({
            checklist_data: checklistItems as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);

        if (error) throw error;
      }
      
      setLastSaveTime(new Date());
      setHasUnsavedChanges(false);
      
      if (showToast) {
        toast({
          title: "Progress saved",
          description: "Your property check progress has been saved"
        });
      }
    } catch (error: any) {
      console.error('Error saving to database:', error);
      
      // Even if database save fails, localStorage save succeeded
      setLastSaveTime(new Date());
      setHasUnsavedChanges(false);
      
      if (showToast) {
        toast({
          title: "Saved locally",
          description: "Progress saved locally. Will sync when connection is restored.",
          variant: "default"
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [checklistItems, propertyId, urlId, sessionId, sessionStarted, toast]);

  // Debounced auto-save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      savePropertyCheckData(false);
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [savePropertyCheckData]);

  const loadPropertyCheckData = async () => {
    if (!urlId || !user) return;
    
    setIsLoading(true);
    let sessionData = null;
    let existingSession = null;
    
    try {
      // First, try to load by session ID (if urlId is a session ID)
      const { data: sessionResult, error: sessionError } = await supabase
        .from('property_check_sessions')
        .select('*')
        .eq('id', urlId)
        .single();

      if (sessionResult && !sessionError) {
        // urlId is a session ID
        sessionData = sessionResult;
        setSessionId(sessionData.id);
        setPropertyId(sessionData.property_id);
        setSessionStarted(true);
        setStartTime(new Date(sessionData.started_at));
        
        if (sessionData.checklist_data) {
          setChecklistItems(sessionData.checklist_data as any);
        }
      } else {
        // urlId might be a property ID, check for existing session
        const { data: existingResult, error: existingSessionError } = await supabase
          .from('property_check_sessions')
          .select('*')
          .eq('property_id', urlId)
          .eq('user_id', user.id)
          .eq('status', 'in_progress')
          .single();

        if (existingResult && !existingSessionError) {
          // Found existing session for this property
          existingSession = existingResult;
          setSessionId(existingSession.id);
          setPropertyId(existingSession.property_id);
          setSessionStarted(true);
          setStartTime(new Date(existingSession.started_at));
          
          if (existingSession.checklist_data) {
            setChecklistItems(existingSession.checklist_data as any);
          }
        } else {
          // No existing session, this is a new property check
          setPropertyId(urlId);
        }
      }

      // Try to recover from localStorage if no database data
      if (!sessionData && !existingSession) {
        const recovered = recoverFromLocalStorage();
        
        // If we couldn't recover from localStorage and have no session data, that's ok - we'll start fresh
        if (!recovered) {
          console.log("Starting fresh property check");
        }
      }
    } catch (error) {
      console.error('Error loading property check data:', error);
      
      // Try to recover from localStorage as last resort
      const recovered = recoverFromLocalStorage();
      if (!recovered) {
        toast({
          title: "Failed to load",
          description: "Could not load property check data. Starting fresh.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    if (!user || !propertyId) return;

    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('property_check_sessions')
        .insert({
          user_id: user.id,
          property_id: propertyId,
          started_at: now.toISOString(),
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;

      // Track the start activity
      await supabase
        .from('property_check_activities')
        .insert({
          session_id: data.id,
          activity_type: 'started',
          activity_data: {
            property_id: propertyId,
            started_at: now.toISOString()
          },
          user_id: user.id
        });

      setSessionId(data.id);
      setSessionStarted(true);
      setStartTime(now);
      setElapsedTime(0);

      toast({
        title: "Property check started",
        description: "Timer is now running. Complete your inspection and submit when finished."
      });
    } catch (error: any) {
      console.error('Error starting session:', error);
      toast({
        title: "Failed to start session",
        description: error.message || "Could not start the property check session",
        variant: "destructive"
      });
    }
  };

  const submitSession = async (generalNotes: string) => {
    if (!sessionId || !user) return false;

    setIsSubmitting(true);
    try {
      const completedAt = new Date();
      const durationMinutes = Math.floor(elapsedTime / 60);

      const { error } = await supabase
        .from('property_check_sessions')
        .update({
          completed_at: completedAt.toISOString(),
          duration_minutes: durationMinutes,
          checklist_data: checklistItems as any,
          general_notes: generalNotes,
          status: 'completed'
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Track the submission activity
      await supabase
        .from('property_check_activities')
        .insert({
          session_id: sessionId,
          activity_type: 'submitted',
          activity_data: {
            general_notes: generalNotes,
            duration_minutes: durationMinutes,
            total_items: Object.values(checklistItems).flat().length,
            completed_items: Object.values(checklistItems).flat().filter(item => item.completed).length,
            completed_at: completedAt.toISOString()
          },
          user_id: user.id
        });

      // Clear local state and localStorage
      setSessionStarted(false);
      setStartTime(null);
      setElapsedTime(0);
      setHasUnsavedChanges(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Clear localStorage data for this property
      if (propertyId) {
        localStorage.removeItem(`property-check-${propertyId}`);
      }

      toast({
        title: "Property check completed",
        description: `Session completed in ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      });

      return true;
    } catch (error: any) {
      console.error('Error submitting session:', error);
      toast({
        title: "Failed to submit",
        description: error.message || "Could not submit the property check",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleItemToggle = (itemId: number, sectionKey: keyof PropertyCheckData) => {
    setChecklistItems(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
    
    setHasUnsavedChanges(true);
    debouncedSave();
  };

  const handleNotesChange = (itemId: number, notes: string, sectionKey: keyof PropertyCheckData) => {
    setChecklistItems(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => 
        item.id === itemId ? { ...item, notes } : item
      )
    }));
    
    setHasUnsavedChanges(true);
    debouncedSave();
  };

  const handlePhotosUpdate = (itemId: number, photos: string[], sectionKey: keyof PropertyCheckData) => {
    setChecklistItems(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => 
        item.id === itemId ? { ...item, photos } : item
      )
    }));
    
    setHasUnsavedChanges(true);
    debouncedSave();
  };

  const getSectionProgress = (sectionKey: keyof PropertyCheckData) => {
    const items = checklistItems[sectionKey];
    const completed = items.filter(item => item.completed).length;
    return `${completed}/${items.length}`;
  };

  const getOverallProgress = () => {
    const allItems = Object.values(checklistItems).flat();
    const completed = allItems.filter(item => item.completed).length;
    return Math.round((completed / allItems.length) * 100);
  };

  const getRequiredItemsProgress = () => {
    const requiredItems = Object.values(checklistItems).flat().filter(item => item.required);
    const completedRequired = requiredItems.filter(item => item.completed).length;
    return {
      completed: completedRequired,
      total: requiredItems.length,
      percentage: Math.round((completedRequired / requiredItems.length) * 100)
    };
  };

  const canCompleteCheck = () => {
    const requiredProgress = getRequiredItemsProgress();
    return requiredProgress.completed === requiredProgress.total;
  };

  return {
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
    savePropertyCheckData: () => savePropertyCheckData(true),
    recoverFromLocalStorage,
    startSession,
    submitSession,
    formatElapsedTime
  };
};