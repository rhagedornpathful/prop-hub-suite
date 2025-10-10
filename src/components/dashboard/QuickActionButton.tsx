import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  link: string;
}

export function QuickActionButton({ label, icon: Icon, link }: QuickActionButtonProps) {
  return (
    <Link to={link}>
      <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
        <Icon className="h-6 w-6" />
        <span className="text-sm">{label}</span>
      </Button>
    </Link>
  );
}
