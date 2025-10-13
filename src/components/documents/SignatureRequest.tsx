import { useState } from "react";
import { FileSignature, Send, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";

interface SignatureRequestProps {
  documentId: string;
  documentName: string;
  onSignatureRequested: () => void;
}

export function SignatureRequest({
  documentId,
  documentName,
  onSignatureRequested,
}: SignatureRequestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [expiryDays, setExpiryDays] = useState(7);
  const [isSending, setIsSending] = useState(false);
  const [signatures, setSignatures] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchSignatures = async () => {
    try {
      const { data, error } = await supabase
        .from("document_signatures")
        .select("*")
        .eq("document_id", documentId)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setSignatures(data || []);
    } catch (error) {
      console.error("Failed to fetch signatures:", error);
    }
  };

  const handleRequestSignature = async () => {
    if (!signerName.trim() || !signerEmail.trim()) {
      toast({
        title: "Error",
        description: "Please provide signer name and email",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const expiresAt = addDays(new Date(), expiryDays);

      const { error } = await supabase.from("document_signatures").insert({
        document_id: documentId,
        signer_email: signerEmail.trim(),
        signer_name: signerName.trim(),
        requested_by: userData.user.id,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      });

      if (error) throw error;

      // Log activity
      await supabase.from("document_activities").insert({
        document_id: documentId,
        user_id: userData.user.id,
        activity_type: "signature_requested",
        details: { signer_email: signerEmail, signer_name: signerName },
      });

      toast({
        title: "Success",
        description: `Signature request sent to ${signerName}`,
      });

      setSignerName("");
      setSignerEmail("");
      setIsOpen(false);
      onSignatureRequested();
      fetchSignatures();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send signature request",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "declined":
        return <X className="w-4 h-4 text-red-500" />;
      case "expired":
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      signed: "default",
      declined: "destructive",
      expired: "secondary",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={fetchSignatures}>
        <Button variant="outline" size="sm">
          <FileSignature className="w-4 h-4 mr-2" />
          Request Signature
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>E-Signature Request - {documentName}</DialogTitle>
          <DialogDescription>
            Request someone to electronically sign this document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="signer-name">Signer Name</Label>
              <Input
                id="signer-name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter signer's full name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="signer-email">Signer Email</Label>
              <Input
                id="signer-email"
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="Enter signer's email address"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="expiry-days">Request Expires In (days)</Label>
              <Input
                id="expiry-days"
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
                min={1}
                max={90}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleRequestSignature}
              disabled={isSending}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Sending..." : "Send Signature Request"}
            </Button>
          </div>

          {signatures.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Signature Requests</h4>
              <div className="space-y-3">
                {signatures.map((signature) => (
                  <div
                    key={signature.id}
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(signature.status)}
                      <div>
                        <p className="font-medium">{signature.signer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {signature.signer_email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Requested:{" "}
                          {format(new Date(signature.requested_at), "PPp")}
                        </p>
                        {signature.signed_at && (
                          <p className="text-xs text-green-600 mt-1">
                            Signed:{" "}
                            {format(new Date(signature.signed_at), "PPp")}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(signature.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
