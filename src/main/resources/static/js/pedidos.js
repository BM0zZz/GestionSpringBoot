/* =========================
   PEDIDOS
========================= */

/* Referencias DOM */
const ordersTableBody = document.getElementById("ordersTableBody");
const ordersManagementTableBody = document.getElementById("ordersManagementTableBody");
const searchOrder = document.getElementById("searchOrder");
const orderStatusFilter = document.getElementById("orderStatusFilter");

/* Render pedidos recientes (dashboard) */
function renderOrdersRecent() {
  if (!ordersTableBody) return;

  const orders = getAllOrders();
  ordersTableBody.innerHTML = "";

  orders.slice(0, 4).forEach((order) => {
    const row = document.createElement("tr");
    row.classList.add("clickable-row");
    row.title = "Ver detalle del pedido";

    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.cliente}</td>
      <td>${order.fecha}</td>
      <td>${order.total}</td>
      <td><span class="${getOrderStatusClass(order.estado)}">${order.estado}</span></td>
    `;

    row.addEventListener("click", () => {
      localStorage.setItem("selectedOrderId", order.id);
      window.location.href = "/pedido-detalle";
    });

    ordersTableBody.appendChild(row);
  });
}

/* Render listado completo de pedidos */
function renderOrdersManagement(data) {
  if (!ordersManagementTableBody) return;

  ordersManagementTableBody.innerHTML = "";

  data.forEach((order) => {
    const row = document.createElement("tr");
    row.classList.add("clickable-row");
    row.title = "Ver detalle de pedido";

    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.cliente}</td>
      <td>${order.fecha}</td>
      <td>${order.total}</td>
      <td><span class="${getOrderStatusClass(order.estado)}">${order.estado}</span></td>
    `;

    row.addEventListener("click", () => {
      localStorage.setItem("selectedOrderId", order.id);
      window.location.href = "/pedido-detalle";
    });

    ordersManagementTableBody.appendChild(row);
  });
}

/* Filtros pedidos */
function filterOrders() {
  if (!searchOrder || !orderStatusFilter) return;

  const allOrders = getAllOrders();
  const searchValue = searchOrder.value.toLowerCase();
  const statusValue = orderStatusFilter.value;

  const filtered = allOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchValue) ||
      order.cliente.toLowerCase().includes(searchValue);

    const matchesStatus = statusValue === "all" || order.estado === statusValue;

    return matchesSearch && matchesStatus;
  });

  renderOrdersManagement(filtered);
}

/* Render detalle pedido */
function renderOrderDetail() {
  const orderContent = document.getElementById("orderContent");
  const noOrderMessage = document.getElementById("noOrderMessage");
  const orderTitle = document.getElementById("orderTitle");
  const pedidoEstadoSelect = document.getElementById("pedidoEstadoSelect");

  if (!orderContent || !noOrderMessage || !orderTitle) return;

  const selectedOrderId = localStorage.getItem("selectedOrderId");

  if (!selectedOrderId) {
    orderContent.style.display = "none";
    noOrderMessage.style.display = "block";
    return;
  }

  const order = getAllOrders().find(item => item.id === selectedOrderId);

  if (!order) {
    orderContent.style.display = "none";
    noOrderMessage.style.display = "block";
    return;
  }

  orderContent.style.display = "block";
  noOrderMessage.style.display = "none";

  orderTitle.textContent = order.id;
  document.getElementById("detailOrderId").textContent = order.id;
  document.getElementById("detailOrderCliente").textContent = order.cliente;
  document.getElementById("detailOrderFecha").textContent = order.fecha;
  document.getElementById("detailOrderTotal").textContent = order.total;
  document.getElementById("detailOrderDireccion").textContent = order.direccion;
  document.getElementById("detailOrderPago").textContent = order.pago;
  document.getElementById("detailOrderIncidencia").textContent = order.incidencia;

  const pedidoEstadoBox = document.getElementById("pedidoEstadoBox");
  if (pedidoEstadoBox) {
    pedidoEstadoBox.innerHTML = `
      <span>Estado</span>
      <span class="${getOrderStatusClass(order.estado)}">${order.estado}</span>
    `;
  }

  if (pedidoEstadoSelect) {
    pedidoEstadoSelect.value = order.estado;
  }

  const orderProductsList = document.getElementById("orderProductsList");
  if (orderProductsList) {
    orderProductsList.innerHTML = `
      <ul style="padding-left: 20px; line-height: 1.9; color: #e5e7eb;">
        ${order.productos.map(producto => `<li>${producto}</li>`).join("")}
      </ul>
    `;
  }

  const orderTimelineContainer = document.getElementById("orderTimelineContainer");
  if (orderTimelineContainer) {
    orderTimelineContainer.innerHTML = order.historial.map(createTimelineItem).join("");
  }
}

/* Guardar cambio de estado */
function guardarEstadoPedido() {
  const selectedOrderId = localStorage.getItem("selectedOrderId");
  const pedidoEstadoSelect = document.getElementById("pedidoEstadoSelect");

  if (!selectedOrderId || !pedidoEstadoSelect) return;

  const nuevoEstado = pedidoEstadoSelect.value;
  const saved = getSavedOrders();
  const savedIndex = saved.findIndex(item => item.id === selectedOrderId);

  if (savedIndex !== -1) {
    if (saved[savedIndex].estado !== nuevoEstado) {
      saved[savedIndex].estado = nuevoEstado;

      saved[savedIndex].historial.push({
        titulo: "Estado actualizado",
        fecha: new Date().toLocaleString(),
        texto: `El pedido ha cambiado a estado "${nuevoEstado}".`
      });

      saveUserOrders(saved);
    }
    renderOrderDetail();
    return;
  }

  const base = baseOrders.find(item => item.id === selectedOrderId);
  if (!base) return;

  const copy = JSON.parse(JSON.stringify(base));

  if (copy.estado !== nuevoEstado) {
    copy.estado = nuevoEstado;

    copy.historial.push({
      titulo: "Estado actualizado",
      fecha: new Date().toLocaleString(),
      texto: `El pedido ha cambiado a estado "${nuevoEstado}".`
    });
  }

  saved.push(copy);
  saveUserOrders(saved);
  renderOrderDetail();
}

/* INIT */
renderOrdersRecent();

if (ordersManagementTableBody) {
  renderOrdersManagement(getAllOrders());
}

if (searchOrder) {
  searchOrder.addEventListener("input", filterOrders);
}

if (orderStatusFilter) {
  orderStatusFilter.addEventListener("change", filterOrders);
}

renderOrderDetail();

window.guardarEstadoPedido = guardarEstadoPedido;