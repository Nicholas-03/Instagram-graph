// src/app.mjs
import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Home');
});

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello' });
});

app.post('/jobs', (req, res) => {
  res.status(201).json({
    ok: true,
    data: req.body
  });
});

export default app;