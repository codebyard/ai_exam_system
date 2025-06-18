import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  isLoading?: boolean;
}

export default function MessageBubble({ 
  message, 
  isUser, 
  timestamp, 
  isLoading = false 
}: MessageBubbleProps) {
  return (
    <div className={cn(
      "flex gap-3 max-w-[80%]",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={cn(
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col space-y-1">
        <Card className={cn(
          "relative",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted border-border"
        )}>
          <CardContent className="p-3">
            {isLoading ? (
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm opacity-70">AI is thinking...</span>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message}
              </p>
            )}
          </CardContent>
          
          {/* Message tail */}
          <div className={cn(
            "absolute top-3 w-3 h-3 rotate-45",
            isUser 
              ? "-left-1 bg-primary" 
              : "-right-1 bg-muted border-r border-b border-border"
          )} />
        </Card>
        
        {timestamp && (
          <p className={cn(
            "text-xs text-muted-foreground px-2",
            isUser ? "text-right" : "text-left"
          )}>
            {timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        )}
      </div>
    </div>
  );
}
