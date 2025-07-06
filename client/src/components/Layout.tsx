import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import FloatingActionButton from "@/components/FloatingActionButton";
import { 
  Home, 
  Brain, 
  BookOpen, 
  ClipboardCheck, 
  User,
  Bell,
  Wifi,
  WifiOff
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const userName = user?.firstName || user?.email?.split('@')[0] || 'Student';

  const navigationItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/ai-doubts", icon: Brain, label: "AI Solver" },
    { href: "/library", icon: BookOpen, label: "Library" },
    { href: "/tests", icon: ClipboardCheck, label: "Tests" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="mobile-container">
      {/* Top Navigation */}
      <header className="gradient-primary text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Shiksha Saathi</h1>
              <p className="text-xs opacity-90">नमस्ते, {userName}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative p-2 text-white hover:bg-white/20"
            >
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-warning text-white text-xs flex items-center justify-center rounded-full">
                3
              </Badge>
            </Button>
            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 rounded-full overflow-hidden bg-white/20 hover:bg-white/30"
              >
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Offline Indicator */}
      {isOffline && (
        <div className="bg-warning text-white px-4 py-2 text-sm text-center flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          You're offline. Some features may be limited.
        </div>
      )}

      {/* Main Content */}
      <main className="mobile-nav-height p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map(({ href, icon: Icon, label }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center p-2 h-auto min-h-[60px] touch-target ${
                    isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
