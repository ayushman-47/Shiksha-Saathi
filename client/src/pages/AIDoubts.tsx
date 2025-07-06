import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageCircle, 
  Mic, 
  Camera, 
  Send, 
  Loader2,
  Volume2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Brain
} from "lucide-react";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import VoiceInput from "@/components/VoiceInput";
import type { Doubt } from "@/types";

export default function AIDoubts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [question, setQuestion] = useState("");
  const [inputType, setInputType] = useState<'text' | 'voice' | 'image'>('text');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

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

  const { data: doubts, isLoading: isDoubtsLoading, refetch } = useQuery<Doubt[]>({
    queryKey: ["/api/doubts"],
    enabled: isAuthenticated,
    retry: false,
  });

  const solveDoubtMutation = useMutation({
    mutationFn: async (data: {
      question: string;
      questionType: string;
      questionImageUrl?: string;
    }) => {
      const response = await apiRequest("POST", "/api/doubts/solve", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Doubt Solved! 🎉",
        description: "Your question has been answered successfully.",
      });
      setQuestion("");
      setSelectedImage(null);
      refetch();
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
        description: "Failed to solve doubt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const data = {
      question,
      questionType: inputType,
      questionImageUrl: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
    };

    solveDoubtMutation.mutate(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setInputType('image');
      setQuestion(`Image uploaded: ${file.name}`);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setQuestion(transcript);
    setInputType('voice');
    setIsVoiceModalOpen(false);
  };

  const playAnswer = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      toast({
        title: "Audio Error",
        description: "Unable to play the audio answer.",
        variant: "destructive",
      });
    });
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
          <h1 className="text-3xl font-bold mb-2">AI Doubt Solver</h1>
          <p className="text-gray-600">Ask any question through text, voice, or image</p>
        </div>

        {/* Input Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              What would you like to learn today?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Type Selector */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={inputType === 'text' ? 'secondary' : 'outline'}
                  onClick={() => setInputType('text')}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Text
                </Button>
                <Button
                  type="button"
                  variant={inputType === 'voice' ? 'secondary' : 'outline'}
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Voice
                </Button>
                <Button
                  type="button"
                  variant={inputType === 'image' ? 'secondary' : 'outline'}
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Image
                </Button>
              </div>

              {/* Question Input */}
              <div className="space-y-2">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  className="bg-white/20 border-white/20 text-white placeholder-white/70 min-h-[100px]"
                />
                {selectedImage && (
                  <div className="text-sm text-white/80">
                    Selected image: {selectedImage.name}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!question.trim() || solveDoubtMutation.isPending}
                className="w-full bg-white text-purple-600 hover:bg-white/90"
              >
                {solveDoubtMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Solving...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Solve Doubt
                  </>
                )}
              </Button>
            </form>

            {/* Hidden file input */}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Recent Doubts */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Doubts</CardTitle>
          </CardHeader>
          <CardContent>
            {isDoubtsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : doubts && doubts.length > 0 ? (
              <div className="space-y-4">
                {doubts.map((doubt) => (
                  <div key={doubt.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={doubt.status === 'resolved' ? 'default' : 'secondary'}>
                            {doubt.status === 'resolved' ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : doubt.status === 'pending' ? (
                              <Clock className="w-3 h-3 mr-1" />
                            ) : (
                              <AlertCircle className="w-3 h-3 mr-1" />
                            )}
                            {doubt.status}
                          </Badge>
                          <Badge variant="outline">{doubt.questionType}</Badge>
                        </div>
                        <p className="font-medium mb-1">{doubt.question}</p>
                        {doubt.answer && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-800">{doubt.answer}</p>
                            {doubt.answerAudioUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => playAnswer(doubt.answerAudioUrl!)}
                              >
                                <Volume2 className="w-4 h-4 mr-1" />
                                Play Audio
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(doubt.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No doubts yet. Ask your first question!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Voice Input Modal */}
      <VoiceInput
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onResult={handleVoiceInput}
      />
    </Layout>
  );
}
