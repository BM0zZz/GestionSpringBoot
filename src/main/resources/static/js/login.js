const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  loginError.textContent = "Comprobando credenciales...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const { data, error } = await window.supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginError.textContent = "Usuario o contraseña incorrectos.";
    return;
  }

  localStorage.setItem("adminLoggedIn", "true");

  window.location.href = "/";
});