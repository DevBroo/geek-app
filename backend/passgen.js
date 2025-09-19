import bcrypt from 'bcrypt';

const hash = await bcrypt.hash('GeekLappy@2024#Admin', 10);

console.log(hash)
console.log('Password hashed successfully');