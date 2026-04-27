/* =========================
   CONFIGURACIÓN
========================= */

/* Configuración por defecto */
const defaultSettings = {
  adminName: "Víctor",
  adminEmail: "victor.admin@vinilotfg.com",
  adminRole: "Administrador principal",
  theme: "Oscuro",
  language: "Español",
  notifyIncidents: true,
  notifyOrders: true,
  notifyStock: true
};

/* Obtener configuración del localStorage */
function getSettings() {
  return JSON.parse(localStorage.getItem("panelSettings")) || defaultSettings;
}

/* Guardar configuración en localStorage */
function saveSettings(settings) {
  localStorage.setItem("panelSettings", JSON.stringify(settings));
}

/* Renderizar datos en la UI */
function renderSettings() {
  const settings = getSettings();

  /* Inputs */
  const adminName = document.getElementById("adminName");
  const adminEmail = document.getElementById("adminEmail");
  const adminRole = document.getElementById("adminRole");
  const themeSelect = document.getElementById("themeSelect");
  const languageSelect = document.getElementById("languageSelect");
  const notifyIncidents = document.getElementById("notifyIncidents");
  const notifyOrders = document.getElementById("notifyOrders");
  const notifyStock = document.getElementById("notifyStock");

  /* Asignar valores */
  if (adminName) adminName.value = settings.adminName;
  if (adminEmail) adminEmail.value = settings.adminEmail;
  if (adminRole) adminRole.value = settings.adminRole;
  if (themeSelect) themeSelect.value = settings.theme;
  if (languageSelect) languageSelect.value = settings.language;
  if (notifyIncidents) notifyIncidents.checked = settings.notifyIncidents;
  if (notifyOrders) notifyOrders.checked = settings.notifyOrders;
  if (notifyStock) notifyStock.checked = settings.notifyStock;

  /* Labels resumen */
  const configUserName = document.getElementById("configUserName");
  const configThemeLabel = document.getElementById("configThemeLabel");
  const configNotificationLabel = document.getElementById("configNotificationLabel");

  if (configUserName) configUserName.textContent = settings.adminName;
  if (configThemeLabel) configThemeLabel.textContent = settings.theme;

  /* Contar notificaciones activas */
  const activeNotifications =
    [settings.notifyIncidents, settings.notifyOrders, settings.notifyStock].filter(Boolean).length;

  if (configNotificationLabel) {
    configNotificationLabel.textContent = activeNotifications > 0 ? "Activadas" : "Desactivadas";
  }

  /* Render resumen */
  renderConfigSummary(settings);
}

/* Crear resumen visual */
function renderConfigSummary(settings) {
  const container = document.getElementById("configSummaryBoxes");
  if (!container) return;

  /* Texto de notificaciones */
  const notificationsText =
    `${settings.notifyIncidents ? "Incidencias" : ""}` +
    `${settings.notifyIncidents && settings.notifyOrders ? ", " : ""}` +
    `${settings.notifyOrders ? "Pedidos" : ""}` +
    `${(settings.notifyIncidents || settings.notifyOrders) && settings.notifyStock ? ", " : ""}` +
    `${settings.notifyStock ? "Stock" : ""}`;

  /* Datos a mostrar */
  const boxes = [
    {
      titulo: "Perfil activo",
      texto: `${settings.adminName} · ${settings.adminRole}`
    },
    {
      titulo: "Correo principal",
      texto: settings.adminEmail
    },
    {
      titulo: "Tema actual",
      texto: `El panel está configurado en modo ${settings.theme.toLowerCase()}.`
    },
    {
      titulo: "Idioma",
      texto: `Idioma seleccionado: ${settings.language}.`
    },
    {
      titulo: "Notificaciones",
      texto: notificationsText || "No hay notificaciones activas."
    }
  ];

  /* Pintar cajas */
  container.innerHTML = boxes.map(item => `
    <div class="summary-item">
      <h4>${item.titulo}</h4>
      <p>${item.texto}</p>
    </div>
  `).join("");
}

/* Formulario perfil */
function bindProfileForm() {
  const form = document.getElementById("profileForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const settings = getSettings();
    settings.adminName = document.getElementById("adminName").value || defaultSettings.adminName;
    settings.adminEmail = document.getElementById("adminEmail").value || defaultSettings.adminEmail;
    settings.adminRole = document.getElementById("adminRole").value || defaultSettings.adminRole;

    saveSettings(settings);
    renderSettings();
  });
}

/* Formulario preferencias */
function bindPreferencesForm() {
  const form = document.getElementById("preferencesForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const settings = getSettings();
    settings.theme = document.getElementById("themeSelect").value;
    settings.language = document.getElementById("languageSelect").value;

    saveSettings(settings);
    renderSettings();
    applyTheme(settings.theme); // aplicar tema
  });
}

/* Formulario notificaciones */
function bindNotificationsForm() {
  const form = document.getElementById("notificationsForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const settings = getSettings();
    settings.notifyIncidents = document.getElementById("notifyIncidents").checked;
    settings.notifyOrders = document.getElementById("notifyOrders").checked;
    settings.notifyStock = document.getElementById("notifyStock").checked;

    saveSettings(settings);
    renderSettings();
  });
}

/* Formulario seguridad */
function bindSecurityForm() {
  const form = document.getElementById("securityForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const repeatPassword = document.getElementById("repeatPassword").value;

    /* Validaciones */
    if (!currentPassword || !newPassword || !repeatPassword) {
      alert("Completa todos los campos de seguridad.");
      return;
    }

    if (newPassword !== repeatPassword) {
      alert("Las nuevas contraseñas no coinciden.");
      return;
    }

    /* Simulación cambio contraseña */
    alert("Contraseña actualizada correctamente.");
    form.reset();
  });
}

/* INIT */
renderSettings(); // cargar datos
bindProfileForm(); // activar form perfil
bindPreferencesForm(); // activar preferencias
bindNotificationsForm(); // activar notificaciones
bindSecurityForm(); // activar seguridad