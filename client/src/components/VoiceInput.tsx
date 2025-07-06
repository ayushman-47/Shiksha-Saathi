import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Square, Volume2 } from "lucide-react";

interface VoiceInputProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (transcript: string) => void;
}

export default function VoiceInput({ isOpen, onClose, onResult }: VoiceInputProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Default to Hindi, can be made configurable
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "There was an error with voice recognition. Please try again.",
          variant: "destructive",
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

  const startListening = () => {
    if (!recognitionRef.current || !isSupported) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    try {
      setTranscript("");
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast({
        title: "Error",
        description: "Failed to start voice recognition.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onResult(transcript.trim());
      setTranscript("");
    }
  };

  const handleClose = () => {
    stopListening();
    setTranscript("");
    onClose();
  };

  // Text-to-speech for playback
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Input</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!isSupported ? (
            <div className="text-center py-8">
              <MicOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Voice recognition is not supported in this browser.</p>
              <p className="text-sm text-gray-400 mt-2">
                Please try using Chrome, Safari, or Edge for voice input.
              </p>
            </div>
          ) : (
            <>
              {/* Voice Visualization */}
              <div className="text-center">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                  isListening 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 voice-pulse' 
                    : 'bg-gradient-to-r from-primary to-accent'
                }`}>
                  <Mic className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">
                  {isListening ? 'Listening...' : 'Ready to listen'}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {isListening 
                    ? 'Speak clearly into your microphone' 
                    : 'Click the microphone to start recording'
                  }
                </p>
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Transcript:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => speakText(transcript)}
                    >
                      <Volume2 className="w-3 h-3 mr-1" />
                      Play
                    </Button>
                  </div>
                  <p className="text-gray-800">{transcript}</p>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-3">
                {!isListening ? (
                  <Button
                    onClick={startListening}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopListening}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              {/* Submit Button */}
              {transcript && !isListening && (
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  Use This Text
                </Button>
              )}
            </>
          )}
        </div>

        {/* Language Support Info */}
        <div className="text-xs text-gray-500 text-center mt-4">
          Supports Hindi, English, and other Indian languages
        </div>
      </DialogContent>
    </Dialog>
  );
}
