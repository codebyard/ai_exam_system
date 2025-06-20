import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  GraduationCap, 
  UserPlus, 
  ClipboardList, 
  TrendingUp, 
  Star,
  Calendar,
  HelpCircle,
  Crown,
  Check,
  Shield,
  Play,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ExamCard from '@/components/ExamCard';
import PricingCard from '@/components/PricingCard';
import Footer from '@/components/Footer';
import { mockExams } from '@/lib/mockData';

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const [selectedTestimonial, setSelectedTestimonial] = useState(0);

  const featuredExams = mockExams.slice(0, 3);

  const testimonials = [
    {
      name: "Arjun Kumar",
      achievement: "JEE Main AIR 145",
      message: "The PYQ practice helped me identify my weak areas. The detailed solutions and AI doubt clearing feature were game-changers for my JEE preparation.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Priya Sharma",
      achievement: "NEET AIR 523",
      message: "Practicing with authentic NEET PYQs boosted my confidence. The performance analytics showed me exactly where to focus my efforts.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b23c?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Rahul Mishra",
      achievement: "JEE Advanced AIR 89",
      message: "The instant test mode was perfect for quick revision. I could practice anywhere, anytime. Got into IIT with 99.8 percentile!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    }
  ];

  const howItWorksSteps = [
    {
      icon: UserPlus,
      title: "Sign Up & Choose Exam",
      description: "Create your account and select from 20+ entrance exams. Access 2 years of questions for free!",
      color: "text-primary"
    },
    {
      icon: ClipboardList,
      title: "Practice & Learn",
      description: "Take timed tests, instant practice, or browse through solutions with detailed explanations.",
      color: "text-success"
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your performance with detailed analytics and AI-powered doubt clearing support.",
      color: "text-warning"
    }
  ];

  const pricingPlans = [
    {
      name: "Free Access",
      price: 0,
      period: "",
      description: "Perfect for getting started",
      features: [
        "Last 2 years questions for all exams",
        "Instant practice mode",
        "Basic performance analytics",
        "AI doubt clearing (limited)"
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const
    },
    {
      name: "Premium Access",
      price: 99,
      period: "per exam",
      description: "Lifetime access",
      features: [
        "Complete question bank (all years)",
        "Full exam simulation mode",
        "Advanced analytics & insights",
        "Unlimited AI doubt clearing",
        "Priority support"
      ],
      isPopular: true,
      buttonText: "Upgrade Now",
      buttonVariant: "default" as const
    }
  ];

  const faqItems = [
    {
      question: "Are the questions authentic previous year papers?",
      answer: "Yes, all questions are sourced from official previous year question papers. We maintain accuracy and authenticity of every question in our database."
    },
    {
      question: "How does the freemium model work?",
      answer: "You get free access to the last 2 years of questions for all exams. To unlock the complete question bank (all previous years), you can purchase premium access for ₹99 per exam with lifetime validity."
    },
    {
      question: "Can I practice on mobile devices?",
      answer: "Absolutely! Our platform is fully responsive and works seamlessly on all devices - smartphones, tablets, and desktops. Practice anywhere, anytime."
    },
    {
      question: "How does AI doubt clearing work?",
      answer: "Our AI assistant helps explain concepts, solutions, and provides personalized guidance based on your performance. Free users get limited queries, while premium users enjoy unlimited access."
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with your premium purchase, contact our support team for a full refund."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">ExamPYQ</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="#home" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
                  <a href="#exams" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Exams</a>
                  <a href="#pricing" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
                  <a href="#about" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/login'}
              >
                Login
              </Button>
              <Button onClick={() => window.location.href = '/signup'}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-primary/5 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Master Indian 
                <span className="text-primary"> Entrance Exams</span>
                <br />with Previous Year Questions
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Practice with authentic PYQs from JEE, NEET, GATE, and more. Get instant solutions, track progress, and boost your exam confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="flex items-center space-x-2"
                  onClick={() => window.location.href = '/signup'}
                >
                  <Play className="w-5 h-5" />
                  <span>Start Practicing Now</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.location.href = '/login'}
                >
                  Login
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-success mr-2" />
                  <span>50,000+ Questions</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-success mr-2" />
                  <span>Free Practice Tests</span>
                </div>
              </div>
            </div>
            <div className="animate-slide-up">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Students studying together with laptops and books" 
                className="rounded-2xl shadow-2xl w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Get started with our platform in three simple steps and accelerate your exam preparation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                  <div className={`bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors`}>
                    <Icon className={`${step.color} text-2xl w-8 h-8`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Exams */}
      <section id="exams" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Entrance Exams</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Choose from India's top entrance exams and start your preparation journey</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = '/login'}
            >
              View All 20+ Exams
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Students Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Hear from thousands of students who've achieved their dreams with our platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-warning">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.message}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4" 
                    />
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.achievement}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Start free with recent questions, unlock complete question banks for just ₹99 per exam</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={index}
                plan={plan}
                onSelect={() => window.location.href = '/signup'}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-muted-foreground flex items-center justify-center">
              <Shield className="w-4 h-4 text-success mr-2" />
              30-day money-back guarantee • Secure payment via Stripe
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know about our platform</p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                <AccordionTrigger className="font-semibold text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
}
