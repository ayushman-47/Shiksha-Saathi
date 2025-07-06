import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { 
  BookOpen, 
  Brain, 
  Play, 
  ClipboardCheck, 
  FileText, 
  Calendar,
  TrendingUp,
  Users,
  Star,
  MessageCircle,
  CheckCircle2,
  Clock,
  Trophy,
  Target
} from "lucide-react";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import type { DashboardData } from "@/types";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || isDashboardLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Unable to load dashboard</h2>
            <p className="text-gray-600">Please try refreshing the page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { user, todayProgress, recentDoubts, recentTests, studyPlan } = dashboardData;
  const userName = user.firstName || user.email?.split('@')[0] || 'Student';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                नमस्ते, {userName}! 🎓
              </h1>
              <p className="text-gray-600">
                {user.currentClass && user.board ? `Class ${user.currentClass} • ${user.board}` : 'Welcome to Shiksha Saathi'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{todayProgress}%</div>
              <div className="text-sm text-gray-500">Today's Progress</div>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={todayProgress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-secondary/20 rounded-full mb-2 mx-auto">
                <MessageCircle className="w-4 h-4 text-secondary" />
              </div>
              <div className="text-sm text-gray-600">Doubts Solved</div>
              <div className="text-xl font-bold text-secondary">{user.totalDoubtsResolved || 0}</div>
            </div>
            
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full mb-2 mx-auto">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-sm text-gray-600">Tests Completed</div>
              <div className="text-xl font-bold text-green-500">{user.totalTestsCompleted || 0}</div>
            </div>
            
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-500/20 rounded-full mb-2 mx-auto">
                <Star className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-sm text-gray-600">Streak Days</div>
              <div className="text-xl font-bold text-orange-500">{user.streakDays || 0}</div>
            </div>
          </div>
        </div>

        {/* AI Doubt Solver */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">AI Doubt Solver</CardTitle>
                <CardDescription className="text-white/80">
                  Ask any question - Text, Voice, or Image
                </CardDescription>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Link href="/ai-doubts">
                <Button 
                  variant="secondary" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Text
                </Button>
              </Link>
              <Link href="/ai-doubts">
                <Button 
                  variant="secondary"
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Voice
                </Button>
              </Link>
              <Link href="/ai-doubts">
                <Button 
                  variant="secondary"
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Image
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/library">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg mb-3">
                    <BookOpen className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold">Textbooks</h3>
                  <p className="text-sm text-gray-600">Chapter-wise solutions</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/library">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Video Lectures</h3>
                  <p className="text-sm text-gray-600">HD quality content</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/tests">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-3">
                    <ClipboardCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold">Practice Tests</h3>
                  <p className="text-sm text-gray-600">Mock exams & MCQs</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/tests">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-500/10 rounded-lg mb-3">
                    <FileText className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-semibold">Previous Papers</h3>
                  <p className="text-sm text-gray-600">10-year archive</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDoubts.length > 0 ? (
                recentDoubts.slice(0, 3).map((doubt) => (
                  <div key={doubt.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium truncate">{doubt.question}</h4>
                      <p className="text-sm text-gray-500">
                        {doubt.class && doubt.board ? `Class ${doubt.class} • ${doubt.board}` : 'Doubt'}
                      </p>
                    </div>
                    <Badge variant={doubt.status === 'resolved' ? 'default' : 'secondary'}>
                      {doubt.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent doubts. Ask your first question!</p>
                  <Link href="/ai-doubts">
                    <Button className="mt-2">Ask a Question</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Study Plan */}
        {studyPlan && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Today's Study Plan
                </CardTitle>
                <Badge variant="outline">
                  {studyPlan.tasks?.filter(task => task.completed).length || 0} of {studyPlan.tasks?.length || 0} completed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studyPlan.tasks?.slice(0, 4).map((task, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      task.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-gray-500">{task.description}</p>
                      )}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No tasks for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
