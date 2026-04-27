/* =========================
   CLIENTES
========================= */

/* Referencias al DOM */
const clientesTable = document.getElementById("clientesTable");
const searchCliente = document.getElementById("searchCliente");

/* Obtener lista de clientes a partir de pedidos e incidencias */
function getClientes() {
  const orders = getAllOrders(); // obtiene pedidos
  const incidents = getAllIncidents(); // obtiene incidencias
  const clientesMap = {}; // objeto para agrupar clientes

  /* Recorrer pedidos */
  orders.forEach(order => {
    if (!clientesMap[order.cliente]) {
      clientesMap[order.cliente] = {
        nombre: order.cliente,
        email: order.cliente.toLowerCase().replace(/\s+/g, ".") + "@gmail.com", // generar email fake
        pedidos: 0,
        incidencias: 0
      };
    }
    clientesMap[order.cliente].pedidos++; // sumar pedido
  });

  /* Recorrer incidencias */
  incidents.forEach(inc => {
    if (!clientesMap[inc.cliente]) {
      clientesMap[inc.cliente] = {
        nombre: inc.cliente,
        email: inc.cliente.toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
        pedidos: 0,
        incidencias: 0
      };
    }
    clientesMap[inc.cliente].incidencias++; // sumar incidencia
  });

  return Object.values(clientesMap); // devolver array de clientes
}

/* Pintar tabla de clientes */
function renderClientes(data) {
  if (!clientesTable) return; // evitar error si no existe

  clientesTable.innerHTML = ""; // limpiar tabla

  data.forEach(cliente => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${cliente.nombre}</td>
      <td>${cliente.email}</td>
      <td>${cliente.pedidos}</td>
      <td>${cliente.incidencias}</td>
    `;
    clientesTable.appendChild(row); // añadir fila
  });
}

/* Pintar estadísticas de clientes */
function renderClientesStats(clientes) {
  const total = clientes.length; // total clientes
  const activos = clientes.filter(c => c.pedidos > 0).length; // con pedidos
  const conInc = clientes.filter(c => c.incidencias > 0).length; // con incidencias

  const totalClientes = document.getElementById("totalClientes");
  const clientesActivos = document.getElementById("clientesActivos");
  const clientesIncidencias = document.getElementById("clientesIncidencias");

  if (totalClientes) totalClientes.textContent = total;
  if (clientesActivos) clientesActivos.textContent = activos;
  if (clientesIncidencias) clientesIncidencias.textContent = conInc;
}

/* Filtrar clientes por búsqueda */
function filterClientes() {
  if (!searchCliente) return;

  const clientes = getClientes();
  const search = searchCliente.value.toLowerCase(); // texto buscado

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search) ||
    c.email.toLowerCase().includes(search)
  );

  renderClientes(filtered); // renderizar filtrados
}

/* INIT */
const clientes = getClientes(); // obtener clientes
renderClientes(clientes); // pintar tabla
renderClientesStats(clientes); // pintar estadísticas

/* Evento de búsqueda */
if (searchCliente) {
  searchCliente.addEventListener("input", filterClientes);
}