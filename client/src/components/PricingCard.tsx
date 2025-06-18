import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'outline';
}

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: () => void;
}

export default function PricingCard({ plan, onSelect }: PricingCardProps) {
  return (
    <Card className={`relative transition-all duration-300 hover:shadow-lg ${
      plan.isPopular ? 'border-primary shadow-lg scale-105' : 'hover:scale-105'
    }`}>
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-6 py-2 flex items-center space-x-1">
            <Crown className="w-4 h-4" />
            <span>Most Popular</span>
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-4xl font-bold text-primary">₹{plan.price}</span>
            {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
          </div>
          <p className="text-muted-foreground">{plan.description}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ul className="space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={onSelect}
          variant={plan.buttonVariant}
          className="w-full"
          size="lg"
        >
          {plan.price === 0 ? (
            <Zap className="w-4 h-4 mr-2" />
          ) : (
            <Crown className="w-4 h-4 mr-2" />
          )}
          {plan.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
