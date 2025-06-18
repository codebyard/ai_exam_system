import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Lightbulb, 
  BookOpen, 
  BarChart3,
  Bot,
  User,
  Sparkles
} from 'lucide-react';
import { Link } from 'wouter';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import MessageBubble from '@/components/MessageBubble';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function DoubtClearing() {
  const [location] = useLocation();
  const { user, isLoading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get initial question from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialQuestion = urlParams.get('question');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  // Initialize with welcome message and auto-ask initial question
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Hello ${user?.firstName || 'there'}! 👋 I'm your AI study assistant. I can help you with:\n\n• Explaining complex concepts\n• Solving doubts from previous year questions\n• Providing study strategies\n• Analyzing your performance patterns\n\nWhat would you like to know today?`,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    // If there's an initial question, ask it automatically
    if (initialQuestion) {
      setTimeout(() => {
        handleSendMessage(initialQuestion);
      }, 1000);
    }
  }, [user, initialQuestion]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Simple response simulation based on keywords
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('physics') || lowerMessage.includes('mechanics') || lowerMessage.includes('kinematics')) {
      return "Great question about Physics! 🔬\n\nFor mechanics and kinematics problems, I recommend:\n\n1. **Start with fundamentals**: Always identify what's given and what's asked\n2. **Draw diagrams**: Visual representation helps understand the problem\n3. **Choose the right equations**: Based on what variables you have\n4. **Check units**: Always verify your final answer makes sense\n\nWould you like me to explain any specific physics concept or solve a particular problem?";
    }

    if (lowerMessage.includes('chemistry') || lowerMessage.includes('organic') || lowerMessage.includes('inorganic')) {
      return "Chemistry can be challenging! ⚗️\n\nHere are some effective strategies:\n\n1. **Periodic trends**: Master the periodic table patterns\n2. **Reaction mechanisms**: Understand the 'why' behind reactions\n3. **Practice numericals**: Regular practice with different problem types\n4. **Memorization techniques**: Use mnemonics for complex reactions\n\nIs there a specific chemistry topic you're struggling with?";
    }

    if (lowerMessage.includes('mathematics') || lowerMessage.includes('calculus') || lowerMessage.includes('algebra')) {
      return "Mathematics is all about practice and understanding patterns! 📊\n\nHere's my advice:\n\n1. **Master the basics**: Strong foundation in fundamentals\n2. **Practice regularly**: Consistency is key in mathematics\n3. **Understand concepts**: Don't just memorize formulas\n4. **Solve previous years**: Pattern recognition is crucial\n\nWhich specific math topic would you like help with?";
    }

    if (lowerMessage.includes('weak') || lowerMessage.includes('improve') || lowerMessage.includes('performance')) {
      return "I can help you analyze your performance! 📈\n\nBased on typical student patterns, here are improvement strategies:\n\n1. **Identify weak areas**: Focus 70% of study time on weak subjects\n2. **Time management**: Practice with proper time limits\n3. **Regular revision**: Follow the 1-3-7-21 day revision cycle\n4. **Mock tests**: Take regular practice tests to build confidence\n\nWould you like me to create a personalized study plan based on your attempt history?";
    }

    if (lowerMessage.includes('time') || lowerMessage.includes('speed') || lowerMessage.includes('fast')) {
      return "Time management is crucial for entrance exams! ⏱️\n\nHere are proven techniques:\n\n1. **2-minute rule**: If a question takes more than 2 minutes, mark and move on\n2. **Sectional timing**: Allocate specific time for each section\n3. **Easy questions first**: Build momentum with questions you're confident about\n4. **Practice under pressure**: Simulate real exam conditions\n\nRemember: Accuracy is more important than speed. Speed comes naturally with practice!";
    }

    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('nervous')) {
      return "Exam stress is completely normal! 🧘‍♀️\n\nHere are some techniques to stay calm:\n\n1. **Deep breathing**: 4-7-8 breathing technique works wonders\n2. **Positive visualization**: Imagine yourself succeeding\n3. **Adequate sleep**: Don't compromise on rest before exams\n4. **Light exercise**: A short walk can clear your mind\n\nRemember: You've prepared well, trust in your abilities! The exam is just a way to show what you already know.";
    }

    // Default response
    return `That's an excellent question! 🤔\n\nI'd be happy to help you with that. Could you provide a bit more context or specify which aspect you'd like me to focus on?\n\nFor example:\n• If it's about a specific concept, let me know the subject area\n• If it's about a problem, feel free to share the question\n• If it's about study strategy, tell me what you're finding challenging\n\nThe more details you provide, the better I can assist you! 💡`;
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || currentMessage.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await simulateAIResponse(text);

      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    {
      icon: BookOpen,
      text: "Explain this concept",
      prompt: "Can you explain the concept of [topic] in simple terms with examples?"
    },
    {
      icon: BarChart3,
      text: "Why is my performance weak?",
      prompt: "Based on my performance data, why am I struggling with certain topics and how can I improve?"
    },
    {
      icon: Lightbulb,
      text: "Study strategy tips",
      prompt: "What are the best study strategies for entrance exam preparation?"
    },
    {
      icon: Sparkles,
      text: "Quick revision tips",
      prompt: "Give me some quick revision techniques for the last week before my exam"
    }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationMenu />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center space-x-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Doubt Clearing Centre</h1>
              <p className="text-muted-foreground">
                Get instant help with concepts, problems, and study strategies
              </p>
            </div>
          </div>
          
          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {quickPrompts.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <Card 
                    key={index} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50"
                    onClick={() => setCurrentMessage(prompt.prompt)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{prompt.text}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Container */}
        <Card className="h-[70vh] flex flex-col">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary" />
              <span>AI Assistant</span>
              <Badge variant="secondary" className="bg-success/10 text-success">
                Online
              </Badge>
            </CardTitle>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 p-0">
            <div className="h-full overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              
              {isLoading && (
                <MessageBubble
                  message=""
                  isUser={false}
                  isLoading={true}
                />
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Input Area */}
          <div className="border-t border-border p-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question here... (Press Enter to send, Shift+Enter for new line)"
                  className="min-h-[60px] max-h-[120px] resize-none"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={!currentMessage.trim() || isLoading}
                size="lg"
                className="px-6"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Character count and tips */}
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>
                {currentMessage.length > 0 && `${currentMessage.length} characters`}
              </span>
              <span>
                💡 Tip: Be specific for better help
              </span>
            </div>
          </div>
        </Card>

        {/* Feature Info */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Concept Explanations</h3>
              <p className="text-sm text-muted-foreground">
                Get clear explanations of complex topics with examples
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-success mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Performance Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Understand your weak areas and get improvement strategies
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Lightbulb className="w-8 h-8 text-warning mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Study Tips</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized study strategies and exam techniques
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
