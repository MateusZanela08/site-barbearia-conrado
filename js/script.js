// =========================================================
// CONRADO'S BARBER – funcionamento do site
// =========================================================

// ===== CONFIGURAÇÕES (é só mudar aqui) =====

// Link de agendamento do AppBarber (página oficial da Conrado's).
// Todos os botões com "data-agendar" no HTML usam esse link.
// Obs.: o AppBarber bloqueia aparecer dentro de outro site (iframe),
// por isso o agendamento abre numa aba nova.
const LINK_AGENDAMENTO = "https://sites.appbarber.com.br/conradosbarber";

// WhatsApp com DDI + DDD + número, só números. Ex.: "5548999999999"
// Enquanto estiver vazio, os botões de WhatsApp ficam escondidos.
const WHATSAPP = "554837712543";
// Mensagem padrão. Um botão pode ter a própria mensagem com data-mensagem="..." no HTML.
const MENSAGEM_WHATSAPP = "Olá! Vim pelo site e gostaria de mais informações.";

// Horário de funcionamento (0 = domingo, 1 = segunda ... 6 = sábado).
// null = fechado. Os números são as horas: [abre, fecha].
const HORARIOS = {
    0: null,
    1: [9, 20],
    2: [9, 20],
    3: [9, 20],
    4: [9, 20],
    5: [9, 20],
    6: [9, 14],
};

const NOMES_DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

// ===== LINKS DE AGENDAMENTO E WHATSAPP =====
document.querySelectorAll("[data-agendar]").forEach(function (botao) {
    botao.href = LINK_AGENDAMENTO;
    botao.target = "_blank";
    botao.rel = "noopener";
});

document.querySelectorAll("[data-whatsapp]").forEach(function (botao) {
    if (WHATSAPP === "") {
        botao.hidden = true;
        return;
    }
    // usa a mensagem do botão (data-mensagem) se tiver; senão, a padrão
    const mensagem = botao.dataset.mensagem || MENSAGEM_WHATSAPP;
    botao.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(mensagem);
    botao.target = "_blank";
    botao.rel = "noopener";
});

// ===== NAVEGAÇÃO ENTRE AS "PÁGINAS" =====
// O index.html tem vários blocos <div class="pagina">: início, serviços, galeria...
// Ao clicar num link como href="#galeria", mostramos só a página certa
// e escondemos as outras (igual ao site do Paula Ramos).
const paginas = document.querySelectorAll(".pagina");

// em qual página está cada seção (id da seção → nome da página)
const PAGINA_DE = {
    inicio: "inicio",
    sobre: "inicio",
    servicos: "servicos",
    galeria: "galeria",
    equipe: "equipe",
    loja: "loja",
    agendar: "agendar",
    "baixar-app": "agendar",
    contato: "contato",
};

function mostrarPagina(nome) {
    paginas.forEach(function (pagina) {
        pagina.hidden = pagina.dataset.pagina !== nome;
    });

    // destaca no menu o link da página aberta
    document.querySelectorAll("[data-link-pagina]").forEach(function (link) {
        link.classList.toggle("ativo", link.dataset.linkPagina === nome);
    });
}

function irPara(id, suave) {
    const nome = PAGINA_DE[id] || "inicio";
    mostrarPagina(nome);

    const secao = document.getElementById(id);
    if (id !== nome && secao) {
        // a seção fica no meio da página (ex.: "sobre" dentro do início): rola até ela
        requestAnimationFrame(function () {
            secao.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
        });
    } else {
        // página nova: começa lá do topo
        // "instant" pula direto, sem a rolagem suave do CSS
        window.scrollTo({ top: 0, behavior: "instant" });
    }
}

// todos os links internos (href começando com #) passam pela função irPara
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    const id = link.getAttribute("href").slice(1); // tira o "#"
    if (!(id in PAGINA_DE)) return;

    link.addEventListener("click", function (evento) {
        evento.preventDefault(); // impede o pulo padrão do navegador
        irPara(id, true);
        // guarda no histórico, assim o botão "voltar" do navegador funciona
        // e dá para compartilhar o link de uma página (ex.: site.com/#galeria)
        history.pushState(null, "", "#" + id);
    });
});

// botão "voltar" / "avançar" do navegador
window.addEventListener("popstate", function () {
    const id = location.hash.slice(1);
    irPara(id in PAGINA_DE ? id : "inicio", false);
});

// ao abrir o site já com um #endereço (ex.: site.com/#galeria), vai direto para lá
const enderecoInicial = location.hash.slice(1);
irPara(enderecoInicial in PAGINA_DE ? enderecoInicial : "inicio", false);

// ===== CABEÇALHO E BOTÃO FLUTUANTE AO ROLAR =====
const topo = document.getElementById("topo");
const flutuante = document.getElementById("agendar-flutuante");

function aoRolar() {
    const rolagem = window.scrollY;
    topo.classList.toggle("rolou", rolagem > 30);
    flutuante.classList.toggle("visivel", rolagem > 600);
}

window.addEventListener("scroll", aoRolar, { passive: true });
aoRolar();

// ===== MENU DO CELULAR =====
const menu = document.getElementById("menu");
const botaoMenu = document.getElementById("menu-abrir");

function fecharMenu() {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
}

botaoMenu.addEventListener("click", function () {
    const abriu = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", abriu);
});

// fecha o menu quando a pessoa clica em algum link
menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", fecharMenu);
});

// ===== ANIMAÇÃO: ELEMENTOS APARECEM AO ROLAR =====
const elementos = document.querySelectorAll(".revelar");

if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(
        function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    const alvo = entrada.target;
                    alvo.classList.add("apareceu");
                    observador.unobserve(alvo);

                    // depois que terminou de aparecer, tira a animação de entrada
                    // para o efeito de passar o mouse voltar a ser rápido
                    alvo.addEventListener("transitionend", function limpar() {
                        alvo.classList.remove("revelar", "apareceu");
                        alvo.style.transitionDelay = "";
                        alvo.removeEventListener("transitionend", limpar);
                    });
                }
            });
        },
        { threshold: 0.15 },
    );

    elementos.forEach(function (elemento) {
        // cartões lado a lado aparecem um pouquinho depois do outro (efeito cascata)
        const irmaos = Array.from(elemento.parentElement.children).filter(function (el) {
            return el.classList.contains("revelar");
        });
        elemento.style.transitionDelay = irmaos.indexOf(elemento) * 0.1 + "s";
        observador.observe(elemento);
    });
} else {
    elementos.forEach(function (elemento) {
        elemento.classList.add("apareceu");
    });
}

// ===== GALERIA: LIGHTBOX (FOTO GRANDE) =====
const fotos = Array.from(document.querySelectorAll("#galeria-fotos .foto img"));
const lightbox = document.getElementById("lightbox");
const imagemGrande = document.getElementById("lightbox-imagem");
const contador = document.getElementById("lightbox-contador");
let fotoAtual = 0;

function mostrarFoto(indice) {
    // o "% fotos.length" faz voltar para a primeira depois da última (e vice-versa)
    fotoAtual = (indice + fotos.length) % fotos.length;
    imagemGrande.src = fotos[fotoAtual].src;
    imagemGrande.alt = fotos[fotoAtual].alt;
    contador.textContent = fotoAtual + 1 + " / " + fotos.length;
}

function abrirLightbox(indice) {
    mostrarFoto(indice);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden"; // trava a rolagem da página por trás
    document.getElementById("lightbox-fechar").focus();
}

function fecharLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    fotos[fotoAtual].parentElement.focus();
}

fotos.forEach(function (foto, indice) {
    foto.parentElement.addEventListener("click", function () {
        abrirLightbox(indice);
    });
});

document.getElementById("lightbox-fechar").addEventListener("click", fecharLightbox);
document.getElementById("lightbox-anterior").addEventListener("click", function () {
    mostrarFoto(fotoAtual - 1);
});
document.getElementById("lightbox-proxima").addEventListener("click", function () {
    mostrarFoto(fotoAtual + 1);
});

// clicar no fundo escuro (fora da foto) também fecha
lightbox.addEventListener("click", function (evento) {
    if (evento.target === lightbox) {
        fecharLightbox();
    }
});

// teclado: Esc fecha, setas passam as fotos
document.addEventListener("keydown", function (evento) {
    if (lightbox.hidden) return;
    if (evento.key === "Escape") fecharLightbox();
    if (evento.key === "ArrowLeft") mostrarFoto(fotoAtual - 1);
    if (evento.key === "ArrowRight") mostrarFoto(fotoAtual + 1);
});

// celular: arrastar o dedo para os lados passa as fotos
let toqueInicio = null;
lightbox.addEventListener(
    "touchstart",
    function (evento) {
        toqueInicio = evento.touches[0].clientX;
    },
    { passive: true },
);
lightbox.addEventListener("touchend", function (evento) {
    if (toqueInicio === null) return;
    const distancia = evento.changedTouches[0].clientX - toqueInicio;
    if (Math.abs(distancia) > 50) {
        mostrarFoto(fotoAtual + (distancia < 0 ? 1 : -1));
    }
    toqueInicio = null;
});

// ===== ABERTO OU FECHADO AGORA =====
// Usa o horário de Brasília, mesmo que a pessoa esteja em outro fuso.
function agoraEmFloripa() {
    const partes = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
    }).formatToParts(new Date());

    const valor = function (tipo) {
        return partes.find(function (p) {
            return p.type === tipo;
        }).value;
    };

    const dias = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return {
        dia: dias.indexOf(valor("weekday")),
        horas: Number(valor("hour")) + Number(valor("minute")) / 60,
    };
}

function formatarHora(hora) {
    return String(hora).padStart(2, "0") + ":00";
}

function atualizarStatus() {
    const agora = agoraEmFloripa();
    const status = document.getElementById("status");
    const texto = document.getElementById("status-texto");

    // destaca o dia de hoje na lista
    document.querySelectorAll("#horarios li").forEach(function (item) {
        item.classList.toggle("hoje", Number(item.dataset.dia) === agora.dia);
    });

    const hoje = HORARIOS[agora.dia];
    const estaAberto = hoje && agora.horas >= hoje[0] && agora.horas < hoje[1];

    if (estaAberto) {
        status.className = "status aberto";
        texto.textContent = "Aberto agora · fecha às " + formatarHora(hoje[1]);
        return;
    }

    // procura o próximo horário de abertura
    status.className = "status fechado-agora";

    if (hoje && agora.horas < hoje[0]) {
        texto.textContent = "Fechado agora · abre hoje às " + formatarHora(hoje[0]);
        return;
    }

    for (let i = 1; i <= 7; i++) {
        const dia = (agora.dia + i) % 7;
        if (HORARIOS[dia]) {
            const quando = i === 1 ? "amanhã" : NOMES_DIAS[dia];
            texto.textContent = "Fechado agora · abre " + quando + " às " + formatarHora(HORARIOS[dia][0]);
            return;
        }
    }
}

atualizarStatus();
setInterval(atualizarStatus, 60000); // confere de novo a cada 1 minuto

// ===== ANO NO RODAPÉ =====
document.getElementById("ano").textContent = new Date().getFullYear();
