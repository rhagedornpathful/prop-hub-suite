import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  MapPin,
  Camera,
  FileText,
  Download,
  AlertCircle
} from "lucide-react";
import type { Tables } from '@/integrations/supabase/types';

interface PropertyCheckItem {
  id: number;
  item: string;
  completed: boolean;
  photos: string[];
  notes: string;
  required: boolean;
}

interface PropertyCheckDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkSessionId: string;
}

export function PropertyCheckDetailsDialog({ 
  open, 
  onOpenChange, 
  checkSessionId 
}: PropertyCheckDetailsDialogProps) {
  const [checkSession, setCheckSession] = useState<Tables<'property_check_sessions'> | null>(null);
  const [property, setProperty] = useState<Tables<'properties'> | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [checklistItems, setChecklistItems] = useState<PropertyCheckItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && checkSessionId) {
      fetchCheckDetails();
    }
  }, [open, checkSessionId]);

  const fetchCheckDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch property check session
      const { data: sessionData, error: sessionError } = await supabase
        .from('property_check_sessions')
        .select('*')
        .eq('id', checkSessionId)
        .single();

      if (sessionError) throw sessionError;
      setCheckSession(sessionData);

      // Fetch property details
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', sessionData.property_id)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', sessionData.user_id)
        .single();

      if (profileError) {
        console.warn('Could not fetch user profile:', profileError);
        setUserProfile(null);
      } else {
        setUserProfile(profileData);
      }

      // Parse checklist data
      if (sessionData.checklist_data) {
        try {
          const parsedData = Array.isArray(sessionData.checklist_data) 
            ? sessionData.checklist_data 
            : JSON.parse(sessionData.checklist_data as string);
          setChecklistItems(parsedData);
        } catch (parseError) {
          console.error('Error parsing checklist data:', parseError);
          setChecklistItems([]);
        }
      } else {
        setChecklistItems([]);
      }

    } catch (err) {
      console.error('Error fetching check details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch check details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const generateReport = () => {
    if (!checkSession || !property) return;

    const reportData = {
      property: property.address,
      date: new Date(checkSession.created_at).toLocaleDateString(),
      time: checkSession.started_at ? new Date(checkSession.started_at).toLocaleTimeString() : 'N/A',
      duration: formatDuration(checkSession.duration_minutes),
      status: checkSession.status,
      inspector: userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Unknown',
      items: checklistItems,
      generalNotes: checkSession.general_notes || 'No general notes provided',
      locationVerified: checkSession.location_verified
    };

    const reportContent = `
PROPERTY CHECK REPORT
====================

Property: ${reportData.property}
Date: ${reportData.date}
Time: ${reportData.time}
Duration: ${reportData.duration}
Status: ${reportData.status}
Inspector: ${reportData.inspector}
Location Verified: ${reportData.locationVerified ? 'Yes' : 'No'}

CHECKLIST ITEMS
===============
${reportData.items.map((item, index) => `
${index + 1}. ${item.item} ${item.required ? '(Required)' : '(Optional)'}
   Status: ${item.completed ? 'COMPLETED ✓' : 'NOT COMPLETED ✗'}
   Notes: ${item.notes || 'No notes'}
   Photos: ${item.photos.length} photo(s)
`).join('')}

GENERAL NOTES
=============
${reportData.generalNotes}

Report generated on ${new Date().toLocaleString()}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property-check-report-${reportData.date.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Property Check Report
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium mb-2">Error loading check details</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        ) : checkSession && property ? (
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 p-1">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Property Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium">{property.address}</p>
                    {property.city && property.state && (
                      <p className="text-sm text-muted-foreground">
                        {property.city}, {property.state} {property.zip_code}
                      </p>
                    )}
                    {property.property_type && (
                      <Badge variant="outline" className="text-xs">
                        {property.property_type.replace('_', ' ')}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Check Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge className={getStatusColor(checkSession.status)}>
                        {checkSession.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(checkSession.created_at).toLocaleDateString()} at {checkSession.started_at ? new Date(checkSession.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3" />
                      <span>{userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Unknown Inspector'}</span>
                    </div>
                    {checkSession.duration_minutes && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>Duration: {formatDuration(checkSession.duration_minutes)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Checklist Items */}
              {checklistItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Checklist Items ({checklistItems.filter(item => item.completed).length}/{checklistItems.length} completed)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {checklistItems.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {item.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{item.item}</h4>
                                {item.required && (
                                  <Badge variant="secondary" className="text-xs">Required</Badge>
                                )}
                                <Badge variant={item.completed ? "default" : "destructive"} className="text-xs">
                                  {item.completed ? "Completed" : "Not Completed"}
                                </Badge>
                              </div>
                              
                              {item.notes && (
                                <p className="text-sm text-muted-foreground mb-2">{item.notes}</p>
                              )}
                              
                              {item.photos.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Camera className="h-3 w-3" />
                                  <span>{item.photos.length} photo(s) taken</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* General Notes */}
              {checkSession.general_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">General Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{checkSession.general_notes}</p>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Location verified: {checkSession.location_verified ? 'Yes' : 'No'}
                </div>
                <Button onClick={generateReport} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}