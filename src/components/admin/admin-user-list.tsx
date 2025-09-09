"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Users, 
  Calendar, 
  Activity, 
  Download,
  RefreshCw,
  Eye,
  Clock
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  totalSessions: number;
  lastSignIn?: string;
  totalActivity: number;
  lastActivity?: string;
}

interface AdminUserListProps {
  isAdmin: boolean;
}

export function AdminUserList({ isAdmin }: AdminUserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch users`);
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Sign-ups', 'Total Sessions', 'Last Sign-in', 'Total Activity', 'Last Activity'],
      ...users.map(user => [
        user.name,
        user.email,
        format(new Date(user.createdAt), 'yyyy-MM-dd'),
        user.totalSessions.toString(),
        user.lastSignIn ? format(new Date(user.lastSignIn), 'yyyy-MM-dd HH:mm') : 'Never',
        user.totalActivity.toString(),
        user.lastActivity ? format(new Date(user.lastActivity), 'yyyy-MM-dd HH:mm') : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stepbox-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Loading user data...
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
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Error loading user data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchUsers} variant="outline">
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
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Track user sign-ins, activity, and engagement
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportUsers} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Active Users</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.lastSignIn && new Date(u.lastSignIn) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">New This Week</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Avg Sessions</p>
                  <p className="text-2xl font-bold">
                    {Math.round(users.reduce((sum, u) => sum + u.totalSessions, 0) / users.length) || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="font-semibold text-foreground">User Details</TableHead>
                    <TableHead className="font-semibold text-foreground">Registration</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">Sessions</TableHead>
                    <TableHead className="font-semibold text-foreground">Last Activity</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">Status</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 ring-2 ring-muted">
                            <AvatarImage src={user.image || ""} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground leading-none">{user.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="space-y-1">
                          <div className="font-bold text-xl text-foreground">
                            {user.totalSessions}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            sessions
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {user.lastSignIn ? (
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {format(new Date(user.lastSignIn), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(user.lastSignIn), { addSuffix: true })}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {user.totalActivity} actions
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Never signed in</p>
                            <Badge variant="outline" className="text-xs">
                              {user.totalActivity} actions
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {user.lastSignIn && new Date(user.lastSignIn) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                            Active
                          </Badge>
                        ) : user.lastSignIn && new Date(user.lastSignIn) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 font-medium">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                            Recent
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-medium">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full mr-2"></div>
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
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
