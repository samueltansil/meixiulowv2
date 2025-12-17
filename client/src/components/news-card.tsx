import { CATEGORIES } from "@/lib/data";
import { Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import type { Story } from "@shared/schema";
import { format } from "date-fns";

interface NewsCardProps {
  article: Story;
  className?: string;
}

export function NewsCard({ article, className }: NewsCardProps) {
  const categoryColor = CATEGORIES.find((c) => c.id === article.category)?.color || "bg-gray-100 text-gray-700";
  
  const displayDate = article.publishedAt 
    ? format(new Date(article.publishedAt), 'MMM d, yyyy')
    : '';

  return (
    <Link href={`/story/${article.id}`} className="block h-full">
      <motion.article 
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={cn("group relative flex flex-col h-full overflow-hidden rounded-3xl bg-white border-2 border-transparent hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer", className)}
        data-testid={`card-article-${article.id}`}
      >
      <div className="h-32 md:h-48 overflow-hidden relative">
        <img 
          src={article.thumbnail} 
          alt={article.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", categoryColor)}>
            {article.category}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-3">
          <Clock className="w-3 h-3" />
          <span>{displayDate}</span>
          <span>•</span>
          <span>{article.readTime}</span>
        </div>
        
        <h3 className="font-heading text-lg md:text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        
        <p className="text-muted-foreground text-xs md:text-sm mb-4 flex-grow line-clamp-2">
          {article.excerpt ?? ""}
        </p>
        
        <div className="mt-auto">
          <span className="flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all" data-testid={`button-read-${article.id}`}>
            Read Story <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
      </motion.article>
    </Link>
  );
}
