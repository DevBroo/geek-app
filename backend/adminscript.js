import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { _id: '688dfc0065ff114494ad7bee', email: 'admin@geeklappy.com', role: 'admin' },
  '8e80c574341caacc961bd840158878f4f8114a8466b4d1b0b79de34b814febbb', // ACCESS_TOKEN_SECRET from your .env
  { expiresIn: '12h' }
);

console.log(token);