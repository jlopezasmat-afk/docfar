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
    activarNavegacionScroll();
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

document.addEventListener("DOMContentLoaded", cargarContenido);
