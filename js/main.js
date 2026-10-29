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

  // Botões "Solicitar orçamento": CRM se configurado; senão, página de contato.
  var crm = String(cfg.crmUrl || "").trim();
  document.querySelectorAll("[data-quote]").forEach(function (a) {
    if (/^https:\/\//i.test(crm)) {
      a.href = crm;
      a.target = "_blank";
      a.rel = "noopener";
    }
  });

  // Página de contato: o WhatsApp só abre por este botão.
  var wa = document.querySelector("[data-contact-whatsapp]");
  if (wa && digits) {
    wa.textContent = "Chamar no WhatsApp";
    wa.href = "https://wa.me/" + digits + "?text=" + encodeURIComponent(cfg.mensagemWhatsapp || "");
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.removeAttribute("data-empty");
  }
  var em = document.querySelector("[data-contact-email]");
  if (em && email) {
    em.textContent = email;
    em.href = "mailto:" + email;
    em.removeAttribute("data-empty");
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
})();
