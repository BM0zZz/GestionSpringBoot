/* =========================
   ESTADÍSTICAS - SUPABASE
========================= */

/* Cliente de Supabase */
const supabaseStatsClient = window.supabaseClient;

/* Arrays globales */
let statsPedidos = [];
let statsDevoluciones = [];
let statsUsuarios = [];
let statsProductos = [];

/* Traducir texto de forma segura */
function statsT(key) {
  if (typeof window.t === "function") {
    return window.t(key);
  }

  return key;
}

/* Formatear precio */
function formatStatsPrice(valor) {
  if (valor === null || valor === undefined || valor === "") return "0,00 €";

  return Number(valor).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR"
  });
}

/* Clase visual para estado de pedido */
function getStatsPedidoStatusClass(estado) {
  switch (estado) {
    case "En preparación":
      return "badge badge-pending";

    case "Procesando":
      return "badge badge-review";

    case "En camino":
      return "badge badge-shipped";

    case "Entregado":
      return "badge badge-delivered";

    case "Cancelado":
      return "badge badge-closed";

    default:
      return "badge badge-low";
  }
}

/* Clase visual para estado de incidencia/devolución */
function getStatsIncidenciaStatusClass(estado) {
  switch (estado) {
    case "Pendiente":
      return "badge badge-pending";

    case "En revisión":
      return "badge badge-review";

    case "Aprobada":
      return "badge badge-resolved";

    case "Rechazada":
      return "badge badge-closed";

    default:
      return "badge badge-low";
  }
}

/* Estado visual del producto según stock */
function getStatsProductStatus(stock) {
  if (stock === null || stock === undefined) return "Sin datos";
  if (stock <= 0) return "Agotado";
  if (stock < 5) return "Stock bajo";
  return "Disponible";
}

/* Obtener texto traducido del estado del producto */
function getStatsProductStatusText(status) {
  switch (status) {
    case "Disponible":
      return statsT("statsDynamic.productStatusAvailable");

    case "Stock bajo":
      return statsT("statsDynamic.productStatusLowStock");

    case "Agotado":
      return statsT("statsDynamic.productStatusSoldOut");

    case "Sin datos":
      return statsT("statsDynamic.productStatusNoData");

    default:
      return status;
  }
}

/* Clase visual del producto según stock */
function getStatsProductStatusClass(status) {
  switch (status) {
    case "Disponible":
      return "badge badge-delivered";

    case "Stock bajo":
      return "badge badge-pending";

    case "Agotado":
      return "badge badge-closed";

    default:
      return "badge badge-low";
  }
}

/* Buscar usuario por ID */
function getStatsUsuario(usuarioId) {
  if (!usuarioId) return null;

  return statsUsuarios.find(usuario => usuario.id === usuarioId) || null;
}

/* Obtener nombre visible del cliente */
function getStatsNombreCliente(usuarioId) {
  const usuario = getStatsUsuario(usuarioId);

  if (!usuario) return statsT("statsDynamic.clientNotFound");

  const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim();

  if (nombreCompleto) return nombreCompleto;
  if (usuario.email) return usuario.email;

  return statsT("statsDynamic.clientNoName");
}

/* Contar elementos por estado */
function contarPorEstado(data, estados) {
  return estados.map(estado => ({
    estado: estado,
    total: data.filter(item => item.estado === estado).length
  }));
}

/* Obtener datos de clientes combinando pedidos y devoluciones */
function getClientesStatsData() {
  const map = {};

  statsUsuarios.forEach(usuario => {
    const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim();

    map[usuario.id] = {
      id: usuario.id,
      nombre: nombreCompleto || usuario.email || statsT("statsDynamic.clientNoName"),
      pedidos: 0,
      incidencias: 0
    };
  });

  statsPedidos.forEach(pedido => {
    if (!pedido.usuario_id) return;

    if (!map[pedido.usuario_id]) {
      map[pedido.usuario_id] = {
        id: pedido.usuario_id,
        nombre: getStatsNombreCliente(pedido.usuario_id),
        pedidos: 0,
        incidencias: 0
      };
    }

    map[pedido.usuario_id].pedidos++;
  });

  statsDevoluciones.forEach(devolucion => {
    if (!devolucion.usuario_id) return;

    if (!map[devolucion.usuario_id]) {
      map[devolucion.usuario_id] = {
        id: devolucion.usuario_id,
        nombre: getStatsNombreCliente(devolucion.usuario_id),
        pedidos: 0,
        incidencias: 0
      };
    }

    map[devolucion.usuario_id].incidencias++;
  });

  return Object.values(map);
}

/* Cargar datos desde Supabase */
async function cargarDatosEstadisticas() {
  const [
    pedidosResponse,
    devolucionesResponse,
    usuariosResponse,
    productosResponse
  ] = await Promise.all([
    supabaseStatsClient
      .from("vs_pedidos")
      .select("*"),

    supabaseStatsClient
      .from("vs_devoluciones")
      .select("*"),

    supabaseStatsClient
      .from("vs_usuarios")
      .select("id, nombre, apellidos, email, created_at"),

    supabaseStatsClient
      .from("productos")
      .select("*")
  ]);

  if (pedidosResponse.error) {
    console.error("Error al cargar pedidos:", pedidosResponse.error);
    alert(statsT("statsDynamic.alertOrdersError"));
    return;
  }

  if (devolucionesResponse.error) {
    console.error("Error al cargar incidencias:", devolucionesResponse.error);
    alert(statsT("statsDynamic.alertIncidentsError"));
    return;
  }

  if (usuariosResponse.error) {
    console.error("Error al cargar clientes:", usuariosResponse.error);
    alert(statsT("statsDynamic.alertCustomersError"));
    return;
  }

  if (productosResponse.error) {
    console.error("Error al cargar productos:", productosResponse.error);
    alert(statsT("statsDynamic.alertProductsError"));
    return;
  }

  statsPedidos = pedidosResponse.data || [];
  statsDevoluciones = devolucionesResponse.data || [];
  statsUsuarios = usuariosResponse.data || [];
  statsProductos = productosResponse.data || [];

  renderGeneralStats();
  renderOrderStatsBoxes();
  renderIncidentStatsBoxes();
  renderTopClientes();
  renderTopProductos();
  renderOperationalSummary();
}

/* Render estadísticas generales */
function renderGeneralStats() {
  const clientes = getClientesStatsData();

  const pedidosPendientes = statsPedidos.filter(pedido =>
    pedido.estado === "En preparación" ||
    pedido.estado === "Procesando"
  ).length;

  const incidenciasAbiertas = statsDevoluciones.filter(devolucion =>
    devolucion.estado === "Pendiente" ||
    devolucion.estado === "En revisión"
  ).length;

  const productosDisponibles = statsProductos.filter(producto =>
    Number(producto.stock) > 0
  ).length;

  const clientesConPedidos = clientes.filter(cliente =>
    cliente.pedidos > 0
  ).length;

  const statsPedidosTotales = document.getElementById("statsPedidosTotales");
  const statsPedidosResumen = document.getElementById("statsPedidosResumen");
  const statsIncidenciasAbiertas = document.getElementById("statsIncidenciasAbiertas");
  const statsIncidenciasResumen = document.getElementById("statsIncidenciasResumen");
  const statsClientesTotales = document.getElementById("statsClientesTotales");
  const statsClientesResumen = document.getElementById("statsClientesResumen");
  const statsProductosTotales = document.getElementById("statsProductosTotales");
  const statsProductosResumen = document.getElementById("statsProductosResumen");

  if (statsPedidosTotales) statsPedidosTotales.textContent = statsPedidos.length;
  if (statsPedidosResumen) {
    statsPedidosResumen.textContent = `${pedidosPendientes} ${statsT("statsDynamic.pendingOrProcessing")}`;
  }

  if (statsIncidenciasAbiertas) statsIncidenciasAbiertas.textContent = incidenciasAbiertas;
  if (statsIncidenciasResumen) {
    statsIncidenciasResumen.textContent = `${statsDevoluciones.length} ${statsT("statsDynamic.registered")}`;
  }

  if (statsClientesTotales) statsClientesTotales.textContent = statsUsuarios.length;
  if (statsClientesResumen) {
    statsClientesResumen.textContent = `${clientesConPedidos} ${statsT("statsDynamic.withOrders")}`;
  }

  if (statsProductosTotales) statsProductosTotales.textContent = statsProductos.length;
  if (statsProductosResumen) {
    statsProductosResumen.textContent = `${productosDisponibles} ${statsT("statsDynamic.available")}`;
  }
}

/* Render cajas de estado de pedidos */
function renderOrderStatsBoxes() {
  const container = document.getElementById("orderStatsBoxes");
  if (!container) return;

  const estados = [
    {
      titulo: statsT("statsDynamic.orderPreparing"),
      valor: statsPedidos.filter(pedido => pedido.estado === "En preparación").length,
      texto: statsT("statsDynamic.orderPreparingText")
    },
    {
      titulo: statsT("statsDynamic.orderProcessing"),
      valor: statsPedidos.filter(pedido => pedido.estado === "Procesando").length,
      texto: statsT("statsDynamic.orderProcessingText")
    },
    {
      titulo: statsT("statsDynamic.orderOnTheWay"),
      valor: statsPedidos.filter(pedido => pedido.estado === "En camino").length,
      texto: statsT("statsDynamic.orderOnTheWayText")
    },
    {
      titulo: statsT("statsDynamic.orderDelivered"),
      valor: statsPedidos.filter(pedido => pedido.estado === "Entregado").length,
      texto: statsT("statsDynamic.orderDeliveredText")
    },
    {
      titulo: statsT("statsDynamic.orderCancelled"),
      valor: statsPedidos.filter(pedido => pedido.estado === "Cancelado").length,
      texto: statsT("statsDynamic.orderCancelledText")
    }
  ];

  container.innerHTML = estados.map(item => `
    <div class="summary-item">
      <h4>${item.titulo}: ${item.valor}</h4>
      <p>${item.texto}</p>
    </div>
  `).join("");
}

/* Render cajas de estado de incidencias */
function renderIncidentStatsBoxes() {
  const container = document.getElementById("incidentStatsBoxes");
  if (!container) return;

  const estados = [
    {
      titulo: statsT("statsDynamic.incidentPending"),
      valor: statsDevoluciones.filter(devolucion => devolucion.estado === "Pendiente").length,
      texto: statsT("statsDynamic.incidentPendingText")
    },
    {
      titulo: statsT("statsDynamic.incidentReview"),
      valor: statsDevoluciones.filter(devolucion => devolucion.estado === "En revisión").length,
      texto: statsT("statsDynamic.incidentReviewText")
    },
    {
      titulo: statsT("statsDynamic.incidentApproved"),
      valor: statsDevoluciones.filter(devolucion => devolucion.estado === "Aprobada").length,
      texto: statsT("statsDynamic.incidentApprovedText")
    },
    {
      titulo: statsT("statsDynamic.incidentRejected"),
      valor: statsDevoluciones.filter(devolucion => devolucion.estado === "Rechazada").length,
      texto: statsT("statsDynamic.incidentRejectedText")
    }
  ];

  container.innerHTML = estados.map(item => `
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

  if (clientes.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="3">${statsT("statsDynamic.noCustomers")}</td>
      </tr>
    `;
    return;
  }

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
  const productos = [...statsProductos]
    .sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))
    .slice(0, 5);

  const table = document.getElementById("topProductosTable");
  if (!table) return;

  if (productos.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="3">${statsT("statsDynamic.noProducts")}</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = productos.map(producto => {
    const stock = Number(producto.stock || 0);
    const status = getStatsProductStatus(stock);

    return `
      <tr>
        <td>${producto.nombre || "-"}</td>
        <td>${stock}</td>
        <td><span class="${getStatsProductStatusClass(status)}">${getStatsProductStatusText(status)}</span></td>
      </tr>
    `;
  }).join("");
}

/* Resumen operativo general */
function renderOperationalSummary() {
  const container = document.getElementById("operationalSummary");
  if (!container) return;

  const stockBajo = statsProductos.filter(producto => {
    const stock = Number(producto.stock || 0);
    return stock > 0 && stock < 5;
  }).length;

  const agotados = statsProductos.filter(producto =>
    Number(producto.stock || 0) === 0
  ).length;

  const pedidosConIncidencia = new Set(
    statsDevoluciones
      .filter(devolucion => devolucion.pedido_id)
      .map(devolucion => devolucion.pedido_id)
  ).size;

  const clientesConIncidencias = new Set(
    statsDevoluciones
      .filter(devolucion => devolucion.usuario_id)
      .map(devolucion => devolucion.usuario_id)
  ).size;

  const valorInventario = statsProductos.reduce((acc, producto) => {
    const precio = Number(producto.precio || 0);
    const stock = Number(producto.stock || 0);

    return acc + (precio * stock);
  }, 0);

  const ingresosTotales = statsPedidos.reduce((acc, pedido) => {
    return acc + Number(pedido.total || 0);
  }, 0);

  const ticketMedio = statsPedidos.length > 0
    ? ingresosTotales / statsPedidos.length
    : 0;

  const bloques = [
    {
      titulo: statsT("statsDynamic.ordersWithIncidentTitle"),
      texto: `${pedidosConIncidencia} ${statsT("statsDynamic.ordersWithIncidentText")}`
    },
    {
      titulo: statsT("statsDynamic.lowStockProductsTitle"),
      texto: `${stockBajo} ${statsT("statsDynamic.lowStockProductsText")}`
    },
    {
      titulo: statsT("statsDynamic.soldOutProductsTitle"),
      texto: `${agotados} ${statsT("statsDynamic.soldOutProductsText")}`
    },
    {
      titulo: statsT("statsDynamic.customersWithIncidentsTitle"),
      texto: `${clientesConIncidencias} ${statsT("statsDynamic.customersWithIncidentsText")}`
    },
    {
      titulo: statsT("statsDynamic.inventoryValueTitle"),
      texto: `${formatStatsPrice(valorInventario)} ${statsT("statsDynamic.inventoryValueText")}`
    },
    {
      titulo: statsT("statsDynamic.registeredIncomeTitle"),
      texto: `${formatStatsPrice(ingresosTotales)} ${statsT("statsDynamic.registeredIncomeText")}`
    },
    {
      titulo: statsT("statsDynamic.averageTicketTitle"),
      texto: `${formatStatsPrice(ticketMedio)} ${statsT("statsDynamic.averageTicketText")}`
    },
    {
      titulo: statsT("statsDynamic.totalActivityTitle"),
      texto: `${statsPedidos.length} ${statsT("statsDynamic.ordersAnd")} ${statsDevoluciones.length} ${statsT("statsDynamic.incidentsRegistered")}`
    }
  ];

  container.innerHTML = bloques.map(item => `
    <div class="summary-item">
      <h4>${item.titulo}</h4>
      <p>${item.texto}</p>
    </div>
  `).join("");
}

/* INIT */
cargarDatosEstadisticas();