/* =========================
   PRODUCTOS - SUPABASE
========================= */

const supabaseClient = window.supabaseClient;

const productsTableBody = document.getElementById("productsTableBody");
const searchProduct = document.getElementById("searchProduct");
const productStatusFilter = document.getElementById("productStatusFilter");

let productosSupabase = [];

/* Cargar productos */
async function cargarProductosSupabase() {
  const { data, error } = await supabaseClient
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar productos:", error);
    return;
  }

  productosSupabase = data || [];

  renderProducts(productosSupabase);
  renderProductStats();
}

/* Render tabla */
function renderProducts(data) {
  if (!productsTableBody) return;

  productsTableBody.innerHTML = "";

  data.forEach((product) => {
    const status = getProductStatus(Number(product.stock) || 0);

    const categoria = product.categoria || "-";
    const formato = product.formato || "-";
    const anio = product.anio || "-";
    const tallas = product.tallas || "-";

    const row = document.createElement("tr");
    row.classList.add("clickable-row");

    row.innerHTML = `
      <td>${product.sku || "-"}</td>

      <td>
        <div class="product-cell">
          ${
            product.imagen_url
              ? `<img src="${product.imagen_url}" class="product-thumb" width="52" height="52" alt="${product.nombre || "Producto"}">`
              : ""
          }
          <span>${product.nombre || "-"}</span>
        </div>
      </td>

      <td>${product.artista || "-"}</td>
      <td>${product.genero || "-"}</td>
      <td>${categoria}</td>
      <td>${formato}</td>
      <td>${anio}</td>
      <td>${tallas}</td>
      <td class="price-cell">${formatPriceNumber(Number(product.precio) || 0)}</td>
      <td>${product.stock ?? 0}</td>
      <td><span class="${getProductStatusClass(status)}">${status}</span></td>
    `;

    row.addEventListener("click", () => {
      window.location.href = `/producto-detalle?id=${product.id}`;
    });

    productsTableBody.appendChild(row);
  });
}

/* Filtros */
function filterProducts() {
  if (!searchProduct || !productStatusFilter) return;

  const searchValue = searchProduct.value.toLowerCase();
  const statusValue = productStatusFilter.value;

  const filtered = productosSupabase.filter((product) => {
    const status = getProductStatus(Number(product.stock) || 0);

    const matchesSearch =
      (product.nombre || "").toLowerCase().includes(searchValue) ||
      (product.artista || "").toLowerCase().includes(searchValue) ||
      (product.sku || "").toLowerCase().includes(searchValue) ||
      (product.genero || "").toLowerCase().includes(searchValue) ||
      (product.categoria || "").toLowerCase().includes(searchValue) ||
      (product.formato || "").toLowerCase().includes(searchValue) ||
      String(product.anio || "").toLowerCase().includes(searchValue) ||
      (product.tallas || "").toLowerCase().includes(searchValue);

    const matchesStatus = statusValue === "all" || status === statusValue;

    return matchesSearch && matchesStatus;
  });

  renderProducts(filtered);
}

/* Estadísticas */
function renderProductStats() {
  const products = productosSupabase;

  const total = products.length;
  const lowStock = products.filter(p => Number(p.stock) > 0 && Number(p.stock) < 5).length;
  const outOfStock = products.filter(p => Number(p.stock) === 0).length;

  const inventoryValue = products.reduce((acc, p) => {
    return acc + ((Number(p.precio) || 0) * (Number(p.stock) || 0));
  }, 0);

  const totalProductos = document.getElementById("totalProductos");
  const stockBajo = document.getElementById("stockBajo");
  const sinStock = document.getElementById("sinStock");
  const valorInventario = document.getElementById("valorInventario");

  if (totalProductos) totalProductos.textContent = total;
  if (stockBajo) stockBajo.textContent = lowStock;
  if (sinStock) sinStock.textContent = outOfStock;
  if (valorInventario) valorInventario.textContent = formatPriceNumber(inventoryValue);
}

/* Detalle producto */
async function renderProductDetail() {
  const productContent = document.getElementById("productContent");
  const noProductMessage = document.getElementById("noProductMessage");

  if (!productContent || !noProductMessage) return;

  const params = new URLSearchParams(window.location.search);
  const selectedProductId = params.get("id");

  if (!selectedProductId) {
    productContent.style.display = "none";
    noProductMessage.style.display = "block";
    return;
  }

  const { data: product, error } = await supabaseClient
    .from("productos")
    .select("*")
    .eq("id", selectedProductId)
    .single();

  if (error || !product) {
    console.error("Error al cargar producto:", error);
    productContent.style.display = "none";
    noProductMessage.style.display = "block";
    return;
  }

  productContent.style.display = "block";
  noProductMessage.style.display = "none";

  const productTitle = document.getElementById("productTitle");

  const editProductSku = document.getElementById("editProductSku");
  const editProductNombre = document.getElementById("editProductNombre");
  const editProductArtista = document.getElementById("editProductArtista");
  const editProductGenero = document.getElementById("editProductGenero");
  const editProductCategoria = document.getElementById("editProductCategoria");
  const editProductFormato = document.getElementById("editProductFormato");
  const editProductAnio = document.getElementById("editProductAnio");
  const editProductTallas = document.getElementById("editProductTallas");
  const editProductPrecio = document.getElementById("editProductPrecio");
  const editProductStock = document.getElementById("editProductStock");
  const editProductDescripcion = document.getElementById("editProductDescripcion");

  if (productTitle) productTitle.textContent = product.nombre || "-";

  if (editProductSku) editProductSku.value = product.sku || "";
  if (editProductNombre) editProductNombre.value = product.nombre || "";
  if (editProductArtista) editProductArtista.value = product.artista || "";
  if (editProductGenero) editProductGenero.value = product.genero || "";
  if (editProductCategoria) editProductCategoria.value = product.categoria || "";
  if (editProductFormato) editProductFormato.value = product.formato || "";
  if (editProductAnio) editProductAnio.value = product.anio || "";
  if (editProductTallas) editProductTallas.value = product.tallas || "";
  if (editProductPrecio) editProductPrecio.value = product.precio ?? "";
  if (editProductStock) editProductStock.value = product.stock ?? 0;
  if (editProductDescripcion) editProductDescripcion.value = product.descripcion || "";

  const detailProductPrecio = document.getElementById("detailProductPrecio");
  const detailProductStock = document.getElementById("detailProductStock");
  const detailProductCategoria = document.getElementById("detailProductCategoria");
  const detailProductFormato = document.getElementById("detailProductFormato");
  const detailProductAnio = document.getElementById("detailProductAnio");
  const detailProductTallas = document.getElementById("detailProductTallas");
  const detailProductFecha = document.getElementById("detailProductFecha");

  if (detailProductPrecio) detailProductPrecio.textContent = formatPriceNumber(Number(product.precio) || 0);
  if (detailProductStock) detailProductStock.textContent = product.stock ?? 0;
  if (detailProductCategoria) detailProductCategoria.textContent = product.categoria || "-";
  if (detailProductFormato) detailProductFormato.textContent = product.formato || "-";
  if (detailProductAnio) detailProductAnio.textContent = product.anio || "-";
  if (detailProductTallas) detailProductTallas.textContent = product.tallas || "No aplica";

  if (detailProductFecha) {
    detailProductFecha.textContent = product.created_at
      ? new Date(product.created_at).toLocaleDateString("es-ES")
      : "-";
  }

  const status = getProductStatus(Number(product.stock) || 0);
  const productStatusBox = document.getElementById("productStatusBox");

  if (productStatusBox) {
    productStatusBox.innerHTML = `
      <span>Estado</span>
      <strong class="${getProductStatusClass(status)}">${status}</strong>
    `;
  }

  const image = document.getElementById("detailProductImage");

  if (image && product.imagen_url) {
    image.src = product.imagen_url;
    image.alt = product.nombre || "Producto";
  }
}

/* Guardar cambios */
async function guardarCambiosProducto() {
  const params = new URLSearchParams(window.location.search);
  const selectedProductId = params.get("id");

  if (!selectedProductId) return;

  const imagenInput = document.getElementById("editProductImagen");
  const archivo = imagenInput && imagenInput.files ? imagenInput.files[0] : null;

  let nuevaImagenUrl = null;

  if (archivo) {
    const nombreArchivo = `${Date.now()}-${archivo.name}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("productos")
      .upload(nombreArchivo, archivo);

    if (uploadError) {
      console.error("Error al subir imagen:", uploadError);
      alert("Error al subir la nueva imagen.");
      return;
    }

    const { data } = supabaseClient.storage
      .from("productos")
      .getPublicUrl(nombreArchivo);

    nuevaImagenUrl = data.publicUrl;
  }

  const precioTexto = document.getElementById("editProductPrecio").value.replace(",", ".");

  const categoria = document.getElementById("editProductCategoria").value;
  const formato = document.getElementById("editProductFormato").value;
  const tallas = document.getElementById("editProductTallas").value;

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

  const productoActualizado = {
    sku: document.getElementById("editProductSku").value.trim(),
    nombre: document.getElementById("editProductNombre").value.trim(),
    artista: document.getElementById("editProductArtista").value.trim(),
    genero: document.getElementById("editProductGenero").value.trim(),
    categoria: categoria,
    formato: formato,
    anio: Number(document.getElementById("editProductAnio").value),
    tallas: tallas || null,
    precio: Number(precioTexto),
    stock: Number(document.getElementById("editProductStock").value),
    descripcion: document.getElementById("editProductDescripcion").value.trim()
  };

  if (nuevaImagenUrl) {
    productoActualizado.imagen_url = nuevaImagenUrl;
  }

  const { error } = await supabaseClient
    .from("productos")
    .update(productoActualizado)
    .eq("id", selectedProductId);

  if (error) {
    console.error("Error al guardar cambios:", error);

    if (error.message.includes("duplicate")) {
      alert("Ese SKU ya existe. Usa otro distinto.");
    } else {
      alert("Error al guardar los cambios.");
    }

    return;
  }

  alert("Producto actualizado correctamente.");
  await renderProductDetail();
}

/* Eliminar producto */
async function eliminarProducto() {
  const params = new URLSearchParams(window.location.search);
  const selectedProductId = params.get("id");

  if (!selectedProductId) return;

  const confirmar = confirm("¿Seguro que quieres eliminar este producto?");
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from("productos")
    .delete()
    .eq("id", selectedProductId);

  if (error) {
    console.error("Error al eliminar producto:", error);
    alert("Error al eliminar el producto.");
    return;
  }

  window.location.href = "/productos";
}

/* INIT */
if (productsTableBody) {
  cargarProductosSupabase();
}

renderProductDetail();

if (searchProduct) {
  searchProduct.addEventListener("input", filterProducts);
}

if (productStatusFilter) {
  productStatusFilter.addEventListener("change", filterProducts);
}

window.guardarCambiosProducto = guardarCambiosProducto;
window.eliminarProducto = eliminarProducto;