"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChallengeProvider, useChallengeContext } from "@/contexts/ChallengeContext";
import { useSession } from "@/lib/auth-client";
import { Reward, RewardForm } from "@/lib/types";
import { AuthenticationPage } from "@/components/auth/authentication-page";
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  Gift,
  Star,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface RewardCardProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onDelete: (rewardId: string) => void;
  onAchieve: (rewardId: string, proofUrl?: string) => void;
  onClick: () => void;
}

function RewardCard({ reward, onEdit, onDelete, onAchieve, onClick }: RewardCardProps) {
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [proofUrl, setProofUrl] = useState(reward.proofUrl || '');

  const getStatusIcon = () => {
    switch (reward.status) {
      case 'achieved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active':
        return <Star className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (reward.status) {
      case 'achieved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'active':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleAchieve = () => {
    onAchieve(reward.id, proofUrl || undefined);
    setShowProofDialog(false);
    setProofUrl('');
  };

  return (
    <>
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1", 
          reward.status === 'achieved' && "bg-green-50/50"
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="leading-tight">{reward.title}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {reward.status !== 'planned' && (
                <Badge variant="secondary" className={cn("text-xs", getStatusColor())}>
                  {getStatusIcon()}
                  <span className="ml-1 capitalize">{reward.status}</span>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {reward.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {reward.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Achieve Reward Dialog */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Mark as Achieved
            </DialogTitle>
            <DialogDescription>
              Mark this reward as achieved and optionally provide proof of completion.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">{reward.title}</h4>
              {reward.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {reward.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="proofUrl">Proof URL (optional)</Label>
              <Input
                id="proofUrl"
                type="url"
                placeholder="https://example.com/proof"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Link to evidence of your achievement (photo, post, etc.)
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowProofDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAchieve} className="flex-1">
                Mark Achieved
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface RewardDetailDialogProps {
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (reward: Reward) => void;
  onDelete: (rewardId: string) => void;
  onAchieve: (rewardId: string, proofUrl?: string) => void;
}

function RewardDetailDialog({ reward, isOpen, onClose, onEdit, onDelete, onAchieve }: RewardDetailDialogProps) {
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [proofUrl, setProofUrl] = useState(reward?.proofUrl || '');

  const getStatusIcon = () => {
    if (!reward) return null;
    switch (reward.status) {
      case 'achieved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active':
        return <Star className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    if (!reward) return '';
    switch (reward.status) {
      case 'achieved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'active':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleAchieve = () => {
    if (!reward) return;
    onAchieve(reward.id, proofUrl || undefined);
    setShowProofDialog(false);
    setProofUrl('');
    onClose();
  };

  if (!reward) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {reward.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Status Badge */}
            {reward.status !== 'planned' && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getStatusColor()}>
                  {getStatusIcon()}
                  <span className="ml-1 capitalize">{reward.status}</span>
                </Badge>
              </div>
            )}

            {/* Description */}
            {reward.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {reward.description}
                </p>
              </div>
            )}

            {/* Achievement Details */}
            {reward.status === 'achieved' && reward.achievedAt && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Achievement Details</h3>
                <div className="text-sm text-green-600 font-medium">
                  Achieved on {reward.achievedAt.toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Proof Link */}
            {reward.proofUrl && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Proof</h3>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={reward.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    View Proof
                  </a>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              {reward.status !== 'achieved' && (
                <Button
                  onClick={() => setShowProofDialog(true)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Achieved
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => {
                  onEdit(reward);
                  onClose();
                }}
                className={reward.status === 'achieved' ? 'flex-1' : ''}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this reward?')) {
                    onDelete(reward.id);
                    onClose();
                  }
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achieve Reward Dialog */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Mark as Achieved
            </DialogTitle>
            <DialogDescription>
              Mark this reward as achieved and optionally provide proof of completion.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">{reward.title}</h4>
              {reward.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {reward.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="proofUrl">Proof URL (optional)</Label>
              <Input
                id="proofUrl"
                type="url"
                placeholder="https://example.com/proof"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Link to evidence of your achievement (photo, post, etc.)
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowProofDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAchieve} className="flex-1">
                Mark Achieved
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface AddRewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reward: RewardForm) => void;
  editingReward?: Reward;
}

function AddRewardDialog({ isOpen, onClose, onSubmit, editingReward }: AddRewardDialogProps) {
  const [formData, setFormData] = useState<RewardForm>({
    title: '',
    description: '',
    status: 'planned',
    proofUrl: '',
  });

  // Update form data when editingReward changes
  useEffect(() => {
    if (editingReward) {
      setFormData({
        title: editingReward.title,
        description: editingReward.description || '',
        status: editingReward.status,
        proofUrl: editingReward.proofUrl || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'planned',
        proofUrl: '',
      });
    }
  }, [editingReward]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingReward ? 'Edit Reward' : 'Add New Reward'}
          </DialogTitle>
          <DialogDescription>
            {editingReward ? '' : 'Create a new reward to motivate yourself during your challenge.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Reward Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., New laptop, Weekend trip, Favorite meal"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What makes this reward special?"
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'planned' | 'active' | 'achieved') => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="achieved">Achieved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === 'achieved' && (
            <div>
              <Label htmlFor="proofUrl">Proof URL</Label>
              <Input
                id="proofUrl"
                type="url"
                value={formData.proofUrl}
                onChange={(e) => setFormData({ ...formData, proofUrl: e.target.value })}
                placeholder="https://example.com/proof"
              />
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingReward ? 'Update' : 'Add'} Reward
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RewardsContent() {
  const {
    currentChallenge,
    rewards,
    isLoading,
    addReward,
    updateReward,
    deleteReward,
    achieveReward,
  } = useChallengeContext();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | undefined>();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleAddReward = async (formData: RewardForm) => {
    try {
      await addReward(formData);
    } catch (error) {
      console.error('Error adding reward:', error);
    }
  };

  const handleEditReward = async (formData: RewardForm) => {
    if (!editingReward) return;

    try {
      await updateReward(editingReward.id, formData);
      setEditingReward(undefined);
    } catch (error) {
      console.error('Error updating reward:', error);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      try {
        await deleteReward(rewardId);
      } catch (error) {
        console.error('Error deleting reward:', error);
      }
    }
  };

  const handleAchieveReward = async (rewardId: string, proofUrl?: string) => {
    try {
      await achieveReward(rewardId, proofUrl);
    } catch (error) {
      console.error('Error achieving reward:', error);
    }
  };

  const handleRewardClick = (reward: Reward) => {
    setSelectedReward(reward);
    setIsDetailDialogOpen(true);
  };

  // Calculate stats
  const totalRewards = rewards.length;
  const achievedRewards = rewards.filter(r => r.status === 'achieved').length;
  const activeRewards = rewards.filter(r => r.status === 'active').length;
  const plannedRewards = rewards.filter(r => r.status === 'planned').length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded-md"></div>
            <div className="h-32 bg-muted rounded-md"></div>
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

  if (!currentChallenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold">No Active Challenge</h2>
          <p className="text-muted-foreground">
            Create a challenge first to start setting up rewards.
          </p>
          <Button asChild>
            <Link href="/settings">Create Challenge</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Rewards
          </h1>
        </div>

        {/* Add Reward Button */}
        <div className="flex justify-center">
          <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Reward
          </Button>
        </div>

        {/* Stats */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {totalRewards}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {achievedRewards}
                </div>
                <div className="text-xs text-muted-foreground">Achieved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {plannedRewards}
                </div>
                <div className="text-xs text-muted-foreground">Planned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Grid */}
        {rewards.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <Gift className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No Rewards Yet</h3>
                <p className="text-muted-foreground">
                  Add rewards to motivate yourself throughout your challenge journey.
                </p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Reward
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onEdit={setEditingReward}
                onDelete={handleDeleteReward}
                onAchieve={handleAchieveReward}
                onClick={() => handleRewardClick(reward)}
              />
            ))}
          </div>
        )}

        {/* Reward Detail Dialog */}
        <RewardDetailDialog
          reward={selectedReward}
          isOpen={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false);
            setSelectedReward(null);
          }}
          onEdit={setEditingReward}
          onDelete={handleDeleteReward}
          onAchieve={handleAchieveReward}
        />

        {/* Add/Edit Reward Dialog */}
        <AddRewardDialog
          isOpen={isAddDialogOpen || !!editingReward}
          onClose={() => {
            setIsAddDialogOpen(false);
            setEditingReward(undefined);
          }}
          onSubmit={editingReward ? handleEditReward : handleAddReward}
          editingReward={editingReward}
        />
      </div>
    </div>
  );
}

export default function RewardsPage() {
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
      <RewardsContent />
    </ChallengeProvider>
  );
}
