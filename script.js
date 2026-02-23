const BANCAS = [
  { name: "BIGODE LOTERIAS", dotClass: "dot-1" },
  { name: "SEU BICHO", dotClass: "dot-2" },
  { name: "VAI DE BICHO", dotClass: "dot-3" },
  { name: "ALVO LOTERIAS", dotClass: "dot-4" },
];

const DIAS = ["SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO","DOMINGO"];

const ANIMAIS = [
  { grupo: "G01", animal: "Avestruz",  dezenas: [1,2,3,4] },
  { grupo: "G02", animal: "Águia",     dezenas: [5,6,7,8] },
  { grupo: "G03", animal: "Burro",     dezenas: [9,10,11,12] },
  { grupo: "G04", animal: "Borboleta", dezenas: [13,14,15,16] },
  { grupo: "G05", animal: "Cachorro",  dezenas: [17,18,19,20] },
  { grupo: "G06", animal: "Cabra",     dezenas: [21,22,23,24] },
  { grupo: "G07", animal: "Carneiro",  dezenas: [25,26,27,28] },
  { grupo: "G08", animal: "Camelo",    dezenas: [29,30,31,32] },
  { grupo: "G09", animal: "Cobra",     dezenas: [33,34,35,36] },
  { grupo: "G10", animal: "Coelho",    dezenas: [37,38,39,40] },
  { grupo: "G11", animal: "Cavalo",    dezenas: [41,42,43,44] },
  { grupo: "G12", animal: "Elefante",  dezenas: [45,46,47,48] },
  { grupo: "G13", animal: "Galo",      dezenas: [49,50,51,52] },
  { grupo: "G14", animal: "Gato",      dezenas: [53,54,55,56] },
  { grupo: "G15", animal: "Jacaré",    dezenas: [57,58,59,60] },
  { grupo: "G16", animal: "Leão",      dezenas: [61,62,63,64] },
  { grupo: "G17", animal: "Macaco",    dezenas: [65,66,67,68] },
  { grupo: "G18", animal: "Porco",     dezenas: [69,70,71,72] },
  { grupo: "G19", animal: "Pavão",     dezenas: [73,74,75,76] },
  { grupo: "G20", animal: "Peru",      dezenas: [77,78,79,80] },
  { grupo: "G21", animal: "Touro",     dezenas: [81,82,83,84] },
  { grupo: "G22", animal: "Tigre",     dezenas: [85,86,87,88] },
  { grupo: "G23", animal: "Urso",      dezenas: [89,90,91,92] },
  { grupo: "G24", animal: "Veado",     dezenas: [93,94,95,96] },
  { grupo: "G25", animal: "Vaca",      dezenas: [97,98,99,0] },
];

function rng(seed) {
  let s = seed;
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt2(n) { return String(n).padStart(2,'0'); }
function fmt4(n) { return String(n).padStart(4,'0'); }

function genMilhares(seed) {
  // Generate 4 unique 4-digit numbers, no repeated pair
  const rand = rng(seed);
  const used = new Set();
  const result = [];
  while(result.length < 4) {
    const n = Math.floor(rand() * 10000);
    const k = fmt4(n);
    if(!used.has(k)) { used.add(k); result.push(k); }
  }
  return result;
}

function generate() {
  // Master seed based on timestamp (different each call)
  const masterSeed = Date.now() ^ (Math.random() * 0xFFFFFFFF | 0);
  const rand = rng(masterSeed);

  // Track global milhar usage across all bancas/dias to avoid repetition
  const globalMilhares = new Set();

  function uniqueMilhares(seed, dezenas) {
    // Each milhar ABCD must end with CD equal to one of the group's dezenas
    const r = rng(seed);
    const sortedDez = [...dezenas].sort((a, b) => (a % 100) - (b % 100));
    const result = [];
    for (let i = 0; i < 4; i++) {
      const cd = sortedDez[i] % 100;
      let found = false;
      let tries = 0;
      while (tries < 300 && !found) {
        tries++;
        const ab = Math.floor(r() * 100);
        const k = fmt4(ab * 100 + cd);
        if (!globalMilhares.has(k)) {
          globalMilhares.add(k);
          result.push(k);
          found = true;
        }
      }
      if (!found) {
        for (let ab = 0; ab < 100; ab++) {
          const k = fmt4(ab * 100 + cd);
          if (!globalMilhares.has(k)) {
            globalMilhares.add(k);
            result.push(k);
            break;
          }
        }
      }
    }
    return result;
  }

  let html = '';

  BANCAS.forEach((banca, bi) => {
    // Pick 6 unique groups per day, varied per banca
    const bancaSeed = (masterSeed ^ (bi * 0x9E3779B9)) >>> 0;
    const bancaRand = rng(bancaSeed);

    html += `<div class="banca">`;
    html += `<div class="banca-header"><span class="dot ${banca.dotClass}"></span><span class="banca-title">${banca.name}</span></div>`;

    // Each banca gets a shuffled pool of all 25 groups, then picks 6 per day sequentially
    let pool = shuffle(ANIMAIS, bancaRand);
    // We need 7 days × 6 = 42 groups, but only 25 exist; re-shuffle and continue
    let bigPool = [];
    while(bigPool.length < 42) bigPool = bigPool.concat(shuffle(ANIMAIS, rng(bancaRand() * 0xFFFFFF | 0)));
    bigPool = bigPool.slice(0, 42);

    DIAS.forEach((dia, di) => {
      const dayGroups = bigPool.slice(di * 6, di * 6 + 6).sort((a, b) => parseInt(a.grupo.slice(1)) - parseInt(b.grupo.slice(1)));
      html += `<div class="dia-section">`;
      html += `<div class="dia-label">${dia}</div>`;
      html += `<table><thead><tr><th>Grupo</th><th>Animal</th><th>Dezenas</th><th>Milhares</th></tr></thead><tbody>`;
      dayGroups.forEach((g, gi) => {
        const dezStr = g.dezenas
          .map(d => `<span class="dezena">${fmt2(d)}</span>`)
          .join(' • ');
        const milSeed = (bancaSeed ^ (di * 31 + gi) * 0x6C62272E) >>> 0;
        const mils = uniqueMilhares(milSeed, g.dezenas);
        const milStr = [
          [mils[0], mils[1]],
          [mils[2], mils[3]]
        ].map(par => 
          `<span class="mil-par" onclick="copyMil(this)" title="Clique para copiar">${par[0]} <span class="sep">•</span> ${par[1]}</span>`
        ).join('<span class="sep"> • </span>');

        html += `<tr>
          <td class="grupo">${g.grupo}</td>
          <td class="animal">${g.animal}</td>
          <td class="dezenas">${dezStr}</td>
          <td class="milhares">${milStr}</td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
    });

    html += `</div>`;
  });

  document.getElementById('output').innerHTML = html;

  const now = new Date();
  // Find Monday of current week
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const mon = new Date(now); mon.setDate(now.getDate() + diff);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const fmt = d => d.toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric'});
  document.getElementById('weekLabel').textContent = `Semana: ${fmt(mon)} a ${fmt(sun)}`;

  document.getElementById('output').innerHTML = html;
  document.getElementById('weekLabel').textContent = `Semana: ${fmt(mon)} a ${fmt(sun)}`;
  
  // Salvar no localStorage
  localStorage.setItem('palpites_html', html);
  localStorage.setItem('palpites_label', `Semana: ${fmt(mon)} a ${fmt(sun)}`);
}

const savedHtml = localStorage.getItem('palpites_html');
const savedLabel = localStorage.getItem('palpites_label');

if (savedHtml && savedLabel) {
  document.getElementById('output').innerHTML = savedHtml;
  document.getElementById('weekLabel').textContent = savedLabel;
} else {
  generate(); // só gera se não houver nada salvo
}

function copyMil(el) {
  const texto = el.innerText.replace(/•/g, '').trim().replace(/\s+/g, ' • ');
  navigator.clipboard.writeText(texto);
  el.classList.add('copiado');
  setTimeout(() => el.classList.remove('copiado'), 1000);
}