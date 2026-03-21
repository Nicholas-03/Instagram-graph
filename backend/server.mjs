import app from './app.mjs';

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST

app.listen(PORT, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
