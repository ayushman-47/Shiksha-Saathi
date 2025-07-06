import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  ClipboardCheck, 
  Play, 
  Clock, 
  Trophy, 
  Target,
  Search,
  Filter,
  FileText,
  Star,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import type { Test, TestAttempt, Subject } from "@/types";

export default function Tests() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'attempts' | 'previous'>('available');
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

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

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: tests, isLoading: isTestsLoading } = useQuery<Test[]>({
    queryKey: ["/api/tests", selectedSubject],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: attempts, isLoading: isAttemptsLoading } = useQuery<TestAttempt[]>({
    queryKey: ["/api/test-attempts"],
    enabled: isAuthenticated && activeTab === 'attempts',
    retry: false,
  });

  const startTestMutation = useMutation({
    mutationFn: async (testId: number) => {
      const response = await apiRequest("POST", `/api/tests/${testId}/attempt`, {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test Started! 📝",
        description: "Good luck with your test!",
      });
      // Navigate to test interface (would be implemented separately)
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to start test. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Practice Tests</h1>
          <p className="text-gray-600">Test your knowledge and track your progress</p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            {/* Subject Filter */}
            {subjects && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedSubject === null ? "default" : "outline"}
                  onClick={() => setSelectedSubject(null)}
                >
                  All Subjects
                </Button>
                {subjects.map((subject) => (
                  <Button
                    key={subject.id}
                    size="sm"
                    variant={selectedSubject === subject.id ? "default" : "outline"}
                    onClick={() => setSelectedSubject(subject.id)}
                  >
                    {subject.name}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={activeTab === 'available' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('available')}
                className="flex-1"
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Available Tests
              </Button>
              <Button
                variant={activeTab === 'attempts' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('attempts')}
                className="flex-1"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                My Attempts
              </Button>
              <Button
                variant={activeTab === 'previous' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('previous')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Previous Papers
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Available Tests Tab */}
            {activeTab === 'available' && (
              <div>
                {isTestsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : tests && tests.length > 0 ? (
                  <div className="space-y-4">
                    {tests.map((test) => (
                      <Card key={test.id} className="border hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{test.title}</h3>
                              <p className="text-gray-600 text-sm mb-3">{test.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="outline">{test.testType.toUpperCase()}</Badge>
                                <Badge variant="outline">{test.class}</Badge>
                                <Badge variant="outline">{test.board}</Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span>{test.duration ? formatDuration(test.duration) : 'No limit'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-gray-500" />
                                  <span>{test.totalMarks} marks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span>{test.questions?.length || 0} questions</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                              Passing: {test.passingMarks} marks
                            </div>
                            <Button
                              onClick={() => startTestMutation.mutate(test.id)}
                              disabled={startTestMutation.isPending}
                              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Test
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tests available</p>
                    {selectedSubject && (
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => setSelectedSubject(null)}
                      >
                        View All Tests
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* My Attempts Tab */}
            {activeTab === 'attempts' && (
              <div>
                {isAttemptsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : attempts && attempts.length > 0 ? (
                  <div className="space-y-4">
                    {attempts.map((attempt) => (
                      <Card key={attempt.id} className="border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">Test Attempt #{attempt.id}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span>{new Date(attempt.startedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{attempt.timeTaken ? formatDuration(Math.floor(attempt.timeTaken / 60)) : 'N/A'}</span>
                              </div>
                            </div>
                            <Badge variant={
                              attempt.status === 'completed' ? 'default' : 
                              attempt.status === 'in_progress' ? 'secondary' : 'outline'
                            }>
                              {attempt.status}
                            </Badge>
                          </div>

                          {attempt.status === 'completed' && attempt.score !== undefined && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Score</span>
                                <span className={`font-bold ${getScoreColor(attempt.score, attempt.totalMarks || 100)}`}>
                                  {attempt.score}/{attempt.totalMarks} ({Math.round((attempt.score / (attempt.totalMarks || 100)) * 100)}%)
                                </span>
                              </div>
                              <Progress 
                                value={(attempt.score / (attempt.totalMarks || 100)) * 100} 
                                className="h-2" 
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No test attempts yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setActiveTab('available')}
                    >
                      Take Your First Test
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Previous Papers Tab */}
            {activeTab === 'previous' && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Previous year papers will be available soon</p>
                <p className="text-sm text-gray-400 mt-2">
                  We're working on adding a comprehensive collection of previous year question papers
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
