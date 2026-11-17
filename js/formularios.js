// Formulários que montam a mensagem e abrem o WhatsApp da ORIGON. Nenhum dado é enviado a servidor nem guardado pelo site.
(function () {
  var cfg = window.ORIGON_CONFIG || {};
  var digits = String(cfg.whatsapp || "").replace(/\D/g, "");

  function data(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
    return m ? m[3] + "/" + m[2] + "/" + m[1] : "";
  }
  function limpar(v) { return String(v || "").replace(/\s+/g, " ").trim(); }

  function montar(form, tipo) {
    var f = form.elements;
    var v = function (n) { return f[n] ? limpar(f[n].value) : ""; };
    var linhas = [];
    if (tipo === "viagem") {
      var plural = function (n, um, varios) { return n + " " + (n === 1 ? um : varios); };
      var num = function (n) { var k = parseInt(v(n), 10); return k > 0 ? k : 0; };
      linhas.push("Olá! Vim pelo site da ORIGON e gostaria de uma cotação de viagem.", "");
      linhas.push("Nome: " + v("nome"));
      linhas.push("O que cotar: " + v("tipo"));
      linhas.push("Origem: " + v("origem"));
      linhas.push("Destino: " + v("destino"));
      if (v("ida")) linhas.push("Ida / início: " + data(v("ida")));
      if (f.somenteIda && f.somenteIda.checked) linhas.push("Somente ida (sem data de retorno)");
      else if (v("volta")) linhas.push("Volta / término: " + data(v("volta")));
      linhas.push("Viajantes: " + plural(Math.max(1, num("adultos")), "adulto", "adultos") + ", " + plural(num("criancas"), "criança", "crianças") + ", " + plural(num("bebes"), "bebê", "bebês"));
      linhas.push("Classe da cabine: " + v("classe"));
      if (v("idades")) linhas.push("Idades: " + v("idades"));
      if (f.flexivel && f.flexivel.checked) linhas.push("Posso viajar até 3 dias antes ou depois");
      if (v("obs")) linhas.push("Observações: " + v("obs"));
    } else {
      linhas.push("Olá! Vim pelo site da ORIGON e gostaria de solicitar um orçamento.", "");
      linhas.push("Nome: " + v("nome"));
      linhas.push("Assunto: " + v("assunto"));
      if (v("cidade")) linhas.push("Cidade/UF: " + v("cidade"));
      linhas.push("Mensagem: " + v("mensagem"));
    }
    return linhas.join("\n");
  }

  function iniciar(form) {
    var erro = form.querySelector(".form-erro");
    var tipo = form.getAttribute("data-assunto");
    function mostrar(msg) { if (erro) { erro.textContent = msg; erro.hidden = !msg; } }

    var so = form.elements.somenteIda, volta = form.elements.volta;
    if (so && volta) so.addEventListener("change", function () { volta.disabled = so.checked; if (so.checked) volta.value = ""; });
    form.addEventListener("input", function () { mostrar(""); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!digits) { mostrar("O WhatsApp ainda não está configurado."); return; }
      var faltando = [].slice.call(form.querySelectorAll("[required]")).filter(function (c) { return !limpar(c.value); });
      [].slice.call(form.querySelectorAll("[aria-invalid]")).forEach(function (c) { c.removeAttribute("aria-invalid"); });
      if (faltando.length) {
        faltando.forEach(function (c) { c.setAttribute("aria-invalid", "true"); });
        mostrar("Preencha os campos obrigatórios (*) para continuar.");
        faltando[0].focus();
        return;
      }
      var url = "https://wa.me/" + digits + "?text=" + encodeURIComponent(montar(form, tipo));
      // Link temporário clicado pelo envio: abre em nova aba sem desviar o site (window.open com noopener sempre devolve null).
      var a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener";
      document.body.appendChild(a); a.click(); a.remove();
      mostrar("");
    });
  }

  document.querySelectorAll("[data-form-whatsapp]").forEach(iniciar);
})();
