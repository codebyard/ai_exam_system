import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'wouter';
import { Eye, EyeOff, Github, Mail, User, Shield, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      toast({ title: 'Login successful!', description: 'Welcome back!' });
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card shadow-xl rounded-xl p-8 space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <LogIn className="w-7 h-7 text-primary" /> Sign in to your account
          </h1>
          <p className="text-muted-foreground mb-6">Welcome back! Please enter your details.</p>
        </div>
        {/* Google Login Button */}
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (!credentialResponse.credential) return;
              setLoading(true);
              try {
                const res = await fetch('/api/auth/google', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ credential: credentialResponse.credential }),
                });
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}));
                  throw new Error(data.message || 'Google login failed');
                }
                const data = await res.json();
                localStorage.setItem('token', data.token);
                toast({ title: 'Login successful!', description: 'Welcome back!' });
                window.location.href = '/dashboard';
              } catch (err: any) {
                toast({ title: 'Google login failed', description: err.message, variant: 'destructive' });
              } finally {
                setLoading(false);
              }
            }}
            onError={() => toast({ title: 'Google login failed', description: 'Google authentication failed', variant: 'destructive' })}
            width="100%"
            text="signin_with"
            shape="rectangular"
            theme="outline"
          />
        </GoogleOAuthProvider>
        {/* Divider */}
        <div className="flex items-center my-2">
          <div className="flex-1 h-px bg-muted" />
          <span className="mx-3 text-muted-foreground text-xs uppercase">or sign in with email</span>
          <div className="flex-1 h-px bg-muted" />
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
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
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
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
            <div className="text-right mt-2">
              <Link href="/reset-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
        </div>
      </div>
    </div>
  );
} 