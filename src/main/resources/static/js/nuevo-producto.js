const supabaseUrl = "https://dncrmwxsqaspfuvqmnoa.supabase.co";
const supabaseKey = "sb_publishable_faWWHYqOlFHqwzMEa7EFzg_jSe77-KN";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("nuevoProductoForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let imagenUrl = null;

    const imagenInput = document.getElementById("imagen");
    const archivo = imagenInput.files[0];

    if (archivo) {
      const nombreArchivo = `${Date.now()}-${archivo.name}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("productos")
        .upload(nombreArchivo, archivo);

      if (uploadError) {
        console.error("Error al subir imagen:", uploadError);
        alert("Error al subir la imagen. Mira la consola.");
        return;
      }

      const { data } = supabaseClient.storage
        .from("productos")
        .getPublicUrl(nombreArchivo);

      imagenUrl = data.publicUrl;
    }

    const sku = document.getElementById("sku").value.trim();
    const precioTexto = document.getElementById("precio").value.replace(",", ".");

    const nuevoProducto = {
      sku: sku,
      nombre: document.getElementById("nombre").value,
      artista: document.getElementById("artista").value,
      genero: document.getElementById("genero").value,
      precio: Number(precioTexto),
      stock: Number(document.getElementById("stock").value),
      descripcion: document.getElementById("descripcion").value,
      imagen_url: imagenUrl,
      estado: "Activo"
    };

    const { error } = await supabaseClient
      .from("productos")
      .insert([nuevoProducto]);

    if (error) {
      console.error("Error al crear producto:", error);

      if (error.message.includes("duplicate")) {
        alert("Ese SKU ya existe. Usa otro distinto.");
      } else {
        alert("Error al crear producto. Mira la consola.");
      }

      return;
    }

    alert("Producto creado correctamente");
    window.location.href = "/productos";
  });
}