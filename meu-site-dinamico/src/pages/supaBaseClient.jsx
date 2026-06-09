import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oeuvczlnrkigikudxczz.supabase.co';
const supabaseKey = 'sb_publishable_PGBklwDlyNTaArBwTw7HLw_kWM7c-zK';

export const supabase = createClient(supabaseUrl, supabaseKey);