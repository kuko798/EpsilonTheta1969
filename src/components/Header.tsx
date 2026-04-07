import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Header.module.css";

const nav: { to: string; label: string; end?: boolean }[] = [
  { to: "/", label: "Home", end: true },
  { to: "/#history", label: "History" },
  { to: "/lineage", label: "Chapter Lineage" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`${styles.shell} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand} end>
          <img src="/etheta_logo.png" alt="Epsilon Theta chapter logo" width={120} height={36} />
        </NavLink>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className={styles.toggleBar} data-open={open} />
        </button>

        <nav
          id="primary-nav"
          className={`${styles.nav} ${open ? styles.navOpen : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <ul className={styles.list}>
            {nav.map(({ to, label, end }) => (
              <li key={to + label}>
                {to.startsWith("/#") ? (
                  <a
                    href={to}
                    className={styles.link}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </a>
                ) : (
                  <NavLink
                    to={to}
                    end={!!end}
                    className={({ isActive }) =>
                      `${styles.link} ${isActive ? styles.active : ""}`
                    }
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
