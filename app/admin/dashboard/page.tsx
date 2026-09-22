import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";
import {
  getAdminWebsites,
  getDashboardStats,
  getRecentUsers,
} from "@/lib/admin-data";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [stats, websites, users] = await Promise.all([
    getDashboardStats(),
    getAdminWebsites(),
    getRecentUsers(),
  ]);

  const recentWebsites = websites.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  const publishedPercentage =
    stats.totalWebsites > 0
      ? Math.round(
          (stats.publishedWebsites / stats.totalWebsites) * 100
        )
      : 0;

  return (
    <main className="universe-admin-dashboard">
      {/* =====================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div className="admin-space-bg" aria-hidden="true">
        <div className="admin-space-orb admin-space-orb-pink" />
        <div className="admin-space-orb admin-space-orb-purple" />
        <div className="admin-space-orb admin-space-orb-blue" />

        <div className="admin-star-field" />
      </div>

      <div className="admin-dashboard-content">
        {/* =====================================================
            TOP HEADER
        ====================================================== */}

        <header className="admin-topbar">
          <div>
            <div className="admin-page-eyebrow">
              <span className="admin-status-light" />
              MY LITTLE UNIVERSE
            </div>

            <h1 className="admin-page-title">
              Control <span>Center</span>
            </h1>

            <p className="admin-page-description">
              Everything happening across your universe, beautifully
              organized in one place.
            </p>
          </div>

          <div className="admin-account-card">
            <div className="admin-account-avatar">
              {getInitial(admin.email)}
            </div>

            <div className="admin-account-details">
              <span>Administrator</span>
              <strong>{admin.email}</strong>
            </div>

            <div className="admin-account-online" />
          </div>
        </header>

        {/* =====================================================
            MAIN HERO
        ====================================================== */}

        <section className="admin-main-hero">
          <div className="admin-main-hero-content">
            <div className="admin-hero-kicker">
              <span>✦</span>
              MASTER CONTROL
            </div>

            <h2>
              Your universe,
              <br />
              <span>under control.</span>
            </h2>

            <p>
              Monitor users, websites and platform activity from
              your central command center.
            </p>

            <div className="admin-hero-actions">
              <Link
                href="/admin/websites"
                className="admin-primary-button"
              >
                <span>Explore Websites</span>
                <b>↗</b>
              </Link>

              <Link
                href="/admin/users"
                className="admin-secondary-button"
              >
                Manage Users
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="admin-planet-system" aria-hidden="true">
            <div className="admin-planet-glow" />

            <div className="admin-planet-orbit orbit-one" />
            <div className="admin-planet-orbit orbit-two" />
            <div className="admin-planet-orbit orbit-three" />

            <div className="admin-planet">
              <div className="admin-planet-inner">
                <span>✦</span>
              </div>
            </div>

            <div className="admin-planet-dot dot-one" />
            <div className="admin-planet-dot dot-two" />
            <div className="admin-planet-dot dot-three" />
          </div>
        </section>

        {/* =====================================================
            OVERVIEW
        ====================================================== */}

        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <span>OVERVIEW</span>
              <h2>Platform at a glance</h2>
            </div>

            <div className="admin-live-label">
              <span />
              Live data
            </div>
          </div>

          <div className="admin-stat-grid">
            <StatCard
              label="Total Users"
              value={stats.totalUsers}
              description="Registered accounts"
              icon="◎"
              variant="pink"
            />

            <StatCard
              label="Total Websites"
              value={stats.totalWebsites}
              description="Created on platform"
              icon="◇"
              variant="purple"
            />

            <StatCard
              label="Published"
              value={stats.publishedWebsites}
              description={`${publishedPercentage}% of websites`}
              icon="✓"
              variant="blue"
            />

            <StatCard
              label="Drafts"
              value={stats.draftWebsites}
              description="Waiting to go live"
              icon="◌"
              variant="green"
            />
          </div>
        </section>

        {/* =====================================================
            WEBSITES + HEALTH
        ====================================================== */}

        <section className="admin-two-column">
          {/* Websites */}

          <div className="admin-glass-panel">
            <PanelHeader
              icon="◇"
              eyebrow="WEBSITES"
              title="Recently created"
              href="/admin/websites"
            />

            <div className="admin-websites">
              {recentWebsites.length > 0 ? (
                recentWebsites.map((website, index) => (
                  <div
                    key={website.id}
                    className="admin-website-item"
                  >
                    <div className="admin-website-index">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="admin-website-icon">
                      <span>✦</span>
                    </div>

                    <div className="admin-website-info">
                      <strong>
                        {website.title || "Untitled Universe"}
                      </strong>

                      <span>
                        {website.slug
                          ? `/${website.slug}`
                          : "No public slug"}
                      </span>
                    </div>

                    <div className="admin-website-meta">
                      <StatusBadge
                        published={website.published}
                      />

                      <small>
                        {formatDate(website.createdAt)}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No websites created yet." />
              )}
            </div>
          </div>

          {/* Health */}

          <div className="admin-glass-panel admin-health-panel">
            <PanelHeader
              icon="✦"
              eyebrow="SYSTEM"
              title="Universe health"
            />

            <div className="admin-health-main">
              <div className="admin-health-number">
                <strong>{publishedPercentage}</strong>
                <span>%</span>
              </div>

              <div className="admin-health-copy">
                <strong>Publication rate</strong>
                <span>Overall platform health</span>
              </div>

              <div className="admin-healthy-pill">
                <i />
                Healthy
              </div>
            </div>

            <div className="admin-health-progress">
              <div
                style={{
                  width: `${publishedPercentage}%`,
                }}
              />
            </div>

            <div className="admin-health-list">
              <HealthRow
                label="Registered users"
                value={stats.totalUsers}
                icon="◎"
              />

              <HealthRow
                label="Total websites"
                value={stats.totalWebsites}
                icon="◇"
              />

              <HealthRow
                label="Published websites"
                value={stats.publishedWebsites}
                icon="✓"
              />

              <HealthRow
                label="Draft websites"
                value={stats.draftWebsites}
                icon="◌"
              />
            </div>

            <div className="admin-database-status">
              <div className="admin-database-icon">
                <span />
              </div>

              <div>
                <strong>Database connected</strong>
                <p>
                  Platform data is being loaded normally.
                </p>
              </div>

              <span className="admin-database-check">✓</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            USERS + QUICK ACTIONS
        ====================================================== */}

        <section className="admin-two-column">
          {/* Users */}

          <div className="admin-glass-panel">
            <PanelHeader
              icon="◎"
              eyebrow="USERS"
              title="Recent registrations"
              href="/admin/users"
            />

            <div className="admin-users">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="admin-user-item"
                  >
                    <div className="admin-user-avatar">
                      {getInitial(user.email)}
                    </div>

                    <div className="admin-user-info">
                      <strong>
                        {user.email || "Unknown user"}
                      </strong>

                      <span>
                        Joined {formatDate(user.createdAt)}
                      </span>
                    </div>

                    <div className="admin-user-status">
                      <i />
                      Active
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No users registered yet." />
              )}
            </div>
          </div>

          {/* Quick actions */}

          <div className="admin-glass-panel">
            <PanelHeader
              icon="+"
              eyebrow="SHORTCUTS"
              title="Quick actions"
            />

            <div className="admin-actions-grid">
              <QuickAction
                href="/admin/users"
                icon="◎"
                title="Users"
                description="Manage accounts"
              />

              <QuickAction
                href="/admin/websites"
                icon="◇"
                title="Websites"
                description="Review creations"
              />

              <QuickAction
                href="/admin/analytics"
                icon="⌁"
                title="Analytics"
                description="Platform insights"
              />

              <QuickAction
                href="/admin/settings"
                icon="⚙"
                title="Settings"
                description="System preferences"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            BOTTOM METRICS
        ====================================================== */}

        <section className="admin-bottom-grid">
          <MetricCard
            label="Total Views"
            value={
              stats.totalViews == null
                ? "—"
                : Number(stats.totalViews).toLocaleString()
            }
            icon="◉"
          />

          <MetricCard
            label="Active Users"
            value={
              stats.activeUsers == null
                ? "—"
                : Number(stats.activeUsers).toLocaleString()
            }
            icon="◎"
          />

          <MetricCard
            label="Platform Status"
            value="Operational"
            icon="✦"
            status
          />
        </section>

        <footer className="admin-dashboard-footer">
          <span>MY LITTLE UNIVERSE</span>
          <div>
            <i />
            All systems operational
          </div>
        </footer>
      </div>
    </main>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  description,
  icon,
  variant,
}: {
  label: string;
  value: number | null;
  description: string;
  icon: string;
  variant: "pink" | "purple" | "blue" | "green";
}) {
  return (
    <div className={`admin-stat-card stat-${variant}`}>
      <div className="admin-stat-top">
        <div className="admin-stat-icon">
          {icon}
        </div>

        <span className="admin-stat-arrow">↗</span>
      </div>

      <div className="admin-stat-value">
        {value === null ? "—" : value.toLocaleString()}
      </div>

      <div className="admin-stat-label">{label}</div>

      <div className="admin-stat-description">
        {description}
      </div>

      <div className="admin-stat-aura" />
    </div>
  );
}


/* =========================================================
   PANEL HEADER
========================================================= */

function PanelHeader({
  icon,
  eyebrow,
  title,
  href,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="admin-panel-heading">
      <div className="admin-panel-title-wrap">
        <div className="admin-panel-icon">
          {icon}
        </div>

        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      </div>

      {href && (
        <Link href={href} className="admin-panel-link">
          View all <b>→</b>
        </Link>
      )}
    </div>
  );
}


/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  published,
}: {
  published: boolean;
}) {
  return (
    <span
      className={
        published
          ? "admin-status-badge published"
          : "admin-status-badge draft"
      }
    >
      <i />
      {published ? "Published" : "Draft"}
    </span>
  );
}


/* =========================================================
   HEALTH ROW
========================================================= */

function HealthRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="admin-health-row">
      <div>
        <span>{icon}</span>
        <p>{label}</p>
      </div>

      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}


/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="admin-action-card">
      <div className="admin-action-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <b>↗</b>
    </Link>
  );
}


/* =========================================================
   METRIC
========================================================= */

function MetricCard({
  label,
  value,
  icon,
  status = false,
}: {
  label: string;
  value: string;
  icon: string;
  status?: boolean;
}) {
  return (
    <div className={`admin-metric-card ${status ? "metric-status" : ""}`}>
      <div className="admin-metric-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}


/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="admin-empty">
      <div>✦</div>
      <p>{text}</p>
    </div>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function getInitial(email: string) {
  return email.trim().charAt(0).toUpperCase() || "U";
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