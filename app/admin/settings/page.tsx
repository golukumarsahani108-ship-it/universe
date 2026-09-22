import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();

  const { data: settings } = await supabaseAdmin
    .from("platform_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  return (
    <main className="admin-settings-page">
      <div className="admin-settings-container">

        {/* HEADER */}
        <header className="admin-settings-header">
          <div>
            <div className="admin-settings-eyebrow">
              PLATFORM CONFIGURATION
            </div>

            <h1>
              System <span>Settings</span>
            </h1>

            <p>
              Manage your My Little Universe platform configuration
              and administrator profile.
            </p>
          </div>

          <div className="admin-settings-status">
            <span />
            SYSTEM ONLINE
          </div>
        </header>


        {/* ADMIN PROFILE */}
        <section className="admin-settings-card">

          <div className="admin-settings-card-head">
            <div>
              <span className="admin-settings-section-label">
                ACCOUNT
              </span>

              <h2>Administrator Profile</h2>

              <p>
                Current platform administrator information.
              </p>
            </div>

            <div className="admin-settings-card-icon">
              ◉
            </div>
          </div>


          <div className="admin-profile-box">

            <div className="admin-profile-avatar">
              {(admin.email?.charAt(0) || "A").toUpperCase()}
            </div>

            <div className="admin-profile-info">
              <span>Email Address</span>

              <strong>
                {admin.email || "—"}
              </strong>
            </div>

            <div className="admin-profile-role">
              <span>ROLE</span>

              <strong>
                Platform Administrator
              </strong>
            </div>

          </div>

        </section>


        {/* PLATFORM SETTINGS */}
        <section className="admin-settings-card">

          <div className="admin-settings-card-head">
            <div>
              <span className="admin-settings-section-label">
                CORE PLATFORM
              </span>

              <h2>Platform Settings</h2>

              <p>
                Current configuration stored in your platform database.
              </p>
            </div>

            <div className="admin-settings-card-icon purple">
              ✦
            </div>
          </div>


          <div className="admin-settings-fields">

            {/* PLATFORM NAME */}
            <div className="admin-setting-field">

              <label>
                Platform Name
              </label>

              <div className="admin-setting-input-wrap">
                <span className="admin-input-icon">
                  Aa
                </span>

                <input
                  disabled
                  readOnly
                  value={
                    settings?.platform_name ??
                    "My Little Universe"
                  }
                />

                <span className="admin-field-lock">
                  LOCKED
                </span>
              </div>

            </div>


            {/* LOGO */}
            <div className="admin-setting-field">

              <label>
                Platform Logo
              </label>

              <div className="admin-setting-input-wrap">

                <span className="admin-input-icon">
                  ◇
                </span>

                <input
                  disabled
                  readOnly
                  value={
                    settings?.platform_logo_url ?? ""
                  }
                  placeholder="No logo configured"
                />

                <span className="admin-field-lock">
                  LOCKED
                </span>

              </div>

            </div>


            {/* MAINTENANCE */}
            <div className="admin-maintenance-box">

              <div className="admin-maintenance-left">

                <div className="admin-maintenance-icon">
                  ⚙
                </div>

                <div>
                  <strong>
                    Maintenance Mode
                  </strong>

                  <p>
                    Platform-wide maintenance control.
                  </p>
                </div>

              </div>


              <div
                className={
                  settings?.maintenance_mode
                    ? "admin-maintenance-status enabled"
                    : "admin-maintenance-status disabled"
                }
              >
                <span />

                {settings?.maintenance_mode
                  ? "Enabled"
                  : "Disabled"}
              </div>

            </div>

          </div>

        </section>


        {/* FUTURE CONTROLS */}
        <section className="admin-settings-card future">

          <div className="admin-settings-card-head">

            <div>
              <span className="admin-settings-section-label">
                SYSTEM ROADMAP
              </span>

              <h2>Future Controls</h2>

              <p>
                Additional platform controls can be added here
                without changing the existing Surprise Website.
              </p>
            </div>

            <div className="admin-settings-card-icon cyan">
              +
            </div>

          </div>


          <div className="admin-future-grid">

            <FutureItem
              icon="◈"
              title="Platform Branding"
              text="Logo, colors and visual identity."
            />

            <FutureItem
              icon="◎"
              title="User Controls"
              text="Account restrictions and permissions."
            />

            <FutureItem
              icon="◇"
              title="Website Controls"
              text="Platform-wide website management."
            />

            <FutureItem
              icon="◌"
              title="System Controls"
              text="Maintenance and operational settings."
            />

          </div>

        </section>


        {/* FOOTER */}
        <footer className="admin-settings-footer">

          <span>
            MY LITTLE UNIVERSE
          </span>

          <div>
            <i />
            ADMIN SYSTEM OPERATIONAL
          </div>

        </footer>

      </div>
    </main>
  );
}


function FutureItem({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="admin-future-item">

      <div className="admin-future-icon">
        {icon}
      </div>

      <div>
        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>
      </div>

      <span className="admin-future-arrow">
        →
      </span>

    </div>
  );
}