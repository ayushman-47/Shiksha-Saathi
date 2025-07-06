import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import VoiceInput from "@/components/VoiceInput";
import { Plus, Brain, MessageCircle, Mic, Camera } from "lucide-react";

export default function FloatingActionButton() {
  const [location, navigate] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const handleVoiceInput = (transcript: string) => {
    setIsVoiceModalOpen(false);
    setIsExpanded(false);
    // Navigate to AI Doubts page with the transcript
    navigate('/ai-doubts');
    // You could pass the transcript as state or use a global state manager
  };

  const quickActions = [
    {
      icon: MessageCircle,
      label: "Text Question",
      action: () => {
        navigate('/ai-doubts');
        setIsExpanded(false);
      },
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      icon: Mic,
      label: "Voice Question",
      action: () => {
        setIsVoiceModalOpen(true);
        setIsExpanded(false);
      },
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      icon: Camera,
      label: "Image Question",
      action: () => {
        navigate('/ai-doubts');
        setIsExpanded(false);
      },
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  // Don't show FAB on AI Doubts page as it's redundant
  if (location === '/ai-doubts') {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-24 right-4 z-40">
        {/* Quick Action Buttons */}
        {isExpanded && (
          <div className="flex flex-col gap-3 mb-3 animate-fade-in">
            {quickActions.map((action, index) => (
              <Button
                key={action.label}
                size="sm"
                onClick={action.action}
                className={`${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <Button
          size="lg"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform ${
            isExpanded 
              ? 'bg-red-500 hover:bg-red-600 rotate-45' 
              : 'gradient-primary hover:scale-105'
          }`}
        >
          {isExpanded ? (
            <Plus className="w-6 h-6 text-white" />
          ) : (
            <Brain className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      {/* Voice Input Modal */}
      <VoiceInput
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onResult={handleVoiceInput}
      />
    </>
  );
}
