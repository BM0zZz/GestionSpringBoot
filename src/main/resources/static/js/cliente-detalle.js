/* =========================
   DETALLE CLIENTE - SUPABASE
========================= */

/* Cliente de Supabase */
const supabaseClient = window.supabaseClient;

/* Obtener ID del cliente desde la URL */
function getClienteIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/* Formatear fecha */
function formatFecha(fecha) {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

/* Validar formato básico de email */
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Cargar cliente desde Supabase */
async function cargarDetalleCliente() {
  const clienteContent = document.getElementById("clienteContent");
  const noClienteMessage = document.getElementById("noClienteMessage");

  const clienteId = getClienteIdFromUrl();

  if (!clienteId) {
    if (clienteContent) clienteContent.style.display = "none";
    if (noClienteMessage) noClienteMessage.style.display = "block";
    return;
  }

  const { data: cliente, error } = await supabaseClient
    .from("vs_usuarios")
    .select("*")
    .eq("id", clienteId)
    .single();

  if (error || !cliente) {
    console.error("Error al cargar el cliente:", error);

    if (clienteContent) clienteContent.style.display = "none";
    if (noClienteMessage) noClienteMessage.style.display = "block";
    return;
  }

  if (clienteContent) clienteContent.style.display = "block";
  if (noClienteMessage) noClienteMessage.style.display = "none";

  pintarFormularioCliente(cliente);
  pintarResumenCliente(cliente);
}

/* Rellenar formulario */
function pintarFormularioCliente(cliente) {
  const nombreCompleto = `${cliente.nombre || ""} ${cliente.apellidos || ""}`.trim();

  document.getElementById("clienteTitle").textContent = nombreCompleto || "Detalle de cliente";

  document.getElementById("editClienteId").value = cliente.id || "";
  document.getElementById("editClienteFecha").value = formatFecha(cliente.created_at);

  document.getElementById("editClienteNombre").value = cliente.nombre || "";
  document.getElementById("editClienteApellidos").value = cliente.apellidos || "";
  document.getElementById("editClienteEmail").value = cliente.email || "";
  document.getElementById("editClienteTelefono").value = cliente.telefono || "";
  document.getElementById("editClienteSocioNum").value = cliente.socio_num || "";
  document.getElementById("editClienteNivel").value = cliente.nivel || "";

  document.getElementById("editClientePuntosHistorico").value = cliente.puntos_historico ?? 0;
  document.getElementById("editClientePuntosDisponibles").value = cliente.puntos_disponibles ?? 0;
}

/* Rellenar resumen / vista rápida */
function pintarResumenCliente(cliente) {
  const nombreCompleto = `${cliente.nombre || ""} ${cliente.apellidos || ""}`.trim();

  document.getElementById("detailClienteSocio").textContent = cliente.socio_num || "-";
  document.getElementById("detailClienteNivel").textContent = cliente.nivel || "-";
  document.getElementById("detailClientePuntosDisponibles").textContent = cliente.puntos_disponibles ?? 0;
  document.getElementById("detailClientePuntosHistorico").textContent = cliente.puntos_historico ?? 0;

  document.getElementById("previewClienteNombre").textContent = nombreCompleto || "-";
  document.getElementById("previewClienteEmail").textContent = cliente.email || "-";
  document.getElementById("previewClienteTelefono").textContent = cliente.telefono || "-";
  document.getElementById("previewClienteFecha").textContent = formatFecha(cliente.created_at);
}

/* Comprobar si el número de socio ya existe en otro cliente */
async function comprobarSocioRepetido(socioNum, clienteId) {
  if (!socioNum) return false;

  const { data, error } = await supabaseClient
    .from("vs_usuarios")
    .select("id, socio_num")
    .eq("socio_num", socioNum)
    .neq("id", clienteId)
    .maybeSingle();

  if (error) {
    console.error("Error al comprobar el número de socio:", error);
    alert("Error al comprobar si el número de socio ya existe.");
    return true;
  }

  return data !== null;
}

/* Guardar cambios del cliente */
async function guardarCambiosCliente() {
  const clienteId = getClienteIdFromUrl();

  if (!clienteId) {
    alert("No se ha encontrado el ID del cliente.");
    return;
  }

  const nombre = document.getElementById("editClienteNombre").value.trim();
  const apellidos = document.getElementById("editClienteApellidos").value.trim();
  const email = document.getElementById("editClienteEmail").value.trim();
  const telefono = document.getElementById("editClienteTelefono").value.trim();
  const socioNum = document.getElementById("editClienteSocioNum").value.trim();
  const nivel = document.getElementById("editClienteNivel").value;
  const puntosHistorico = Number(document.getElementById("editClientePuntosHistorico").value);
  const puntosDisponibles = Number(document.getElementById("editClientePuntosDisponibles").value);

  const nivelesValidos = ["", "Bronce", "Plata", "Oro"];

  if (!nombre) {
    alert("El nombre no puede estar vacío.");
    return;
  }

  if (!email) {
    alert("El email no puede estar vacío.");
    return;
  }

  if (!emailValido(email)) {
    alert("Introduce un email válido.");
    return;
  }

  if (telefono.length > 20) {
    alert("El teléfono no puede tener más de 20 caracteres.");
    return;
  }

  if (!nivelesValidos.includes(nivel)) {
    alert("El nivel seleccionado no es válido.");
    return;
  }

  if (Number.isNaN(puntosHistorico) || puntosHistorico < 0) {
    alert("Los puntos históricos no pueden ser negativos.");
    return;
  }

  if (Number.isNaN(puntosDisponibles) || puntosDisponibles < 0) {
    alert("Los puntos disponibles no pueden ser negativos.");
    return;
  }

  /*
    Comprobar que el número de socio no esté repetido.
    Se excluye el cliente actual para que pueda conservar su propio número.
  */
  const socioRepetido = await comprobarSocioRepetido(socioNum, clienteId);

  if (socioRepetido) {
    alert("Ese número de socio ya está asignado a otro cliente.");
    return;
  }

  const clienteActualizado = {
    nombre: nombre,
    apellidos: apellidos || null,
    email: email,
    telefono: telefono || null,
    socio_num: socioNum || null,
    nivel: nivel || null,
    puntos_historico: puntosHistorico,
    puntos_disponibles: puntosDisponibles
  };

  const { error } = await supabaseClient
    .from("vs_usuarios")
    .update(clienteActualizado)
    .eq("id", clienteId);

  if (error) {
    console.error("Error al guardar los cambios del cliente:", error);

    /*
      Error típico de clave única duplicada en PostgreSQL/Supabase.
      Puede saltar si también creamos la restricción UNIQUE en la base de datos.
    */
    if (error.code === "23505") {
      alert("No se puede guardar porque ese número de socio ya existe.");
      return;
    }

    alert("Error al guardar los cambios del cliente.");
    return;
  }

  alert("Cliente actualizado correctamente.");

  await cargarDetalleCliente();
}

/* Eliminar cliente */
async function eliminarCliente() {
  const clienteId = getClienteIdFromUrl();

  if (!clienteId) {
    alert("No se ha encontrado el ID del cliente.");
    return;
  }

  const confirmar = confirm(
    "¿Seguro que quieres eliminar este cliente? Esta acción no se puede deshacer."
  );

  if (!confirmar) {
    return;
  }

  const confirmarFinal = confirm(
    "Última confirmación: el cliente se eliminará definitivamente de la base de datos."
  );

  if (!confirmarFinal) {
    return;
  }

  const { error } = await supabaseClient
    .from("vs_usuarios")
    .delete()
    .eq("id", clienteId);

  if (error) {
    console.error("Error al eliminar el cliente:", error);

    /*
      Error típico cuando el cliente tiene datos relacionados,
      por ejemplo pedidos, carrito u otros registros asociados.
    */
    if (error.code === "23503") {
      alert("No se puede eliminar este cliente porque tiene pedidos u otros datos asociados.");
      return;
    }

    alert("Error al eliminar el cliente.");
    return;
  }

  alert("Cliente eliminado correctamente.");
  window.location.href = "/clientes";
}

/* INIT */
cargarDetalleCliente();

/* Hacer accesibles las funciones desde los botones del HTML */
window.guardarCambiosCliente = guardarCambiosCliente;
window.eliminarCliente = eliminarCliente;