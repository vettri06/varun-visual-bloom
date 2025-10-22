import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LogOut, Plus, BookOpen, TrendingUp, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Profile {
  username: string;
  learning_style: string;
  proficiency_level: string;
}

interface Curriculum {
  id: string;
  topic: string;
  difficulty: string;
  progress: number;
  description: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // New curriculum form state
  const [newTopic, setNewTopic] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("intermediate");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch curricula
      const { data: curriculaData, error: curriculaError } = await supabase
        .from("curricula")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (curriculaError) throw curriculaError;
      setCurricula(curriculaData || []);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCurriculum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("curricula").insert({
        user_id: user?.id,
        topic: newTopic,
        difficulty: newDifficulty,
        description: newDescription,
        progress: 0,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "New learning path created.",
      });

      setDialogOpen(false);
      setNewTopic("");
      setNewDescription("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const avgProgress = curricula.length > 0
    ? curricula.reduce((sum, c) => sum + Number(c.progress), 0) / curricula.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              EduAI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-semibold text-foreground">{profile?.username}</span>
            </span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="animate-fade-in backdrop-blur-sm bg-card/95 border-border shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{curricula.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Learning paths</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in backdrop-blur-sm bg-card/95 border-border shadow-md" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgProgress.toFixed(0)}%</div>
              <Progress value={avgProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="animate-fade-in backdrop-blur-sm bg-card/95 border-border shadow-md" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Learning Style</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Badge className="bg-gradient-primary text-white">
                {profile?.learning_style}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Level: {profile?.proficiency_level}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Paths Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Learning Paths</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow">
                <Plus className="h-4 w-4 mr-2" />
                New Path
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Learning Path</DialogTitle>
                <DialogDescription>
                  Start a new personalized learning journey
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCurriculum} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., React Development"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What do you want to learn?"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary">
                  Create Path
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Curricula Grid */}
        {curricula.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-sm bg-card/95 border-border">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No learning paths yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first personalized learning path to get started
              </p>
              <Button onClick={() => setDialogOpen(true)} className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Path
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curricula.map((curriculum, i) => (
              <Card
                key={curriculum.id}
                className="animate-scale-in backdrop-blur-sm bg-card/95 border-border shadow-md hover:shadow-lg transition-all cursor-pointer"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{curriculum.topic}</CardTitle>
                    <Badge variant="outline">{curriculum.difficulty}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {curriculum.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{curriculum.progress}%</span>
                    </div>
                    <Progress value={Number(curriculum.progress)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
