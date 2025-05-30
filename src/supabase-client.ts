import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URI as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);
