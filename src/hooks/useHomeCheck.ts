import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HomeCheckItem {
  id: number;
  item: string;
  completed: boolean;
  photos: string[];
  notes: string;
  required: boolean;
  category: 'exterior' | 'entry_security' | 'interior' | 'final_steps';
  issuesFound?: boolean;
}

interface HomeCheckData {
  exterior: HomeCheckItem[];
  entry_security: HomeCheckItem[];
  interior: HomeCheckItem[];
  final_steps: HomeCheckItem[];
}

const DEFAULT_CHECKLIST_DATA: HomeCheckData = {
  exterior: [
    { id: 1, item: "Take photo of front of house upon arrival", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
    { id: 2, item: "Walk around front of property, check doors/windows secure", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
    { id: 3, item: "Complete perimeter walk, check all exterior access points", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
    { id: 4, item: "Look up at roof, gutters, downspouts from ground level", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
    { id: 5, item: "Test front porch light and any motion sensors", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
    { id: 6, item: "Collect mail, packages, newspapers, flyers", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
    { id: 7, item: "Note condition of lawn, plants, sprinklers", completed: false, photos: [], notes: "", required: false, category: 'exterior' },
    { id: 8, item: "Check trash collection status, move bins if needed", completed: false, photos: [], notes: "", required: false, category: 'exterior' }
  ],
  entry_security: [
    { id: 9, item: "Unlock and enter property, handle alarm system", completed: false, photos: [], notes: "", required: true, category: 'entry_security' },
    { id: 10, item: "Quick walk-through to check for obvious issues", completed: false, photos: [], notes: "", required: true, category: 'entry_security' },
    { id: 11, item: "Verify all windows/doors show secure on alarm panel", completed: false, photos: [], notes: "", required: true, category: 'entry_security' }
  ],
  interior: [
    { id: 12, item: "Check main living room, family room, dining room", completed: false, photos: [], notes: "", required: true, category: 'interior' },
    { id: 13, item: "Run water at sink, check appliances, look for leaks", completed: false, photos: [], notes: "", required: true, category: 'interior' },
    { id: 14, item: "Run water at all sinks, flush toilets, check for leaks", completed: false, photos: [], notes: "", required: true, category: 'interior' },
    { id: 15, item: "Enter all bedrooms, check windows, general condition", completed: false, photos: [], notes: "", required: true, category: 'interior' },
    { id: 16, item: "Check basement, utility room, water heater, HVAC", completed: false, photos: [], notes: "", required: true, category: 'interior' },
    { id: 17, item: "Test 3-4 light switches, check smoke detector lights", completed: false, photos: [], notes: "", required: true, category: 'interior' },
    { id: 18, item: "Check thermostat, note temperature, adjust if needed", completed: false, photos: [], notes: "", required: true, category: 'interior' },
    { id: 19, item: "Water plants per owner instructions", completed: false, photos: [], notes: "", required: false, category: 'interior' },
    { id: 20, item: "Open/close different curtains, move items for lived-in look", completed: false, photos: [], notes: "", required: false, category: 'interior' }
  ],
  final_steps: [
    { id: 21, item: "Take one final photo of main living area before leaving", completed: false, photos: [], notes: "", required: true, category: 'final_steps' },
    { id: 22, item: "Turn off unnecessary lights, rearm alarm system", completed: false, photos: [], notes: "", required: true, category: 'final_steps' },
    { id: 23, item: "Ensure all doors locked, test locks from outside", completed: false, photos: [], notes: "", required: true, category: 'final_steps' },
    { id: 24, item: "Take final exterior photo showing property secured", completed: false, photos: [], notes: "", required: true, category: 'final_steps' }
  ]
};

export const useHomeCheck = (propertyId?: string) => {
  const [checklistItems, setChecklistItems] = useState<HomeCheckData>(DEFAULT_CHECKLIST_DATA);
  const [weather, setWeather] = useState<string>('');
  const [overallCondition, setOverallCondition] = useState<string>('');
  const [weatherImpact, setWeatherImpact] = useState<string>('');
  const [nextVisitDate, setNextVisitDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { toast } = useToast();

  // Initialize checklist from database
  useEffect(() => {
    initializeChecklist();
  }, []);

  const initializeChecklist = async () => {
    try {
      // Fallback to default hardcoded data until types are ready
      const fallbackData: HomeCheckData = {
        exterior: [
          { id: 1, item: "Take photo of front of house upon arrival", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
          { id: 2, item: "Walk around front of property, check doors/windows secure", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
          { id: 3, item: "Complete perimeter walk, check all exterior access points", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
          { id: 4, item: "Look up at roof, gutters, downspouts from ground level", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
          { id: 5, item: "Test front porch light and any motion sensors", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
          { id: 6, item: "Collect mail, packages, newspapers, flyers", completed: false, photos: [], notes: "", required: true, category: 'exterior' },
          { id: 7, item: "Note condition of lawn, plants, sprinklers", completed: false, photos: [], notes: "", required: false, category: 'exterior' },
          { id: 8, item: "Check trash collection status, move bins if needed", completed: false, photos: [], notes: "", required: false, category: 'exterior' }
        ],
        entry_security: [
          { id: 9, item: "Unlock and enter property, handle alarm system", completed: false, photos: [], notes: "", required: true, category: 'entry_security' },
          { id: 10, item: "Quick walk-through to check for obvious issues", completed: false, photos: [], notes: "", required: true, category: 'entry_security' },
          { id: 11, item: "Verify all windows/doors show secure on alarm panel", completed: false, photos: [], notes: "", required: true, category: 'entry_security' }
        ],
        interior: [
          { id: 12, item: "Check main living room, family room, dining room", completed: false, photos: [], notes: "", required: true, category: 'interior' },
          { id: 13, item: "Run water at sink, check appliances, look for leaks", completed: false, photos: [], notes: "", required: true, category: 'interior' },
          { id: 14, item: "Run water at all sinks, flush toilets, check for leaks", completed: false, photos: [], notes: "", required: true, category: 'interior' },
          { id: 15, item: "Enter all bedrooms, check windows, general condition", completed: false, photos: [], notes: "", required: true, category: 'interior' },
          { id: 16, item: "Check basement, utility room, water heater, HVAC", completed: false, photos: [], notes: "", required: true, category: 'interior' },
          { id: 17, item: "Test 3-4 light switches, check smoke detector lights", completed: false, photos: [], notes: "", required: true, category: 'interior' },
          { id: 18, item: "Check thermostat, note temperature, adjust if needed", completed: false, photos: [], notes: "", required: true, category: 'interior' },
          { id: 19, item: "Water plants per owner instructions", completed: false, photos: [], notes: "", required: false, category: 'interior' },
          { id: 20, item: "Open/close different curtains, move items for lived-in look", completed: false, photos: [], notes: "", required: false, category: 'interior' }
        ],
        final_steps: [
          { id: 21, item: "Take one final photo of main living area before leaving", completed: false, photos: [], notes: "", required: true, category: 'final_steps' },
          { id: 22, item: "Turn off unnecessary lights, rearm alarm system", completed: false, photos: [], notes: "", required: true, category: 'final_steps' },
          { id: 23, item: "Ensure all doors locked, test locks from outside", completed: false, photos: [], notes: "", required: true, category: 'final_steps' },
          { id: 24, item: "Take final exterior photo showing property secured", completed: false, photos: [], notes: "", required: true, category: 'final_steps' }
        ]
      };
      setChecklistItems(fallbackData);
    } catch (error) {
      console.error('Error initializing checklist:', error);
      setChecklistItems(DEFAULT_CHECKLIST_DATA);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStarted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionStarted, startTime]);

  // Helper function to log activities
  const logActivity = useCallback(async (activityType: string, activityData: any) => {
    if (!sessionId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('home_check_activities')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData
        });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't show error to user as this is background logging
    }
  }, [sessionId]);

  const handleItemToggle = useCallback((itemId: number, section: keyof HomeCheckData) => {
    const item = checklistItems[section].find(item => item.id === itemId);
    const wasCompleted = item?.completed || false;
    
    setChecklistItems(prev => ({
      ...prev,
      [section]: prev[section].map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
    setHasUnsavedChanges(true);

    // Log activity to database
    logActivity('item_toggle', {
      itemId,
      section,
      completed: !wasCompleted,
      itemName: item?.item
    });
  }, [checklistItems, logActivity]);

  const handleNotesChange = useCallback((itemId: number, notes: string, section: keyof HomeCheckData) => {
    setChecklistItems(prev => ({
      ...prev,
      [section]: prev[section].map(item => 
        item.id === itemId ? { ...item, notes, issuesFound: notes.toLowerCase().includes('issue') } : item
      )
    }));
    setHasUnsavedChanges(true);

    // Log activity to database
    logActivity('notes_update', {
      itemId,
      section,
      notesLength: notes.length,
      hasIssues: notes.toLowerCase().includes('issue')
    });
  }, [logActivity]);

  const handlePhotosUpdate = useCallback((itemId: number, photos: string[], section: keyof HomeCheckData) => {
    setChecklistItems(prev => ({
      ...prev,
      [section]: prev[section].map(item => 
        item.id === itemId ? { ...item, photos } : item
      )
    }));
    setHasUnsavedChanges(true);

    // Log activity to database
    logActivity('photos_update', {
      itemId,
      section,
      photoCount: photos.length
    });
  }, [logActivity]);

  const getSectionProgress = useCallback((section: keyof HomeCheckData): string => {
    const items = checklistItems[section];
    const completed = items.filter(item => item.completed).length;
    return `${completed}/${items.length}`;
  }, [checklistItems]);

  const getOverallProgress = useCallback((): number => {
    const allItems = Object.values(checklistItems).flat();
    const completed = allItems.filter(item => item.completed).length;
    return Math.round((completed / allItems.length) * 100);
  }, [checklistItems]);

  const getRequiredItemsProgress = useCallback(() => {
    const allItems = Object.values(checklistItems).flat();
    const required = allItems.filter(item => item.required);
    const completedRequired = required.filter(item => item.completed);
    return { completed: completedRequired.length, total: required.length };
  }, [checklistItems]);

  const getTotalIssuesFound = useCallback((): number => {
    const allItems = Object.values(checklistItems).flat();
    return allItems.filter(item => 
      item.issuesFound || (item.notes && item.notes.toLowerCase().includes('issue'))
    ).length;
  }, [checklistItems]);

  const getTotalPhotos = useCallback((): number => {
    const allItems = Object.values(checklistItems).flat();
    return allItems.reduce((total, item) => total + item.photos.length, 0);
  }, [checklistItems]);

  const canCompleteCheck = useCallback((): boolean => {
    const requiredProgress = getRequiredItemsProgress();
    return requiredProgress.completed === requiredProgress.total;
  }, [getRequiredItemsProgress]);

  const formatElapsedTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const saveHomeCheckData = useCallback(async () => {
    if (!sessionId) return false;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('home_check_sessions')
        .update({
          checklist_data: checklistItems as any,
          weather,
          overall_condition: overallCondition,
          weather_impact: weatherImpact,
          next_visit_date: nextVisitDate?.toISOString().split('T')[0],
          total_issues_found: getTotalIssuesFound(),
          photos_taken: getTotalPhotos(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
      
      setLastSaveTime(new Date());
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Error saving home check data:', error);
      toast({
        title: "Save failed",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, checklistItems, weather, overallCondition, weatherImpact, nextVisitDate, getTotalIssuesFound, getTotalPhotos, toast]);

  const startSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('home_check_sessions')
        .insert({
          user_id: user.id,
          property_id: propertyId || 'temp-property-id',
          status: 'in_progress',
          checklist_data: checklistItems as any,
          weather,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setSessionStarted(true);
      setStartTime(new Date());
      setElapsedTime(0);
      
      toast({
        title: "Home check started",
        description: "Your home inspection session has begun"
      });
      
      return true;
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Failed to start session",
        description: "Please try again",
        variant: "destructive"
      });
      return false;
    }
  }, [checklistItems, weather, toast]);

  const submitSession = useCallback(async (generalNotes: string): Promise<boolean> => {
    if (!sessionId || !startTime) return false;
    
    setIsSubmitting(true);
    try {
      const completedAt = new Date();
      const durationMinutes = Math.floor((completedAt.getTime() - startTime.getTime()) / 60000);

      const { error } = await supabase
        .from('home_check_sessions')
        .update({
          status: 'completed',
          completed_at: completedAt.toISOString(),
          duration_minutes: durationMinutes,
          general_notes: generalNotes,
          checklist_data: checklistItems as any,
          weather,
          overall_condition: overallCondition,
          weather_impact: weatherImpact,
          next_visit_date: nextVisitDate?.toISOString().split('T')[0],
          total_issues_found: getTotalIssuesFound(),
          photos_taken: getTotalPhotos()
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Home check completed",
        description: `Session completed in ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      });

      return true;
    } catch (error) {
      console.error('Error submitting session:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit home check. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, startTime, checklistItems, weather, overallCondition, weatherImpact, nextVisitDate, getTotalIssuesFound, getTotalPhotos, toast]);

  // Auto-save every 30 seconds when changes are made
  useEffect(() => {
    if (hasUnsavedChanges && sessionId) {
      const autoSaveTimer = setTimeout(() => {
        saveHomeCheckData();
      }, 30000); // 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, sessionId, saveHomeCheckData]);

  return {
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
  };
};