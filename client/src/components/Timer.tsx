import { useEffect, useState } from 'react';
import { Clock, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TimerProps {
  timeRemaining: number; // in seconds
  onTimeUp?: () => void;
  isRunning?: boolean;
  onTogglePause?: () => void;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Timer({
  timeRemaining,
  onTimeUp,
  isRunning = true,
  onTogglePause,
  showControls = false,
  size = 'md',
}: TimerProps) {
  const [isPaused, setIsPaused] = useState(!isRunning);

  // Calculate initial time for color coding (use a reasonable default if not provided)
  const initialTime = Math.max(timeRemaining, 60); // At least 1 minute for color calculation

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentageLeft = (timeRemaining / initialTime) * 100;
    if (percentageLeft > 50) return 'timer-normal';
    if (percentageLeft > 20) return 'timer-warning';
    return 'timer-danger';
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    onTogglePause?.();
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (timeRemaining <= 0) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 text-destructive">
            <Clock className={iconSizes[size]} />
            <span className={`font-mono font-bold ${sizeClasses[size]}`}>
              Time's Up!
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${timeRemaining <= initialTime * 0.2 ? 'border-destructive' : timeRemaining <= initialTime * 0.5 ? 'border-warning' : 'border-success'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-center space-x-2">
          <Clock className={`${iconSizes[size]} ${getTimerColor()}`} />
          <span className={`font-mono font-bold ${sizeClasses[size]} ${getTimerColor()}`}>
            {formatTime(timeRemaining)}
          </span>
          {showControls && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTogglePause}
              className="ml-2"
            >
              {isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        {isPaused && (
          <p className="text-center text-sm text-muted-foreground mt-1">
            Timer Paused
          </p>
        )}
      </CardContent>
    </Card>
  );
}
