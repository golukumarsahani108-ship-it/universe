"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  defaultFeatures,
  FEATURE_STORAGE_KEY,
  type CustomItem,
  type FeatureConfig,
  type FeatureSection,
} from "./feature-config";

type FeatureContextType = {
  features: FeatureConfig[];

  toggleFeature: (id: string) => void;

  isFeatureEnabled: (id: string) => boolean;

  getFeature: (id: string) => FeatureConfig | undefined;

  updateFeatureItems: (
    featureId: string,
    items: CustomItem[]
  ) => void;

  updateFeatureSections: (
    featureId: string,
    sections: FeatureSection[]
  ) => void;
};

const FeatureContext =
  createContext<FeatureContextType | null>(null);

export function FeatureProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [features, setFeatures] =
    useState<FeatureConfig[]>(defaultFeatures);

  const [loaded, setLoaded] = useState(false);

  /* =========================
     LOAD SAVED SETTINGS
  ========================= */

  useEffect(() => {
    const saved = localStorage.getItem(
      FEATURE_STORAGE_KEY
    );

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          /*
           * Merge old saved settings with
           * new default settings.
           *
           * This prevents old localStorage data
           * from breaking newly added settings.
           */
          const mergedFeatures =
            defaultFeatures.map((defaultFeature) => {
              const savedFeature = parsed.find(
                (feature: FeatureConfig) =>
                  feature.id === defaultFeature.id
              );

              if (!savedFeature) {
                return defaultFeature;
              }

              return {
                ...defaultFeature,
                ...savedFeature,

                items:
                  savedFeature.items ??
                  defaultFeature.items,

                sections:
                  savedFeature.sections ??
                  defaultFeature.sections,
              };
            });

          setFeatures(mergedFeatures);
        }
      } catch {
        console.log(
          "Feature settings could not be loaded."
        );
      }
    }

    setLoaded(true);
  }, []);

  /* =========================
     SAVE SETTINGS
  ========================= */

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      FEATURE_STORAGE_KEY,
      JSON.stringify(features)
    );
  }, [features, loaded]);

  /* =========================
     TOGGLE COMPLETE FEATURE
  ========================= */

  const toggleFeature = (id: string) => {
    setFeatures((current) =>
      current.map((feature) =>
        feature.id === id
          ? {
              ...feature,
              enabled: !feature.enabled,
            }
          : feature
      )
    );
  };

  /* =========================
     CHECK FEATURE STATUS
  ========================= */

  const isFeatureEnabled = (id: string) => {
    return (
      features.find(
        (feature) => feature.id === id
      )?.enabled ?? false
    );
  };

  /* =========================
     GET COMPLETE FEATURE
  ========================= */

  const getFeature = (id: string) => {
    return features.find(
      (feature) => feature.id === id
    );
  };

  /* =========================
     UPDATE INTERNAL ITEMS
  ========================= */

  const updateFeatureItems = (
    featureId: string,
    items: CustomItem[]
  ) => {
    setFeatures((current) =>
      current.map((feature) =>
        feature.id === featureId
          ? {
              ...feature,
              items,
            }
          : feature
      )
    );
  };

  /* =========================
     UPDATE FEATURE SECTIONS
  ========================= */

  const updateFeatureSections = (
    featureId: string,
    sections: FeatureSection[]
  ) => {
    setFeatures((current) =>
      current.map((feature) =>
        feature.id === featureId
          ? {
              ...feature,
              sections,
            }
          : feature
      )
    );
  };

  return (
    <FeatureContext.Provider
      value={{
        features,
        toggleFeature,
        isFeatureEnabled,
        getFeature,
        updateFeatureItems,
        updateFeatureSections,
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeatureContext);

  if (!context) {
    throw new Error(
      "useFeatures must be used inside FeatureProvider"
    );
  }

  return context;
}