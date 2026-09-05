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
    renderCalculadora(contenedorMain);
    activarNavegacionScroll();
    activarAnimacionEntrada();
    activarToggleTema();
  } catch (error) {
    contenedorMain.innerHTML =
      "<p>No se pudo cargar el contenido (data.json). Si abriste el archivo " +
      "directamente desde tu computadora, algunos navegadores bloquean esta " +
      "carga: publica la carpeta con GitHub Pages para verla correctamente.</p>";
    console.error(error);
  }
}

function renderEncabezado(elemento, meta) {
  elemento.innerHTML = `
    <p class="titulo">${meta.titulo}</p>
    <p class="subtitulo">${meta.subtitulo}</p>
    <span class="modulo">Módulo: ${meta.modulo}</span>
  `;
}

function renderNav(elemento, secciones) {
  const items = secciones
    .map((s) => `<li><a href="#${s.id}">${s.titulo}</a></li>`)
    .join("");
  elemento.innerHTML = `
    <ul>
      ${items}
      <li><a href="#clasificacion">Clasificación y depreciación</a></li>
      <li><a href="#calculadora">Calculadora</a></li>
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
          ${parrafos}
          ${lista}
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
          <td>${c.categoria}</td>
          <td>${c.ejemplos}</td>
          <td>${c.vidaUtilAnios} años</td>
          <td class="tasa">${c.tasaSunat}</td>
        </tr>`
    )
    .join("");

  const html = `
    <section class="bloque" id="clasificacion">
      <h2>Clasificación y depreciación (SUNAT)</h2>
      <p>Ejemplos de activos fijos comunes en una farmacia, con la vida útil y la tasa de depreciación tributaria de referencia.</p>
      <div class="tabla-wrap">
        <table class="clasificacion">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Ejemplos en la farmacia</th>
              <th>Vida útil</th>
              <th>Tasa SUNAT</th>
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

function activarNavegacionScroll() {
  const enlaces = document.querySelectorAll("nav.indice a");
  const secciones = document.querySelectorAll("section.bloque");

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          enlaces.forEach((a) => a.classList.remove("activo"));
          const activo = document.querySelector(
            `nav.indice a[href="#${entrada.target.id}"]`
          );
          if (activo) activo.classList.add("activo");
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );

  secciones.forEach((s) => observador.observe(s));
}

function renderCalculadora(elemento) {
  const html = `
    <section class="bloque" id="calculadora">
      <h2>Calculadora rápida de depreciación</h2>
      <p>Ingresa el costo del activo y su vida útil para estimar la depreciación anual y mensual en línea recta.</p>
      <div class="calculadora">
        <div class="campo">
          <label for="calc-costo">Costo del activo (S/)</label>
          <input type="number" id="calc-costo" min="0" step="0.01" placeholder="Ej. 3500" />
        </div>
        <div class="campo">
          <label for="calc-vida">Vida útil (años)</label>
          <input type="number" id="calc-vida" min="1" step="1" placeholder="Ej. 4" />
        </div>
        <div class="resultado" id="calc-resultado">
          Completa ambos campos para ver el resultado.
        </div>
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

    if (!costo || !vida || costo <= 0 || vida <= 0) {
      resultado.textContent = "Completa ambos campos para ver el resultado.";
      return;
    }

    const anual = costo / vida;
    const mensual = anual / 12;
    const tasaAnual = (100 / vida).toFixed(1);

    resultado.innerHTML = `
      Depreciación anual: <strong>S/ ${anual.toFixed(2)}</strong>
      (equivalente a ${tasaAnual}% del costo) ·
      Depreciación mensual: <strong>S/ ${mensual.toFixed(2)}</strong>
    `;
  }

  inputCosto.addEventListener("input", calcular);
  inputVida.addEventListener("input", calcular);
}

function activarAnimacionEntrada() {
  const secciones = document.querySelectorAll("section.bloque");
  const observador = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          obs.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  secciones.forEach((s) => observador.observe(s));
}

function activarToggleTema() {
  const boton = document.getElementById("toggle-tema");
  const raiz = document.documentElement;
  const temaGuardado = localStorage.getItem("tema-preferido");

  if (temaGuardado === "oscuro") {
    raiz.setAttribute("data-tema", "oscuro");
    boton.textContent = "☀️ Claro";
  }

  boton.addEventListener("click", () => {
    const esOscuro = raiz.getAttribute("data-tema") === "oscuro";
    if (esOscuro) {
      raiz.removeAttribute("data-tema");
      boton.textContent = "🌙 Oscuro";
      localStorage.setItem("tema-preferido", "claro");
    } else {
      raiz.setAttribute("data-tema", "oscuro");
      boton.textContent = "☀️ Claro";
      localStorage.setItem("tema-preferido", "oscuro");
    }
  });
}

document.addEventListener("DOMContentLoaded", cargarContenido);
