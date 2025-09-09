"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useContext, useMemo, useEffect } from "react";
import { useChallengeContext } from "@/contexts/ChallengeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Rocket, Bot, User, Zap, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Component for rendering markdown-like content in assistant messages
function FormattedContent({ content }: { content: string }) {
  // Split content into paragraphs and format
  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      // Handle end of list
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${i}`} className="space-y-1 ml-4 my-3">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-primary/70 rounded-full mt-2 mr-3 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
      continue;
    }
    
    // Handle headers
    if (line.startsWith('###')) {
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${i}`} className="space-y-1 ml-4 my-3">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-primary/70 rounded-full mt-2 mr-3 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
      elements.push(
        <h3 key={i} className="font-semibold text-base mt-4 mb-2 first:mt-0 text-foreground/90">
          {line.replace('###', '').trim()}
        </h3>
      );
    }
    // Handle list items
    else if (line.startsWith('- ') || line.startsWith('• ')) {
      const item = line.replace(/^[•-]\s*/, '').trim();
      currentList.push(item);
      inList = true;
    }
    // Handle numbered lists
    else if (line.match(/^\d+\.\s/)) {
      const item = line.replace(/^\d+\.\s*/, '').trim();
      currentList.push(item);
      inList = true;
    }
    // Regular paragraph
    else {
      // Handle end of list
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${i}`} className="space-y-1 ml-4 my-3">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-primary/70 rounded-full mt-2 mr-3 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
      
      if (line.length > 0) {
        elements.push(
          <p key={i} className="text-sm leading-relaxed mb-3 last:mb-0 text-foreground/90">
            {line}
          </p>
        );
      }
    }
  }
  
  // Handle any remaining list items
  if (inList && currentList.length > 0) {
    elements.push(
      <ul key="final-list" className="space-y-1 ml-4 my-3">
        {currentList.map((item, idx) => (
          <li key={idx} className="text-sm leading-relaxed flex items-start">
            <span className="inline-block w-1.5 h-1.5 bg-primary/70 rounded-full mt-2 mr-3 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

interface ChatbotProps {
  userId: string;
  className?: string;
}

export function Chatbot({ userId, className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [useFallback, setUseFallback] = useState(false);
  
  // Get challenge data and sync function from context
  const { 
    syncToDatabase, 
    refreshData,
    currentChallenge, 
    challenges, 
    beats, 
    beatDetails, 
    rewards,
    motivationalStatements
  } = useChallengeContext();

  // Listen for challenge changes and refresh data when active challenge changes
  useEffect(() => {
    const handleChallengeUpdate = () => {
      console.log('Challenge update detected, refreshing chatbot data...');
      refreshData();
    };

    // Listen for challenge update events
    window.addEventListener('beatbox-challenge-updated', handleChallengeUpdate);
    
    return () => {
      window.removeEventListener('beatbox-challenge-updated', handleChallengeUpdate);
    };
  }, [refreshData]);
  
  // Function to format challenge data for the API
  const getChallengeDataForAPI = () => {
    if (!currentChallenge) {
      return {
        challenge: null,
        beats: [],
        beatDetails: [],
        rewards: []
      };
    }

    // Format beats to match backend expectations
    const formattedBeats = beats.map(beat => {
      // A beat is completed if it has details (same logic as beats page)
      const hasDetails = beatDetails.some(detail => detail.beatId === beat.id);
      return {
        ...beat,
        completed: hasDetails, // Use hasDetails logic instead of isCompleted
        date: beat.date.toISOString() // Ensure date is in ISO format
      };
    });

    // Format beat details to match backend expectations
    const formattedBeatDetails = beatDetails.map(detail => ({
      ...detail,
      createdAt: detail.createdAt.toISOString() // Ensure date is in ISO format
    }));

    // Format rewards to match backend expectations
    const formattedRewards = rewards.map(reward => ({
      ...reward,
      name: reward.title, // Map title to name for backend
      achievedAt: reward.achievedAt?.toISOString() // Ensure date is in ISO format
    }));

    // Filter motivational statements to only show those for the current active challenge
    const challengeMotivationalStatements = motivationalStatements.filter(statement => 
      statement.challengeId === currentChallenge?.id
    );

    // Format motivational statements to match backend expectations
    const formattedMotivationalStatements = challengeMotivationalStatements.map(statement => ({
      ...statement,
      createdAt: statement.createdAt.toISOString() // Ensure date is in ISO format
    }));

    return {
      challenge: {
        ...currentChallenge,
        name: currentChallenge.title, // Map title to name for backend
        startDate: currentChallenge.startDate.toISOString(), // Ensure date is in ISO format
        endDate: currentChallenge.endDate.toISOString() // Ensure date is in ISO format
      },
      beats: formattedBeats,
      beatDetails: formattedBeatDetails,
      rewards: formattedRewards,
      motivationalStatements: formattedMotivationalStatements
    };
  };

  // Custom message state instead of useChat
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;
    
    setChatLoading(true);
    setError(null);
    
    try {
      // Add user message immediately
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        parts: [{ type: 'text', text: input }]
      };
      
      setMessages(prev => [...prev, userMessage]);
      const currentInput = input;
      setInput("");
      
      // Force refresh challenge data before sending message to ensure we have latest data
      console.log('Refreshing challenge data before sending message...');
      await refreshData();
      
      // Get fresh challenge data
      const challengeData = getChallengeDataForAPI();
      console.log('Sending message with challenge data:', challengeData);
      
      // Use the main chat endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: currentInput }],
          challengeData: challengeData
        }),
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('text/plain') || contentType.includes('text/event-stream')) {
          // Handle streaming response (SSE format)
          const assistantMessageId = (Date.now() + 1).toString();
          let assistantContent = '';
          
          // Create placeholder assistant message
          setMessages(prev => [...prev, {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            parts: [{ type: 'text', text: '' }]
          }]);
          
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          
          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = decoder.decode(value, { stream: true });
              console.log('Received chunk:', chunk);
              
              // The AI SDK uses a different streaming format
              // Try to parse as JSON first (for non-streaming fallback)
              try {
                const data = JSON.parse(chunk);
                console.log('Parsed as JSON:', data);
                
                if (data.delta) {
                  // AI SDK streaming format uses 'delta' field
                  assistantContent += data.delta;
                } else if (data.choices?.[0]?.delta?.content) {
                  assistantContent += data.choices[0].delta.content;
                } else if (data.choices?.[0]?.message?.content) {
                  assistantContent += data.choices[0].message.content;
                } else if (data.content) {
                  assistantContent += data.content;
                } else if (data.text) {
                  assistantContent += data.text;
                }
                
                if (assistantContent) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? {
                          ...msg,
                          content: assistantContent,
                          parts: [{ type: 'text', text: assistantContent }]
                        }
                      : msg
                  ));
                }
              } catch (e) {
                // If not JSON, try SSE format
                const lines = chunk.split('\n');
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6);
                    if (jsonStr.trim() === '[DONE]') continue;
                    
                    try {
                      const data = JSON.parse(jsonStr);
                      console.log('SSE parsed data:', data);
                      
                      if (data.delta) {
                        // AI SDK streaming format uses 'delta' field
                        assistantContent += data.delta;
                      } else if (data.choices?.[0]?.delta?.content) {
                        assistantContent += data.choices[0].delta.content;
                      } else if (data.content) {
                        assistantContent += data.content;
                      } else if (data.text) {
                        assistantContent += data.text;
                      }
                      
                      if (assistantContent) {
                        setMessages(prev => prev.map(msg => 
                          msg.id === assistantMessageId 
                            ? {
                                ...msg,
                                content: assistantContent,
                                parts: [{ type: 'text', text: assistantContent }]
                              }
                            : msg
                        ));
                      }
                    } catch (parseError) {
                      console.log('SSE parse error:', parseError, 'for data:', jsonStr);
                    }
                  }
                }
              }
            }
          }
        } else {
          // Handle JSON response (fallback mode)
          const data = await response.json();
          const assistantMessage = data.choices?.[0]?.message?.content || data.message;
          if (assistantMessage) {
            // Add the assistant response
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: assistantMessage,
              parts: [{ type: 'text', text: assistantMessage }]
            }]);
          }
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      // Restore the input if there was an error
      setInput(input);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 sm:right-6 h-16 w-16 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 z-40 hover:scale-105",
          "bg-gradient-to-br from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 text-primary-foreground",
          "border-2 border-primary-foreground/10",
          className
        )}
        size="lg"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>

      {/* Chat Dialog */}
        <Dialog open={isOpen} onOpenChange={async (open) => {
          setIsOpen(open);
          if (open) {
            // Force a refresh of the challenge data first
            console.log('Chat opened - refreshing challenge data...');
            await refreshData();
            // Then sync data to database when chatbot is opened
            await syncToDatabase();
            // Reset fallback flag when opening dialog (in case issue was resolved)
            setUseFallback(false);
            // Log the current challenge data after refresh
            console.log('Chat opened - current challenge data after refresh:', getChallengeDataForAPI());
          }
        }}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] h-[80vh] flex flex-col p-0 shadow-2xl border-0 bg-card"
          aria-describedby="chatbot-description"
        >
          <DialogHeader className="px-5 py-4 border-b bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/25 flex items-center justify-center shadow-lg">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <div className="font-bold text-lg text-foreground">beatBox Assistant</div>
                  {useFallback && (
                    <div className="text-xs text-amber-600 font-medium">
                      Using fallback mode (organization verification in progress)
                    </div>
                  )}
                  <div id="chatbot-description" className="sr-only">
                    AI-powered assistant to help you track your challenge progress, analyze your beats, and provide personalized insights.
                  </div>
                </div>
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 sm:px-6 py-4 min-h-0">
            <div className="space-y-6">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shadow-lg">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shadow-sm">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[82%] sm:max-w-[78%] rounded-2xl shadow-sm",
                      message.role === "user"
                        ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground px-5 py-3 ml-12"
                        : "bg-card border border-border/60 px-5 py-4"
                    )}
                  >
                    {message.parts.map((part: any, i: number) => {
                      switch (part.type) {
                        case "text":
                          return message.role === "user" ? (
                            <div key={`${message.id}-${i}`} className="text-sm leading-relaxed font-medium">
                              {part.text}
                            </div>
                          ) : (
                            <FormattedContent key={`${message.id}-${i}`} content={part.text} />
                          );
                        case "tool-call":
                          return (
                            <div key={`${message.id}-${i}`} className="text-xs text-muted-foreground mt-3 first:mt-0">
                              <div className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                <span>Analyzing your data...</span>
                              </div>
                            </div>
                          );
                        case "tool-result":
                          return (
                            <div key={`${message.id}-${i}`} className="text-xs text-muted-foreground mt-2">
                              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                                <span className="text-green-700">Analysis complete</span>
                              </div>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                  
                  {message.role === "user" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center shadow-sm">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {chatLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shadow-sm">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="bg-card border border-border/60 rounded-2xl px-5 py-4 max-w-[82%] shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">Analyzing and thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-sm">
                      <Bot className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 max-w-[82%] shadow-sm">
                    <div className="text-sm text-red-700">
                      <p className="font-medium">Sorry, I encountered an error.</p>
                      {error.message?.includes('organization must be verified') ? (
                        <div className="mt-2 space-y-2">
                          <p className="text-red-600">OpenAI organization verification issue detected.</p>
                          <p className="text-red-500 text-xs">This usually resolves automatically within 15 minutes, but can sometimes take longer.</p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setUseFallback(true);
                                setInput("Hello, please test the fallback mode");
                                handleSubmit(new Event('submit') as any);
                              }}
                              className="text-xs h-7 px-2"
                            >
                              Try Fallback Mode
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open('/api/chat/diagnostics', '_blank')}
                              className="text-xs h-7 px-2"
                            >
                              Run Diagnostics
                            </Button>
                          </div>
                        </div>
                      ) : error.message?.includes('Item with id') && error.message?.includes('not found') ? (
                        <div className="mt-2 space-y-2">
                          <p className="text-red-600">AI SDK internal error detected.</p>
                          <p className="text-red-500 text-xs">This is a technical issue with the chat system. The fallback mode should work.</p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setUseFallback(true);
                                setInput("Hello, please test the fallback mode");
                                handleSubmit(new Event('submit') as any);
                              }}
                              className="text-xs h-7 px-2"
                            >
                              Try Fallback Mode
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open('/api/chat/diagnostics', '_blank')}
                              className="text-xs h-7 px-2"
                            >
                              Run Diagnostics
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-red-600 mt-1">Please try again or refresh the page.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="px-4 sm:px-6 py-4 border-t bg-gradient-to-r from-background/95 via-background to-background/95 backdrop-blur-sm flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your challenge, beats, or progress..."
                  className="rounded-2xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 bg-card/80 backdrop-blur-sm pl-4 pr-4 py-3 text-sm placeholder:text-muted-foreground/70 shadow-sm"
                  disabled={chatLoading}
                />
              </div>
              <Button 
                type="submit" 
                size="lg"
                disabled={!input.trim() || chatLoading}
                className="rounded-2xl px-5 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {chatLoading ? (
                  <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Rocket className="h-5 w-5" />
                )}
              </Button>
            </form>
            
            {/* Clear Chat Button - Below Input */}
            {messages.length > 0 && (
              <div className="flex justify-start mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="h-9 w-9 p-0 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md bg-background/80 backdrop-blur-sm border border-border/50 hover:border-destructive/20"
                  title="Clear chat history"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
