import express from 'express';
import {
  handleInsertActorRequest,
  handleGetActoresRequest,
  handleGetActorByIdRequest,
  handleGetActoresByPeliculaIdRequest,
} from './controller.js';

const actorRoutes = express.Router();

actorRoutes.post('/actor', handleInsertActorRequest);

actorRoutes.get('/actor', handleGetActoresRequest);
actorRoutes.get('/actores', handleGetActoresRequest);

actorRoutes.get(
  '/actor/pelicula/:peliculaId',
  handleGetActoresByPeliculaIdRequest
);

actorRoutes.get('/actor/:id', handleGetActorByIdRequest);

export default actorRoutes;
