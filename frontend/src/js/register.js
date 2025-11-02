// Register script for PokeStake
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const msg = document.getElementById('registerMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get all form data except confirm_password
    const data = Object.fromEntries(new FormData(form).entries());
    // We do NOT check confirm_password anymore

    console.log("Sending registration data:", data);

    try {
      // 1. Register user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        msg.textContent = authError.message || "Registration failed";
        msg.style.color = "red";
        return;
      }

      // 2. Insert additional user data into "users" table
      const userId = authData?.user?.id; // Supabase user UUID

      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
            document_id: data.document_id,
            phone: data.phone,
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