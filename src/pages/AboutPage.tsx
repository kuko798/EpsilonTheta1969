import { teamMembers } from "@/data/team";
import styles from "./AboutPage.module.css";

export function AboutPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Meet the chapter</h1>
        <p className={styles.subtitle}>2024–2025 Epsilon Theta undergraduate leadership</p>
      </header>

      <ul className={styles.grid}>
        {teamMembers.map((m) => (
          <li key={m.name} className={styles.card}>
            <div className={styles.avatarWrap}>
              <img
                className={styles.avatar}
                src={encodeURI(m.photo)}
                alt=""
                loading="lazy"
                width={160}
                height={160}
              />
            </div>
            <h2 className={styles.name}>{m.name}</h2>
            <p className={styles.role}>{m.role}</p>
            <p className={styles.detail}>{m.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
