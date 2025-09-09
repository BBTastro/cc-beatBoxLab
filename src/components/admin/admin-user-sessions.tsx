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
  Clock, 
  Monitor, 
  MapPin,
  Download,
  RefreshCw,
  Filter
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface UserSession {
  id: string;
  userId: string;
  email: string;
  signInAt: string;
  signOutAt?: string;
  sessionDuration?: number;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminUserSessionsProps {
  isAdmin: boolean;
  selectedUserId?: string;
}

export function AdminUserSessions({ isAdmin, selectedUserId }: AdminUserSessionsProps) {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let url = '/api/admin/sessions?limit=100';
      if (selectedUserId) {
        url += `&userId=${selectedUserId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch sessions`);
      }
      
      const data = await response.json();
      let filteredSessions = data.sessions || [];
      
      if (showActiveOnly) {
        filteredSessions = filteredSessions.filter((session: UserSession) => session.isActive);
      }
      
      setSessions(filteredSessions);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSessions();
    }
  }, [isAdmin, selectedUserId, showActiveOnly]);

  const exportSessions = () => {
    const csvContent = [
      ['Email', 'Sign-in Time', 'Sign-out Time', 'Duration (min)', 'IP Address', 'User Agent', 'Status'],
      ...sessions.map(session => [
        session.email,
        format(new Date(session.signInAt), 'yyyy-MM-dd HH:mm:ss'),
        session.signOutAt ? format(new Date(session.signOutAt), 'yyyy-MM-dd HH:mm:ss') : 'Active',
        session.sessionDuration?.toString() || 'N/A',
        session.ipAddress || 'N/A',
        session.userAgent || 'N/A',
        session.isActive ? 'Active' : 'Ended'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stepbox-sessions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getBrowserInfo = (userAgent: string) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            User Sessions
          </CardTitle>
          <CardDescription>
            Loading session data...
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
            <Clock className="h-5 w-5" />
            User Sessions
          </CardTitle>
          <CardDescription>
            Error loading session data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchSessions} variant="outline">
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
              <Clock className="h-5 w-5" />
              User Sessions
            </CardTitle>
            <CardDescription>
              Track user sign-ins and session activity
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowActiveOnly(!showActiveOnly)} 
              variant={showActiveOnly ? "default" : "outline"} 
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Active Only
            </Button>
            <Button onClick={fetchSessions} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportSessions} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No sessions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Sessions</p>
                  <p className="text-2xl font-bold">{sessions.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Monitor className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Active Sessions</p>
                  <p className="text-2xl font-bold">
                    {sessions.filter(s => s.isActive).length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Unique IPs</p>
                  <p className="text-2xl font-bold">
                    {new Set(sessions.map(s => s.ipAddress).filter(Boolean)).size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Avg Duration</p>
                  <p className="text-2xl font-bold">
                    {Math.round(sessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / sessions.length) || 0}m
                  </p>
                </div>
              </div>
            </div>

            {/* Sessions Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Sign-in Time</TableHead>
                    <TableHead>Sign-out Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{session.email}</p>
                          <p className="text-sm text-muted-foreground">ID: {session.userId.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(session.signInAt), 'MMM dd, yyyy HH:mm')}</p>
                          <p className="text-muted-foreground">
                            {formatDistanceToNow(new Date(session.signInAt), { addSuffix: true })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.signOutAt ? (
                          <div className="text-sm">
                            <p>{format(new Date(session.signOutAt), 'MMM dd, yyyy HH:mm')}</p>
                            <p className="text-muted-foreground">
                              {formatDistanceToNow(new Date(session.signOutAt), { addSuffix: true })}
                            </p>
                          </div>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {session.sessionDuration ? (
                          <span className="text-sm">
                            {Math.floor(session.sessionDuration / 60)}h {session.sessionDuration % 60}m
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{getBrowserInfo(session.userAgent || '')}</p>
                          <p className="text-muted-foreground">{getDeviceInfo(session.userAgent || '')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {session.ipAddress || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {session.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Ended</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
