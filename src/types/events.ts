export type ChapterEventRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  flyer_path: string | null;
  created_at: string;
  updated_at: string;
};
