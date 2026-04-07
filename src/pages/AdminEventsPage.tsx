import type { Session } from "@supabase/supabase-js";
import { DateTime } from "luxon";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CHICAGO } from "@/lib/calendarChicago";
import { getFlyerPublicUrl, isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { ChapterEventRow } from "@/types/events";
import styles from "./AdminEventsPage.module.css";

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export function AdminEventsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr] = useState<string | null>(null);
  const [events, setEvents] = useState<ChapterEventRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsLocal, setStartsLocal] = useState("");
  const [endsLocal, setEndsLocal] = useState("");
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!supabase) return;
    setLoadErr(null);
    const { data, error } = await supabase
      .from("chapter_events")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) setLoadErr(error.message);
    else setEvents((data as ChapterEventRow[]) ?? []);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, sess) => setSession(sess));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) void loadEvents();
  }, [session, loadEvents]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setAuthErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthErr(error.message);
  }

  async function onLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    resetForm();
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStartsLocal("");
    setEndsLocal("");
    setFlyerFile(null);
    setFormErr(null);
  }

  function startEdit(ev: ChapterEventRow) {
    setEditingId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description ?? "");
    setStartsLocal(
      DateTime.fromISO(ev.starts_at, { zone: "utc" }).setZone(CHICAGO).toFormat("yyyy-MM-dd'T'HH:mm")
    );
    setEndsLocal(
      ev.ends_at
        ? DateTime.fromISO(ev.ends_at, { zone: "utc" }).setZone(CHICAGO).toFormat("yyyy-MM-dd'T'HH:mm")
        : ""
    );
    setFlyerFile(null);
    setFormErr(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !session) return;
    setFormErr(null);
    const starts = DateTime.fromFormat(startsLocal, "yyyy-MM-dd'T'HH:mm", { zone: CHICAGO });
    if (!starts.isValid) {
      setFormErr("Enter a valid start date and time.");
      return;
    }
    let endsIso: string | null = null;
    if (endsLocal.trim()) {
      const ends = DateTime.fromFormat(endsLocal, "yyyy-MM-dd'T'HH:mm", { zone: CHICAGO });
      if (!ends.isValid) {
        setFormErr("End time is invalid.");
        return;
      }
      if (ends <= starts) {
        setFormErr("End must be after start.");
        return;
      }
      endsIso = ends.toUTC().toISO();
    }
    const startsIso = starts.toUTC().toISO();
    if (!startsIso) {
      setFormErr("Could not read start time.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const previous = events.find((ev) => ev.id === editingId);
        const { error: upErr } = await supabase
          .from("chapter_events")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            starts_at: startsIso,
            ends_at: endsIso,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);
        if (upErr) throw new Error(upErr.message);

        if (flyerFile) {
          if (previous?.flyer_path) {
            await supabase.storage.from("event-flyers").remove([previous.flyer_path]);
          }
          const path = `${editingId}/${safeFileName(flyerFile.name)}`;
          const { error: stErr } = await supabase.storage.from("event-flyers").upload(path, flyerFile, {
            upsert: true,
            contentType: flyerFile.type || "application/octet-stream",
          });
          if (stErr) throw new Error(stErr.message);
          const { error: pathErr } = await supabase
            .from("chapter_events")
            .update({ flyer_path: path })
            .eq("id", editingId);
          if (pathErr) throw new Error(pathErr.message);
        }
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("chapter_events")
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            starts_at: startsIso,
            ends_at: endsIso,
          })
          .select("id")
          .single();
        if (insErr) throw new Error(insErr.message);
        const id = inserted?.id as string;
        if (flyerFile && id) {
          const path = `${id}/${safeFileName(flyerFile.name)}`;
          const { error: stErr } = await supabase.storage.from("event-flyers").upload(path, flyerFile, {
            upsert: true,
            contentType: flyerFile.type || "application/octet-stream",
          });
          if (stErr) throw new Error(stErr.message);
          const { error: pathErr } = await supabase
            .from("chapter_events")
            .update({ flyer_path: path })
            .eq("id", id);
          if (pathErr) throw new Error(pathErr.message);
        }
      }
      resetForm();
      await loadEvents();
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent(ev: ChapterEventRow) {
    if (!supabase || !confirm(`Delete “${ev.title}”?`)) return;
    if (ev.flyer_path) {
      await supabase.storage.from("event-flyers").remove([ev.flyer_path]);
    }
    const { error } = await supabase.from("chapter_events").delete().eq("id", ev.id);
    if (error) alert(error.message);
    else {
      if (editingId === ev.id) resetForm();
      await loadEvents();
    }
  }

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className={styles.page}>
        <p>
          Supabase is not configured. Set <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code>.
        </p>
        <Link to="/">← Home</Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Manage chapter events</h1>
        <p className={styles.lead}>Sign in with the officer account created in Supabase.</p>
        <form className={styles.login} onSubmit={onLogin}>
          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {authErr ? (
            <p className={styles.err} role="alert">
              {authErr}
            </p>
          ) : null}
          <button type="submit" className={styles.primary}>
            Sign in
          </button>
        </form>
        <p className={styles.back}>
          <Link to="/">← Back to site</Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1 className={styles.title}>Chapter events</h1>
        <div className={styles.actions}>
          <Link to="/" className={styles.linkHome}>
            View site
          </Link>
          <button type="button" className={styles.ghost} onClick={() => void onLogout()}>
            Sign out
          </button>
        </div>
      </div>
      <p className={styles.hint}>
        Times use <strong>Central ({CHICAGO})</strong>, matching the public calendar.
      </p>

      <form className={styles.form} onSubmit={onSubmit}>
        <h2 className={styles.formTitle}>{editingId ? "Edit event" : "New event"}</h2>
        <label className={styles.label}>
          Title
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
          />
        </label>
        <label className={styles.label}>
          Description (optional)
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
          />
        </label>
        <div className={styles.row}>
          <label className={styles.label}>
            Starts
            <input
              className={styles.input}
              type="datetime-local"
              value={startsLocal}
              onChange={(e) => setStartsLocal(e.target.value)}
              required
            />
          </label>
          <label className={styles.label}>
            Ends (optional)
            <input
              className={styles.input}
              type="datetime-local"
              value={endsLocal}
              onChange={(e) => setEndsLocal(e.target.value)}
            />
          </label>
        </div>
        <label className={styles.label}>
          Flyer image (optional)
          <input
            className={styles.file}
            type="file"
            accept="image/*"
            onChange={(e) => setFlyerFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {formErr ? (
          <p className={styles.err} role="alert">
            {formErr}
          </p>
        ) : null}
        <div className={styles.formActions}>
          <button type="submit" className={styles.primary} disabled={saving}>
            {saving ? "Saving…" : editingId ? "Update event" : "Create event"}
          </button>
          {editingId ? (
            <button type="button" className={styles.ghost} onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <section className={styles.listSection}>
        <h2 className={styles.listHeading}>All events</h2>
        {loadErr ? (
          <p className={styles.err}>{loadErr}</p>
        ) : events.length === 0 ? (
          <p className={styles.muted}>No events yet.</p>
        ) : (
          <ul className={styles.table}>
            {events.map((ev) => (
              <li key={ev.id} className={styles.rowItem}>
                <div className={styles.rowMain}>
                  {getFlyerPublicUrl(ev.flyer_path) ? (
                    <img
                      src={getFlyerPublicUrl(ev.flyer_path)!}
                      alt=""
                      className={styles.mini}
                    />
                  ) : (
                    <div className={styles.miniPlaceholder} />
                  )}
                  <div>
                    <p className={styles.evTitle}>{ev.title}</p>
                    <p className={styles.evMeta}>
                      {DateTime.fromISO(ev.starts_at, { zone: "utc" })
                        .setZone(CHICAGO)
                        .toFormat("MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                </div>
                <div className={styles.rowBtns}>
                  <button type="button" className={styles.small} onClick={() => startEdit(ev)}>
                    Edit
                  </button>
                  <button type="button" className={styles.danger} onClick={() => void removeEvent(ev)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
