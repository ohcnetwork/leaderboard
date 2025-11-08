export interface Contributor {
  username: string;
  name: string | null;
  role: string | null;
  avatar_url: string | null;
  profile_url: string | null;
  email: string | null;
  bio: string | null;
  meta: Record<string, string> | null;
}

export interface ActivityDefinition {
  slug: string;
  name: string;
  description: string | null;
  points: number | null;
}

export interface Activity {
  slug: string;
  contributor: string;
  activity_definition: string;
  title: string | null;
  occured_at: Date;
  link: string | null;
  text: string | null;
  points: number | null;
  meta: Record<string, string> | null;
}
