document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const msg = document.getElementById('registerMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Convert form data to object
    const data = Object.fromEntries(new FormData(form).entries());

    // Password match validation
    if (data.password !== data.confirm_password) {
      msg.textContent = "Passwords do not match";
      msg.style.color = "red";
      return;
    }

    // Remove confirm_password from data
    const { confirm_password, ...userData } = data;

    // Log: Data being sent for registration
    console.log("Sending registration data:", userData);

    try {
      // 1. Register user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        msg.textContent = authError.message || "Registration failed";
        msg.style.color = "red";
        return;
      }

      // 2. Insert additional user data into "users" table
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            email: userData.email,
            password: userData.password, // You can hash the password for more security
            first_name: userData.first_name,
            last_name: userData.last_name,
            document_id: userData.document_id,
            phone: userData.phone,
          }
        ]);

      if (dbError) {
        msg.textContent = dbError.message || "Registration error in database";
        msg.style.color = "red";
        return;
      }

      msg.textContent = "Registration successful!";
      msg.style.color = "green";
      form.reset();
    } catch (err) {
      msg.textContent = "Error: " + err.message;
      msg.style.color = "red";
      console.error("Registration error:", err);
    }
  });
});