import { requireAdmin } from "@/lib/admin-auth";
import { getAdminWebsites } from "@/lib/admin-data";

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export default async function AdminWebsitesPage() {
  await requireAdmin();

  const websites = await getAdminWebsites();

  const publishedCount = websites.filter(
    (website) => website.published
  ).length;

  const draftCount = websites.length - publishedCount;

  return (
    <main className="admin-websites-page">
      <div className="admin-websites-container">

        {/* HEADER */}
        <header className="admin-websites-header">
          <div className="admin-websites-heading">
            <div className="admin-websites-eyebrow">
              PLATFORM
            </div>

            <h1>
              Universe <span>Websites</span>
            </h1>

            <p>
              Manage every Surprise Website created
              inside My Little Universe.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/admin/websites/templates"
              className="admin-websites-add-template"
            >
              ✦ Added Websites
            </a>
            <a
              href="/admin/websites/add"
              className="admin-websites-add-template"
            >
              + Add Website
            </a>
          </div>

          {/* SUMMARY */}
          <div className="admin-websites-summary">

            <div className="admin-websites-summary-icon">
              ✦
            </div>

            <div className="admin-websites-summary-info">
              <span>Total Websites</span>
              <strong>
                {websites.length
                  .toString()
                  .padStart(2, "0")}
              </strong>
            </div>

            <div className="admin-websites-summary-divider" />

            <div className="admin-websites-mini-stat">
              <span>Live</span>
              <strong>{publishedCount}</strong>
            </div>

            <div className="admin-websites-mini-stat">
              <span>Draft</span>
              <strong>{draftCount}</strong>
            </div>

          </div>
        </header>


        {/* WEBSITE PANEL */}
        <section className="admin-websites-panel">

          <div className="admin-websites-scroll">

            <table className="admin-websites-table">

              <thead>
                <tr>
                  <th>Website</th>
                  <th>Owner</th>
                  <th>Public URL</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {websites.map((website) => {

                  const title =
                    website.title?.trim() ||
                    "Untitled Universe";

                  const initial =
                    title
                      .trim()
                      .charAt(0)
                      .toUpperCase() || "U";

                  return (
                    <tr
                      key={website.id}
                      className="admin-website-row"
                    >

                      {/* WEBSITE */}
                      <td>
                        <div className="admin-website">

                          <div className="admin-website-avatar">
                            {initial}
                          </div>

                          <div className="admin-website-info">
                            <strong>
                              {title}
                            </strong>

                            <span>
                              Universe ID ·{" "}
                              {website.id.slice(0, 8)}…
                            </span>
                          </div>

                        </div>
                      </td>


                      {/* OWNER */}
                      <td>
                        <span className="admin-website-owner">
                          {website.ownerId || "—"}
                        </span>
                      </td>


                      {/* URL */}
                      <td>

                        {website.slug ? (
                          <a
                            href={`/u/${website.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-website-url"
                          >
                            <span>/u/</span>
                            {website.slug}
                            <b>↗</b>
                          </a>
                        ) : (
                          <span className="admin-website-no-url">
                            Not published
                          </span>
                        )}

                      </td>


                      {/* STATUS */}
                      <td>

                        <span
                          className={
                            website.published
                              ? "admin-website-status published"
                              : "admin-website-status draft"
                          }
                        >
                          <i />
                          {website.published
                            ? "Published"
                            : "Draft"}
                        </span>

                      </td>


                      {/* CREATED */}
                      <td>
                        <span className="admin-website-created">
                          {formatDate(
                            website.createdAt
                          )}
                        </span>
                      </td>


                      {/* VIEWS */}
                      <td>
                        <span className="admin-website-views">
                          <b>—</b>
                        </span>
                      </td>


                      {/* ACTIONS */}
                      <td>

                        <div className="admin-website-actions">

                          {website.slug && (
                            <a
                              href={`/u/${website.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-website-view"
                            >
                              View
                              <span>↗</span>
                            </a>
                          )}

                          <a
                            href={`/admin/websites/${website.id}`}
                            className="admin-website-manage"
                          >
                            Manage
                          </a>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

          {/* EMPTY STATE */}
          {websites.length === 0 && (
            <div className="admin-websites-empty">
              <div className="admin-websites-empty-icon">
                ✦
              </div>

              <h3>
                No universes created yet
              </h3>

              <p>
                Websites created by users will
                appear here.
              </p>
            </div>
          )}

        </section>


        {/* FOOTER */}
        <footer className="admin-websites-footer">

          <span>
            MY LITTLE UNIVERSE
          </span>

          <div>
            <i />
            PLATFORM ONLINE
          </div>

        </footer>

      </div>
    </main>
  );
}