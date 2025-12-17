import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, ChevronLeft, ChevronRight, X, Home as HomeIcon, Play, Gamepad2, GraduationCap, Settings, Star } from "lucide-react";
import logo from "@assets/generated_images/cute_owl_mascot_for_kids_news_site.png";
import { CATEGORIES } from "@/lib/data";
import { NewsCard } from "@/components/news-card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ActivityTracker } from "@/components/activity-tracker";
import { useQuery } from "@tanstack/react-query";
import type { Story } from "@shared/schema";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ProfileButton from "@/components/ProfileButton";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
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

  const { data: stories = [], isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const { data: featuredStories = [] } = useQuery<Story[]>({
    queryKey: ["/api/stories/featured"],
  });

  const filteredArticles = activeCategory === "All" 
    ? stories 
    : stories.filter(a => a.category === activeCategory);

  const nextSlide = useCallback(() => {
    if (featuredStories.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % featuredStories.length);
    }
  }, [featuredStories.length]);

  const prevSlide = useCallback(() => {
    if (featuredStories.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + featuredStories.length) % featuredStories.length);
    }
  }, [featuredStories.length]);

  useEffect(() => {
    if (featuredStories.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [featuredStories.length, nextSlide]);

  useEffect(() => {
    if (currentSlide >= featuredStories.length && featuredStories.length > 0) {
      setCurrentSlide(0);
    }
  }, [featuredStories.length, currentSlide]);

  const currentFeaturedStory = featuredStories[currentSlide];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-accent selection:text-accent-foreground flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="NewsPals Logo" className="h-12 w-12 object-contain" />
            <span className="font-heading text-2xl font-bold text-primary tracking-tight">NewsPals</span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-heading font-semibold text-muted-foreground">
            <Link href="/" className="text-primary hover:text-primary transition-colors">Home</Link>
            <Link href="/videos" className="hover:text-primary transition-colors">Videos</Link>
            <Link href="/games" className="hover:text-primary transition-colors">Games</Link>
            <Link href="/teachers" className="hover:text-primary transition-colors">Marketplace</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <input 
                type="text" 
                placeholder="Search news..." 
                className="pl-10 pr-4 py-2 rounded-full bg-muted/50 border-none focus:ring-2 focus:ring-primary/50 outline-none text-sm font-medium w-48 transition-all focus:w-64"
                data-testid="input-search"
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
                    <img src={logo} alt="NewsPals" className="h-10 w-10" />
                    NewsPals
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
        
        {/* Mobile Search Bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border/50"
            >
              <div className="px-4 py-3">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full bg-muted/50 border-none focus:ring-2 focus:ring-primary/50 outline-none text-sm font-medium"
                    data-testid="input-mobile-search"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="container mx-auto px-4 py-8 pb-24 flex-grow">
        <ActivityTracker />

        {/* Hero Section - Featured Stories Slideshow */}
        {activeCategory === "All" && featuredStories.length > 0 && currentFeaturedStory && (
          <section className="mb-6 relative">
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/story/${currentFeaturedStory.id}`}>
                    <div className="grid md:grid-cols-2 gap-0 cursor-pointer group min-h-[280px] md:min-h-[300px]">
                      <div className="order-2 md:order-1 p-4 md:p-6 flex flex-col justify-center bg-gradient-to-br from-white to-blue-50 h-full">
                        <h1 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-3 text-foreground line-clamp-2">
                          {currentFeaturedStory.title}
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed max-w-md line-clamp-2">
                          {currentFeaturedStory.excerpt}
                        </p>
                        <Button size="sm" className="w-fit rounded-full text-sm px-6 h-9 shadow-md shadow-primary/20" data-testid="button-hero-read">
                          Read the Full Story
                        </Button>
                      </div>
                      <div className="order-1 md:order-2 relative h-32 md:h-full min-h-[120px] overflow-hidden">
                        <img 
                          src={currentFeaturedStory.thumbnail} 
                          alt={currentFeaturedStory.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden" />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs tracking-wide">
                          FEATURED STORY
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {featuredStories.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    data-testid="button-prev-slide"
                  >
                    <ChevronLeft className="w-5 h-5 text-primary" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    data-testid="button-next-slide"
                  >
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </button>
                </>
              )}
            </div>

            {/* Slide Indicators */}
            {featuredStories.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {featuredStories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? "bg-primary w-6" 
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    data-testid={`slide-indicator-${index}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Category Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x" data-testid="category-scroll">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory("All")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap font-bold shadow-sm transition-all snap-start ${
              activeCategory === "All" 
                ? "bg-primary text-white shadow-primary/25" 
                : "bg-white text-muted-foreground hover:bg-gray-50"
            }`}
          >
            <Menu className="w-5 h-5" />
            All News
          </motion.button>
          
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap font-bold shadow-sm transition-all snap-start ${
                  isActive 
                    ? "bg-primary text-white shadow-primary/25" 
                    : "bg-white text-muted-foreground hover:bg-gray-50"
                }`}
                data-testid={`category-btn-${cat.id}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                {cat.label}
              </motion.button>
            );
          })}
        </div>

        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">
              {activeCategory === "All" ? "Latest Stories" : `${activeCategory} News`}
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Fresh updates from around the world!
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {filteredArticles.map((article, i) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <img src={logo} alt="NewsPals Logo" className="h-10 w-10 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
              <span className="font-heading text-xl font-bold text-muted-foreground">NewsPals</span>
            </div>
            <div className="flex gap-8 text-sm font-semibold text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About Us</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
            <p className="text-xs text-muted-foreground/50">
              © 2024 NewsPals for Kids. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
