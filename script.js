// Reemplaza únicamente la función renderNav dentro de tu script.js por esta:
function renderNav(elemento, secciones) {
  const iconos = {
    "definicion": "📖",
    "caracteristicas": "⚡",
    "marco-normativo": "⚖️",
    "reconocimiento": "🏷️",
    "depreciacion": "📉",
    "clasificacion": "📊",
    "ejercicios": "🧠",
    "registro": "➕",
    "calculadora": "🧮"
  };

  const items = secciones
    .map((s) => `<li><button type="button" class="nav-btn" data-target="${s.id}"><span>${iconos[s.id] || "📄"}</span>${s.titulo.split(" ")[0]}</button></li>`)
    .join("");

  elemento.innerHTML = `
    <ul>
      ${items}
      <li><button type="button" class="nav-btn" data-target="clasificacion"><span>📊</span>Clasif.</button></li>
      <li><button type="button" class="nav-btn" data-target="ejercicios"><span>🧠</span>Ejercicios</button></li>
      <li><button type="button" class="nav-btn" data-target="calculadora"><span>🧮</span>Calc.</button></li>
      <li><button type="button" class="nav-btn" data-target="registro"><span>➕</span>Registro</button></li>
    </ul>
  `;
}
