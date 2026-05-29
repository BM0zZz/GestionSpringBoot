/* =========================
   CONFIGURACIÓN - SUPABASE
========================= */

/* Cliente de Supabase */
const supabaseConfigClient = window.supabaseClient;

/* Preferencias por defecto del panel */
const defaultPanelSettings = {
  theme: "Oscuro",
  language: "Español"
};

/* Perfil cargado desde Supabase */
let perfilActual = null;

/* Obtener preferencias del localStorage */
function getPanelSettings() {
  const saved = localStorage.getItem("panelSettings");

  if (!saved) {
    return defaultPanelSettings;
  }

  return {
    ...defaultPanelSettings,
    ...JSON.parse(saved)
  };
}

/* Guardar preferencias en localStorage */
function savePanelSettings(settings) {
  localStorage.setItem("panelSettings", JSON.stringify(settings));
}

/* Aplicar tema visual */
function applyTheme(theme) {
  if (theme === "Claro") {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }
}

/*
  Obtener texto traducido.
  Usa t() si existe en i18n.js.
*/
function translateText(key) {
  if (typeof t === "function") {
    return t(key);
  }

  return key;
}

/*
  Aplicar idioma.
  Usa applyLanguage() si existe en i18n.js.
*/
function applyPanelLanguage(language) {
  if (typeof applyLanguage === "function") {
    applyLanguage(language);
  }
}

/* Obtener usuario autenticado */
async function getUsuarioActual() {
  const { data, error } = await supabaseConfigClient.auth.getSession();

  if (error) {
    console.error("Error al obtener la sesión:", error);
    return null;
  }

  return data.session?.user || null;
}

/* Cargar perfil del usuario actual desde Supabase */
async function cargarPerfil() {
  const usuarioActual = await getUsuarioActual();

  if (!usuarioActual) {
    alert("No se ha encontrado una sesión activa.");
    window.location.href = "/login";
    return;
  }

  /*
    Importante:
    perfiles.id debe coincidir con auth.users.id.
    Así cargamos el perfil del usuario que ha iniciado sesión,
    no el primer admin que encuentre.
  */
  const { data, error } = await supabaseConfigClient
    .from("perfiles")
    .select("*")
    .eq("id", usuarioActual.id)
    .maybeSingle();

  if (error) {
    console.error("Error al cargar el perfil:", error);
    alert(translateText("alerts.profileLoadError"));
    return;
  }

  /*
    Si no existe perfil para este usuario, lo creamos.
    Esto evita que al registrar un nuevo usuario la configuración quede vacía.
  */
  if (!data) {
    const nombrePorDefecto =
      usuarioActual.user_metadata?.nombre ||
      usuarioActual.user_metadata?.name ||
      usuarioActual.email?.split("@")[0] ||
      "Administrador";

    const nuevoPerfil = {
      id: usuarioActual.id,
      nombre: nombrePorDefecto,
      rol: "admin"
    };

    const { data: perfilCreado, error: crearError } = await supabaseConfigClient
      .from("perfiles")
      .insert([nuevoPerfil])
      .select()
      .single();

    if (crearError) {
      console.error("Error al crear el perfil:", crearError);
      alert("Error al crear el perfil del usuario.");
      return;
    }

    perfilActual = perfilCreado;
  } else {
    perfilActual = data;
  }

  renderSettings();
}

/* Renderizar datos en la UI */
function renderSettings() {
  const settings = getPanelSettings();

  applyTheme(settings.theme);
  applyPanelLanguage(settings.language);

  const nombre = perfilActual?.nombre || "Sin nombre";
  const rol = perfilActual?.rol || "Sin rol";

  /* Inputs del perfil */
  const profileId = document.getElementById("profileId");
  const adminName = document.getElementById("adminName");
  const adminRole = document.getElementById("adminRole");

  if (profileId) profileId.value = perfilActual?.id || "";
  if (adminName) adminName.value = nombre;
  if (adminRole) adminRole.value = rol;

  /* Inputs de preferencias */
  const themeSelect = document.getElementById("themeSelect");
  const languageSelect = document.getElementById("languageSelect");

  if (themeSelect) themeSelect.value = settings.theme;
  if (languageSelect) languageSelect.value = settings.language;

  /* Tarjetas superiores */
  const configUserName = document.getElementById("configUserName");
  const configUserRole = document.getElementById("configUserRole");
  const configRoleLabel = document.getElementById("configRoleLabel");
  const configThemeLabel = document.getElementById("configThemeLabel");
  const configLanguageLabel = document.getElementById("configLanguageLabel");

  if (configUserName) configUserName.textContent = nombre;
  if (configUserRole) configUserRole.textContent = rol;
  if (configRoleLabel) configRoleLabel.textContent = rol;
  if (configThemeLabel) configThemeLabel.textContent = settings.theme;
  if (configLanguageLabel) configLanguageLabel.textContent = settings.language;

  renderConfigSummary(settings, nombre, rol);
}

/* Crear resumen visual */
function renderConfigSummary(settings, nombre, rol) {
  const container = document.getElementById("configSummaryBoxes");
  if (!container) return;

  const themeText = settings.language === "Inglés"
    ? settings.theme === "Claro" ? "light mode" : "dark mode"
    : settings.theme.toLowerCase();

  const boxes = [
    {
      titulo: translateText("summary.activeProfile"),
      texto: `${nombre} · ${rol}`
    },
    {
      titulo: translateText("summary.currentRole"),
      texto: `${translateText("summary.currentRoleText")} ${rol}.`
    },
    {
      titulo: translateText("summary.currentTheme"),
      texto: `${translateText("summary.currentThemeText")} ${themeText}.`
    },
    {
      titulo: translateText("summary.language"),
      texto: `${translateText("summary.languageText")}: ${settings.language}.`
    }
  ];

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

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const usuarioActual = await getUsuarioActual();

    if (!usuarioActual) {
      alert("No se ha encontrado una sesión activa.");
      window.location.href = "/login";
      return;
    }

    const profileId = document.getElementById("profileId").value;
    const nombre = document.getElementById("adminName").value.trim();
    const rol = document.getElementById("adminRole").value;

    if (!profileId) {
      alert(translateText("alerts.profileNotFound"));
      return;
    }

    /*
      Seguridad extra:
      evita actualizar otro perfil distinto al usuario logueado.
    */
    if (profileId !== usuarioActual.id) {
      alert("No puedes modificar un perfil que no pertenece a tu sesión.");
      return;
    }

    if (!nombre) {
      alert(translateText("alerts.emptyName"));
      return;
    }

    if (!rol) {
      alert(translateText("alerts.emptyRole"));
      return;
    }

    const perfilActualizado = {
      nombre: nombre,
      rol: rol
    };

    const { data, error } = await supabaseConfigClient
      .from("perfiles")
      .update(perfilActualizado)
      .eq("id", profileId)
      .select()
      .single();

    if (error) {
      console.error("Error al guardar el perfil:", error);
      alert(translateText("alerts.profileSaveError"));
      return;
    }

    perfilActual = data;

    alert(translateText("alerts.profileSaved"));
    renderSettings();
  });
}

/* Formulario preferencias */
function bindPreferencesForm() {
  const form = document.getElementById("preferencesForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const settings = {
      theme: document.getElementById("themeSelect").value,
      language: document.getElementById("languageSelect").value
    };

    savePanelSettings(settings);

    applyTheme(settings.theme);
    applyPanelLanguage(settings.language);

    renderSettings();

    alert(translateText("alerts.preferencesSaved"));
  });
}

/* Cerrar sesión */
async function logout() {
  const { error } = await supabaseConfigClient.auth.signOut();

  if (error) {
    console.error("Error al cerrar sesión:", error);
    alert(translateText("alerts.logoutError"));
    return;
  }

  localStorage.removeItem("adminLoggedIn");
  window.location.href = "/login";
}

/* INIT */
cargarPerfil();
bindProfileForm();
bindPreferencesForm();

/* Hacer accesible logout desde el HTML */
window.logout = logout;