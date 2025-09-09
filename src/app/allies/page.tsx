"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlliesProvider, useAlliesContext } from "@/contexts/AlliesContext";
import { useSession } from "@/lib/auth-client";
import { Ally, AllyForm, NotificationPreferences } from "@/lib/types";
import { AuthenticationPage } from "@/components/auth/authentication-page";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  Phone,
  MessageCircle,
  Bell,
  UserPlus,
  Heart,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AllyCardProps {
  ally: Ally;
  onEdit: (ally: Ally) => void;
  onDelete: (allyId: string) => void;
}

function AllyCard({ ally, onEdit, onDelete }: AllyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getContactMethods = () => {
    const methods = [];
    if (ally.email) methods.push({ type: 'Email', value: ally.email, icon: Mail });
    if (ally.phone) methods.push({ type: 'SMS', value: ally.phone, icon: Phone });
    if (ally.slackHandle) methods.push({ type: 'Slack', value: ally.slackHandle, icon: MessageCircle });
    if (ally.discordUsername) methods.push({ type: 'Discord', value: ally.discordUsername, icon: MessageCircle });
    return methods;
  };

  const getActiveNotifications = () => {
    return Object.entries(ally.notificationPreferences)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type)
      .length;
  };

  const contactMethods = getContactMethods();
  const activeNotifications = getActiveNotifications();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={toggleExpanded}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {ally.name}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(ally);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(ally.id);
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {ally.role && (
          <Badge variant="secondary" className="w-fit">
            {ally.role}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <div className="font-medium">{contactMethods.length}</div>
            <div className="text-xs text-muted-foreground">Contact Methods</div>
          </div>
          <div>
            <div className="font-medium">{activeNotifications}</div>
            <div className="text-xs text-muted-foreground">Notifications</div>
          </div>
        </div>

        {/* Primary Contact */}
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{ally.email}</span>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            {/* All Contact Methods */}
            <div>
              <h4 className="text-sm font-medium mb-2">Contact Methods</h4>
              <div className="space-y-2">
                {contactMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div key={method.type} className="flex items-center gap-2 text-sm">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground w-12">{method.type}:</span>
                      <span className="truncate">{method.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <h4 className="text-sm font-medium mb-2">Notifications</h4>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(ally.notificationPreferences).map(([type, enabled]) => (
                  <Badge
                    key={type}
                    variant={enabled ? "default" : "outline"}
                    className={cn(
                      "text-xs px-2 py-0.5 font-medium transition-colors",
                      enabled ? "shadow-sm" : "opacity-60"
                    )}
                  >
                    <span className="capitalize">
                      {type === 'sms' ? 'SMS' : type}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground">
              <div>Added {ally.createdAt.toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AddAllyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ally: AllyForm) => void;
  editingAlly?: Ally;
}

function AddAllyDialog({ isOpen, onClose, onSubmit, editingAlly }: AddAllyDialogProps) {
  const [formData, setFormData] = useState<AllyForm>({
    name: editingAlly?.name || '',
    email: editingAlly?.email || '',
    role: editingAlly?.role || '',
    phone: editingAlly?.phone || '',
    telegramHandle: editingAlly?.telegramHandle || '',
    slackHandle: editingAlly?.slackHandle || '',
    discordUsername: editingAlly?.discordUsername || '',
    notificationPreferences: editingAlly?.notificationPreferences || {
      email: false,
      sms: false,
      phone: false,
      telegram: false,
      slack: false,
      discord: false,
      push: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    
    onSubmit(formData);
    onClose();
    
    // Reset form if not editing
    if (!editingAlly) {
      setFormData({
        name: '',
        email: '',
        role: '',
        phone: '',
        telegramHandle: '',
        slackHandle: '',
        discordUsername: '',
        notificationPreferences: {
          email: false,
          sms: false,
          phone: false,
          telegram: false,
          slack: false,
          discord: false,
          push: false,
        },
      });
    }
  };

  const handleNotificationChange = (type: keyof NotificationPreferences, enabled: boolean) => {
    setFormData({
      ...formData,
      notificationPreferences: {
        ...formData.notificationPreferences,
        [type]: enabled,
      },
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-3 w-3" />;
      case 'sms': return <MessageCircle className="h-3 w-3" />;
      case 'phone': return <Phone className="h-3 w-3" />;
      case 'telegram': return <MessageCircle className="h-3 w-3" />;
      case 'slack': return <MessageCircle className="h-3 w-3" />;
      case 'discord': return <MessageCircle className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Invite Ally</DialogTitle>
          <DialogDescription>
            Add a new ally to your support network. Fill in their contact information and notification preferences.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter their name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="their.email@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role (optional)</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., Business Partner, Mentor"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Contact Details</h4>
            
            {formData.notificationPreferences.sms && (
              <div>
                <Label htmlFor="phone">SMS Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}

            {formData.notificationPreferences.phone && (
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}

            {formData.notificationPreferences.telegram && (
              <div>
                <Label htmlFor="telegramHandle">Telegram Handle</Label>
                <Input
                  id="telegramHandle"
                  value={formData.telegramHandle || ''}
                  onChange={(e) => setFormData({ ...formData, telegramHandle: e.target.value })}
                  placeholder="@username"
                />
              </div>
            )}

            {formData.notificationPreferences.slack && (
              <div>
                <Label htmlFor="slackHandle">Slack</Label>
                <Input
                  id="slackHandle"
                  value={formData.slackHandle}
                  onChange={(e) => setFormData({ ...formData, slackHandle: e.target.value })}
                  placeholder="@username"
                />
              </div>
            )}

            {formData.notificationPreferences.discord && (
              <div>
                <Label htmlFor="discordUsername">Discord Handle</Label>
                <Input
                  id="discordUsername"
                  value={formData.discordUsername}
                  onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
                  placeholder="username#1234"
                />
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Notification Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(formData.notificationPreferences).filter(([type]) => type !== 'push').map(([type, enabled]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleNotificationChange(type as keyof NotificationPreferences, !enabled)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                    "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                    enabled
                      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                      : "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent"
                  )}
                >
                  <span className="flex-shrink-0 w-3 h-3 flex items-center justify-center">
                    {getNotificationIcon(type)}
                  </span>
                  <span className="capitalize leading-none">
                    {type === 'sms' ? 'SMS' : type}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Send Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AlliesContent() {
  const {
    allies,
    isLoading,
    addAlly,
    updateAlly,
    deleteAlly,
  } = useAlliesContext();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAlly, setEditingAlly] = useState<Ally | undefined>();

  const handleAddAlly = async (formData: AllyForm) => {
    try {
      await addAlly(formData);
    } catch (error) {
      console.error('Error adding ally:', error);
    }
  };

  const handleEditAlly = async (formData: AllyForm) => {
    if (!editingAlly) return;

    try {
      await updateAlly(editingAlly.id, formData);
      setEditingAlly(undefined);
    } catch (error) {
      console.error('Error updating ally:', error);
    }
  };

  const handleDeleteAlly = async (allyId: string) => {
    if (confirm('Are you sure you want to remove this ally?')) {
      try {
        await deleteAlly(allyId);
      } catch (error) {
        console.error('Error deleting ally:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded-md"></div>
            <div className="h-4 bg-muted rounded-md w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-48 bg-muted rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            Allies
          </h1>
        </div>

        {/* Add Ally Button */}
        <div className="flex justify-center">
          <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Ally
          </Button>
        </div>

        {/* Stats */}
        {allies.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {allies.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Allies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {allies.filter(a => a.email).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Email Contacts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {allies.filter(a => a.phone).length}
                  </div>
                  <div className="text-xs text-muted-foreground">SMS Contacts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {allies.filter(a => a.role).length}
                  </div>
                  <div className="text-xs text-muted-foreground">With Roles</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Allies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allies
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((ally) => (
              <AllyCard
                key={ally.id}
                ally={ally}
                onEdit={setEditingAlly}
                onDelete={handleDeleteAlly}
              />
            ))}
        </div>

        {/* Future Features */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Future versions will include:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Automatic progress sharing with allies</li>
              <li>Accountability check-ins and reminders</li>
              <li>Collaborative goal setting</li>
              <li>Real-time notifications across platforms</li>
            </ul>
          </CardContent>
        </Card>

        {/* Add/Edit Ally Dialog */}
        <AddAllyDialog
          isOpen={isAddDialogOpen || !!editingAlly}
          onClose={() => {
            setIsAddDialogOpen(false);
            setEditingAlly(undefined);
          }}
          onSubmit={editingAlly ? handleEditAlly : handleAddAlly}
          editingAlly={editingAlly}
        />
      </div>
    </div>
  );
}

export default function AlliesPage() {
  const { data: session, isPending: authLoading } = useSession();

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return <AuthenticationPage />;
  }

  return (
    <AlliesProvider userId={session.user.id}>
      <AlliesContent />
    </AlliesProvider>
  );
}
