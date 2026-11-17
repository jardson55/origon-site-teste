(function () {
  var cfg = window.ORIGON_CONFIG || {};
  var digits = String(cfg.whatsapp || "").replace(/\D/g, "");
  var email = String(cfg.email || "").trim();

  // Menu móvel
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("menu");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Link do WhatsApp com mensagem conforme o assunto (geral, importacao, site).
  function linkWhatsapp(assunto) {
    var m = cfg.mensagens || {};
    var texto = m[assunto] || m.geral || "";
    return "https://wa.me/" + digits + (texto ? "?text=" + encodeURIComponent(texto) : "");
  }
  function abrirEmNovaAba(a, href) {
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
  }

  // Botões "Solicitar orçamento": CRM, se configurado; senão WhatsApp; senão página de contato.
  var crm = String(cfg.crmUrl || "").trim();
  document.querySelectorAll("[data-quote]").forEach(function (a) {
    if (/^https:\/\//i.test(crm)) abrirEmNovaAba(a, crm);
    else if (digits) abrirEmNovaAba(a, linkWhatsapp(a.getAttribute("data-assunto") || "importacao"));
  });

  // Botões "Chamar no WhatsApp" (conversa geral ou por assunto).
  document.querySelectorAll("[data-contact-whatsapp]").forEach(function (wa) {
    if (!digits) return;
    abrirEmNovaAba(wa, linkWhatsapp(wa.getAttribute("data-assunto") || "geral"));
    wa.removeAttribute("data-empty");
  });

  // Número formatado, ex.: (11) 98786-2910.
  var d = digits.replace(/^55/, "");
  var fmt = d.length === 11 ? "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7)
          : d.length === 10 ? "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6) : "";
  document.querySelectorAll("[data-whatsapp-numero]").forEach(function (el) {
    if (fmt) el.textContent = fmt;
  });
  document.querySelectorAll("[data-whatsapp-link]").forEach(function (a) {
    if (digits) { abrirEmNovaAba(a, linkWhatsapp("geral")); a.hidden = false; }
  });

  var em = document.querySelector("[data-contact-email]");
  if (em && email) {
    em.textContent = email;
    em.href = "mailto:" + email;
    em.removeAttribute("data-empty");
    var cartaoEmail = em.closest("[data-contact-email-card]");
    if (cartaoEmail) cartaoEmail.hidden = false;
  }

  // Entrada suave dos blocos ao rolar (sem JS ou com movimento reduzido, tudo fica visível).
  var reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduz) {
    var alvos = document.querySelectorAll("main .card, main .steps li, main .section-head, main .partner, main .cta-band, main .tabela, main .faq, main .calc");
    var io = new IntersectionObserver(function (itens) {
      itens.forEach(function (i) {
        if (i.isIntersecting) { i.target.classList.add("in"); io.unobserve(i.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    alvos.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  // Marca d'água em movimento: desloca de leve ao rolar (desligado com movimento reduzido).
  if (!reduz) {
    var marcas = document.querySelectorAll(".hero, .viagens, .section--soft, .cta-band, .site-footer");
    var ticking = false;
    var atualizar = function () {
      var vh = window.innerHeight;
      marcas.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var centro = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.setProperty("--py", Math.round(centro * -40) + "px");
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(atualizar); }
    }, { passive: true });
    atualizar();
  }
})();
