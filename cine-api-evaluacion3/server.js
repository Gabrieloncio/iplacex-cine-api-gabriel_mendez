import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import { connectToMongo } from './src/common/db.js';
import peliculaRoutes from './src/pelicula/routes.js';
import actorRoutes from './src/actor/routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/menu', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.status(200).send('Bienvenido al cine Iplacex');
});

app.use('/api', peliculaRoutes);
app.use('/api', actorRoutes);

connectToMongo()
  .then(() => {
    console.log('Conexión exitosa a MongoDB Atlas');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor Express escuchando en puerto ${PORT}`);
      console.log(`Menú web disponible en /menu/`);
    });
  })
  .catch((error) => {
    console.error('No fue posible conectar a MongoDB Atlas:', error.message);
    process.exit(1);
  });