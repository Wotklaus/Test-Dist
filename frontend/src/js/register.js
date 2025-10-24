document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const msg = document.getElementById('registerMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    // Validar contraseñas
    if (data.password !== data.confirm_password) {
      msg.textContent = "Passwords do not match";
      msg.style.color = "red";
      return;
    }

    // Crear objeto sin confirm_password
    const { confirm_password, ...userData } = data;

    // LOG: Ver datos enviados
    console.log("Enviando datos de registro:", userData);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      // LOG: Respuesta cruda
      console.log("Respuesta HTTP:", response);

      const resData = await response.json();

      // LOG: Contenido de la respuesta
      console.log("Respuesta del servidor:", resData);

      if (response.ok) {
        msg.textContent = "Registration successful!";
        msg.style.color = "green";
        form.reset();
      } else {
        msg.textContent = resData.error || "Registration failed";
        msg.style.color = "red";
      }
    } catch (err) {
      msg.textContent = "Server error: " + err.message;
      msg.style.color = "red";
      // LOG: Error de red o fetch
      console.error("Error en el registro:", err);
    }
  });
});