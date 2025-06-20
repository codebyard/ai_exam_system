import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'wouter';
import { Eye, EyeOff, Github, LogIn, User } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement signup logic
    setTimeout(() => setLoading(false), 1000);
  };

  const handleSocialSignup = (provider: string) => {
    // TODO: Implement social signup logic
    alert(`Social signup with ${provider} coming soon!`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card shadow-xl rounded-xl p-8 space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-6">Start your exam journey in seconds.</p>
        </div>
        {/* Social Signup Buttons */}
        <div className="flex flex-col gap-3">
          <Button variant="outline" className="w-full flex items-center gap-2 justify-center" type="button" onClick={() => handleSocialSignup('Google')}>
            <User className="w-5 h-5" /> Continue with Google
          </Button>
          <Button variant="outline" className="w-full flex items-center gap-2 justify-center" type="button" onClick={() => handleSocialSignup('GitHub')}>
            <Github className="w-5 h-5" /> Continue with GitHub
          </Button>
        </div>
        {/* Divider */}
        <div className="flex items-center my-2">
          <div className="flex-1 h-px bg-muted" />
          <span className="mx-3 text-muted-foreground text-xs uppercase">or sign up with email</span>
          <div className="flex-1 h-px bg-muted" />
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your Name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
} 