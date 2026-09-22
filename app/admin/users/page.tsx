import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export default async function AdminUsersPage() {
  await requireAdmin();

  const { data, error } =
    await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (error) {
    throw new Error(error.message);
  }

  const users = [...data.users].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  return (
    <main className="admin-users-page">
      <div className="admin-users-container">

        {/* HEADER */}
        <header className="admin-users-header">
          <div className="admin-users-heading">
            <div className="admin-users-eyebrow">
              PLATFORM
            </div>

            <h1>
              Universe <span>Users</span>
            </h1>

            <p>
              Manage everyone who has created an account
              inside My Little Universe.
            </p>
          </div>

          {/* COUNT */}
          <div className="admin-users-count">
            <div className="admin-users-count-icon">
              ✦
            </div>

            <div className="admin-users-count-info">
              <span>Total Accounts</span>
              <strong>
                {users.length.toString().padStart(2, "0")}
              </strong>
            </div>
          </div>
        </header>

        {/* USERS TABLE */}
        <section className="admin-users-panel">

          <div className="admin-users-scroll">

            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const name =
                    user.user_metadata?.name ||
                    user.user_metadata?.full_name ||
                    "Unnamed User";

                  const initial =
                    name
                      .trim()
                      .charAt(0)
                      .toUpperCase() || "U";

                  return (
                    <tr
                      key={user.id}
                      className="admin-user-row"
                    >
                      {/* USER */}
                      <td>
                        <div className="admin-user">
                          <div className="admin-user-avatar">
                            {initial}
                          </div>

                          <div className="admin-user-info">
                            <strong>{name}</strong>
                            <span>
                              {user.id.slice(0, 8)}…
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td>
                        <span className="admin-user-email">
                          {user.email || "—"}
                        </span>
                      </td>

                      {/* CREATED */}
                      <td>
                        <span className="admin-user-created">
                          {formatDate(user.created_at)}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={
                            user.banned_until
                              ? "admin-user-status disabled"
                              : "admin-user-status active"
                          }
                        >
                          <i />
                          {user.banned_until
                            ? "Disabled"
                            : "Active"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="admin-user-actions">
                          <a
                            href={`/admin/users/${user.id}`}
                            className="admin-user-view"
                          >
                            View
                            <span>↗</span>
                          </a>

                          <a
                            href={`/admin/users/${user.id}/edit`}
                            className="admin-user-manage"
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
        </section>

        {/* FOOTER */}
        <footer className="admin-users-footer">
          <span>
            MY LITTLE UNIVERSE
          </span>

          <div>
            <i />
            SYSTEM ONLINE
          </div>
        </footer>

      </div>
    </main>
  );
}