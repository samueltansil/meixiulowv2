import { Button } from "@/components/ui/button";
import logo from "@assets/whypals-logo.png";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-heading text-6xl md:text-8xl font-bold text-primary leading-none mb-0"
        >
          
        </motion.h1>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="mt-0 mb-0"
        >
          <img 
            src={logo} 
            alt="WhyPals Logo" 
            className="h-56 w-56 md:h-64 md:w-64 mx-auto object-contain animate-bounce-slow" 
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-heading text-6xl md:text-8xl font-bold text-primary leading-none mt-0 mb-2"
        >
          WhyPals!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-base md:text-2xl text-muted-foreground mb-6 md:mb-12 max-w-2xl mx-auto"
        >
          A fun and safe place for kids to learn about the world through news, videos, and games!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-row gap-2 justify-center items-center"
        >
          <Link href="/register" className="flex-1">
            <Button
              size="sm"
              className="w-full text-sm sm:text-base px-4 py-3 sm:px-6 sm:py-3 rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1"
            >
              Create Account
            </Button>
          </Link>
          <Link href="/login" className="flex-1">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-sm sm:text-base px-4 py-3 sm:px-6 sm:py-3 rounded-full transition-all hover:-translate-y-1"
            >
              Log In
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
        >
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="text-4xl mb-4">📰</div>
            <h3 className="font-heading text-xl font-bold mb-2">Latest News</h3>
            <p className="text-muted-foreground text-sm">Stay updated with kid-friendly news from around the world</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="font-heading text-xl font-bold mb-2">Fun Games</h3>
            <p className="text-muted-foreground text-sm">Play educational games while learning new things</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="font-heading text-xl font-bold mb-2">Cool Videos</h3>
            <p className="text-muted-foreground text-sm">Watch exciting videos about science, nature, and more</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
