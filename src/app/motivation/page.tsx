"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ChallengeProvider, useChallengeContext } from "@/contexts/ChallengeContext";
import { useSession } from "@/lib/auth-client";
import { MotivationalStatement, MotivationalStatementForm } from "@/lib/types";
import { AuthenticationPage } from "@/components/auth/authentication-page";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  MessageSquare,
  HelpCircle,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatementCardProps {
  statement: MotivationalStatement;
  onEdit: (statement: MotivationalStatement) => void;
  onDelete: (statementId: string) => void;
  onUpdate: (statementId: string, updates: Partial<MotivationalStatement>) => void;
}

function StatementCard({ statement, onEdit, onDelete, onUpdate }: StatementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: statement.title,
    statement: statement.statement,
    why: statement.why || '',
    collaboration: statement.collaboration || '',
  });

  const handleSave = async () => {
    await onUpdate(statement.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: statement.title,
      statement: statement.statement,
      why: statement.why || '',
      collaboration: statement.collaboration || '',
    });
    setIsEditing(false);
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <Input
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="text-lg font-semibold"
              placeholder="Statement title"
            />
          ) : (
            <CardTitle className="text-lg">
              {statement.title}
            </CardTitle>
          )}
          
          {!isEditing && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(statement.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {isEditing && (
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Main Statement */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Statement</span>
          </div>
          {isEditing ? (
            <Textarea
              value={editData.statement}
              onChange={(e) => setEditData({ ...editData, statement: e.target.value })}
              className="min-h-[80px]"
              placeholder="Your motivational statement"
            />
          ) : (
            <p className="text-sm leading-relaxed pl-6">
              {statement.statement}
            </p>
          )}
        </div>

        {/* Why Section */}
        {(statement.why || isEditing) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Why</span>
            </div>
            {isEditing ? (
              <Textarea
                value={editData.why}
                onChange={(e) => setEditData({ ...editData, why: e.target.value })}
                className="min-h-[60px]"
                placeholder="Why is this important to you?"
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                {statement.why}
              </p>
            )}
          </div>
        )}

        {/* Collaboration Section */}
        {(statement.collaboration || isEditing) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Collaboration</span>
            </div>
            {isEditing ? (
              <Textarea
                value={editData.collaboration}
                onChange={(e) => setEditData({ ...editData, collaboration: e.target.value })}
                className="min-h-[60px]"
                placeholder="How do you need others to support you?"
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                {statement.collaboration}
              </p>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div>Created {statement.createdAt.toLocaleDateString()}</div>
          {statement.updatedAt.getTime() !== statement.createdAt.getTime() && (
            <div>Updated {statement.updatedAt.toLocaleDateString()}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface AddStatementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (statement: MotivationalStatementForm) => void;
}

function AddStatementDialog({ isOpen, onClose, onSubmit }: AddStatementDialogProps) {
  const [formData, setFormData] = useState<MotivationalStatementForm>({
    title: '',
    statement: '',
    why: '',
    collaboration: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.statement.trim()) return;
    
    onSubmit(formData);
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      statement: '',
      why: '',
      collaboration: '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Add Motivational Statement
          </DialogTitle>
          <DialogDescription>
            Create a personal motivational statement to inspire and guide your daily actions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., My Creative Vision, Daily Commitment"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="statement">Statement *</Label>
            <Textarea
              id="statement"
              value={formData.statement}
              onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
              placeholder="Write your motivational statement here..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="why">Why (optional)</Label>
            <Textarea
              id="why"
              value={formData.why}
              onChange={(e) => setFormData({ ...formData, why: e.target.value })}
              placeholder="Why is this important to you?"
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="collaboration">Collaboration (optional)</Label>
            <Textarea
              id="collaboration"
              value={formData.collaboration}
              onChange={(e) => setFormData({ ...formData, collaboration: e.target.value })}
              placeholder="How do you need others to support you?"
              className="min-h-[80px]"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Statement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MotivationContent() {
  const {
    currentChallenge,
    motivationalStatements,
    isLoading,
    addMotivationalStatement,
    updateMotivationalStatement,
    deleteMotivationalStatement,
  } = useChallengeContext();

  // Filter statements to only show those for the current active challenge
  const statements = motivationalStatements.filter(statement => 
    statement.challengeId === currentChallenge?.id
  );

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddStatement = async (formData: MotivationalStatementForm) => {
    try {
      await addMotivationalStatement({
        ...formData,
        challengeId: currentChallenge?.id
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding statement:', error);
    }
  };

  const handleUpdateStatement = async (statementId: string, updates: Partial<MotivationalStatement>) => {
    try {
      await updateMotivationalStatement(statementId, updates);
    } catch (error) {
      console.error('Error updating statement:', error);
    }
  };

  const handleDeleteStatement = async (statementId: string) => {
    if (confirm('Are you sure you want to delete this motivational statement?')) {
      try {
        await deleteMotivationalStatement(statementId);
      } catch (error) {
        console.error('Error deleting statement:', error);
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
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-48 bg-muted rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no active challenge
  if (!currentChallenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Motivation</h1>
          <div className="bg-muted/50 border border-dashed rounded-lg p-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Active Challenge</h2>
            <p className="text-muted-foreground mb-4">
              You need to have an active challenge to view and manage motivational statements.
            </p>
            <Button asChild>
              <a href="/beats">Go to Challenges</a>
            </Button>
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
            Motivation
          </h1>
          <div className="text-muted-foreground">
            <p>Motivational statements for: <span className="font-semibold text-foreground">{currentChallenge.title}</span></p>
          </div>
        </div>

        {/* Add Statement Button */}
        <div className="flex justify-center">
          <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Motivational Statement
          </Button>
        </div>

        {/* Statements */}
        <div className="space-y-6">
          {statements
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .map((statement) => (
              <StatementCard
                key={statement.id}
                statement={statement}
                onEdit={() => {}} // Editing is handled inline
                onDelete={handleDeleteStatement}
                onUpdate={handleUpdateStatement}
              />
            ))}
        </div>


        {/* Add Statement Dialog */}
        <AddStatementDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleAddStatement}
        />
      </div>
    </div>
  );
}

export default function MotivationPage() {
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
    <ChallengeProvider userId={session.user.id}>
      <MotivationContent />
    </ChallengeProvider>
  );
}
