import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Search, Trophy, Menu, X, Home, Play, Gamepad2, GraduationCap, Settings, Puzzle, Sparkles, Target, HelpCircle, Calendar } from "lucide-react";
import gamesHero from "@assets/generated_images/kids_games_hero_illustration.png";
import logo from "@assets/whypals-logo.png";
import { Button } from "@/components/ui/button";
import { ActivityTracker } from "@/components/activity-tracker";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { usePoints } from "@/hooks/usePoints";
import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { StoryGame } from "@shared/schema";
import ProfileButton from "@/components/ProfileButton";

const GAME_TYPE_ICONS: Record<string, typeof Puzzle> = {
  puzzle: Puzzle,
  whack: Target,
  match: Sparkles,
  quiz: HelpCircle,
  timeline: Calendar,
};

const GAME_TYPE_COLORS: Record<string, string> = {
  puzzle: "bg-purple-100 text-purple-600",
  whack: "bg-red-100 text-red-600",
  match: "bg-emerald-100 text-emerald-600",
  quiz: "bg-blue-100 text-blue-600",
  timeline: "bg-orange-100 text-orange-600",
};

export default function Games() {
  useActivityTracker('playing');
  const { points, isLoading: pointsLoading } = usePoints();
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: games = [], isLoading } = useQuery<StoryGame[]>({
    queryKey: ["/api/games"],
    queryFn: async () => {
      const res = await fetch("/api/games");
      if (!res.ok) throw new Error("Failed to fetch games");
      return res.json();
    },
  });

  const { data: featuredGames = [] } = useQuery<StoryGame[]>({
    queryKey: ["/api/games/featured"],
    queryFn: async () => {
      const res = await fetch("/api/games/featured");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  useEffect(() => {
    if (featuredGames.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % featuredGames.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredGames.length]);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/videos", label: "Videos", icon: Play },
    { href: "/games", label: "Games", icon: Gamepad2 },
    { href: "/teachers", label: "Resource Marketplace", icon: GraduationCap },
  ];

  const handleMobileSearchToggle = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (!mobileSearchOpen) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  };

  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <nav className="p-4 border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-heading text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            <img src={logo} alt="WhyPals Logo" className="h-10 w-10 object-contain" />
            WhyPals
          </Link>
          
          <div className="hidden md:flex items-center gap-8 font-heading font-semibold text-muted-foreground">
             <Link href="/" className="hover:text-primary transition-colors">Home</Link>
             <Link href="/videos" className="hover:text-primary transition-colors">Videos</Link>
             <Link href="/games" className="text-primary transition-colors">Games</Link>
             <Link href="/teachers" className="hover:text-primary transition-colors">Marketplace</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full" data-testid="points-tracker">
              <Trophy className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span className="font-heading font-semibold text-slate-700 dark:text-slate-200">
                {pointsLoading ? '...' : points.toLocaleString()} pts
              </span>
            </div>
            <div className="relative hidden md:block">
               <input 
                type="text" 
                placeholder="Search games..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full bg-muted/50 border-none focus:ring-2 focus:ring-primary/50 outline-none text-sm font-medium w-48 transition-all focus:w-64"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="hidden md:block">
              <ProfileButton />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={handleMobileSearchToggle}
              data-testid="button-mobile-search"
            >
              {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3 font-heading">
                    <img src={logo} alt="WhyPals" className="h-10 w-10" />
                    WhyPals
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location === link.href;
                    return (
                      <Link 
                        key={link.href}
                        href={link.href} 
                        onClick={() => setMobileMenuOpen(false)} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" /> {link.label}
                      </Link>
                    );
                  })}
                  {user && (
                    <>
                      <div className="border-t my-4" />
                      <Link 
                        href="/settings" 
                        onClick={() => setMobileMenuOpen(false)} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                          location === "/settings" ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <Settings className="w-5 h-5" /> Settings
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-border/50">
              <div className="px-4 py-3">
                <div className="relative">
                  <input ref={searchInputRef} type="text" placeholder="Search games..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-full bg-muted/50 border-none focus:ring-2 focus:ring-primary/50 outline-none text-sm font-medium" data-testid="input-mobile-search" />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <ActivityTracker />

        <div className="relative rounded-3xl overflow-hidden mb-8 h-40 md:h-52">
          {featuredGames.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                {featuredGames.map((game, index) => {
                  if (index !== currentFeaturedIndex) return null;
                  const GameIcon = GAME_TYPE_ICONS[game.gameType] || Gamepad2;
                  const colorClass = GAME_TYPE_COLORS[game.gameType] || "bg-gray-100 text-gray-600";
                  return (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <Link href={`/game/${game.id}`} className="block h-full">
                        <div className="relative w-full h-full cursor-pointer group">
                          {game.thumbnail ? (
                            <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full ${colorClass} flex items-center justify-center`}>
                              <GameIcon className="w-24 h-24 opacity-30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${colorClass} mb-2`}>
                              <GameIcon className="w-3 h-3" /> {game.gameType.toUpperCase()}
                            </div>
                            <h2 className="font-heading text-2xl md:text-4xl font-bold text-white mb-1">{game.title}</h2>
                            <p className="text-white/80 text-sm md:text-base line-clamp-1">{game.description || "Play, Learn, and Win!"}</p>
                          </div>
                          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                            <Trophy className="w-4 h-4" /> {game.pointsReward} pts
                          </div>
                          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                            <Sparkles className="w-4 h-4" /> Featured
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {featuredGames.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {featuredGames.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeaturedIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        index === currentFeaturedIndex 
                          ? "bg-white w-6" 
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <img src={gamesHero} alt="Games" className="absolute inset-0 w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-primary/10" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                <h1 className="font-heading text-4xl md:text-6xl font-bold text-primary mb-2 drop-shadow-sm">Games</h1>
                <p className="text-lg md:text-xl font-bold text-primary/80">Play, Learn, and Win!</p>
              </div>
            </>
          )}
        </div>

        <h2 className="font-heading text-2xl font-bold mb-6">All Games</h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground font-heading">Loading games...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-3xl">
            <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-heading text-2xl font-bold text-muted-foreground mb-2">
              {games.length === 0 ? "No Games Yet!" : "No games match your search"}
            </h2>
            <p className="text-muted-foreground">
              {games.length === 0 ? "Check back soon for fun new games!" : "Try a different search term"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => {
              const GameIcon = GAME_TYPE_ICONS[game.gameType] || Gamepad2;
              const colorClass = GAME_TYPE_COLORS[game.gameType] || "bg-gray-100 text-gray-600";
              return (
                <Link key={game.id} href={`/game/${game.id}`}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group h-full"
                    data-testid={`card-game-${game.id}`}
                  >
                    <div className="relative mb-4">
                      {game.thumbnail ? (
                        <img 
                          src={game.thumbnail} 
                          alt={game.title}
                          className="w-full h-32 object-cover rounded-2xl"
                        />
                      ) : (
                        <div className={`w-full h-32 rounded-2xl ${colorClass} flex items-center justify-center`}>
                          <GameIcon className="w-12 h-12 opacity-50" />
                        </div>
                      )}
                      <div className={`absolute -bottom-3 -right-3 w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <GameIcon className="w-7 h-7" />
                      </div>
                    </div>
                    <h3 className="font-heading text-xl md:text-2xl font-bold mb-2 text-foreground">{game.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mb-4 line-clamp-2">{game.description || "A fun learning game!"}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> {game.pointsReward} pts
                      </span>
                      <Button className="rounded-full font-bold" size="sm" data-testid={`button-play-${game.id}`}>Play Game</Button>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <img src={logo} alt="WhyPals Logo" className="h-10 w-10 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
              <span className="font-heading text-xl font-bold text-muted-foreground">WhyPals</span>
            </div>
            <div className="flex gap-8 text-sm font-semibold text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About Us</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
            <p className="text-xs text-muted-foreground/50">
              © 2026 Edu Foundations. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
