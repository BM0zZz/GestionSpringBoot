/* =========================
   PEDIDOS - SUPABASE
========================= */

/* Cliente de Supabase */
const supabaseClient = window.supabaseClient;

/* Referencias DOM */
const ordersTableBody = document.getElementById("ordersTableBody");
const ordersManagementTableBody = document.getElementById("ordersManagementTableBody");
const searchOrder = document.getElementById("searchOrder");
const orderStatusFilter = document.getElementById("orderStatusFilter");

/* Arrays globales */
let pedidos = [];
let usuarios = [];

/* Estados válidos del pedido */
const estadosPedido = [
  "En preparación",
  "Procesando",
  "En camino",
  "Entregado",
  "Cancelado"
];

/* Formatear fecha */
function formatFechaPedido(fecha) {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

/* Formatear precio */
function formatPrecio(valor) {
  if (valor === null || valor === undefined || valor === "") return "-";

  return `${Number(valor).toFixed(2)} €`;
}

/* Acortar UUID para que no ocupe demasiado */
function formatIdCorto(id) {
  if (!id) return "-";
  return id.length > 12 ? `${id.substring(0, 8)}...` : id;
}

/* Buscar usuario relacionado con un pedido */
function getUsuarioPedido(usuarioId) {
  if (!usuarioId) return null;

  return usuarios.find(usuario => usuario.id === usuarioId) || null;
}

/* Obtener nombre visible del cliente */
function getNombreClientePedido(pedido) {
  const usuario = getUsuarioPedido(pedido.usuario_id);

  if (!usuario) {
    return formatIdCorto(pedido.usuario_id);
  }

  const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim();

  if (nombreCompleto) {
    return nombreCompleto;
  }

  if (usuario.email) {
    return usuario.email;
  }

  return formatIdCorto(pedido.usuario_id);
}

/* Obtener email del cliente */
function getEmailClientePedido(pedido) {
  const usuario = getUsuarioPedido(pedido.usuario_id);

  if (!usuario) return "-";

  return usuario.email || "-";
}

/* Clase visual según estado */
function getPedidoStatusClass(estado) {
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

/* Obtener ID del pedido desde la URL */
function getPedidoIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/* Cargar usuarios desde Supabase */
async function cargarUsuariosPedidos() {
  const { data, error } = await supabaseClient
    .from("vs_usuarios")
    .select("id, nombre, apellidos, email");

  if (error) {
    console.error("Error al cargar usuarios:", error);
    usuarios = [];
    return;
  }

  usuarios = data || [];
}

/* Cargar pedidos desde Supabase */
async function cargarPedidos() {
  await cargarUsuariosPedidos();

  const { data, error } = await supabaseClient
    .from("vs_pedidos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar pedidos:", error);
    alert("Error al cargar los pedidos desde Supabase.");
    return;
  }

  pedidos = data || [];

  renderOrdersRecent();
  renderOrdersManagement(pedidos);
  renderPedidosStats(pedidos);
}

/* Render pedidos recientes en dashboard */
function renderOrdersRecent() {
  if (!ordersTableBody) return;

  ordersTableBody.innerHTML = "";

  const recientes = pedidos.slice(0, 4);

  if (recientes.length === 0) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="5">No hay pedidos registrados.</td>
      </tr>
    `;
    return;
  }

  recientes.forEach((pedido) => {
    const row = document.createElement("tr");
    row.classList.add("clickable-row");
    row.title = "Ver detalle del pedido";

    row.innerHTML = `
      <td>${formatIdCorto(pedido.id)}</td>
      <td>${getNombreClientePedido(pedido)}</td>
      <td>${formatFechaPedido(pedido.created_at)}</td>
      <td>${formatPrecio(pedido.total)}</td>
      <td><span class="${getPedidoStatusClass(pedido.estado)}">${pedido.estado || "-"}</span></td>
    `;

    row.addEventListener("click", () => {
      window.location.href = `/pedido-detalle?id=${pedido.id}`;
    });

    ordersTableBody.appendChild(row);
  });
}

/* Render listado completo de pedidos */
function renderOrdersManagement(data) {
  if (!ordersManagementTableBody) return;

  ordersManagementTableBody.innerHTML = "";

  if (!data || data.length === 0) {
    ordersManagementTableBody.innerHTML = `
      <tr>
        <td colspan="5">No hay pedidos registrados.</td>
      </tr>
    `;
    return;
  }

  data.forEach((pedido) => {
    const row = document.createElement("tr");
    row.classList.add("clickable-row");
    row.title = "Ver detalle del pedido";

    row.innerHTML = `
      <td>${formatIdCorto(pedido.id)}</td>
      <td>${getNombreClientePedido(pedido)}</td>
      <td>${formatFechaPedido(pedido.created_at)}</td>
      <td>${formatPrecio(pedido.total)}</td>
      <td><span class="${getPedidoStatusClass(pedido.estado)}">${pedido.estado || "-"}</span></td>
    `;

    row.addEventListener("click", () => {
      window.location.href = `/pedido-detalle?id=${pedido.id}`;
    });

    ordersManagementTableBody.appendChild(row);
  });
}

/* Pintar estadísticas */
function renderPedidosStats(pedidosData) {
  const total = pedidosData.length;

  const enPreparacion = pedidosData.filter(pedido =>
    pedido.estado === "En preparación"
  ).length;

  const enCamino = pedidosData.filter(pedido =>
    pedido.estado === "En camino"
  ).length;

  const entregados = pedidosData.filter(pedido =>
    pedido.estado === "Entregado"
  ).length;

  const fechaActual = new Date();
  const haceSieteDias = new Date();
  haceSieteDias.setDate(fechaActual.getDate() - 7);

  const pedidosSemana = pedidosData.filter(pedido => {
    if (!pedido.created_at) return false;

    const fechaPedido = new Date(pedido.created_at);
    return fechaPedido >= haceSieteDias && fechaPedido <= fechaActual;
  }).length;

  const porcentaje = total > 0
    ? ((entregados / total) * 100).toFixed(1)
    : "0.0";

  const totalPedidos = document.getElementById("totalPedidos");
  const pedidosSemanaText = document.getElementById("pedidosSemana");
  const pedidosPreparacion = document.getElementById("pedidosPreparacion");
  const pedidosEnCamino = document.getElementById("pedidosEnCamino");
  const pedidosEntregados = document.getElementById("pedidosEntregados");
  const porcentajeEntregados = document.getElementById("porcentajeEntregados");

  if (totalPedidos) totalPedidos.textContent = total;
  if (pedidosSemanaText) pedidosSemanaText.textContent = `${pedidosSemana} esta semana`;
  if (pedidosPreparacion) pedidosPreparacion.textContent = enPreparacion;
  if (pedidosEnCamino) pedidosEnCamino.textContent = enCamino;
  if (pedidosEntregados) pedidosEntregados.textContent = entregados;
  if (porcentajeEntregados) porcentajeEntregados.textContent = `${porcentaje}% del total`;
}

/* Filtros pedidos */
function filterOrders() {
  if (!searchOrder || !orderStatusFilter) return;

  const searchValue = searchOrder.value.toLowerCase();
  const statusValue = orderStatusFilter.value;

  const filtered = pedidos.filter((pedido) => {
    const id = pedido.id || "";
    const usuarioId = pedido.usuario_id || "";
    const clienteVisible = getNombreClientePedido(pedido);
    const emailCliente = getEmailClientePedido(pedido);
    const direccion = pedido.direccion || "";
    const metodoEnvio = pedido.metodo_envio || "";
    const estado = pedido.estado || "";

    const matchesSearch =
      id.toLowerCase().includes(searchValue) ||
      usuarioId.toLowerCase().includes(searchValue) ||
      clienteVisible.toLowerCase().includes(searchValue) ||
      emailCliente.toLowerCase().includes(searchValue) ||
      direccion.toLowerCase().includes(searchValue) ||
      metodoEnvio.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusValue === "all" || estado === statusValue;

    return matchesSearch && matchesStatus;
  });

  renderOrdersManagement(filtered);
}

/* Cargar un pedido concreto para la página de detalle */
async function cargarPedidoDetalle() {
  const orderContent = document.getElementById("orderContent");
  const noOrderMessage = document.getElementById("noOrderMessage");
  const orderTitle = document.getElementById("orderTitle");

  if (!orderContent || !noOrderMessage || !orderTitle) return;

  await cargarUsuariosPedidos();

  const pedidoId = getPedidoIdFromUrl();

  if (!pedidoId) {
    orderContent.style.display = "none";
    noOrderMessage.style.display = "block";
    return;
  }

  const { data: pedido, error } = await supabaseClient
    .from("vs_pedidos")
    .select("*")
    .eq("id", pedidoId)
    .single();

  if (error || !pedido) {
    console.error("Error al cargar el pedido:", error);

    orderContent.style.display = "none";
    noOrderMessage.style.display = "block";
    return;
  }

  orderContent.style.display = "block";
  noOrderMessage.style.display = "none";

  pintarDetallePedido(pedido);
}

/* Pintar detalle del pedido */
function pintarDetallePedido(pedido) {
  const orderTitle = document.getElementById("orderTitle");
  const pedidoEstadoSelect = document.getElementById("pedidoEstadoSelect");

  if (orderTitle) {
    orderTitle.textContent = `Pedido ${formatIdCorto(pedido.id)}`;
  }

  const detailOrderId = document.getElementById("detailOrderId");
  const detailOrderCliente = document.getElementById("detailOrderCliente");
  const detailOrderFecha = document.getElementById("detailOrderFecha");
  const detailOrderTotal = document.getElementById("detailOrderTotal");
  const detailOrderDireccion = document.getElementById("detailOrderDireccion");
  const detailOrderPago = document.getElementById("detailOrderPago");
  const detailOrderIncidencia = document.getElementById("detailOrderIncidencia");

  if (detailOrderId) detailOrderId.textContent = pedido.id || "-";

  if (detailOrderCliente) {
    const email = getEmailClientePedido(pedido);
    const nombre = getNombreClientePedido(pedido);

    detailOrderCliente.textContent = email !== "-"
      ? `${nombre} (${email})`
      : nombre;
  }

  if (detailOrderFecha) detailOrderFecha.textContent = formatFechaPedido(pedido.created_at);
  if (detailOrderTotal) detailOrderTotal.textContent = formatPrecio(pedido.total);
  if (detailOrderDireccion) detailOrderDireccion.textContent = pedido.direccion || "-";
  if (detailOrderPago) {
    detailOrderPago.textContent = pedido.tarjeta_last4
      ? `Tarjeta terminada en ${pedido.tarjeta_last4}`
      : "-";
  }

  if (detailOrderIncidencia) {
    detailOrderIncidencia.textContent = "Sin incidencias registradas";
  }

  const pedidoEstadoBox = document.getElementById("pedidoEstadoBox");

  if (pedidoEstadoBox) {
    pedidoEstadoBox.innerHTML = `
      <span>Estado</span>
      <span class="${getPedidoStatusClass(pedido.estado)}">${pedido.estado || "-"}</span>
    `;
  }

  if (pedidoEstadoSelect) {
    pedidoEstadoSelect.value = pedido.estado || "";
  }

  pintarResumenEconomicoPedido(pedido);
  pintarItemsPedido(pedido);
  pintarHistorialPedido(pedido);
}

/* Pintar resumen económico */
function pintarResumenEconomicoPedido(pedido) {
  const detailOrderSubtotal = document.getElementById("detailOrderSubtotal");
  const detailOrderEnvio = document.getElementById("detailOrderEnvio");
  const detailOrderDescuento = document.getElementById("detailOrderDescuento");
  const detailOrderMetodoEnvio = document.getElementById("detailOrderMetodoEnvio");

  if (detailOrderSubtotal) detailOrderSubtotal.textContent = formatPrecio(pedido.subtotal);
  if (detailOrderEnvio) detailOrderEnvio.textContent = formatPrecio(pedido.envio);
  if (detailOrderDescuento) detailOrderDescuento.textContent = formatPrecio(pedido.descuento);
  if (detailOrderMetodoEnvio) detailOrderMetodoEnvio.textContent = pedido.metodo_envio || "-";
}

/* Pintar productos/items del pedido */
function pintarItemsPedido(pedido) {
  const orderProductsList = document.getElementById("orderProductsList");

  if (!orderProductsList) return;

  if (!pedido.items) {
    orderProductsList.innerHTML = "<p>No hay productos registrados en este pedido.</p>";
    return;
  }

  let items = pedido.items;

  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch (error) {
      console.error("Error al interpretar los items del pedido:", error);
      orderProductsList.innerHTML = "<p>No se pudieron leer los productos del pedido.</p>";
      return;
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    orderProductsList.innerHTML = "<p>No hay productos registrados en este pedido.</p>";
    return;
  }

  orderProductsList.innerHTML = `
    <ul style="padding-left: 20px; line-height: 1.9; color: #e5e7eb;">
      ${items.map(item => {
        const nombre = item.nombre || item.name || item.titulo || "Producto";
        const cantidad = item.cantidad || item.quantity || item.qty || 1;
        const precio = item.precio || item.price || item.total || null;

        return `
          <li>
            ${nombre} x${cantidad}
            ${precio !== null ? `- ${formatPrecio(precio)}` : ""}
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

/* Pintar historial sencillo del pedido */
function pintarHistorialPedido(pedido) {
  const orderTimelineContainer = document.getElementById("orderTimelineContainer");

  if (!orderTimelineContainer) return;

  orderTimelineContainer.innerHTML = `
    <div class="timeline-item">
      <span>${formatFechaPedido(pedido.created_at)}</span>
      <h4>Pedido creado</h4>
      <p>El pedido se registró en la tienda.</p>
    </div>

    <div class="timeline-item">
      <span>Estado actual</span>
      <h4>${pedido.estado || "-"}</h4>
      <p>El pedido se encuentra actualmente en estado "${pedido.estado || "-"}".</p>
    </div>
  `;
}

/* Guardar cambio de estado */
async function guardarEstadoPedido() {
  const pedidoId = getPedidoIdFromUrl();
  const pedidoEstadoSelect = document.getElementById("pedidoEstadoSelect");

  if (!pedidoId) {
    alert("No se ha encontrado el ID del pedido.");
    return;
  }

  if (!pedidoEstadoSelect) {
    alert("No se ha encontrado el selector de estado.");
    return;
  }

  const nuevoEstado = pedidoEstadoSelect.value;

  if (!estadosPedido.includes(nuevoEstado)) {
    alert("El estado seleccionado no es válido.");
    return;
  }

  const { error } = await supabaseClient
    .from("vs_pedidos")
    .update({ estado: nuevoEstado })
    .eq("id", pedidoId);

  if (error) {
    console.error("Error al actualizar el estado del pedido:", error);
    alert("Error al actualizar el estado del pedido.");
    return;
  }

  alert("Estado del pedido actualizado correctamente.");

  await cargarPedidoDetalle();
}

/* INIT */
if (ordersTableBody || ordersManagementTableBody) {
  cargarPedidos();
}

if (searchOrder) {
  searchOrder.addEventListener("input", filterOrders);
}

if (orderStatusFilter) {
  orderStatusFilter.addEventListener("change", filterOrders);
}

cargarPedidoDetalle();

/* Hacer accesible la función desde el botón del HTML */
window.guardarEstadoPedido = guardarEstadoPedido;