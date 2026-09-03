export type CustomItem = {
  id: string;
  name: string;
  icon: string;
  description?: string;
  enabled: boolean;
};

export type FeatureSection = {
  id: string;
  name: string;
  icon: string;
  description?: string;
  enabled: boolean;
};

export type FeatureConfig = {
  id: string;
  name: string;
  icon: string;
  href: string;
  enabled: boolean;

  description?: string;

  items?: CustomItem[];
  sections?: FeatureSection[];
};

export const defaultFeatures: FeatureConfig[] = [
  {
    id: "me",
    name: "Me",
    icon: "♙",
    href: "/me",
    enabled: true,
  },

  {
    id: "study",
    name: "Study",
    icon: "📚",
    href: "/study",
    enabled: true,
    items: [
      {
        id: "mathematics",
        name: "Mathematics",
        icon: "📐",
        description: "Numbers, formulas and problem solving",
        enabled: true,
      },
      {
        id: "science",
        name: "Science",
        icon: "🔬",
        description: "Explore science and important concepts",
        enabled: true,
      },
      {
        id: "computer",
        name: "Computer",
        icon: "💻",
        description: "Computer and technology learning",
        enabled: true,
      },
      {
        id: "english",
        name: "English",
        icon: "📖",
        description: "Reading, writing and communication",
        enabled: true,
      },
    ],
  },

  {
    id: "fun",
    name: "Fun",
    icon: "🎮",
    href: "/fun",
    enabled: true,
    items: [],
  },

  {
    id: "friends",
    name: "Friends",
    icon: "👥",
    href: "/friends",
    enabled: true,
    items: [],
  },

  {
    id: "birthdays",
    name: "Birthdays",
    icon: "🎂",
    href: "/birthdays",
    enabled: true,
    items: [],
  },

  {
    id: "travel",
    name: "Travel",
    icon: "✈️",
    href: "/travel",
    enabled: true,
    items: [],
  },

  {
    id: "memories",
    name: "Memories",
    icon: "📸",
    href: "/memories",
    enabled: true,
    items: [],
  },

  {
    id: "vibes",
    name: "Vibes",
    icon: "♫",
    href: "/vibes",
    enabled: true,
    items: [],
  },

  {
    id: "favorites",
    name: "Favorites",
    icon: "♡",
    href: "/favorites",
    enabled: true,
    items: [],
  },

  {
    id: "dreams",
    name: "Dreams",
    icon: "☾",
    href: "/dreams",
    enabled: true,
    items: [],
  },

  {
    id: "goals",
    name: "Goals & Plans",
    icon: "🎯",
    href: "/goals",
    enabled: true,
    items: [],
  },

  {
    id: "future",
    name: "Future Me",
    icon: "🔮",
    href: "/future-me",
    enabled: true,
    items: [],
  },

  {
    id: "journey",
    name: "Journey",
    icon: "🛤️",
    href: "/journey",
    enabled: true,
    items: [],
  },

  {
    id: "journal",
    name: "Journal",
    icon: "📔",
    href: "/journal",
    enabled: true,
    items: [],
  },

  {
    id: "mood",
    name: "Mood",
    icon: "😊",
    href: "/mood",
    enabled: true,
    items: [],
  },

  {
    id: "habits",
    name: "Habits",
    icon: "🔥",
    href: "/habits",
    enabled: true,
    items: [],
  },

  {
    id: "creativity",
    name: "Creativity",
    icon: "🎨",
    href: "/creativity",
    enabled: true,
    items: [],
  },

  {
    id: "ideas",
    name: "Ideas Vault",
    icon: "💡",
    href: "/ideas",
    enabled: true,
    items: [],
  },

  {
    id: "lists",
    name: "Custom Lists",
    icon: "📝",
    href: "/lists",
    enabled: true,
    items: [],
  },

  {
    id: "achievements",
    name: "Achievements",
    icon: "🏆",
    href: "/achievements",
    enabled: true,
    items: [],
  },

  {
    id: "calendar",
    name: "Calendar",
    icon: "📅",
    href: "/calendar",
    enabled: true,
    items: [],
  },

  {
    id: "reminders",
    name: "Reminders",
    icon: "🔔",
    href: "/reminders",
    enabled: true,
    items: [],
  },
];



export const FEATURE_STORAGE_KEY =
  "my-little-universe-features";