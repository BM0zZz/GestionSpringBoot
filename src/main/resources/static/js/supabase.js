const supabaseUrl = "https://dncrmwxsqaspfuvqmnoa.supabase.co";
const supabaseKey = "sb_publishable_faWWHYqOlFHqwzMEa7EFzg_jSe77-KN";

window.supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);