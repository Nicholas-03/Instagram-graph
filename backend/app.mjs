import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

app.post('/job', (req, res) => {
  res.status(201).json({
    ok: true,
    data: req.body
  });
});

export default app;