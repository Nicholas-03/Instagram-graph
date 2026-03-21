import express from 'express';
import cors from 'cors';

const app = express();
import routes from './routes/jobRoutes.js'

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use('/', routes)

export default app;