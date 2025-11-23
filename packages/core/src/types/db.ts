import { PGlite } from "@electric-sql/pglite";

export interface Contributor {
  username: string;
  name: string | null;
  role: string | null;
  title: string | null;
  avatar_url: string | null;
  bio: string | null;
  social_profiles: Record<string, string> | null;
  joining_date: Date | null;
  meta: Record<string, string> | null;
}
