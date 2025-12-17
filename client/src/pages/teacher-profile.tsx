import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { ArrowLeft, User, Star, Award, ShoppingBag, FileText, Video, HelpCircle, Package, TrendingUp } from "lucide-react";
import logo from "@assets/generated_images/cute_owl_mascot_for_kids_news_site.png";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { COURSEWORK_TYPES, type CourseworkItem, type User as UserType } from "@shared/schema";

export default function TeacherProfile() {
  const params = useParams<{ id: string }>();
  const teacherId = params.id;

  const { data: teacher, isLoading } = useQuery<UserType & { courseworkItems: CourseworkItem[] }>({
    queryKey: [`/api/teachers/${teacherId}`],
    enabled: !!teacherId,
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

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Teacher Not Found</h1>
          <Link href="/teachers">
            <Button className="rounded-full">Back to Teachers</Button>
          </Link>
        </div>
      </div>
    );
  }

  const badges = teacher.badges as string[] | null;

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="p-4 border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/teachers">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-3 font-heading text-2xl font-bold text-primary">
              <img src={logo} alt="NewsPals Logo" className="h-10 w-10 object-contain" />
              NewsPals
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
              {teacher.profileImageUrl ? (
                <img src={teacher.profileImageUrl} alt={teacher.firstName || ''} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-primary/50" />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-heading text-3xl font-bold mb-2">
                {teacher.firstName} {teacher.lastName}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {teacher.subjectsTaught || 'Teacher'}
              </p>
              
              {teacher.bio && (
                <p className="text-muted-foreground mb-6 max-w-2xl">{teacher.bio}</p>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                <div className="bg-yellow-50 rounded-xl px-4 py-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <div>
                    <p className="text-xs text-muted-foreground">Reputation</p>
                    <p className="font-bold">{teacher.reputationScore || 0}</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl px-4 py-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Sales</p>
                    <p className="font-bold">{teacher.totalSales || 0}</p>
                  </div>
                </div>
                {teacher.experienceYears && (
                  <div className="bg-blue-50 rounded-xl px-4 py-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="font-bold">{teacher.experienceYears} years</p>
                    </div>
                  </div>
                )}
              </div>

              {badges && badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge, index) => (
                    <span key={index} className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <h2 className="font-heading text-2xl font-bold mb-6">Published Coursework</h2>
        
        {teacher.courseworkItems && teacher.courseworkItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacher.courseworkItems.map((item) => {
              const TypeIcon = getTypeIcon(item.itemType);
              return (
                <Link key={item.id} href={`/marketplace/${item.id}`}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer h-full flex flex-col"
                  >
                    <div className="h-32 bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center">
                      <TypeIcon className="w-12 h-12 text-primary/40" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {COURSEWORK_TYPES.find(t => t.id === item.itemType)?.label || item.itemType}
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-bold mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{item.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-bold text-primary">
                          {(item.price || 0) === 0 ? "Free" : `$${((item.price || 0) / 100).toFixed(2)}`}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.salesCount} sales</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-3xl">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-heading text-xl font-bold mb-2">No Published Content Yet</h3>
            <p className="text-muted-foreground">This teacher hasn't published any coursework yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
