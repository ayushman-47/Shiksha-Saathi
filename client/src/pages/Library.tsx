import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  BookOpen, 
  Play, 
  Download, 
  Search,
  Filter,
  FileText,
  Video,
  Headphones,
  Clock,
  Star
} from "lucide-react";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import type { Subject, Chapter, VideoLecture } from "@/types";

export default function Library() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'textbooks' | 'videos' | 'papers'>('textbooks');

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

  const { data: subjects, isLoading: isSubjectsLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: chapters, isLoading: isChaptersLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/chapters", selectedSubject],
    enabled: isAuthenticated && selectedSubject !== null,
    retry: false,
  });

  const { data: videos, isLoading: isVideosLoading } = useQuery<VideoLecture[]>({
    queryKey: ["/api/videos", selectedSubject],
    enabled: isAuthenticated && selectedSubject !== null,
    retry: false,
  });

  const downloadContent = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title;
    link.click();
    
    toast({
      title: "Download Started",
      description: `Downloading ${title}...`,
    });
  };

  const playVideo = (videoUrl: string) => {
    // In a real app, this would open a video player
    window.open(videoUrl, '_blank');
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
          <h1 className="text-3xl font-bold mb-2">Digital Library</h1>
          <p className="text-gray-600">Access textbooks, videos, and study materials</p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for topics, chapters, or subjects..."
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
          </CardContent>
        </Card>

        {/* Subject Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {isSubjectsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : subjects && subjects.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {subjects.map((subject) => (
                  <Button
                    key={subject.id}
                    variant={selectedSubject === subject.id ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setSelectedSubject(subject.id)}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: subject.color || '#6B7280' }}
                    >
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{subject.name}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No subjects available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Tabs */}
        {selectedSubject && (
          <Card>
            <CardHeader>
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <Button
                  variant={activeTab === 'textbooks' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('textbooks')}
                  className="flex-1"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Textbooks
                </Button>
                <Button
                  variant={activeTab === 'videos' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('videos')}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Videos
                </Button>
                <Button
                  variant={activeTab === 'papers' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('papers')}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Papers
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Textbooks Tab */}
              {activeTab === 'textbooks' && (
                <div>
                  {isChaptersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : chapters && chapters.length > 0 ? (
                    <div className="space-y-4">
                      {chapters.map((chapter) => (
                        <div key={chapter.id} className="border rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{chapter.title}</h3>
                              <p className="text-sm text-gray-500">
                                Chapter {chapter.chapterNumber} • {chapter.class} • {chapter.board}
                              </p>
                              {chapter.description && (
                                <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">PDF</Badge>
                            <Button
                              size="sm"
                              onClick={() => downloadContent(chapter.pdfUrl || '#', chapter.title)}
                              disabled={!chapter.pdfUrl}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No chapters available for this subject</p>
                    </div>
                  )}
                </div>
              )}

              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div>
                  {isVideosLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : videos && videos.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {videos.map((video) => (
                        <Card key={video.id} className="overflow-hidden">
                          <div className="aspect-video bg-gray-200 relative">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="w-16 h-16 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Button
                                size="lg"
                                className="rounded-full bg-white/20 hover:bg-white/30"
                                onClick={() => playVideo(video.videoUrl)}
                              >
                                <Play className="w-6 h-6 text-white" />
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-2">{video.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>{video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {video.isDownloadable && (
                                  <Button size="sm" variant="outline">
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No videos available for this subject</p>
                    </div>
                  )}
                </div>
              )}

              {/* Papers Tab */}
              {activeTab === 'papers' && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Previous year papers will be available soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
