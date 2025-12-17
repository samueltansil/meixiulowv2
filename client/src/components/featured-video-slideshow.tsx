import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Video } from "@shared/schema";

export function FeaturedVideoSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: featuredVideos = [] } = useQuery<Video[]>({
    queryKey: ["/api/videos/featured"],
  });

  const nextSlide = useCallback(() => {
    if (featuredVideos.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % featuredVideos.length);
    }
  }, [featuredVideos.length]);

  const prevSlide = useCallback(() => {
    if (featuredVideos.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + featuredVideos.length) % featuredVideos.length);
    }
  }, [featuredVideos.length]);

  useEffect(() => {
    if (featuredVideos.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [featuredVideos.length, nextSlide]);

  useEffect(() => {
    if (currentSlide >= featuredVideos.length && featuredVideos.length > 0) {
      setCurrentSlide(0);
    }
  }, [featuredVideos.length, currentSlide]);

  if (featuredVideos.length === 0) {
    return null;
  }

  const currentVideo = featuredVideos[currentSlide];

  return (
    <div className="relative mb-8 rounded-2xl overflow-hidden bg-white shadow-lg min-h-[280px] md:min-h-[320px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVideo?.id || 'empty'}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="relative h-full"
        >
          {currentVideo && (
            <Link href={`/video/${currentVideo.id}`}>
              <div className="grid md:grid-cols-2 gap-0 h-full min-h-[280px] md:min-h-[320px] cursor-pointer group">
                <div className="order-2 md:order-1 p-5 md:p-8 flex flex-col justify-center bg-gradient-to-br from-white to-blue-50">
                  <h2 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold mb-3 line-clamp-2 text-foreground">
                    {currentVideo.title}
                  </h2>
                  {currentVideo.description && (
                    <p className="text-muted-foreground text-sm md:text-base mb-4 line-clamp-2">
                      {currentVideo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {currentVideo.duration}
                    </span>
                    <span>{currentVideo.views?.toLocaleString() || 0} views</span>
                  </div>
                  <Button size="sm" className="w-fit rounded-full text-sm px-6 h-9 shadow-md shadow-primary/20 gap-2" data-testid="button-watch-featured">
                    <Play className="w-4 h-4 fill-current" />
                    Watch Now
                  </Button>
                </div>
                <div className="order-1 md:order-2 relative h-40 md:h-auto min-h-[180px] overflow-hidden">
                  <img 
                    src={currentVideo.thumbnail}
                    alt={currentVideo.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-primary fill-current ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                      Featured Video
                    </span>
                    <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                      {currentVideo.category}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </motion.div>
      </AnimatePresence>

      {featuredVideos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prevSlide(); }}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            data-testid="button-prev-featured-video"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); nextSlide(); }}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            data-testid="button-next-featured-video"
          >
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredVideos.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); setCurrentSlide(index); }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-primary w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                data-testid={`button-slide-video-${index}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
