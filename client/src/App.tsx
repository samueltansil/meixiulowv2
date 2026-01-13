import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Games from "@/pages/games";
import Videos from "@/pages/videos";
import Teachers from "@/pages/teachers";
import Settings from "@/pages/settings";
import Story from "@/pages/story";
import VideoPlayer from "@/pages/video-player";
import R2VideoPlayer from "@/pages/r2-video-player";
import GamePreview from "@/pages/game-preview";
import AdminStories from "@/pages/admin-stories";
import AdminVideos from "@/pages/admin-videos";
import AdminGames from "@/pages/admin-games";
import AdminTeachers from "@/pages/admin-teachers";
import AdminBanners from "@/pages/admin-banners";
import TeacherDashboard from "@/pages/teacher-dashboard";
import Marketplace from "@/pages/marketplace";
import CourseworkDetail from "@/pages/coursework-detail";
import TeacherProfile from "@/pages/teacher-profile";
import Leaderboard from "@/pages/leaderboard";
import VerifyTeacher from "@/pages/verify-teacher";
import Register from "@/pages/register";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import SelectRole from "@/pages/select-role";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import { useAuth } from "@/hooks/useAuth";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground font-heading">Loading WhyPals...</p>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading, needsRoleSelection } = useAuth();

  if (isLoading) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/select-role" component={SelectRole} />
        <Route component={LoadingScreen} />
      </Switch>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/" component={Home} />
        <Route path="/videos" component={Videos} />
        <Route path="/games" component={Games} />
        <Route path="/game/:id" component={GamePreview} />
        <Route path="/story/:id" component={Story} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin/stories" component={AdminStories} />
        <Route path="/admin/videos" component={AdminVideos} />
        <Route path="/admin/games" component={AdminGames} />
        <Route path="/admin/teachers" component={AdminTeachers} />
        <Route path="/admin/banners" component={AdminBanners} />
        <Route component={Home} />
      </Switch>
    );
  }

  if (needsRoleSelection) {
    return (
      <Switch>
        <Route path="/select-role" component={SelectRole} />
        <Route component={SelectRole} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/games" component={Games} />
      <Route path="/game/:id" component={GamePreview} />
      <Route path="/videos" component={Videos} />
      <Route path="/video/:id" component={VideoPlayer} />
      <Route path="/r2-video/:key" component={R2VideoPlayer} />
      <Route path="/story/:id" component={Story} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/teacher-dashboard" component={TeacherDashboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/:id" component={CourseworkDetail} />
      <Route path="/teacher/:id" component={TeacherProfile} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/verify-teacher" component={VerifyTeacher} />
      <Route path="/settings" component={Settings} />
      <Route path="/admin/stories" component={AdminStories} />
      <Route path="/admin/videos" component={AdminVideos} />
      <Route path="/admin/games" component={AdminGames} />
      <Route path="/admin/teachers" component={AdminTeachers} />
      <Route path="/admin/banners" component={AdminBanners} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
