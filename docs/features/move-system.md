# Move System

## Overview

The Move System provides a comprehensive framework for creative transformation and goal achievement through six distinct movement types. Users can explore strategic approaches, optimize their creative flow, and receive AI-powered guidance tailored to their specific movement context and personal challenges.

## What is the Move System

### Core Workflow

1. **Movement Selection**: Choose from six movement types: Strategy, Flow, Create, Build, Strength, and Restore
2. **Concept Exploration**: Access detailed frameworks and methodologies for each movement type
3. **AI Boost Generation**: Generate personalized AI guidance based on specific challenges, context, and movement concepts
4. **Content Customization**: Edit and adapt movement concepts to personal needs and preferences
5. **Progress Integration**: Apply movement principles to ongoing goal achievement journeys
6. **Context-Aware Motivation**: Receive AI-powered boosts that combine personal challenge data with movement-specific principles

### Key Components

- **Movement Cards**: Interactive cards displaying each movement type with descriptions and tags
- **Detail Dialogs**: Comprehensive view of movement concepts and AI boost functionality
- **Concept Editor**: Inline editing capability for personalizing movement frameworks
- **AI Boost Engine**: Context-aware AI assistance that integrates personal challenge data with movement-specific principles
- **Challenge Data Integration**: Real-time access to user's active challenge, progress, rewards, and beat details
- **Copy Integration**: One-click copying of concepts and generated content for external use
- **Regenerate Functionality**: Multiple boost generation with different perspectives and approaches

## Business Value

### Problem Statement

Goal achievers need:
- Structured approaches to different types of creative and productive activities
- Personalized guidance that adapts to their specific challenges and context
- Flexible frameworks that can be customized to individual needs and preferences
- AI-powered insights that go beyond generic advice to provide targeted support

### Solution Benefits

- **Comprehensive Framework**: Six distinct movement types covering all aspects of creative development
- **Personalized AI Guidance**: Context-aware assistance that adapts to individual challenges and goals
- **Data-Driven Motivation**: AI boosts that reference actual challenge progress, completion rates, and reward status
- **Movement-Specific Insights**: Targeted guidance that incorporates the specific principles of each movement type
- **Flexible Customization**: Editable concepts that users can adapt to their specific needs
- **Actionable Insights**: Practical, implementable guidance for immediate application
- **Integrated Approach**: Movement principles that complement existing goal tracking and achievement systems

## User Types and Personas

### Primary Users

- **Creative Professionals**: Artists, writers, designers seeking structured approaches to creative work
- **Goal-Oriented Achievers**: Individuals working toward specific outcomes who need strategic guidance
- **Productivity Optimizers**: People seeking to improve their work processes and effectiveness
- **Personal Development Enthusiasts**: Users focused on continuous improvement and growth

### Secondary Users

- **Coaches and Mentors**: Professionals guiding others through structured development processes
- **Team Leaders**: Managers helping teams adopt different approaches to work and creativity
- **Educators**: Teachers incorporating movement principles into learning and development curricula

## User Workflows

### Primary Workflow

1. **Access Move System**: Navigate to the Move page to view all available movement types
2. **Select Movement**: Click on a movement card that matches current needs or interests
3. **Review Concepts**: Study the comprehensive framework and principles for the selected movement
4. **Generate AI Boost**: Enter specific context or challenges to receive personalized AI guidance that combines your challenge data with movement principles
5. **Copy and Apply**: Copy the generated boost for external use and implement movement principles in ongoing projects
6. **Iterate and Refine**: Regenerate boosts with different context to explore various approaches and perspectives

### Alternative Workflows

- **Concept Customization**: Edit movement frameworks to better align with personal approach and needs
- **Multi-Movement Integration**: Combine principles from multiple movement types for complex projects
- **Content Export**: Copy concepts and AI-generated content for use in external planning tools
- **Iterative Refinement**: Regenerate AI boosts with different context for varied perspectives

## Functional Requirements

### Supporting Features

- **Six Movement Types**: Strategy, Flow, Create, Build, Strength, and Restore with distinct characteristics
- **AI Integration**: OpenAI-powered boost generation with movement-specific prompting and challenge data integration
- **Challenge Data Access**: Real-time integration with user's active challenge, beats, details, tags, rewards, and motivational statements
- **Inline Editing**: Direct modification of movement concepts within the interface
- **Context-Aware AI**: Personalized guidance based on user input, movement type, and actual challenge progress
- **Content Management**: Copy, edit, and regenerate functionality for all content types
- **Loading States**: Visual feedback during AI generation with proper error handling
- **Responsive Design**: Optimized experience across desktop and mobile devices
- **Error Handling**: Graceful handling of AI service issues and network problems

## User Interface Specifications

- **Card Grid Layout**: Clean, organized presentation of six movement types with visual differentiation
- **Expandable Dialogs**: Detailed modal views with collapsible sections for concepts and AI boost
- **Tag-Based Organization**: Visual categorization of movement characteristics and applications
- **Inline Editor**: Seamless transition between viewing and editing modes for concept customization
- **AI Interaction**: Clear prompting interface with loading states and error handling
- **Copy Integration**: One-click copying with visual confirmation for concepts and generated content
- **Responsive Adaptation**: Optimal layout and functionality across different screen sizes

## Security Considerations

- **User Authentication**: Move system accessible only to authenticated users
- **API Security**: Secure communication with OpenAI services for AI boost generation
- **Input Validation**: Proper sanitization of user inputs and AI prompts
- **Rate Limiting**: Protection against excessive API usage and system abuse
- **Content Privacy**: User-generated content and AI interactions remain private and secure

## Testing Strategy

- **Movement Card Interaction**: Test all six movement types and their associated content
- **AI Boost Generation**: Validate AI integration with various input contexts and movement types
- **Content Editing**: Test inline editing functionality and data persistence
- **Copy Functionality**: Verify clipboard integration across different browsers and devices
- **Error Scenarios**: Test handling of AI service outages and network connectivity issues
- **Mobile Experience**: Validate responsive design and touch interaction on mobile devices
- **Performance Testing**: Monitor AI response times and system performance under load

## Success Metrics

- **Movement Engagement**: Usage frequency and time spent exploring different movement types
- **AI Boost Utilization**: Percentage of users generating AI-powered guidance
- **Content Customization**: Frequency of concept editing and personalization
- **Cross-Movement Usage**: Users exploring multiple movement types for integrated approaches
- **Application Success**: User implementation of movement principles in their goal achievement
- **Regeneration Patterns**: How often users iterate on AI boost generation for better results
- **Export Usage**: Frequency of content copying for external use and application
- **Data Integration Success**: Effectiveness of challenge data integration in AI boost generation

## Technical Implementation Guide

### System Architecture

The Move System consists of three main components:

1. **Frontend Interface** (`src/app/move/page.tsx`)
2. **API Endpoint** (`src/app/api/move/boost/route.ts`)
3. **Data Integration** (Challenge data access via `src/lib/challenge-data.ts`)

### Core Data Structures

#### Move Card Interface
```typescript
interface MoveCard {
  id: string;
  type: 'strategy' | 'flow' | 'create' | 'build' | 'strength' | 'restore';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;           // Core movement principles
  aiBoostContent: string;    // AI-specific guidance
  tags: string[];
  color: string;
}
```

#### API Request Structure
```typescript
interface MoveBoostRequest {
  promptContext?: string;      // User's additional context
  moveType?: string;          // Movement type (strategy, flow, etc.)
  moveTitle?: string;         // Movement title
  moveContent?: string;       // Movement concept principles
  moveAiBoostContent?: string; // AI boost guidance
}
```

### Implementation Steps

#### 1. Frontend State Management
```typescript
// State variables for boost generation
const [generatedBoost, setGeneratedBoost] = useState<string>('');
const [isGeneratingBoost, setIsGeneratingBoost] = useState(false);
const [boostCopied, setBoostCopied] = useState(false);
const [boostError, setBoostError] = useState<string | null>(null);
```

#### 2. API Integration Function
```typescript
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
```

#### 3. API Endpoint Implementation
```typescript
export async function POST(req: NextRequest) {
  // 1. Authenticate user session
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id;
  
  // 2. Extract request data
  const { promptContext, moveType, moveTitle, moveContent, moveAiBoostContent } = await req.json();
  
  // 3. Fetch user's challenge data
  const challengeInfo = await getChallengeInfo(userId);
  const progress = await getBeatsProgress(userId);
  const beatDetails = await getBeatDetails(userId);
  const rewards = await getRewards(userId);
  
  // 4. Create comprehensive system prompt
  const systemPrompt = `You are the beatBox Move Assistant...
  
  MOVE CONCEPT PRINCIPLES:
  ${moveContent}
  
  AI BOOST GUIDANCE:
  ${moveAiBoostContent}
  
  ${challengeData}
  
  USER'S ADDITIONAL CONTEXT:
  ${promptContext || 'No additional context provided'}`;
  
  // 5. Generate AI response
  const result = await generateText({
    model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate a motivational boost...' }
    ],
  });
  
  // 6. Return structured response
  return new Response(JSON.stringify({
    success: true,
    boost: result.text,
    moveType: moveType || 'general',
    moveTitle: moveTitle || 'Move'
  }));
}
```

### Data Integration Requirements

#### Challenge Data Access
The system requires access to the same challenge data functions used by the chatbot:

- `getChallengeInfo(userId)`: Basic challenge information
- `getBeatsProgress(userId)`: Progress statistics and phase information
- `getBeatDetails(userId)`: Recent beat details with tags and dates
- `getRewards(userId)`: Reward information (total, achieved, planned, active)

#### System Prompt Structure
The AI system prompt must include:

1. **Movement Concept Principles**: Core frameworks and methodologies
2. **AI Boost Guidance**: Specific AI-powered suggestions for the movement type
3. **Challenge Data**: User's active challenge, progress, and achievements
4. **User Context**: Additional input from the user
5. **Response Requirements**: Guidelines for generating targeted, actionable boosts

### UI Components

#### Move Card Component
- Interactive cards with hover effects
- Visual differentiation through colors and icons
- Tag-based categorization
- Click-to-expand functionality

#### Detail Dialog Component
- Expandable sections for concepts and AI boost
- Inline editing capability for concept customization
- AI boost generation interface with loading states
- Copy functionality with visual feedback
- Error handling with user-friendly messages

#### Boost Generation Interface
- Context input textarea
- Generate/Regenerate button with loading states
- Generated boost display with copy functionality
- Error message display
- Responsive design for mobile devices

### Error Handling

#### Frontend Error Handling
- Network error handling with retry options
- API error display with user-friendly messages
- Loading state management
- Clipboard API error handling with fallbacks

#### Backend Error Handling
- Authentication validation
- OpenAI API error handling
- Database connection error handling
- Input validation and sanitization
- Comprehensive logging for debugging

### Performance Considerations

- **API Response Time**: Target < 3 seconds for boost generation
- **Loading States**: Immediate visual feedback during generation
- **Error Recovery**: Graceful handling of service outages
- **Caching**: Consider caching challenge data to reduce database queries
- **Rate Limiting**: Implement protection against API abuse

### Security Considerations

- **Authentication**: All API endpoints require valid user sessions
- **Input Sanitization**: Proper validation of user inputs and AI prompts
- **API Security**: Secure communication with OpenAI services
- **Data Privacy**: User challenge data remains private and secure
- **Rate Limiting**: Protection against excessive API usage

### Testing Strategy

#### Unit Testing
- API endpoint functionality
- State management functions
- Error handling scenarios
- Data integration functions

#### Integration Testing
- End-to-end boost generation flow
- Challenge data integration
- Copy functionality across browsers
- Mobile responsiveness

#### User Acceptance Testing
- Movement card interaction
- AI boost quality and relevance
- Content customization workflow
- Error scenario handling

### Deployment Checklist

- [ ] Environment variables configured (OpenAI API key, database connection)
- [ ] Database migrations applied
- [ ] API endpoints tested and functional
- [ ] Frontend components responsive and accessible
- [ ] Error handling comprehensive and user-friendly
- [ ] Performance optimized for production
- [ ] Security measures implemented and tested
- [ ] Documentation updated and complete

This technical implementation guide provides a comprehensive roadmap for recreating the Move System with all its enhanced features, including the AI Boost functionality that integrates personal challenge data with movement-specific principles.