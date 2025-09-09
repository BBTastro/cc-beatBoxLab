"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Activity, 
  Globe,
  MousePointer,
  Download,
  RefreshCw,
  Filter,
  Calendar
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface UserActivity {
  id: string;
  userId: string;
  email: string;
  activityType: 'sign_in' | 'page_visit' | 'return_visit' | 'action';
  pageUrl?: string;
  action?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  createdAt: string;
}

interface AdminUserActivityProps {
  isAdmin: boolean;
  selectedUserId?: string;
}

export function AdminUserActivity({ isAdmin, selectedUserId }: AdminUserActivityProps) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [daysFilter, setDaysFilter] = useState<number>(7);

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'sign_in', label: 'Sign-ins' },
    { value: 'page_visit', label: 'Page Visits' },
    { value: 'return_visit', label: 'Return Visits' },
    { value: 'action', label: 'Actions' },
  ];

  const dayFilters = [
    { value: 1, label: 'Last 24 hours' },
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 90 days' },
  ];

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/activity?days=${daysFilter}&limit=200`;
      if (selectedUserId) {
        url += `&userId=${selectedUserId}`;
      }
      if (activityTypeFilter !== 'all') {
        url += `&activityType=${activityTypeFilter}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch activities`);
      }
      
      const data = await response.json();
      setActivities(data.activities || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchActivities();
    }
  }, [isAdmin, selectedUserId, activityTypeFilter, daysFilter]);

  const exportActivities = () => {
    const csvContent = [
      ['Email', 'Activity Type', 'Action', 'Page URL', 'Timestamp', 'Session ID'],
      ...activities.map(activity => [
        activity.email,
        activity.activityType,
        activity.action || 'N/A',
        activity.pageUrl || 'N/A',
        format(new Date(activity.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        activity.sessionId || 'N/A'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stepbox-activity-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'sign_in':
        return '🔐';
      case 'page_visit':
        return '🌐';
      case 'return_visit':
        return '🔄';
      case 'action':
        return '⚡';
      default:
        return '📊';
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'sign_in':
        return 'bg-blue-100 text-blue-800';
      case 'page_visit':
        return 'bg-green-100 text-green-800';
      case 'return_visit':
        return 'bg-purple-100 text-purple-800';
      case 'action':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPageName = (pageUrl?: string) => {
    if (!pageUrl) return 'N/A';
    
    const path = pageUrl.split('/').pop() || pageUrl;
    switch (path) {
      case 'beats': return 'Steps';
      case 'details': return 'Details';
      case 'move': return 'Move';
      case 'rewards': return 'Rewards';
      case 'motivation': return 'Motivation';
      case 'allies': return 'Allies';
      case 'settings': return 'Settings';
      case 'about': return 'About';
      case '': return 'Home';
      default: return path.charAt(0).toUpperCase() + path.slice(1);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Activity
          </CardTitle>
          <CardDescription>
            Loading activity data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Activity
          </CardTitle>
          <CardDescription>
            Error loading activity data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchActivities} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Activity
            </CardTitle>
            <CardDescription>
              Track user actions and page visits
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchActivities} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportActivities} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={activityTypeFilter}
                onChange={(e) => setActivityTypeFilter(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <select
                value={daysFilter}
                onChange={(e) => setDaysFilter(Number(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
              >
                {dayFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Activities</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Globe className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Page Visits</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.activityType === 'page_visit').length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MousePointer className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">User Actions</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.activityType === 'action').length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Sign-ins</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.activityType === 'sign_in').length}
                </p>
              </div>
            </div>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No activities found</p>
            </div>
          ) : (
            /* Activities Table */
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getActivityIcon(activity.activityType)}</span>
                          <Badge className={getActivityColor(activity.activityType)}>
                            {activity.activityType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{activity.email}</p>
                          <p className="text-sm text-muted-foreground">ID: {activity.userId.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {activity.action || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getPageName(activity.pageUrl)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}</p>
                          <p className="text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {activity.sessionId ? activity.sessionId.slice(0, 8) + '...' : 'N/A'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
