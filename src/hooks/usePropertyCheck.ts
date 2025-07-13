import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
  
  // Use demo ID if no ID provided (for testing purposes)
  const propertyId = id || 'demo-property-123';
  
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

  // Load existing check data if available
  useEffect(() => {
    if (propertyId) {
      loadPropertyCheckData();
    }
  }, [propertyId]);

  const loadPropertyCheckData = async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    try {
      // This would load from your database - for now using localStorage
      const savedData = localStorage.getItem(`property-check-${propertyId}`);
      if (savedData) {
        setChecklistItems(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading property check data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePropertyCheckData = async () => {
    if (!propertyId) return;
    
    setIsSaving(true);
    try {
      // Save to localStorage for now - you can enhance this to save to Supabase
      localStorage.setItem(`property-check-${propertyId}`, JSON.stringify(checklistItems));
      
      toast({
        title: "Progress saved",
        description: "Your property check progress has been saved"
      });
    } catch (error: any) {
      console.error('Error saving property check data:', error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save progress",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
    handleItemToggle,
    handleNotesChange,
    handlePhotosUpdate,
    getSectionProgress,
    getOverallProgress,
    getRequiredItemsProgress,
    canCompleteCheck,
    savePropertyCheckData
  };
};