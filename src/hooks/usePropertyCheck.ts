import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  
  // Use demo ID if no ID provided (for testing purposes)
  const propertyId = id || 'demo-property-123';

  // Session tracking state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // Load existing check data if available
  useEffect(() => {
    if (propertyId && user) {
      loadPropertyCheckData();
    }
  }, [propertyId, user]);

  const loadPropertyCheckData = async () => {
    if (!propertyId || !user) return;
    
    setIsLoading(true);
    try {
      // Check for existing session first
      const { data: existingSession, error: sessionError } = await supabase
        .from('property_check_sessions')
        .select('*')
        .eq('property_id', propertyId)
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .single();

      if (existingSession && !sessionError) {
        // Load existing session
        setSessionId(existingSession.id);
        setSessionStarted(true);
        setStartTime(new Date(existingSession.started_at));
        
        if (existingSession.checklist_data) {
          setChecklistItems(existingSession.checklist_data as any);
        }
      }

      // Also check localStorage for backup
      const savedData = localStorage.getItem(`property-check-${propertyId}`);
      if (savedData && !existingSession) {
        setChecklistItems(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading property check data:', error);
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
    if (!sessionId || !user) return;

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

      // Clear local state
      setSessionStarted(false);
      setStartTime(null);
      setElapsedTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
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

  const savePropertyCheckData = async () => {
    if (!propertyId || !sessionId) return;
    
    setIsSaving(true);
    try {
      // Save to database if session is active
      if (sessionStarted) {
        await supabase
          .from('property_check_sessions')
          .update({
            checklist_data: checklistItems as any
          })
          .eq('id', sessionId);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem(`property-check-${propertyId}`, JSON.stringify(checklistItems));
      
      toast({
        title: "Progress saved",
        description: "Your property check progress has been saved"
      });
    } catch (error: any) {
      console.error('Error saving property check data:', error);
      // Save to localStorage as fallback
      localStorage.setItem(`property-check-${propertyId}`, JSON.stringify(checklistItems));
    } finally {
      setIsSaving(false);
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
    
    // Auto-save after changes
    setTimeout(savePropertyCheckData, 1000);
  };

  const handleNotesChange = (itemId: number, notes: string, sectionKey: keyof PropertyCheckData) => {
    setChecklistItems(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => 
        item.id === itemId ? { ...item, notes } : item
      )
    }));
    
    // Auto-save after changes (debounced)
    setTimeout(savePropertyCheckData, 2000);
  };

  const handlePhotosUpdate = (itemId: number, photos: string[], sectionKey: keyof PropertyCheckData) => {
    setChecklistItems(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => 
        item.id === itemId ? { ...item, photos } : item
      )
    }));
    
    // Auto-save after photo changes
    setTimeout(savePropertyCheckData, 1000);
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
    handleItemToggle,
    handleNotesChange,
    handlePhotosUpdate,
    getSectionProgress,
    getOverallProgress,
    getRequiredItemsProgress,
    canCompleteCheck,
    savePropertyCheckData,
    startSession,
    submitSession,
    formatElapsedTime
  };
};