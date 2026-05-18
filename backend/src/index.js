require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
const connectDB = require('./config/db');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://promptune.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Promptune API — port ${PORT}`);
});