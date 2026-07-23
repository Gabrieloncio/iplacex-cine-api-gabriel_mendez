import { ObjectId } from 'mongodb';
import { getDb } from '../common/db.js';
import {
  buildActorFromRequest,
  validateActor,
} from './actor.js';

const actorCollection = () => getDb().collection('actores');
const peliculaCollection = () => getDb().collection('peliculas');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function handleInsertActorRequest(req, res) {
  const nombrePelicula =
    typeof req.body.nombrePelicula === 'string'
      ? req.body.nombrePelicula.trim()
      : '';

  if (!nombrePelicula) {
    return res.status(400).json({
      message: 'Debe indicar el nombre de la película asociada',
    });
  }

  const nombreExacto = new RegExp(`^${escapeRegExp(nombrePelicula)}$`, 'i');

  peliculaCollection()
    .findOne({ nombre: nombreExacto })
    .then((pelicula) => {
      if (!pelicula) {
        return res.status(404).json({
          message: 'No existe una película con ese nombre',
        });
      }

      const nuevoActor = buildActorFromRequest(
        req.body,
        pelicula._id.toString()
      );
      const validationErrors = validateActor(nuevoActor);

      if (validationErrors.length > 0) {
        return res.status(400).json({
          message: 'Datos de actor inválidos',
          errors: validationErrors,
        });
      }

      return actorCollection()
        .insertOne(nuevoActor)
        .then((result) => {
          res.status(201).json({
            message: 'Actor creado correctamente',
            actorId: result.insertedId,
            actor: {
              _id: result.insertedId,
              ...nuevoActor,
              nombrePelicula: pelicula.nombre,
            },
          });
        });
    })
    .catch((error) => {
      console.error('Error al insertar el actor:', error);
      res.status(500).json({ message: 'Error al insertar el actor' });
    });
}

export async function handleGetActoresRequest(req, res) {
  actorCollection()
    .find()
    .sort({ nombre: 1 })
    .toArray()
    .then((actores) => {
      res.status(200).json(actores);
    })
    .catch((error) => {
      console.error('Error al obtener los actores:', error);
      res.status(500).json({ message: 'Error al obtener los actores' });
    });
}

export async function handleGetActorByIdRequest(req, res) {
  let actorId;

  try {
    actorId = new ObjectId(req.params.id);
  } catch {
    return res.status(400).json({ message: 'Id de actor mal formado' });
  }

  actorCollection()
    .findOne({ _id: actorId })
    .then((actor) => {
      if (!actor) {
        return res.status(404).json({ message: 'Actor no encontrado' });
      }

      return res.status(200).json(actor);
    })
    .catch((error) => {
      console.error('Error al obtener el actor:', error);
      res.status(500).json({ message: 'Error al obtener el actor' });
    });
}

export async function handleGetActoresByPeliculaIdRequest(req, res) {
  const peliculaId = req.params.peliculaId;

  if (!ObjectId.isValid(peliculaId)) {
    return res.status(400).json({
      message: 'Id de película mal formado',
    });
  }

  actorCollection()
    .find({ idPelicula: peliculaId })
    .sort({ nombre: 1 })
    .toArray()
    .then((actores) => {
      if (actores.length === 0) {
        return res.status(404).json({
          message: 'No se encontraron actores para la película indicada',
        });
      }

      return res.status(200).json(actores);
    })
    .catch((error) => {
      console.error('Error al obtener actores por película:', error);
      res.status(500).json({
        message: 'Error al obtener los actores de la película',
      });
    });
}
