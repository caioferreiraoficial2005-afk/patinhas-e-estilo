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
     · vídeo do sobre, carregado só quando a seção aparece
   Configuração que o script precisa vem de data-* no HTML:
     <body data-whatsapp="5582999999999">
     <a class="js-zap" data-mensagem="Olá! ...">
     <span data-pata-ocorrencia="2">Nome</span>
   ========================================================= */

/* =========================================================
   PATA NO LUGAR DO "o"
   Todo elemento com data-pata-ocorrencia="N" tem a N-ésima
   letra "o" do texto trocada por uma patinha SVG. Conta "o" e
   "O" juntos: as marcas d'água são caixa alta. Cuidado ao
   mexer num N que já existe: em "Onde estamos" o primeiro
   "O" é o da palavra "Onde".
   0 ou vazio = fica como está. O texto completo continua
   disponível pra leitor de tela num <span class="sr-only">.
   Neste site (18/09/2026) são 4, um por trecho da página, e
   sempre caindo numa palavra que quer dizer alguma coisa:
     · hero .............. am[pata]r
     · sobre ............. banh[pata]
     · galeria ........... trabalh[pata]s
     · contato ........... estam[pata]s
   O cabeçalho e o rodapé do template usavam patinha no
   wordmark, mas aqui os dois viraram logo em imagem, então
   sobrou espaço. Ficaram DE FORA de propósito: serviços,
   equipe, formação e depoimentos: se entrar em todo título
   vira maneirismo e nenhuma chama atenção. Antes de somar
   uma quinta, tire uma.
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
      if ((texto[i] === "o" || texto[i] === "O") && ++vistos === n) { pos = i; break; }
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
    if (el.getAttribute("aria-hidden") === "true") {
      // marca d'agua e afins: ja invisivel pro leitor de tela, nao precisa do sr-only
      el.innerHTML = visual;
    } else if (el.classList.contains("marca__nome")) {
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
   GALERIA · esteira contínua
   As células do HTML são duplicadas e o trilho anda 50% em
   loop por animação CSS (galeria-anda). Aqui só se duplica e
   se calcula a duração: 4 s por foto, pra ficar no mesmo
   ritmo com 3 ou com 10 fotos. Pausa no hover (CSS) e não
   anda com prefers-reduced-motion.
   ========================================================= */
function iniciarGaleria() {
  const trilho = document.getElementById("js-galeria-trilho");
  if (!trilho) return;
  const originais = [...trilho.querySelectorAll(".galeria__celula")];
  if (originais.length === 0) return;
  originais.forEach(c => {
    const copia = c.cloneNode(true);
    copia.setAttribute("aria-hidden", "true");
    trilho.appendChild(copia);
  });
  trilho.style.setProperty("--galeria-duracao", `${originais.length * 4}s`);
  trilho.classList.add("galeria__trilho--anda");
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
   VÍDEO DO SOBRE · o <video> vem sem src. Quando a seção chega
   perto da tela, o src entra e ele toca (mudo, em loop). Não
   carrega com prefers-reduced-motion nem com economia de dados
   do aparelho: aí fica o poster, que é a foto de antes.
   ========================================================= */
function iniciarVideoSobre() {
  const video = document.querySelector(".video-sobre");
  if (!video || !video.dataset.src) return;
  if (reduzMovimento() || navigator.connection?.saveData) return;
  const carregar = () => {
    if (video.src) return;
    video.autoplay = true;
    video.src = video.dataset.src;
    video.play().catch(() => {});
  };
  if (!("IntersectionObserver" in window)) { carregar(); return; }
  const obs = new IntersectionObserver((entradas, o) => {
    entradas.forEach(e => { if (e.isIntersecting) { carregar(); o.disconnect(); } });
  }, { rootMargin: "240px 0px" });
  obs.observe(video);
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
  iniciarVideoSobre();
  const ano = document.getElementById("js-ano");
  if (ano) ano.textContent = new Date().getFullYear();
});
