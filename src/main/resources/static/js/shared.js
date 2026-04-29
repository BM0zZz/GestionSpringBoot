/* =========================
   DATOS BASE COMPARTIDOS
========================= */

/* Incidencias base del sistema */
const baseIncidents = [
  {
    id: "INC-001",
    cliente: "Laura Martínez",
    pedido: "PED-3021",
    tipo: "Producto dañado",
    prioridad: "Urgente",
    estado: "Abierta",
    fecha: "23/03/2026",
    descripcion: "El cliente indica que el vinilo llegó con la funda exterior dañada y una ligera deformación en una de las esquinas. Solicita revisión del pedido y posible reemplazo del producto.",
    responsable: "Marina López",
    historial: [
      {
        titulo: "Incidencia creada",
        fecha: "23/03/2026 - 09:14",
        texto: "El cliente reporta daño en el producto recibido."
      },
      {
        titulo: "Asignación a soporte",
        fecha: "23/03/2026 - 09:32",
        texto: "El caso se asigna al equipo de postventa."
      },
      {
        titulo: "Solicitud de información",
        fecha: "23/03/2026 - 10:05",
        texto: "Se solicitan imágenes del producto al cliente."
      }
    ]
  },
  {
    id: "INC-002",
    cliente: "Carlos Pérez",
    pedido: "PED-3017",
    tipo: "Error de envío",
    prioridad: "Alta",
    estado: "En revisión",
    fecha: "22/03/2026",
    descripcion: "El cliente informa de que la dirección de entrega mostrada en el seguimiento no coincide con la dirección introducida en el pedido.",
    responsable: "Sergio Díaz",
    historial: [
      {
        titulo: "Incidencia registrada",
        fecha: "22/03/2026 - 11:20",
        texto: "Se detecta un posible problema en la dirección del envío."
      },
      {
        titulo: "Revisión logística",
        fecha: "22/03/2026 - 12:10",
        texto: "El caso pasa al área logística para revisar el estado del transporte."
      }
    ]
  },
  {
    id: "INC-003",
    cliente: "Marta Gómez",
    pedido: "PED-3009",
    tipo: "Devolución",
    prioridad: "Media",
    estado: "Resuelta",
    fecha: "21/03/2026",
    descripcion: "La clienta solicitó la devolución del pedido al haber recibido una edición distinta a la esperada. El proceso ya ha sido aceptado.",
    responsable: "Lucía Herrera",
    historial: [
      {
        titulo: "Solicitud recibida",
        fecha: "21/03/2026 - 08:50",
        texto: "La clienta solicita devolución del producto recibido."
      },
      {
        titulo: "Devolución aprobada",
        fecha: "21/03/2026 - 13:25",
        texto: "El equipo valida la solicitud y envía instrucciones para la devolución."
      },
      {
        titulo: "Caso resuelto",
        fecha: "21/03/2026 - 16:40",
        texto: "La incidencia queda resuelta a la espera de recepción en almacén."
      }
    ]
  },
  {
    id: "INC-004",
    cliente: "Iván Romero",
    pedido: "PED-2998",
    tipo: "Pago duplicado",
    prioridad: "Alta",
    estado: "Abierta",
    fecha: "20/03/2026",
    descripcion: "El cliente detecta dos cargos en su cuenta bancaria asociados al mismo pedido y solicita regularización del importe cobrado.",
    responsable: "Paula Martín",
    historial: [
      {
        titulo: "Incidencia abierta",
        fecha: "20/03/2026 - 16:40",
        texto: "El cliente comunica un posible doble cobro."
      },
      {
        titulo: "Pendiente de validación",
        fecha: "20/03/2026 - 17:05",
        texto: "Se revisa la operación con el área de facturación."
      }
    ]
  },
  {
    id: "INC-005",
    cliente: "Sara López",
    pedido: "PED-2985",
    tipo: "Consulta general",
    prioridad: "Baja",
    estado: "Cerrada",
    fecha: "19/03/2026",
    descripcion: "La cliente solicitó información sobre los plazos estimados de reposición de una edición agotada.",
    responsable: "Marcos Gil",
    historial: [
      {
        titulo: "Consulta recibida",
        fecha: "19/03/2026 - 10:15",
        texto: "La clienta consulta la reposición de un producto sin stock."
      },
      {
        titulo: "Respuesta enviada",
        fecha: "19/03/2026 - 11:00",
        texto: "Se responde con la previsión aproximada de reposición."
      },
      {
        titulo: "Incidencia cerrada",
        fecha: "19/03/2026 - 11:18",
        texto: "La consulta se da por cerrada tras enviar la información."
      }
    ]
  },
  {
    id: "INC-006",
    cliente: "Daniel Ruiz",
    pedido: "PED-3024",
    tipo: "Producto incorrecto",
    prioridad: "Urgente",
    estado: "En revisión",
    fecha: "23/03/2026",
    descripcion: "El cliente recibió un disco distinto al solicitado en el pedido. Se está comprobando el error en la preparación del envío.",
    responsable: "Andrea Soto",
    historial: [
      {
        titulo: "Incidencia notificada",
        fecha: "23/03/2026 - 09:48",
        texto: "El cliente comunica recepción de producto incorrecto."
      },
      {
        titulo: "Caso en revisión",
        fecha: "23/03/2026 - 10:22",
        texto: "Se revisa el picking del pedido en almacén."
      },
      {
        titulo: "Esperando confirmación",
        fecha: "23/03/2026 - 11:05",
        texto: "Se solicita comprobación del lote preparado."
      }
    ]
  }
];

/* Pedidos base del sistema */
const baseOrders = [
  {
    id: "PED-3024",
    cliente: "Daniel Ruiz",
    fecha: "23/03/2026",
    total: "54,99 €",
    estado: "Pendiente",
    direccion: "Calle Alcalá 112, Madrid",
    pago: "Tarjeta",
    incidencia: "INC-006",
    productos: ["Hybrid Theory - Linkin Park", "Nevermind - Nirvana"],
    historial: [
      {
        titulo: "Pedido registrado",
        fecha: "23/03/2026 - 09:10",
        texto: "El pedido se ha creado correctamente en el sistema."
      },
      {
        titulo: "Pendiente de preparación",
        fecha: "23/03/2026 - 09:30",
        texto: "El pedido está pendiente de revisión en almacén."
      }
    ]
  },
  {
    id: "PED-3023",
    cliente: "Lucía Navarro",
    fecha: "23/03/2026",
    total: "89,50 €",
    estado: "Pagado",
    direccion: "Avenida del Sur 8, Valencia",
    pago: "PayPal",
    incidencia: "Sin incidencia",
    productos: ["Back to Black - Amy Winehouse", "AM - Arctic Monkeys"],
    historial: [
      {
        titulo: "Pedido pagado",
        fecha: "23/03/2026 - 10:20",
        texto: "El pago del pedido se ha confirmado correctamente."
      }
    ]
  },
  {
    id: "PED-3022",
    cliente: "Andrés Moreno",
    fecha: "22/03/2026",
    total: "34,99 €",
    estado: "Enviado",
    direccion: "Calle Mar 41, Cádiz",
    pago: "Tarjeta",
    incidencia: "Sin incidencia",
    productos: ["Random Access Memories - Daft Punk"],
    historial: [
      {
        titulo: "Pedido preparado",
        fecha: "22/03/2026 - 12:00",
        texto: "El pedido ha sido preparado en almacén."
      },
      {
        titulo: "Pedido enviado",
        fecha: "22/03/2026 - 16:15",
        texto: "El pedido ha salido del almacén con destino al cliente."
      }
    ]
  },
  {
    id: "PED-3021",
    cliente: "Laura Martínez",
    fecha: "22/03/2026",
    total: "64,00 €",
    estado: "Entregado",
    direccion: "Calle Mayor 22, Toledo",
    pago: "Tarjeta",
    incidencia: "INC-001",
    productos: ["The Dark Side of the Moon - Pink Floyd", "Abbey Road - The Beatles"],
    historial: [
      {
        titulo: "Pedido entregado",
        fecha: "22/03/2026 - 18:45",
        texto: "El pedido ha sido entregado al cliente."
      }
    ]
  },
  {
    id: "PED-2998",
    cliente: "Iván Romero",
    fecha: "20/03/2026",
    total: "72,50 €",
    estado: "Pagado",
    direccion: "Calle Prado 17, Sevilla",
    pago: "Transferencia",
    incidencia: "INC-004",
    productos: ["Ten - Pearl Jam", "OK Computer - Radiohead"],
    historial: [
      {
        titulo: "Pago registrado",
        fecha: "20/03/2026 - 16:00",
        texto: "Se ha confirmado el pago del pedido."
      }
    ]
  }
];

/* Productos base del sistema */
const baseProducts = [
  {
    sku: "VIN-001",
    nombre: "Hybrid Theory",
    artista: "Linkin Park",
    genero: "Rock",
    precio: 29.99,
    stock: 12,
    descripcion: "Álbum debut icónico de Linkin Park en edición vinilo.",
    fechaActualizacion: "23/03/2026",
    historial: [
      {
        titulo: "Producto registrado",
        fecha: "20/03/2026 - 10:00",
        texto: "Se añadió el producto al catálogo."
      }
    ]
  },
  {
    sku: "VIN-002",
    nombre: "Nevermind",
    artista: "Nirvana",
    genero: "Grunge",
    precio: 27.50,
    stock: 3,
    descripcion: "Uno de los discos más influyentes del grunge.",
    fechaActualizacion: "22/03/2026",
    historial: [
      {
        titulo: "Stock actualizado",
        fecha: "22/03/2026 - 12:40",
        texto: "El stock se redujo tras varias ventas."
      }
    ]
  },
  {
    sku: "VIN-003",
    nombre: "Back to Black",
    artista: "Amy Winehouse",
    genero: "Soul",
    precio: 31.0,
    stock: 0,
    descripcion: "Álbum emblemático de Amy Winehouse en vinilo.",
    fechaActualizacion: "21/03/2026",
    historial: [
      {
        titulo: "Producto agotado",
        fecha: "21/03/2026 - 18:15",
        texto: "El producto ha quedado sin stock."
      }
    ]
  },
  {
    sku: "VIN-004",
    nombre: "AM",
    artista: "Arctic Monkeys",
    genero: "Indie Rock",
    precio: 26.99,
    stock: 8,
    descripcion: "Uno de los discos más populares de Arctic Monkeys.",
    fechaActualizacion: "23/03/2026",
    historial: [
      {
        titulo: "Stock revisado",
        fecha: "23/03/2026 - 09:20",
        texto: "Se ha revisado el stock disponible."
      }
    ]
  },
  {
    sku: "VIN-005",
    nombre: "OK Computer",
    artista: "Radiohead",
    genero: "Alternative",
    precio: 33.5,
    stock: 2,
    descripcion: "Edición vinilo de uno de los mejores álbumes de Radiohead.",
    fechaActualizacion: "20/03/2026",
    historial: [
      {
        titulo: "Stock bajo detectado",
        fecha: "20/03/2026 - 17:30",
        texto: "Quedan pocas unidades del producto."
      }
    ]
  }
];

/* =========================
   HELPERS LOCALSTORAGE
========================= */

/* Obtener incidencias guardadas */
function getSavedIncidents() {
  return JSON.parse(localStorage.getItem("incidencias")) || [];
}

/* Guardar incidencias */
function saveUserIncidents(updated) {
  localStorage.setItem("incidencias", JSON.stringify(updated));
}

/* Mezclar incidencias base y guardadas */
function getAllIncidents() {
  const saved = getSavedIncidents();
  const savedIds = new Set(saved.map(item => item.id));
  const baseFiltered = baseIncidents.filter(item => !savedIds.has(item.id));
  return [...baseFiltered, ...saved];
}

/* Obtener pedidos guardados */
function getSavedOrders() {
  return JSON.parse(localStorage.getItem("pedidos")) || [];
}

/* Guardar pedidos */
function saveUserOrders(updated) {
  localStorage.setItem("pedidos", JSON.stringify(updated));
}

/* Mezclar pedidos base y guardados */
function getAllOrders() {
  const saved = getSavedOrders();
  const savedIds = new Set(saved.map(item => item.id));
  const baseFiltered = baseOrders.filter(item => !savedIds.has(item.id));
  return [...baseFiltered, ...saved];
}

/* Obtener productos guardados */
function getSavedProducts() {
  return JSON.parse(localStorage.getItem("productos")) || [];
}

/* Guardar productos */
function saveUserProducts(updated) {
  localStorage.setItem("productos", JSON.stringify(updated));
}

/* Mezclar productos base y guardados */
function getAllProducts() {
  const saved = getSavedProducts();
  const savedSkus = new Set(saved.map(item => item.sku));
  const baseFiltered = baseProducts.filter(item => !savedSkus.has(item.sku));
  return [...baseFiltered, ...saved];
}

/* =========================
   HELPERS VISUALES
========================= */

/* Clase CSS para estado de incidencia */
function getStatusClass(status) {
  switch (status) {
    case "Abierta":
      return "badge badge-open";
    case "En revisión":
      return "badge badge-review";
    case "Resuelta":
      return "badge badge-resolved";
    case "Cerrada":
      return "badge badge-closed";
    default:
      return "badge";
  }
}

/* Clase CSS para prioridad */
function getPriorityClass(priority) {
  switch (priority) {
    case "Baja":
      return "badge badge-low";
    case "Media":
      return "badge badge-medium";
    case "Alta":
      return "badge badge-high";
    case "Urgente":
      return "badge badge-urgent";
    default:
      return "badge";
  }
}

/* Clase CSS para estado de pedido */
function getOrderStatusClass(status) {
  switch (status) {
    case "Pendiente":
      return "badge badge-pending";
    case "Pagado":
      return "badge badge-paid";
    case "Enviado":
      return "badge badge-shipped";
    case "Entregado":
      return "badge badge-delivered";
    case "Cancelado":
      return "badge badge-open";
    default:
      return "badge";
  }
}

/* Texto de estado según stock */
function getProductStatus(stock) {
  if (stock === 0) return "Agotado";
  if (stock < 5) return "Stock bajo";
  return "Disponible";
}

/* Clase CSS para estado de producto */
function getProductStatusClass(status) {
  switch (status) {
    case "Disponible":
      return "badge badge-resolved";
    case "Stock bajo":
      return "badge badge-high";
    case "Agotado":
      return "badge badge-open";
    default:
      return "badge";
  }
}

/* Formatear precio */
function formatPriceNumber(value) {
  return `${Number(value).toFixed(2)} €`;
}

/* Crear HTML de un item del timeline */
function createTimelineItem(item) {
  return `
    <div class="timeline-item">
      <h4>${item.titulo}</h4>
      <span>${item.fecha}</span>
      <p>${item.texto}</p>
    </div>
  `;
}

/* =========================
   TEMA
========================= */

/* Aplicar modo claro u oscuro */
function applyTheme(theme) {
  if (theme === "Claro") {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }
}

/* Obtener configuración general del panel */
function getPanelSettings() {
  return JSON.parse(localStorage.getItem("panelSettings")) || {};
}

/* Inicializar tema al cargar la página */
function initTheme() {
  const settings = getPanelSettings();
  const savedTheme = settings.theme || "Oscuro";
  applyTheme(savedTheme);
}

/* Ejecutar tema al cargar el DOM */
document.addEventListener("DOMContentLoaded", initTheme);

/* =========================
   USUARIO ACTUAL
========================= */

/* Cargar nombre del usuario logueado en el sidebar */
async function loadCurrentUser() {

  if (!window.supabaseClient) return;

  const { data: sessionData } = await window.supabaseClient.auth.getSession();

  if (!sessionData.session) return;

  const userId = sessionData.session.user.id;

  const { data: perfil, error } = await window.supabaseClient
    .from("perfiles")
    .select("nombre")
    .eq("id", userId)
    .single();

  if (error || !perfil) return;

  const sidebarUserName = document.getElementById("sidebarUserName");

  if (sidebarUserName) {
    sidebarUserName.textContent = perfil.nombre;
  }
}

/* Ejecutar carga del usuario */
document.addEventListener("DOMContentLoaded", loadCurrentUser);

/* =========================
   LOGIN / PROTECCIÓN
========================= */

function protectPage() {

  const currentPath = window.location.pathname;

  // Permitir acceso al login
  if (currentPath === "/login") return;

  // NUEVA KEY
  const isLoggedIn = localStorage.getItem("adminLoggedIn");

  // Si no hay sesión → fuera
  if (isLoggedIn !== "true") {
    window.location.href = "/login";
  }
}

document.addEventListener("DOMContentLoaded", protectPage);

/* =========================
   LOGOUT
========================= */

async function logout() {

  // NUEVA KEY
  localStorage.removeItem("adminLoggedIn");

  // Cerrar sesión Supabase si existe
  if (window.supabaseClient) {
    await window.supabaseClient.auth.signOut();
  }

  window.location.href = "/login";
}

window.logout = logout;