const supabaseClient = window.supabaseClient;
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

    const categoria = document.getElementById("categoria").value;
    const formato = document.getElementById("formato").value;
    const tallas = document.getElementById("tallas").value;

    if (categoria === "vinilo" && formato !== "LP") {
      alert("Si la categoría es Vinilo, el formato debe ser LP.");
      return;
    }

    if (categoria === "poster" && formato !== "A3") {
      alert("Si la categoría es Póster, el formato debe ser A3.");
      return;
    }

    if (categoria === "merch" && formato !== "Ropa") {
      alert("Si la categoría es Merchandising, el formato debe ser Ropa.");
      return;
    }

    if ((categoria === "vinilo" || categoria === "poster") && tallas !== "") {
      alert("Si la categoría es Vinilo o Póster, las tallas deben ser No aplica.");
      return;
    }

    if (categoria === "merch" && tallas !== "Única") {
      alert("Si la categoría es Merchandising, la talla debe ser Única.");
      return;
    }

    const nuevoProducto = {
      sku: sku,
      nombre: document.getElementById("nombre").value.trim(),
      artista: document.getElementById("artista").value.trim(),
      genero: document.getElementById("genero").value.trim(),
      categoria: categoria,
      formato: formato,
      anio: Number(document.getElementById("anio").value),
      tallas: tallas || null,
      precio: Number(precioTexto),
      stock: Number(document.getElementById("stock").value),
      descripcion: document.getElementById("descripcion").value.trim(),
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