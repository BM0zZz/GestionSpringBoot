/* =========================
   CLIENTES - SUPABASE
========================= */

/* Cliente de Supabase */
const supabaseClient = window.supabaseClient;

/* Referencias al DOM */
const clientesTable = document.getElementById("clientesTable");
const searchCliente = document.getElementById("searchCliente");

/* Array global para guardar los clientes cargados */
let clientes = [];

/* Cargar clientes desde Supabase */
async function cargarClientes() {
  const { data, error } = await supabaseClient
    .from("vs_usuarios")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar clientes:", error);
    alert("Error al cargar los clientes desde Supabase.");
    return;
  }

  clientes = data || [];

  renderClientes(clientes);
  renderClientesStats(clientes);
}

/* Pintar tabla de clientes */
function renderClientes(data) {
  if (!clientesTable) return;

  clientesTable.innerHTML = "";

  if (!data || data.length === 0) {
    clientesTable.innerHTML = `
      <tr>
        <td colspan="5">No hay clientes registrados.</td>
      </tr>
    `;
    return;
  }

  data.forEach(cliente => {
    const nombreCompleto = `${cliente.nombre || ""} ${cliente.apellidos || ""}`.trim();

    const row = document.createElement("tr");

    /*
      Clase para que la fila tenga hover y se note
      que se puede hacer clic sobre ella.
    */
    row.classList.add("clickable-row");

    row.innerHTML = `
      <td>${nombreCompleto || "-"}</td>
      <td>${cliente.email || "-"}</td>
      <td>${cliente.socio_num || "-"}</td>
      <td>${cliente.nivel || "-"}</td>
      <td>${cliente.puntos_disponibles ?? 0}</td>
    `;

    /*
      Al hacer clic en una fila, se abre el detalle del cliente.
      Se pasa el id del cliente por la URL.
    */
    row.addEventListener("click", () => {
      window.location.href = `/cliente-detalle?id=${cliente.id}`;
    });

    clientesTable.appendChild(row);
  });
}

/* Pintar estadísticas de clientes */
function renderClientesStats(clientesData) {
  const total = clientesData.length;

  /*
    Consideramos activos los clientes que tienen email,
    porque son usuarios registrados en la base de datos.
  */
  const activos = clientesData.filter(cliente =>
    cliente.email && cliente.email.trim() !== ""
  ).length;

  /*
    Socios son los clientes que tienen número de socio.
  */
  const socios = clientesData.filter(cliente =>
    cliente.socio_num && cliente.socio_num.trim() !== ""
  ).length;

  /*
    Nuevos este mes según la fecha created_at.
  */
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const anioActual = fechaActual.getFullYear();

  const nuevosMes = clientesData.filter(cliente => {
    if (!cliente.created_at) return false;

    const fechaCliente = new Date(cliente.created_at);

    return (
      fechaCliente.getMonth() === mesActual &&
      fechaCliente.getFullYear() === anioActual
    );
  }).length;

  const totalClientes = document.getElementById("totalClientes");
  const clientesActivos = document.getElementById("clientesActivos");
  const clientesSocios = document.getElementById("clientesSocios");
  const clientesNuevosMes = document.getElementById("clientesNuevosMes");

  if (totalClientes) totalClientes.textContent = total;
  if (clientesActivos) clientesActivos.textContent = activos;
  if (clientesSocios) clientesSocios.textContent = socios;
  if (clientesNuevosMes) clientesNuevosMes.textContent = nuevosMes;
}

/* Filtrar clientes por búsqueda */
function filterClientes() {
  if (!searchCliente) return;

  const search = searchCliente.value.toLowerCase();

  const filtered = clientes.filter(cliente => {
    const nombreCompleto = `${cliente.nombre || ""} ${cliente.apellidos || ""}`.toLowerCase();

    return (
      nombreCompleto.includes(search) ||
      (cliente.email || "").toLowerCase().includes(search) ||
      (cliente.socio_num || "").toLowerCase().includes(search) ||
      (cliente.nivel || "").toLowerCase().includes(search)
    );
  });

  renderClientes(filtered);
}

/* INIT */
if (clientesTable) {
  cargarClientes();
}

/* Evento de búsqueda */
if (searchCliente) {
  searchCliente.addEventListener("input", filterClientes);
}