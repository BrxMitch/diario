import { createClient } from '@supabase/supabase-js';

// Substitua pelos valores do seu projeto Supabase
const SUPABASE_URL = 'https://xadxinkgavdtcbmqmhcm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZHhpbmtnYXZkdGNibXFtaGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTgzODQsImV4cCI6MjA2MjM3NDM4NH0.I3-D6SmgyjaWQLx57XkX0XGNMwwZqOB97zNAaS-AqpQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;