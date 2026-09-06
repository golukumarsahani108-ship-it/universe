"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassInput from "@/component/glass/GlassInput";
import { createClient } from "@/lib/supabase/client";

type Relationship =
  | "Best Friend"
  | "Sister"
  | "Brother"
  | "Mother"
  | "Father"
  | "Partner"
  | "Special Person"
  | "Custom";

type PageType =
  | "Welcome"
  | "Memories"
  | "Photo Gallery"
  | "Letter"
  | "Favourite Things"
  | "Birthday"
  | "Quotes"
  | "Timeline"
  | "Reasons"
  | "Surprise"
  | "Secret"
  | "Music"
  | "Final Reveal"
  | "Custom";

type Theme =
  | "spatial-glass"
  | "pink-spatial"
  | "purple-universe"
  | "black-luxury"
  | "blue-galaxy"
  | "soft-dream"
  | "custom";

type UniverseImage = {
  id: string;
  url: string;
  name: string;
  storagePath?: string;
  type?: string;
  size?: number;
  file?: File;
};

type UniverseAudio = {
  url: string;
  name: string;
  file?: File;
};
type UniversePage = {
  id: string;
  order: number;
  title: string;
  type: PageType;
  content: string;
  images: UniverseImage[];
  musicEnabled: boolean;
  animationEnabled: boolean;
  buttonEnabled: boolean;
  buttonText: string;
  buttonAction: string;
};

type MusicSettings = {
  backgroundEnabled: boolean;
  backgroundMusic?: UniverseAudio;
  autoplay: boolean;
  volume: number;
  surpriseMusic?: UniverseAudio;
  surpriseEnabled: boolean;
};

type PasswordSettings = {
  enabled: boolean;
  mode: "normal" | "custom";
  password: string;
  confirmPassword: string;
  screenTitle: string;
  screenMessage: string;
  buttonText: string;
};

type DesignSettings = {
  theme: Theme;
  accentColor: string;
  glassStyle: "soft" | "clear" | "frosted";
  glowIntensity: number;
  backgroundStyle: "spatial" | "aurora" | "soft" | "custom";
  fontStyle: "modern" | "soft" | "elegant" | "playful";
  animationIntensity: number;
  particlesEnabled: boolean;
  cursorEffectEnabled: boolean;
  galleryStyle: "grid" | "polaroid" | "cards" | "cinematic";
  buttonStyle: "glass" | "solid" | "outline" | "pill";
};

type BuilderData = {
  universeName: string;
  personName: string;
  relationship: Relationship | "";
  customRelationship: string;
  openingMessage: string;
  description: string;
  pageCount: string;
};

const PAGE_TYPES: PageType[] = [
  "Welcome",
  "Memories",
  "Photo Gallery",
  "Letter",
  "Favourite Things",
  "Birthday",
  "Quotes",
  "Timeline",
  "Reasons",
  "Surprise",
  "Secret",
  "Music",
  "Final Reveal",
  "Custom",
];

const RELATIONSHIPS: Relationship[] = [
  "Best Friend",
  "Sister",
  "Brother",
  "Mother",
  "Father",
  "Partner",
  "Special Person",
  "Custom",
];

const PAGE_COUNTS = ["3", "5", "6", "8", "10", "Custom"];

const THEMES: {
  id: Theme;
  name: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "spatial-glass",
    name: "MY UNIVERSE",
    icon: "🌌",
    description: "Original Spatial Glass experience",
  },
  {
    id: "pink-spatial",
    name: "Pink Spatial",
    icon: "🌸",
    description: "Soft pink glass universe",
  },
  {
    id: "purple-universe",
    name: "Purple Universe",
    icon: "🔮",
    description: "Dreamy cosmic atmosphere",
  },
  {
    id: "black-luxury",
    name: "Black Luxury",
    icon: "🖤",
    description: "Elegant premium experience",
  },
  {
    id: "blue-galaxy",
    name: "Blue Galaxy",
    icon: "💫",
    description: "Deep blue cosmic glass",
  },
  {
    id: "soft-dream",
    name: "Soft Dream",
    icon: "☁️",
    description: "Light and dreamy",
  },
  {
    id: "custom",
    name: "Custom",
    icon: "🎨",
    description: "Build your own visual style",
  },
];

const ACCENT_COLORS = [
  "#61ddff",
  "#ff8fc7",
  "#b78cff",
  "#7ea7ff",
  "#8fe3c1",
  "#ffd36e",
  "#ff9d76",
  "#d9a7ff",
];

function createId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function createPage(order: number): UniversePage {
  return {
    id: createId("page"),
    order,
    title: `Page ${order}`,
    type: "Welcome",
    content: "",
    images: [],
    musicEnabled: false,
    animationEnabled: true,
    buttonEnabled: true,
    buttonText: "Next →",
    buttonAction: "next",
  };
}

const INITIAL_DESIGN: DesignSettings = {
  theme: "spatial-glass",
  accentColor: "#61ddff",
  glassStyle: "soft",
  glowIntensity: 70,
  backgroundStyle: "spatial",
  fontStyle: "modern",
  animationIntensity: 70,
  particlesEnabled: true,
  cursorEffectEnabled: true,
  galleryStyle: "grid",
  buttonStyle: "glass",
};

const INITIAL_MUSIC: MusicSettings = {
  backgroundEnabled: false,
  autoplay: false,
  volume: 70,
  surpriseEnabled: false,
};

const INITIAL_PASSWORD: PasswordSettings = {
  enabled: false,
  mode: "normal",
  password: "",
  confirmPassword: "",
  screenTitle: "A little secret awaits ♡",
  screenMessage:
    "Only someone special knows the magic needed to enter this universe.",
  buttonText: "Enter Universe",
};

export default function CreateUniversePage() {
  const [step, setStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);

  const [data, setData] = useState<BuilderData>({
    universeName: "",
    personName: "",
    relationship: "",
    customRelationship: "",
    openingMessage: "",
    description: "",
    pageCount: "5",
  });

  const [pages, setPages] = useState<UniversePage[]>([]);
  const [design, setDesign] =
    useState<DesignSettings>(INITIAL_DESIGN);

  const [music, setMusic] =
    useState<MusicSettings>(INITIAL_MUSIC);

  const [password, setPassword] =
    useState<PasswordSettings>(INITIAL_PASSWORD);

  const [previewPage, setPreviewPage] = useState(0);

  const [draftSaved, setDraftSaved] = useState(false);

  const backgroundInputRef =
    useRef<HTMLInputElement | null>(null);

  const surpriseInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (pages.length === 0) {
      setPages(
        Array.from({ length: 5 }, (_, index) =>
          createPage(index + 1)
        )
      );
    }
  }, [pages.length]);

  const [publishing, setPublishing] = useState(false);
const [publishedUrl, setPublishedUrl] = useState("");

function getFileExtension(file: File) {
  const originalExtension =
    file.name.split(".").pop()?.toLowerCase();

  if (originalExtension) {
    return originalExtension;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "audio/mpeg") return "mp3";
  if (file.type === "audio/wav") return "wav";

  return "bin";
}

async function uploadUniverseFile(
  file: File,
  userId: string,
  fileName: string,
  kind: "image" | "audio"
) {
  const supabase = createClient();

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

  if (kind === "image" && !file.type.startsWith("image/")) {
    throw new Error(
      `"${file.name}" is not a valid image file.`
    );
  }

  if (kind === "audio" && !file.type.startsWith("audio/")) {
    throw new Error(
      `"${file.name}" is not a valid audio file.`
    );
  }

  if (
    kind === "image" &&
    file.size > MAX_IMAGE_SIZE
  ) {
    throw new Error(
      `"${file.name}" is too large. Maximum image size is 10 MB.`
    );
  }

  if (
    kind === "audio" &&
    file.size > MAX_AUDIO_SIZE
  ) {
    throw new Error(
      `"${file.name}" is too large. Maximum audio size is 25 MB.`
    );
  }

  const extension =
    getFileExtension(file) ||
    file.name.split(".").pop() ||
    (kind === "image" ? "jpg" : "mp3");

  const safeName = fileName
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 80);

  const storagePath =
    `universes/${userId}/${safeName}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("universe-media")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(
      `Failed to upload ${file.name}: ${error.message}`
    );
  }

  const { data } = supabase.storage
    .from("universe-media")
    .getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
    type: file.type,
    size: file.size,
    name: file.name,
  };
}


const handlePublish = async () => {
  try {
    setPublishing(true);
    setPublishedUrl("");


    const supabase = createClient();

    

    // Get logged-in user
    const {
      data: {
        user,
      },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "Please login before publishing your universe."
      );
    }

    // One permanent ID for this universe
    const universeId =
      crypto.randomUUID();

    const media: Array<{
      pageId: string | null;
      mediaType:
        | "image"
        | "background_music"
        | "surprise_music";
      storagePath: string;
      publicUrl: string;
      order: number;
      metadata?: Record<string, unknown>;
    }> = [];

    /*
     * -----------------------------------------
     * 1. Upload page images
     * -----------------------------------------
     */

    for (const page of pages) {
      for (
        let index = 0;
        index < page.images.length;
        index++
      ) {
        const image =
          page.images[index];

        if (!image.file) {
          continue;
        }

        const uploaded = await uploadUniverseFile(
  image.file,
  user.id,
  image.name,
  "image"
);

media.push({
  pageId: page.id,
  mediaType: "image",
  storagePath: uploaded.storagePath,
  publicUrl: uploaded.publicUrl,
  order: index,
  metadata: {
    originalName: uploaded.name,
    imageId: image.id,
    type: uploaded.type,
    size: uploaded.size,
  },
});    }
    }

    /*
     * -----------------------------------------
     * 2. Upload background music
     * -----------------------------------------
     */

    let backgroundMusicPath:
      string | undefined;

    if (
      music.backgroundEnabled &&
      music.backgroundMusic?.file
    ) {
     const uploadedBackgroundMusic =
  await uploadUniverseFile(
    music.backgroundMusic.file,
    user.id,
    "background",
    "audio"
  );

backgroundMusicPath =
  uploadedBackgroundMusic.storagePath;

      media.push({
  pageId: null,
  mediaType: "background_music",
  storagePath: uploadedBackgroundMusic.storagePath,
  publicUrl: uploadedBackgroundMusic.publicUrl,
  order: 0,

  metadata: {
    originalName: uploadedBackgroundMusic.name,
    type: uploadedBackgroundMusic.type,
    size: uploadedBackgroundMusic.size,
  },
});
    }

    /*
     * -----------------------------------------
     * 3. Upload surprise music
     * -----------------------------------------
     */

    let surpriseMusicPath:
      string | undefined;

    if (
      music.surpriseEnabled &&
      music.surpriseMusic?.file
    ) {
      const uploadedSurpriseMusic =
  await uploadUniverseFile(
    music.surpriseMusic.file,
    user.id,
    "surprise",
    "audio"
  );

surpriseMusicPath =
  uploadedSurpriseMusic.storagePath;

      media.push({
  pageId: null,
  mediaType: "surprise_music",
  storagePath: uploadedSurpriseMusic.storagePath,
  publicUrl: uploadedSurpriseMusic.publicUrl,
  order: 0,

  metadata: {
    originalName: uploadedSurpriseMusic.name,
    type: uploadedSurpriseMusic.type,
    size: uploadedSurpriseMusic.size,
  },
});
    }

    /*
     * -----------------------------------------
     * 4. Send metadata to Publish API
     * -----------------------------------------
     */

    const response = await fetch(
      "/api/universes/publish",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          universeId,

          data,

         pages: pages.map((page) => ({
  ...page,

  images: page.images.map((image) => ({
    id: image.id,
    name: image.name,
    url: image.url,
    storagePath: image.storagePath,
    type: image.type,
    size: image.size,
  })),
})),

          design,

          music: {
            ...music,

            backgroundMusic:
              backgroundMusicPath
                ? {
                    name:
                      music.backgroundMusic
                        ?.name || "background",
                    storagePath:
                      backgroundMusicPath,
                  }
                : undefined,

            surpriseMusic:
              surpriseMusicPath
                ? {
                    name:
                      music.surpriseMusic
                        ?.name || "surprise",
                    storagePath:
                      surpriseMusicPath,
                  }
                : undefined,
          },

          password: {
            enabled:
              password.enabled,

            mode:
              password.mode,

            password:
              password.password,

            confirmPassword:
              password.confirmPassword,

            screenTitle:
              password.screenTitle,

            screenMessage:
              password.screenMessage,

            buttonText:
              password.buttonText,
          },

          media,
        }),
      }
    );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.error ||
          "Failed to publish universe."
      );
    }

    const fullUrl =
      `${window.location.origin}${result.universe.url}`;

    setPublishedUrl(fullUrl);

    try {
      await navigator.clipboard.writeText(
        fullUrl
      );
    } catch {
      // Clipboard permission may be blocked.
    }

    alert(
      "Your Universe is live! ✨\n\n" +
        fullUrl
    );
  } catch (error) {
    console.error(
      "Publish error:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong while publishing."
    );
  } finally {
    setPublishing(false);
  }
};
  /*
   * ------------------------------------------------------------
   * AUTO SAVE DRAFT
   * ------------------------------------------------------------
   */

  useEffect(() => {
    const payload = {
      data,
      pages,
      design,
      music: {
        ...music,
        backgroundMusic: undefined,
        surpriseMusic: undefined,
      },
      password: {
        ...password,
        password: undefined,
        confirmPassword: undefined,
      },
    };

    try {
      localStorage.setItem(
        "my-universe-builder-draft",
        JSON.stringify(payload)
      );

      setDraftSaved(true);

      const timer = window.setTimeout(() => {
        setDraftSaved(false);
      }, 1800);

      return () => window.clearTimeout(timer);
    } catch {
      // Browser storage may be unavailable.
    }
  }, [data, pages, design, music, password]);

  /*
   * ------------------------------------------------------------
   * GENERIC DATA
   * ------------------------------------------------------------
   */

  function updateData<K extends keyof BuilderData>(
    key: K,
    value: BuilderData[K]
  ) {
    setData((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateDesign<K extends keyof DesignSettings>(
    key: K,
    value: DesignSettings[K]
  ) {
    setDesign((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateMusic<K extends keyof MusicSettings>(
    key: K,
    value: MusicSettings[K]
  ) {
    setMusic((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updatePassword<K extends keyof PasswordSettings>(
    key: K,
    value: PasswordSettings[K]
  ) {
    setPassword((current) => ({
      ...current,
      [key]: value,
    }));
  }

  /*
   * ------------------------------------------------------------
   * PAGE MANAGEMENT
   * ------------------------------------------------------------
   */

  function updatePage(
    pageId: string,
    patch: Partial<UniversePage>
  ) {
    setPages((current) =>
      current.map((page) =>
        page.id === pageId
          ? { ...page, ...patch }
          : page
      )
    );
  }

  function addPage() {
    setPages((current) => [
      ...current,
      createPage(current.length + 1),
    ]);
  }

  function deletePage(pageId: string) {
    if (pages.length <= 1) return;

    setPages((current) =>
      current
        .filter((page) => page.id !== pageId)
        .map((page, index) => ({
          ...page,
          order: index + 1,
        }))
    );
  }

  function duplicatePage(pageId: string) {
    setPages((current) => {
      const source = current.find(
        (page) => page.id === pageId
      );

      if (!source) return current;

      const copy: UniversePage = {
        ...source,
        id: createId("page"),
        title: `${source.title} Copy`,
        images: source.images.map((image) => ({
          ...image,
          id: createId("image"),
        })),
      };

      return [...current, copy].map((page, index) => ({
        ...page,
        order: index + 1,
      }));
    });
  }

  function movePage(
    pageId: string,
    direction: "up" | "down"
  ) {
    setPages((current) => {
      const index = current.findIndex(
        (page) => page.id === pageId
      );

      if (index === -1) return current;

      const nextIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        nextIndex < 0 ||
        nextIndex >= current.length
      ) {
        return current;
      }

      const copy = [...current];

      [copy[index], copy[nextIndex]] = [
        copy[nextIndex],
        copy[index],
      ];

      return copy.map((page, pageIndex) => ({
        ...page,
        order: pageIndex + 1,
      }));
    });
  }

  function changePageCount(value: string) {
    updateData("pageCount", value);

    if (value === "Custom") return;

    const count = Number(value);

    if (!Number.isFinite(count)) return;

    setPages((current) => {
      if (count > current.length) {
        const extra = Array.from(
          { length: count - current.length },
          (_, index) =>
            createPage(current.length + index + 1)
        );

        return [...current, ...extra];
      }

      return current
        .slice(0, count)
        .map((page, index) => ({
          ...page,
          order: index + 1,
        }));
    });
  }

  /*
   * ------------------------------------------------------------
   * IMAGE SYSTEM
   * ------------------------------------------------------------
   */

  function createImage(file: File): UniverseImage | null {
  const MAX_SIZE = 10 * 1024 * 1024;

  if (!file) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    alert(`"${file.name}" is not a valid image file.`);
    return null;
  }

  if (file.size > MAX_SIZE) {
    alert(
      `"${file.name}" is too large. Maximum image size is 10 MB.`
    );
    return null;
  }

  const url = URL.createObjectURL(file);

  return {
    id: crypto.randomUUID(),
    url,
    name: file.name,
    file,
  };
}

 function addImages(
  pageId: string,
  files: FileList | File[]
) {
  const selectedFiles = Array.from(files);

  if (!selectedFiles.length) {
    return;
  }

  setPages((current) =>
    current.map((page) => {
      if (page.id !== pageId) {
        return page;
      }

      const maxImages =
        page.type === "Memories" ? 3 : Infinity;

      const remaining =
        maxImages - page.images.length;

      if (remaining <= 0) {
        alert(
          page.type === "Memories"
            ? "Memories page can have maximum 3 images."
            : "No more images can be added."
        );
        return page;
      }

      const filesToAdd =
        selectedFiles.slice(0, remaining);

      const nextImages = filesToAdd
        .map((file) => createImage(file))
        .filter(
          (image): image is UniverseImage =>
            image !== null
        );

      if (!nextImages.length) {
        return page;
      }

      return {
        ...page,
        images: [
          ...page.images,
          ...nextImages,
        ],
      };
    })
  );
}
  function removeImage(
    pageId: string,
    imageId: string
  ) {
    setPages((current) =>
      current.map((page) => {
        if (page.id !== pageId) return page;

        const image = page.images.find(
          (item) => item.id === imageId
        );

        if (image) {
          URL.revokeObjectURL(image.url);
        }

        return {
          ...page,
          images: page.images.filter(
            (item) => item.id !== imageId
          ),
        };
      })
    );
  }

  function replaceImage(
    pageId: string,
    imageId: string,
    file: File
  ) {
    const newImage = createImage(file);

    if (!newImage) return;

    setPages((current) =>
      current.map((page) => {
        if (page.id !== pageId) return page;

        const oldImage = page.images.find(
          (item) => item.id === imageId
        );

        if (oldImage) {
          URL.revokeObjectURL(oldImage.url);
        }

        return {
          ...page,
          images: page.images.map((image) =>
            image.id === imageId
              ? newImage
              : image
          ),
        };
      })
    );
  }

  function moveImage(
    pageId: string,
    imageId: string,
    direction: "left" | "right"
  ) {
    setPages((current) =>
      current.map((page) => {
        if (page.id !== pageId) return page;

        const index = page.images.findIndex(
          (image) => image.id === imageId
        );

        if (index === -1) return page;

        const nextIndex =
          direction === "left"
            ? index - 1
            : index + 1;

        if (
          nextIndex < 0 ||
          nextIndex >= page.images.length
        ) {
          return page;
        }

        const images = [...page.images];

        [images[index], images[nextIndex]] = [
          images[nextIndex],
          images[index],
        ];

        return {
          ...page,
          images,
        };
      })
    );
  }

  function handleDrop(
    pageId: string,
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    if (event.dataTransfer.files.length) {
      addImages(
        pageId,
        event.dataTransfer.files
      );
    }
  }

  /*
   * ------------------------------------------------------------
   * MUSIC SYSTEM
   * ------------------------------------------------------------
   */

  function handleBackgroundMusic(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("audio/")) {
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      return;
    }

    const url = URL.createObjectURL(file);

    setMusic((current) => {
      if (current.backgroundMusic) {
        URL.revokeObjectURL(
          current.backgroundMusic.url
        );
      }

      return {
        ...current,
        backgroundEnabled: true,
        backgroundMusic: {
  url,
  name: file.name,
  file,
},
      };
    });
  }

  function handleSurpriseMusic(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("audio/")) {
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      return;
    }

    const url = URL.createObjectURL(file);

    setMusic((current) => {
      if (current.surpriseMusic) {
        URL.revokeObjectURL(
          current.surpriseMusic.url
        );
      }

      return {
        ...current,
        surpriseEnabled: true,
       surpriseMusic: {
  url,
  name: file.name,
  file,
},
      };
    });
  }

  function removeBackgroundMusic() {
    if (music.backgroundMusic) {
      URL.revokeObjectURL(
        music.backgroundMusic.url
      );
    }

    setMusic((current) => ({
      ...current,
      backgroundMusic: undefined,
      backgroundEnabled: false,
    }));
  }

  function removeSurpriseMusic() {
    if (music.surpriseMusic) {
      URL.revokeObjectURL(
        music.surpriseMusic.url
      );
    }

    setMusic((current) => ({
      ...current,
      surpriseMusic: undefined,
      surpriseEnabled: false,
    }));
  }

  /*
   * ------------------------------------------------------------
   * VALIDATION
   * ------------------------------------------------------------
   */

  function validateStepOne() {
    if (!data.universeName.trim()) {
      return "Please enter your universe name.";
    }

    if (!data.personName.trim()) {
      return "Please enter the person's name.";
    }

    if (!data.relationship) {
      return "Please choose a relationship.";
    }

    if (
      data.relationship === "Custom" &&
      !data.customRelationship.trim()
    ) {
      return "Please enter your custom relationship.";
    }

    return "";
  }

  function validatePassword() {
    if (!password.enabled) return "";

    if (!password.password) {
      return "Please create a password.";
    }

    if (password.password.length < 4) {
      return "Password must be at least 4 characters.";
    }

    if (
      password.password !==
      password.confirmPassword
    ) {
      return "Passwords do not match.";
    }

    return "";
  }

  /*
   * ------------------------------------------------------------
   * PREVIEW
   * ------------------------------------------------------------
   */

  const currentPreviewPage =
    pages[previewPage] ?? pages[0];

  const previewThemeClass =
    `universe-preview-theme-${design.theme}`;

  const previewStyle = useMemo(
    () =>
      ({
        "--universe-accent":
          design.accentColor,
        "--universe-glow":
          `${design.glowIntensity}%`,
        "--universe-animation":
          `${design.animationIntensity}%`,
      }) as React.CSSProperties,
    [
      design.accentColor,
      design.glowIntensity,
      design.animationIntensity,
    ]
  );

  function openPreview() {
    setPreviewPage(0);
    setPreviewMode(true);
  }

  function closePreview() {
    setPreviewMode(false);
  }

  function nextPreviewPage() {
    if (previewPage < pages.length - 1) {
      setPreviewPage((current) => current + 1);
    }
  }

  function previousPreviewPage() {
    if (previewPage > 0) {
      setPreviewPage((current) => current - 1);
    }
  }

  /*
   * ------------------------------------------------------------
   * FINAL UI
   * ------------------------------------------------------------
   */

  if (previewMode) {
    return (
      <UniversePreview
        data={data}
        pages={pages}
        design={design}
        music={music}
        password={password}
        currentPage={currentPreviewPage}
        currentIndex={previewPage}
        onClose={closePreview}
        onNext={nextPreviewPage}
        onPrevious={previousPreviewPage}
        onSelectPage={setPreviewPage}
        previewThemeClass={previewThemeClass}
        previewStyle={previewStyle}
      />
    );
  }

  return (
    <PageShell title="Create Your Universe ✨">
      <div className="universe-builder-page">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <GlassCard className="universe-builder-header">
          <div>
            <span className="builder-eyebrow">
              MY UNIVERSE CREATOR
            </span>

            <h1>
              Create Your Universe{" "}
              <span>✨</span>
            </h1>

            <p>
              Build a tiny interactive world filled
              with memories, music, images and
              special moments.
            </p>
          </div>

          <div className="builder-header-actions">
            {draftSaved && (
              <span className="draft-status">
                ✓ Draft saved
              </span>
            )}

            <GlassButton
              onClick={openPreview}
            >
              👀 Preview Universe
            </GlassButton>
          </div>
        </GlassCard>

        {/* =====================================================
            PROGRESS
        ===================================================== */}

        <div className="universe-builder-progress">
          {[
            ["1", "Basics", "✨"],
            ["2", "Build", "🧩"],
            ["3", "Customize", "🎨"],
            ["4", "Privacy", "🔐"],
            ["5", "Preview", "👀"],
          ].map(([number, label, icon]) => (
            <button
              key={number}
              type="button"
              className={
                step === Number(number)
                  ? "builder-progress-item active"
                  : "builder-progress-item"
              }
              onClick={() => {
                if (
                  Number(number) <= step
                ) {
                  setStep(Number(number));
                }
              }}
            >
              <span className="builder-progress-number">
                {icon}
              </span>

              <span>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* =====================================================
            STEP 1 — BASICS
        ===================================================== */}

        {step === 1 && (
          <section className="builder-step">
            <GlassCard className="builder-main-card">
              <div className="builder-section-heading">
                <div>
                  <span className="builder-eyebrow">
                    STEP 01
                  </span>

                  <h2>
                    Tell us about this universe 🌌
                  </h2>

                  <p>
                    These details will shape the
                    opening experience.
                  </p>
                </div>
              </div>

              <div className="builder-form-grid">
                <GlassInput
                  label="Universe Name"
                  placeholder="e.g. Riya's Little Universe"
                  value={data.universeName}
                  onChange={(value) =>
                    updateData(
                      "universeName",
                      value
                    )
                  }
                />

                <GlassInput
                  label="Person's Name"
                  placeholder="e.g. Riya"
                  value={data.personName}
                  onChange={(value) =>
                    updateData(
                      "personName",
                      value
                    )
                  }
                />
              </div>

              <div className="builder-field">
                <label>
                  <span>Relationship</span>
                </label>

                <div className="relationship-grid">
                  {RELATIONSHIPS.map(
                    (relationship) => (
                      <button
                        key={relationship}
                        type="button"
                        className={
                          data.relationship ===
                          relationship
                            ? "choice-card active"
                            : "choice-card"
                        }
                        onClick={() =>
                          updateData(
                            "relationship",
                            relationship
                          )
                        }
                      >
                        {relationship}
                      </button>
                    )
                  )}
                </div>
              </div>

              {data.relationship ===
                "Custom" && (
                <GlassInput
                  label="Custom Relationship"
                  placeholder="e.g. My favourite human"
                  value={
                    data.customRelationship
                  }
                  onChange={(value) =>
                    updateData(
                      "customRelationship",
                      value
                    )
                  }
                />
              )}

              <div className="builder-field">
                <label>
                  <span>Opening Message</span>
                </label>

                <textarea
                  className="builder-textarea"
                  placeholder="Welcome to your little universe..."
                  value={data.openingMessage}
                  onChange={(event) =>
                    updateData(
                      "openingMessage",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="builder-field">
                <label>
                  <span>Short Description</span>
                </label>

                <textarea
                  className="builder-textarea"
                  placeholder="A tiny world filled with memories, smiles and little surprises."
                  value={data.description}
                  onChange={(event) =>
                    updateData(
                      "description",
                      event.target.value
                    )
                  }
                />
              </div>
            </GlassCard>

            <div className="builder-bottom-actions">
              <span />

              <GlassButton
                active
                onClick={() => {
                  const error =
                    validateStepOne();

                  if (error) {
                    window.alert(error);
                    return;
                  }

                  setStep(2);
                }}
              >
                Continue →
              </GlassButton>
            </div>
          </section>
        )}

        {/* =====================================================
            STEP 2 — PAGE BUILDER
        ===================================================== */}

        {step === 2 && (
          <section className="builder-step">
            <GlassCard className="builder-main-card">
              <div className="builder-section-heading builder-section-heading-row">
                <div>
                  <span className="builder-eyebrow">
                    STEP 02
                  </span>

                  <h2>
                    Build your pages 🧩
                  </h2>

                  <p>
                    Every page can have its own
                    content, images, animation and
                    music.
                  </p>
                </div>

                <div className="page-count-control">
                  <span>Pages</span>

                  <select
                    value={data.pageCount}
                    onChange={(event) =>
                      changePageCount(
                        event.target.value
                      )
                    }
                    className="builder-select compact"
                  >
                    {PAGE_COUNTS.map(
                      (count) => (
                        <option
                          key={count}
                          value={count}
                        >
                          {count}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="page-builder-list">
                {pages.map((page, index) => (
                  <PageBuilderCard
                    key={page.id}
                    page={page}
                    index={index}
                    total={pages.length}
                    onUpdate={updatePage}
                    onDelete={deletePage}
                    onDuplicate={
                      duplicatePage
                    }
                    onMove={movePage}
                    onAddImages={addImages}
                    onDrop={handleDrop}
                    onRemoveImage={
                      removeImage
                    }
                    onReplaceImage={
                      replaceImage
                    }
                    onMoveImage={moveImage}
                  />
                ))}
              </div>

              <button
                type="button"
                className="add-page-button"
                onClick={addPage}
              >
                <span>＋</span>
                Add Another Page
              </button>
            </GlassCard>

            <div className="builder-bottom-actions">
              <GlassButton
                onClick={() => setStep(1)}
              >
                ← Back
              </GlassButton>

              <GlassButton
                active
                onClick={() => setStep(3)}
              >
                Customize →
              </GlassButton>
            </div>
          </section>
        )}

        {/* =====================================================
            STEP 3 — CUSTOMIZATION
        ===================================================== */}

        {step === 3 && (
          <section className="builder-step">
            <GlassCard className="builder-main-card">
              <div className="builder-section-heading">
                <span className="builder-eyebrow">
                  STEP 03
                </span>

                <h2>
                  Make it yours 🎨
                </h2>

                <p>
                  Customize the visual experience
                  without losing the Spatial Glass
                  feeling.
                </p>
              </div>

              <div className="customization-section">
                <h3>Choose a Theme</h3>

                <div className="theme-grid">
                  {THEMES.map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      active={
                        design.theme ===
                        theme.id
                      }
                      onClick={() =>
                        updateDesign(
                          "theme",
                          theme.id
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="customization-section">
                <h3>Accent Color</h3>

                <div className="accent-grid">
                  {ACCENT_COLORS.map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        className={
                          design.accentColor ===
                          color
                            ? "accent-option active"
                            : "accent-option"
                        }
                        style={{
                          background:
                            color,
                        }}
                        onClick={() =>
                          updateDesign(
                            "accentColor",
                            color
                          )
                        }
                        aria-label={`Use ${color}`}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="customization-grid">
                <SelectSetting
                  label="Glass Style"
                  value={design.glassStyle}
                  options={[
                    ["soft", "Soft Glass"],
                    ["clear", "Clear Glass"],
                    [
                      "frosted",
                      "Frosted Glass",
                    ],
                  ]}
                  onChange={(value) =>
                    updateDesign(
                      "glassStyle",
                      value as DesignSettings["glassStyle"]
                    )
                  }
                />

                <SelectSetting
                  label="Background"
                  value={design.backgroundStyle}
                  options={[
                    [
                      "spatial",
                      "Spatial Glow",
                    ],
                    ["aurora", "Aurora"],
                    ["soft", "Soft Dream"],
                    [
                      "custom",
                      "Custom",
                    ],
                  ]}
                  onChange={(value) =>
                    updateDesign(
                      "backgroundStyle",
                      value as DesignSettings["backgroundStyle"]
                    )
                  }
                />

                <SelectSetting
                  label="Font Style"
                  value={design.fontStyle}
                  options={[
                    ["modern", "Modern"],
                    ["soft", "Soft"],
                    [
                      "elegant",
                      "Elegant",
                    ],
                    [
                      "playful",
                      "Playful",
                    ],
                  ]}
                  onChange={(value) =>
                    updateDesign(
                      "fontStyle",
                      value as DesignSettings["fontStyle"]
                    )
                  }
                />

                <SelectSetting
                  label="Gallery Style"
                  value={design.galleryStyle}
                  options={[
                    ["grid", "Glass Grid"],
                    [
                      "polaroid",
                      "Polaroid",
                    ],
                    ["cards", "Photo Cards"],
                    [
                      "cinematic",
                      "Cinematic",
                    ],
                  ]}
                  onChange={(value) =>
                    updateDesign(
                      "galleryStyle",
                      value as DesignSettings["galleryStyle"]
                    )
                  }
                />

                <SelectSetting
                  label="Button Style"
                  value={design.buttonStyle}
                  options={[
                    ["glass", "Glass"],
                    ["solid", "Solid"],
                    [
                      "outline",
                      "Outline",
                    ],
                    ["pill", "Pill"],
                  ]}
                  onChange={(value) =>
                    updateDesign(
                      "buttonStyle",
                      value as DesignSettings["buttonStyle"]
                    )
                  }
                />
              </div>

              <div className="slider-settings">
                <SliderSetting
                  label="Glow Intensity"
                  value={design.glowIntensity}
                  onChange={(value) =>
                    updateDesign(
                      "glowIntensity",
                      value
                    )
                  }
                />

                <SliderSetting
                  label="Animation Intensity"
                  value={
                    design.animationIntensity
                  }
                  onChange={(value) =>
                    updateDesign(
                      "animationIntensity",
                      value
                    )
                  }
                />
              </div>

              <div className="toggle-settings">
                <ToggleSetting
                  label="Floating Particles"
                  description="Add subtle ambient particles."
                  value={
                    design.particlesEnabled
                  }
                  onChange={(value) =>
                    updateDesign(
                      "particlesEnabled",
                      value
                    )
                  }
                />

                <ToggleSetting
                  label="Cursor Light"
                  description="Follow the pointer with a soft glow."
                  value={
                    design.cursorEffectEnabled
                  }
                  onChange={(value) =>
                    updateDesign(
                      "cursorEffectEnabled",
                      value
                    )
                  }
                />
              </div>

              <div className="design-summary">
                <div className="design-summary-orb">
                  <span />
                </div>

                <div>
                  <span>
                    YOUR CURRENT STYLE
                  </span>

                  <strong>
                    {
                      THEMES.find(
                        (theme) =>
                          theme.id ===
                          design.theme
                      )?.name
                    }
                  </strong>

                  <small>
                    {
                      design.glassStyle
                    }{" "}
                    glass ·{" "}
                    {
                      design.galleryStyle
                    }{" "}
                    gallery ·{" "}
                    {
                      design.buttonStyle
                    }{" "}
                    buttons
                  </small>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="music-builder-card">
              <div className="builder-section-heading">
                <span className="builder-eyebrow">
                  MUSIC
                </span>

                <h2>
                  Give it a soundtrack 🎵
                </h2>

                <p>
                  Add background music and a
                  separate surprise track.
                </p>
              </div>

              <div className="music-settings-grid">
                <MusicUploadCard
                  title="Background Music"
                  icon="🎧"
                  description="Plays throughout the universe."
                  audio={
                    music.backgroundMusic
                  }
                  enabled={
                    music.backgroundEnabled
                  }
                  onToggle={(value) =>
                    updateMusic(
                      "backgroundEnabled",
                      value
                    )
                  }
                  onUpload={() =>
                    backgroundInputRef.current?.click()
                  }
                  onRemove={
                    removeBackgroundMusic
                  }
                />

                <MusicUploadCard
                  title="Surprise Music"
                  icon="✨"
                  description="Plays during a surprise moment."
                  audio={
                    music.surpriseMusic
                  }
                  enabled={
                    music.surpriseEnabled
                  }
                  onToggle={(value) =>
                    updateMusic(
                      "surpriseEnabled",
                      value
                    )
                  }
                  onUpload={() =>
                    surpriseInputRef.current?.click()
                  }
                  onRemove={
                    removeSurpriseMusic
                  }
                />
              </div>

              <input
                ref={backgroundInputRef}
                type="file"
                accept="audio/*"
                hidden
                onChange={
                  handleBackgroundMusic
                }
              />

              <input
                ref={surpriseInputRef}
                type="file"
                accept="audio/*"
                hidden
                onChange={
                  handleSurpriseMusic
                }
              />

              <div className="music-controls-panel">
                <ToggleSetting
                  label="Autoplay Preference"
                  description="The final experience can attempt to start music automatically."
                  value={music.autoplay}
                  onChange={(value) =>
                    updateMusic(
                      "autoplay",
                      value
                    )
                  }
                />

                <SliderSetting
                  label="Music Volume"
                  value={music.volume}
                  onChange={(value) =>
                    updateMusic(
                      "volume",
                      value
                    )
                  }
                />
              </div>

              <div className="music-note">
                <span>ⓘ</span>
                <p>
                  Browsers may block autoplay until
                  the visitor interacts with the
                  universe. The final player will
                  still provide play/pause controls.
                </p>
              </div>
            </GlassCard>

            <div className="builder-bottom-actions">
              <GlassButton
                onClick={() => setStep(2)}
              >
                ← Back
              </GlassButton>

              <GlassButton
                active
                onClick={() => setStep(4)}
              >
                Privacy →
              </GlassButton>
            </div>


            
          </section>
        )}

        {/* =====================================================
            STEP 4 — PASSWORD
        ===================================================== */}

        {step === 4 && (
          <section className="builder-step">
            <GlassCard className="builder-main-card">
              <div className="builder-section-heading">
                <span className="builder-eyebrow">
                  STEP 04
                </span>

                <h2>
                  Protect your universe 🔐
                </h2>

                <p>
                  Add a beautiful entry screen if
                  you want the universe to stay
                  private.
                </p>
              </div>

              <ToggleSetting
                label="Enable Password"
                description="Visitors must enter the password before entering."
                value={password.enabled}
                onChange={(value) =>
                  updatePassword(
                    "enabled",
                    value
                  )
                }
              />

              {password.enabled && (
                <div className="password-builder">
                  <div className="password-mode-grid">
                    <button
                      type="button"
                      className={
                        password.mode ===
                        "normal"
                          ? "choice-card active"
                          : "choice-card"
                      }
                      onClick={() =>
                        updatePassword(
                          "mode",
                          "normal"
                        )
                      }
                    >
                      🔢 Normal Password
                    </button>

                    <button
                      type="button"
                      className={
                        password.mode ===
                        "custom"
                          ? "choice-card active"
                          : "choice-card"
                      }
                      onClick={() =>
                        updatePassword(
                          "mode",
                          "custom"
                        )
                      }
                    >
                      ✨ Custom Entry
                    </button>
                  </div>

                  <div className="builder-form-grid">
                    <label className="builder-native-input">
                      <span>Password</span>

                      <input
                        type="password"
                        value={
                          password.password
                        }
                        placeholder="Create a secret"
                        onChange={(event) =>
                          updatePassword(
                            "password",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="builder-native-input">
                      <span>
                        Confirm Password
                      </span>

                      <input
                        type="password"
                        value={
                          password.confirmPassword
                        }
                        placeholder="Enter it again"
                        onChange={(event) =>
                          updatePassword(
                            "confirmPassword",
                            event.target.value
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="builder-field">
                    <label>
                      <span>
                        Password Screen Title
                      </span>
                    </label>

                    <input
                      className="builder-native-text-input"
                      value={
                        password.screenTitle
                      }
                      onChange={(event) =>
                        updatePassword(
                          "screenTitle",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="builder-field">
                    <label>
                      <span>
                        Password Screen Message
                      </span>
                    </label>

                    <textarea
                      className="builder-textarea"
                      value={
                        password.screenMessage
                      }
                      onChange={(event) =>
                        updatePassword(
                          "screenMessage",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="builder-field">
                    <label>
                      <span>
                        Entry Button Text
                      </span>
                    </label>

                    <input
                      className="builder-native-text-input"
                      value={
                        password.buttonText
                      }
                      onChange={(event) =>
                        updatePassword(
                          "buttonText",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="password-security-note">
                    <span>🔒</span>

                    <div>
                      <strong>
                        Secure publishing
                      </strong>

                      <p>
                        The final published version
                        will hash the password on the
                        server. It will never be stored
                        as plain text in the public
                        universe.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>

            <GlassButton
  onClick={handlePublish}
  disabled={publishing}
  className="create-universe-publish-button"
>
  {publishing ? "Creating Your Universe ✨..." : "Publish Universe ✨"}
</GlassButton>

            <div className="builder-bottom-actions">
              <GlassButton
                onClick={() => setStep(3)}
              >
                ← Back
              </GlassButton>

              <GlassButton
                active
                onClick={() => {
                  const error =
                    validatePassword();

                  if (error) {
                    window.alert(error);
                    return;
                  }

                  setStep(5);
                }}
              >
                Preview →
              </GlassButton>
            </div>
          </section>
        )}
        {publishedUrl && (
  <GlassCard className="published-universe-card">
    <div className="published-universe-success">
      <div className="published-universe-icon">✨</div>

      <h3>Your Universe is Ready!</h3>

      <p>
        Your universe has been published successfully.
        The link has also been copied.
      </p>

      <div className="published-universe-link">
        {publishedUrl}
      </div>

     <div className="published-universe-actions">
  <GlassButton
    onClick={async () => {
      try {
        await navigator.clipboard.writeText(publishedUrl);
        window.alert("Universe link copied! ✨");
      } catch {
        window.alert("Please copy the link manually.");
      }
    }}
  >
    📋 Copy Link
  </GlassButton>

  <GlassButton
    active
    onClick={() => {
      window.location.href = publishedUrl;
    }}
  >
    👀 Open Universe
  </GlassButton>

  <GlassButton
    onClick={async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: data.universeName || "My Little Universe",
            text: "I made a little universe for you ✨",
            url: publishedUrl,
          });
        } catch {
          // User cancelled sharing.
        }
      } else {
        try {
          await navigator.clipboard.writeText(publishedUrl);
          window.alert(
            "Link copied! You can send it to your friend. ✨"
          );
        } catch {
          window.alert("Please copy the link manually.");
        }
      }
    }}
  >
    📤 Share
  </GlassButton>
</div>    </div>
  </GlassCard>
)}

        {/* =====================================================
            STEP 5 — FINAL
        ===================================================== */}

        {step === 5 && (
          <section className="builder-step">
            <GlassCard className="final-builder-card">
              <div className="final-builder-orb">
                <span>✨</span>
              </div>

              <span className="builder-eyebrow">
                YOUR UNIVERSE IS READY
              </span>

              <h2>
                {data.universeName ||
                  "Your Little Universe"}{" "}
                ✨
              </h2>

              <p>
                Everything is ready for the
                interactive preview.
              </p>

              <div className="final-stats">
                <div>
                  <strong>
                    {pages.length}
                  </strong>
                  <span>Pages</span>
                </div>

                <div>
                  <strong>
                    {pages.reduce(
                      (total, page) =>
                        total +
                        page.images.length,
                      0
                    )}
                  </strong>
                  <span>Images</span>
                </div>

                <div>
                  <strong>
                    {music.backgroundMusic
                      ? "♪"
                      : "—"}
                  </strong>
                  <span>Music</span>
                </div>

                <div>
                  <strong>
                    {password.enabled
                      ? "🔒"
                      : "○"}
                  </strong>
                  <span>Privacy</span>
                </div>
              </div>

              <div className="final-actions">
                <GlassButton
                  active
                  onClick={openPreview}
                >
                  👀 Preview Universe
                </GlassButton>

                <GlassButton
                  onClick={() => setStep(3)}
                >
                  🎨 Edit Design
                </GlassButton>

                <GlassButton
                  onClick={() => setStep(2)}
                >
                  🧩 Edit Pages
                </GlassButton>
              </div>

             <div className="coming-publish-note">
  <span>🚀</span>

  <p>
    Your universe is ready to become
    a real shareable experience.
    Publish it and get your unique
    <strong> /u/[slug]</strong> link.
  </p>
</div>

<GlassButton
  active
  disabled={publishing}
  onClick={handlePublish}
  className="create-universe-publish-button"
>
  {publishing
    ? "Creating Your Universe ✨..."
    : "🚀 Publish Universe"}
</GlassButton>
            </GlassCard>

            <div className="builder-bottom-actions">
              <GlassButton
                onClick={() => setStep(4)}
              >
                ← Back
              </GlassButton>

              <GlassButton
                active
                onClick={openPreview}
              >
                Preview Universe 👀
              </GlassButton>
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

/*
 * ================================================================
 * PAGE BUILDER CARD
 * ================================================================
 */

function PageBuilderCard({
  page,
  index,
  total,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  onAddImages,
  onDrop,
  onRemoveImage,
  onReplaceImage,
  onMoveImage,
}: {
  page: UniversePage;
  index: number;
  total: number;
  onUpdate: (
    pageId: string,
    patch: Partial<UniversePage>
  ) => void;
  onDelete: (pageId: string) => void;
  onDuplicate: (pageId: string) => void;
  onMove: (
    pageId: string,
    direction: "up" | "down"
  ) => void;
  onAddImages: (
    pageId: string,
    files: FileList | File[]
  ) => void;
  onDrop: (
    pageId: string,
    event: DragEvent<HTMLDivElement>
  ) => void;
  onRemoveImage: (
    pageId: string,
    imageId: string
  ) => void;
  onReplaceImage: (
    pageId: string,
    imageId: string,
    file: File
  ) => void;
  onMoveImage: (
    pageId: string,
    imageId: string,
    direction: "left" | "right"
  ) => void;
}) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const replaceInputRef =
    useRef<HTMLInputElement | null>(null);

  const [replaceTarget, setReplaceTarget] =
    useState<string | null>(null);

  function chooseReplace(imageId: string) {
    setReplaceTarget(imageId);
    replaceInputRef.current?.click();
  }

  function handleReplace(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (
      file &&
      replaceTarget
    ) {
      onReplaceImage(
        page.id,
        replaceTarget,
        file
      );
    }

    event.target.value = "";
    setReplaceTarget(null);
  }

  return (
    <article className="page-builder-card">
      <div className="page-builder-card-header">
        <div className="page-builder-number">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="page-builder-heading">
          <span>
            PAGE {index + 1}
          </span>

          <strong>
            {page.title || "Untitled Page"}
          </strong>
        </div>

        <div className="page-builder-actions">
          <button
            type="button"
            disabled={index === 0}
            onClick={() =>
              onMove(page.id, "up")
            }
            title="Move up"
          >
            ↑
          </button>

          <button
            type="button"
            disabled={index === total - 1}
            onClick={() =>
              onMove(page.id, "down")
            }
            title="Move down"
          >
            ↓
          </button>

          <button
            type="button"
            onClick={() =>
              onDuplicate(page.id)
            }
            title="Duplicate"
          >
            ⧉
          </button>

          <button
            type="button"
            disabled={total <= 1}
            onClick={() =>
              onDelete(page.id)
            }
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>

      <div className="page-builder-content">
        <div className="builder-form-grid">
          <GlassInput
            label="Page Title"
            value={page.title}
            placeholder="e.g. Our Memories"
            onChange={(value) =>
              onUpdate(page.id, {
                title: value,
              })
            }
          />

          <label className="builder-field">
            <span>Page Type</span>

            <select
              className="builder-select"
              value={page.type}
              onChange={(event) =>
                onUpdate(page.id, {
                  type: event.target
                    .value as PageType,
                })
              }
            >
              {PAGE_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="builder-field">
          <label>
            <span>
              Page Content
            </span>
          </label>

          <textarea
            className="builder-textarea page-content-textarea"
            placeholder="Write the content for this page..."
            value={page.content}
            onChange={(event) =>
              onUpdate(page.id, {
                content:
                  event.target.value,
              })
            }
          />
        </div>

        {/* IMAGE BUILDER */}

        <div className="image-builder-section">
          <div className="image-builder-heading">
            <div>
              <span>
                🖼️ IMAGES
              </span>

              <strong>
                {page.images.length}{" "}
                image
                {page.images.length !==
                1
                  ? "s"
                  : ""}
              </strong>
            </div>

            <small>
              Max 10MB per image
            </small>
          </div>

          <div
            className="image-drop-zone"
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={(event) =>
              onDrop(page.id, event)
            }
          >
            <div className="image-drop-icon">
              ✦
            </div>

            <strong>
              Drop images here
            </strong>

            <span>
              or choose images from your
              device
            </span>

            <div className="image-upload-actions">
              <button
                type="button"
                className="mini-glass-button"
                onClick={() =>
                  inputRef.current?.click()
                }
              >
                ＋ Add Images
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) => {
                if (
                  event.target.files
                ) {
                  onAddImages(
                    page.id,
                    event.target.files
                  );
                }

                event.target.value = "";
              }}
            />
          </div>

          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleReplace}
          />

          {page.images.length > 0 && (
            <div className="image-preview-grid">
              {page.images.map(
                (image, imageIndex) => (
                  <div
                    className="image-preview-card"
                    key={image.id}
                  >
                    <img
  src={image.url}
  alt={image.name}
  className="universe-preview-image"
/>

                    <span className="image-preview-number">
                      {imageIndex + 1}
                    </span>

                    <div className="image-preview-overlay">
                      <div className="image-preview-actions">
                        <button
                          type="button"
                          disabled={
                            imageIndex === 0
                          }
                          onClick={() =>
                            onMoveImage(
                              page.id,
                              image.id,
                              "left"
                            )
                          }
                        >
                          ←
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            chooseReplace(
                              image.id
                            )
                          }
                        >
                          ↻
                        </button>

                        <button
                          type="button"
                          disabled={
                            imageIndex ===
                            page.images
                              .length -
                              1
                          }
                          onClick={() =>
                            onMoveImage(
                              page.id,
                              image.id,
                              "right"
                            )
                          }
                        >
                          →
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onRemoveImage(
                              page.id,
                              image.id
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* PAGE OPTIONS */}

        <div className="page-options">
          <ToggleSetting
            label="Page Animation"
            description="Allow this page to use its entrance animation."
            value={page.animationEnabled}
            onChange={(value) =>
              onUpdate(page.id, {
                animationEnabled:
                  value,
              })
            }
          />

          <ToggleSetting
            label="Page Music"
            description="Allow this page to trigger music behaviour."
            value={page.musicEnabled}
            onChange={(value) =>
              onUpdate(page.id, {
                musicEnabled: value,
              })
            }
          />

          <ToggleSetting
            label="Action Button"
            description="Show a button at the bottom of the page."
            value={page.buttonEnabled}
            onChange={(value) =>
              onUpdate(page.id, {
                buttonEnabled: value,
              })
            }
          />
        </div>

        {page.buttonEnabled && (
          <div className="builder-form-grid">
            <GlassInput
              label="Button Text"
              value={page.buttonText}
              placeholder="Next →"
              onChange={(value) =>
                onUpdate(page.id, {
                  buttonText: value,
                })
              }
            />

            <label className="builder-field">
              <span>
                Button Action
              </span>

              <select
                className="builder-select"
                value={page.buttonAction}
                onChange={(event) =>
                  onUpdate(page.id, {
                    buttonAction:
                      event.target.value,
                  })
                }
              >
                <option value="next">
                  Next Page
                </option>
                <option value="previous">
                  Previous Page
                </option>
                <option value="surprise">
                  Open Surprise
                </option>
                <option value="secret">
                  Open Secret
                </option>
              </select>
            </label>
          </div>
        )}
      </div>
    </article>
  );
}

/*
 * ================================================================
 * PREVIEW
 * ================================================================
 */

function UniversePreview({
  data,
  pages,
  design,
  music,
  password,
  currentPage,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onSelectPage,
  previewThemeClass,
  previewStyle,
}: {
  data: BuilderData;
  pages: UniversePage[];
  design: DesignSettings;
  music: MusicSettings;
  password: PasswordSettings;
  currentPage: UniversePage;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSelectPage: (index: number) => void;
  previewThemeClass: string;
  previewStyle: React.CSSProperties;
}) {
  const [audioPlaying, setAudioPlaying] =
    useState(false);

  const [unlocked, setUnlocked] =
    useState(!password.enabled);

  const [enteredPassword, setEnteredPassword] =
    useState("");

  const backgroundAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const surpriseAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const [surprisePlaying, setSurprisePlaying] =
    useState(false);

  useEffect(() => {
    setUnlocked(!password.enabled);
    setEnteredPassword("");
  }, [password.enabled]);

  useEffect(() => {
    if (!music.backgroundMusic) {
      return;
    }

    const audio =
      backgroundAudioRef.current;

    if (!audio) return;

    audio.volume =
      music.volume / 100;

    if (
      music.autoplay &&
      unlocked
    ) {
      audio
        .play()
        .then(() =>
          setAudioPlaying(true)
        )
        .catch(() =>
          setAudioPlaying(false)
        );
    }
  }, [
    music.backgroundMusic,
    music.volume,
    music.autoplay,
    unlocked,
  ]);

  function toggleBackgroundMusic() {
    const audio =
      backgroundAudioRef.current;

    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() =>
          setAudioPlaying(true)
        )
        .catch(() =>
          setAudioPlaying(false)
        );
    } else {
      audio.pause();
      setAudioPlaying(false);
    }
  }

  function startSurpriseMusic() {
    const background =
      backgroundAudioRef.current;

    const surprise =
      surpriseAudioRef.current;

    if (background) {
      background.pause();
      setAudioPlaying(false);
    }

    if (surprise) {
      surprise.currentTime = 0;

      surprise
        .play()
        .then(() =>
          setSurprisePlaying(true)
        )
        .catch(() =>
          setSurprisePlaying(false)
        );

      surprise.onended = () => {
        setSurprisePlaying(false);

        if (
          music.backgroundMusic
        ) {
          background
            ?.play()
            .then(() =>
              setAudioPlaying(true)
            )
            .catch(() => {});
        }
      };
    }
  }

  function handlePageAction() {
    if (
      currentPage.buttonAction ===
      "previous"
    ) {
      onPrevious();
      return;
    }

    if (
      currentPage.buttonAction ===
      "surprise"
    ) {
      startSurpriseMusic();
      return;
    }

    onNext();
  }

  function unlock() {
    if (
      enteredPassword ===
      password.password
    ) {
      setUnlocked(true);
      return;
    }

    window.alert(
      "That doesn't seem to be the right password."
    );
  }

  return (
    <main
      className={`universe-live-preview ${previewThemeClass} font-${design.fontStyle}`}
      style={previewStyle}
    >
      <div className="preview-topbar">
        <button
          type="button"
          onClick={onClose}
          className="preview-exit-button"
        >
          ← Back to Editor
        </button>

        <div className="preview-brand">
          <span>✦</span>
          LIVE PREVIEW
        </div>

        <div className="preview-counter">
          {String(currentIndex + 1).padStart(
            2,
            "0"
          )}{" "}
          /{" "}
          {String(pages.length).padStart(
            2,
            "0"
          )}
        </div>
      </div>

      {design.particlesEnabled && (
        <div className="preview-particles">
          {Array.from(
            { length: 18 },
            (_, index) => (
              <span
                key={index}
                style={{
                  left: `${
                    (index * 17) % 100
                  }%`,
                  top: `${
                    (index * 29) % 100
                  }%`,
                  animationDelay: `${
                    index * 0.35
                  }s`,
                }}
              />
            )
          )}
        </div>
      )}

      {design.cursorEffectEnabled && (
        <div className="preview-cursor-glow" />
      )}

      <div className="preview-page-dots">
        {pages.map((page, index) => (
          <button
            type="button"
            key={page.id}
            className={
              index === currentIndex
                ? "active"
                : ""
            }
            onClick={() =>
              onSelectPage(index)
            }
          />
        ))}
      </div>

      {password.enabled &&
        !unlocked && (
          <section className="preview-password-screen">
            <div className="preview-password-orb">
              🔐
            </div>

            <span className="preview-eyebrow">
              PRIVATE UNIVERSE
            </span>

            <h1>
              {password.screenTitle}
            </h1>

            <p>
              {password.screenMessage}
            </p>

            <div className="preview-password-box">
              <input
                type="password"
                value={enteredPassword}
                placeholder="Enter password"
                onChange={(event) =>
                  setEnteredPassword(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    unlock();
                  }
                }}
              />

              <button
                type="button"
                onClick={unlock}
              >
                {password.buttonText}
                <span>→</span>
              </button>
            </div>

            <small>
              This is a local preview.
              Published password verification
              will happen securely on the server.
            </small>
          </section>
        )}

      {(!password.enabled ||
        unlocked) && (
        <section className="preview-universe-stage">
          <div className="preview-orbit orbit-one" />
          <div className="preview-orbit orbit-two" />

          <div
            className={
              currentPage.animationEnabled
                ? "preview-content animated"
                : "preview-content"
            }
          >
            <span className="preview-eyebrow">
              {currentPage.type}
            </span>

            <h1>
              {currentPage.title ||
                data.universeName ||
                "My Little Universe"}
            </h1>

            {currentIndex === 0 && (
              <p className="preview-opening-message">
                {data.openingMessage ||
                  `Welcome to ${data.universeName || "my little universe"} ✨`}
              </p>
            )}

            {currentPage.content && (
              <p className="preview-content-text">
                {currentPage.content}
              </p>
            )}

            {currentPage.images.length >
              0 && (
              <div
                className={`preview-gallery gallery-${design.galleryStyle}`}
              >
                {currentPage.images.map(
                  (image) => (
                    <div
                      className="preview-gallery-image"
                      key={image.id}
                    >
                    <img
  src={image.url}
  alt={image.name}
  className="universe-preview-image"
/>
                    </div>
                  )
                )}
              </div>
            )}

            {currentPage.images.length ===
              0 &&
              currentIndex === 0 && (
                <div className="preview-core-orb">
                  <div>
                    <span>
                      {data.personName
                        ? data.personName
                            .charAt(0)
                            .toUpperCase()
                        : "✦"}
                    </span>
                  </div>
                </div>
              )}

            {currentIndex ===
              pages.length - 1 && (
              <p className="preview-final-text">
                Made especially for{" "}
                <strong>
                  {data.personName ||
                    "you"}
                </strong>{" "}
                ♡
              </p>
            )}

            {currentPage.buttonEnabled && (
              <button
                type="button"
                className={`preview-action-button button-${design.buttonStyle}`}
                onClick={
                  handlePageAction
                }
              >
                {currentPage.buttonText ||
                  "Next →"}
              </button>
            )}
          </div>
        </section>
      )}

      {music.backgroundMusic &&
        (!password.enabled ||
          unlocked) && (
          <div className="preview-music-control">
            <audio
              ref={backgroundAudioRef}
              src={
                music.backgroundMusic.url
              }
              loop
              preload="metadata"
            />

            <button
              type="button"
              onClick={
                toggleBackgroundMusic
              }
              title="Play / pause background music"
            >
              {audioPlaying
                ? "Ⅱ"
                : "▶"}
            </button>

            <div>
              <span>
                Now playing
              </span>

              <strong>
                {
                  music.backgroundMusic
                    .name
                }
              </strong>
            </div>
          </div>
        )}

      {music.surpriseMusic && (
        <audio
          ref={surpriseAudioRef}
          src={
            music.surpriseMusic.url
          }
          preload="metadata"
        />
      )}

      {surprisePlaying && (
        <div className="surprise-playing-indicator">
          ✨ Surprise music playing
        </div>
      )}

      <div className="preview-navigation">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={onPrevious}
        >
          ←
        </button>

        <span>
          {currentPage.title}
        </span>

        <button
          type="button"
          disabled={
            currentIndex ===
            pages.length - 1
          }
          onClick={onNext}
        >
          →
        </button>
      </div>
    </main>
  );
}

/*
 * ================================================================
 * SMALL COMPONENTS
 * ================================================================
 */

function ThemeCard({
  theme,
  active,
  onClick,
}: {
  theme: {
    id: Theme;
    name: string;
    icon: string;
    description: string;
  };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "theme-card active"
          : "theme-card"
      }
      onClick={onClick}
    >
      <div className="theme-card-orb">
        {theme.icon}
      </div>

      <strong>
        {theme.name}
      </strong>

      <span>
        {theme.description}
      </span>

      {active && (
        <small>
          ✓ Selected
        </small>
      )}
    </button>
  );
}

function SliderSetting({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="slider-setting">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
      />
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="toggle-setting">
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>

      <button
        type="button"
        className={
          value
            ? "toggle-switch active"
            : "toggle-switch"
        }
        onClick={() =>
          onChange(!value)
        }
        aria-pressed={value}
      >
        <span />
      </button>
    </div>
  );
}

function SelectSetting({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <label className="builder-field">
      <span>{label}</span>

      <select
        className="builder-select"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {options.map(
          ([optionValue, optionLabel]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function MusicUploadCard({
  title,
  icon,
  description,
  audio,
  enabled,
  onToggle,
  onUpload,
  onRemove,
}: {
  title: string;
  icon: string;
  description: string;
  audio?: UniverseAudio;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  onUpload: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="music-upload-card">
      <div className="music-upload-icon">
        {icon}
      </div>

      <div className="music-upload-content">
        <div className="music-upload-title">
          <div>
            <strong>{title}</strong>
            <span>{description}</span>
          </div>

          <button
            type="button"
            className={
              enabled
                ? "mini-toggle active"
                : "mini-toggle"
            }
            onClick={() =>
              onToggle(!enabled)
            }
          >
            {enabled
              ? "ON"
              : "OFF"}
          </button>
        </div>

        {audio ? (
          <div className="audio-file-row">
            <audio
              controls
              src={audio.url}
              preload="metadata"
            />

            <button
              type="button"
              onClick={onRemove}
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="music-upload-button"
            onClick={onUpload}
          >
            ＋ Upload Audio
          </button>
        )}
      </div>
    </div>
  );
}