/* =========================
   PRODUCTOS
========================= */

/* Referencias DOM */
const productsTableBody = document.getElementById("productsTableBody");
const searchProduct = document.getElementById("searchProduct");
const productStatusFilter = document.getElementById("productStatusFilter");

/* Render tabla productos */
function renderProducts(data) {
  if (!productsTableBody) return;

  productsTableBody.innerHTML = "";

  data.forEach((product) => {
    const status = getProductStatus(product.stock);

    const row = document.createElement("tr");
    row.classList.add("clickable-row");
    row.title = "Ver detalle del producto";

    /* Contenido fila */
    row.innerHTML = `
      <td>${product.sku}</td>
      <td>${product.nombre}</td>
      <td>${product.artista}</td>
      <td>${product.genero}</td>
      <td>${formatPriceNumber(product.precio)}</td>
      <td>${product.stock}</td>
      <td><span class="${getProductStatusClass(status)}">${status}</span></td>
    `;

    /* Click → guardar SKU y redirigir */
    row.addEventListener("click", () => {
      localStorage.setItem("selectedProductSku", product.sku);
      window.location.href = "/producto-detalle.html";
    });

    productsTableBody.appendChild(row);
  });
}

/* Filtro productos */
function filterProducts() {
  if (!searchProduct || !productStatusFilter) return;

  const allProducts = getAllProducts();
  const searchValue = searchProduct.value.toLowerCase();
  const statusValue = productStatusFilter.value;

  const filtered = allProducts.filter((product) => {
    const status = getProductStatus(product.stock);

    /* Buscar por nombre, artista o SKU */
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchValue) ||
      product.artista.toLowerCase().includes(searchValue) ||
      product.sku.toLowerCase().includes(searchValue);

    /* Filtrar por estado */
    const matchesStatus = statusValue === "all" || status === statusValue;

    return matchesSearch && matchesStatus;
  });

  renderProducts(filtered);
}

/* Estadísticas productos */
function renderProductStats() {
  const products = getAllProducts();

  const total = products.length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 5).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const inventoryValue = products.reduce((acc, p) => acc + (p.precio * p.stock), 0);

  /* Referencias DOM */
  const totalProductos = document.getElementById("totalProductos");
  const stockBajo = document.getElementById("stockBajo");
  const sinStock = document.getElementById("sinStock");
  const valorInventario = document.getElementById("valorInventario");

  /* Pintar valores */
  if (totalProductos) totalProductos.textContent = total;
  if (stockBajo) stockBajo.textContent = lowStock;
  if (sinStock) sinStock.textContent = outOfStock;
  if (valorInventario) valorInventario.textContent = formatPriceNumber(inventoryValue);
}

/* Detalle producto */
function renderProductDetail() {
  const productContent = document.getElementById("productContent");
  const noProductMessage = document.getElementById("noProductMessage");
  const productTitle = document.getElementById("productTitle");
  const stockInput = document.getElementById("stockInput");

  if (!productContent || !noProductMessage || !productTitle) return;

  const selectedProductSku = localStorage.getItem("selectedProductSku");

  /* Si no hay producto seleccionado */
  if (!selectedProductSku) {
    productContent.style.display = "none";
    noProductMessage.style.display = "block";
    return;
  }

  const product = getAllProducts().find(item => item.sku === selectedProductSku);

  /* Si no existe */
  if (!product) {
    productContent.style.display = "none";
    noProductMessage.style.display = "block";
    return;
  }

  /* Mostrar contenido */
  productContent.style.display = "block";
  noProductMessage.style.display = "none";

  /* Rellenar datos */
  productTitle.textContent = product.nombre;
  document.getElementById("detailProductSku").textContent = product.sku;
  document.getElementById("detailProductNombre").textContent = product.nombre;
  document.getElementById("detailProductArtista").textContent = product.artista;
  document.getElementById("detailProductGenero").textContent = product.genero;
  document.getElementById("detailProductDescripcion").textContent = product.descripcion;
  document.getElementById("detailProductPrecio").textContent = formatPriceNumber(product.precio);
  document.getElementById("detailProductStock").textContent = product.stock;
  document.getElementById("detailProductFecha").textContent = product.fechaActualizacion;

  /* Input stock */
  if (stockInput) {
    stockInput.value = product.stock;
  }

  /* Estado producto */
  const productStatusBox = document.getElementById("productStatusBox");
  const status = getProductStatus(product.stock);

  if (productStatusBox) {
    productStatusBox.innerHTML = `
      <span>Estado</span>
      <span class="${getProductStatusClass(status)}">${status}</span>
    `;
  }

  /* Historial */
  const productTimelineContainer = document.getElementById("productTimelineContainer");
  if (productTimelineContainer) {
    productTimelineContainer.innerHTML = product.historial.map(createTimelineItem).join("");
  }
}

/* Guardar cambio de stock */
function guardarStockProducto() {
  const selectedProductSku = localStorage.getItem("selectedProductSku");
  const stockInput = document.getElementById("stockInput");

  if (!selectedProductSku || !stockInput) return;

  const nuevoStock = parseInt(stockInput.value, 10);

  /* Validación */
  if (isNaN(nuevoStock) || nuevoStock < 0) return;

  const saved = getSavedProducts();
  const savedIndex = saved.findIndex(item => item.sku === selectedProductSku);

  /* Si ya está guardado */
  if (savedIndex !== -1) {
    const oldStock = saved[savedIndex].stock;

    if (oldStock !== nuevoStock) {
      saved[savedIndex].stock = nuevoStock;
      saved[savedIndex].fechaActualizacion = new Date().toLocaleDateString();

      /* Añadir historial */
      saved[savedIndex].historial.push({
        titulo: "Stock actualizado",
        fecha: new Date().toLocaleString(),
        texto: `El stock ha cambiado de ${oldStock} a ${nuevoStock}.`
      });

      saveUserProducts(saved);
    }

    renderProductDetail();
    renderProductStats();

    /* Refrescar tabla si existe */
    if (productsTableBody) renderProducts(getAllProducts());
    return;
  }

  /* Si es base */
  const base = baseProducts.find(item => item.sku === selectedProductSku);
  if (!base) return;

  const copy = JSON.parse(JSON.stringify(base));
  const oldStock = copy.stock;

  if (oldStock !== nuevoStock) {
    copy.stock = nuevoStock;
    copy.fechaActualizacion = new Date().toLocaleDateString();

    copy.historial.push({
      titulo: "Stock actualizado",
      fecha: new Date().toLocaleString(),
      texto: `El stock ha cambiado de ${oldStock} a ${nuevoStock}.`
    });
  }

  saved.push(copy);
  saveUserProducts(saved);

  renderProductDetail();
  renderProductStats();

  if (productsTableBody) renderProducts(getAllProducts());
}

/* INIT */

/* Tabla */
if (productsTableBody) {
  renderProducts(getAllProducts());
}

/* Stats */
renderProductStats();

/* Detalle */
renderProductDetail();

/* Eventos filtros */
if (searchProduct) {
  searchProduct.addEventListener("input", filterProducts);
}
if (productStatusFilter) {
  productStatusFilter.addEventListener("change", filterProducts);
}

/* Exponer función */
window.guardarStockProducto = guardarStockProducto;