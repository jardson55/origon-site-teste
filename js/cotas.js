// Simulador de cotas (ilustrativo): divide o valor FOB do contêiner entre os cotistas.
// Não calcula frete, seguro, tributos, taxas nem honorários: esses custos dependem do produto,
// do câmbio e das despesas reais e são informados no orçamento.
(function () {
  var form = document.getElementById('calc-form');
  if (!form) return;

  var total = document.getElementById('calc-total');
  var cotas = document.getElementById('calc-cotas');
  var cambio = document.getElementById('calc-cambio');
  var saidaUsd = document.getElementById('saida-usd');
  var saidaBrl = document.getElementById('saida-brl');
  var linhaBrl = document.getElementById('linha-brl');
  var nota = document.getElementById('saida-radar');
  var erro = document.getElementById('saida-erro');

  var LIMITE_EXPRESSA_USD = 50000; // conferir as regras vigentes do RADAR antes de decidir

  var usd = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' });
  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  function calcular() {
    var t = parseFloat(total.value);
    var n = parseInt(cotas.value, 10);
    var c = parseFloat(String(cambio.value).replace(',', '.'));
    erro.textContent = '';
    if (!(t > 0) || !(n >= 1) || n > 50) {
      erro.textContent = 'Informe um valor total maior que zero e de 1 a 50 cotas.';
      saidaUsd.textContent = '—';
      linhaBrl.hidden = true;
      nota.textContent = '';
      return;
    }
    var porCota = t / n;
    saidaUsd.textContent = usd.format(porCota);
    if (c > 0) {
      saidaBrl.textContent = brl.format(porCota * c);
      linhaBrl.hidden = false;
    } else {
      linhaBrl.hidden = true;
    }
    nota.textContent = porCota <= LIMITE_EXPRESSA_USD
      ? 'Com esse valor por cotista, a mercadoria de cada um fica dentro do limite semestral de US$ 50 mil da habilitação RADAR na modalidade Expressa (confirme as regras vigentes).'
      : 'Com esse valor por cotista, a mercadoria de cada um ultrapassa US$ 50 mil, o limite semestral da modalidade Expressa do RADAR (confirme as regras vigentes).';
  }

  form.addEventListener('input', calcular);
  form.addEventListener('submit', function (e) { e.preventDefault(); calcular(); });
  calcular();
})();
