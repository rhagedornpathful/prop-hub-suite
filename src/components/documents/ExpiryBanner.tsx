import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { differenceInDays, format } from "date-fns";

interface ExpiryBannerProps {
  documents: Array<{
    id: string;
    file_name: string;
    expiry_date?: string | null;
  }>;
}

export function ExpiryBanner({ documents }: ExpiryBannerProps) {
  const today = new Date();
  const expiringDocs = documents.filter((doc) => {
    if (!doc.expiry_date) return false;
    const expiryDate = new Date(doc.expiry_date);
    const daysUntilExpiry = differenceInDays(expiryDate, today);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  });

  const expiredDocs = documents.filter((doc) => {
    if (!doc.expiry_date) return false;
    const expiryDate = new Date(doc.expiry_date);
    return expiryDate < today;
  });

  if (expiringDocs.length === 0 && expiredDocs.length === 0) return null;

  return (
    <div className="space-y-3">
      {expiredDocs.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Expired Documents</AlertTitle>
          <AlertDescription>
            {expiredDocs.length} document{expiredDocs.length !== 1 ? "s have" : " has"}{" "}
            expired:
            <ul className="mt-2 list-disc list-inside">
              {expiredDocs.slice(0, 3).map((doc) => (
                <li key={doc.id} className="text-sm">
                  {doc.file_name} - Expired{" "}
                  {format(new Date(doc.expiry_date!), "MMM d, yyyy")}
                </li>
              ))}
              {expiredDocs.length > 3 && (
                <li className="text-sm">
                  And {expiredDocs.length - 3} more...
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {expiringDocs.length > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Expiring Soon</AlertTitle>
          <AlertDescription>
            {expiringDocs.length} document{expiringDocs.length !== 1 ? "s" : ""}{" "}
            expiring within 30 days:
            <ul className="mt-2 list-disc list-inside">
              {expiringDocs.slice(0, 3).map((doc) => {
                const daysLeft = differenceInDays(
                  new Date(doc.expiry_date!),
                  today
                );
                return (
                  <li key={doc.id} className="text-sm">
                    {doc.file_name} - {daysLeft} day{daysLeft !== 1 ? "s" : ""}{" "}
                    left
                  </li>
                );
              })}
              {expiringDocs.length > 3 && (
                <li className="text-sm">
                  And {expiringDocs.length - 3} more...
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
