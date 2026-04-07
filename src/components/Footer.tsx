import { Link } from "react-router-dom";
import { ChapterLogo } from "./ChapterLogo";
import styles from "./Footer.module.css";

const social = [
  { href: "https://www.facebook.com/ETheta", icon: "fa-brands fa-facebook-f", label: "Facebook" },
  {
    href: "https://www.instagram.com/ethetaques/?hl=en",
    icon: "fa-brands fa-instagram",
    label: "Instagram",
  },
  {
    href: "https://www.linkedin.com/company/etheta1969/posts/?feedView=all",
    icon: "fa-brands fa-linkedin-in",
    label: "LinkedIn",
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <ChapterLogo size="footer" />
            <span className={styles.tagline}>Omega Psi Phi Fraternity, Inc.</span>
          </div>
          <div className={styles.social}>
            {social.map(({ href, icon, label }) => (
              <a key={href} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                <i className={icon} aria-hidden />
              </a>
            ))}
          </div>
        </div>

        <div className={styles.grid}>
          <div>
            <h2 className={styles.heading}>Navigate</h2>
            <ul className={styles.links}>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <a href="/#history">History</a>
              </li>
              <li>
                <Link to="/about">About us</Link>
              </li>
              <li>
                <Link to="/lineage">Lineage</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <a href="https://oppf.org/" target="_blank" rel="noreferrer">
                  IHQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className={styles.copy}>
          © {new Date().getFullYear()} Epsilon Theta Chapter of Omega Psi Phi Fraternity, Inc. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
}
