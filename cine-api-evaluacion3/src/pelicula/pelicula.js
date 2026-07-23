export const Pelicula = {
  _id: 'ObjectId',
  nombre: 'string',
  generos: 'array',
  anioEstreno: 'int',
};

export function buildPeliculaFromRequest(body) {
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';

  const generos = Array.isArray(body.generos)
    ? body.generos.map((genero) => String(genero).trim()).filter(Boolean)
    : typeof body.generos === 'string'
      ? body.generos.split(',').map((genero) => genero.trim()).filter(Boolean)
      : [];

  const anioEstreno = Number.parseInt(body.anioEstreno, 10);

  return {
    nombre,
    generos,
    anioEstreno,
  };
}

export function validatePelicula(pelicula) {
  const errors = [];

  if (!pelicula.nombre) {
    errors.push('El nombre de la película es obligatorio');
  }

  if (pelicula.generos.length === 0) {
    errors.push('Debe ingresar al menos un género');
  }

  if (!Number.isInteger(pelicula.anioEstreno) || pelicula.anioEstreno < 1888) {
    errors.push('El año de estreno debe ser un número válido');
  }

  return errors;
}
