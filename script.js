/* =========================================================
   TEMPLATE PETSHOP · comportamento
   Este arquivo NÃO tem conteúdo. Todo texto, número e foto
   vive no index.html (gerado a partir do JSON). Aqui ficam só:
     · links de WhatsApp com mensagem pré-preenchida
     · carrossel "O que oferecemos"
     · esteira da galeria
     · carrossel de depoimentos
     · menu mobile, link ativo do menu, entradas ao rolar
     · patinha no lugar de um "o" (wordmark e título do hero)
   Configuração que o script precisa vem de data-* no HTML:
     <body data-whatsapp="5582999999999">
     <a class="js-zap" data-mensagem="Olá! ...">
     <span data-pata-ocorrencia="2">Nome</span>
   ========================================================= */

/* =========================================================
   PATA NO LUGAR DO "o"
   Todo elemento com data-pata-ocorrencia="N" tem a N-ésima
   letra "o" (minúscula) do texto trocada por uma patinha SVG.
   0 ou vazio = fica como está. O texto completo continua
   disponível pra leitor de tela num <span class="sr-only">.
   Use em no máximo 3 lugares (wordmark do cabeçalho, título
   do hero, wordmark do rodapé); mais que isso cansa.
   ========================================================= */
function escaparHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function iniciarPataLetra() {
  document.querySelectorAll("[data-pata-ocorrencia]").forEach(el => {
    const n = parseInt(el.dataset.pataOcorrencia, 10);
    const texto = el.textContent.trim();
    if (!n || n < 1 || !texto) return;
    let vistos = 0, pos = -1;
    for (let i = 0; i < texto.length; i++) {
      if (texto[i] === "o" && ++vistos === n) { pos = i; break; }
    }
    if (pos < 0) return;
    const ini = texto.lastIndexOf(" ", pos) + 1;
    let fim = texto.indexOf(" ", pos); if (fim < 0) fim = texto.length;
    const svg = '<svg class="pata-letra"><use href="#icon-pata"/></svg>';
    const palavra = escaparHtml(texto.slice(ini, pos)) + svg + escaparHtml(texto.slice(pos + 1, fim));
    // a palavra com a pata não pode quebrar de linha no meio
    const visual = texto.includes(" ")
      ? `${escaparHtml(texto.slice(0, ini))}<span class="palavra-pata">${palavra}</span>${escaparHtml(texto.slice(fim))}`
      : palavra;
    const srOnly = `<span class="sr-only">${escaparHtml(texto)}</span>`;
    if (el.classList.contains("marca__nome")) {
      el.insertAdjacentHTML("beforebegin", srOnly);
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = visual;
    } else {
      el.innerHTML = `${srOnly}<span aria-hidden="true">${visual}</span>`;
    }
  });
}

/* =========================================================
   WHATSAPP · monta wa.me/NUMERO?text=MENSAGEM em cada .js-zap
   ========================================================= */
function ligarBotoesZap() {
  const numero = (document.body.dataset.whatsapp || "").replace(/\D/g, "");
  if (!numero) return;
  document.querySelectorAll(".js-zap").forEach(link => {
    const mensagem = link.dataset.mensagem || "";
    link.href = mensagem
      ? `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
      : `https://wa.me/${numero}`;
  });
}

function reduzMovimento() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* =========================================================
   O QUE OFERECEMOS · carrossel texto + foto
   Os slides já estão no HTML; aqui só criamos as bolinhas,
   marcamos o ativo e cuidamos do avanço automático.
   ========================================================= */
// cada texto tem uns 40 palavras, perto de 10s de leitura. 6000 dá tempo
// de ler o primeiro parágrafo sem pressa.
const OFERECE_INTERVALO = 6000;
let ofereceAtual = 0;
let ofereceTimer = null;

function iniciarOferecemos() {
  const slides = document.querySelectorAll(".oferece-slide");
  const pontos = document.getElementById("js-oferecemos-pontos");
  if (!slides.length || !pontos) return;

  pontos.innerHTML = [...slides].map((s, i) => {
    const titulo = s.querySelector("h3")?.textContent.trim() || `slide ${i + 1}`;
    return `<button type="button" aria-label="Ver serviço: ${titulo}" data-indice="${i}"></button>`;
  }).join("");

  pontos.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      irParaOferece(Number(btn.dataset.indice));
      reiniciarAutoAvancoOferece();
    });
  });

  document.getElementById("js-oferece-anterior")?.addEventListener("click", () => {
    irParaOferece((ofereceAtual - 1 + slides.length) % slides.length);
    reiniciarAutoAvancoOferece();
  });
  document.getElementById("js-oferece-proximo")?.addEventListener("click", () => {
    irParaOferece((ofereceAtual + 1) % slides.length);
    reiniciarAutoAvancoOferece();
  });

  // pausa o avanço enquanto o mouse/foco está no carrossel
  const carrossel = document.querySelector(".oferecemos__carrossel");
  if (carrossel) {
    carrossel.addEventListener("mouseenter", () => clearInterval(ofereceTimer));
    carrossel.addEventListener("mouseleave", reiniciarAutoAvancoOferece);
    carrossel.addEventListener("focusin", () => clearInterval(ofereceTimer));
    carrossel.addEventListener("focusout", e => {
      if (!carrossel.contains(e.relatedTarget)) reiniciarAutoAvancoOferece();
    });
  }

  irParaOferece(0);
  reiniciarAutoAvancoOferece();
}

function irParaOferece(indice) {
  ofereceAtual = indice;
  document.querySelectorAll(".oferece-slide").forEach((el, i) => el.classList.toggle("ativo", i === indice));
  document.querySelectorAll(".oferece-imagem").forEach((el, i) => el.classList.toggle("ativo", i === indice));
  document.querySelectorAll("#js-oferecemos-pontos button").forEach((el, i) => el.classList.toggle("ativo", i === indice));
}

function reiniciarAutoAvancoOferece() {
  clearInterval(ofereceTimer);
  const total = document.querySelectorAll(".oferece-slide").length;
  if (reduzMovimento() || total <= 1) return;
  ofereceTimer = setInterval(() => irParaOferece((ofereceAtual + 1) % total), OFERECE_INTERVALO);
}

/* =========================================================
   GALERIA · esteira com loop infinito
   As células do HTML são triplicadas; a esteira desliza de
   verdade (transform) e, ao sair da faixa do meio, pula sem
   transição pro mesmo ponto no bloco central.
   ========================================================= */
let galeriaTotal = 0;
let galeriaIndiceAtual = 0; // índice dentro do array TRIPLICADO
let galeriaTimer = null;
let galeriaSaltoTimeout = null;
const GALERIA_INTERVALO = 2000;
const GALERIA_TRANSICAO_MS = 600;

// mesmos números do CSS (.galeria__celula flex-basis e .galeria__trilho gap)
const GALERIA_PCT_CELULA_MOBILE = 0.76; // < 700px: 1 foto grande, vizinhas espiando
const GALERIA_PCT_GAP_MOBILE    = 0.04;
const GALERIA_PCT_CELULA        = 0.32; // >= 700px: 3 fotos de uma vez
const GALERIA_PCT_GAP           = 0.02;

function galeriaEhMobile() {
  return window.matchMedia("(max-width: 699px)").matches;
}

function medirCelulaGaleria() {
  const viewport = document.getElementById("js-galeria-viewport");
  const larguraViewport = viewport ? viewport.getBoundingClientRect().width : 0;
  const mobile = galeriaEhMobile();
  return {
    largura: larguraViewport * (mobile ? GALERIA_PCT_CELULA_MOBILE : GALERIA_PCT_CELULA),
    espaco: larguraViewport * (mobile ? GALERIA_PCT_GAP_MOBILE : GALERIA_PCT_GAP),
    larguraViewport
  };
}

function posicionarGaleria(comTransicao) {
  const trilho = document.getElementById("js-galeria-trilho");
  if (!trilho) return;

  trilho.querySelectorAll(".galeria__celula").forEach((el, i) => {
    el.classList.toggle("galeria__celula--ativa", i === galeriaIndiceAtual);
  });

  const { largura, espaco, larguraViewport } = medirCelulaGaleria();
  const passo = largura + espaco;
  const offset = galeriaIndiceAtual * passo + largura / 2 - larguraViewport / 2;

  trilho.style.transition = (comTransicao && !reduzMovimento()) ? "" : "none";
  trilho.style.transform = `translateX(${-offset}px)`;
}

function girarGaleria(passos) {
  if (!passos) return;
  galeriaIndiceAtual += passos;
  posicionarGaleria(true);

  clearTimeout(galeriaSaltoTimeout);
  galeriaSaltoTimeout = setTimeout(() => {
    const normalizado = ((galeriaIndiceAtual % galeriaTotal) + galeriaTotal) % galeriaTotal;
    galeriaIndiceAtual = normalizado + galeriaTotal;
    posicionarGaleria(false);
  }, GALERIA_TRANSICAO_MS + 60);
}

function reiniciarAutoAvancoGaleria() {
  clearInterval(galeriaTimer);
  if (reduzMovimento() || galeriaTotal <= 1) return;
  galeriaTimer = setInterval(() => girarGaleria(1), GALERIA_INTERVALO);
}

function iniciarGaleria() {
  const trilho = document.getElementById("js-galeria-trilho");
  if (!trilho) return;

  const originais = [...trilho.querySelectorAll(".galeria__celula")];
  galeriaTotal = originais.length;
  if (galeriaTotal === 0) return;

  // triplica: bloco da esquerda + original (meio) + bloco da direita
  originais.forEach(c => trilho.appendChild(c.cloneNode(true)));
  originais.forEach(c => trilho.appendChild(c.cloneNode(true)));

  // começa no bloco do meio, centralizado na 2ª foto
  galeriaIndiceAtual = galeriaTotal + Math.min(1, galeriaTotal - 1);
  posicionarGaleria(false);
  reiniciarAutoAvancoGaleria();

  // reposiciona sempre que a largura real do carrossel mudar
  const viewportEl = document.getElementById("js-galeria-viewport");
  if (viewportEl && window.ResizeObserver) {
    new ResizeObserver(() => posicionarGaleria(false)).observe(viewportEl);
  }
}

/* =========================================================
   DEPOIMENTOS · carrossel com bolinhas
   ========================================================= */
let depoimentoAtual = 0;
let depoimentosTimer = null;

function iniciarDepoimentos() {
  const slides = document.querySelectorAll(".depoimento-slide");
  const pontos = document.getElementById("js-depoimentos-pontos");
  if (!slides.length || !pontos) return;

  pontos.innerHTML = [...slides].map((_, i) =>
    `<button type="button" aria-label="Ver depoimento ${i + 1}" data-indice="${i}"></button>`
  ).join("");

  pontos.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      irParaDepoimento(Number(btn.dataset.indice));
      reiniciarAutoAvancoDepoimentos();
    });
  });

  irParaDepoimento(0);
  reiniciarAutoAvancoDepoimentos();
}

function irParaDepoimento(indice) {
  depoimentoAtual = indice;
  document.querySelectorAll(".depoimento-slide").forEach((el, i) => el.classList.toggle("ativo", i === indice));
  document.querySelectorAll("#js-depoimentos-pontos button").forEach((el, i) => el.classList.toggle("ativo", i === indice));
}

function reiniciarAutoAvancoDepoimentos() {
  clearInterval(depoimentosTimer);
  const total = document.querySelectorAll(".depoimento-slide").length;
  if (reduzMovimento() || total <= 1) return;
  depoimentosTimer = setInterval(() => irParaDepoimento((depoimentoAtual + 1) % total), 6000);
}

/* =========================================================
   MENU MOBILE (drawer)
   ========================================================= */
function iniciarMenuMobile() {
  const nav = document.getElementById("js-nav");
  const fundo = document.getElementById("js-nav-fundo");
  const botaoAbrir = document.getElementById("js-nav-abrir");
  const botaoFechar = document.getElementById("js-nav-fechar");
  if (!nav || !fundo || !botaoAbrir || !botaoFechar) return;

  function abrir() {
    nav.classList.add("aberto");
    fundo.classList.add("aberto");
    botaoAbrir.setAttribute("aria-expanded", "true");
  }
  function fechar() {
    nav.classList.remove("aberto");
    fundo.classList.remove("aberto");
    botaoAbrir.setAttribute("aria-expanded", "false");
  }

  botaoAbrir.addEventListener("click", abrir);
  botaoFechar.addEventListener("click", fechar);
  fundo.addEventListener("click", fechar);
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", fechar));
  document.addEventListener("keydown", e => { if (e.key === "Escape") fechar(); });
}

/* marca o link ativo do menu conforme a seção visível. #galeria não tem
   link no menu de propósito: quando ela cruza a faixa o menu mantém o
   último item ativo. */
function iniciarNavAtiva() {
  const secoes = ["inicio", "sobre", "servicos", "profissionais", "certificacoes", "localizacao"]
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const links = document.querySelectorAll(".nav a");
  if (!("IntersectionObserver" in window) || secoes.length === 0) return;

  const visiveis = new Set();
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(e => { e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target); });
    const topo = [...visiveis].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
    if (topo) {
      links.forEach(a => a.classList.toggle("ativo", a.getAttribute("href") === `#${topo.id}`));
    }
  }, { rootMargin: "-40% 0px -50% 0px" });

  secoes.forEach(sec => observador.observe(sec));
}

/* =========================================================
   ENTRADAS · revelação ao rolar (ver bloco ENTRADAS no CSS)
   - [data-escalonar="90"]: cada filho vira .reveal e recebe
     --atraso = índice x 90ms, pra entrarem em sequência
   - .bloco (menos o hero) e o rodapé deslizam pro lugar
   - cada elemento revela uma vez só
   ========================================================= */
function iniciarRevelacao() {
  document.querySelectorAll("[data-escalonar]").forEach(grupo => {
    const passo = Number(grupo.dataset.escalonar) || 90;
    [...grupo.children].forEach((filho, i) => {
      filho.classList.add("reveal");
      filho.style.setProperty("--atraso", `${i * passo}ms`);
    });
  });
  document.querySelectorAll(".bloco:not(.hero), .rodape").forEach(b => b.classList.add("bloco--entra"));

  const elementos = document.querySelectorAll(".reveal");
  const blocos = document.querySelectorAll(".bloco--entra");
  if (!("IntersectionObserver" in window)) {
    [...elementos, ...blocos].forEach(el => el.classList.add("em-vista"));
    return;
  }

  // Uma foto .reveal--foto começa 100% recortada por clip-path, e o Chrome
  // considera o recorte no cálculo de interseção: ela nunca "entra" na tela.
  // Por isso quem é observado é o PAI dela; quando o pai aparece, a foto revela.
  const revelamCom = new Map(); // elemento observado -> lista de quem ganha .em-vista
  elementos.forEach(el => {
    const observado = el.classList.contains("reveal--foto") ? (el.parentElement || el) : el;
    if (!revelamCom.has(observado)) revelamCom.set(observado, []);
    revelamCom.get(observado).push(el);
  });
  blocos.forEach(el => revelamCom.set(el, [el]));

  const revelar = (entradas, obs) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      (revelamCom.get(entrada.target) || [entrada.target]).forEach(el => el.classList.add("em-vista"));
      obs.unobserve(entrada.target);
    });
  };
  const obsElementos = new IntersectionObserver(revelar, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  const obsBlocos = new IntersectionObserver(revelar, { threshold: 0.01, rootMargin: "0px 0px -4% 0px" });
  revelamCom.forEach((alvos, observado) => {
    (observado.classList.contains("bloco--entra") ? obsBlocos : obsElementos).observe(observado);
  });
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  iniciarPataLetra();
  ligarBotoesZap();
  iniciarOferecemos();
  iniciarGaleria();
  iniciarDepoimentos();
  iniciarMenuMobile();
  iniciarNavAtiva();
  iniciarRevelacao();
  const ano = document.getElementById("js-ano");
  if (ano) ano.textContent = new Date().getFullYear();
});
