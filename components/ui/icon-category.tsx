import {
  Baby,
  Sparkles,
  PawPrint,
  Leaf,
  Truck,
  BookOpen,
  Home,
  Wrench,
  Briefcase,
  Monitor,
  Users,
  Heart,
  Utensils,
  SprayCan, // for cleaning 🧽
  Hammer,   // for maintenance 🛠️
} from "lucide-react";

const icons = {
  child: Baby,
  baby: Baby,
  kid: Baby,
  clean: SprayCan,
  cleaning: SprayCan,
  pet: PawPrint,
  animal: PawPrint,
  garden: Leaf,
  plant: Leaf,
  move: Truck,
  delivery: Truck,
  tutor: BookOpen,
  homework: BookOpen,
  home: Home,
  repair: Hammer,
  fix: Hammer,
  tech: Monitor,
  php: Monitor,
  node: Monitor,
  react: Monitor,
  vue: Monitor,
  laravel: Monitor,
  symfony: Monitor,
  api: Monitor,
  backend: Monitor,
  frontend: Monitor,
  elderly: Heart,
  senior: Heart,
  care: Heart,
  help: Users,
  assist: Users,
  food: Utensils,
  cook: Utensils,
  general: Briefcase,
  default: Sparkles,
};

export function getIconForCategory(name: string) {
  if (!name) return <Sparkles className="h-4 w-4" />;
  const lower = name.toLowerCase();

  for (const key of Object.keys(icons)) {
    if (lower.includes(key)) {
      const Icon = icons[key];
      return <Icon className="h-4 w-4" />;
    }
  }

  return <Sparkles className="h-4 w-4" />;
}
