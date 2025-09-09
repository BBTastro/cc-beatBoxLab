# Move Boost Feature Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for adding OpenAI-powered motivational boost generation to the Move Page's Move Card dialogs. The feature will leverage the same challenge data access patterns used by the existing AI chatbot to provide personalized motivational responses based on user's active challenge data and additional prompt context.

## Feature Requirements

### Core Functionality
- **AI-Powered Boost Generation**: Generate motivational responses using OpenAI GPT models
- **Challenge Data Integration**: Access same user data as chatbot (Active Challenge, beats, details, tags, categories, dates, duration, rewards, motivation statements)
- **Context-Aware Responses**: Include user-entered prompt context in boost generation
- **Copy Functionality**: Allow users to copy generated boost responses
- **Regenerate Capability**: Generate new motivational responses on subsequent button clicks

### User Interface
- **Generate Boost Button**: Replace static "Generate Boost" button with functional AI-powered generation
- **Loading States**: Show loading indicators during AI response generation
- **Response Display**: Display generated boost responses with proper formatting
- **Copy Icon**: Add copy functionality with visual feedback
- **Error Handling**: Graceful handling of API failures and errors

## Implementation Steps

### Step 1: Create Move Boost API Endpoint

**File**: `src/app/api/move/boost/route.ts`

**Purpose**: Create a dedicated API endpoint for generating motivational boosts using OpenAI

**Implementation Details**:
- Use same authentication pattern as chatbot API (`auth.api.getSession`)
- Implement same challenge data fetching logic as chatbot
- Use OpenAI's `generateText` for non-streaming responses (simpler than streaming for this use case)
- Include user's prompt context in the AI system prompt
- Return structured JSON response with generated boost content

**Key Components**:
```typescript
// API endpoint structure
export async function POST(req: Request) {
  // 1. Authenticate user session
  // 2. Extract prompt context from request body
  // 3. Fetch user's challenge data (same as chatbot)
  // 4. Format challenge data for AI context
  // 5. Generate motivational response using OpenAI
  // 6. Return structured response
}
```

**Data Access Pattern**:
- Reuse `getChallengeData()` function from `src/lib/challenge-data.ts`
- Format data using same structure as chatbot API
- Include motivational statements in context

### Step 2: Implement Challenge Data Access

**Purpose**: Ensure Move Boost API has access to the same comprehensive user data as the chatbot

**Implementation Details**:
- Import and use existing `getChallengeData()` function
- Format challenge data with same structure as chatbot:
  - Challenge info (title, description, duration, status, progress)
  - Recent beat details with tags and dates
  - Tag summary and analysis
  - Rewards information
  - Motivational statements
- Include user's additional prompt context in the AI system prompt

**Data Structure**:
```typescript
const challengeData = `
USER'S CURRENT CHALLENGE DATA:
- Challenge: ${challengeInfo.title}
- Description: ${challengeInfo.description}
- Duration: ${challengeInfo.duration} days
- Progress: ${progress.completed}/${progress.total} days (${progress.percentage}% complete)

RECENT BEAT DETAILS WITH TAGS:
${beatDetails.map(detail => `- [${detail.category}] ${detail.content} (${detail.date})`).join('\n')}

TAG SUMMARY:
${tagCounts.map(([tag, count]) => `- ${tag}: ${count} entries`).join('\n')}

REWARDS:
- Total: ${rewards.total}
- Achieved: ${rewards.achieved}

MOTIVATIONAL STATEMENTS:
${motivationalStatements.map(stmt => `- ${stmt.title}: ${stmt.statement}`).join('\n')}

USER'S ADDITIONAL CONTEXT:
${userPromptContext}
`;
```

### Step 3: Add State Management to Move Page

**File**: `src/app/move/page.tsx`

**Purpose**: Add state management for boost generation, loading states, and copy functionality

**New State Variables**:
```typescript
// In MoveDetailDialog component
const [generatedBoost, setGeneratedBoost] = useState<string>('');
const [isGeneratingBoost, setIsGeneratingBoost] = useState(false);
const [boostCopied, setBoostCopied] = useState(false);
const [boostError, setBoostError] = useState<string | null>(null);
```

**State Management Functions**:
- `handleGenerateBoost()`: Call API and update state
- `handleCopyBoost()`: Copy generated boost to clipboard
- `handleRegenerateBoost()`: Generate new boost response
- Error handling and loading state management

### Step 4: Implement Generate Boost Button Functionality

**Purpose**: Replace static button with functional AI-powered boost generation

**Implementation Details**:
- Add click handler to existing "Generate Boost" button
- Implement API call to `/api/move/boost`
- Include user's prompt context from textarea
- Handle loading states and error conditions
- Update UI to show generated response

**Button Implementation**:
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
        moveType: card.type,
        moveTitle: card.title
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

### Step 5: Add Copy to Clipboard Functionality

**Purpose**: Allow users to copy generated boost responses

**Implementation Details**:
- Add copy icon button next to generated boost content
- Implement clipboard API integration
- Show visual feedback (checkmark) when copied
- Handle clipboard API errors gracefully

**Copy Implementation**:
```typescript
const handleCopyBoost = async () => {
  try {
    await navigator.clipboard.writeText(generatedBoost);
    setBoostCopied(true);
    setTimeout(() => setBoostCopied(false), 2000);
  } catch (err) {
    console.error('Failed to copy boost:', err);
    // Fallback: show error message
  }
};
```

### Step 6: Implement Regenerate Functionality

**Purpose**: Allow users to generate new motivational responses

**Implementation Details**:
- Modify "Generate Boost" button to show "Regenerate Boost" when content exists
- Clear previous response before generating new one
- Maintain same API call structure
- Ensure each generation produces different results

**Regenerate Logic**:
```typescript
const handleRegenerateBoost = () => {
  setGeneratedBoost(''); // Clear previous response
  handleGenerateBoost(); // Generate new response
};
```

### Step 7: Update Move Card Dialog UI

**Purpose**: Display generated boost responses with proper formatting and controls

**UI Updates**:
- Add section to display generated boost content
- Show loading spinner during generation
- Display error messages when generation fails
- Add copy button with visual feedback
- Update button text based on state (Generate vs Regenerate)

**UI Structure**:
```typescript
{/* Generated Boost Display */}
{generatedBoost && (
  <div className="space-y-3">
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

{/* Generate/Regenerate Button */}
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
```

### Step 8: AI System Prompt Design

**Purpose**: Create effective system prompt for motivational boost generation

**System Prompt Structure**:
```typescript
const systemPrompt = `You are the beatBox Move Assistant, a motivational AI coach specializing in providing personalized encouragement and strategic guidance for goal achievement.

Your role is to generate motivational "boosts" that help users overcome challenges and maintain momentum in their goal pursuit.

RESPONSE REQUIREMENTS:
- Generate a motivational response of 2-4 sentences
- Be specific to the user's current challenge and progress
- Reference their actual data when relevant (completion rates, recent entries, etc.)
- Address their specific context and concerns from the prompt
- Use an encouraging, supportive tone
- Focus on actionable motivation rather than generic advice

MOVE TYPE CONTEXT:
- Move Type: ${moveType} (${moveTitle})
- This boost should align with the ${moveType} movement principles

${challengeData}

USER'S ADDITIONAL CONTEXT:
${userPromptContext || 'No additional context provided'}

Generate a personalized motivational boost that helps this user stay motivated and focused on their goal achievement journey.`;
```

### Step 9: Error Handling and Edge Cases

**Purpose**: Ensure robust error handling and graceful degradation

**Error Scenarios**:
- OpenAI API failures
- Network connectivity issues
- Invalid user session
- Missing challenge data
- Clipboard API failures

**Error Handling Implementation**:
```typescript
// API Error Handling
if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || 'Failed to generate boost');
}

// Network Error Handling
catch (error) {
  console.error('Boost generation error:', error);
  setBoostError('Unable to generate boost. Please try again.');
}

// Fallback for Clipboard API
catch (err) {
  // Show fallback copy method or error message
  setBoostError('Unable to copy to clipboard');
}
```

### Step 10: Testing and Validation

**Purpose**: Ensure feature works correctly across different scenarios

**Test Cases**:
1. **Happy Path**: Generate boost with valid data and context
2. **No Context**: Generate boost without additional prompt context
3. **No Challenge Data**: Handle users without active challenges
4. **API Failures**: Test error handling for OpenAI API failures
5. **Copy Functionality**: Verify clipboard integration works
6. **Regenerate**: Test multiple boost generations
7. **Loading States**: Verify loading indicators display correctly
8. **Mobile Experience**: Test on mobile devices

**Validation Checklist**:
- [ ] Boost generation works with valid user data
- [ ] Error handling works for API failures
- [ ] Copy functionality works across browsers
- [ ] Loading states display correctly
- [ ] Regenerate produces different responses
- [ ] Mobile UI is responsive and functional
- [ ] Authentication is properly enforced
- [ ] Challenge data is accurately included in context

## Technical Considerations

### Performance
- Use non-streaming OpenAI API for simpler implementation
- Implement proper loading states to improve perceived performance
- Cache challenge data to avoid repeated database queries

### Security
- Validate user authentication on every API call
- Sanitize user input in prompt context
- Implement rate limiting to prevent API abuse
- Ensure user data privacy in AI context

### User Experience
- Provide clear feedback during generation process
- Handle errors gracefully with helpful messages
- Ensure mobile-friendly interface
- Maintain consistent design with existing Move page

### Integration
- Reuse existing challenge data access patterns
- Maintain consistency with chatbot API structure
- Follow established error handling patterns
- Use existing UI components and styling

## Success Metrics

### Functional Metrics
- Boost generation success rate > 95%
- Average response time < 3 seconds
- Copy functionality success rate > 99%
- Error rate < 5%

### User Experience Metrics
- User engagement with boost feature
- Frequency of boost regeneration
- User satisfaction with generated content
- Mobile usage patterns

### Technical Metrics
- API response times
- Error rates by error type
- Database query performance
- OpenAI API usage and costs

## Future Enhancements

### Potential Improvements
1. **Boost History**: Save and display previously generated boosts
2. **Boost Templates**: Pre-defined boost templates for different scenarios
3. **Boost Sharing**: Allow users to share boosts with allies
4. **Boost Analytics**: Track which boosts are most effective
5. **Custom Prompts**: Allow users to save custom prompt templates
6. **Boost Scheduling**: Schedule automatic boost generation
7. **Integration**: Connect boosts with rewards and motivation statements

### Technical Enhancements
1. **Streaming Responses**: Implement streaming for real-time generation
2. **Response Caching**: Cache responses to reduce API calls
3. **A/B Testing**: Test different prompt strategies
4. **Analytics Integration**: Track boost usage and effectiveness
5. **Offline Support**: Cache boosts for offline access

## Conclusion

This implementation plan provides a comprehensive roadmap for adding AI-powered motivational boost generation to the Move page. By leveraging existing patterns from the chatbot implementation and following established UI/UX conventions, the feature will integrate seamlessly with the existing beatBox application while providing users with personalized, context-aware motivational support.

The step-by-step approach ensures proper testing and validation at each stage, while the technical considerations address performance, security, and user experience requirements. The success metrics and future enhancements provide a framework for measuring and improving the feature over time.
