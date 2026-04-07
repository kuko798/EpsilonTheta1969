import { FormEvent, useState } from "react";
import styles from "./ContactPage.module.css";

const VIDEO_SRC = encodeURI("/ScreenRecording_12-29-2024 18-56-33_1.mp4");

export function ContactPage() {
  const [status, setStatus] = useState<{ tone: "idle" | "loading" | "ok" | "err"; text: string }>({
    tone: "idle",
    text: "",
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT ?? "/message.php";

    setStatus({ tone: "loading", text: "Sending your message…" });

    try {
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const text = (await res.text()).trim();

      const lower = text.toLowerCase();
      const isErr =
        lower.includes("required") ||
        lower.includes("valid") ||
        lower.includes("failed") ||
        !res.ok;

      setStatus({
        tone: isErr ? "err" : "ok",
        text: text || (res.ok ? "Message sent." : "Something went wrong."),
      });

      if (!isErr) form.reset();
    } catch {
      setStatus({
        tone: "err",
        text: "Could not reach the server. Deploy with PHP mail support or set VITE_CONTACT_ENDPOINT.",
      });
    }
  }

  return (
    <div className={styles.page}>
      <video className={styles.video} autoPlay muted loop playsInline aria-hidden>
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
      <div className={styles.overlay} />

      <div className={styles.shell}>
        <aside className={styles.aside} aria-label="Contact details">
          <div className={styles.block}>
            <i className={`fa-solid fa-location-dot ${styles.icon}`} aria-hidden />
            <h2 className={styles.heading}>Address</h2>
            <p className={styles.text}>716 Langdon Street Red Gym Room 239</p>
            <p className={styles.text}>Madison, WI 53706</p>
          </div>
          <div className={styles.block}>
            <i className={`fa-solid fa-envelope ${styles.icon}`} aria-hidden />
            <h2 className={styles.heading}>Email</h2>
            <a className={styles.link} href="mailto:EThetaOmegas@gmail.com">
              EThetaOmegas@gmail.com
            </a>
          </div>
        </aside>

        <div className={styles.formCard}>
          <h1 className={styles.title}>Contact us</h1>
          <p className={styles.lead}>Send a message to the chapter.</p>
          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.label}>
              <span className={styles.labelText}>Name</span>
              <input className={styles.input} name="name" type="text" placeholder="Your name" />
            </label>
            <label className={styles.label}>
              <span className={styles.labelText}>Email</span>
              <input
                className={styles.input}
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label className={styles.label}>
              <span className={styles.labelText}>Message</span>
              <textarea
                className={styles.textarea}
                name="message"
                required
                rows={5}
                placeholder="Write your message…"
              />
            </label>
            <button
              className={styles.submit}
              type="submit"
              disabled={status.tone === "loading"}
            >
              {status.tone === "loading" ? "Sending…" : "Send message"}
            </button>
            {status.text ? (
              <p
                className={styles.status}
                data-tone={status.tone}
                role={status.tone === "err" ? "alert" : "status"}
              >
                {status.text}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
