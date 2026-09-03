"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const dockItems = [
  { name: "Home", icon: "⌂", href: "/" },
  { name: "Me", icon: "♟", href: "/me" },
  { name: "Settings", icon: "⚙", href: "/settings" },
  { name: "Support", icon: "💬", href: "/support" },
];

export default function SpatialDock() {
  const pathname = usePathname();

  return (
    <nav className="dock glass" aria-label="Main navigation">
      {dockItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`dock-link ${
              active ? "active" : ""
            } ${item.name === "Support" ? "support-dock-link" : ""}`}
          >
            <b>{item.icon}</b>
            <small>{item.name}</small>
          </Link>
        );
      })}
    </nav>
  );
}