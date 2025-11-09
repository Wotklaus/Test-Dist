const bcrypt = require('bcryptjs');

// Tus contraseñas originales
const passwords = {
  'admin@system.com': 'admin',
  'user@system.com': 'user'
};

const saltRounds = 10;

for (const [email, plainPassword] of Object.entries(passwords)) {
  const hash = bcrypt.hashSync(plainPassword, saltRounds);
  console.log(`Email: ${email}\nPassword: ${plainPassword}\nHash: ${hash}\n`);
}