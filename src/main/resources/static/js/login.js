/*
  Se obtiene el formulario de inicio de sesión mediante su id.

  Este formulario será el que el usuario rellene con su correo
  y contraseña para acceder al panel de administración.
*/
const loginForm = document.getElementById("loginForm");

/*
  Se obtiene el elemento donde se mostrarán los mensajes de error
  o avisos relacionados con el inicio de sesión.
*/
const loginError = document.getElementById("loginError");

/*
  Se añade un evento al formulario para controlar el momento
  en el que el usuario intenta iniciar sesión.
*/
loginForm.addEventListener("submit", async function (e) {

  /*
    Se evita el comportamiento por defecto del formulario.

    Sin esta línea, el navegador recargaría la página al enviar
    el formulario, impidiendo controlar el login con JavaScript.
  */
  e.preventDefault();

  /*
    Se muestra un mensaje temporal mientras se comprueban
    las credenciales introducidas por el usuario.
  */
  loginError.textContent = "Comprobando credenciales...";

  /*
    Se obtiene el valor introducido en el campo de email.

    trim() elimina espacios en blanco al principio y al final,
    evitando errores si el usuario escribe espacios por accidente.
  */
  const email = document.getElementById("email").value.trim();

  /*
    Se obtiene el valor introducido en el campo de contraseña.

    También se usa trim() para limpiar espacios innecesarios.
  */
  const password = document.getElementById("password").value.trim();

  /*
    Se realiza el inicio de sesión mediante Supabase Auth.

    signInWithPassword comprueba si existe un usuario registrado
    con ese correo y esa contraseña.
  */
  const { data, error } = await window.supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  /*
    Si Supabase devuelve un error, significa que las credenciales
    no son válidas o que ha ocurrido algún problema en el login.
  */
  if (error) {

    /*
      Se muestra un mensaje de error al usuario.
    */
    loginError.textContent = "Usuario o contraseña incorrectos.";

    /*
      Se detiene la ejecución para evitar que el usuario acceda
      al panel de administración.
    */
    return;
  }

  /*
    Si el login es correcto, se guarda en localStorage un indicador
    para saber que el administrador ha iniciado sesión.

    Este valor puede ser usado por otros scripts para comprobar
    si el usuario está autenticado.
  */
  localStorage.setItem("adminLoggedIn", "true");

  /*
    Se redirige al usuario al dashboard principal del panel.
  */
  window.location.href = "/";
});