import { Switch, Route } from "wouter";
import { Helmet } from "react-helmet-async";
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
import VerifyParent from "@/pages/verify-parent";
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
  const { isAuthenticated, isLoading } = useAuth();

  // If loading but we have valid initial data (from SSR), we shouldn't show the loading screen
  // unless we are truly waiting for critical data that prevents rendering.
  // In our case, SSR provides data or null.
  if (isLoading) {
    // If we have SSR data, isLoading should technically be false if configured correctly,
    // but if it is true, we want to avoid replacing the SSR content with a spinner.
    // However, if we are on the client and truly loading (e.g. navigation), we might need it.
    // For the initial load, we want to suppress this if possible.
    // A simple heuristic: if we are in the first render cycle and have SSR content (document.getElementById('root')?.hasChildNodes()), 
    // we might want to delay showing the loader. 
    // But a cleaner React way is to trust that useAuth won't be loading if we hydrated correctly.
    // If we ARE seeing the loading screen, it means useAuth IS loading.
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/verify-parent" component={VerifyParent} />
        {/* Avoid full screen loader flash on hydration if possible, but keep for navigation */}
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
        <Route path="/verify-parent" component={VerifyParent} />
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

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/verify-parent" component={VerifyParent} />
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
    <TooltipProvider>
      <Helmet>
        <title>WhyPals - News for Kids</title>
      </Helmet>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
