"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChallengeProvider, useChallengeContext } from "@/contexts/ChallengeContext";
import { useSession } from "@/lib/auth-client";
import { Beat } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Calendar, Target, Trophy, ChevronDown, X, Edit, Trash2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { AuthenticationPage } from "@/components/auth/authentication-page";

interface BeatItemProps {
  beat: Beat;
  onBeatClick: (beat: Beat) => void;
  isToday: boolean;
  isFuture: boolean;
  hasDetails: boolean;
  completionNumber?: number;
}

function BeatItem({ beat, onBeatClick, isToday, isFuture, hasDetails, completionNumber }: BeatItemProps) {
  const handleClick = () => {
    if (!isFuture) {
      onBeatClick(beat);
    }
  };

  return (
    <div
      className={cn(
        "beat-item",
        hasDetails && "beat-completed",
        !hasDetails && !isFuture && "beat-pending",
        isFuture && "beat-future",
        isToday && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={handleClick}
      title={`Day ${beat.dayNumber}${isToday ? ' (Today)' : ''}`}
    >
      {hasDetails && completionNumber}
    </div>
  );
}

interface BeatGridProps {
  beats: Beat[];
  onBeatClick: (beat: Beat) => void;
  getBeatDetails: (beatId: string) => any[];
  isTransitioning?: boolean;
}

function BeatGrid({ beats, onBeatClick, getBeatDetails, isTransitioning }: BeatGridProps) {
  const today = new Date();
  const todayStr = today.toDateString();

  // Calculate completion numbers for completed beats
  const completedBeats = beats.filter(beat => {
    const beatDetails = getBeatDetails(beat.id);
    return beatDetails && beatDetails.length > 0;
  });

  // Determine grid class based on number of beats
  const getGridClass = (beatCount: number) => {
    if (beatCount <= 1) return "grid-1";
    if (beatCount <= 2) return "grid-2";
    if (beatCount <= 3) return "grid-3";
    if (beatCount <= 4) return "grid-4";
    if (beatCount <= 5) return "grid-5";
    if (beatCount <= 6) return "grid-6";
    if (beatCount <= 7) return "grid-7";
    // For 91 beats (7x13 grid)
    if (beatCount === 91) return "grid-91";
    // For other counts, use the default 7x13 grid
    return "grid-91";
  };

  const gridClass = getGridClass(beats.length);

  return (
    <div className={cn("beat-grid", gridClass, isTransitioning && "phase-transitioning")}>
      {beats.map((beat) => {
        const beatDate = new Date(beat.date);
        const isValidDate = !isNaN(beatDate.getTime());
        const isToday = isValidDate && beatDate.toDateString() === todayStr;
        const isFuture = isValidDate && beatDate > today;
        const beatDetails = getBeatDetails(beat.id);
        const hasDetails = beatDetails && beatDetails.length > 0;
        
        // Find the completion number for this beat
        const completionNumber = hasDetails 
          ? completedBeats.findIndex(completedBeat => completedBeat.id === beat.id) + 1
          : undefined;

        return (
          <BeatItem
            key={beat.id}
            beat={beat}
            onBeatClick={onBeatClick}
            isToday={isToday}
            isFuture={isFuture}
            hasDetails={hasDetails}
            completionNumber={completionNumber}
          />
        );
      })}
    </div>
  );
}

interface PhaseNavigationProps {
  phases: Array<{
    number: number;
    startDay: number;
    endDay: number;
    beats: Beat[];
    isActive: boolean;
    isFinal: boolean;
  }>;
  currentPhase: number;
  onPhaseChange: (phaseNumber: number) => void;
  getBeatDetails: (beatId: string) => any[];
  isTransitioning?: boolean;
}

function PhaseNavigation({ phases, currentPhase, onPhaseChange, getBeatDetails, isTransitioning }: PhaseNavigationProps) {
  if (phases.length <= 1) return null;

  return (
    <div className="phase-nav">
      {phases.map((phase) => {
        const completedDays = phase.beats.filter(beat => {
          const beatDetails = getBeatDetails(beat.id);
          return beatDetails && beatDetails.length > 0;
        }).length;
        const totalDays = phase.beats.length;
        const isActive = currentPhase === phase.number;
        
        return (
          <button
            key={phase.number}
            className={cn(
              "phase-badge",
              isActive && "active",
              phase.isFinal && "final",
              isTransitioning && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => onPhaseChange(phase.number)}
            disabled={isTransitioning}
          >
            {isActive 
              ? (phase.isFinal ? `Final Day (${completedDays}/${totalDays})` : `Phase ${phase.number} (${completedDays}/${totalDays})`)
              : (phase.isFinal ? 'Final Day' : `Phase ${phase.number}`)
            }
          </button>
        );
      })}
    </div>
  );
}

interface BeatDetailDialogProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
}

function BeatDetailDialog({ beat, isOpen, onClose }: BeatDetailDialogProps) {
  const { getBeatDetails, addBeatDetail, updateBeatDetail, deleteBeatDetail, beatDetails } = useChallengeContext();
  const [details, setDetails] = useState<any[]>([]);
  const [newDetail, setNewDetail] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDetail, setEditingDetail] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [copiedDetail, setCopiedDetail] = useState<string | null>(null);

  // Get all available categories
  const availableCategories = Array.from(
    new Set(beatDetails.map(d => d.category).filter(Boolean) as string[])
  ).sort();

  useEffect(() => {
    if (beat) {
      const beatDetails = getBeatDetails(beat.id);
      setDetails(beatDetails);
      // If there are existing details, show them; otherwise show add form
      setShowAddForm(beatDetails.length === 0);
    }
  }, [beat, getBeatDetails]);

  const handleAddDetail = async () => {
    if (!beat || !newDetail.trim()) return;

    // Additional safety check: prevent adding details to future beats
    const beatDate = new Date(beat.date);
    const isValidDate = !isNaN(beatDate.getTime());
    const isFuture = isValidDate && beatDate > new Date();
    
    if (isFuture) {
      console.warn('Cannot add details to future beats');
      return;
    }

    try {
      await addBeatDetail(beat.id, newDetail, newCategory || undefined);
      setNewDetail('');
      setNewCategory('');
      // Refresh details
      const beatDetails = getBeatDetails(beat.id);
      setDetails(beatDetails);
      // Close the dialog after saving
      onClose();
    } catch (error) {
      console.error('Error adding detail:', error);
    }
  };

  const handleEditDetail = (detail: any) => {
    setEditingDetail(detail.id);
    setEditContent(detail.content);
    setEditCategory(detail.category || '');
  };

  const handleSaveEdit = async () => {
    if (!editingDetail || !editContent.trim()) return;

    try {
      await updateBeatDetail(editingDetail, {
        content: editContent,
        category: editCategory || undefined,
      });
      setEditingDetail(null);
      setEditContent('');
      setEditCategory('');
      // Refresh details
      const beatDetails = getBeatDetails(beat!.id);
      setDetails(beatDetails);
    } catch (error) {
      console.error('Error updating detail:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingDetail(null);
    setEditContent('');
    setEditCategory('');
  };

  const handleDeleteDetail = async (detailId: string) => {
    if (!confirm('Are you sure you want to delete this detail?')) return;

    try {
      await deleteBeatDetail(detailId);
      // Refresh details
      const beatDetails = getBeatDetails(beat!.id);
      setDetails(beatDetails);
    } catch (error) {
      console.error('Error deleting detail:', error);
    }
  };

  const handleCopyDetail = async (detail: any) => {
    try {
      await navigator.clipboard.writeText(detail.content);
      setCopiedDetail(detail.id);
      setTimeout(() => setCopiedDetail(null), 2000);
    } catch (error) {
      console.error('Error copying detail:', error);
    }
  };


  if (!beat) return null;

  const beatDate = new Date(beat.date);
  const isValidDate = !isNaN(beatDate.getTime());
  const isToday = isValidDate && beatDate.toDateString() === new Date().toDateString();
  const isFuture = isValidDate && beatDate > new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showAddForm ? 'Add Detail' : `beat Details - Day ${beat.dayNumber}`}
          </DialogTitle>
          <DialogDescription>
            {showAddForm 
              ? 'Details enable a beat to be marked complete.'
              : 'View and manage details for this beat.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {showAddForm ? (
          <form onSubmit={(e) => { e.preventDefault(); handleAddDetail(); }} className="space-y-4">
            <div>
              <Label htmlFor="content">What did you do?</Label>
              <Textarea
                id="content"
                placeholder="Log your work for this beat..."
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
                className="min-h-[100px] resize-y"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Tags (comma-separated)</Label>
              <Input
                id="category"
                placeholder="e.g. Health, Design, Writing"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              {availableCategories.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-2">Previously used tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          const currentTags = newCategory.split(',').map(t => t.trim()).filter(Boolean);
                          if (!currentTags.includes(cat)) {
                            const newTags = [...currentTags, cat].join(', ');
                            setNewCategory(newTags);
                          }
                        }}
                        className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Show existing details */}
            {details.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Existing Details:</h4>
                {details.map((detail, index) => (
                  <div key={detail.id} className="p-3 bg-muted/50 rounded-md">
                    {editingDetail === detail.id ? (
                      /* Edit mode */
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`edit-content-${detail.id}`}>Content</Label>
                          <Textarea
                            id={`edit-content-${detail.id}`}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[80px] resize-y"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-category-${detail.id}`}>Tags (comma-separated)</Label>
                          <Input
                            id={`edit-category-${detail.id}`}
                            placeholder="e.g. Health, Design, Writing"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={handleCancelEdit}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="button" 
                            size="sm"
                            onClick={handleSaveEdit}
                            className="flex-1"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{detail.content}</p>
                            {detail.category && (
                              <div className="mt-2">
                                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                                  {detail.category}
                                </span>
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-2">
                              Added {detail.createdAt.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDetail(detail)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyDetail(detail)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedDetail === detail.id ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDetail(detail.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No details added yet.</p>
              </div>
            )}
            
            {/* Add another detail button */}
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button 
                type="button" 
                onClick={() => setShowAddForm(true)}
                className="flex-1"
              >
                Add Another Detail
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BeatsContent({ userId }: { userId: string }) {
  const {
    currentChallenge,
    beats,
    isLoading,
    getPhases,
    getBeatDetails,
  } = useChallengeContext();

  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const searchParams = useSearchParams();

  const phases = getPhases();
  const currentPhaseData = phases.find(p => p.number === currentPhase);
  const currentPhaseBeats = currentPhaseData?.beats || [];

  // Handle deep linking with date parameter
  useEffect(() => {
    const dateParam = searchParams.get('key');
    if (dateParam && beats.length > 0) {
      const targetDate = new Date(dateParam);
      const targetBeat = beats.find(beat => 
        new Date(beat.date).toDateString() === targetDate.toDateString()
      );
      
      if (targetBeat) {
        // Find which phase contains this beat
        const phaseWithBeat = phases.find(phase => 
          phase.beats.some(b => b.id === targetBeat.id)
        );
        
        if (phaseWithBeat) {
          setCurrentPhase(phaseWithBeat.number);
        }
        
        setSelectedBeat(targetBeat);
        setIsDialogOpen(true);
      }
    }
  }, [searchParams, beats, phases]);

  const handleBeatClick = (beat: Beat) => {
    setSelectedBeat(beat);
    setIsDialogOpen(true);
  };


  const handlePhaseChange = (newPhase: number) => {
    if (newPhase === currentPhase || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // After slide-out animation completes, change phase and slide in
    setTimeout(() => {
      setCurrentPhase(newPhase);
      setIsTransitioning(false);
    }, 300); // Match the slide-out animation duration
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded-md mb-4"></div>
            <div className="h-4 bg-muted rounded-md mb-8"></div>
            <div className="beat-grid">
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} className="beat-item bg-muted"></div>
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
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold">No Active Challenge</h2>
          <p className="text-muted-foreground">
            Create your first challenge to start tracking your daily progress.
          </p>
          <Button asChild>
            <Link href="/settings">Create Challenge</Link>
          </Button>
        </div>
      </div>
    );
  }

  const completionRate = currentChallenge.totalBeats > 0 
    ? Math.round((currentChallenge.completedBeats / currentChallenge.totalBeats) * 100)
    : 0;

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Challenge Header */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>
              <span className="truncate">{currentChallenge.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {currentChallenge.completedBeats}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {completionRate}%
                </div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {currentChallenge.rewardsCount}
                </div>
                <div className="text-xs text-muted-foreground">Rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase Navigation */}
        <PhaseNavigation 
          phases={phases}
          currentPhase={currentPhase}
          onPhaseChange={handlePhaseChange}
          getBeatDetails={getBeatDetails}
          isTransitioning={isTransitioning}
        />

        {/* Beat Grid */}
        <BeatGrid 
          beats={currentPhaseBeats}
          onBeatClick={handleBeatClick}
          getBeatDetails={getBeatDetails}
          isTransitioning={isTransitioning}
        />

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 beat-completed rounded-md shadow-sm"></div>
            <span className="font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 beat-pending rounded-md shadow-sm"></div>
            <span className="font-medium">Pending</span>
          </div>
        </div>

        {/* Beat Detail Dialog */}
        <BeatDetailDialog
          beat={selectedBeat}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedBeat(null);
          }}
        />

      </div>
    </div>
    </>
  );
}

export default function BeatsPage() {
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
      <BeatsContent userId={session.user.id} />
    </ChallengeProvider>
  );
}
