export type SurpriseMemory = {
  id: string;
  image: string;
  storagePath: string;
  caption: string;
};

export type SurpriseCollectionItem = {
  id: string;
  title: string;
  subtitle: string;
};

export type SurpriseData = {
  title: string;
  personName: string;
  openingMessage: string;

  memories: {
    eyebrow: string;
    title: string;
    intro: string;
    bottomText: string;
    items: SurpriseMemory[];
  };

  birthday: {
    eyebrow: string;
    title: string;
    message: string;
    forYouText: string;
  };

  reasons: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: {
      id: string;
      title: string;
      text: string;
    }[];
  };

  letter: {
    eyebrow: string;
    title: string;
    content: string;
    signature: string;
  };

  password: {
    enabled: boolean;
    code: string;
    hint: string;
  };

  music: {
    backgroundEnabled: boolean;
    backgroundMusic: string;
    backgroundMusicPath: string;
    surpriseMusic: string;
    surpriseMusicPath: string;
  };

  collection: {
    eyebrow: string;
    title: string;
    subtitle: string;

    items: SurpriseCollectionItem[];

    // Separate from Chapter 01 memories.
    memories: SurpriseMemory[];

    memoriesText: string;
    letterText: string;
    flowersText: string;
    surpriseText: string;
    secretText: string;
    musicText: string;
  };
};

export const DEFAULT_SURPRISE_DATA: SurpriseData = {
  title: "A Little Surprise For You ♡",
  personName: "",
  openingMessage:
    "There’s a surprise waiting for you.",

  memories: {
    eyebrow: "CHAPTER 01",
    title: "Our little memories ♡",
    intro:
      "A few little moments that deserve to stay here forever.",
    bottomText:
      "made of tiny moments",
    items: [
      {
        id: "memory-1",
        image: "",
        storagePath: "",
        caption: "01 your smile ♡",
      },
      {
        id: "memory-2",
        image: "",
        storagePath: "",
        caption: "02 our chaos ✦",
      },
      {
        id: "memory-3",
        image: "",
        storagePath: "",
        caption: "03 sweet you ♡",
      },
    ],
  },

  birthday: {
    eyebrow:
      "✦ A LITTLE CELEBRATION ✦",
    title:
      "Happy Birthday beautiful ♡",
    message:
      "Today is your day, and I hope it brings you countless little reasons to smile.",
    forYouText: "FOR YOU",
  },

  reasons: {
    eyebrow: "CHAPTER 03",
    title:
      "Everything I love about You",
    subtitle:
      "A few little reasons, though there are definitely more.",
    items: [
      {
        id: "reason-1",
        title: "Your presence",
        text:
          "You have a way of making ordinary moments feel special.",
      },
      {
        id: "reason-2",
        title: "Your smile",
        text:
          "One tiny smile can completely change the mood.",
      },
      {
        id: "reason-3",
        title: "Our memories",
        text:
          "The little moments are the ones worth keeping.",
      },
      {
        id: "reason-4",
        title: "Just you",
        text:
          "Because being yourself is already something special.",
      },
    ],
  },

  letter: {
    eyebrow: "CHAPTER 04",
    title:
      "A little letter just for you",
    content:
      "Some things are easier to write than say. So here is a little letter, made especially for you.",
    signature:
      "With love ♡",
  },

  password: {
    enabled: true,
    code: "1234",
    hint: "",
  },

  music: {
    backgroundEnabled: false,
    backgroundMusic: "",
    backgroundMusicPath: "",
    surpriseMusic: "",
    surpriseMusicPath: "",
  },

  collection: {
    eyebrow:
      "THE LITTLE COLLECTION",
    title:
      "Pick a little surprise ♡",
    subtitle:
      "six tiny things, made just for you",

    items: [
      {
        id: "collection-memories",
        title: "Memories",
        subtitle: "our little moments",
      },
      {
        id: "collection-letter",
        title: "Letter",
        subtitle: "words for you",
      },
      {
        id: "collection-flowers",
        title: "Flowers",
        subtitle: "a little bloom",
      },
      {
        id: "collection-surprise",
        title: "Surprise",
        subtitle: "something special",
      },
      {
        id: "collection-secret",
        title: "Secret",
        subtitle: "psst... don't tell",
      },
      {
        id: "collection-music",
        title: "Music",
        subtitle: "a song for you",
      },
    ],

    memories: [
      {
        id: "collection-memory-1",
        image: "",
        storagePath: "",
        caption: "01 little moment ♡",
      },
      {
        id: "collection-memory-2",
        image: "",
        storagePath: "",
        caption: "02 little moment ✦",
      },
      {
        id: "collection-memory-3",
        image: "",
        storagePath: "",
        caption: "03 little moment ♡",
      },
    ],

    memoriesText:
      "our little moments",
    letterText: "words for you",
    flowersText: "a little bloom",
    surpriseText: "something special",
    secretText: "psst... don't tell",
    musicText: "a song for you",
  },
};
export type BirthdayBoxFragment = {
  number: string;
  icon: string;
  title: string;
  label: string;
  description: string;
  content: string;
};

export type BirthdayBoxArchive = {
  id: string;
  label: string;
  title: string;
  message: string;
};

export type BirthdayBoxData = {
  intro: {
    eyebrow: string;
    miniLabel: string;
    titleLineOne: string;
    titleLineTwo: string;
    description: string;
    buttonText: string;
    scrollNote: string;
  };

  access: {
    kicker: string;
    panelLabel: string;
    titleLineOne: string;
    titleLineTwo: string;
    description: string;
    errorText: string;
    buttonText: string;
    hint: string;
  };

  fragments: {
    kicker: string;
    titleLineOne: string;
    titleLineTwo: string;
    description: string;
    headingDecoration: string;
    headingDecorationSmall: string;
    continueText: string;
    items: BirthdayBoxFragment[];
  };

  mirror: {
    kicker: string;
    moveText: string;
    titleLineOne: string;
    titleLineTwo: string;
    message: string;
    hint: string;
    continueText: string;
  };

  frequency: {
    kicker: string;
    panelLabel: string;
    titleLineOne: string;
    titleLineTwo: string;
    continueText: string;
  };

  archive: {
    kicker: string;
    titleLineOne: string;
    titleLineTwo: string;
    description: string;
    items: BirthdayBoxArchive[];
    continueText: string;
  };

  message: {
    kicker: string;
    topLeft: string;
    titleLineOne: string;
    titleLineTwo: string;
    message: string;
    continueText: string;
  };

  core: {
    kicker: string;
    titleLineOne: string;
    titleLineTwo: string;
    buttonText: string;
  };

  final: {
    eyebrow: string;
    titleLineOne: string;
    titleLineTwo: string;
    message: string;
    cardLabel: string;
    cardText: string;
    restartText: string;
  };

  password: string;
  musicUrl: string;
  musicPath: string;
};

export const DEFAULT_BIRTHDAY_BOX: BirthdayBoxData = {
  intro: {
    eyebrow: "A LITTLE BIRTHDAY SECRET",
    miniLabel: "SOMETHING WAS LEFT HERE FOR YOU",
    titleLineOne: "YOU FOUND",
    titleLineTwo: "THE BOX.",
    description:
      "A tiny little mystery filled with memories, music, messages and one final birthday surprise.",
    buttonText: "ENTER THE BOX",
    scrollNote: "TAKE YOUR TIME",
  },

  access: {
    kicker: "PRIVATE ACCESS",
    panelLabel: "BIRTHDAY ACCESS REQUIRED",
    titleLineOne: "Enter the",
    titleLineTwo: "secret code.",
    description:
      "Four little numbers stand between you and what is waiting inside.",
    errorText: "That's not the right little secret. Try again.",
    buttonText: "UNLOCK",
    hint: "ENTER THE 4 DIGIT CODE",
  },

  fragments: {
    kicker: "LITTLE FRAGMENTS",
    titleLineOne: "A few things",
    titleLineTwo: "saved for today.",
    description:
      "Open them one by one. Some things are meant to be discovered slowly.",
    headingDecoration: "✦",
    headingDecorationSmall: "FOR YOU",
    continueText: "KEEP GOING",

    items: [
      {
        number: "01",
        icon: "◌",
        title: "MEMORY",
        label: "A little moment",
        description:
          "Some moments are tiny, but somehow they stay.",
        content:
          "Keep the little moments close. The random laughs, the silly conversations, the unexpected good days — those are often the ones that become the best memories.",
      },
      {
        number: "02",
        icon: "?",
        title: "QUESTION",
        label: "A tiny thought",
        description:
          "A tiny question for your birthday.",
        content:
          "If you could keep one feeling from this year and carry it into the next one, what would you choose?",
      },
      {
        number: "03",
        icon: "✦",
        title: "SECRET",
        label: "Something hidden",
        description:
          "Something small was hidden here.",
        content:
          "Here is the secret: you made it this far. And that means there is still one more thing waiting for you.",
      },
      {
        number: "04",
        icon: "♫",
        title: "SOUND",
        label: "A little atmosphere",
        description:
          "A little atmosphere for the moment.",
        content:
          "Sometimes a song can turn an ordinary moment into a memory. There is a little sound waiting for you in the next room.",
      },
      {
        number: "05",
        icon: "♡",
        title: "MESSAGE",
        label: "Words saved for you",
        description:
          "Words that were waiting to be opened.",
        content:
          "Whatever this new year brings, I hope you find more reasons to smile, more things to look forward to and plenty of moments worth remembering.",
      },
    ],
  },

  mirror: {
    kicker: "LOOK CLOSER",
    moveText: "MOVE CLOSER",
    titleLineOne: "THERE IS",
    titleLineTwo: "MORE HERE.",
    message:
      "today is a little more special because it belongs to you.",
    hint:
      "Move your cursor around the glass • or touch it on mobile",
    continueText: "NEXT FRAGMENT",
  },

  frequency: {
    kicker: "BIRTHDAY FREQUENCY",
    panelLabel: "A LITTLE SOUND FOR TODAY",
    titleLineOne: "Press play.",
    titleLineTwo: "Let it glow.",
    continueText: "NEXT",
  },

  archive: {
    kicker: "THE ARCHIVE",
    titleLineOne: "Things worth",
    titleLineTwo: "keeping.",
    description:
      "Little snapshots from a little universe.",

    items: [
      {
        id: "01",
        label: "ARCHIVE 01",
        title: "A SMALL MOMENT",
        message:
          "A small moment can become a surprisingly important memory. Save the ordinary days too.",
      },
      {
        id: "02",
        label: "ARCHIVE 02",
        title: "ONE OF THOSE DAYS",
        message:
          "Some days do not need to be perfect. They just need one good moment worth remembering.",
      },
      {
        id: "03",
        label: "ARCHIVE 03",
        title: "KEEP THIS ONE",
        message:
          "This one is officially marked: KEEP. Some memories deserve their own little corner.",
      },
    ],

    continueText: "THERE'S ONE MORE",
  },

  message: {
    kicker: "UNSENT MESSAGE",
    topLeft: "FOR YOU",
    titleLineOne: "A little",
    titleLineTwo: "birthday note.",
    message:
      "I hope today gives you plenty of reasons to smile, laugh and make another beautiful memory.",
    continueText: "KEEP THIS",
  },

  core: {
    kicker: "EVERYTHING LEADS HERE",
    titleLineOne: "One last",
    titleLineTwo: "surprise.",
    buttonText: "OPEN THE BOX",
  },

  final: {
    eyebrow: "THE BOX IS OPEN",
    titleLineOne: "HAPPY",
    titleLineTwo: "BIRTHDAY.",
    message:
      "May this new year of your life be filled with tiny happy moments, unexpected smiles, beautiful memories and everything good that you deserve.",
    cardLabel: "THIS LITTLE UNIVERSE",
    cardText: "WAS MADE JUST FOR TODAY.",
    restartText: "↻ EXPERIENCE AGAIN",
  },

  password: "1234",
  musicUrl: "",
  musicPath: "",
};