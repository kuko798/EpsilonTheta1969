import styles from "./ChapterLogo.module.css";

type Props = {
  size?: "header" | "footer";
  className?: string;
};

export function ChapterLogo({ size = "header", className = "" }: Props) {
  return (
    <img
      src="/etheta_logo.png"
      alt="Epsilon Theta — Omega Psi Phi chapter shield"
      className={`${styles.logo} ${styles[size]} ${className}`.trim()}
      decoding="async"
      fetchPriority={size === "header" ? "high" : "auto"}
    />
  );
}
