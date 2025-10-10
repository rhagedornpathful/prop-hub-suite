import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface AlertCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: "destructive" | "warning" | "primary";
  link: string;
  linkText: string;
}

const variantStyles = {
  destructive: {
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    text: "text-destructive",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/20",
    text: "text-warning",
  },
  primary: {
    bg: "bg-primary/10",
    border: "border-primary/20",
    text: "text-primary",
  },
};

export function AlertCard({ title, value, icon: Icon, variant, link, linkText }: AlertCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`p-4 ${styles.bg} rounded-lg border ${styles.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${styles.text}`} />
        <span className={`font-medium ${styles.text}`}>{title}</span>
      </div>
      <p className={`text-2xl font-bold ${styles.text}`}>{value}</p>
      <Link to={link} className={`text-sm ${styles.text} hover:underline`}>
        {linkText}
      </Link>
    </div>
  );
}
