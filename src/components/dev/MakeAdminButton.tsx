import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

export function MakeAdminButton() {
  const [making, setMaking] = useState(false);
  const { userRole, user } = useUserRole();

  const makeAdmin = async () => {
    if (making) return;
    
    setMaking(true);
    
    try {
      const { data, error } = await supabase.rpc('make_me_admin');
      
      if (error) throw error;
      
      // Type assertion for the JSON response
      const result = data as { success: boolean; message: string };
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        
        // Refresh the page to update role state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error('Make admin error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setMaking(false);
    }
  };

  // Only show if user is authenticated but has no role
  if (!user || userRole) {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Crown className="h-5 w-5" />
          Bootstrap Admin Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Development Tool:</strong> You currently have no role assigned. 
            Click the button below to make yourself an admin and gain full system access.
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            This button will disappear once you have admin access.
          </div>
          
          <Button 
            onClick={makeAdmin}
            disabled={making}
            variant="default"
            size="sm"
          >
            {making ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Making Admin...
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Make Me Admin
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}