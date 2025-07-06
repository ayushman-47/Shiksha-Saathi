import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Settings, 
  LogOut, 
  Edit2, 
  Save,
  Trophy,
  Target,
  Calendar,
  Star,
  MessageCircle,
  CheckCircle2,
  Globe,
  BookOpen,
  Bell,
  Shield,
  Download,
  Smartphone
} from "lucide-react";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import type { User as UserType, SocialMediaLink } from "@/types";

const CLASSES = ['5', '6', '7', '8', '9', '10', '11', '12'];
const BOARDS = ['CBSE', 'ICSE', 'State Board'];
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    currentClass: '',
    board: '',
    preferredLanguage: 'en',
  });

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

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        currentClass: user.currentClass || '',
        board: user.board || '',
        preferredLanguage: user.preferredLanguage || 'en',
      });
    }
  }, [user]);

  const { data: socialLinks } = useQuery<SocialMediaLink[]>({
    queryKey: ["/api/social-links"],
    enabled: isAuthenticated,
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated! ✅",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
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

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Unable to load profile</h2>
            <p className="text-gray-600">Please try refreshing the page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const userName = user.firstName || user.email?.split('@')[0] || 'Student';
  const profileCompletion = Math.round(
    (Object.values({
      firstName: user.firstName,
      lastName: user.lastName,
      currentClass: user.currentClass,
      board: user.board,
      preferredLanguage: user.preferredLanguage,
    }).filter(Boolean).length / 5) * 100
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center overflow-hidden">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{userName}</h1>
                <p className="text-gray-600">{user.email}</p>
                {user.currentClass && user.board && (
                  <p className="text-sm text-gray-500">Class {user.currentClass} • {user.board}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm text-gray-600">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class">Class</Label>
                <Select
                  value={profileData.currentClass}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, currentClass: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map(cls => (
                      <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="board">Board</Label>
                <Select
                  value={profileData.board}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, board: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARDS.map(board => (
                      <SelectItem key={board} value={board}>{board}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="language">Preferred Language</Label>
              <Select
                value={profileData.preferredLanguage}
                onValueChange={(value) => setProfileData(prev => ({ ...prev, preferredLanguage: value }))}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <MessageCircle className="w-4 h-4 text-secondary" />
                </div>
                <div className="text-sm text-gray-600">Doubts Solved</div>
                <div className="text-2xl font-bold text-secondary">{user.totalDoubtsResolved || 0}</div>
              </div>
              
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-sm text-gray-600">Tests Completed</div>
                <div className="text-2xl font-bold text-green-500">{user.totalTestsCompleted || 0}</div>
              </div>
              
              <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <Star className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-sm text-gray-600">Streak Days</div>
                <div className="text-2xl font-bold text-orange-500">{user.streakDays || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connect With Us */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Connect With Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            {socialLinks && socialLinks.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      link.platform === 'telegram' ? 'bg-blue-500' :
                      link.platform === 'instagram' ? 'bg-pink-500' :
                      link.platform === 'youtube' ? 'bg-red-500' :
                      link.platform === 'whatsapp' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      <i className={link.icon}></i>
                    </div>
                    <div>
                      <div className="font-medium capitalize">{link.platform}</div>
                      <div className="text-sm text-gray-600">Follow us for updates</div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Social media links will be available soon</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              App Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-gray-600">Get notified about new content and updates</div>
                </div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Offline Content</div>
                  <div className="text-sm text-gray-600">Download content for offline access</div>
                </div>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Privacy Settings</div>
                  <div className="text-sm text-gray-600">Control your privacy and data sharing</div>
                </div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
