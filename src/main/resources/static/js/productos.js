/* =========================
   PRODUCTOS - SUPABASE
========================= */

/* Conexión Supabase */
const supabaseUrl = "https://dncrmwxsqaspfuvqmnoa.supabase.co";
const supabaseKey = "sb_publishable_faWWHYqOlFHqwzMEa7EFzg_jSe77-KN";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

/* Referencias DOM */
const productsTableBody = document.getElementById("productsTableBody");
const searchProduct = document.getElementById("searchProduct");
const productStatusFilter = document.getElementById("productStatusFilter");

/* NUEVO (formulario) */
const openProductFormBtn = document.getElementById("openProductFormBtn");
const cancelProductFormBtn = document.getElementById("cancelProductFormBtn");
const productFormPanel = document.getElementById("productFormPanel");
const productForm = document.getElementById("productForm");

/* Productos cargados */
let productosSupabase = [];

/* =========================
   CARGAR PRODUCTOS
========================= */

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

/* =========================
   RENDER TABLA
========================= */

function renderProducts(data) {
  if (!productsTableBody) return;

  productsTableBody.innerHTML = "";

  data.forEach((product) => {
    const status = getProductStatus(Number(product.stock) || 0);

    const row = document.createElement("tr");
    row.classList.add("clickable-row");

    row.innerHTML = `
      <td>${product.sku || "-"}</td>
      <td>
        <div class="product-cell">
          ${
            product.imagen_url
              ? `<img src="${product.imagen_url}" class="product-thumb" width="52" height="52">`
              : ""
          }
          <span>${product.nombre || "-"}</span>
        </div>
      </td>
      <td>${product.artista || "-"}</td>
      <td>${product.genero || "-"}</td>
      <td>${formatPriceNumber(Number(product.precio) || 0)}</td>
      <td>${product.stock ?? 0}</td>
      <td><span class="${getProductStatusClass(status)}">${status}</span></td>
    `;

    row.addEventListener("click", () => {
      localStorage.setItem("selectedProductId", product.id);
      window.location.href = "/producto-detalle";
    });

    productsTableBody.appendChild(row);
  });
}

/* =========================
   FILTROS
========================= */

function filterProducts() {
  if (!searchProduct || !productStatusFilter) return;

  const searchValue = searchProduct.value.toLowerCase();
  const statusValue = productStatusFilter.value;

  const filtered = productosSupabase.filter((product) => {
    const status = getProductStatus(Number(product.stock) || 0);

    const matchesSearch =
      (product.nombre || "").toLowerCase().includes(searchValue) ||
      (product.artista || "").toLowerCase().includes(searchValue) ||
      (product.sku || "").toLowerCase().includes(searchValue);

    const matchesStatus = statusValue === "all" || status === statusValue;

    return matchesSearch && matchesStatus;
  });

  renderProducts(filtered);
}

/* =========================
   STATS
========================= */

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

/* =========================
   CREAR PRODUCTO (NUEVO)
========================= */

async function crearProducto(e) {
  e.preventDefault();

  const nuevoProducto = {
    sku: "VIN-" + Date.now(),
    nombre: document.getElementById("productNombre").value,
    artista: document.getElementById("productArtista").value,
    genero: document.getElementById("productGenero").value,
    precio: Number(document.getElementById("productPrecio").value),
    stock: Number(document.getElementById("productStock").value),
    imagen_url: document.getElementById("productImagenUrl").value || null
  };

  const { error } = await supabaseClient
    .from("productos")
    .insert([nuevoProducto]);

  if (error) {
    console.error("Error al crear producto:", error);
    return;
  }

  productForm.reset();
  productFormPanel.style.display = "none";

  await cargarProductosSupabase();
}

/* =========================
   DETALLE PRODUCTO
========================= */

async function renderProductDetail() {
  const productContent = document.getElementById("productContent");
  const noProductMessage = document.getElementById("noProductMessage");
  const productTitle = document.getElementById("productTitle");

  if (!productContent || !noProductMessage || !productTitle) return;

  const selectedProductId = localStorage.getItem("selectedProductId");

  if (!selectedProductId) {
    productContent.style.display = "none";
    noProductMessage.style.display = "block";
    return;
  }

  const { data: product } = await supabaseClient
    .from("productos")
    .select("*")
    .eq("id", selectedProductId)
    .single();

  if (!product) return;

  productContent.style.display = "block";
  noProductMessage.style.display = "none";

  productTitle.textContent = product.nombre || "-";
}

/* =========================
   GUARDAR STOCK
========================= */

async function guardarStockProducto() {
  const selectedProductId = localStorage.getItem("selectedProductId");
  const stockInput = document.getElementById("stockInput");

  if (!selectedProductId || !stockInput) return;

  const nuevoStock = parseInt(stockInput.value, 10);

  if (isNaN(nuevoStock) || nuevoStock < 0) return;

  await supabaseClient
    .from("productos")
    .update({ stock: nuevoStock })
    .eq("id", selectedProductId);

  await cargarProductosSupabase();
}

/* =========================
   INIT
========================= */

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

/* BOTÓN NUEVO PRODUCTO */
if (openProductFormBtn) {
  openProductFormBtn.addEventListener("click", () => {
    productFormPanel.style.display = "block";
  });
}

if (cancelProductFormBtn) {
  cancelProductFormBtn.addEventListener("click", () => {
    productFormPanel.style.display = "none";
  });
}

if (productForm) {
  productForm.addEventListener("submit", crearProducto);
}

/* Exponer */
window.guardarStockProducto = guardarStockProducto;