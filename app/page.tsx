"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import FloatingOrbs from "@/component/universe/FloatingOrbs";
import UniverseOrb from "@/component/universe/UniverseOrb";
import SpatialDock from "@/component/layout/SpatialDock";
import { useFeatures } from "@/component/settings/feature-store";

const homeFeatures = [
  {
    id: "me",
    icon: "♙",
    title: "Me",
    description: "About me",
    href: "/me",
  },
  {
    id: "study",
    icon: "📚",
    title: "Study",
    description: "Learn & grow",
    href: "/study",
  },
  {
    id: "fun",
    icon: "🎮",
    title: "Fun",
    description: "Play & enjoy",
    href: "/fun",
  },
  {
    id: "friends",
    icon: "👥",
    title: "Friends",
    description: "My people",
    href: "/friends",
  },
  {
    id: "birthdays",
    icon: "🎂",
    title: "Birthdays",
    description: "Special days",
    href: "/birthdays",
  },
  {
    id: "travel",
    icon: "✈️",
    title: "Travel",
    description: "Places & trips",
    href: "/travel",
  },
  {
    id: "memories",
    icon: "📸",
    title: "Memories",
    description: "Special moments",
    href: "/memories",
  },
  {
    id: "vibes",
    icon: "♫",
    title: "Vibes",
    description: "My favorites",
    href: "/vibes",
  },
  {
    id: "favorites",
    icon: "♡",
    title: "Favorites",
    description: "Things I love",
    href: "/favorites",
  },
  {
    id: "dreams",
    icon: "☾",
    title: "Dreams",
    description: "My future",
    href: "/dreams",
  },
  {
    id: "goals",
    icon: "🎯",
    title: "Goals",
    description: "Plans & progress",
    href: "/goals",
  },
  {
    id: "future",
    icon: "🔮",
    title: "Future Me",
    description: "My future self",
    href: "/future-me",
  },
  {
    id: "journey",
    icon: "🛤️",
    title: "Journey",
    description: "My timeline",
    href: "/journey",
  },
  {
    id: "journal",
    icon: "📔",
    title: "Journal",
    description: "Private thoughts",
    href: "/journal",
  },
  {
    id: "mood",
    icon: "😊",
    title: "Mood",
    description: "How I feel",
    href: "/mood",
  },
  {
    id: "habits",
    icon: "🔥",
    title: "Habits",
    description: "Daily progress",
    href: "/habits",
  },
  {
    id: "creativity",
    icon: "🎨",
    title: "Creativity",
    description: "Create & express",
    href: "/creativity",
  },
  {
    id: "ideas",
    icon: "💡",
    title: "Ideas Vault",
    description: "My ideas",
    href: "/ideas",
  },
  {
    id: "lists",
    icon: "📝",
    title: "Lists",
    description: "My collections",
    href: "/lists",
  },
  {
    id: "achievements",
    icon: "🏆",
    title: "Achievements",
    description: "My little wins",
    href: "/achievements",
  },
  {
    id: "calendar",
    icon: "📅",
    title: "Calendar",
    description: "Important dates",
    href: "/calendar",
  },
  {
    id: "reminders",
    icon: "🔔",
    title: "Reminders",
    description: "Things to remember",
    href: "/reminders",
  },
];

export default function Home() {
  const { features } = useFeatures();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      document.documentElement.style.setProperty(
        "--mx",
        `${(event.clientX / window.innerWidth) * 100}%`
      );

      document.documentElement.style.setProperty(
        "--my",
        `${(event.clientY / window.innerHeight) * 100}%`
      );
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () =>
      window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const visibleFeatures = homeFeatures.filter((homeFeature) => {
    return features.some(
      (feature) =>
        feature.id === homeFeature.id && feature.enabled
    );
  });

  const normalizedSearch = search.trim().toLowerCase();

  const searchResults =
    normalizedSearch.length === 0
      ? []
      : visibleFeatures.filter((feature) => {
          const searchableText = [
            feature.title,
            feature.description,
            feature.id,
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(normalizedSearch);
        });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchOpen(value.trim().length > 0);
  };

  const handleSearchResult = (href: string) => {
    setSearch("");
    setSearchOpen(false);
    router.push(href);
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      if (searchResults.length > 0) {
        handleSearchResult(searchResults[0].href);
      }
    }

    if (event.key === "Escape") {
      setSearch("");
      setSearchOpen(false);
    }
  };

  return (
    <>
      <FloatingOrbs />

      <main className="app">
        <header className="glass">
          <div className="logo">
            <div className="mark">✦</div>
            <span>My Space</span>
          </div>

          <div
            className="search-wrap"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "430px",
            }}
          >
            <input
              className="search"
              placeholder="Search..."
              aria-label="Search"
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              onFocus={() => {
                if (search.trim()) {
                  setSearchOpen(true);
                }
              }}
              onKeyDown={handleSearchKeyDown}
            />

            {searchOpen && (
              <div
                className="glass search-results"
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  left: 0,
                  right: 0,
                  zIndex: 100,
                  padding: "8px",
                  borderRadius: "20px",
                  maxHeight: "360px",
                  overflowY: "auto",
                }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() =>
                        handleSearchResult(result.href)
                      }
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "11px 13px",
                        border: "0",
                        borderRadius: "14px",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "#263640",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background =
                          "#ffffff80";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background =
                          "transparent";
                      }}
                    >
                      <span
                        style={{
                          width: "36px",
                          height: "36px",
                          display: "grid",
                          placeItems: "center",
                          borderRadius: "12px",
                          background: "#ffffff70",
                          border: "1px solid #ffffffaa",
                          flexShrink: 0,
                          fontSize: "17px",
                        }}
                      >
                        {result.icon}
                      </span>

                      <span
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                          }}
                        >
                          {result.title}
                        </strong>

                        <small
                          style={{
                            fontSize: "10px",
                            color: "#71828c",
                          }}
                        >
                          {result.description}
                        </small>
                      </span>
                    </button>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "18px 14px",
                      textAlign: "center",
                      color: "#71828c",
                      fontSize: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "24px",
                        marginBottom: "6px",
                      }}
                    >
                      🔎
                    </div>

                    <div
                      style={{
                        color: "#263640",
                        fontWeight: 700,
                        marginBottom: "3px",
                      }}
                    >
                      Nothing found
                    </div>

                    <div>
                      Try searching for Me, Study, Goals,
                      Journal, Travel...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="avatar">♙</div>
        </header>

        <section className="hero glass">
          <div>
            <div className="eyebrow">
              Spatial Glass Experience
            </div>

            <h1>
              My Little
              <br />
              Universe
            </h1>

            <p>
              A personal world built with glass, depth,
              soft light and subtle motion.
            </p>

            <UniverseOrb />

            <div className="cards">
              {visibleFeatures.map((feature) => (
                <a
                  key={feature.id}
                  href={feature.href}
                  className="card glass"
                >
                  <i>{feature.icon}</i>

                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SpatialDock />
    </>
  );
}