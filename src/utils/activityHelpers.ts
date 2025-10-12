import { 
  Wrench, 
  CheckCircle, 
  DollarSign, 
  Eye,
  Activity as ActivityIcon
} from "lucide-react";

export const activityTypeColors = {
  maintenance: "bg-orange-100 text-orange-800 border-orange-200",
  property_check: "bg-blue-100 text-blue-800 border-blue-200", 
  payment: "bg-green-100 text-green-800 border-green-200",
  home_check: "bg-purple-100 text-purple-800 border-purple-200"
} as const;

export const activityTypeIcons = {
  maintenance: Wrench,
  property_check: CheckCircle,
  payment: DollarSign,
  home_check: Eye
} as const;

export const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  'in-progress': "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  scheduled: "bg-purple-100 text-purple-800 border-purple-200",
  due: "bg-orange-100 text-orange-800 border-orange-200",
  paid: "bg-green-100 text-green-800 border-green-200"
} as const;

export const getActivityIcon = (type: string) => {
  const IconComponent = activityTypeIcons[type as keyof typeof activityTypeIcons] || ActivityIcon;
  return IconComponent;
};
