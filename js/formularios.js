// Formulários que montam a mensagem e abrem o WhatsApp da ORIGON. Nenhum dado é enviado a servidor nem guardado pelo site.
(function () {
  var cfg = window.ORIGON_CONFIG || {};
  var digits = String(cfg.whatsapp || "").replace(/\D/g, "");

  // Tipo escolhido em "O que você quer cotar?" -> grupo de campos
  var GRUPOS = {
    "Pacote de viagem": "voo", "Passagem aérea": "voo", "Passagem + hotel": "voo",
    "Passagem de ônibus": "onibus", "Hotel / hospedagem": "hotel", "Aluguel de carro": "carro",
    "Seguro viagem com chip grátis": "seguro", "Transfer": "transfer"
  };

  function data(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
    return m ? m[3] + "/" + m[2] + "/" + m[1] : "";
  }
  function limpar(v) { return String(v || "").replace(/\s+/g, " ").trim(); }
  function plural(n, um, varios) { return n + " " + (n === 1 ? um : varios); }

  function montar(form, tipo) {
    var f = form.elements;
    var v = function (n) { return f[n] ? limpar(f[n].value) : ""; };
    var marcado = function (n) { return !!(f[n] && f[n].checked); };
    var num = function (n, minimo) { var k = parseInt(v(n), 10); return k >= (minimo || 0) ? k : (minimo || 0); };
    var linhas = [];
    if (tipo === "viagem") {
      var oque = v("tipo");
      var g = GRUPOS[oque] || "voo";
      linhas.push("Olá! Vim pelo site da ORIGON e gostaria de uma cotação de viagem.", "");
      linhas.push("Nome: " + v("nome"));
      linhas.push("O que cotar: " + oque);
      if (g === "voo") {
        linhas.push("Origem: " + v("origem"), "Destino: " + v("destino"));
        if (v("ida")) linhas.push("Ida / início: " + data(v("ida")));
        if (marcado("somenteIda")) linhas.push("Somente ida (sem data de retorno)");
        else if (v("volta")) linhas.push("Volta / término: " + data(v("volta")));
        linhas.push("Viajantes: " + plural(num("adultos", 1), "adulto", "adultos") + ", " + plural(num("criancas"), "criança", "crianças") + ", " + plural(num("bebes"), "bebê", "bebês"));
        linhas.push("Classe da cabine: " + v("classe"));
        if (v("idades")) linhas.push("Idades: " + v("idades"));
        if (marcado("flexivel")) linhas.push("Posso viajar até 3 dias antes ou depois");
      } else if (g === "onibus") {
        linhas.push("Origem: " + v("b_origem"), "Destino: " + v("b_destino"));
        if (v("b_ida")) linhas.push("Ida: " + data(v("b_ida")));
        if (marcado("b_somenteIda")) linhas.push("Somente ida (sem data de retorno)");
        else if (v("b_volta")) linhas.push("Volta: " + data(v("b_volta")));
        linhas.push("Passageiros: " + plural(num("b_adultos", 1), "adulto", "adultos") + ", " + plural(num("b_criancas"), "criança", "crianças"));
        if (marcado("b_flexivel")) linhas.push("Posso viajar até 3 dias antes ou depois");
      } else if (g === "hotel") {
        linhas.push("Destino / hotel: " + v("h_destino"));
        if (v("h_entrada")) linhas.push("Entrada (check-in): " + data(v("h_entrada")));
        if (v("h_saida")) linhas.push("Saída (check-out): " + data(v("h_saida")));
        linhas.push("Quartos: " + num("h_quartos", 1));
        linhas.push("Hóspedes: " + plural(num("h_adultos", 1), "adulto", "adultos") + ", " + plural(num("h_criancas"), "criança", "crianças"));
        if (v("h_idades")) linhas.push("Idades das crianças: " + v("h_idades"));
        linhas.push("Tipo de hospedagem: " + v("h_tipo"));
        if (marcado("h_cafe")) linhas.push("Quero café da manhã incluso");
        if (marcado("h_flexivel")) linhas.push("Posso viajar até 3 dias antes ou depois");
      } else if (g === "carro") {
        linhas.push("Retirada: " + v("c_retirada"));
        if (v("c_dataRet")) linhas.push("Data de retirada: " + data(v("c_dataRet")) + (v("c_horaRet") ? " às " + v("c_horaRet") : ""));
        if (marcado("c_outroLocal") && v("c_devolucao")) linhas.push("Devolução em outro local: " + v("c_devolucao"));
        else linhas.push("Devolução no mesmo local");
        if (v("c_dataDev")) linhas.push("Data de devolução: " + data(v("c_dataDev")) + (v("c_horaDev") ? " às " + v("c_horaDev") : ""));
        linhas.push("Categoria: " + v("c_categoria"), "Câmbio: " + v("c_cambio"));
        if (marcado("c_jovem")) linhas.push("O condutor tem menos de 25 anos");
        if (marcado("c_flexivel")) linhas.push("Posso retirar até 3 dias antes ou depois");
      } else if (g === "seguro") {
        linhas.push("Destino: " + v("s_destino"));
        if (v("s_inicio")) linhas.push("Início da viagem: " + data(v("s_inicio")));
        if (v("s_fim")) linhas.push("Término da viagem: " + data(v("s_fim")));
        linhas.push("Segurados: " + num("s_segurados", 1), "Idade de cada segurado: " + v("s_idades"));
        if (marcado("s_chip")) linhas.push("Quero receber o chip grátis na contratação do seguro");
      } else if (g === "transfer") {
        linhas.push("Embarque: " + v("t_origem"), "Destino: " + v("t_destino"));
        if (v("t_data")) linhas.push("Data: " + data(v("t_data")) + (v("t_hora") ? " às " + v("t_hora") : ""));
        linhas.push("Passageiros: " + num("t_passageiros", 1), "Bagagens: " + num("t_bagagens"));
        if (marcado("t_volta")) linhas.push("Preciso também do transfer de volta");
      }
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

    // Troca dos campos conforme o que será cotado (formulário de viagem)
    var seletor = form.elements.tipo;
    var grupos = [].slice.call(form.querySelectorAll(".grupo[data-grupo]"));
    var legenda = form.querySelector("#dados-legenda");
    function trocarGrupo() {
      var g = GRUPOS[seletor.value] || "voo";
      grupos.forEach(function (el) {
        var ativo = el.getAttribute("data-grupo") === g;
        el.hidden = !ativo;
        [].slice.call(el.querySelectorAll("input, select, textarea")).forEach(function (c) {
          // campos escondidos por "somente ida" ou "outro local" continuam desativados
          if (!ativo) c.disabled = true;
          else if (!c.hasAttribute("data-bloqueado")) c.disabled = false;
        });
        if (ativo && legenda) legenda.textContent = el.getAttribute("data-legenda");
      });
      aplicarDependencias();
    }
    // checkboxes que desativam ou mostram outro campo
    function aplicarDependencias() {
      [].slice.call(form.querySelectorAll("[data-desativa]")).forEach(function (c) {
        var alvo = form.querySelector("#" + c.getAttribute("data-desativa"));
        if (!alvo || c.closest(".grupo[hidden]")) return;
        alvo.disabled = c.checked;
        if (c.checked) alvo.value = "";
      });
      [].slice.call(form.querySelectorAll("[data-mostra]")).forEach(function (c) {
        var caixa = form.querySelector("#" + c.getAttribute("data-mostra"));
        if (!caixa || c.closest(".grupo[hidden]")) return;
        caixa.hidden = !c.checked;
        [].slice.call(caixa.querySelectorAll("input")).forEach(function (i) { i.disabled = !c.checked; if (!c.checked) i.value = ""; });
      });
    }
    if (seletor && grupos.length) {
      seletor.addEventListener("change", function () { trocarGrupo(); mostrar(""); });
      form.addEventListener("change", function (e) { if (e.target.matches("[data-desativa], [data-mostra]")) aplicarDependencias(); });
      trocarGrupo();
    }

    form.addEventListener("input", function () { mostrar(""); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!digits) { mostrar("O WhatsApp ainda não está configurado."); return; }
      var ativos = [].slice.call(form.querySelectorAll("[required]")).filter(function (c) { return !c.disabled && !c.closest("[hidden]"); });
      var faltando = ativos.filter(function (c) { return !limpar(c.value); });
      [].slice.call(form.querySelectorAll("[aria-invalid]")).forEach(function (c) { c.removeAttribute("aria-invalid"); });
      if (faltando.length) {
        faltando.forEach(function (c) { c.setAttribute("aria-invalid", "true"); });
        mostrar("Preencha os campos obrigatórios (*) para continuar.");
        faltando[0].focus();
        return;
      }
      // data final não pode ser anterior à inicial (dentro do grupo ativo)
      var grupoAtivo = form.querySelector(".grupo:not([hidden])");
      if (grupoAtivo) {
        var ini = grupoAtivo.querySelector("[data-inicio]"), fim = grupoAtivo.querySelector("[data-fim]");
        if (ini && fim && ini.value && fim.value && !fim.disabled && fim.value < ini.value) {
          fim.setAttribute("aria-invalid", "true");
          mostrar("A data final não pode ser anterior à data inicial.");
          fim.focus();
          return;
        }
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
