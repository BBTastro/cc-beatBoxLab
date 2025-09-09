"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Clock, 
  Activity, 
  Shield,
  BarChart3,
  Settings
} from "lucide-react";
import { AdminUserList } from "./admin-user-list";
import { AdminUserSessions } from "./admin-user-sessions";
import { AdminUserActivity } from "./admin-user-activity";

interface AdminPanelProps {
  isAdmin: boolean;
  userEmail?: string;
}

export function AdminPanel({ isAdmin, userEmail }: AdminPanelProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Admin Panel
              </CardTitle>
              <CardDescription>
                User management and analytics dashboard
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
              <span className="text-sm text-muted-foreground">
                {userEmail}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <AdminUserList isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <AdminUserSessions isAdmin={isAdmin} selectedUserId={selectedUserId} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <AdminUserActivity isAdmin={isAdmin} selectedUserId={selectedUserId} />
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Full access to user data and analytics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Privacy</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Compliant</div>
            <p className="text-xs text-muted-foreground">
              User data handled according to privacy policy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Real-time</div>
            <p className="text-xs text-muted-foreground">
              Live tracking of user behavior and engagement
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
