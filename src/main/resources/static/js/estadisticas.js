/* =========================
   ESTADÍSTICAS
========================= */

/* Obtener datos de clientes combinando pedidos e incidencias */
function getClientesStatsData() {
  const orders = getAllOrders(); // pedidos
  const incidents = getAllIncidents(); // incidencias
  const map = {}; // agrupador de clientes

  /* Contar pedidos por cliente */
  orders.forEach(order => {
    if (!map[order.cliente]) {
      map[order.cliente] = {
        nombre: order.cliente,
        pedidos: 0,
        incidencias: 0
      };
    }
    map[order.cliente].pedidos++;
  });

  /* Contar incidencias por cliente */
  incidents.forEach(incident => {
    if (!map[incident.cliente]) {
      map[incident.cliente] = {
        nombre: incident.cliente,
        pedidos: 0,
        incidencias: 0
      };
    }
    map[incident.cliente].incidencias++;
  });

  return Object.values(map); // devolver array
}

/* Render estadísticas generales */
function renderGeneralStats() {
  const orders = getAllOrders();
  const incidents = getAllIncidents();
  const products = getAllProducts();
  const clientes = getClientesStatsData();

  /* Cálculos */
  const pedidosPendientes = orders.filter(o => o.estado === "Pendiente").length;
  const incidenciasAbiertas = incidents.filter(i => i.estado === "Abierta" || i.estado === "En revisión").length;
  const productosActivos = products.filter(p => p.stock > 0).length;
  const clientesConPedidos = clientes.filter(c => c.pedidos > 0).length;

  /* Pintar en DOM */
  document.getElementById("statsPedidosTotales").textContent = orders.length;
  document.getElementById("statsPedidosResumen").textContent = `${pedidosPendientes} pendientes`;

  document.getElementById("statsIncidenciasAbiertas").textContent = incidenciasAbiertas;
  document.getElementById("statsIncidenciasResumen").textContent = `${incidents.length} registradas`;

  document.getElementById("statsClientesTotales").textContent = clientes.length;
  document.getElementById("statsClientesResumen").textContent = `${clientesConPedidos} activos`;

  document.getElementById("statsProductosTotales").textContent = products.length;
  document.getElementById("statsProductosResumen").textContent = `${productosActivos} disponibles`;
}

/* Render cajas de estado de pedidos */
function renderOrderStatsBoxes() {
  const orders = getAllOrders();
  const container = document.getElementById("orderStatsBoxes");
  if (!container) return;

  const stats = [
    { titulo: "Pendientes", valor: orders.filter(o => o.estado === "Pendiente").length, texto: "Pedidos aún no preparados o no confirmados." },
    { titulo: "Pagados", valor: orders.filter(o => o.estado === "Pagado").length, texto: "Pedidos con pago confirmado." },
    { titulo: "Enviados", valor: orders.filter(o => o.estado === "Enviado").length, texto: "Pedidos en tránsito hacia el cliente." },
    { titulo: "Entregados", valor: orders.filter(o => o.estado === "Entregado").length, texto: "Pedidos completados correctamente." },
    { titulo: "Cancelados", valor: orders.filter(o => o.estado === "Cancelado").length, texto: "Pedidos cancelados o anulados." }
  ];

  /* Pintar cajas */
  container.innerHTML = stats.map(item => `
    <div class="summary-item">
      <h4>${item.titulo}: ${item.valor}</h4>
      <p>${item.texto}</p>
    </div>
  `).join("");
}

/* Render cajas de estado de incidencias */
function renderIncidentStatsBoxes() {
  const incidents = getAllIncidents();
  const container = document.getElementById("incidentStatsBoxes");
  if (!container) return;

  const stats = [
    { titulo: "Abiertas", valor: incidents.filter(i => i.estado === "Abierta").length, texto: "Incidencias pendientes de primera actuación." },
    { titulo: "En revisión", valor: incidents.filter(i => i.estado === "En revisión").length, texto: "Casos que están siendo analizados." },
    { titulo: "Resueltas", valor: incidents.filter(i => i.estado === "Resuelta").length, texto: "Incidencias ya tratadas correctamente." },
    { titulo: "Cerradas", valor: incidents.filter(i => i.estado === "Cerrada").length, texto: "Casos finalizados sin acciones pendientes." }
  ];

  /* Pintar cajas */
  container.innerHTML = stats.map(item => `
    <div class="summary-item">
      <h4>${item.titulo}: ${item.valor}</h4>
      <p>${item.texto}</p>
    </div>
  `).join("");
}

/* Top clientes por pedidos */
function renderTopClientes() {
  const clientes = getClientesStatsData()
    .sort((a, b) => b.pedidos - a.pedidos)
    .slice(0, 5);

  const table = document.getElementById("topClientesTable");
  if (!table) return;

  table.innerHTML = clientes.map(cliente => `
    <tr>
      <td>${cliente.nombre}</td>
      <td>${cliente.pedidos}</td>
      <td>${cliente.incidencias}</td>
    </tr>
  `).join("");
}

/* Top productos por stock */
function renderTopProductos() {
  const products = getAllProducts()
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const table = document.getElementById("topProductosTable");
  if (!table) return;

  table.innerHTML = products.map(product => {
    const status = getProductStatus(product.stock); // estado según stock
    return `
      <tr>
        <td>${product.nombre}</td>
        <td>${product.stock}</td>
        <td><span class="${getProductStatusClass(status)}">${status}</span></td>
      </tr>
    `;
  }).join("");
}

/* Resumen operativo general */
function renderOperationalSummary() {
  const orders = getAllOrders();
  const incidents = getAllIncidents();
  const products = getAllProducts();
  const clientes = getClientesStatsData();
  const container = document.getElementById("operationalSummary");
  if (!container) return;

  /* Cálculos */
  const stockBajo = products.filter(p => p.stock > 0 && p.stock < 5).length;
  const agotados = products.filter(p => p.stock === 0).length;
  const conIncidencia = orders.filter(o => o.incidencia && o.incidencia !== "Sin incidencia").length;
  const clientesConIncidencias = clientes.filter(c => c.incidencias > 0).length;
  const valorInventario = products.reduce((acc, p) => acc + (p.precio * p.stock), 0);

  const bloques = [
    {
      titulo: "Pedidos con incidencia asociada",
      texto: `${conIncidencia} pedidos tienen actualmente una incidencia relacionada.`
    },
    {
      titulo: "Productos con stock bajo",
      texto: `${stockBajo} productos están por debajo del umbral de stock recomendado.`
    },
    {
      titulo: "Productos agotados",
      texto: `${agotados} productos están actualmente sin existencias.`
    },
    {
      titulo: "Clientes con incidencias",
      texto: `${clientesConIncidencias} clientes han registrado al menos una incidencia.`
    },
    {
      titulo: "Valor estimado del inventario",
      texto: `${formatPriceNumber(valorInventario)} en stock disponible actualmente.`
    },
    {
      titulo: "Volumen total de actividad",
      texto: `${orders.length} pedidos y ${incidents.length} incidencias registradas en el sistema.`
    }
  ];

  /* Pintar bloques */
  container.innerHTML = bloques.map(item => `
    <div class="summary-item">
      <h4>${item.titulo}</h4>
      <p>${item.texto}</p>
    </div>
  `).join("");
}

/* INIT */
renderGeneralStats(); // stats principales
renderOrderStatsBoxes(); // pedidos
renderIncidentStatsBoxes(); // incidencias
renderTopClientes(); // top clientes
renderTopProductos(); // top productos
renderOperationalSummary(); // resumen global