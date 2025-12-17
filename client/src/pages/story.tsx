import { Link, useParams } from "wouter";
import { ArrowLeft, Clock, Calendar, Play, Pause, Square, Volume2, Loader2, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/data";
import logo from "@assets/whypals-logo.png";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";
import { useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import type { Story, StoryGame } from "@shared/schema";
import { format } from "date-fns";

const IMAGE_TAG_REGEX = /\[IMAGE:([^\]]+)\]/g;
const FULL_IMAGE_TAG_REGEX = /^\[IMAGE:([^\]]+)\]$/;

function isImageParagraph(text: string): boolean {
  return FULL_IMAGE_TAG_REGEX.test(text.trim());
}

function getImageUrl(text: string): string | null {
  const match = text.trim().match(FULL_IMAGE_TAG_REGEX);
  return match ? match[1] : null;
}

function removeImageTags(text: string): string {
  return text.replace(IMAGE_TAG_REGEX, '').trim();
}

function InlineImage({ url }: { url: string }) {
  return (
    <div className="my-6 flex justify-center">
      <img 
        src={url} 
        alt="Story illustration" 
        className="max-w-full h-auto rounded-xl shadow-lg max-h-96 object-contain"
      />
    </div>
  );
}

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

function WordHighlightedText({ 
  text, 
  words, 
  currentWordIndex 
}: { 
  text: string; 
  words: WordTiming[]; 
  currentWordIndex: number;
}) {
  if (words.length === 0) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {words.map((wordData, idx) => (
        <span key={idx}>
          <span
            className={cn(
              "transition-all duration-100 rounded px-0.5",
              idx === currentWordIndex && "bg-purple-500 text-white font-semibold",
              idx < currentWordIndex && "text-purple-700"
            )}
          >
            {wordData.word}
          </span>
          {idx < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
}

function HighlightedParagraph({ 
  text, 
  isCurrentParagraph, 
  isCompleted,
  isReadingActive,
  paragraphRef,
  words,
  currentWordIndex
}: { 
  text: string; 
  isCurrentParagraph: boolean;
  isCompleted: boolean;
  isReadingActive: boolean;
  paragraphRef?: React.RefObject<HTMLParagraphElement | null>;
  words?: WordTiming[];
  currentWordIndex?: number;
}) {
  if (!isReadingActive) {
    return (
      <p className="text-lg leading-relaxed text-foreground/90 mb-6 transition-all duration-300">
        {text}
      </p>
    );
  }

  if (isCompleted) {
    return (
      <p className="text-lg leading-relaxed text-foreground mb-6 bg-green-100 dark:bg-green-900/30 rounded-xl p-4 -mx-3 transition-all duration-500 border-l-4 border-green-500">
        <span className="inline-flex items-center gap-2">
          <span className="text-green-600 text-sm">✓</span>
          {text}
        </span>
      </p>
    );
  }

  if (isCurrentParagraph) {
    return (
      <p 
        ref={paragraphRef}
        className="text-xl leading-relaxed font-medium text-foreground mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 -mx-3 border-l-4 border-purple-500 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30 transition-all duration-300 relative"
      >
        <span className="flex items-start gap-3">
          <span className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-pulse mt-1">
            <Volume2 className="w-4 h-4 text-white" />
          </span>
          <span className="flex-1">
            {words && words.length > 0 && currentWordIndex !== undefined ? (
              <WordHighlightedText 
                text={text} 
                words={words} 
                currentWordIndex={currentWordIndex} 
              />
            ) : (
              <span className="animate-pulse">{text}</span>
            )}
          </span>
        </span>
      </p>
    );
  }

  return (
    <p className="text-lg leading-relaxed text-foreground/50 mb-6 transition-all duration-500 opacity-50">
      {text}
    </p>
  );
}

export default function StoryPage() {
  const params = useParams<{ id: string }>();
  useActivityTracker('reading');
  const currentParagraphRef = useRef<HTMLParagraphElement>(null);
  
  const { data: article, isLoading: isLoadingStory } = useQuery<Story>({
    queryKey: [`/api/stories/${params.id}`],
    enabled: !!params.id,
  });

  const { data: games = [] } = useQuery<StoryGame[]>({
    queryKey: ["/api/games"],
  });

  const relatedGame = useMemo(() => {
    if (!article?.title || games.length === 0) return null;
    const normalize = (str: string) => str
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
    const normalizedStoryTitle = normalize(article.title);
    return games.find(game => {
      if (!game.linkedStoryTitle || !game.isActive) return false;
      const normalizedGameTitle = normalize(game.linkedStoryTitle);
      return normalizedGameTitle === normalizedStoryTitle;
    }) || null;
  }, [article?.title, games]);
  
  const paragraphs = useMemo(() => 
    article?.content.split('\n\n') || [], 
    [article?.content]
  );

  const textParagraphsForTTS = useMemo(() => 
    paragraphs.filter(p => !isImageParagraph(p)).map(p => removeImageTags(p)).filter(p => p.length > 0),
    [paragraphs]
  );
  
  const {
    isPlaying,
    isPaused,
    isLoading: isTTSLoading,
    loadingProgress,
    currentParagraphIndex,
    currentWordIndex,
    progress,
    speak,
    pause,
    resume,
    stop,
    error,
    getCurrentWords,
  } = useElevenLabsTTS();

  const currentWords = getCurrentWords();

  useEffect(() => {
    if (currentParagraphIndex >= 0 && currentParagraphRef.current) {
      currentParagraphRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentParagraphIndex]);

  if (isLoadingStory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-heading">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Story not found</h1>
          <Link href="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.id === article.category);
  const displayDate = article.publishedAt 
    ? format(new Date(article.publishedAt), 'MMM d, yyyy')
    : '';

  const handlePlayPause = () => {
    if (!isPlaying) {
      speak(textParagraphsForTTS);
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStop = () => {
    stop();
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <nav className="p-4 border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-heading text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            <img src={logo} alt="WhyPals Logo" className="h-10 w-10 object-contain" />
            WhyPals
          </Link>
          
          <div className="hidden md:flex items-center gap-8 font-heading font-semibold text-muted-foreground">
            <Link href="/" className="text-primary transition-colors">Home</Link>
            <Link href="/videos" className="hover:text-primary transition-colors">Videos</Link>
            <Link href="/games" className="hover:text-primary transition-colors">Games</Link>
            <Link href="/teachers" className="hover:text-primary transition-colors">Marketplace</Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src={article.thumbnail} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="container mx-auto">
              {category && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${category.color} mb-3`}>
                  {category.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link href="/">
            <Button variant="ghost" className="mb-6 -ml-2 gap-2" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to stories
            </Button>
          </Link>

          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground" data-testid="story-title">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </span>
            {displayDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {displayDate}
              </span>
            )}
          </div>

          <div className="mb-8 p-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl border border-primary/20 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="font-heading font-bold text-foreground block">Read Aloud</span>
                <span className="text-xs text-muted-foreground">Powered by AI voice</span>
              </div>
              <div className="flex-grow" />
              <div className="flex gap-2">
                <Button
                  onClick={handlePlayPause}
                  size="sm"
                  disabled={isTTSLoading}
                  className={cn(
                    "rounded-full gap-2 min-w-[120px]",
                    isPlaying && !isPaused && "bg-secondary hover:bg-secondary/90"
                  )}
                  data-testid="button-read-aloud"
                >
                  {isTTSLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Preparing {loadingProgress}%
                    </>
                  ) : !isPlaying ? (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Play
                    </>
                  ) : isPaused ? (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  )}
                </Button>
                {(isPlaying || isTTSLoading) && (
                  <Button
                    onClick={handleStop}
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-2"
                    data-testid="button-stop-reading"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    {isTTSLoading ? 'Cancel' : 'Stop'}
                  </Button>
                )}
              </div>
            </div>
            
            {isTTSLoading && (
              <div className="space-y-2">
                <Progress value={loadingProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Preparing audio for all {textParagraphsForTTS.length} paragraphs...</span>
                  <span>{loadingProgress}% loaded</span>
                </div>
              </div>
            )}
            
            {isPlaying && !isTTSLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Paragraph {currentParagraphIndex + 1} of {textParagraphsForTTS.length}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>

          <div className="prose prose-lg max-w-none" data-testid="story-content">
            {(() => {
              let ttsIndex = -1;
              return paragraphs.map((paragraph, index) => {
                const imageUrl = getImageUrl(paragraph);
                if (imageUrl) {
                  return <InlineImage key={index} url={imageUrl} />;
                }
                
                const cleanedText = removeImageTags(paragraph);
                if (!cleanedText) return null;
                
                ttsIndex++;
                const isCurrent = currentParagraphIndex === ttsIndex;
                const isCompleted = currentParagraphIndex > ttsIndex;
                
                return (
                  <HighlightedParagraph
                    key={index}
                    text={cleanedText}
                    isCurrentParagraph={isCurrent}
                    isCompleted={isCompleted}
                    isReadingActive={isPlaying}
                    paragraphRef={isCurrent ? currentParagraphRef : undefined}
                    words={isCurrent ? currentWords : undefined}
                    currentWordIndex={isCurrent ? currentWordIndex : undefined}
                  />
                );
              });
            })()}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="font-heading text-xl font-bold mb-4">Did you enjoy this story?</h3>
            <div className="flex gap-4">
              <Button className="rounded-full" data-testid="button-like">I loved it!</Button>
              <Link href="/">
                <Button variant="outline" className="rounded-full" data-testid="button-more-stories">Read more stories</Button>
              </Link>
            </div>
          </div>

          {relatedGame && (
            <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-emerald-900/20 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-emerald-700 dark:text-emerald-300">Play a Related Game!</h3>
                  <p className="text-sm text-emerald-600/80 dark:text-emerald-400">Learn more about this topic while having fun</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {relatedGame.thumbnail && (
                  <div className="relative w-full md:w-48 flex-shrink-0">
                    <img 
                      src={relatedGame.thumbnail} 
                      alt={relatedGame.title}
                      className="w-full h-32 object-cover rounded-xl shadow-md"
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg">
                      <Gamepad2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="flex-grow text-center md:text-left">
                  <h4 className="font-heading text-2xl font-bold text-foreground mb-2">{relatedGame.title}</h4>
                  <p className="text-muted-foreground mb-4">{relatedGame.description}</p>
                  <Link href={`/game/${relatedGame.id}`}>
                    <Button className="rounded-full gap-2 shadow-md" data-testid="button-play-related-game">
                      <Gamepad2 className="w-4 h-4" />
                      Play Game
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
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
              © 2024 WhyPals for Kids. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
