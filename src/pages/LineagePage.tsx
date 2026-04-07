import { lineageLines } from "@/data/lineage";
import styles from "./LineagePage.module.css";

export function LineagePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Chapter lineage</h1>
        <p className={styles.lead}>
          Charter lines and initiates from Epsilon Theta’s history at UW–Madison.
        </p>
      </header>

      <ol className={styles.timeline}>
        {lineageLines.map((line, index) => (
          <li key={line.title} className={styles.item}>
            <div className={styles.marker} aria-hidden>
              <span className={styles.dot} />
              <span className={styles.index}>{index + 1}</span>
            </div>
            <article className={styles.card}>
              <h2 className={styles.lineTitle}>{line.title}</h2>
              <p className={styles.date}>{line.date}</p>
              <ul className={styles.members}>
                {line.members.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
