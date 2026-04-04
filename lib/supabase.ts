import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export type Haber = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  category_slug: string;
  image: string;
  author: string;
  published_at: string;
  featured: boolean;
  tags: string[];
  created_at?: string;
};
