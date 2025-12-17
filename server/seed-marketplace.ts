import { db } from "./db";
import { users, courseworkItems } from "@shared/schema";
import { sql } from "drizzle-orm";

const DEMO_TEACHERS = [
  {
    id: "demo-teacher-1",
    email: "sarah.chen@newspals.edu",
    firstName: "Sarah",
    lastName: "Chen",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    userRole: "teacher",
    bio: "Passionate elementary teacher with 8 years of experience making learning fun! I specialize in creating engaging science experiments and hands-on activities that spark curiosity in young minds.",
    subjectsTaught: "Science, Math",
    experienceYears: 8,
    reputationScore: 95,
    totalSales: 156,
    badges: JSON.stringify(["Top Seller", "Science Expert", "Community Favorite"]),
  },
  {
    id: "demo-teacher-2",
    email: "michael.rodriguez@newspals.edu",
    firstName: "Michael",
    lastName: "Rodriguez",
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    userRole: "teacher",
    bio: "Former journalist turned educator! I bring real-world news into the classroom through interactive reading comprehension activities and current events discussions.",
    subjectsTaught: "English, Social Studies",
    experienceYears: 12,
    reputationScore: 88,
    totalSales: 89,
    badges: JSON.stringify(["Literacy Champion", "News Expert"]),
  },
  {
    id: "demo-teacher-3",
    email: "emma.watson@newspals.edu",
    firstName: "Emma",
    lastName: "Thompson",
    profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    userRole: "teacher",
    bio: "Creative arts educator who believes every child is an artist! My resources blend art with other subjects to create memorable learning experiences.",
    subjectsTaught: "Art, Music, History",
    experienceYears: 6,
    reputationScore: 92,
    totalSales: 67,
    badges: JSON.stringify(["Creative Educator", "Arts Specialist"]),
  },
  {
    id: "demo-teacher-4",
    email: "james.park@newspals.edu",
    firstName: "James",
    lastName: "Park",
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    userRole: "teacher",
    bio: "STEM enthusiast and coding coach! I create technology-focused lesson plans that prepare kids for the digital future while keeping learning playful and engaging.",
    subjectsTaught: "Technology, Math, Science",
    experienceYears: 5,
    reputationScore: 85,
    totalSales: 45,
    badges: JSON.stringify(["Tech Pioneer", "STEM Champion"]),
  },
];

const DEMO_RESOURCES = [
  {
    teacherId: "demo-teacher-1",
    title: "Space Exploration Science Pack",
    description: "A complete 5-day unit exploring our solar system! Includes hands-on experiments, worksheets, and a fun quiz. Perfect for grades 3-5.",
    itemType: "unit_plan",
    subject: "Science",
    price: 899,
    salesCount: 45,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
  },
  {
    teacherId: "demo-teacher-1",
    title: "Kitchen Chemistry Experiments",
    description: "10 safe and exciting science experiments using everyday kitchen items. Step-by-step instructions with colorful visuals kids love!",
    itemType: "lesson_bundle",
    subject: "Science",
    price: 599,
    salesCount: 78,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop",
  },
  {
    teacherId: "demo-teacher-2",
    title: "News Detective Reading Pack",
    description: "Teach kids to analyze news articles like detectives! 15 reading comprehension activities based on real kid-friendly news stories.",
    itemType: "reading_comprehension",
    subject: "English",
    price: 499,
    salesCount: 56,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop",
  },
  {
    teacherId: "demo-teacher-2",
    title: "World Cultures Weekly Bundle",
    description: "Take your class on a journey around the world! 8 weeks of lessons exploring different cultures, traditions, and geography.",
    itemType: "lesson_bundle",
    subject: "Social Studies",
    price: 1299,
    salesCount: 34,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&h=300&fit=crop",
  },
  {
    teacherId: "demo-teacher-3",
    title: "Art Through History Timeline",
    description: "Beautiful visual timeline connecting famous artworks to historical periods. Includes 20 artist profiles and creative activities.",
    itemType: "unit_plan",
    subject: "Art",
    price: 699,
    salesCount: 29,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
  },
  {
    teacherId: "demo-teacher-3",
    title: "Music & Movement Math Games",
    description: "Learn math concepts through rhythm and dance! 12 musical activities that make multiplication and fractions fun.",
    itemType: "lesson_bundle",
    subject: "Music",
    price: 449,
    salesCount: 41,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
  },
  {
    teacherId: "demo-teacher-4",
    title: "Coding for Kids Starter Kit",
    description: "Introduction to programming concepts through fun puzzles and games. No computer required - uses unplugged activities!",
    itemType: "unit_plan",
    subject: "Technology",
    price: 799,
    salesCount: 23,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop",
  },
  {
    teacherId: "demo-teacher-4",
    title: "Robotics Project Worksheets",
    description: "Design and build simple robots with everyday materials. Step-by-step instructions with engineering challenges.",
    itemType: "pdf_worksheet",
    subject: "Technology",
    price: 399,
    salesCount: 18,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop",
  },
  {
    teacherId: "demo-teacher-1",
    title: "Weather Watchers Homework Pack",
    description: "A month of weather-themed homework activities! Track weather patterns, learn about clouds, and understand climate.",
    itemType: "homework_pack",
    subject: "Science",
    price: 349,
    salesCount: 52,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=300&fit=crop",
  },
  {
    teacherId: "demo-teacher-2",
    title: "Storytelling Project Adventure",
    description: "Guide students through creating their own illustrated storybooks! Includes planning templates, writing prompts, and publishing guide.",
    itemType: "project_assignment",
    subject: "English",
    price: 549,
    salesCount: 38,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
  },
];

async function seedMarketplace() {
  console.log("Seeding marketplace with demo data...");
  
  try {
    for (const teacher of DEMO_TEACHERS) {
      await db
        .insert(users)
        .values(teacher)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...teacher,
            updatedAt: new Date(),
          },
        });
      console.log(`Created/updated teacher: ${teacher.firstName} ${teacher.lastName}`);
    }

    for (const resource of DEMO_RESOURCES) {
      const existing = await db
        .select()
        .from(courseworkItems)
        .where(sql`${courseworkItems.title} = ${resource.title} AND ${courseworkItems.teacherId} = ${resource.teacherId}`)
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(courseworkItems).values(resource);
        console.log(`Created resource: ${resource.title}`);
      } else {
        console.log(`Resource already exists: ${resource.title}`);
      }
    }

    console.log("\nMarketplace seeding complete!");
    console.log(`- ${DEMO_TEACHERS.length} demo teachers`);
    console.log(`- ${DEMO_RESOURCES.length} demo resources`);
  } catch (error) {
    console.error("Error seeding marketplace:", error);
    throw error;
  }
}

seedMarketplace()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
