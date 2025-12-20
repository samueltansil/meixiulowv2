import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { ArrowLeft, FileText, Video, HelpCircle, Package, ShoppingCart, User, Star, Download, ExternalLink } from "lucide-react";
import logo from "@assets/whypals-logo.png";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { COURSEWORK_TYPES, type CourseworkItem, type User as UserType } from "@shared/schema";

export default function CourseworkDetail() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const id = parseInt(params.id || '0');

  const { data: item, isLoading } = useQuery<CourseworkItem>({
    queryKey: [`/api/marketplace/${id}`],
    enabled: id > 0,
  });

  const { data: teacher } = useQuery<UserType & { courseworkItems: CourseworkItem[] }>({
    queryKey: [`/api/teachers/${item?.teacherId}`],
    enabled: !!item?.teacherId,
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf_worksheet':
      case 'unit_plan':
      case 'lesson_bundle':
      case 'homework_pack':
      case 'reading_comprehension':
      case 'project_assignment':
        return FileText;
      case 'video':
        return Video;
      case 'quiz':
        return HelpCircle;
      default:
        return Package;
    }
  };

  const handleBuy = () => {
    toast({
      title: "Coming Soon!",
      description: "Payment integration will be available soon. This is a placeholder.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Item Not Found</h1>
          <Link href="/marketplace">
            <Button className="rounded-full">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(item.itemType);

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="p-4 border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-3 font-heading text-2xl font-bold text-primary">
              <img src={logo} alt="WhyPals Logo" className="h-10 w-10 object-contain" />
              WhyPals
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm"
            >
              <div className="h-64 bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center">
                <TypeIcon className="w-24 h-24 text-primary/40" />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {COURSEWORK_TYPES.find(t => t.id === item.itemType)?.label || item.itemType}
                  </span>
                  {item.subject && (
                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-muted text-muted-foreground">
                      {item.subject}
                    </span>
                  )}
                </div>
                
                <h1 className="font-heading text-3xl font-bold mb-4">{item.title}</h1>
                
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  {item.description || "No description provided."}
                </p>

                {item.linkUrl && (
                  <a 
                    href={item.linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Resource Link
                  </a>
                )}

                <div className="border-t pt-6">
                  <h2 className="font-heading text-xl font-bold mb-4">What's Included</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-primary" />
                      Digital download available after purchase
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {COURSEWORK_TYPES.find(t => t.id === item.itemType)?.label || "Educational content"}
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm sticky top-24"
            >
              <div className="text-center mb-6">
                <span className="font-heading text-4xl font-bold text-primary">
                  {(item.price || 0) === 0 ? "Free" : `$${((item.price || 0) / 100).toFixed(2)}`}
                </span>
              </div>
              
              <Button 
                onClick={handleBuy} 
                size="lg" 
                className="w-full rounded-full font-bold gap-2 mb-4"
              >
                <ShoppingCart className="w-5 h-5" />
                {(item.price || 0) === 0 ? "Get for Free" : "Buy Now"}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Secure checkout. Instant access after purchase.
              </p>

              <div className="border-t mt-6 pt-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Sales</span>
                  <span className="font-bold">{item.salesCount}</span>
                </div>
              </div>
            </motion.div>

            {teacher && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-6 shadow-sm"
              >
                <h3 className="font-heading text-lg font-bold mb-4">About the Teacher</h3>
                <Link href={`/teacher/${teacher.id}`}>
                  <div className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-xl transition-colors cursor-pointer">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {teacher.profileImageUrl ? (
                        <img src={teacher.profileImageUrl} alt={teacher.firstName || ''} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-primary/50" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{teacher.firstName} {teacher.lastName}</p>
                      <p className="text-sm text-muted-foreground">{teacher.subjectsTaught || 'Teacher'}</p>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{teacher.reputationScore || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
