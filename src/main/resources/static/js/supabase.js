/*
  URL del proyecto de Supabase.

  Esta dirección identifica el proyecto concreto de Supabase
  al que se va a conectar la aplicación.
*/
const supabaseUrl = "https://dncrmwxsqaspfuvqmnoa.supabase.co";

/*
  Clave pública de Supabase.

  Esta clave permite que el frontend pueda comunicarse con Supabase.
  Al ser una clave "publishable", está pensada para usarse en el navegador,
  siempre que las reglas de seguridad de Supabase estén bien configuradas.
*/
const supabaseKey = "sb_publishable_faWWHYqOlFHqwzMEa7EFzg_jSe77-KN";

/*
  Creación del cliente de Supabase.

  Se utiliza la librería oficial de Supabase cargada en el navegador
  para crear una conexión entre la aplicación y la base de datos.
*/
window.supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);