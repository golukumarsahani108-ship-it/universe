"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassInput from "@/component/glass/GlassInput";
import GlassBadge from "@/component/glass/GlassBadge";

type Friend = {
  id: string;
  name: string;
  nickname: string;
  birthday: string;
  category: string;
  about: string;
  icon: string;
  image: string;
  favorite: boolean;
  notifyBirthday: boolean;
  createdAt: number;
};

type BirthdayFriend = Friend & {
  daysUntil: number;
  nextBirthday: Date;
  age?: number;
};

type BirthdayFilter =
  | "all"
  | "today"
  | "week"
  | "month"
  | "favorites"
  | "notify";

const STORAGE_KEY = "my-little-universe-friends-v2";

function getBirthdayInfo(
  birthday: string
): {
  daysUntil: number;
  nextBirthday: Date;
  age?: number;
} | null {
  if (!birthday) return null;

  const parts = birthday.split("-").map(Number);

  if (
    parts.length !== 3 ||
    !parts[0] ||
    !parts[1] ||
    !parts[2]
  ) {
    return null;
  }

  const birthYear = parts[0];
  const month = parts[1] - 1;
  const day = parts[2];

  const today = new Date();

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  let nextBirthday = new Date(
    today.getFullYear(),
    month,
    day
  );

  if (nextBirthday < todayStart) {
    nextBirthday = new Date(
      today.getFullYear() + 1,
      month,
      day
    );
  }

  const diff =
    nextBirthday.getTime() -
    todayStart.getTime();

  const daysUntil = Math.round(
    diff / (1000 * 60 * 60 * 24)
  );

  let age: number | undefined;

  if (birthYear > 1900 && birthYear <= today.getFullYear()) {
    age = nextBirthday.getFullYear() - birthYear;
  }

  return {
    daysUntil,
    nextBirthday,
    age,
  };
}

function formatBirthday(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
  });
}

function getCountdownText(days: number) {
  if (days === 0) return "Today 🎉";
  if (days === 1) return "Tomorrow 🎂";
  if (days <= 7) return `In ${days} days`;
  if (days <= 30) return `In ${days} days`;

  return `In ${days} days`;
}

function getBirthdayGroup(
  days: number
): "today" | "week" | "month" | "later" {
  if (days === 0) return "today";
  if (days <= 7) return "week";
  if (days <= 30) return "month";

  return "later";
}

export default function BirthdaysPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<BirthdayFilter>("all");

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | "unsupported">(
      "default"
    );

  const [notificationMessage, setNotificationMessage] =
    useState("");

  useEffect(() => {
    const loadFriends = () => {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        setFriends([]);
        return;
      }

      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setFriends(parsed);
        }
      } catch {
        console.log(
          "Birthday data could not be loaded."
        );
      }
    };

    loadFriends();

    window.addEventListener(
      "focus",
      loadFriends
    );

    return () => {
      window.removeEventListener(
        "focus",
        loadFriends
      );
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      setNotificationPermission("unsupported");
      return;
    }

    setNotificationPermission(
      Notification.permission
    );
  }, []);

  const birthdayFriends = useMemo(() => {
    return friends
      .map((friend) => {
        const info = getBirthdayInfo(
          friend.birthday
        );

        if (!info) return null;

        return {
          ...friend,
          ...info,
        };
      })
      .filter(
        (friend): friend is BirthdayFriend =>
          friend !== null
      )
      .sort(
        (a, b) =>
          a.daysUntil - b.daysUntil
      );
  }, [friends]);

  const todayBirthdays =
    birthdayFriends.filter(
      (friend) => friend.daysUntil === 0
    );

  const weekBirthdays =
    birthdayFriends.filter(
      (friend) =>
        friend.daysUntil > 0 &&
        friend.daysUntil <= 7
    );

  const monthBirthdays =
    birthdayFriends.filter(
      (friend) =>
        friend.daysUntil > 7 &&
        friend.daysUntil <= 30
    );

  const favoriteBirthdays =
    birthdayFriends.filter(
      (friend) => friend.favorite
    );

  const notifyBirthdays =
    birthdayFriends.filter(
      (friend) => friend.notifyBirthday
    );

  const nextBirthday =
    birthdayFriends[0] ?? null;

  const filteredBirthdays = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return birthdayFriends.filter(
      (friend) => {
        const matchesSearch =
          !query ||
          friend.name
            .toLowerCase()
            .includes(query) ||
          friend.nickname
            .toLowerCase()
            .includes(query) ||
          friend.category
            .toLowerCase()
            .includes(query) ||
          friend.about
            .toLowerCase()
            .includes(query);

        if (!matchesSearch) return false;

        if (
          filter === "today" &&
          friend.daysUntil !== 0
        ) {
          return false;
        }

        if (
          filter === "week" &&
          (friend.daysUntil < 1 ||
            friend.daysUntil > 7)
        ) {
          return false;
        }

        if (
          filter === "month" &&
          (friend.daysUntil < 1 ||
            friend.daysUntil > 30)
        ) {
          return false;
        }

        if (
          filter === "favorites" &&
          !friend.favorite
        ) {
          return false;
        }

        if (
          filter === "notify" &&
          !friend.notifyBirthday
        ) {
          return false;
        }

        return true;
      }
    );
  }, [
    birthdayFriends,
    search,
    filter,
  ]);

  const toggleNotify = (id: string) => {
    const updated = friends.map(
      (friend) =>
        friend.id === id
          ? {
              ...friend,
              notifyBirthday:
                !friend.notifyBirthday,
            }
          : friend
    );

    setFriends(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  };

  const requestNotifications = async () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      setNotificationMessage(
        "This browser does not support notifications."
      );
      return;
    }

    try {
      const permission =
        await Notification.requestPermission();

      setNotificationPermission(permission);

      if (permission === "granted") {
        setNotificationMessage(
          "Birthday notifications are enabled on this device."
        );

        new Notification(
          "Birthday Notifications 🎂",
          {
            body: "You're all set for birthday reminders.",
          }
        );
      } else if (permission === "denied") {
        setNotificationMessage(
          "Notifications are blocked in your browser settings."
        );
      } else {
        setNotificationMessage(
          "Notification permission was not enabled."
        );
      }
    } catch {
      setNotificationMessage(
        "Could not enable notifications."
      );
    }
  };

  const sendTestNotification = () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      setNotificationMessage(
        "Notifications are not supported."
      );
      return;
    }

    if (Notification.permission !== "granted") {
      setNotificationMessage(
        "Turn notifications ON first."
      );
      return;
    }

    new Notification(
      "Birthday Reminder Test 🎂",
      {
        body:
          nextBirthday
            ? `${nextBirthday.name}'s birthday is coming up.`
            : "Your birthday reminder system is ready.",
      }
    );

    setNotificationMessage(
      "Test notification sent."
    );
  };

  return (
    <PageShell
      eyebrow="BIRTHDAYS"
      title="Birthday Space 🎂"
      description="Keep track of the birthdays of people who matter to you."
    >
      <div className="birthdays-layout">

        {/* =================================
            NOTIFICATION CONTROL
        ================================= */}

        <GlassCard className="birthday-notification-panel">

          <div className="birthday-notification-icon">
            🔔
          </div>

          <div className="birthday-notification-content">

            <div className="eyebrow">
              BIRTHDAY REMINDERS
            </div>

            <h2>
              Never miss a birthday
            </h2>

            <p>
              Turn on browser notifications for
              birthday reminders on this device.
            </p>

            {notificationMessage && (
              <div className="birthday-notification-message">
                {notificationMessage}
              </div>
            )}

          </div>

          <div className="birthday-notification-actions">

            <span
              className={
                notificationPermission === "granted"
                  ? "birthday-permission granted"
                  : "birthday-permission"
              }
            >
              {notificationPermission ===
              "unsupported"
                ? "Not supported"
                : notificationPermission ===
                  "granted"
                ? "🔔 Enabled"
                : notificationPermission ===
                  "denied"
                ? "🔕 Blocked"
                : "🔔 Not enabled"}
            </span>

            {notificationPermission !==
              "granted" &&
              notificationPermission !==
                "unsupported" && (
                <button
                  type="button"
                  className="birthday-main-button"
                  onClick={
                    requestNotifications
                  }
                >
                  Enable
                </button>
              )}

            {notificationPermission ===
              "granted" && (
              <button
                type="button"
                className="birthday-test-button"
                onClick={
                  sendTestNotification
                }
              >
                Test
              </button>
            )}

          </div>

        </GlassCard>

        {/* =================================
            TODAY BIRTHDAYS
        ================================= */}

        {todayBirthdays.length > 0 && (
          <section className="birthday-special-section">

            <div className="birthday-special-header">

              <div>
                <div className="eyebrow">
                  TODAY
                </div>

                <h2>
                  Birthday Celebration 🎉
                </h2>
              </div>

              <span>
                {todayBirthdays.length} today
              </span>

            </div>

            <div className="birthday-today-grid">

              {todayBirthdays.map(
                (friend) => (
                  <GlassCard
                    key={friend.id}
                    className="birthday-today-person"
                  >

                    <div className="birthday-today-photo">

                      {friend.image ? (
                        <img
                          src={friend.image}
                          alt={friend.name}
                        />
                      ) : (
                        <span>
                          {friend.icon}
                        </span>
                      )}

                    </div>

                    <div className="birthday-today-info">

                      <h3>
                        {friend.name}
                      </h3>

                      {friend.nickname && (
                        <p>
                          “{friend.nickname}”
                        </p>
                      )}

                      <GlassBadge>
                        {friend.category}
                      </GlassBadge>

                      <div className="birthday-today-message">
                        🎂 It's their birthday today!
                      </div>

                    </div>

                  </GlassCard>
                )
              )}

            </div>

          </section>
        )}

        {/* =================================
            STATS
        ================================= */}

        <div className="birthdays-stats-grid">

          <GlassCard className="birthday-stat-card">
            <span>🎂</span>
            <strong>
              {birthdayFriends.length}
            </strong>
            <small>
              Birthdays Saved
            </small>
          </GlassCard>

          <GlassCard className="birthday-stat-card">
            <span>🎉</span>
            <strong>
              {todayBirthdays.length}
            </strong>
            <small>
              Today
            </small>
          </GlassCard>

          <GlassCard className="birthday-stat-card">
            <span>📅</span>
            <strong>
              {weekBirthdays.length}
            </strong>
            <small>
              Next 7 Days
            </small>
          </GlassCard>

          <GlassCard className="birthday-stat-card">
            <span>🔔</span>
            <strong>
              {notifyBirthdays.length}
            </strong>
            <small>
              Notifications On
            </small>
          </GlassCard>

        </div>

        {/* =================================
            NEXT BIRTHDAY
        ================================= */}

        {nextBirthday && (
          <GlassCard className="birthday-next-card">

            <div className="birthday-next-photo">

              {nextBirthday.image ? (
                <img
                  src={nextBirthday.image}
                  alt={nextBirthday.name}
                />
              ) : (
                <span>
                  {nextBirthday.icon}
                </span>
              )}

            </div>

            <div className="birthday-next-content">

              <div className="eyebrow">
                NEXT BIRTHDAY
              </div>

              <h2>
                {nextBirthday.name}
              </h2>

              <p>
                🎂{" "}
                {formatBirthday(
                  nextBirthday.nextBirthday
                )}
              </p>

              <strong>
                {getCountdownText(
                  nextBirthday.daysUntil
                )}
              </strong>

            </div>

            <div className="birthday-next-side">

              <GlassBadge>
                {nextBirthday.category}
              </GlassBadge>

              {nextBirthday.notifyBirthday && (
                <span className="birthday-next-notify">
                  🔔 Notify ON
                </span>
              )}

            </div>

          </GlassCard>
        )}

        {/* =================================
            UPCOMING OVERVIEW
        ================================= */}

        <div className="birthday-overview-grid">

          <GlassCard className="birthday-overview-card">

            <div className="birthday-overview-icon">
              🎂
            </div>

            <div>
              <span>
                NEXT 7 DAYS
              </span>

              <strong>
                {weekBirthdays.length}
              </strong>

              <p>
                {weekBirthdays.length === 0
                  ? "No birthdays coming this week."
                  : "Birthday coming soon."}
              </p>
            </div>

          </GlassCard>

          <GlassCard className="birthday-overview-card">

            <div className="birthday-overview-icon">
              📅
            </div>

            <div>
              <span>
                NEXT 30 DAYS
              </span>

              <strong>
                {upcomingCount(
                  birthdayFriends
                )}
              </strong>

              <p>
                Keep an eye on upcoming dates.
              </p>
            </div>

          </GlassCard>

          <GlassCard className="birthday-overview-card">

            <div className="birthday-overview-icon">
              ⭐
            </div>

            <div>
              <span>
                FAVORITES
              </span>

              <strong>
                {favoriteBirthdays.length}
              </strong>

              <p>
                Favorite people with birthdays.
              </p>
            </div>

          </GlassCard>

        </div>

        {/* =================================
            SEARCH / FILTER
        ================================= */}

        <GlassCard className="birthdays-tools">

          <GlassInput
            placeholder="Search birthdays..."
            value={search}
            onChange={setSearch}
            className="birthday-search"
          />

          <div className="birthdays-filters">

            <button
              type="button"
              className={
                filter === "all"
                  ? "birthday-filter active"
                  : "birthday-filter"
              }
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>

            <button
              type="button"
              className={
                filter === "today"
                  ? "birthday-filter active"
                  : "birthday-filter"
              }
              onClick={() =>
                setFilter("today")
              }
            >
              🎉 Today
            </button>

            <button
              type="button"
              className={
                filter === "week"
                  ? "birthday-filter active"
                  : "birthday-filter"
              }
              onClick={() =>
                setFilter("week")
              }
            >
              📅 7 Days
            </button>

            <button
              type="button"
              className={
                filter === "month"
                  ? "birthday-filter active"
                  : "birthday-filter"
              }
              onClick={() =>
                setFilter("month")
              }
            >
              🗓️ 30 Days
            </button>

            <button
              type="button"
              className={
                filter === "favorites"
                  ? "birthday-filter active"
                  : "birthday-filter"
              }
              onClick={() =>
                setFilter("favorites")
              }
            >
              ⭐ Favorites
            </button>

            <button
              type="button"
              className={
                filter === "notify"
                  ? "birthday-filter active"
                  : "birthday-filter"
              }
              onClick={() =>
                setFilter("notify")
              }
            >
              🔔 Notify ON
            </button>

          </div>

        </GlassCard>

        {/* =================================
            BIRTHDAY LIST
        ================================= */}

        {filteredBirthdays.length === 0 ? (
          <GlassCard className="birthdays-empty">

            <div>🎂</div>

            <h3>
              {birthdayFriends.length === 0
                ? "No birthdays yet"
                : "No birthdays found"}
            </h3>

            <p>
              {birthdayFriends.length === 0
                ? "Add a birthday to a friend from the Friends section."
                : "Try changing your search or filter."}
            </p>

          </GlassCard>
        ) : (
          <div className="birthdays-grid">

            {filteredBirthdays.map(
              (friend) => {

                const group =
                  getBirthdayGroup(
                    friend.daysUntil
                  );

                return (
                  <GlassCard
                    key={friend.id}
                    className={
                      friend.daysUntil === 0
                        ? "birthday-card today"
                        : friend.daysUntil <= 7
                        ? "birthday-card soon"
                        : "birthday-card"
                    }
                  >

                    <div className="birthday-photo">

                      {friend.image ? (
                        <img
                          src={friend.image}
                          alt={friend.name}
                        />
                      ) : (
                        <div className="birthday-photo-fallback">
                          {friend.icon}
                        </div>
                      )}

                      {friend.favorite && (
                        <span className="birthday-favorite">
                          ★
                        </span>
                      )}

                      <span className="birthday-photo-countdown">
                        {group === "today"
                          ? "TODAY"
                          : group === "week"
                          ? "SOON"
                          : ""}
                      </span>

                    </div>

                    <div className="birthday-info">

                      <div className="birthday-name-row">

                        <div>
                          <h3>
                            {friend.name}
                          </h3>

                          {friend.nickname && (
                            <p>
                              “{friend.nickname}”
                            </p>
                          )}
                        </div>

                        <GlassBadge>
                          {friend.category}
                        </GlassBadge>

                      </div>

                      <div className="birthday-date">
                        🎂{" "}
                        {formatBirthday(
                          friend.nextBirthday
                        )}

                        {friend.age &&
                          friend.age > 0 && (
                            <span>
                              {" "}
                              · Turning{" "}
                              {friend.age}
                            </span>
                          )}
                      </div>

                      <div
                        className={
                          friend.daysUntil === 0
                            ? "birthday-countdown today"
                            : friend.daysUntil <= 7
                            ? "birthday-countdown soon"
                            : "birthday-countdown"
                        }
                      >
                        {getCountdownText(
                          friend.daysUntil
                        )}
                      </div>

                      <div className="birthday-notify-row">

                        <span>
                          {friend.notifyBirthday
                            ? "🔔 Notify ON"
                            : "🔕 Notify OFF"}
                        </span>

                        <button
                          type="button"
                          className={
                            friend.notifyBirthday
                              ? "birthday-notify-button active"
                              : "birthday-notify-button"
                          }
                          onClick={() =>
                            toggleNotify(
                              friend.id
                            )
                          }
                        >
                          {friend.notifyBirthday
                            ? "ON"
                            : "OFF"}
                        </button>

                      </div>

                    </div>

                  </GlassCard>
                );
              }
            )}

          </div>
        )}

        {/* =================================
            FOOTNOTE
        ================================= */}

        <div className="birthday-sync-note">
          <span>✨</span>
          <p>
            Birthday information is synced from
            your Friends section automatically.
          </p>
        </div>

      </div>
    </PageShell>
  );
}

function upcomingCount(
  birthdays: BirthdayFriend[]
) {
  return birthdays.filter(
    (friend) =>
      friend.daysUntil >= 0 &&
      friend.daysUntil <= 30
  ).length;
}