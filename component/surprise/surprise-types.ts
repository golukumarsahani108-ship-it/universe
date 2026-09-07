export type SurpriseMemory = {
  id: string;
  image: string;
  storagePath: string;
  caption: string;
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

    signature: "With love ♡",
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
};