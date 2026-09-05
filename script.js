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
    activarNavegacionBotones();
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
    .map((s) => `<li><button type="button" class="nav-btn" data-target="${s.id}">${s.titulo}</button></li>`)
    .join("");
  elemento.innerHTML = `
    <ul>
      ${items}
      <li><button type="button" class="nav-btn" data-target="clasificacion">Clasificación y depreciación</button></li>
      <li><button type="button" class="nav-btn" data-target="ejercicios">Ejercicios</button></li>
      <li><button type="button" class="nav-btn" data-target="registro">Registro de Activos Fijos</button></li>
      <li><button type="button" class="nav-btn" data-target="calculadora">Calculadora</button></li>
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

function activarNavegacionBotones() {
  const botones = document.querySelectorAll(".nav-btn");
  const secciones = document.querySelectorAll("section.bloque");

  function mostrarSeccion(id) {
    secciones.forEach((s) => {
      s.classList.toggle("visible", s.id === id);
    });
    botones.forEach((b) => {
      b.classList.toggle("activo", b.dataset.target === id);
    });
  }

  botones.forEach((boton) => {
    boton.addEventListener("click", () => mostrarSeccion(boton.dataset.target));
  });

  const primerId = secciones[0] ? secciones[0].id : null;
  if (primerId) mostrarSeccion(primerId);
}

function parsearFecha(texto) {
  const [d, m, y] = texto.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function mesesEntre(fechaInicio, fechaFin) {
  let meses =
    (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 +
    (fechaFin.getMonth() - fechaInicio.getMonth());
  if (fechaFin.getDate() < fechaInicio.getDate()) meses -= 1;
  return Math.max(meses, 0);
}

function calcularDepreciacion(costo, vidaUtil, fechaCompraTexto, fechaCorteTexto) {
  const depAnual = costo / vidaUtil;
  const depMensual = depAnual / 12;
  const fechaCompra = parsearFecha(fechaCompraTexto);
  const fechaCorte = parsearFecha(fechaCorteTexto);
  const meses = mesesEntre(fechaCompra, fechaCorte);
  const depAcumulada = Math.min(costo, depMensual * meses);
  const valorLibros = Math.max(costo - depAcumulada, 0);
  return { depAnual, depMensual, meses, depAcumulada, valorLibros };
}

function renderEjercicios(elemento, ejercicios) {
  if (!ejercicios) return;

  const intro = (ejercicios.intro || []).map((p) => `<p>${p}</p>`).join("");

  const tarjetas = ejercicios.practicas
    .map((p) => {
      const r = calcularDepreciacion(p.costo, p.vidaUtil, p.fechaCompra, ejercicios.fechaCorte);
      return `
        <div class="tarjeta-ejercicio">
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
          <p>Costo: <strong>S/ ${p.costo.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</strong> ·
             Vida útil: <strong>${p.vidaUtil} años</strong></p>
          <button type="button" class="btn-solucion" data-ejercicio="${p.id}">Ver solución</button>
          <div class="solucion" id="solucion-${p.id}" hidden>
            <p>Depreciación anual: <strong>S/ ${r.depAnual.toFixed(2)}</strong></p>
            <p>Depreciación mensual: <strong>S/ ${r.depMensual.toFixed(2)}</strong></p>
            <p>Meses transcurridos hasta ${ejercicios.fechaCorte}: <strong>${r.meses}</strong></p>
            <p>Depreciación acumulada: <strong>S/ ${r.depAcumulada.toFixed(2)}</strong></p>
            <p>Valor en libros: <strong>S/ ${r.valorLibros.toFixed(2)}</strong></p>
          </div>
        </div>
      `;
    })
    .join("");

  const html = `
    <section class="bloque" id="ejercicios">
      <h2>${ejercicios.titulo}</h2>
      ${intro}
      <div class="tarjetas-ejercicios">${tarjetas}</div>
    </section>
  `;
  elemento.insertAdjacentHTML("beforeend", html);

  document.querySelectorAll(".btn-solucion").forEach((boton) => {
    boton.addEventListener("click", () => {
      const panel = document.getElementById(`solucion-${boton.dataset.ejercicio}`);
      const oculto = panel.hidden;
      panel.hidden = !oculto;
      boton.textContent = oculto ? "Ocultar solución" : "Ver solución";
    });
  });
}

function cargarRegistro() {
  try {
    return JSON.parse(localStorage.getItem("registro-activos-fijos")) || [];
  } catch {
    return [];
  }
}

function guardarRegistro(lista) {
  localStorage.setItem("registro-activos-fijos", JSON.stringify(lista));
}

function isoATextoDDMMAAAA(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function pintarRegistro() {
  const cuerpo = document.getElementById("cuerpo-registro");
  if (!cuerpo) return;
  const lista = cargarRegistro();

  cuerpo.innerHTML = lista
    .map((item, indice) => {
      const r = calcularDepreciacion(
        item.costo,
        item.vidaUtil,
        isoATextoDDMMAAAA(item.fechaCompraISO),
        isoATextoDDMMAAAA(item.fechaCorteISO)
      );
      return `
        <tr>
          <td>${item.codigo}</td>
          <td>${item.descripcion}</td>
          <td>S/ ${item.costo.toFixed(2)}</td>
          <td>S/ ${r.depAnual.toFixed(2)}</td>
          <td>S/ ${r.depMensual.toFixed(2)}</td>
          <td>S/ ${r.depAcumulada.toFixed(2)}</td>
          <td class="tasa">S/ ${r.valorLibros.toFixed(2)}</td>
          <td><button type="button" class="btn-eliminar" data-indice="${indice}" aria-label="Eliminar">✕</button></td>
        </tr>
      `;
    })
    .join("");

  cuerpo.querySelectorAll(".btn-eliminar").forEach((boton) => {
    boton.addEventListener("click", () => {
      const lista = cargarRegistro();
      lista.splice(Number(boton.dataset.indice), 1);
      guardarRegistro(lista);
      pintarRegistro();
    });
  });
}

function renderRegistro(elemento) {
  const html = `
    <section class="bloque" id="registro">
      <h2>Registro de Activos Fijos</h2>
      <p>Agrega los activos reales de tu farmacia y la app calcula la depreciación acumulada y el valor en libros a la fecha de corte que elijas.</p>
      <div class="calculadora">
        <div class="campo">
          <label for="reg-codigo">Código</label>
          <input type="text" id="reg-codigo" placeholder="Ej. EA-002" />
        </div>
        <div class="campo">
          <label for="reg-descripcion">Descripción</label>
          <input type="text" id="reg-descripcion" placeholder="Ej. Vitrina exhibidora" />
        </div>
        <div class="campo">
          <label for="reg-costo">Costo (S/)</label>
          <input type="number" id="reg-costo" min="0" step="0.01" />
        </div>
        <div class="campo">
          <label for="reg-vida">Vida útil (años)</label>
          <input type="number" id="reg-vida" min="1" step="1" />
        </div>
        <div class="campo">
          <label for="reg-fecha-compra">Fecha de compra</label>
          <input type="date" id="reg-fecha-compra" />
        </div>
        <div class="campo">
          <label for="reg-fecha-corte">Fecha de corte para el cálculo</label>
          <input type="date" id="reg-fecha-corte" />
        </div>
        <button type="button" id="reg-agregar" class="btn-solucion">Agregar activo</button>
      </div>
      <div class="tabla-wrap" style="margin-top:1.2rem;">
        <table class="clasificacion" id="tabla-registro">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Costo</th>
              <th>Dep. anual</th>
              <th>Dep. mensual</th>
              <th>Dep. acumulada</th>
              <th>Valor en libros</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="cuerpo-registro"></tbody>
        </table>
      </div>
    </section>
  `;
  elemento.insertAdjacentHTML("beforeend", html);
  pintarRegistro();

  document.getElementById("reg-agregar").addEventListener("click", () => {
    const codigo = document.getElementById("reg-codigo").value.trim();
    const descripcion = document.getElementById("reg-descripcion").value.trim();
    const costo = parseFloat(document.getElementById("reg-costo").value);
    const vidaUtil = parseFloat(document.getElementById("reg-vida").value);
    const fechaCompraISO = document.getElementById("reg-fecha-compra").value;
    const fechaCorteISO = document.getElementById("reg-fecha-corte").value;

    if (!codigo || !descripcion || !costo || !vidaUtil || !fechaCompraISO || !fechaCorteISO) {
      alert("Completa todos los campos antes de agregar el activo.");
      return;
    }

    const lista = cargarRegistro();
    lista.push({ codigo, descripcion, costo, vidaUtil, fechaCompraISO, fechaCorteISO });
    guardarRegistro(lista);
    pintarRegistro();

    ["reg-codigo", "reg-descripcion", "reg-costo", "reg-vida"].forEach(
      (id) => (document.getElementById(id).value = "")
    );
  });
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
