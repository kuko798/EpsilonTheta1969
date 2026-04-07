import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { ChapterEventRow } from "@/types/events";

export function useChapterEvents() {
  const [events, setEvents] = useState<ChapterEventRow[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      setEvents([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: qErr } = await supabase
      .from("chapter_events")
      .select("*")
      .order("starts_at", { ascending: true });
    if (qErr) {
      setError(qErr.message);
      setEvents([]);
    } else {
      setEvents((data as ChapterEventRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const channel = client
      .channel("chapter_events_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chapter_events" },
        () => {
          void load();
        }
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [load]);

  return { events, loading, error, reload: load };
}
