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
import { BeatDetail, DetailFilters } from "@/lib/types";
import { AuthenticationPage } from "@/components/auth/authentication-page";
import { Calendar, Filter, Plus, Search, Tag, ExternalLink, ChevronDown, ChevronUp, X, Edit, Trash2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DetailEntryProps {
  detail: BeatDetail;
  beatNumber?: number;
  beatDate?: Date;
  onViewDetail: (detail: BeatDetail, beatNumber?: number, beatDate?: Date) => void;
  showCount?: boolean;
  showDate?: boolean;
}

interface DetailViewDialogProps {
  detail: BeatDetail | null;
  beatNumber?: number;
  beatDate?: Date;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDetail: (detailId: string, updates: Partial<BeatDetail>) => void;
  onDeleteDetail: (detailId: string) => void;
  availableCategories?: string[];
}

function DetailViewDialog({ detail, beatNumber, beatDate, isOpen, onClose, onUpdateDetail, onDeleteDetail, availableCategories = [] }: DetailViewDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [copiedDetail, setCopiedDetail] = useState(false);
  
  // Get the most up-to-date categories and detail from context
  const { beatDetails } = useChallengeContext();
  const currentAvailableCategories = Array.from(
    new Set(beatDetails.map(d => d.category).filter(Boolean) as string[])
  ).sort();
  
  // Get the most up-to-date detail from context
  const currentDetail = detail ? beatDetails.find(d => d.id === detail.id) || detail : null;

  // Initialize edit values when detail changes
  useEffect(() => {
    if (currentDetail) {
      setEditContent(currentDetail.content);
      setEditCategory(currentDetail.category || '');
    }
  }, [currentDetail]);

  const handleSaveEdit = async () => {
    if (!currentDetail || !editContent.trim()) return;

    try {
      await onUpdateDetail(currentDetail.id, {
        content: editContent,
        category: editCategory.trim() || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating detail:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(currentDetail?.content || '');
    setEditCategory(currentDetail?.category || '');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!currentDetail) return;
    
    if (confirm('Are you sure you want to delete this detail?')) {
      try {
        await onDeleteDetail(currentDetail.id);
        onClose();
      } catch (error) {
        console.error('Error deleting detail:', error);
      }
    }
  };

  const handleCopy = async () => {
    if (!currentDetail) return;

    try {
      await navigator.clipboard.writeText(currentDetail.content);
      setCopiedDetail(true);
      setTimeout(() => setCopiedDetail(false), 2000);
    } catch (error) {
      console.error('Error copying detail:', error);
    }
  };

  // Validate and format the date safely
  const isValidDate = beatDate && !isNaN(beatDate.getTime());
  const formattedDate = isValidDate 
    ? beatDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    : 'Invalid Date';

  if (!currentDetail) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>beat Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formattedDate}</span>
            {beatNumber && (
              <Badge variant="outline">Day {beatNumber}</Badge>
            )}
          </div>

          {/* Content */}
          <div>
            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] resize-y"
                required
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap p-3 bg-muted/50 rounded-md">
                {currentDetail.content}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            {isEditing ? (
              <div>
                <Input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="e.g. Health, Design, Writing"
                />
                {currentAvailableCategories.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-2">Previously used tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {currentAvailableCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            const currentTags = editCategory.split(',').map(t => t.trim()).filter(Boolean);
                            if (!currentTags.includes(cat)) {
                              const newTags = [...currentTags, cat].join(', ');
                              setEditCategory(newTags);
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
            ) : (
              <div>
                {currentDetail.category ? (
                  <Badge variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {currentDetail.category}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
            >
              {copiedDetail ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            
            {isEditing ? (
              <>
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
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Added {currentDetail.createdAt.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailEntry({ detail, beatNumber, beatDate, onViewDetail, showCount = true, showDate = true }: DetailEntryProps) {
  // Validate and format the date safely
  const isValidDate = beatDate && !isNaN(beatDate.getTime());
  const formattedDate = isValidDate 
    ? beatDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    : 'Invalid Date';
  
  const dateString = isValidDate 
    ? beatDate.toISOString().split('T')[0]
    : '';

  const handleClick = () => {
    onViewDetail(detail, beatNumber, beatDate);
  };

  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-primary/5 hover:border-primary/20 border" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Main content with better typography */}
          <div className="leading-relaxed">
            <p className="text-foreground/90 text-sm leading-6 group-hover:text-foreground transition-colors line-clamp-3">
              {detail.content}
            </p>
          </div>
          
          {/* Metadata section with improved layout */}
          {(showCount && beatNumber) || (showDate && isValidDate) || detail.category ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Left side: Date and day count */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {showDate && isValidDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span className="font-medium">
                      {formattedDate}
                    </span>
                  </div>
                )}
                {showCount && beatNumber && (
                  <Badge variant="outline" className="text-xs h-5 px-2 font-medium">
                    Day {beatNumber}
                  </Badge>
                )}
              </div>
              
              {/* Right side: Category tag */}
              <div className="flex-shrink-0">
                {detail.category && (
                  <Badge variant="secondary" className="text-xs h-5 px-2 bg-secondary/70 hover:bg-secondary transition-colors">
                    <Tag className="h-2.5 w-2.5 mr-1" />
                    {detail.category}
                  </Badge>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

interface AddDetailDialogProps {
  onAddDetail: (content: string, category?: string, date?: Date) => void;
  availableCategories?: string[];
}

function AddDetailDialog({ onAddDetail, availableCategories = [] }: AddDetailDialogProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    // Parse the date as local time to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    
    onAddDetail(content, category || undefined, localDate);
    setContent('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setContent('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Detail</DialogTitle>
          <DialogDescription>
            Details enable a beat to be marked complete.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="pr-8"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="content">What did you do?</Label>
            <Textarea
              id="content"
              placeholder="Log your work for this beat..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-y"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Tags (comma-separated)</Label>
            <Input
              id="category"
              placeholder="e.g. Health, Design, Writing"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
                        const currentTags = category.split(',').map(t => t.trim()).filter(Boolean);
                        if (!currentTags.includes(cat)) {
                          const newTags = [...currentTags, cat].join(', ');
                          setCategory(newTags);
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
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FilterPanelProps {
  filters: DetailFilters;
  onFiltersChange: (filters: DetailFilters) => void;
  availableCategories: string[];
}

function FilterPanel({ filters, onFiltersChange, availableCategories }: FilterPanelProps) {
  const [isDateAccordionOpen, setIsDateAccordionOpen] = useState(false);
  const [isDisplayAccordionOpen, setIsDisplayAccordionOpen] = useState(true);
  const [isCategoriesAccordionOpen, setIsCategoriesAccordionOpen] = useState(false);

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value ? new Date(value) : undefined,
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Categories Accordion */}
        {availableCategories.length > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsCategoriesAccordionOpen(!isCategoriesAccordionOpen)}
              className="flex items-center justify-between w-full text-left"
            >
              <Label className="text-sm font-medium">Categories</Label>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isCategoriesAccordionOpen && "rotate-180"
              )} />
            </button>
            {isCategoriesAccordionOpen && (
              <div className="pl-2">
                <div className="flex flex-wrap gap-1">
                  {availableCategories.map((category) => (
                    <Button
                      key={category}
                      variant={filters.categories.includes(category) ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-6"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Date Range Accordion */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsDateAccordionOpen(!isDateAccordionOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <Label className="text-sm font-medium">Date Range</Label>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isDateAccordionOpen && "rotate-180"
            )} />
          </button>
          {isDateAccordionOpen && (
            <div className="space-y-2 pl-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate && !isNaN(filters.startDate.getTime()) ? filters.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate && !isNaN(filters.endDate.getTime()) ? filters.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Display Options Accordion */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsDisplayAccordionOpen(!isDisplayAccordionOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <Label className="text-sm font-medium">Display Options</Label>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isDisplayAccordionOpen && "rotate-180"
            )} />
          </button>
          {isDisplayAccordionOpen && (
            <div className="space-y-2 pl-2">
              <div className="space-y-2">
                {/* Display Options Row */}
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant={filters.showCount ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => onFiltersChange({
                      ...filters,
                      showCount: !filters.showCount,
                    })}
                  >
                    Count
                  </Button>
                  <Button
                    type="button"
                    variant={filters.showDate ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => onFiltersChange({
                      ...filters,
                      showDate: !filters.showDate,
                    })}
                  >
                    Date
                  </Button>
                </div>
                
                {/* Sorting Options Row */}
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant={filters.sortOrder === 'asc' || filters.sortOrder === 'desc' ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => onFiltersChange({
                      ...filters,
                      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
                    })}
                  >
                    {filters.sortOrder === 'asc' ? 'A→Z' : filters.sortOrder === 'desc' ? 'Z→A' : 'A→Z'}
                  </Button>
                  <Button
                    type="button"
                    variant={filters.sortOrder === 'first-last' || filters.sortOrder === 'last-first' ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => onFiltersChange({
                      ...filters,
                      sortOrder: filters.sortOrder === 'first-last' ? 'last-first' : 'first-last',
                    })}
                  >
                    {filters.sortOrder === 'first-last' ? '1→N' : filters.sortOrder === 'last-first' ? 'N→1' : '1→N'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DetailsContent() {
  const {
    currentChallenge,
    beats,
    beatDetails,
    isLoading,
    addBeatDetail,
    updateBeatDetail,
    deleteBeatDetail,
  } = useChallengeContext();

  const [filters, setFilters] = useState<DetailFilters>({
    startDate: undefined,
    endDate: undefined,
    categories: [],
    showCount: true,
    showDate: true,
    sortOrder: 'asc',
  });

  // State for detail view dialog
  const [selectedDetail, setSelectedDetail] = useState<BeatDetail | null>(null);
  const [selectedBeatNumber, setSelectedBeatNumber] = useState<number | undefined>();
  const [selectedBeatDate, setSelectedBeatDate] = useState<Date | undefined>();
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  
  // Get all available categories
  const availableCategories = Array.from(
    new Set(beatDetails.map(d => d.category).filter(Boolean) as string[])
  ).sort();

  // Filter details based on current filters
  const filteredDetails = beatDetails.filter(detail => {
    // Find the beat for this detail
    const beat = beats.find(b => b.id === detail.beatId);
    if (!beat) return false;

    // Apply filters
    if (filters.startDate && beat.date < filters.startDate) return false;
    if (filters.endDate && beat.date > filters.endDate) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(detail.category || '')) return false;

    return true;
  }).sort((a, b) => {
    if (filters.sortOrder === 'asc' || filters.sortOrder === 'desc') {
      // Sort alphabetically by content
      const contentA = a.content.toLowerCase();
      const contentB = b.content.toLowerCase();
      return filters.sortOrder === 'asc' 
        ? contentA.localeCompare(contentB)
        : contentB.localeCompare(contentA);
    } else if (filters.sortOrder === 'first-last' || filters.sortOrder === 'last-first') {
      // Sort by day count
      const beatA = beats.find(beat => beat.id === a.beatId);
      const beatB = beats.find(beat => beat.id === b.beatId);
      if (!beatA || !beatB) return 0;
      return filters.sortOrder === 'first-last'
        ? beatA.dayNumber - beatB.dayNumber
        : beatB.dayNumber - beatA.dayNumber;
    } else {
      // Default: Sort by beat date (most recent first)
      const beatA = beats.find(beat => beat.id === a.beatId);
      const beatB = beats.find(beat => beat.id === b.beatId);
      if (!beatA || !beatB) return 0;
      return beatB.date.getTime() - beatA.date.getTime();
    }
  });

  const handleAddDetail = async (content: string, category?: string, date?: Date) => {
    try {
      const targetDate = date || new Date();
      console.log('Available beats:', beats.map(b => ({ 
        id: b.id, 
        date: b.date, 
        dateString: b.date.toDateString(),
        dayNumber: b.dayNumber 
      })));
      console.log('Target date:', targetDate.toDateString());
      
      // Normalize dates to compare only the date part (ignore time)
      const normalizeDate = (d: Date) => {
        const normalized = new Date(d);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };
      
      const normalizedTargetDate = normalizeDate(targetDate);
      const today = normalizeDate(new Date());
      
      // Prevent adding details for future dates
      if (normalizedTargetDate > today) {
        console.error('Cannot add details for future dates:', targetDate.toDateString());
        alert('Cannot add details for future dates. Please select today or a past date.');
        return;
      }
      
      const targetBeat = beats.find(beat => {
        const normalizedBeatDate = normalizeDate(beat.date);
        const isMatch = normalizedBeatDate.getTime() === normalizedTargetDate.getTime();
        console.log(`Checking beat ${beat.id} (${beat.date.toDateString()}) against target (${targetDate.toDateString()}): ${isMatch}`);
        return isMatch;
      });

      if (targetBeat) {
        console.log('Adding detail to beat:', targetBeat.id, 'for date:', targetDate);
        await addBeatDetail(targetBeat.id, content, category);
        console.log('Detail added successfully');
      } else {
        // If no beat for the selected date, find the most recent available beat
        const availableBeats = beats.filter(b => {
          const normalizedBeatDate = normalizeDate(b.date);
          return normalizedBeatDate <= normalizedTargetDate;
        }).sort((a, b) => 
          normalizeDate(b.date).getTime() - normalizeDate(a.date).getTime()
        );
        
        console.log('Available beats for date:', availableBeats.map(b => ({ 
          id: b.id, 
          date: b.date.toDateString() 
        })));
        
        if (availableBeats.length > 0) {
          console.log('Adding detail to most recent available beat:', availableBeats[0].id, 'for date:', targetDate);
          await addBeatDetail(availableBeats[0].id, content, category);
          console.log('Detail added successfully');
        } else {
          console.error('No available beats found for date:', targetDate);
          alert('No beat found for the selected date. Please select a date that has an active beat.');
        }
      }
    } catch (error) {
      console.error('Error adding detail:', error);
      alert('Failed to add detail. Please try again.');
    }
  };

  const handleViewDetail = (detail: BeatDetail, beatNumber?: number, beatDate?: Date) => {
    setSelectedDetail(detail);
    setSelectedBeatNumber(beatNumber);
    setSelectedBeatDate(beatDate);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedDetail(null);
    setSelectedBeatNumber(undefined);
    setSelectedBeatDate(undefined);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded-md"></div>
            <div className="h-32 bg-muted rounded-md"></div>
            <div className="h-24 bg-muted rounded-md"></div>
            <div className="h-24 bg-muted rounded-md"></div>
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
            Create a challenge first to start tracking details.
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
        {/* Header with Add Detail Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Details</h1>
          <AddDetailDialog onAddDetail={handleAddDetail} availableCategories={availableCategories} />
        </div>

        {/* Stats at the top */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {filteredDetails.length}
                </div>
                <div className="text-xs text-muted-foreground">Entries</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {availableCategories.length}
                </div>
                <div className="text-xs text-muted-foreground">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {new Set(filteredDetails.map(d => d.beatId)).size}
                </div>
                <div className="text-xs text-muted-foreground">Days</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(filteredDetails.reduce((acc, d) => acc + d.content.length, 0) / filteredDetails.length) || 0}
                </div>
                <div className="text-xs text-muted-foreground">Avg Length</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Filters */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              availableCategories={availableCategories}
            />
          </div>

          {/* Right Column - Entries */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Entries</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View saved entries filtered by your criteria.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDetails.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No entries found
                    </div>
                  ) : (
                    filteredDetails.map((detail) => {
                      const beat = beats.find(b => b.id === detail.beatId);
                      return (
                        <DetailEntry
                          key={detail.id}
                          detail={detail}
                          beatNumber={beat?.dayNumber}
                          beatDate={beat?.date}
                          onViewDetail={handleViewDetail}
                          showCount={filters.showCount}
                          showDate={filters.showDate}
                        />
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detail View Dialog */}
        <DetailViewDialog
          detail={selectedDetail}
          beatNumber={selectedBeatNumber}
          beatDate={selectedBeatDate}
          isOpen={isDetailDialogOpen}
          onClose={handleCloseDetailDialog}
          onUpdateDetail={updateBeatDetail}
          onDeleteDetail={deleteBeatDetail}
          availableCategories={availableCategories}
        />
      </div>
    </div>
  );
}

export default function DetailsPage() {
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
      <DetailsContent />
    </ChallengeProvider>
  );
}
