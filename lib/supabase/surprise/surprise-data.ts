export type SurpriseData = {
  cover: {
    mini: string;
    brand: string;
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    description: string;
    buttonText: string;
    madeForYou: string;
    bottomText: string;
  };

  memories: {
    chapter: string;
    title: string;
    titleHighlight: string;
    counter: string;
    intro: string;
    images: {
      url: string;
      caption: string;
    }[];
    bottomText: string;
  };

  birthday: {
    mini: string;
    label: string;
    title: string;
    titleHighlight: string;
    message: string;
    text: string;
    forYou: string;
    chapterText: string;
    smallText: string;
    buttonText: string;
    footer: string;
  };

  reasons: {
    chapter: string;
    counter: string;
    kicker: string;
    title: string;
    titleHighlight: string;
    intro: string;
    items: {
      number: string;
      symbol: string;
      title: string;
      text: string;
    }[];
    buttonText: string;
    footer: string;
  };

  letter: {
    chapter: string;
    counter: string;
    date: string;
    title: string;
    titleHighlight: string;
    content: string[];
    ending: string;
    sign: string;
    signature: string;
    buttonText: string;
    footer: string;
  };

  password: {
    chapter: string;
    counter: string;
    kicker: string;
    title: string;
    titleHighlight: string;
    text: string;
    hint: string;
    code: string;
  };

  unlock: {
    top: string;
    counter: string;
    mini: string;
    title: string;
    titleHighlight: string;
    text: string;
    boxTitle: string;
    boxText: string;
    buttonText: string;
    footer: string;
  };

  collection: {
    title: string;
    counter: string;
    subtitle: string;
    heading: string;
    headingHighlight: string;
    items: {
      id: string;
      number: string;
      title: string;
      description: string;
      image: string;
    }[];
    bottomButton: string;
    footer: string;
  };

  littleSurprises: {
    memories: {
      intro: string;
      images: {
        url: string;
        caption: string;
      }[];
      bottomText: string;
    };

    letter: {
      title: string;
      content: string;
      signature: string;
    };

    flowers: {
      title: string;
      text: string;
      footer: string;
    };

    surprise: {
      title: string;
      text: string;
      footer: string;
    };

    secret: {
      title: string;
      intro: string;
      unlockedTitle: string;
      unlockedText: string;
    };

    music: {
      title: string;
      text: string;
    };
  };

  music: {
    backgroundUrl: string;
    surpriseUrl: string;
    enabled: boolean;
  };
};

export const defaultSurpriseData: SurpriseData = {
  cover: {
    mini: "A LITTLE SOMETHING",
    brand: "FOR MY POOKIE ♡",
    eyebrow: "just for you",
    titleLine1: "There's a surprise",
    titleLine2: "waiting for",
    titleHighlight: "you.",
    description:
      "A tiny little world, filled with memories, smiles and things I made especially for you. ♡",
    buttonText: "open your surprise",
    madeForYou: "MADE FOR YOU",
    bottomText: "scroll slowly...",
  },

  memories: {
    chapter: "CHAPTER 01",
    title: "Our little",
    titleHighlight: "memories ♡",
    counter: "01 / 04",
    intro:
      "little moments, silly smiles and memories I never want to forget.",
    images: [
      {
        url: "/images/two.jpg",
        caption: "your smile ♡",
      },
      {
        url: "/images/one.jpg",
        caption: "our chaos ✦",
      },
      {
        url: "/images/third.jpg",
        caption: "sweet you ♡",
      },
    ],
    bottomText: "made of tiny moments",
  },

  birthday: {
    mini: "✦ A LITTLE CELEBRATION ✦",
    label: "TODAY IS YOUR DAY",
    title: "Happy Birthday",
    titleHighlight: "beautiful ♡",
    message:
      "Happy birthday to the most amazing girl in my life !! 🫣❤️",
    text:
      "I hope this little surprise reminds you just how special you are. You deserve all the happiness, all the smiles and all the beautiful little moments this world can give you.",
    forYou: "FOR YOU",
    chapterText: "another beautiful chapter begins...",
    smallText: "and I hope it's your best one yet ♡",
    buttonText: "keep going",
    footer: "made especially for you ♡",
  },

  reasons: {
    chapter: "CHAPTER 03",
    counter: "04 / 06",
    kicker: "for my favourite person",
    title: "Everything I love",
    titleHighlight: "about You ♡",
    intro:
      "just a few little things that make you so wonderfully you.",
    items: [
      {
        number: "01",
        symbol: "♡",
        title: "Your heart",
        text:
          "The way you care about people and make everything feel a little warmer.",
      },
      {
        number: "02",
        symbol: "✦",
        title: "Your laugh",
        text:
          "Somehow your laugh makes even the most ordinary moments special.",
      },
      {
        number: "03",
        symbol: "♡",
        title: "Your kindness",
        text:
          "You have this beautiful way of making people feel seen and appreciated.",
      },
      {
        number: "04",
        symbol: "✧",
        title: "Simply you",
        text:
          "No explanation needed. You're just wonderfully, completely you.",
      },
    ],
    buttonText: "there's more",
    footer: "a tiny list for a very special person ♡",
  },

  letter: {
    chapter: "CHAPTER 04",
    counter: "05 / 06",
    date: "for you, always ♡",
    title: "A little letter",
    titleHighlight: "just for you",
    content: [
      "Dear you,",
      "I don't think I say it enough, but having you in my life is something I'll always be grateful for.",
      "From the random conversations to the silly moments, from laughing over absolutely nothing to simply being there — all of those little things mean more than you probably realise.",
      "I hope this new year of your life brings you countless reasons to smile, beautiful memories to keep close, and all the happiness you deserve.",
      "And whenever life gets a little difficult, I hope you remember how loved, appreciated, and special you are.",
      "Keep being the wonderful person you are. The world is genuinely better with your smile in it.",
    ],
    ending: "Happy Birthday once again ♡",
    sign: "with lots of love,",
    signature: "your best friend ♡",
    buttonText: "one more thing",
    footer: "some words are better written than spoken",
  },

  password: {
    chapter: "CHAPTER 05",
    counter: "06 / 06",
    kicker: "one little secret",
    title: "A secret is waiting",
    titleHighlight: "for you ♡",
    text: "Only someone special knows the magic number...",
    hint: "enter the 4 digit secret ♡",
    code: "1234",
  },

  unlock: {
    top: "SECRET UNLOCKED",
    counter: "07 / 08",
    mini: "✦ YOU GOT IT ✦",
    title: "You found the",
    titleHighlight: "secret ♡",
    text:
      "Okay... you really knew the password. So I guess you're ready for the little surprises waiting for you.",
    boxTitle: "YOUR LITTLE SURPRISE BOX",
    boxText: "Something special is waiting inside...",
    buttonText: "open my little surprises",
    footer: "you made it this far ♡",
  },

  collection: {
    title: "THE LITTLE COLLECTION",
    counter: "08 / 08",
    subtitle: "six tiny things, made just for you",
    heading: "Pick a little",
    headingHighlight: "surprise ♡",
    items: [
      {
        id: "memories",
        number: "01",
        title: "Memories",
        description: "our little moments",
        image: "/surprises/memories.png",
      },
      {
        id: "letter",
        number: "02",
        title: "Letter",
        description: "words for you",
        image: "/surprises/latter.png",
      },
      {
        id: "flowers",
        number: "03",
        title: "Flowers",
        description: "a little bloom",
        image: "/surprises/flower.png",
      },
      {
        id: "surprise",
        number: "04",
        title: "Surprise",
        description: "something special",
        image: "/surprises/surprise.png",
      },
      {
        id: "secret",
        number: "05",
        title: "Secret",
        description: "psst... don't tell",
        image: "/surprises/secret.png",
      },
      {
        id: "music",
        number: "06",
        title: "Music",
        description: "a song for you",
        image: "/surprises/music.png",
      },
    ],
    bottomButton: "one last thing... →",
    footer: "open them whenever you're ready ♡",
  },

  littleSurprises: {
    memories: {
      intro:
        "Some moments are tiny when they happen, but somehow become the memories we remember forever.",
      images: [
        {
          url: "/images/one.jpg",
          caption: "little moments ♡",
        },
        {
          url: "/images/two.jpg",
          caption: "our chaos ✦",
        },
        {
          url: "/images/third.jpg",
          caption: "sweet memories ♡",
        },
      ],
      bottomText: "made of moments I'll always remember ✦",
    },

    letter: {
      title: "A few words for you.",
      content:
        "I hope you know how genuinely special you are. The little conversations, random laughs and silly moments mean more than you probably realise.",
      signature: "— your best friend ♡",
    },

    flowers: {
      title: "A little flower just for you ♡",
      text:
        "Because some people deserve flowers even when there isn't a special occasion.",
      footer: "may your days always bloom beautifully ✦",
    },

    surprise: {
      title: "Happy Birthday! 🎂",
      text:
        "This tiny little cat came all the way here to wish you the happiest birthday. ♡",
      footer: "♡ ✦ ♡ ✦ ♡",
    },

    secret: {
      title: "You've discovered the secret.",
      intro:
        "There was one tiny thing hidden inside this little world...",
      unlockedTitle: "You are one of my favourite people. ♡",
      unlockedText:
        "And no matter how many little surprises I put here, this one is probably the simplest: I'm really glad you're in my life.",
    },

    music: {
      title: "A little song for you ♡",
      text: "A song I wanted you to hear.",
    },
  },

  music: {
    backgroundUrl: "",
    surpriseUrl: "",
    enabled: true,
  },
};