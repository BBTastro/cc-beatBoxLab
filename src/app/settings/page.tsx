"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChallengeProvider, useChallengeContext } from "@/contexts/ChallengeContext";
import { useSession } from "@/lib/auth-client";
import { useDieterHermanTheme } from "@/hooks/use-dieter-herman-theme";
import { Challenge, ChallengeForm, ChallengeTemplate, Beat, BeatDetail, Reward } from "@/lib/types";
import { CHALLENGE_TEMPLATES } from "@/lib/challenge-templates";
import { isAdmin, clearAllUserData } from "@/lib/admin";
import { 
  Settings as SettingsIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Download,
  User,
  AlertTriangle,
  Calendar,
  Target,
  MoreVertical,
  Zap,
  Award,
  MessageSquare,
  FileText,
  FileSpreadsheet,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthenticationPage } from "@/components/auth/authentication-page";

interface ChallengeCardProps {
  challenge: Challenge;
  isDefault: boolean;
  onEdit: (challenge: Challenge) => void;
  onDelete: (challengeId: string) => void;
  onSetActive: (challengeId: string) => void;
}

function ChallengeCard({ challenge, isDefault, onEdit, onDelete, onSetActive }: ChallengeCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [completionRate, setCompletionRate] = useState(0);
  const { getChallengeCompletionStats } = useChallengeContext();

  // Calculate actual completion rate based on beats data
  useEffect(() => {
    const calculateCompletionRate = async () => {
      try {
        const stats = await getChallengeCompletionStats(challenge.id);
        setCompletionRate(stats.percentage);
      } catch (error) {
        console.error('Error calculating completion rate:', error);
        setCompletionRate(0);
      }
    };

    calculateCompletionRate();

    // Listen for beat completion events to refresh completion rate
    const handleBeatEvent = () => {
      calculateCompletionRate();
    };

    window.addEventListener('beatbox-beat-completed', handleBeatEvent);
    window.addEventListener('beatbox-beat-uncompleted', handleBeatEvent);
    window.addEventListener('beatbox-data-refresh', handleBeatEvent);

    return () => {
      window.removeEventListener('beatbox-beat-completed', handleBeatEvent);
      window.removeEventListener('beatbox-beat-uncompleted', handleBeatEvent);
      window.removeEventListener('beatbox-data-refresh', handleBeatEvent);
    };
  }, [challenge.id, getChallengeCompletionStats]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActions) {
        const target = event.target as Element;
        if (!target.closest('.challenge-card-actions')) {
          setShowActions(false);
        }
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  return (
    <Card className={cn("relative", challenge.status === 'active' && "ring-2 ring-primary")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg truncate">{challenge.title}</CardTitle>
            {challenge.status === 'active' ? (
              <Badge variant="default" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : challenge.status ? (
              <Badge variant="secondary" className="text-xs">
                {challenge.status}
              </Badge>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {showActions && (
          <div className="challenge-card-actions absolute top-14 right-4 z-10 bg-card border rounded-lg shadow-lg p-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(challenge);
                setShowActions(false);
              }}
              className="w-full justify-start"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {challenge.status !== 'active' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSetActive(challenge.id);
                  setShowActions(false);
                }}
                className="w-full justify-start"
              >
                <Star className="h-4 w-4 mr-2" />
                Set Active
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(challenge.id);
                setShowActions(false);
              }}
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {challenge.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {challenge.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <div className="font-medium">{challenge.duration}</div>
            <div className="text-xs text-muted-foreground">Days</div>
          </div>
          <div>
            <div className="font-medium">{completionRate}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {challenge.startDate.toLocaleDateString()} - {challenge.endDate.toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CreateChallengeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (challenge: ChallengeForm) => void;
  editingChallenge?: Challenge;
}

function CreateChallengeDialog({ isOpen, onClose, onSubmit, editingChallenge }: CreateChallengeDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ChallengeTemplate | null>(null);
  const [step, setStep] = useState<'template' | 'form'>('template');
  const [formData, setFormData] = useState<ChallengeForm>({
    title: editingChallenge?.title || '',
    description: editingChallenge?.description || '',
    duration: editingChallenge?.duration || 30,
    startDate: editingChallenge?.startDate || new Date(),
  });

  // Reset state when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep('template');
      setSelectedTemplate(null);
      if (!editingChallenge) {
        setFormData({
          title: '',
          description: '',
          duration: 30,
          startDate: new Date(),
        });
      }
      onClose();
    }
  };

  const handleTemplateSelect = (template: ChallengeTemplate) => {
    setSelectedTemplate(template);
    // Parse the date as local time to avoid timezone issues
    const [year, month, day] = template.defaultStartDate.split('-').map(Number);
    const startDate = new Date(year, month - 1, day); // month is 0-indexed
    
    setFormData({
      title: template.defaultTitle,
      description: template.defaultDescription,
      duration: template.dayCount,
      startDate: startDate,
      templateId: template.id,
      motivationalStatement: template.motivationalStatement,
      rewards: template.rewards,
    });
    setStep('form');
  };

  const handleCustomChallenge = () => {
    setSelectedTemplate(null);
    setFormData({
      title: '',
      description: '',
      duration: 30,
      startDate: new Date(),
    });
    setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit(formData);
    handleOpenChange(false);
  };

  // Skip template selection when editing
  const showTemplateSelection = !editingChallenge && step === 'template';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {editingChallenge ? 'Edit Challenge' : 
             showTemplateSelection ? 'Choose a Template' : 
             selectedTemplate ? `Create ${selectedTemplate.name}` : 'Create Custom Challenge'}
          </DialogTitle>
          <DialogDescription>
            {editingChallenge ? 'Update your challenge details and settings.' : 
             showTemplateSelection ? 'Select a template to get started with your challenge.' : 
             selectedTemplate ? `Create a new challenge based on the ${selectedTemplate.name} template.` : 'Create a custom challenge tailored to your specific goals.'}
          </DialogDescription>
        </DialogHeader>

        {showTemplateSelection ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose from our curated challenge templates or create a custom challenge from scratch.
            </p>
            
            <div className="grid gap-4">
              {CHALLENGE_TEMPLATES.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleTemplateSelect(template)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary">{template.dayCount} days</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.suggestedCategories.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>{template.rewards.length} rewards included</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>Motivational statement</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed" onClick={handleCustomChallenge}>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">Create Custom Challenge</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Start from scratch with your own challenge
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedTemplate && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">Template: {selectedTemplate.name}</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setStep('template')}
                  >
                    Change Template
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This template includes {selectedTemplate.rewards.length} rewards and a motivational statement. You can customize everything below.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="title">Challenge Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., 100 Days of Code"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What do you want to achieve?"
                className="min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    // Parse the date as local time to avoid timezone issues
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    const localDate = new Date(year, month - 1, day); // month is 0-indexed
                    setFormData({ ...formData, startDate: localDate });
                  }}
                  required
                />
              </div>
            </div>

            {formData.motivationalStatement && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <Label className="font-medium">Motivational Statement</Label>
                </div>
                
                <div>
                  <Label htmlFor="statementTitle" className="text-sm">Title</Label>
                  <Input
                    id="statementTitle"
                    value={formData.motivationalStatement.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      motivationalStatement: {
                        ...formData.motivationalStatement!,
                        title: e.target.value
                      }
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="statement" className="text-sm">Statement</Label>
                  <Textarea
                    id="statement"
                    value={formData.motivationalStatement.statement}
                    onChange={(e) => setFormData({
                      ...formData,
                      motivationalStatement: {
                        ...formData.motivationalStatement!,
                        statement: e.target.value
                      }
                    })}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="why" className="text-sm">Why</Label>
                  <Textarea
                    id="why"
                    value={formData.motivationalStatement.why}
                    onChange={(e) => setFormData({
                      ...formData,
                      motivationalStatement: {
                        ...formData.motivationalStatement!,
                        why: e.target.value
                      }
                    })}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="collaboration" className="text-sm">Collaboration</Label>
                  <Textarea
                    id="collaboration"
                    value={formData.motivationalStatement.collaboration}
                    onChange={(e) => setFormData({
                      ...formData,
                      motivationalStatement: {
                        ...formData.motivationalStatement!,
                        collaboration: e.target.value
                      }
                    })}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}

            {formData.rewards && formData.rewards.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <Label className="font-medium">Rewards ({formData.rewards.length})</Label>
                </div>
                
                <div className="space-y-3">
                  {formData.rewards.map((reward, index) => (
                    <Card key={index} className="p-3">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`reward-title-${index}`} className="text-xs">Title</Label>
                            <Input
                              id={`reward-title-${index}`}
                              value={reward.title}
                              onChange={(e) => {
                                const updatedRewards = [...formData.rewards!];
                                updatedRewards[index] = { ...reward, title: e.target.value };
                                setFormData({ ...formData, rewards: updatedRewards });
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`reward-value-${index}`} className="text-xs">Milestone</Label>
                            <Input
                              id={`reward-value-${index}`}
                              value={reward.value}
                              onChange={(e) => {
                                const updatedRewards = [...formData.rewards!];
                                updatedRewards[index] = { ...reward, value: e.target.value };
                                setFormData({ ...formData, rewards: updatedRewards });
                              }}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`reward-description-${index}`} className="text-xs">Description</Label>
                          <Textarea
                            id={`reward-description-${index}`}
                            value={reward.description}
                            onChange={(e) => {
                              const updatedRewards = [...formData.rewards!];
                              updatedRewards[index] = { ...reward, description: e.target.value };
                              setFormData({ ...formData, rewards: updatedRewards });
                            }}
                            className="min-h-[60px] text-sm"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              {!editingChallenge && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('template')}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingChallenge ? 'Update' : 'Create'} Challenge
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SettingsContent() {
  const {
    currentChallenge,
    challenges,
    beats,
    beatDetails,
    rewards,
    motivationalStatements,
    isLoading,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    setDefaultChallenge,
    ensureOnlyOneActive,
    addReward,
    addMotivationalStatement,
    refreshData,
    setChallengeActive,
  } = useChallengeContext();

  const { data: session } = useSession();
  const { isDieterHerman, toggleDieterHerman } = useDieterHermanTheme();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedChallengeForExport, setSelectedChallengeForExport] = useState<string>('all');

  // Fix any multiple active challenges on load
  useEffect(() => {
    if (challenges.length > 0) {
      ensureOnlyOneActive();
    }
  }, [challenges.length, ensureOnlyOneActive]);

  // Export functionality
  const exportData = async (format: 'json' | 'csv' | 'md', challengeId: string = 'all') => {
    if (!session?.user?.id) return;
    
    setIsExporting(true);
    
    try {
      // Filter challenges based on selection
      const filteredChallenges = challengeId === 'all' 
        ? challenges 
        : challenges.filter(c => c.id === challengeId);
      
      const challengeMap = challenges.reduce((acc, challenge) => {
        acc[challenge.id] = challenge.title;
        return acc;
      }, {} as Record<string, string>);

      // Filter data based on selected challenge(s)
      const filteredBeats = challengeId === 'all' 
        ? beats 
        : beats.filter(b => b.challengeId === challengeId);

      const filteredBeatDetails = challengeId === 'all' 
        ? beatDetails 
        : beatDetails.filter(d => {
            const beat = beats.find(b => b.id === d.beatId);
            return beat && beat.challengeId === challengeId;
          });

      const filteredRewards = challengeId === 'all' 
        ? rewards 
        : rewards.filter(r => r.challengeId === challengeId);

      // Filter motivational statements - these are user-wide, so include all for 'all', none for specific challenge
      const filteredMotivationalStatements = challengeId === 'all' 
        ? motivationalStatements 
        : [];

      const enrichedBeats = filteredBeats.map((beat: Beat) => ({
        ...beat,
        challengeTitle: challengeMap[beat.challengeId] || 'Unknown Challenge'
      }));

      const enrichedBeatDetails = filteredBeatDetails.map((detail: BeatDetail) => {
        const beat = beats.find(b => b.id === detail.beatId);
        return {
          ...detail,
          beatDayNumber: beat?.dayNumber || 0,
          beatDate: beat?.date,
          challengeId: beat?.challengeId || '',
          challengeTitle: challengeMap[beat?.challengeId || ''] || 'Unknown Challenge'
        };
      });

      const enrichedRewards = filteredRewards.map((reward: Reward) => ({
        ...reward,
        challengeTitle: challengeMap[reward.challengeId] || 'Unknown Challenge'
      }));
      
      const exportedData = {
        exportDate: new Date().toISOString(),
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        },
        challenges: filteredChallenges.map(challenge => ({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          duration: challenge.duration,
          status: challenge.status,
          startDate: challenge.startDate.toISOString(),
          endDate: challenge.endDate.toISOString(),
          createdAt: challenge.createdAt.toISOString(),
          updatedAt: challenge.updatedAt.toISOString(),
        })),
        beats: enrichedBeats.map((beat) => ({
          id: beat.id,
          challengeId: beat.challengeId,
          challengeTitle: beat.challengeTitle,
          dayNumber: beat.dayNumber,
          date: beat.date.toISOString(),
          isCompleted: beat.isCompleted,
          completedAt: beat.completedAt?.toISOString() || null,
          createdAt: beat.createdAt.toISOString(),
          updatedAt: beat.updatedAt.toISOString(),
        })),
        beatDetails: enrichedBeatDetails.map((detail) => ({
          id: detail.id,
          beatId: detail.beatId,
          beatDayNumber: detail.beatDayNumber,
          beatDate: detail.beatDate?.toISOString() || null,
          challengeId: detail.challengeId,
          challengeTitle: detail.challengeTitle,
          content: detail.content,
          category: detail.category,
          createdAt: detail.createdAt.toISOString(),
          updatedAt: detail.updatedAt.toISOString(),
        })),
        rewards: enrichedRewards.map((reward) => ({
          id: reward.id,
          challengeId: reward.challengeId,
          challengeTitle: reward.challengeTitle,
          title: reward.title,
          description: reward.description,
          status: reward.status,
          proofUrl: reward.proofUrl,
          achievedAt: reward.achievedAt?.toISOString() || null,
          createdAt: reward.createdAt.toISOString(),
          updatedAt: reward.updatedAt.toISOString(),
        })),
        motivationalStatements: filteredMotivationalStatements.map((statement) => ({
          id: statement.id,
          title: statement.title,
          statement: statement.statement,
          why: statement.why,
          collaboration: statement.collaboration,
          createdAt: statement.createdAt.toISOString(),
          updatedAt: statement.updatedAt.toISOString(),
        })),
      };

      // Generate filename with challenge name or "ALL"
      const rawChallengeName = challengeId === 'all' 
        ? 'ALL' 
        : (challengeMap[challengeId] || 'Unknown');
      
      // Better filename sanitization - remove special chars and collapse multiple dashes
      const challengeName = rawChallengeName
        .replace(/[^\w\s-]/g, '') // Remove special chars except word chars, spaces, dashes
        .replace(/\s+/g, '-')     // Replace spaces with dashes
        .replace(/-+/g, '-')      // Collapse multiple dashes
        .replace(/^-|-$/g, '')    // Remove leading/trailing dashes
        .substring(0, 50);        // Limit length
      
      const dateStamp = new Date().toISOString().split('T')[0];
      
      // Generate and download file based on format
      let filename: string, content: string, mimeType: string;
      
      if (format === 'json') {
        filename = `beatbox-${challengeName}-${dateStamp}.json`;
        content = JSON.stringify(exportedData, null, 2);
        mimeType = 'application/json';
      } else if (format === 'csv') {
        filename = `beatbox-${challengeName}-${dateStamp}.csv`;
        content = convertToCSV(exportedData);
        mimeType = 'text/csv';
      } else {
        filename = `beatbox-${challengeName}-${dateStamp}.md`;
        content = convertToMarkdown(exportedData);
        mimeType = 'text/markdown';
      }

      // Create and download file
      console.log('Creating download:', filename, 'Size:', content.length, 'bytes');
      console.log('Challenge name processing:', { rawChallengeName, challengeName });
      
      // Simple, reliable download method
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.style.position = 'fixed';
      downloadLink.style.top = '-9999px';
      downloadLink.style.left = '-9999px';
      
      // Add to DOM, click, and remove
      document.body.appendChild(downloadLink);
      console.log('Link created and added to DOM');
      
      // Use a small delay to ensure the link is properly added
      setTimeout(() => {
        downloadLink.click();
        console.log('Download link clicked');
        
        // Clean up after download
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
          console.log('Cleanup completed');
        }, 500);
        
        // Close dialog and show success message
        setShowExportDialog(false);
        setSelectedChallengeForExport('all');
        
        // Don't show alert immediately, let user check their downloads
        console.log(`File "${filename}" download triggered`);
      }, 100);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any) => {
    let csv = '';
    
    // Challenges CSV
    csv += 'CHALLENGES\n';
    csv += 'ID,Title,Description,Duration,Status,Start Date,End Date,Created At,Updated At\n';
    data.challenges.forEach((challenge: any) => {
      csv += `"${challenge.id}","${challenge.title}","${challenge.description || ''}",${challenge.duration},"${challenge.status}","${challenge.startDate}","${challenge.endDate}","${challenge.createdAt}","${challenge.updatedAt}"\n`;
    });
    
    csv += '\nBEATS\n';
    csv += 'ID,Challenge ID,Challenge Title,Day Number,Date,Is Completed,Completed At,Created At,Updated At\n';
    data.beats.forEach((beat: any) => {
      csv += `"${beat.id}","${beat.challengeId}","${beat.challengeTitle}",${beat.dayNumber},"${beat.date}",${beat.isCompleted},"${beat.completedAt || ''}","${beat.createdAt}","${beat.updatedAt}"\n`;
    });
    
    csv += '\nBEAT DETAILS\n';
    csv += 'ID,Beat ID,Beat Day Number,Beat Date,Challenge ID,Challenge Title,Content,Category,Created At,Updated At\n';
    data.beatDetails.forEach((detail: any) => {
      csv += `"${detail.id}","${detail.beatId}",${detail.beatDayNumber},"${detail.beatDate || ''}","${detail.challengeId}","${detail.challengeTitle}","${detail.content}","${detail.category || ''}","${detail.createdAt}","${detail.updatedAt}"\n`;
    });
    
    csv += '\nREWARDS\n';
    csv += 'ID,Challenge ID,Challenge Title,Title,Description,Status,Proof URL,Achieved At,Created At,Updated At\n';
    data.rewards.forEach((reward: any) => {
      csv += `"${reward.id}","${reward.challengeId}","${reward.challengeTitle}","${reward.title}","${reward.description || ''}","${reward.status}","${reward.proofUrl || ''}","${reward.achievedAt || ''}","${reward.createdAt}","${reward.updatedAt}"\n`;
    });
    
    csv += '\nMOTIVATIONAL STATEMENTS\n';
    csv += 'ID,Title,Statement,Why,Collaboration,Created At,Updated At\n';
    data.motivationalStatements.forEach((statement: any) => {
      csv += `"${statement.id}","${statement.title}","${statement.statement}","${statement.why || ''}","${statement.collaboration || ''}","${statement.createdAt}","${statement.updatedAt}"\n`;
    });
    
    return csv;
  };

  const convertToMarkdown = (data: any) => {
    let md = `# beatBox Data Export\n\n`;
    md += `**Export Date:** ${data.exportDate}\n`;
    md += `**User:** ${data.user.name} (${data.user.email})\n\n`;
    
    md += `## Challenges (${data.challenges.length})\n\n`;
    data.challenges.forEach((challenge: any) => {
      md += `### ${challenge.title}\n`;
      md += `- **Status:** ${challenge.status}\n`;
      md += `- **Duration:** ${challenge.duration} days\n`;
      md += `- **Period:** ${challenge.startDate.split('T')[0]} to ${challenge.endDate.split('T')[0]}\n`;
      if (challenge.description) {
        md += `- **Description:** ${challenge.description}\n`;
      }
      md += `\n`;
    });
    
    md += `## Beat Details (${data.beatDetails.length})\n\n`;
    const groupedDetails = data.beatDetails.reduce((acc: any, detail: any) => {
      if (!acc[detail.challengeTitle]) acc[detail.challengeTitle] = [];
      acc[detail.challengeTitle].push(detail);
      return acc;
    }, {});
    
    Object.entries(groupedDetails).forEach(([challengeTitle, details]: [string, any]) => {
      md += `### ${challengeTitle}\n\n`;
      details
        .sort((a: any, b: any) => a.beatDayNumber - b.beatDayNumber)
        .forEach((detail: any) => {
          md += `**Day ${detail.beatDayNumber}** (${detail.beatDate?.split('T')[0] || 'No date'})\n`;
          if (detail.category) md += `*Category: ${detail.category}*\n`;
          md += `${detail.content}\n\n`;
        });
    });
    
    md += `## Rewards (${data.rewards.length})\n\n`;
    const groupedRewards = data.rewards.reduce((acc: any, reward: any) => {
      if (!acc[reward.challengeTitle]) acc[reward.challengeTitle] = [];
      acc[reward.challengeTitle].push(reward);
      return acc;
    }, {});
    
    Object.entries(groupedRewards).forEach(([challengeTitle, rewards]: [string, any]) => {
      md += `### ${challengeTitle}\n\n`;
      rewards.forEach((reward: any) => {
        md += `- **${reward.title}** (${reward.status})\n`;
        if (reward.description) md += `  ${reward.description}\n`;
        if (reward.achievedAt) md += `  *Achieved: ${reward.achievedAt.split('T')[0]}*\n`;
        md += `\n`;
      });
    });
    
    if (data.motivationalStatements.length > 0) {
      md += `## Motivational Statements (${data.motivationalStatements.length})\n\n`;
      data.motivationalStatements.forEach((statement: any) => {
        md += `### ${statement.title}\n`;
        md += `${statement.statement}\n\n`;
        if (statement.why) {
          md += `**Why:** ${statement.why}\n\n`;
        }
        if (statement.collaboration) {
          md += `**Collaboration:** ${statement.collaboration}\n\n`;
        }
      });
    }
    
    return md;
  };

  const handleCreateChallenge = async (formData: ChallengeForm) => {
    try {
      const endDate = new Date(formData.startDate);
      endDate.setDate(endDate.getDate() + formData.duration - 1);

      const newChallenge = await createChallenge({
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        startDate: formData.startDate,
        endDate,
        isDefault: challenges.length === 0, // First challenge becomes default
        templateId: formData.templateId,
      });

      // Set the new challenge as default and add rewards if this is the first challenge
      if (challenges.length === 0) {
        await setDefaultChallenge(newChallenge.id);
        
        // If template includes motivational statement, add it to the challenge
        if (formData.motivationalStatement) {
          await addMotivationalStatement({
            title: formData.motivationalStatement.title,
            statement: formData.motivationalStatement.statement,
            why: formData.motivationalStatement.why,
            collaboration: formData.motivationalStatement.collaboration,
            challengeId: newChallenge.id,
          });
        }
        
        // If template includes rewards, add them to the challenge
        if (formData.rewards && formData.rewards.length > 0) {
          for (const reward of formData.rewards) {
            await addReward({
              title: reward.title,
              description: reward.description,
              status: reward.status.toLowerCase() as 'planned' | 'active' | 'achieved',
            }, newChallenge.id);
          }
        }
      } else {
        // For subsequent challenges, we need to temporarily set this as current to add rewards and motivational statements
        const previousDefault = currentChallenge?.id;
        await setDefaultChallenge(newChallenge.id);
        
        // Add a small delay to ensure the challenge context has been updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // If template includes motivational statement, add it to the challenge
        if (formData.motivationalStatement) {
          await addMotivationalStatement({
            title: formData.motivationalStatement.title,
            statement: formData.motivationalStatement.statement,
            why: formData.motivationalStatement.why,
            collaboration: formData.motivationalStatement.collaboration,
            challengeId: newChallenge.id,
          });
        }
        
        if (formData.rewards && formData.rewards.length > 0) {
          for (const reward of formData.rewards) {
            await addReward({
              title: reward.title,
              description: reward.description,
              status: reward.status.toLowerCase() as 'planned' | 'active' | 'achieved',
            }, newChallenge.id);
          }
        }
        
        // Restore the previous default challenge if there was one
        if (previousDefault && previousDefault !== newChallenge.id) {
          await setDefaultChallenge(previousDefault);
        }
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
    }
  };

  const handleEditChallenge = async (formData: ChallengeForm) => {
    if (!editingChallenge) return;

    try {
      const endDate = new Date(formData.startDate);
      endDate.setDate(endDate.getDate() + formData.duration - 1);

      await updateChallenge(editingChallenge.id, {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        startDate: formData.startDate,
        endDate,
      });
      
      setEditingChallenge(undefined);
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    try {
      await deleteChallenge(challengeId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
  };

  const handleSetActive = async (challengeId: string) => {
    try {
      console.log('=== SET ACTIVE DEBUG START ===');
      console.log('Target challenge ID:', challengeId);
      console.log('Current challenges before update:', challenges.map(c => ({ id: c.id, title: c.title, status: c.status })));
      console.log('Current active challenge:', currentChallenge?.id);
      
      // Use the atomic setChallengeActive function
      await setChallengeActive(challengeId);
      
      console.log('=== SET ACTIVE DEBUG END ===');
    } catch (error) {
      console.error('Error setting active challenge:', error);
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      // Clear all localStorage data for this user
      if (session?.user?.id) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes(`beatbox-`) && key.includes(session.user.id)) {
            localStorage.removeItem(key);
          }
        });
        
        // Reload the page to reset state
        window.location.reload();
      }
    }
  };

  const clearAllUserDataAdmin = () => {
    if (confirm('DANGER: This will permanently delete ALL user data for ALL users. Only use this to reset the entire application for everyone. Are you absolutely sure?')) {
      if (confirm('This action cannot be undone. Type "DELETE ALL" to confirm.')) {
        const confirmation = prompt('Type "DELETE ALL" to confirm this action:');
        if (confirmation === "DELETE ALL") {
          clearAllUserData();
          alert('All user data has been cleared. The page will reload.');
          window.location.reload();
        } else {
          alert('Action cancelled. Confirmation text did not match.');
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded-md"></div>
            <div className="h-32 bg-muted rounded-md"></div>
            <div className="h-24 bg-muted rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Challenge Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
            <CardTitle>
              Challenge Management
            </CardTitle>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Challenge
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    isDefault={currentChallenge?.id === challenge.id}
                    onEdit={setEditingChallenge}
                    onDelete={(id) => setShowDeleteConfirm(id)}
                    onSetActive={handleSetActive}
                  />
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Export your challenges, beats, details, rewards, and motivational statements in your preferred format.
              Choose a specific challenge or export all data.
            </p>
            <Button
              onClick={() => setShowExportDialog(true)}
              disabled={challenges.length === 0}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            
            {challenges.length === 0 && (
              <div className="text-sm text-muted-foreground mt-4 text-center">
                Create at least one challenge to export data.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dieter Herman Theme Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dieter Herman</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDieterHerman}
                  onChange={toggleDieterHerman}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">{session?.user?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Total Challenges</Label>
                <p className="text-sm text-muted-foreground">{challenges.length}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Active Challenge</Label>
                <p className="text-sm text-muted-foreground">
                  {challenges.find(c => c.status === 'active')?.title || 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Clear My Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete all your challenges, beats, rewards, allies, and settings. 
              This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={clearAllData}>
              Clear My Data
            </Button>
          </CardContent>
        </Card>

        {/* Admin Section - Only visible to admins */}
        {isAdmin(session?.user?.email) && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Developer Reset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-destructive font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  DANGER: This will permanently delete ALL user data for ALL users.
                </div>
                <p className="text-sm text-muted-foreground">
                  Only use this to reset the entire application for everyone. This action cannot be undone and will affect all users.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={clearAllUserDataAdmin}
                  className="w-full"
                >
                  RESET ALL USER DATA
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Challenge Dialog */}
        <CreateChallengeDialog
          isOpen={isCreateDialogOpen || !!editingChallenge}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingChallenge(undefined);
          }}
          onSubmit={editingChallenge ? handleEditChallenge : handleCreateChallenge}
          editingChallenge={editingChallenge}
        />

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Challenge
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All challenge data, beats, and details will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm">
                  Are you sure you want to delete this challenge? All associated beats, 
                  details, and rewards will be permanently removed.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeleteChallenge(showDeleteConfirm!)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Export Data Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </DialogTitle>
              <DialogDescription>
                Choose which challenge data to export and select your preferred format.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Challenge Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Challenge</Label>
                <Select value={selectedChallengeForExport} onValueChange={setSelectedChallengeForExport}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Challenges</SelectItem>
                    {challenges.map((challenge) => (
                      <SelectItem key={challenge.id} value={challenge.id}>
                        {challenge.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {selectedChallengeForExport === 'all' 
                    ? 'Export all challenges with all associated data including motivational statements.'
                    : 'Export selected challenge with its beats, details, and rewards only.'
                  }
                </p>
              </div>

              {/* Format Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Export Format</Label>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => exportData('json', selectedChallengeForExport)}
                    disabled={isExporting}
                    className="justify-start gap-3 h-auto py-3"
                  >
                    <Database className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">JSON</div>
                      <div className="text-xs text-muted-foreground">
                        Structured data for developers/APIs
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => exportData('csv', selectedChallengeForExport)}
                    disabled={isExporting}
                    className="justify-start gap-3 h-auto py-3"
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">CSV</div>
                      <div className="text-xs text-muted-foreground">
                        Spreadsheet compatible format
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => exportData('md', selectedChallengeForExport)}
                    disabled={isExporting}
                    className="justify-start gap-3 h-auto py-3"
                  >
                    <FileText className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Markdown</div>
                      <div className="text-xs text-muted-foreground">
                        Human-readable documentation
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
              
              {isExporting && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Preparing your export...
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowExportDialog(false)}
                  className="flex-1"
                  disabled={isExporting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function LandingPage() {
  return <AuthenticationPage />;
}

export default function SettingsPage() {
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
    return <LandingPage />;
  }

  return (
    <ChallengeProvider userId={session.user.id}>
      <SettingsContent />
    </ChallengeProvider>
  );
}
