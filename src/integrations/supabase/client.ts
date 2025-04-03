
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const SUPABASE_URL = "https://supfbdvklgklehovfqrb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cGZiZHZrbGdrbGVob3ZmcXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2OTMyNDMsImV4cCI6MjA1OTI2OTI0M30.VpZglMUw8RA9L-PrXpJboPG12Woz1YD0t95aWohmgqM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
