const bcrypt = require('bcryptjs');

// Tus contraseñas originales
const passwords = {
  'user1@demo.com': '1234',
  'user2@demo.com': 'abcd',
  'admin@demo.com': 'admin'
};

const saltRounds = 10;

for (const [email, plainPassword] of Object.entries(passwords)) {
  const hash = bcrypt.hashSync(plainPassword, saltRounds);
  console.log(`Email: ${email}\nPassword: ${plainPassword}\nHash: ${hash}\n`);
}