const API_BASE = '/api';

const elements = {
  message: document.getElementById('message'),
  output: document.getElementById('api-output'),

  peliculaForm: document.getElementById('pelicula-form'),
  peliculaFormTitle: document.getElementById('pelicula-form-title'),
  peliculaId: document.getElementById('pelicula-id'),
  peliculaNombre: document.getElementById('pelicula-nombre'),
  peliculaGeneros: document.getElementById('pelicula-generos'),
  peliculaAnio: document.getElementById('pelicula-anio'),
  peliculaSubmit: document.getElementById('pelicula-submit'),
  peliculaCancel: document.getElementById('pelicula-cancel'),
  peliculasBody: document.getElementById('peliculas-table-body'),

  actorForm: document.getElementById('actor-form'),
  actorNombre: document.getElementById('actor-nombre'),
  actorEdad: document.getElementById('actor-edad'),
  actorRetirado: document.getElementById('actor-retirado'),
  actorPremios: document.getElementById('actor-premios'),
  actorPelicula: document.getElementById('actor-pelicula'),
  actorFilterPelicula: document.getElementById('actor-filter-pelicula'),
  actoresBody: document.getElementById('actores-table-body'),
};

let peliculasCache = [];

document.querySelectorAll('.tab-button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach((item) => {
      item.classList.toggle('active', item === button);
    });

    document.querySelectorAll('.panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === button.dataset.target);
    });
  });
});

function showMessage(text, type = 'success') {
  elements.message.textContent = text;
  elements.message.className = `message ${type}`;

  window.clearTimeout(showMessage.timeoutId);
  showMessage.timeoutId = window.setTimeout(() => {
    elements.message.className = 'message hidden';
  }, 5000);
}

function showOutput(method, url, status, data) {
  elements.output.textContent = JSON.stringify(
    {
      request: `${method} ${url}`,
      status,
      response: data,
    },
    null,
    2
  );
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';

  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  showOutput(options.method || 'GET', url, response.status, data);

  if (!response.ok) {
    const message =
      typeof data === 'object' && data?.message
        ? data.message
        : 'La operación no pudo completarse';

    throw new Error(message);
  }

  return data;
}

function createActionButton(text, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.className = className;
  button.addEventListener('click', onClick);
  return button;
}

function resetPeliculaForm() {
  elements.peliculaForm.reset();
  elements.peliculaId.value = '';
  elements.peliculaFormTitle.textContent = 'Ingresar película';
  elements.peliculaSubmit.textContent = 'Guardar película';
  elements.peliculaCancel.classList.add('hidden');
}

function startPeliculaEdit(pelicula) {
  elements.peliculaId.value = pelicula._id;
  elements.peliculaNombre.value = pelicula.nombre;
  elements.peliculaGeneros.value = pelicula.generos.join(', ');
  elements.peliculaAnio.value = pelicula.anioEstreno;
  elements.peliculaFormTitle.textContent = 'Editar película';
  elements.peliculaSubmit.textContent = 'Guardar cambios';
  elements.peliculaCancel.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadPeliculas() {
  try {
    const peliculas = await request(`${API_BASE}/pelicula`);
    peliculasCache = peliculas;
    renderPeliculas(peliculas);
    updateMovieSelects(peliculas);
  } catch (error) {
    peliculasCache = [];
    elements.peliculasBody.innerHTML =
      '<tr><td colspan="4">No fue posible cargar las películas.</td></tr>';
    showMessage(error.message, 'error');
  }
}

function renderPeliculas(peliculas) {
  elements.peliculasBody.innerHTML = '';

  if (peliculas.length === 0) {
    elements.peliculasBody.innerHTML =
      '<tr><td colspan="4">Todavía no hay películas registradas.</td></tr>';
    return;
  }

  peliculas.forEach((pelicula) => {
    const row = document.createElement('tr');

    const nombre = document.createElement('td');
    nombre.textContent = pelicula.nombre;

    const generos = document.createElement('td');
    generos.textContent = pelicula.generos.join(', ');

    const anio = document.createElement('td');
    anio.textContent = pelicula.anioEstreno;

    const acciones = document.createElement('td');
    acciones.className = 'actions';

    acciones.append(
      createActionButton('Ver', 'secondary-button', async () => {
        try {
          const detalle = await request(
            `${API_BASE}/pelicula/${pelicula._id}`
          );
          showMessage(`Película encontrada: ${detalle.nombre}`);
        } catch (error) {
          showMessage(error.message, 'error');
        }
      }),
      createActionButton('Editar', 'secondary-button', () => {
        startPeliculaEdit(pelicula);
      }),
      createActionButton('Eliminar', 'danger-button', async () => {
        const confirmed = window.confirm(
          `¿Desea eliminar la película "${pelicula.nombre}"?`
        );

        if (!confirmed) {
          return;
        }

        try {
          await request(`${API_BASE}/pelicula/${pelicula._id}`, {
            method: 'DELETE',
          });
          showMessage('Película eliminada correctamente');
          resetPeliculaForm();
          await loadPeliculas();
          await loadActores();
        } catch (error) {
          showMessage(error.message, 'error');
        }
      })
    );

    row.append(nombre, generos, anio, acciones);
    elements.peliculasBody.append(row);
  });
}

function updateMovieSelects(peliculas) {
  const currentActorMovie = elements.actorPelicula.value;
  const currentFilter = elements.actorFilterPelicula.value;

  elements.actorPelicula.innerHTML =
    '<option value="">Seleccione una película</option>';
  elements.actorFilterPelicula.innerHTML =
    '<option value="">Todos los actores</option>';

  peliculas.forEach((pelicula) => {
    const actorOption = document.createElement('option');
    actorOption.value = pelicula.nombre;
    actorOption.textContent = pelicula.nombre;
    elements.actorPelicula.append(actorOption);

    const filterOption = document.createElement('option');
    filterOption.value = pelicula._id;
    filterOption.textContent = pelicula.nombre;
    elements.actorFilterPelicula.append(filterOption);
  });

  if ([...elements.actorPelicula.options].some(
    (option) => option.value === currentActorMovie
  )) {
    elements.actorPelicula.value = currentActorMovie;
  }

  if ([...elements.actorFilterPelicula.options].some(
    (option) => option.value === currentFilter
  )) {
    elements.actorFilterPelicula.value = currentFilter;
  }
}

elements.peliculaForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = elements.peliculaId.value;
  const method = id ? 'PUT' : 'POST';
  const url = id
    ? `${API_BASE}/pelicula/${id}`
    : `${API_BASE}/pelicula`;

  const payload = {
    nombre: elements.peliculaNombre.value.trim(),
    generos: elements.peliculaGeneros.value
      .split(',')
      .map((genero) => genero.trim())
      .filter(Boolean),
    anioEstreno: Number(elements.peliculaAnio.value),
  };

  try {
    await request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    showMessage(
      id
        ? 'Película actualizada correctamente'
        : 'Película creada correctamente'
    );
    resetPeliculaForm();
    await loadPeliculas();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

elements.peliculaCancel.addEventListener('click', resetPeliculaForm);

async function loadActores(peliculaId = '') {
  const url = peliculaId
    ? `${API_BASE}/actor/pelicula/${peliculaId}`
    : `${API_BASE}/actor`;

  try {
    const actores = await request(url);
    renderActores(actores);
  } catch (error) {
    if (peliculaId && error.message.includes('No se encontraron')) {
      renderActores([]);
      showMessage(error.message, 'error');
      return;
    }

    elements.actoresBody.innerHTML =
      '<tr><td colspan="6">No fue posible cargar los actores.</td></tr>';
    showMessage(error.message, 'error');
  }
}

function renderActores(actores) {
  elements.actoresBody.innerHTML = '';

  if (actores.length === 0) {
    elements.actoresBody.innerHTML =
      '<tr><td colspan="6">No hay actores para mostrar.</td></tr>';
    return;
  }

  actores.forEach((actor) => {
    const row = document.createElement('tr');

    const nombre = document.createElement('td');
    nombre.textContent = actor.nombre;

    const edad = document.createElement('td');
    edad.textContent = actor.edad;

    const retirado = document.createElement('td');
    retirado.textContent = actor.estaRetirado ? 'Sí' : 'No';

    const premios = document.createElement('td');
    premios.textContent =
      Array.isArray(actor.premios) && actor.premios.length > 0
        ? actor.premios.join(', ')
        : 'Sin premios informados';

    const peliculaId = document.createElement('td');
    peliculaId.textContent = actor.idPelicula;

    const detalle = document.createElement('td');
    detalle.append(
      createActionButton('Ver', 'secondary-button', async () => {
        try {
          const actorDetalle = await request(
            `${API_BASE}/actor/${actor._id}`
          );
          showMessage(`Actor encontrado: ${actorDetalle.nombre}`);
        } catch (error) {
          showMessage(error.message, 'error');
        }
      })
    );

    row.append(
      nombre,
      edad,
      retirado,
      premios,
      peliculaId,
      detalle
    );

    elements.actoresBody.append(row);
  });
}

elements.actorForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    nombre: elements.actorNombre.value.trim(),
    edad: Number(elements.actorEdad.value),
    estaRetirado: elements.actorRetirado.value === 'true',
    premios: elements.actorPremios.value
      .split(',')
      .map((premio) => premio.trim())
      .filter(Boolean),
    nombrePelicula: elements.actorPelicula.value,
  };

  try {
    await request(`${API_BASE}/actor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    showMessage('Actor creado correctamente');
    elements.actorForm.reset();
    await loadActores();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

document
  .getElementById('refresh-peliculas')
  .addEventListener('click', loadPeliculas);

document
  .getElementById('refresh-actores')
  .addEventListener('click', () => {
    elements.actorFilterPelicula.value = '';
    loadActores();
  });

document
  .getElementById('filter-actores')
  .addEventListener('click', () => {
    loadActores(elements.actorFilterPelicula.value);
  });

document
  .getElementById('clear-output')
  .addEventListener('click', () => {
    elements.output.textContent =
      'El resultado de las operaciones aparecerá aquí.';
  });

async function initialize() {
  await loadPeliculas();
  await loadActores();
}

initialize();
