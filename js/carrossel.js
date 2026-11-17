// Carrossel de clientes: no celular/tablet avança sozinho a cada 4 s, com pausa por toque, foco, botão e fora da tela.
// No computador a vitrine fica em movimento (CSS) e o mesmo botão pausa a faixa. Sem movimento se o sistema pedir menos animação.
(function () {
  var DELAY = 4000;
  var reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var movel = window.matchMedia("(max-width: 960px)");

  function iniciar(root) {
    var track = root.querySelector(".cc-track");
    var slides = [].slice.call(root.querySelectorAll(".cc-slide"));
    var dots = [].slice.call(root.querySelectorAll(".cc-dot"));
    var pausa = root.querySelector("[data-cc-pause]");
    var pausaTxt = root.querySelector("[data-cc-pause-txt]");
    var idx = 0, timer = null, pausadoPeloUsuario = false, interagindo = false, visivel = false, raf = 0;
    if (!track || !slides.length) return;
    if (reduz) root.setAttribute("data-reduz", "");

    function marcar() {
      dots.forEach(function (d, k) { d.setAttribute("aria-current", k === idx ? "true" : "false"); });
    }
    function ir(i, suave) {
      idx = (i + slides.length) % slides.length;
      var s = slides[idx];
      var esq = s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2;
      track.scrollTo({ left: Math.max(0, esq), behavior: (suave === false || reduz) ? "auto" : "smooth" });
      marcar();
    }
    function ativo() {
      return movel.matches && !reduz && !pausadoPeloUsuario && !interagindo && visivel && !document.hidden;
    }
    function sincronizar() {
      if (timer) { clearInterval(timer); timer = null; }
      if (ativo()) timer = setInterval(function () { if (ativo()) ir(idx + 1); }, DELAY);
    }

    // posição atual pelo scroll (deslize manual)
    track.addEventListener("scroll", function () {
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        var centro = track.scrollLeft + track.clientWidth / 2, melhor = 0, dist = Infinity;
        slides.forEach(function (s, k) {
          var d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - centro);
          if (d < dist) { dist = d; melhor = k; }
        });
        if (melhor !== idx) { idx = melhor; marcar(); }
      });
    }, { passive: true });

    var prev = root.querySelector("[data-cc-prev]"), next = root.querySelector("[data-cc-next]");
    if (prev) prev.addEventListener("click", function () { ir(idx - 1); sincronizar(); });
    if (next) next.addEventListener("click", function () { ir(idx + 1); sincronizar(); });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { ir(k); sincronizar(); }); });

    // pausa ao tocar/passar o mouse/focar; retoma com o tempo cheio ao soltar
    root.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { interagindo = true; sincronizar(); } });
    root.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { interagindo = false; sincronizar(); } });
    track.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") { interagindo = true; sincronizar(); } });
    ["pointerup", "pointercancel"].forEach(function (ev) {
      track.addEventListener(ev, function (e) { if (e.pointerType !== "mouse") { interagindo = false; sincronizar(); } });
    });
    root.addEventListener("focusin", function () { interagindo = true; sincronizar(); });
    root.addEventListener("focusout", function () { interagindo = false; sincronizar(); });

    if (pausa) {
      pausa.addEventListener("click", function () {
        pausadoPeloUsuario = !pausadoPeloUsuario;
        pausa.setAttribute("aria-pressed", pausadoPeloUsuario ? "true" : "false");
        if (pausaTxt) pausaTxt.textContent = pausadoPeloUsuario ? "Retomar movimento" : "Pausar movimento";
        if (pausadoPeloUsuario) root.setAttribute("data-paused", ""); else root.removeAttribute("data-paused");
        sincronizar();
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (itens) { visivel = itens[0].isIntersecting; sincronizar(); }, { threshold: 0.35 }).observe(root);
    } else { visivel = true; }
    document.addEventListener("visibilitychange", sincronizar);
    if (movel.addEventListener) movel.addEventListener("change", sincronizar);
    marcar();
    sincronizar();
  }

  document.querySelectorAll("[data-carousel]").forEach(iniciar);
})();
