import { ObjectId } from 'mongodb';
import { getDb } from '../common/db.js';
import {
  buildPeliculaFromRequest,
  validatePelicula,
} from './pelicula.js';

const peliculaCollection = () => getDb().collection('peliculas');

export async function handleInsertPeliculaRequest(req, res) {
  const nuevaPelicula = buildPeliculaFromRequest(req.body);
  const validationErrors = validatePelicula(nuevaPelicula);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: 'Datos de película inválidos',
      errors: validationErrors,
    });
  }

  peliculaCollection()
    .insertOne(nuevaPelicula)
    .then((result) => {
      res.status(201).json({
        message: 'Película creada correctamente',
        peliculaId: result.insertedId,
        pelicula: {
          _id: result.insertedId,
          ...nuevaPelicula,
        },
      });
    })
    .catch((error) => {
      console.error('Error al insertar la película:', error);
      res.status(500).json({ message: 'Error al insertar la película' });
    });
}

export async function handleGetPeliculasRequest(req, res) {
  peliculaCollection()
    .find()
    .sort({ nombre: 1 })
    .toArray()
    .then((peliculas) => {
      res.status(200).json(peliculas);
    })
    .catch((error) => {
      console.error('Error al obtener las películas:', error);
      res.status(500).json({ message: 'Error al obtener las películas' });
    });
}

export async function handleGetPeliculaByIdRequest(req, res) {
  let peliculaId;

  try {
    peliculaId = new ObjectId(req.params.id);
  } catch {
    return res.status(400).json({ message: 'Id de película mal formado' });
  }

  peliculaCollection()
    .findOne({ _id: peliculaId })
    .then((pelicula) => {
      if (!pelicula) {
        return res.status(404).json({ message: 'Película no encontrada' });
      }

      return res.status(200).json(pelicula);
    })
    .catch((error) => {
      console.error('Error al obtener la película:', error);
      res.status(500).json({ message: 'Error al obtener la película' });
    });
}

export async function handleUpdatePeliculaByIdRequest(req, res) {
  let peliculaId;

  try {
    peliculaId = new ObjectId(req.params.id);
  } catch {
    return res.status(400).json({ message: 'Id de película mal formado' });
  }

  const datosActualizados = buildPeliculaFromRequest(req.body);
  const validationErrors = validatePelicula(datosActualizados);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: 'Datos de película inválidos',
      errors: validationErrors,
    });
  }

  peliculaCollection()
    .updateOne(
      { _id: peliculaId },
      { $set: datosActualizados }
    )
    .then((result) => {
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Película no encontrada' });
      }

      return res.status(200).json({
        message: 'Película actualizada correctamente',
      });
    })
    .catch((error) => {
      console.error('Error al actualizar la película:', error);
      res.status(500).json({ message: 'Error al actualizar la película' });
    });
}

export async function handleDeletePeliculaByIdRequest(req, res) {
  let peliculaId;

  try {
    peliculaId = new ObjectId(req.params.id);
  } catch {
    return res.status(400).json({ message: 'Id de película mal formado' });
  }

  peliculaCollection()
    .deleteOne({ _id: peliculaId })
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Película no encontrada' });
      }

      return res.status(200).json({
        message: 'Película eliminada correctamente',
      });
    })
    .catch((error) => {
      console.error('Error al eliminar la película:', error);
      res.status(500).json({ message: 'Error al eliminar la película' });
    });
}
