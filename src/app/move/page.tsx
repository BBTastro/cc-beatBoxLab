"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { AuthenticationPage } from "@/components/auth/authentication-page";
import { 
  Target, 
  Zap, 
  Lightbulb, 
  Hammer, 
  Dumbbell, 
  Moon, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  X,
  RefreshCw,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MoveCard {
  id: string;
  type: 'strategy' | 'flow' | 'create' | 'build' | 'strength' | 'restore';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  aiBoostContent: string;
  tags: string[];
  color: string;
}

const defaultMoveCards: MoveCard[] = [
  {
    id: 'strategy',
    type: 'strategy',
    title: 'Strategy',
    description: 'Set direction with clear intent, aligning actions to what matters.',
    icon: Target,
    content: `Strategic thinking focuses on creating systematic approaches to creative transformation and goal achievement. This comprehensive framework includes:

• Vision assessment and analysis
• Goal-oriented design principles
• Progressive capability development
• Performance optimization strategies
• Long-term planning methodologies
• Adaptation and modification protocols

The strategic approach ensures that every creative action contributes to larger objectives while maintaining sustainable progress and preventing stagnation.`,
    aiBoostContent: `AI can supercharge your Strategy movement by:

• Pattern Recognition: Analyzing similar successful projects and extracting key strategies
• Scenario Planning: Generating multiple strategic options with pros/cons analysis
• Risk Assessment: Identifying potential obstacles and mitigation strategies
• Competitive Analysis: Researching market trends and competitive landscapes
• Resource Optimization: Suggesting the most efficient allocation of time and resources

Use AI to expand your strategic thinking beyond your current perspective and experience.`,
    tags: ['Planning', 'Assessment', 'Goals', 'Optimization'],
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'flow',
    type: 'flow',
    title: 'Flow',
    description: 'Find momentum through connected moves that carry you forward.',
    icon: Zap,
    content: `Flow-based creation emphasizes smooth transitions and continuous progress patterns. This practice encompasses:

• Seamless creative transitions
• Rhythmic focus integration
• Dynamic adaptability development
• Balance and coordination
• Mindful awareness cultivation
• Creative expression and innovation

Each flow session builds intuitive intelligence while improving range of capability and creative quality through connected, purposeful sequences.`,
    aiBoostContent: `AI can enhance your Flow movement by:

• Environment Optimization: Analyzing your peak performance conditions and suggesting improvements
• Distraction Management: Identifying and blocking common interruption sources
• Task Sequencing: Organizing work to maintain momentum and energy
• Personalized Recommendations: Learning your flow patterns and suggesting optimal work times
• Real-time Feedback: Providing progress indicators and achievement recognition

Let AI help you engineer the perfect conditions for sustained high performance.`,
    tags: ['Fluidity', 'Rhythm', 'Integration', 'Mindfulness'],
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
  {
    id: 'create',
    type: 'create',
    title: 'Create',
    description: 'Introduce patterns, name the signal, and refine your approach.',
    icon: Lightbulb,
    content: `The creative component focuses on the mental aspects of artistic practice and innovation. Key areas include:

• Learning principles and methodologies
• Self-awareness cultivation
• Visualization and planning techniques
• Cognitive-emotional integration
• Problem-solving through creativity
• Mindful practice development

This approach enhances learning efficiency and creative quality by engaging the mind-body connection for deeper understanding and skill acquisition.`,
    aiBoostContent: `AI can amplify your Create movement by:

• Idea Generation: Providing creative prompts and novel combinations of concepts
• Pattern Analysis: Identifying successful patterns from vast datasets
• Rapid Prototyping: Helping quickly test and iterate on ideas
• Cross-Domain Inspiration: Drawing connections from unrelated fields
• Collaborative Brainstorming: Acting as a creative partner for ideation sessions

Use AI as a creative catalyst to expand your imaginative capabilities and accelerate innovation.`,
    tags: ['Cognition', 'Learning', 'Awareness', 'Integration'],
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'build',
    type: 'build',
    title: 'Build',
    description: 'Emerging progress piece by piece with structure and clarity.',
    icon: Hammer,
    content: `Building creative capacity requires methodical progression and consistent application. The building process includes:

• Progressive capability implementation
• Strength and resilience development
• Endurance capacity building
• Skill acquisition and refinement
• Structural adaptation support
• Performance milestone tracking

Each building phase creates measurable improvements while maintaining creative quality and reducing risk through intelligent progression.`,
    aiBoostContent: `AI can strengthen your Build movement by:

• Process Optimization: Analyzing workflows and suggesting improvements
• Quality Assurance: Automated testing and validation of your builds
• Documentation: Generating clear, comprehensive documentation
• Skill Development: Personalized learning paths and practice recommendations
• Resource Management: Optimizing allocation and utilization of resources

Let AI help you build more efficiently and effectively while maintaining high quality standards.`,
    tags: ['Progression', 'Strength', 'Capacity', 'Development'],
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  {
    id: 'strength',
    type: 'strength',
    title: 'Strength',
    description: 'Hold steady under weight; choose constraints that sharpen focus.',
    icon: Dumbbell,
    content: `Strength development forms the foundation of creative capability and resilience. This comprehensive approach includes:

• Compound pattern mastery
• Progressive challenge protocols
• Power and explosive development
• Functional strength applications
• Core stability enhancement
• Risk prevention strategies

Strength sessions are designed to build maximum creative force while maintaining artistic quality and creative health through proper technique and programming.`,
    aiBoostContent: `AI can support your Strength movement by:

• Personalized Training: Creating adaptive learning programs based on your progress
• Progress Tracking: Monitoring development and suggesting adjustments
• Challenge Calibration: Ensuring optimal difficulty for growth
• Weakness Identification: Pinpointing areas needing focused development
• Recovery Optimization: Balancing challenge with necessary rest periods

Use AI to create a personalized strength development program that evolves with your growing capabilities.`,
    tags: ['Force', 'Power', 'Resistance', 'Mastery'],
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  {
    id: 'restore',
    type: 'restore',
    title: 'Restore',
    description: 'Make space to return to center.',
    icon: Moon,
    content: `Restore is an active component of creative development that supports adaptation and prevents overuse. Key restoration elements include:

• Active recovery methodologies
• Mental and emotional maintenance
• Mobility and flexibility work
• Stress management techniques
• Sleep optimization protocols
• Nutritional recovery support

Restoration practices ensure that creative adaptations occur optimally while maintaining long-term creative health and preventing burnout through systematic recovery.`,
    aiBoostContent: `AI can optimize your Restore movement by:

• Recovery Planning: Scheduling optimal rest periods based on your work patterns
• Restoration Tracking: Monitoring recovery quality and effectiveness
• Personalized Recommendations: Suggesting specific restoration activities based on your needs
• Energy Management: Balancing different types of activities for optimal renewal
• Burnout Prevention: Early warning systems and proactive interventions

Let AI help you maintain peak performance through intelligent recovery and restoration practices.`,
    tags: ['Recovery', 'Regeneration', 'Wellness', 'Adaptation'],
    color: 'text-green-600 bg-green-50 border-green-200',
  },
];

interface MoveCardProps {
  card: MoveCard;
  onClick: () => void;
}

function MoveCardComponent({ card, onClick }: MoveCardProps) {
  const Icon = card.icon;
  
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle>
          <span>{card.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {card.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface MoveDetailDialogProps {
  card: MoveCard | null;
  isOpen: boolean;
  onClose: () => void;
}

function MoveDetailDialog({ card, isOpen, onClose }: MoveDetailDialogProps) {
  const [conceptsExpanded, setConceptsExpanded] = useState(true);
  const [boostExpanded, setBoostExpanded] = useState(true);
  const [boostInput, setBoostInput] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isEditingConcepts, setIsEditingConcepts] = useState(false);
  const [editableConceptsContent, setEditableConceptsContent] = useState('');
  
  // New state management for boost generation
  const [generatedBoost, setGeneratedBoost] = useState<string>('');
  const [isGeneratingBoost, setIsGeneratingBoost] = useState(false);
  const [boostCopied, setBoostCopied] = useState(false);
  const [boostError, setBoostError] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleEditConcepts = () => {
    setEditableConceptsContent(conceptsContent);
    setIsEditingConcepts(true);
  };

  const handleSaveConcepts = () => {
    // TODO: Save to database
    console.log('Saving concepts:', editableConceptsContent);
    setIsEditingConcepts(false);
  };

  const handleCancelEdit = () => {
    setIsEditingConcepts(false);
    setEditableConceptsContent('');
  };

  // State management functions for boost generation
  const handleGenerateBoost = async () => {
    setIsGeneratingBoost(true);
    setBoostError(null);
    
    try {
      const response = await fetch('/api/move/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptContext: boostInput,
          moveType: card?.type,
          moveTitle: card?.title,
          moveContent: card?.content,
          moveAiBoostContent: card?.aiBoostContent
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedBoost(data.boost);
      } else {
        setBoostError(data.error || 'Failed to generate boost');
      }
    } catch (error) {
      setBoostError('Network error. Please try again.');
    } finally {
      setIsGeneratingBoost(false);
    }
  };

  const handleCopyBoost = async () => {
    try {
      await navigator.clipboard.writeText(generatedBoost);
      setBoostCopied(true);
      setTimeout(() => setBoostCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy boost:', err);
      setBoostError('Unable to copy to clipboard');
    }
  };

  const handleRegenerateBoost = () => {
    setGeneratedBoost(''); // Clear previous response
    handleGenerateBoost(); // Generate new response
  };

  if (!card) return null;

  const conceptsContent = `Strategic thinking focuses on creating systematic approaches to creative transformation and goal achievement. This comprehensive framework includes:

• Vision assessment and analysis
• Goal-oriented design principles
• Progressive capability development
• Performance optimization strategies
• Long-term planning methodologies
• Adaptation and modification protocols

The strategic approach ensures that every creative action contributes to larger objectives while maintaining sustainable progress and preventing stagnation.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {card.title}
              </DialogTitle>
              <DialogDescription>
                {card.description}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Description */}
          <div>
            <p className="text-muted-foreground">{card.description}</p>
          </div>


          {/* Concepts Section */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setConceptsExpanded(!conceptsExpanded)}
            >
              <h3 className="text-lg font-semibold">Concepts</h3>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                conceptsExpanded && "rotate-180"
              )} />
            </div>
            
            {conceptsExpanded && (
              <div className="space-y-4">
                {isEditingConcepts ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editableConceptsContent}
                      onChange={(e) => setEditableConceptsContent(e.target.value)}
                      className="min-h-[200px] resize-y"
                      placeholder="Edit concepts content..."
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveConcepts}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line text-muted-foreground">
                        {conceptsContent}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(conceptsContent, 'concepts')}
                        className="p-2"
                      >
                        {copiedSection === 'concepts' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditConcepts}
                        className="p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Boost Section */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setBoostExpanded(!boostExpanded)}
            >
              <h3 className="text-lg font-semibold">Boost</h3>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                boostExpanded && "rotate-180"
              )} />
            </div>
            
            {boostExpanded && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add context to your prompt (Optional)
                  </p>
                  <Textarea
                    value={boostInput}
                    onChange={(e) => setBoostInput(e.target.value)}
                    placeholder="e.g., I'm struggling with consistency, I want to improve my focus, I need help with planning..."
                    className="min-h-[80px]"
                  />
                  <Button 
                    onClick={generatedBoost ? handleRegenerateBoost : handleGenerateBoost}
                    disabled={isGeneratingBoost}
                    className="mt-3 flex items-center gap-2"
                  >
                    {isGeneratingBoost ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {generatedBoost ? 'Regenerate Boost' : 'Generate Boost'}
                  </Button>
                  
                  {/* Error Display */}
                  {boostError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{boostError}</p>
                    </div>
                  )}
                  
                  {/* Generated Boost Display */}
                  {generatedBoost && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Generated Boost</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyBoost}
                          className="p-2"
                        >
                          {boostCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-line text-muted-foreground">
                          {generatedBoost}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MoveContent() {
  const [selectedCard, setSelectedCard] = useState<MoveCard | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCardClick = (card: MoveCard) => {
    setSelectedCard(card);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Move</h1>
        </div>

        {/* Movement Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {defaultMoveCards.map((card) => (
            <MoveCardComponent
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>


        {/* Move Detail Dialog */}
        <MoveDetailDialog
          card={selectedCard}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedCard(null);
          }}
        />
      </div>
    </div>
  );
}

export default function MovePage() {
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

  return <MoveContent />;
}
