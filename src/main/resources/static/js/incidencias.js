/* =========================
   DASHBOARD + INCIDENCIAS - SUPABASE
========================= */

/*
  Ojo: en index.html también se carga pedidos.js.
  Por eso aquí no usamos el nombre "supabaseClient" para evitar conflictos
  con otros archivos JS que también lo declaren.
*/
const supabaseIncidenciasClient = window.supabaseClient;

/* Referencias DOM */
const incidentTableBody = document.getElementById("incidentTableBody");
const searchIncident = document.getElementById("searchIncident");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const formIncidencia = document.getElementById("formIncidencia");

/* Arrays globales */
let devoluciones = [];
let usuariosIncidencias = [];
let pedidosIncidencias = [];

/* Estados válidos de devoluciones/incidencias */
const estadosIncidencia = [
  "Pendiente",
  "En revisión",
  "Aprobada",
  "Rechazada"
];

/* Formatear fecha */
function formatFechaIncidencia(fecha) {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

/* Formatear precio */
function formatPrecioIncidencia(valor) {
  if (valor === null || valor === undefined || valor === "") return "-";

  return `${Number(valor).toFixed(2)} €`;
}

/* Acortar UUID para que no ocupe demasiado */
function formatIdIncidencia(id) {
  if (!id) return "-";
  return id.length > 12 ? `${id.substring(0, 8)}...` : id;
}

/* Clase visual según estado */
function getIncidenciaStatusClass(estado) {
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

/* Buscar usuario por ID */
function getUsuarioIncidencia(usuarioId) {
  if (!usuarioId) return null;

  return usuariosIncidencias.find(usuario => usuario.id === usuarioId) || null;
}

/* Obtener nombre visible del cliente */
function getNombreClienteIncidencia(usuarioId) {
  const usuario = getUsuarioIncidencia(usuarioId);

  if (!usuario) {
    return formatIdIncidencia(usuarioId);
  }

  const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim();

  if (nombreCompleto) {
    return nombreCompleto;
  }

  if (usuario.email) {
    return usuario.email;
  }

  return formatIdIncidencia(usuarioId);
}

/* Obtener email del cliente */
function getEmailClienteIncidencia(usuarioId) {
  const usuario = getUsuarioIncidencia(usuarioId);

  if (!usuario) return "-";

  return usuario.email || "-";
}

/* Buscar pedido por ID */
function getPedidoIncidencia(pedidoId) {
  if (!pedidoId) return null;

  return pedidosIncidencias.find(pedido => pedido.id === pedidoId) || null;
}

/* Cargar usuarios */
async function cargarUsuariosIncidencias() {
  const { data, error } = await supabaseIncidenciasClient
    .from("vs_usuarios")
    .select("id, nombre, apellidos, email, created_at");

  if (error) {
    console.error("Error al cargar usuarios para incidencias:", error);
    usuariosIncidencias = [];
    return;
  }

  usuariosIncidencias = data || [];
}

/* Cargar pedidos */
async function cargarPedidosIncidencias() {
  const { data, error } = await supabaseIncidenciasClient
    .from("vs_pedidos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar pedidos para incidencias:", error);
    pedidosIncidencias = [];
    return;
  }

  pedidosIncidencias = data || [];
}

/* Cargar devoluciones/incidencias */
async function cargarIncidencias() {
  await cargarUsuariosIncidencias();
  await cargarPedidosIncidencias();

  const { data, error } = await supabaseIncidenciasClient
    .from("vs_devoluciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar incidencias:", error);
    alert("Error al cargar las incidencias desde Supabase.");
    return;
  }

  devoluciones = data || [];

  renderIncidents(devoluciones);
  renderDashboardStats();
  renderResumenRapido();
}

/* Renderizar tabla de incidencias */
function renderIncidents(data) {
  if (!incidentTableBody) return;

  incidentTableBody.innerHTML = "";

  if (!data || data.length === 0) {
    incidentTableBody.innerHTML = `
      <tr>
        <td colspan="6">No hay incidencias registradas.</td>
      </tr>
    `;
    return;
  }

  data.forEach((incident) => {
    const row = document.createElement("tr");
    row.classList.add("clickable-row");
    row.title = "Ver detalle de incidencia";

    row.innerHTML = `
      <td>${formatIdIncidencia(incident.id)}</td>
      <td>${getNombreClienteIncidencia(incident.usuario_id)}</td>
      <td>${formatIdIncidencia(incident.pedido_id)}</td>
      <td>${incident.motivo || "-"}</td>
      <td><span class="${getIncidenciaStatusClass(incident.estado)}">${incident.estado || "-"}</span></td>
      <td>${formatFechaIncidencia(incident.created_at)}</td>
    `;

    row.addEventListener("click", () => {
      window.location.href = `/incidencia?id=${incident.id}`;
    });

    incidentTableBody.appendChild(row);
  });
}

/* Filtros de incidencias */
function filterIncidents() {
  if (!searchIncident || !statusFilter || !priorityFilter) return;

  const searchValue = searchIncident.value.toLowerCase();
  const statusValue = statusFilter.value;
  const motivoValue = priorityFilter.value;

  const filtered = devoluciones.filter((incident) => {
    const id = incident.id || "";
    const pedidoId = incident.pedido_id || "";
    const motivo = incident.motivo || "";
    const estado = incident.estado || "";
    const clienteVisible = getNombreClienteIncidencia(incident.usuario_id);
    const emailCliente = getEmailClienteIncidencia(incident.usuario_id);

    const matchesSearch =
      id.toLowerCase().includes(searchValue) ||
      pedidoId.toLowerCase().includes(searchValue) ||
      motivo.toLowerCase().includes(searchValue) ||
      clienteVisible.toLowerCase().includes(searchValue) ||
      emailCliente.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusValue === "all" || estado === statusValue;

    const matchesMotivo =
      motivoValue === "all" || motivo === motivoValue;

    return matchesSearch && matchesStatus && matchesMotivo;
  });

  renderIncidents(filtered);
}

/* Pintar estadísticas del dashboard */
function renderDashboardStats() {
  const totalPedidos = pedidosIncidencias.length;

  const pedidosPendientes = pedidosIncidencias.filter(pedido =>
    pedido.estado === "En preparación" ||
    pedido.estado === "Procesando"
  ).length;

  const incidenciasAbiertas = devoluciones.filter(inc =>
    inc.estado === "Pendiente" ||
    inc.estado === "En revisión"
  ).length;

  const incidenciasPendientes = devoluciones.filter(inc =>
    inc.estado === "Pendiente"
  ).length;

  const clientesActivos = usuariosIncidencias.length;

  const fechaActual = new Date();
  const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);

  const pedidosMes = pedidosIncidencias.filter(pedido => {
    if (!pedido.created_at) return false;

    const fechaPedido = new Date(pedido.created_at);
    return fechaPedido >= inicioMes && fechaPedido <= fechaActual;
  }).length;

  const haceSieteDias = new Date();
  haceSieteDias.setDate(fechaActual.getDate() - 7);

  const clientesSemana = usuariosIncidencias.filter(usuario => {
    if (!usuario.created_at) return false;

    const fechaUsuario = new Date(usuario.created_at);
    return fechaUsuario >= haceSieteDias && fechaUsuario <= fechaActual;
  }).length;

  const dashboardTotalPedidos = document.getElementById("dashboardTotalPedidos");
  const dashboardPedidosMes = document.getElementById("dashboardPedidosMes");
  const dashboardPedidosPendientes = document.getElementById("dashboardPedidosPendientes");
  const dashboardPedidosRevision = document.getElementById("dashboardPedidosRevision");
  const dashboardIncidenciasAbiertas = document.getElementById("dashboardIncidenciasAbiertas");
  const dashboardIncidenciasPendientes = document.getElementById("dashboardIncidenciasPendientes");
  const dashboardClientesActivos = document.getElementById("dashboardClientesActivos");
  const dashboardClientesSemana = document.getElementById("dashboardClientesSemana");

  if (dashboardTotalPedidos) dashboardTotalPedidos.textContent = totalPedidos;
  if (dashboardPedidosMes) dashboardPedidosMes.textContent = `${pedidosMes} este mes`;
  if (dashboardPedidosPendientes) dashboardPedidosPendientes.textContent = pedidosPendientes;
  if (dashboardPedidosRevision) dashboardPedidosRevision.textContent = `${pedidosPendientes} requieren revisión`;
  if (dashboardIncidenciasAbiertas) dashboardIncidenciasAbiertas.textContent = incidenciasAbiertas;
  if (dashboardIncidenciasPendientes) dashboardIncidenciasPendientes.textContent = `${incidenciasPendientes} pendientes`;
  if (dashboardClientesActivos) dashboardClientesActivos.textContent = clientesActivos;
  if (dashboardClientesSemana) dashboardClientesSemana.textContent = `${clientesSemana} esta semana`;
}

/* Pintar resumen rápido */
function renderResumenRapido() {
  const pendientes = devoluciones.filter(inc =>
    inc.estado === "Pendiente"
  ).length;

  const pedidosPreparacion = pedidosIncidencias.filter(pedido =>
    pedido.estado === "En preparación"
  ).length;

  const pedidosCamino = pedidosIncidencias.filter(pedido =>
    pedido.estado === "En camino"
  ).length;

  const clientesConDevoluciones = new Set(
    devoluciones
      .filter(inc => inc.usuario_id)
      .map(inc => inc.usuario_id)
  ).size;

  const summaryIncidenciasPendientes = document.getElementById("summaryIncidenciasPendientes");
  const summaryPedidosPreparacion = document.getElementById("summaryPedidosPreparacion");
  const summaryPedidosCamino = document.getElementById("summaryPedidosCamino");
  const summaryClientesDevoluciones = document.getElementById("summaryClientesDevoluciones");

  if (summaryIncidenciasPendientes) {
    summaryIncidenciasPendientes.textContent =
      `${pendientes} solicitudes pendientes de revisión.`;
  }

  if (summaryPedidosPreparacion) {
    summaryPedidosPreparacion.textContent =
      `${pedidosPreparacion} pedidos pendientes de preparar.`;
  }

  if (summaryPedidosCamino) {
    summaryPedidosCamino.textContent =
      `${pedidosCamino} pedidos están actualmente en camino.`;
  }

  if (summaryClientesDevoluciones) {
    summaryClientesDevoluciones.textContent =
      `${clientesConDevoluciones} clientes han abierto alguna devolución.`;
  }
}

/* Obtener ID de incidencia desde la URL */
function getIncidenciaIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/* Render detalle de incidencia */
async function renderIncidentDetail() {
  const incidentTitle = document.getElementById("incidentTitle");
  const incidentContent = document.getElementById("incidentContent");
  const noIncidentMessage = document.getElementById("noIncidentMessage");
  const estadoSelect = document.getElementById("estadoSelect");

  if (!incidentTitle || !incidentContent || !noIncidentMessage) return;

  await cargarUsuariosIncidencias();
  await cargarPedidosIncidencias();

  const selectedId = getIncidenciaIdFromUrl();

  if (!selectedId) {
    incidentContent.style.display = "none";
    noIncidentMessage.style.display = "block";
    return;
  }

  const { data: incident, error } = await supabaseIncidenciasClient
    .from("vs_devoluciones")
    .select("*")
    .eq("id", selectedId)
    .single();

  if (error || !incident) {
    console.error("Error al cargar el detalle de la incidencia:", error);

    incidentContent.style.display = "none";
    noIncidentMessage.style.display = "block";
    return;
  }

  incidentContent.style.display = "block";
  noIncidentMessage.style.display = "none";

  const cliente = getNombreClienteIncidencia(incident.usuario_id);
  const email = getEmailClienteIncidencia(incident.usuario_id);
  const pedido = getPedidoIncidencia(incident.pedido_id);

  const detailId = document.getElementById("detailId");
  const detailCliente = document.getElementById("detailCliente");
  const detailPedido = document.getElementById("detailPedido");
  const detailTipo = document.getElementById("detailTipo");
  const detailDescripcion = document.getElementById("detailDescripcion");
  const detailFecha = document.getElementById("detailFecha");
  const detailResponsable = document.getElementById("detailResponsable");

  if (detailId) detailId.textContent = incident.id || "-";

  if (detailCliente) {
    detailCliente.textContent = email !== "-"
      ? `${cliente} (${email})`
      : cliente;
  }

  if (detailPedido) detailPedido.textContent = incident.pedido_id || "-";
  if (detailTipo) detailTipo.textContent = incident.motivo || "-";
  if (detailDescripcion) detailDescripcion.textContent = incident.descripcion || "Sin descripción";
  if (detailFecha) detailFecha.textContent = formatFechaIncidencia(incident.created_at);
  if (detailResponsable) detailResponsable.textContent = "Sin asignar";

  incidentTitle.textContent = `Incidencia ${formatIdIncidencia(incident.id)}`;

  const priorityBox = document.getElementById("priorityBox");
  const statusBox = document.getElementById("statusBox");
  const timelineContainer = document.getElementById("timelineContainer");

  if (priorityBox) {
    priorityBox.innerHTML = `
      <span>Motivo</span>
      <strong>${incident.motivo || "-"}</strong>
    `;
  }

  if (statusBox) {
    statusBox.innerHTML = `
      <span>Estado</span>
      <span class="${getIncidenciaStatusClass(incident.estado)}">${incident.estado || "-"}</span>
    `;
  }

  if (estadoSelect) {
    estadoSelect.value = incident.estado || "Pendiente";
  }

  if (timelineContainer) {
    timelineContainer.innerHTML = `
      <div class="timeline-item">
        <span>${formatFechaIncidencia(incident.created_at)}</span>
        <h4>Incidencia creada</h4>
        <p>La devolución se registró en la tienda.</p>
      </div>

      <div class="timeline-item">
        <span>Estado actual</span>
        <h4>${incident.estado || "-"}</h4>
        <p>La incidencia se encuentra actualmente en estado "${incident.estado || "-"}".</p>
      </div>
    `;
  }

  const detailOrderTotal = document.getElementById("detailOrderTotal");
  const detailOrderEstado = document.getElementById("detailOrderEstado");

  if (detailOrderTotal && pedido) detailOrderTotal.textContent = formatPrecioIncidencia(pedido.total);
  if (detailOrderEstado && pedido) detailOrderEstado.textContent = pedido.estado || "-";
}

/* Guardar cambio de estado */
async function guardarEstado() {
  const selectedId = getIncidenciaIdFromUrl();
  const estadoSelect = document.getElementById("estadoSelect");

  if (!selectedId) {
    alert("No se ha encontrado el ID de la incidencia.");
    return;
  }

  if (!estadoSelect) {
    alert("No se ha encontrado el selector de estado.");
    return;
  }

  const nuevoEstado = estadoSelect.value;

  if (!estadosIncidencia.includes(nuevoEstado)) {
    alert("El estado seleccionado no es válido.");
    return;
  }

  const { error } = await supabaseIncidenciasClient
    .from("vs_devoluciones")
    .update({ estado: nuevoEstado })
    .eq("id", selectedId);

  if (error) {
    console.error("Error al actualizar el estado de la incidencia:", error);
    alert("Error al actualizar el estado de la incidencia.");
    return;
  }

  alert("Estado actualizado correctamente.");

  await renderIncidentDetail();
}

/* Formulario nueva incidencia */
function bindNuevaIncidenciaForm() {
  if (!formIncidencia) return;

  formIncidencia.addEventListener("submit", async function (e) {
    e.preventDefault();

    const pedidoInput = document.getElementById("pedido");
    const motivoInput = document.getElementById("tipo");
    const descripcionInput = document.getElementById("descripcion");
    const estadoInput = document.getElementById("estado");

    if (!pedidoInput || !motivoInput || !descripcionInput) {
      alert("Faltan campos en el formulario de nueva incidencia.");
      return;
    }

    const pedidoId = pedidoInput.value.trim();
    const motivo = motivoInput.value.trim();
    const descripcion = descripcionInput.value.trim();

    if (!pedidoId) {
      alert("Debes indicar el pedido asociado.");
      return;
    }

    if (!motivo) {
      alert("Debes indicar el motivo de la incidencia.");
      return;
    }

    const { data: pedido, error: pedidoError } = await supabaseIncidenciasClient
      .from("vs_pedidos")
      .select("id, usuario_id")
      .eq("id", pedidoId)
      .single();

    if (pedidoError || !pedido) {
      console.error("Error al buscar el pedido:", pedidoError);
      alert("No se ha encontrado el pedido indicado.");
      return;
    }

    const nuevaIncidencia = {
      usuario_id: pedido.usuario_id,
      pedido_id: pedido.id,
      motivo: motivo,
      descripcion: descripcion || null,
      estado: estadoInput ? estadoInput.value : "Pendiente"
    };

    const { error } = await supabaseIncidenciasClient
      .from("vs_devoluciones")
      .insert([nuevaIncidencia]);

    if (error) {
      console.error("Error al crear la incidencia:", error);
      alert("Error al crear la incidencia.");
      return;
    }

    alert("Incidencia creada correctamente.");
    window.location.href = "/";
  });
}

/* INIT */
if (incidentTableBody) {
  cargarIncidencias();
}

if (searchIncident) {
  searchIncident.addEventListener("input", filterIncidents);
}

if (statusFilter) {
  statusFilter.addEventListener("change", filterIncidents);
}

if (priorityFilter) {
  priorityFilter.addEventListener("change", filterIncidents);
}

renderIncidentDetail();
bindNuevaIncidenciaForm();

/* Hacer accesible la función desde el botón del HTML */
window.guardarEstado = guardarEstado;