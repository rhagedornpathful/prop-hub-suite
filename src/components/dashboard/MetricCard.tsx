import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  link?: string;
}

export function MetricCard({ title, value, description, icon: Icon, iconColor = "text-primary", link }: MetricCardProps) {
  const content = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </>
  );

  if (link) {
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <Link to={link}>{content}</Link>
      </Card>
    );
  }

  return <Card>{content}</Card>;
}
