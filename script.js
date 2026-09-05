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
    renderRegistro(contenedorMain);
    renderCalculadora(contenedorMain);
    activarNavegacionSmooth();
  } catch (error) {
    contenedorMain.innerHTML = "<p>Error al cargar la información.</p>";
    console.error(error);
  }
}

function renderEncabezado(elemento, meta) {
  elemento.innerHTML = `
    <span class="modulo">Módulo ${meta.modulo}</span>
    <h1 class="titulo">${meta.titulo}</h1>
    <p class="subtitulo">${meta.subtitulo}</p>
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
  const html = secciones
    .map((s) => {
      const parrafos = (s.parrafos || []).map((p) => `<p>${p}</p>`).join("");
      const lista = s.lista
        ? `<ul class="detalle">${s.lista.map((li) => `<li>${li}</li>`).join("")}</ul>`
        : "";
      return `
        <section class="bloque" id="${s.id}">
          <h2>${s.titulo}</h2>
          <div class="card-item">
            ${parrafos}
            ${lista}
          </div>
        </section>
      `;
    })
    .join("");
  elemento.insertAdjacentHTML("beforeend", html);
}

function renderClasificacion(elemento, clasificacion) {
  const filas = clasificacion
    .map(
      (c) => `
        <tr>
          <td><strong>${c.categoria}</strong></td>
          <td>${c.ejemplos}</td>
          <td>${c.vidaUtilAnios} años</td>
          <td class="tasa">${c.tasaSunat}</td>
        </tr>`
    )
    .join("");

  const html = `
    <section class="bloque" id="clasificacion">
      <h2>Clasificación y Tasas Referenciales</h2>
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
          <tbody>
            ${filas}
          </tbody>
        </table>
      </div>
    </section>
  `;
  elemento.insertAdjacentHTML("beforeend", html);
}

function renderEjercicios(elemento, ejercicios) {
  if (!ejercicios) return;

  const tarjetas = ejercicios.practicas
    .map((p) => `
      <div class="card-item" style="margin-bottom:1rem;">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <p><strong>Costo:</strong> S/ ${p.costo.toLocaleString()} | <strong>Vida útil:</strong> ${p.vidaUtil} años</p>
      </div>
    `)
    .join("");

  const html = `
    <section class="bloque" id="ejercicios">
      <h2>${ejercicios.titulo}</h2>
      <div class="grid-cards">${tarjetas}</div>
    </section>
  `;
  elemento.insertAdjacentHTML("beforeend", html);
}

function renderRegistro(elemento) {
  const html = `
    <section class="bloque" id="registro">
      <h2>Registro Rápido de Activos</h2>
      <div class="calculadora">
        <div class="campo"><label>Código</label><input type="text" id="reg-codigo" placeholder="Ej. EQ-01" /></div>
        <div class="campo"><label>Descripción</label><input type="text" id="reg-descripcion" placeholder="Ej. Refrigeradora" /></div>
        <div class="campo"><label>Costo (S/)</label><input type="number" id="reg-costo" /></div>
        <div class="campo"><label>Vida Útil (Años)</label><input type="number" id="reg-vida" /></div>
        <button type="button" id="reg-agregar">Guardar Activo</button>
      </div>
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

function activarNavegacionSmooth() {}

document.addEventListener("DOMContentLoaded", cargarContenido);
