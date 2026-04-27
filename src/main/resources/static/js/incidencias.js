/* =========================
   DASHBOARD + INCIDENCIAS
========================= */

/* Referencias DOM */
const incidentTableBody = document.getElementById("incidentTableBody");
const searchIncident = document.getElementById("searchIncident");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const formIncidencia = document.getElementById("formIncidencia");

/* Renderizar tabla de incidencias */
function renderIncidents(data) {
  if (!incidentTableBody) return;

  incidentTableBody.innerHTML = "";

  data.forEach((incident) => {
    const row = document.createElement("tr");
    row.classList.add("clickable-row");
    row.title = "Ver detalle de incidencia";

    row.innerHTML = `
      <td>${incident.id}</td>
      <td>${incident.cliente}</td>
      <td>${incident.pedido}</td>
      <td>${incident.tipo}</td>
      <td><span class="${getPriorityClass(incident.prioridad)}">${incident.prioridad}</span></td>
      <td><span class="${getStatusClass(incident.estado)}">${incident.estado}</span></td>
      <td>${incident.fecha}</td>
    `;

    row.addEventListener("click", () => {
      localStorage.setItem("selectedIncidentId", incident.id);
      window.location.href = "/incidencia";
    });

    incidentTableBody.appendChild(row);
  });
}

/* Filtros de incidencias */
function filterIncidents() {
  if (!searchIncident || !statusFilter || !priorityFilter) return;

  const allIncidents = getAllIncidents();
  const searchValue = searchIncident.value.toLowerCase();
  const statusValue = statusFilter.value;
  const priorityValue = priorityFilter.value;

  const filtered = allIncidents.filter((incident) => {
    const matchesSearch =
      incident.id.toLowerCase().includes(searchValue) ||
      incident.cliente.toLowerCase().includes(searchValue);

    const matchesStatus = statusValue === "all" || incident.estado === statusValue;
    const matchesPriority = priorityValue === "all" || incident.prioridad === priorityValue;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  renderIncidents(filtered);
}

/* Render detalle de incidencia */
function renderIncidentDetail() {
  const incidentTitle = document.getElementById("incidentTitle");
  const incidentContent = document.getElementById("incidentContent");
  const noIncidentMessage = document.getElementById("noIncidentMessage");
  const estadoSelect = document.getElementById("estadoSelect");

  if (!incidentTitle || !incidentContent || !noIncidentMessage) return;

  const selectedId = localStorage.getItem("selectedIncidentId");

  if (!selectedId) {
    incidentContent.style.display = "none";
    noIncidentMessage.style.display = "block";
    return;
  }

  const incident = getAllIncidents().find(item => item.id === selectedId);

  if (!incident) {
    incidentContent.style.display = "none";
    noIncidentMessage.style.display = "block";
    return;
  }

  incidentContent.style.display = "block";
  noIncidentMessage.style.display = "none";

  document.getElementById("detailId").textContent = incident.id;
  document.getElementById("detailCliente").textContent = incident.cliente;
  document.getElementById("detailPedido").textContent = incident.pedido;
  document.getElementById("detailTipo").textContent = incident.tipo;
  document.getElementById("detailDescripcion").textContent = incident.descripcion;
  document.getElementById("detailFecha").textContent = incident.fecha;
  document.getElementById("detailResponsable").textContent = incident.responsable;
  incidentTitle.textContent = incident.id;

  const priorityBox = document.getElementById("priorityBox");
  const statusBox = document.getElementById("statusBox");
  const timelineContainer = document.getElementById("timelineContainer");

  if (priorityBox) {
    priorityBox.innerHTML = `
      <span>Prioridad</span>
      <span class="${getPriorityClass(incident.prioridad)}">${incident.prioridad}</span>
    `;
  }

  if (statusBox) {
    statusBox.innerHTML = `
      <span>Estado</span>
      <span class="${getStatusClass(incident.estado)}">${incident.estado}</span>
    `;
  }

  if (estadoSelect) {
    estadoSelect.value = incident.estado;
  }

  if (timelineContainer) {
    timelineContainer.innerHTML = incident.historial.map(createTimelineItem).join("");
  }
}

/* Guardar cambio de estado */
function guardarEstado() {
  const selectedId = localStorage.getItem("selectedIncidentId");
  const estadoSelect = document.getElementById("estadoSelect");

  if (!selectedId || !estadoSelect) return;

  const nuevoEstado = estadoSelect.value;
  const saved = getSavedIncidents();
  const savedIndex = saved.findIndex(item => item.id === selectedId);

  if (savedIndex !== -1) {
    if (saved[savedIndex].estado !== nuevoEstado) {
      saved[savedIndex].estado = nuevoEstado;

      saved[savedIndex].historial.push({
        titulo: "Estado actualizado",
        fecha: new Date().toLocaleString(),
        texto: `La incidencia ha cambiado a estado "${nuevoEstado}".`
      });

      saveUserIncidents(saved);
    }
    renderIncidentDetail();
    return;
  }

  const base = baseIncidents.find(item => item.id === selectedId);
  if (!base) return;

  const copy = JSON.parse(JSON.stringify(base));

  if (copy.estado !== nuevoEstado) {
    copy.estado = nuevoEstado;

    copy.historial.push({
      titulo: "Estado actualizado",
      fecha: new Date().toLocaleString(),
      texto: `La incidencia ha cambiado a estado "${nuevoEstado}".`
    });
  }

  saved.push(copy);
  saveUserIncidents(saved);
  renderIncidentDetail();
}

/* Formulario nueva incidencia */
function bindNuevaIncidenciaForm() {
  if (!formIncidencia) return;

  formIncidencia.addEventListener("submit", function (e) {
    e.preventDefault();

    const saved = getSavedIncidents();

    const nueva = {
      id: "INC-" + Math.floor(Math.random() * 10000),
      cliente: document.getElementById("cliente").value,
      pedido: document.getElementById("pedido").value,
      tipo: document.getElementById("tipo").value,
      prioridad: document.getElementById("prioridad").value,
      estado: "Abierta",
      fecha: new Date().toLocaleDateString(),
      descripcion: document.getElementById("descripcion").value,
      responsable: document.getElementById("responsable").value || "Sin asignar",
      historial: [
        {
          titulo: "Incidencia creada",
          fecha: new Date().toLocaleString(),
          texto: "Incidencia registrada desde el sistema."
        }
      ]
    };

    saved.push(nueva);
    saveUserIncidents(saved);

    localStorage.setItem("selectedIncidentId", nueva.id);
    window.location.href = "/";
  });
}

/* INIT */
if (incidentTableBody) {
  renderIncidents(getAllIncidents());
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

window.guardarEstado = guardarEstado;