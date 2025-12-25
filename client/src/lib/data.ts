import { CloudSun, Leaf, Trophy, FlaskConical, Globe, BookOpen, Gamepad2, Puzzle, Brain, Music, Rocket, Sparkles } from "lucide-react";
import scienceHero from "@assets/generated_images/science_category_illustration.png";
import natureHero from "@assets/generated_images/nature_and_animals_category_illustration.png";
import sportsHero from "@assets/generated_images/sports_and_fun_category_illustration.png";

export type Category = "Science" | "Nature" | "Sports" | "World" | "Fun" | "Weekly Theme";

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: any;
  color: string;
  image: string;
  relatedArticleId?: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: Category;
  image: string;
  readTime: string;
  date: string;
}

export const CATEGORIES: { id: Category; label: string; icon: any; color: string; hero?: string }[] = [
  { id: "Weekly Theme", label: "Weekly Theme", icon: Sparkles, color: "bg-pink-100 text-pink-700" },
  { id: "Science", label: "Cool Science", icon: FlaskConical, color: "bg-blue-100 text-blue-700", hero: scienceHero },
  { id: "Nature", label: "Wild Nature", icon: Leaf, color: "bg-green-100 text-green-700", hero: natureHero },
  { id: "Sports", label: "Sports & Play", icon: Trophy, color: "bg-orange-100 text-orange-700", hero: sportsHero },
  { id: "World", label: "Our World", icon: Globe, color: "bg-purple-100 text-purple-700" },
  { id: "Fun", label: "Just for Fun", icon: CloudSun, color: "bg-yellow-100 text-yellow-700" },
];

export const FEATURED_ARTICLE: Article = {
  id: "featured-1",
  title: "Mars Rover Finds a Funny Rock!",
  excerpt: "The Perseverance rover has spotted something strange on the red planet. Is it a donut? A turtle? Let's find out!",
  content: `The Perseverance rover, NASA's amazing robot explorer on Mars, has found something really interesting! While rolling around the red planet, the rover spotted a rock that looks just like a donut with a hole in the middle.

Scientists at NASA were very excited when they saw the pictures. "We've never seen anything quite like this before," said Dr. Sarah Johnson, one of the scientists working on the mission. "It could have been formed by water millions of years ago, or maybe from volcanic activity."

Some kids who saw the picture said it looks more like a turtle shell, while others thought it looked like a spaceship! What do you think it looks like?

The rock is about the size of a basketball and has a perfectly round hole in the center. Scientists will keep studying it to learn more about Mars and its history.

This is just one of many cool discoveries that Perseverance has made since landing on Mars in 2021. The rover is helping scientists understand if life could have ever existed on Mars, and is collecting rock samples that might one day be brought back to Earth!

What would YOU name this funny rock if you could? Share your ideas with your friends!`,
  category: "Science",
  image: scienceHero,
  readTime: "5 min read",
  date: "Dec 9, 2024",
};

export const ARTICLES: Article[] = [
  {
    id: "1",
    title: "Why Do Zebras Have Stripes?",
    excerpt: "Scientists have new ideas about why zebras wear their famous pajamas.",
    content: `Have you ever wondered why zebras have black and white stripes? Scientists have been asking this question for a very long time, and now they have some amazing new answers!

For many years, people thought zebra stripes helped them hide from lions. The idea was that when zebras stand together, their stripes make it hard for predators to tell where one zebra ends and another begins.

But new research shows something even cooler! Scientists discovered that zebra stripes actually help keep bugs away. Flies and mosquitoes get confused by the stripes and have a hard time landing on zebras.

Dr. Tim Caro, a scientist who studied zebras in Africa, found that flies would fly right past zebras or bump into them instead of landing gracefully. "The stripes seem to dazzle the flies," he explained.

Another fun theory is that stripes help zebras stay cool in the hot African sun. The black stripes get hotter than the white stripes, and this creates tiny air currents that cool the zebra down like a natural fan!

Each zebra has its own unique pattern of stripes, just like you have your own unique fingerprints. No two zebras look exactly alike!

What do you think is the most amazing thing about zebra stripes?`,
    category: "Nature",
    image: natureHero,
    readTime: "3 min read",
    date: "Dec 8, 2024",
  },
  {
    id: "2",
    title: "New Skate Park Opens Downtown",
    excerpt: "Grab your helmet! The biggest skate park in the city is finally open for business.",
    content: `Great news for all you skaters out there! The brand new Riverside Skate Park opened its gates last weekend, and it's the biggest skate park our city has ever seen!

The park covers an area as big as two football fields and has something for everyone, whether you're just learning or you're already doing cool tricks.

For beginners, there's a special section with small ramps and rails that are perfect for practicing. "I was scared at first, but the small ramps helped me learn to balance," said 8-year-old Marcus, who visited on opening day.

For more experienced skaters, the park features a massive half-pipe, multiple bowl sections, and a street course with stairs, handrails, and ledges.

The best part? The park is completely free to use! The city built it after thousands of kids signed a petition asking for a safe place to skate.

"We wanted to create a space where kids of all skill levels could come together and have fun," said Mayor Johnson at the ribbon-cutting ceremony.

The park is open from 8 AM to sunset every day. Don't forget to bring your helmet and pads - safety first!

Will you be visiting the new skate park?`,
    category: "Sports",
    image: sportsHero,
    readTime: "4 min read",
    date: "Dec 7, 2024",
  },
  {
    id: "3",
    title: "The Ocean is Louder Than You Think",
    excerpt: "Whales, shrimp, and fish make a lot of noise underwater. Listen to the ocean symphony!",
    content: `Did you know that the ocean is actually a very noisy place? Even though it seems quiet when you're standing on the beach, underwater it's like a big musical concert!

Scientists who study ocean sounds have discovered that the sea is full of amazing noises made by all kinds of creatures.

Whales are the famous singers of the ocean. Blue whales can make sounds louder than a jet engine! Their songs can travel hundreds of miles through the water, helping them find friends and family.

But here's something surprising - tiny shrimp are some of the loudest animals in the ocean! Pistol shrimp can snap their claws so fast that it creates a bubble, and when that bubble pops, it makes a sound almost as loud as a gunshot!

Fish make sounds too. Some fish grunt, others click, and some even make drumming sounds by vibrating their swim bladders.

All together, these sounds create what scientists call the "ocean soundscape" or "ocean symphony." It's like a never-ending concert happening right beneath the waves.

Sadly, noise from ships and boats can make it hard for ocean animals to hear each other. That's why scientists are working on ways to make our oceans quieter and help marine life communicate better.

What ocean sound would you most like to hear?`,
    category: "Nature",
    image: "https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?auto=format&fit=crop&q=80&w=1000",
    readTime: "6 min read",
    date: "Dec 9, 2024",
  },
  {
    id: "4",
    title: "Kid Inventor Builds Robot Dog",
    excerpt: "10-year-old Maya built a robot that can sit, stay, and even fetch the mail!",
    content: `Meet Maya Chen, a 10-year-old inventor from California who has built something incredible - a robot dog that can actually do tricks!

Maya's robot dog, named "Sparky," can sit, stay, shake hands, and even fetch the mail from the mailbox. It took Maya over a year to build Sparky in her garage workshop.

"I've always loved both dogs and robots," Maya explained. "So I decided to combine them into one!"

Sparky is about the size of a medium dog and is made from recycled materials, old computer parts, and 3D-printed pieces. Maya programmed Sparky using a kid-friendly coding language she learned online.

"The hardest part was making Sparky balance while walking," Maya said. "He fell over about a thousand times before I got it right!"

Maya's parents were amazed by her determination. "She would work on Sparky every day after school," her mom shared. "Even when things didn't work, she never gave up."

Now, Maya is teaching other kids how to build their own simple robots. She's even started a robotics club at her school.

What would you teach a robot dog to do if you could build one?`,
    category: "Science",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000",
    readTime: "4 min read",
    date: "Dec 2, 2024",
  },
  {
    id: "5",
    title: "World's Largest Pizza Baked",
    excerpt: "It took 50 chefs and 200 pounds of cheese to make this giant treat.",
    content: `Hold onto your napkins because this pizza story is HUGE! A team of 50 chefs just baked the world's largest pizza, and it's as big as a basketball court!

The massive pizza was made in Rome, Italy - the home of delicious pizza. It measured over 13,000 square feet, which is bigger than many houses!

Here's what went into making this record-breaking pie:
- 19,800 pounds of flour
- 10,000 pounds of tomato sauce
- 8,800 pounds of mozzarella cheese
- 1,488 pounds of margarine
- Plus tons of toppings!

It took the chefs over 48 hours to prepare all the ingredients and bake the pizza. They used special ovens that were brought in just for this event.

"We wanted to show the world that anything is possible when people work together," said head chef Marco Rossi.

The best part? After the pizza was officially measured and the record was confirmed, it was cut into thousands of slices and shared with people in the community. Nobody went home hungry that day!

The previous record was held by a pizza from Los Angeles that was "only" about half the size of this new champion.

What's your favorite pizza topping?`,
    category: "Fun",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1000",
    readTime: "2 min read",
    date: "Dec 9, 2024",
  },
  {
    id: "6",
    title: "Space Tourism: A Vacation to the Stars?",
    excerpt: "Would you like to visit a hotel in orbit? It might happen sooner than you think.",
    content: `Imagine waking up, looking out your window, and seeing Earth floating in space below you. This might sound like science fiction, but it could become reality sooner than you think!

Several companies are now working on building hotels in space. These "space hotels" would orbit Earth and let tourists experience what it's like to live like an astronaut.

One company called Orbital Assembly is planning to open a space hotel by 2027. Their "Voyager Station" would look like a giant wheel spinning slowly in space, with rooms, restaurants, and even a gym!

What would it be like to stay in a space hotel?
- You'd float around in zero gravity (how fun would that be?)
- You'd see 16 sunrises every day as the station orbits Earth
- You could look down and see continents, oceans, and clouds
- Your food might come in special squeeze pouches

Of course, a trip to space won't be cheap at first. Early tickets might cost millions of dollars! But just like airplane tickets, prices are expected to go down as space tourism becomes more common.

"Fifty years ago, only a few astronauts could go to space," said one space tourism expert. "In fifty more years, it might be as normal as taking a cruise ship."

Would you want to visit a space hotel? What would you want to do there?`,
    category: "Science",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000",
    readTime: "5 min read",
    date: "Dec 6, 2024",
  },
];

export function getArticleById(id: string): Article | undefined {
  if (FEATURED_ARTICLE.id === id) return FEATURED_ARTICLE;
  return ARTICLES.find(a => a.id === id);
}

export const GAMES: Game[] = [];

export function getGameById(id: string): Game | undefined {
  return GAMES.find(g => g.id === id);
}

export function getGameByArticleId(articleId: string): Game | undefined {
  return GAMES.find(g => g.relatedArticleId === articleId);
}
