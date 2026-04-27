// Referencias al DOM
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

/* Si ya está logueado, entra directo al panel */
if (localStorage.getItem("isLoggedIn") === "true") {
  window.location.href = "/";
}

/* Evento submit del formulario */
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email !== "" && password !== "") {

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedUserEmail", email);

    // 🔥 cambio importante
    window.location.href = "/";

  } else {
    loginError.textContent = "Introduce email y contraseña.";
  }
});