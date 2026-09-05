async function cargarContenido() {
  const contenedorMain = document.getElementById("contenido");
  const contenedorNav = document.getElementById("indice");
  const encabezado = document.getElementById("encabezado");

  try {
    const respuesta = await fetch("data.json");
    if (!respuesta.ok) throw new Error("No se pudo cargar data.json");
    const datos = await respuesta.json();

    renderEncabezado(encabezado, datos.meta);
    renderNav(contenedorNav, datos.secciones);
    renderSecciones(contenedorMain, datos.secciones);
    renderClasificacion(contenedorMain, datos.clasificacion);
    renderEjercicios(contenedorMain, datos.ejercicios);
    renderCalculadora(contenedorMain);
  } catch (error) {
    contenedorMain.innerHTML = "<p style='color:red;'>Error al cargar los datos de data.json</p>";
    console.error(error);
  }
}

function renderEncabezado(elemento, meta) {
  elemento.innerHTML = `
    <div class="hero-wrapper">
      <div class="hero-text">
        <span class="modulo">Módulo ${meta.modulo}</span>
        <h1 class="titulo">${meta.titulo}</h1>
        <p class="subtitulo">${meta.subtitulo}</p>
      </div>
      <!-- Imagen Banner Principal Estilo Showcase -->
      <div class="hero-media">
        <img src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80" alt="Gestión de Farmacia" class="hero-img" />
      </div>
    </div>
  `;
}

function renderNav(elemento, secciones) {
  const items = secciones
    .map((s) => `<li><button class="nav-btn" onclick="document.getElementById('${s.id}').scrollIntoView({behavior: 'smooth'})">${s.titulo}</button></li>`)
    .join("");

  elemento.innerHTML = `
    <ul>
      ${items}
      <li><button class="nav-btn" onclick="document.getElementById('clasificacion').scrollIntoView({behavior: 'smooth'})">Clasificación</button></li>
      <li><button class="nav-btn" onclick="document.getElementById('calculadora').scrollIntoView({behavior: 'smooth'})">Calculadora</button></li>
    </ul>
  `;
}

function renderSecciones(elemento, secciones) {
  // URLs de imagen demostrativas para cada sección del producto
  const imagenesSeccion = [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=600&q=80"
  ];

  const html = secciones
    .map((s, index) => {
      const parrafos = (s.parrafos || []).map((p) => `<p>${p}</p>`).join("");
      const lista = s.lista
        ? `<ul class="detalle">${s.lista.map((li) => `<li>✓ ${li}</li>`).join("")}</ul>`
        : "";
      const imgUrl = imagenesSeccion[index % imagenesSeccion.length];

      return `
        <section class="bloque" id="${s.id}">
          <h2>${s.titulo}</h2>
          <div class="card-grid">
            <div class="card-item">
              ${parrafos}
              ${lista}
            </div>
            <div class="card-image-wrap">
              <img src="${imgUrl}" alt="${s.titulo}" class="section-img" />
            </div>
          </div>
        </section>
      `;
    })
    .join("");
  elemento.insertAdjacentHTML("beforeend", html);
}

function renderClasificacion(elemento, clasificacion) {
  if (!clasificacion) return;
  const filas = clasificacion
    .map(
      (c) => `
        <tr>
          <td><strong>${c.categoria}</strong></td>
          <td>${c.ejemplos}</td>
          <td>${c.vidaUtilAnios} años</td>
          <td style="color:var(--accent-gold); font-weight:bold;">${c.tasaSunat}</td>
        </tr>`
    )
    .join("");

  const html = `
    <section class="bloque" id="clasificacion">
      <h2>Clasificación y Tasas</h2>
      <div class="tabla-wrap">
        <table class="clasificacion">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Ejemplos</th>
              <th>Vida Útil</th>
              <th>Tasa Anual</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    </section>
  `;
  elemento.insertAdjacentHTML("beforeend", html);
}

function renderEjercicios(elemento, ejercicios) {
  if (!ejercicios) return;
  const tarjetas = (ejercicios.practicas || [])
    .map((p) => `
      <div class="card-item">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <p><strong>Costo:</strong> S/ ${p.costo.toLocaleString()} | <strong>Vida útil:</strong> ${p.vidaUtil} años</p>
      </div>
    `)
    .join("");

  const html = `
    <section class="bloque" id="ejercicios">
      <h2>${ejercicios.titulo}</h2>
      ${tarjetas}
    </section>
  `;
  elemento.insertAdjacentHTML("beforeend", html);
}

function renderCalculadora(elemento) {
  const html = `
    <section class="bloque" id="calculadora">
      <h2>Calculadora de Depreciación</h2>
      <div class="calculadora">
        <div class="campo">
          <label>Costo del activo (S/)</label>
          <input type="number" id="calc-costo" placeholder="3500" />
        </div>
        <div class="campo">
          <label>Vida útil (años)</label>
          <input type="number" id="calc-vida" placeholder="4" />
        </div>
        <div id="calc-resultado" style="grid-column: 1 / -1; font-weight:700; color:var(--accent-gold);"></div>
      </div>
    </section>
  `;
  elemento.insertAdjacentHTML("beforeend", html);

  const inputCosto = document.getElementById("calc-costo");
  const inputVida = document.getElementById("calc-vida");
  const resultado = document.getElementById("calc-resultado");

  function calcular() {
    const costo = parseFloat(inputCosto.value);
    const vida = parseFloat(inputVida.value);

    if (costo > 0 && vida > 0) {
      const anual = costo / vida;
      resultado.innerHTML = `Depreciación estimada: S/ ${anual.toFixed(2)} / año`;
    } else {
      resultado.innerHTML = "";
    }
  }

  inputCosto.addEventListener("input", calcular);
  inputVida.addEventListener("input", calcular);
}

document.addEventListener("DOMContentLoaded", cargarContenido);
