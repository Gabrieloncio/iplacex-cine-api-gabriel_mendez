export const Actor = {
  _id: 'ObjectId',
  idPelicula: 'string',
  nombre: 'string',
  edad: 'int',
  estaRetirado: 'bool',
  premios: 'array',
};

export function buildActorFromRequest(body, idPelicula) {
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';

  const premios = Array.isArray(body.premios)
    ? body.premios.map((premio) => String(premio).trim()).filter(Boolean)
    : typeof body.premios === 'string'
      ? body.premios.split(',').map((premio) => premio.trim()).filter(Boolean)
      : [];

  return {
    idPelicula,
    nombre,
    edad: Number.parseInt(body.edad, 10),
    estaRetirado:
      body.estaRetirado === true ||
      String(body.estaRetirado).toLowerCase() === 'true',
    premios,
  };
}

export function validateActor(actor) {
  const errors = [];

  if (!actor.nombre) {
    errors.push('El nombre del actor es obligatorio');
  }

  if (!Number.isInteger(actor.edad) || actor.edad < 0) {
    errors.push('La edad debe ser un número válido');
  }

  if (!actor.idPelicula) {
    errors.push('La película asociada es obligatoria');
  }

  return errors;
}
