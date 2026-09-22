import { requireAdmin } from "@/lib/admin-auth";
import {
  getAdminWebsites,
  getDashboardStats,
} from "@/lib/admin-data";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const [stats, websites] = await Promise.all([
    getDashboardStats(),
    getAdminWebsites(),
  ]);

  return (
    <main className="admin-analytics-page">
      <div className="admin-analytics-container">

        {/* HEADER */}
        <header className="admin-analytics-header">
          <div>
            <div className="admin-analytics-eyebrow">
              PLATFORM INSIGHTS
            </div>

            <h1>
              Universe <span>Analytics</span>
            </h1>

            <p>
              A live overview of your My Little Universe
              platform data.
            </p>
          </div>

          <div className="admin-analytics-live">
            <span className="admin-live-dot" />
            <div>
              <strong>LIVE DATA</strong>
              <small>Connected to platform</small>
            </div>
          </div>
        </header>


        {/* METRICS */}
        <section className="admin-analytics-metrics">

          <Metric
            label="Total Users"
            value={stats.totalUsers}
            icon="◎"
            accent="pink"
          />

          <Metric
            label="Total Websites"
            value={stats.totalWebsites}
            icon="◇"
            accent="purple"
          />

          <Metric
            label="Published"
            value={stats.publishedWebsites}
            icon="✦"
            accent="green"
          />

          <Metric
            label="Draft Websites"
            value={stats.draftWebsites}
            icon="◌"
            accent="yellow"
          />

          <Metric
            label="Total Views"
            value={stats.totalViews}
            icon="◉"
            accent="blue"
          />

          <Metric
            label="Active Users"
            value={stats.activeUsers}
            icon="✧"
            accent="cyan"
          />

        </section>


        {/* WEBSITE OVERVIEW */}
        <section className="admin-analytics-panel">

          <div className="admin-analytics-panel-header">

            <div>
              <div className="admin-panel-eyebrow">
                ACTIVITY
              </div>

              <h2>
                Websites Overview
              </h2>

              <p>
                Recently stored universes across the platform.
              </p>
            </div>

            <div className="admin-analytics-status">
              <span />
              Live
            </div>

          </div>


          <div className="admin-analytics-websites">

            {websites.slice(0, 10).map((website) => {

              const title =
                website.title?.trim() ||
                "Untitled Universe";

              const initial =
                title.charAt(0).toUpperCase() || "U";

              return (
                <div
                  key={website.id}
                  className="admin-analytics-website"
                >

                  <div className="analytics-website-left">

                    <div className="analytics-website-avatar">
                      {initial}
                    </div>

                    <div className="analytics-website-info">
                      <strong>
                        {title}
                      </strong>

                      <div>
                        <span>
                          {website.slug
                            ? `/u/${website.slug}`
                            : "No public slug"}
                        </span>

                        <i>•</i>

                        <span>
                          {formatDate(website.createdAt)}
                        </span>
                      </div>
                    </div>

                  </div>


                  <div
                    className={
                      website.published
                        ? "analytics-website-status published"
                        : "analytics-website-status draft"
                    }
                  >
                    <span />

                    {website.published
                      ? "Published"
                      : "Draft"}
                  </div>

                </div>
              );
            })}


            {websites.length === 0 && (
              <div className="admin-analytics-empty">
                <div>✦</div>

                <strong>
                  No website data available
                </strong>

                <p>
                  Created websites will appear here.
                </p>
              </div>
            )}

          </div>

        </section>


        {/* DATA LIMITATION */}
        <section className="admin-analytics-notice">

          <div className="admin-analytics-notice-icon">
            i
          </div>

          <div>
            <strong>
              Analytics data availability
            </strong>

            <p>
              Website views and active-user tracking are
              not connected to the current database schema.
              Those values are therefore shown as
              <b> — </b>
              instead of displaying fake numbers.
            </p>
          </div>

        </section>


        {/* BOTTOM INFO */}
        <footer className="admin-analytics-footer">

          <span>
            MY LITTLE UNIVERSE
          </span>

          <div>
            <i />
            PLATFORM SYSTEMS OPERATIONAL
          </div>

        </footer>

      </div>
    </main>
  );
}


function Metric({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | null;
  icon: string;
  accent:
    | "pink"
    | "purple"
    | "green"
    | "yellow"
    | "blue"
    | "cyan";
}) {
  return (
    <div
      className={`admin-analytics-metric ${accent}`}
    >
      <div className="analytics-metric-top">

        <span className="analytics-metric-icon">
          {icon}
        </span>

        <span className="analytics-metric-label">
          {label}
        </span>

      </div>

      <div className="analytics-metric-number">
        {value === null
          ? "—"
          : value.toLocaleString("en-IN")}
      </div>

      <div className="analytics-metric-line" />
    </div>
  );
}


function formatDate(value: string | null) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}