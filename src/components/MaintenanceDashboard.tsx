import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Target
} from "lucide-react";
import { MaintenanceRequest } from "@/hooks/queries/useMaintenanceRequests";
import { differenceInDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface MaintenanceDashboardProps {
  requests: MaintenanceRequest[];
}

const MaintenanceDashboard = ({ requests }: MaintenanceDashboardProps) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Core Statistics
  const totalRequests = requests.length;
  const activeCount = requests.filter(r => ['in-progress', 'scheduled'].includes(r.status)).length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const completedThisMonth = requests.filter(r => 
    r.status === 'completed' && 
    r.completed_at &&
    isWithinInterval(new Date(r.completed_at), { start: monthStart, end: monthEnd })
  ).length;

  // Priority Distribution
  const urgentCount = requests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length;
  const highCount = requests.filter(r => r.priority === 'high' && r.status !== 'completed').length;
  const mediumCount = requests.filter(r => r.priority === 'medium' && r.status !== 'completed').length;
  const lowCount = requests.filter(r => r.priority === 'low' && r.status !== 'completed').length;

  // Performance Metrics
  const completedRequests = requests.filter(r => r.status === 'completed' && r.created_at && r.completed_at);
  const avgResponseTime = completedRequests.length > 0 
    ? completedRequests.reduce((acc, req) => {
        const created = new Date(req.created_at);
        const completed = new Date(req.completed_at!);
        return acc + differenceInDays(completed, created);
      }, 0) / completedRequests.length
    : 0;

  // Cost Analysis
  const totalEstimatedCost = requests.reduce((acc, req) => acc + (req.estimated_cost || 0), 0);
  const totalActualCost = requests.reduce((acc, req) => acc + (req.actual_cost || 0), 0);
  const costVariance = totalActualCost > 0 ? ((totalActualCost - totalEstimatedCost) / totalEstimatedCost) * 100 : 0;

  // Overdue Analysis
  const overdueRequests = requests.filter(r => 
    r.due_date && 
    new Date(r.due_date) < now && 
    r.status !== 'completed'
  );

  // Completion Rate
  const completionRate = totalRequests > 0 ? (requests.filter(r => r.status === 'completed').length / totalRequests) * 100 : 0;

  // Assigned vs Unassigned
  const assignedCount = requests.filter(r => r.assigned_to && r.status !== 'completed').length;
  const unassignedCount = requests.filter(r => !r.assigned_to && r.status !== 'completed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Active Work Orders */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Active Work Orders</CardTitle>
          <Wrench className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900">{activeCount}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-blue-600">In progress & scheduled</p>
            {activeCount > 0 && (
              <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                {((activeCount / totalRequests) * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
          <Progress value={(activeCount / Math.max(totalRequests, 1)) * 100} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-800">Pending Requests</CardTitle>
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-900">{pendingCount}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-amber-600">Awaiting assignment</p>
            {urgentCount > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                {urgentCount} URGENT
              </Badge>
            )}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-red-600">Urgent: {urgentCount}</span>
              <span className="text-orange-600">High: {highCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed This Month */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Completed This Month</CardTitle>
          <CheckCircle className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">{completedThisMonth}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-green-600">Current month</p>
            <div className="flex items-center text-xs text-green-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              {completionRate.toFixed(0)}% rate
            </div>
          </div>
          <Progress value={completionRate} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Average Response Time */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Avg Response Time</CardTitle>
          <Clock className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-900">
            {avgResponseTime.toFixed(1)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-purple-600">Days to completion</p>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                avgResponseTime <= 3 
                  ? 'border-green-300 text-green-700' 
                  : avgResponseTime <= 7 
                    ? 'border-yellow-300 text-yellow-700'
                    : 'border-red-300 text-red-700'
              }`}
            >
              {avgResponseTime <= 3 ? 'EXCELLENT' : avgResponseTime <= 7 ? 'GOOD' : 'NEEDS IMPROVEMENT'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-800">Cost Analysis</CardTitle>
          <DollarSign className="h-5 w-5 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900">
            ${totalActualCost.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-emerald-600">Actual spend</p>
            <div className="flex items-center text-xs">
              {costVariance > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1 text-red-500" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
              )}
              <span className={costVariance > 0 ? 'text-red-600' : 'text-green-600'}>
                {Math.abs(costVariance).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="text-xs text-emerald-600 mt-1">
            Estimated: ${totalEstimatedCost.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Status */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-indigo-800">Assignment Status</CardTitle>
          <Users className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-indigo-900">{assignedCount}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-indigo-600">Assigned requests</p>
            {unassignedCount > 0 && (
              <Badge variant="outline" className="border-orange-300 text-orange-700 text-xs">
                {unassignedCount} unassigned
              </Badge>
            )}
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-indigo-600">Assigned: {assignedCount}</span>
            <span className="text-orange-600">Pending: {unassignedCount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Alerts */}
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">Overdue Items</CardTitle>
          <Activity className="h-5 w-5 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-900">{overdueRequests.length}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-red-600">Past due date</p>
            {overdueRequests.length > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                ACTION REQUIRED
              </Badge>
            )}
          </div>
          {overdueRequests.length > 0 && (
            <div className="text-xs text-red-600 mt-2">
              Oldest: {differenceInDays(now, new Date(overdueRequests[0].due_date!))} days overdue
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Target */}
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-800">Monthly Target</CardTitle>
          <Target className="h-5 w-5 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{completedThisMonth}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-600">of 50 target</p>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                completedThisMonth >= 50 
                  ? 'border-green-300 text-green-700' 
                  : completedThisMonth >= 35 
                    ? 'border-yellow-300 text-yellow-700'
                    : 'border-red-300 text-red-700'
              }`}
            >
              {((completedThisMonth / 50) * 100).toFixed(0)}%
            </Badge>
          </div>
          <Progress value={(completedThisMonth / 50) * 100} className="mt-2 h-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceDashboard;