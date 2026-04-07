import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useChapterEvents } from "@/hooks/useChapterEvents";
import { DateTime } from "luxon";
import {
  buildMonthCells,
  CHICAGO,
  dayKeyForCell,
  eventDayKeyChicago,
  formatEventRange,
  nowChicago,
} from "@/lib/calendarChicago";
import { getFlyerPublicUrl, isSupabaseConfigured } from "@/lib/supabase";
import type { ChapterEventRow } from "@/types/events";
import styles from "./EventsCalendarSection.module.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function EventsCalendarSection() {
  const { events, loading, error } = useChapterEvents();
  const now = nowChicago();
  const [viewYear, setViewYear] = useState(now.year);
  const [viewMonth, setViewMonth] = useState(now.month);
  const [selected, setSelected] = useState<ChapterEventRow | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, ChapterEventRow[]>();
    for (const e of events) {
      const key = eventDayKeyChicago(e.starts_at);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }
    return map;
  }, [events]);

  const cells = useMemo(() => buildMonthCells(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthLabel = useMemo(
    () =>
      DateTime.fromObject({ year: viewYear, month: viewMonth, day: 1 }, { zone: CHICAGO }).toFormat(
        "MMMM yyyy"
      ),
    [viewYear, viewMonth]
  );

  const monthEvents = useMemo(() => {
    const prefix = `${viewYear}-${String(viewMonth).padStart(2, "0")}`;
    return events.filter((e) => eventDayKeyChicago(e.starts_at).startsWith(prefix));
  }, [events, viewYear, viewMonth]);

  function prevMonth() {
    setViewMonth((m) => {
      if (m <= 1) {
        setViewYear((y) => y - 1);
        return 12;
      }
      return m - 1;
    });
  }

  function nextMonth() {
    setViewMonth((m) => {
      if (m >= 12) {
        setViewYear((y) => y + 1);
        return 1;
      }
      return m + 1;
    });
  }

  function goToday() {
    const t = nowChicago();
    setViewYear(t.year);
    setViewMonth(t.month);
  }

  if (!isSupabaseConfigured) {
    return (
      <div className={styles.setup}>
        <p>
          <strong>Events calendar is not connected.</strong> Add{" "}
          <code className={styles.code}>VITE_SUPABASE_URL</code> and{" "}
          <code className={styles.code}>VITE_SUPABASE_ANON_KEY</code> to your environment, run the SQL
          in <code className={styles.code}>supabase/schema.sql</code>, then redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {loading ? (
        <p className={styles.muted}>Loading events…</p>
      ) : error ? (
        <p className={styles.err} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.toolbar}>
        <button type="button" className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">
          ‹
        </button>
        <h3 className={styles.monthTitle}>{monthLabel}</h3>
        <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="Next month">
          ›
        </button>
        <button type="button" className={styles.todayBtn} onClick={goToday}>
          Today
        </button>
      </div>
      <p className={styles.tz}>All times shown in Central Time ({CHICAGO}).</p>

      <div className={styles.gridWrap}>
        <div className={styles.weekdays}>
          {WEEKDAYS.map((d) => (
            <div key={d} className={styles.weekday}>
              {d}
            </div>
          ))}
        </div>
        <div className={styles.days}>
          {cells.map((day, i) => {
            if (day == null) {
              return <div key={`e-${i}`} className={styles.cellEmpty} />;
            }
            const key = dayKeyForCell(viewYear, viewMonth, day);
            const dayEvents = byDay.get(key) ?? [];
            const isToday =
              viewYear === now.year && viewMonth === now.month && day === now.day;
            return (
              <div
                key={key}
                className={`${styles.cell} ${isToday ? styles.cellToday : ""} ${
                  dayEvents.length ? styles.cellHas : ""
                }`}
              >
                <span className={styles.dayNum}>{day}</span>
                {dayEvents.length > 0 ? (
                  <ul className={styles.dots}>
                    {dayEvents.slice(0, 3).map((ev) => (
                      <li key={ev.id}>
                        <button
                          type="button"
                          className={styles.dotBtn}
                          onClick={() => setSelected(ev)}
                          title={ev.title}
                        >
                          {ev.title}
                        </button>
                      </li>
                    ))}
                    {dayEvents.length > 3 ? (
                      <li className={styles.more}>+{dayEvents.length - 3} more</li>
                    ) : null}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.list}>
        <h4 className={styles.listTitle}>Events this month</h4>
        {monthEvents.length === 0 ? (
          <p className={styles.muted}>No events scheduled for this month.</p>
        ) : (
          <ul className={styles.cards}>
            {monthEvents.map((ev) => {
              const flyer = getFlyerPublicUrl(ev.flyer_path);
              return (
                <li key={ev.id} className={styles.card}>
                  {flyer ? (
                    <button
                      type="button"
                      className={styles.thumbBtn}
                      onClick={() => setSelected(ev)}
                      aria-label={`View flyer for ${ev.title}`}
                    >
                      <img src={flyer} alt="" className={styles.thumb} loading="lazy" />
                    </button>
                  ) : (
                    <div className={styles.thumbPlaceholder} aria-hidden />
                  )}
                  <div className={styles.cardBody}>
                    <p className={styles.cardTime}>{formatEventRange(ev.starts_at, ev.ends_at)}</p>
                    <p className={styles.cardTitle}>{ev.title}</p>
                    {ev.description ? <p className={styles.cardDesc}>{ev.description}</p> : null}
                    {flyer ? (
                      <button type="button" className={styles.viewFlyer} onClick={() => setSelected(ev)}>
                        View flyer
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className={styles.adminHint}>
        Chapter officers can{" "}
        <Link to="/admin/events" className={styles.adminLink}>
          add or edit events
        </Link>
        .
      </p>

      {selected ? (
        <div
          className={styles.modalRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby="flyer-dialog-title"
        >
          <button
            type="button"
            className={styles.modalBackdrop}
            aria-label="Close"
            onClick={() => setSelected(null)}
          />
          <div className={styles.modal}>
            <button type="button" className={styles.modalClose} onClick={() => setSelected(null)}>
              ×
            </button>
            <h3 id="flyer-dialog-title" className={styles.modalTitle}>
              {selected.title}
            </h3>
            <p className={styles.modalWhen}>{formatEventRange(selected.starts_at, selected.ends_at)}</p>
            {selected.description ? <p className={styles.modalDesc}>{selected.description}</p> : null}
            {getFlyerPublicUrl(selected.flyer_path) ? (
              <img
                src={getFlyerPublicUrl(selected.flyer_path)!}
                alt={`Flyer for ${selected.title}`}
                className={styles.modalImg}
              />
            ) : (
              <p className={styles.muted}>No flyer uploaded.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
