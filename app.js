/* Painel Estratégico Helitron — dados e renderização */

const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const rich = t => esc(t).replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>');
const br = n => n.toLocaleString('pt-BR');

/* ------------------------------------------------------------------ dados */

const MERCADO = {
  praca: [
    { uf: 'Distrito Federal', heli: 71, hp: 13, hc: 0, aero: 7 },
    { uf: 'Goiás', heli: 97, hp: 33, hc: 0, aero: 146 }
  ],
  rotativaAno: [
    { ano: '2018', v: 4700 }, { ano: '2019', v: 5662 }, { ano: '2020', v: 3171 }
  ],
  rotativaMes: [
    { m: 'Jan', v: 467 }, { m: 'Fev', v: 399 }, { m: 'Mar', v: 372 }, { m: 'Abr', v: 145 },
    { m: 'Mai', v: 220 }, { m: 'Jun', v: 207 }, { m: 'Jul', v: 302 }, { m: 'Ago', v: 212 },
    { m: 'Set', v: 210 }, { m: 'Out', v: 216 }, { m: 'Nov', v: 190 }, { m: 'Dez', v: 231 }
  ],
  mix2020: [{ k: 'Asa fixa', v: 13246 }, { k: 'Asa rotativa', v: 3171 }]
};

const PUBLICOS = [
  { s: 'Lazer', nat: 'B2C', p: 2, icp: 4, nec: 'Experiência e exclusividade',
    perfil: 'Renda familiar de R$ 12 mil a acima de R$ 30 mil. Compra ocasional, ligada a datas.' },
  { s: 'Viagens', nat: 'B2C', p: 2, icp: 2, nec: 'Otimização do tempo',
    perfil: 'Alta renda, acima de R$ 26 mil. Compra sazonal, em feriados e férias escolares.' },
  { s: 'Negócios', nat: 'B2B', p: 3, icp: 4, nec: 'Agilidade e confiabilidade',
    perfil: 'Empresas de médio porte a grande porte, com receita acima de R$ 300 milhões no perfil maior.' },
  { s: 'Agronegócio', nat: 'B2B e B2C', p: 2, icp: 2, nec: 'Acesso e produtividade',
    perfil: 'Produtores e executivos classe A em Cristalina, Formosa, Unaí e Goiânia.' },
  { s: 'Aeromédico', nat: 'B2B e B2G', p: 3, icp: 6, nec: 'Rapidez e capacidade operacional',
    perfil: 'Hospitais privados, operadoras de alto padrão e órgãos públicos de saúde.' },
  { s: 'Pilotos', nat: 'B2E e RH', p: 2, icp: 4, nec: 'Carreira e estrutura profissional',
    perfil: 'Comandantes experientes e pilotos em desenvolvimento, com PCH e habilitação IFR.' }
];

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const SAZONAL = [
  { s: 'Lazer',       v: [1, 2, 1, 1, 3, 3, 2, 3, 1, 1, 1, 3], nota: 'Dia das Mães, Dia dos Namorados, Dia dos Pais e festas de fim de ano.' },
  { s: 'Viagens',     v: [3, 1, 1, 2, 1, 2, 3, 3, 3, 1, 2, 3], nota: 'Férias escolares, feriados prolongados e a seca na Chapada, entre agosto e setembro.' },
  { s: 'Negócios',    v: [1, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 1], nota: 'Segue o calendário corporativo e esvazia no recesso de fim de ano.' },
  { s: 'Agronegócio', v: [2, 2, 3, 3, 3, 2, 2, 2, 3, 3, 2, 1], nota: 'Colheita, plantio e as feiras do setor, com Tecnoshow COMIGO e AgroBrasília.' },
  { s: 'Aeromédico',  v: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], nota: 'Demanda contínua, sem sazonalidade relevante.' }
];

const CONCORRENCIA = {
  social: [
    { k: 'Instagram', v: 27400 }, { k: 'LinkedIn', v: 22000 }, { k: 'Facebook', v: 7400 }
  ],
  ausentes: ['UniAir', 'Via Aérea Brasil', 'Rio Bluesky', 'Comandante Nobre', 'Fly Revo'],
  disputam: ['HBR Aviação', 'Direção Táxi Aéreo', 'Ícaro', 'Flapper', 'Aliar', 'High Class', 'Helisul', 'Helimarte'],
  lacunas: [
    'Preço escondido até o primeiro contato, o que trava o cliente ainda no meio do funil.',
    'Demora no atendimento por WhatsApp, apontada como ponto fraco recorrente.',
    'Sites institucionais frios, com formulário longo no lugar de contato direto.',
    'Pouco uso do LinkedIn pelos concorrentes de base aeroportuária.',
    'Ausência de helicentro no DF e em Goiás, com serviços de apoio dispersos.'
  ],
  benchmarks: [
    'Flapper e High Class resolvem a cotação em cinco campos, pedindo origem, destino, data, horário e passageiros.',
    'Fly Revo comunica o tempo ganho em vez do produto, comparando estrada e voo por destino.',
    'A HBR mantém área de notícias e imprensa no site, usada como prova de solidez.'
  ]
};

/* ------------------------------------------------------- gráficos em SVG */

function barsV(data, opt) {
  const W = 340, H = 196, L = 46, R = 334, T = 14, B = 148;
  const max = Math.max(...data.map(d => d.v)) * 1.12;
  const n = data.length, slot = (R - L) / n, bw = Math.min(54, slot * 0.52);
  let g = '';
  [0, .5, 1].forEach(f => {
    const y = B - f * (B - T);
    g += `<line class="grid-l" x1="${L}" y1="${y}" x2="${R}" y2="${y}"/>` +
         `<text x="${L - 7}" y="${y + 4}" font-size="9.5" text-anchor="end">${br(Math.round(max * f))}</text>`;
  });
  data.forEach((d, i) => {
    const cx = L + slot * i + slot / 2;
    const h = (d.v / max) * (B - T);
    g += `<rect class="bar${opt && opt.soft === i ? ' soft' : ''}" x="${cx - bw / 2}" y="${B - h}" width="${bw}" height="${h}" rx="3"/>`;
    g += `<text x="${cx}" y="${B - h - 7}" font-size="11.5" font-weight="700" text-anchor="middle" fill="currentColor">${br(d.v)}</text>`;
    g += `<text x="${cx}" y="${B + 17}" font-size="10" text-anchor="middle">${esc(d.ano || d.k)}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

function lineChart(data) {
  const W = 440, H = 196, L = 38, R = 432, T = 14, B = 148;
  const max = Math.max(...data.map(d => d.v)) * 1.15;
  const step = (R - L) / (data.length - 1);
  const X = i => L + step * i, Y = v => B - (v / max) * (B - T);
  let g = '';
  [0, .5, 1].forEach(f => {
    const y = B - f * (B - T);
    g += `<line class="grid-l" x1="${L}" y1="${y}" x2="${R}" y2="${y}"/>` +
         `<text x="${L - 6}" y="${y + 4}" font-size="9.5" text-anchor="end">${Math.round(max * f)}</text>`;
  });
  const pts = data.map((d, i) => `${X(i)},${Y(d.v)}`).join(' ');
  g += `<polygon class="area" points="${L},${B} ${pts} ${R},${B}"/>`;
  g += `<polyline class="line" points="${pts}"/>`;
  data.forEach((d, i) => {
    const last = i === data.length - 1, low = d.v === Math.min(...data.map(x => x.v));
    g += `<circle class="dot" cx="${X(i)}" cy="${Y(d.v)}" r="${low || last ? 4 : 2.4}"/>`;
    if (low || i === 0) g += `<text x="${X(i)}" y="${Y(d.v) - 10}" font-size="10.5" font-weight="700" text-anchor="middle" fill="currentColor">${d.v}</text>`;
    g += `<text x="${X(i)}" y="${B + 17}" font-size="9" text-anchor="middle">${d.m}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

function barsH(data) {
  const W = 340, H = 24 + data.length * 40, L = 88, R = 300;
  const max = Math.max(...data.map(d => d.v)) * 1.1;
  let g = '';
  data.forEach((d, i) => {
    const y = 16 + i * 40, w = (d.v / max) * (R - L);
    g += `<text x="${L - 9}" y="${y + 15}" font-size="10.5" text-anchor="end">${esc(d.k)}</text>`;
    g += `<rect class="bar" x="${L}" y="${y}" width="${w}" height="21" rx="4"/>`;
    g += `<text x="${L + w + 7}" y="${y + 15}" font-size="11" font-weight="700" fill="currentColor">${br(d.v)}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

/* --------------------------------------------------------------- painéis */

function painelMercado() {
  const t = MERCADO.praca;
  const tot = { heli: t[0].heli + t[1].heli, hp: t[0].hp + t[1].hp, aero: t[0].aero + t[1].aero };
  return `
  <p class="eyebrow">Mercado</p>
  <h2>Frota, infraestrutura e movimento</h2>
  <p class="lead">A base instalada mostra demanda existente e infraestrutura de apoio ausente. Os dois estados somam <b>${tot.heli} helicópteros</b> e <b>${tot.hp} helipontos</b>, e <b>nenhum helicentro</b>.</p>

  <div class="cards c-2">
    <div class="card">
      <h3>Frota e infraestrutura por estado · 2022</h3>
      <div class="tbl-wrap"><table>
        <thead><tr><th>Estado</th><th class="num">Helicópteros</th><th class="num">Helipontos</th><th class="num">Helicentros</th><th class="num">Aeródromos</th></tr></thead>
        <tbody>
          ${t.map(r => `<tr><td>${esc(r.uf)}</td><td class="num">${r.heli}</td><td class="num">${r.hp}</td><td class="num"><span class="bdg">${r.hc}</span></td><td class="num">${r.aero}</td></tr>`).join('')}
          <tr><td><b>Total</b></td><td class="num"><b>${tot.heli}</b></td><td class="num"><b>${tot.hp}</b></td><td class="num"><b>0</b></td><td class="num"><b>${tot.aero}</b></td></tr>
        </tbody>
      </table></div>
      <span class="src">Fonte: apresentação institucional Helitron, 2022.</span>
    </div>

    <div class="card">
      <h3>Movimentos de asa rotativa no Aeroporto de Brasília</h3>
      ${barsV(MERCADO.rotativaAno, { soft: 2 })}
      <span class="src">Série 2018 a 2020. A queda de 2020 reflete a pandemia. Fonte: apresentação institucional Helitron.</span>
    </div>
  </div>

  <div class="cards c-2">
    <div class="card">
      <h3>Asa rotativa mês a mês · 2020</h3>
      ${lineChart(MERCADO.rotativaMes)}
      <span class="src">Os doze meses somam os 3.171 movimentos do ano. O vale de abril marca o início das restrições.</span>
    </div>
    <div class="card">
      <h3>Quem ocupa a pista · 2020</h3>
      ${barsV(MERCADO.mix2020, { soft: 0 })}
      <p style="margin-top:12px">O helicóptero disputa espaço com um tráfego de asa fixa mais de quatro vezes maior. É a origem direta da espera de até 40 minutos em voo circular relatada pelo cliente.</p>
      <span class="src">Fontes: apresentação institucional Helitron e Ata de Reunião de 16/09/2026.</span>
    </div>
  </div>

  <div class="insight">
    <b>O que o dado sustenta</b>
    <p>A frota existe e a estrutura de apoio não. O zero repetido na coluna de helicentros é o argumento mais forte de pioneirismo que o projeto tem, e vem do material do próprio cliente. A série do aeroporto justifica a saída da base aeroportuária, que é o diferencial central da Helitron.</p>
  </div>`;
}

function painelPublicos() {
  const tot = PUBLICOS.reduce((a, p) => ({ p: a.p + p.p, icp: a.icp + p.icp }), { p: 0, icp: 0 });
  return `
  <p class="eyebrow">Públicos</p>
  <h2>Quem a Helitron atende</h2>
  <p class="lead">Seis frentes, <b>${tot.p} públicos-alvo</b> e <b>${tot.icp} perfis de cliente ideal</b> mapeados. Cinco frentes são comerciais, e a de pilotos é de atração de talentos.</p>

  <div class="cards c-3">
    <div class="card stat"><span class="v">6</span><span class="k">frentes mapeadas</span></div>
    <div class="card stat"><span class="v">${tot.p}</span><span class="k">públicos-alvo definidos</span></div>
    <div class="card stat"><span class="v">${tot.icp}</span><span class="k">ICPs nomeados</span></div>
  </div>

  <div class="card">
    <h3>Natureza da demanda por frente</h3>
    <div class="tbl-wrap"><table>
      <thead><tr><th>Frente</th><th>Natureza</th><th class="num">Públicos</th><th class="num">ICPs</th><th>Principal necessidade</th></tr></thead>
      <tbody>${PUBLICOS.map(p => `<tr>
        <td><b>${esc(p.s)}</b></td>
        <td><span class="bdg ${p.s === 'Pilotos' ? 'off' : ''}">${esc(p.nat)}</span></td>
        <td class="num">${p.p}</td><td class="num">${p.icp}</td>
        <td>${esc(p.nec)}</td></tr>`).join('')}</tbody>
    </table></div>
    <span class="src">Fontes: Definição de público-alvo e documento de ICPs do Projeto Helitron.</span>
  </div>

  <div class="cards c-2" style="margin-top:14px">
    ${PUBLICOS.map(p => `<div class="card">
      <h3>${esc(p.s)}</h3>
      <p>${esc(p.perfil)}</p>
    </div>`).join('')}
  </div>`;
}

function painelSazonal() {
  const cols = `grid-template-columns:118px repeat(12,1fr)`;
  let grid = `<div class="matrix" style="${cols}">`;
  grid += `<div></div>` + MESES.map(m => `<div class="mo">${m}</div>`).join('');
  SAZONAL.forEach(r => {
    grid += `<div class="lbl">${esc(r.s)}</div>`;
    grid += r.v.map((n, i) => {
      const nome = ['', 'baixa', 'média', 'alta'][n];
      return `<div class="cell n${n}" title="${esc(r.s)} · ${MESES[i]} · demanda ${nome}">${n}</div>`;
    }).join('');
  });
  grid += `</div>`;

  return `
  <p class="eyebrow">Sazonalidade</p>
  <h2>Quando cada frente aquece</h2>
  <p class="lead">A leitura combinada mostra que as frentes <b>se compensam ao longo do ano</b>. Negócios e Agronegócio sustentam de março a novembro, Lazer e Viagens concentram no fim e no meio do ano, e o Aeromédico corre constante.</p>

  <div class="card">
    <h3>Intensidade de demanda por frente e mês</h3>
    <div class="tbl-wrap">${grid}</div>
    <div class="legend">
      <span><i class="key n1"></i> Baixa</span>
      <span><i class="key n2"></i> Média</span>
      <span><i class="key n3"></i> Alta</span>
    </div>
    <span class="src">Mapeamento qualitativo da consultoria, construído a partir dos gatilhos de cada público. Não representa volume medido. A frente de Pilotos não entra, porque a contratação acompanha a expansão da frota e não um calendário sazonal.</span>
  </div>

  <div class="cards c-2" style="margin-top:14px">
    ${SAZONAL.map(r => `<div class="card"><h3>${esc(r.s)}</h3><p>${esc(r.nota)}</p></div>`).join('')}
  </div>

  <div class="insight" style="margin-top:22px">
    <b>Calendário comercial anticíclico</b>
    <p>Dezembro e janeiro esvaziam o corporativo e enchem o lazer. Março a maio fazem o inverso. A matriz é a prova visual da diretriz de calendário anticíclico levantada na TOWS e do objetivo de receita previsível no BSC: a diversificação entre frentes é o que protege o faturamento fora da alta temporada.</p>
  </div>`;
}

function painelConcorrencia() {
  const c = CONCORRENCIA;
  return `
  <p class="eyebrow">Concorrência</p>
  <h2>Como o mercado se comporta</h2>
  <p class="lead">Parte dos concorrentes mapeados <b>não tem presença no Centro-Oeste</b>, e os que atuam na praça repetem as mesmas falhas de atendimento e de transparência de preço.</p>

  <div class="cards c-2">
    <div class="card">
      <h3>Alcance social da HBR Aviação</h3>
      ${barsH(c.social)}
      <p style="margin-top:10px">Benchmark mais próximo da Helitron. O Instagram funciona como vitrine comercial, o LinkedIn concentra vagas e conteúdo institucional, e o Facebook tem papel residual.</p>
      <span class="src">Levantamento direto nos perfis, realizado pela consultoria.</span>
    </div>

    <div class="card">
      <h3>Presença na praça</h3>
      <p style="margin-bottom:10px"><b>${c.ausentes.length} dos concorrentes mapeados não atuam no Centro-Oeste.</b></p>
      <ul class="ul flat">${c.ausentes.map(x => `<li>${esc(x)} <span class="bdg off">fora da praça</span></li>`).join('')}</ul>
      <p style="margin-top:14px;margin-bottom:8px"><b>Disputam o mesmo cliente:</b></p>
      <p>${c.disputam.map(esc).join(' · ')}</p>
    </div>
  </div>

  <div class="cards c-2">
    <div class="card">
      <h3>Lacunas que a Helitron pode ocupar</h3>
      <ul class="ul">${c.lacunas.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    </div>
    <div class="card">
      <h3>Referências positivas do setor</h3>
      <ul class="ul">${c.benchmarks.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <span class="src">Fontes: mapeamento de concorrentes e análise da HBR Aviação.</span>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ funil */

const ETAPAS = [
  { nm: 'Topo', ds: 'Descoberta' }, { nm: 'Meio', ds: 'Consideração' },
  { nm: 'Fundo', ds: 'Decisão' }, { nm: 'Pós-venda', ds: 'Retenção e indicação' }
];

const FUNIL = [
  { id: 'lazer', nome: 'Lazer', etapas: [
    { pensa: 'Ainda não pensa em helicóptero, mas pensa em "preciso de algo especial para o Dia dos Namorados, para o aniversário do meu filho, para o pedido de casamento".',
      campos: [['Gatilhos', 'Aniversários, pedidos de casamento, lua de mel, Dia dos Namorados, Dia das Mães, Dia dos Pais, Réveillon, feriados, shows e eventos esportivos.'],
               ['Onde encontrar', 'Instagram, buscando maneiras de comemorar, e Google, com buscas como "ideias para pedido de casamento em Brasília". Também pela indicação de amigos.']],
      acoes: ['Conteúdo de Instagram com foco na ocasião e não no produto.', '<b>Público 1:</b> posts e reels da experiência do voo em si.', '<b>Público 2:</b> conteúdo que já apresenta a experiência completa, unindo voo, jantar e decoração.', 'SEO no site e no blog para quem já busca por produto.'],
      next: 'A pessoa clica no perfil, entra no site ou pede indicação, e passa a saber que a Helitron oferece a opção.' },
    { pensa: 'Já decidiu que quer fazer algo assim, e compara a Helitron com concorrentes ou com o programa tradicional.',
      campos: [['Diferença entre os públicos', 'O Público 1 compara preço e experiência. O Público 2 compara a capacidade de entregar um serviço integrado, pesquisa com semanas de antecedência e valoriza o sigilo total.'],
               ['Objeções', 'É seguro? Dá para personalizar para o meu caso? Vão manter sigilo até a hora certa? A experiência é adequada para uma criança?']],
      acoes: ['Página do site dedicada a cada ocasião.', 'Prova social segmentada por ocasião, com fotos autorizadas pelo cliente.', 'Conteúdo de segurança explícito, com certificações, manutenção e perfil dos pilotos.', '<b>Público 2:</b> atendimento consultivo no WhatsApp, ou ponto de contato único.'],
      next: 'A pessoa pede detalhes ou orçamento. A Helitron já é uma opção, e falta fechar.' },
    { pensa: 'Está perto de comprar, mas quer a confirmação final de que o investimento vale a pena e de que a experiência vai ser à altura.',
      campos: [['Diferença entre os públicos', 'O Público 1 decide rápido assim que vê preço e disponibilidade. O Público 2 decide quando sente que o investimento se justifica pelo nível de cuidado entregue.']],
      acoes: ['<b>Público 1:</b> cotação rápida, com respostas objetivas.', '<b>Público 2:</b> roteiro consultivo com parceiros em pacote fechado.', 'Flexibilizar formas de pagamento, com parcelamento.'],
      next: 'Fechamento do contrato ou reserva e execução da experiência.' },
    { campos: [['Comportamento por público', 'O Público 1 repete em outras datas do casal ou da família. O Público 2 vira cliente de aniversário de casamento e indica dentro do próprio círculo de alta renda.']],
      acoes: ['Captar a data-chave no primeiro contato para reengajar no ano seguinte.', 'Pedir autorização para usar fotos e depoimentos como prova social.', '<b>Público 2:</b> manter contato consultivo ativo, sem reiniciar do zero a cada ocasião.'],
      next: 'Recompra em nova data e indicação dentro do círculo social do cliente.' }]},

  { id: 'viagens', nome: 'Viagens', etapas: [
    { pensa: 'Ainda não pensa em helicóptero como forma de viajar, mas pensa que três horas de estrada são metade do fim de semana perdido.',
      campos: [['Gatilhos', 'Feriados prolongados, fins de semana livres, férias escolares de julho, dezembro e janeiro, e o período de seca e turismo na Chapada.'],
               ['Onde encontrar', 'Instagram e Google, com buscas por destino, e na indicação de outros casais e famílias do mesmo círculo social.']],
      acoes: ['Conteúdo que evidencia o tempo ganho, com comparativo de estrada e voo por destino.', '<b>Público 1:</b> conteúdo de destino e descanso.', '<b>Público 2:</b> conteúdo de viagem em família, com foco em conforto com crianças.', 'SEO por destino, já que vários concorrentes não têm presença no Centro-Oeste.', 'Parcerias com hotéis e resorts, para indicação cruzada.'],
      next: 'A pessoa entra na página do destino ou recebe indicação, e passa a saber que a opção existe.' },
    { pensa: 'Já decidiu que quer ir de helicóptero e compara com a viagem de carro e com os concorrentes. Quer saber se o ganho de tempo justifica o investimento.',
      campos: [['Diferença entre os públicos', 'O Público 1 compara pontualidade e confiabilidade. O Público 2 compara espaço e conforto com crianças e a facilidade de resolver voo e estadia de uma vez.'],
               ['Objeções', 'É seguro? E se houver atraso? Cabem a família e a bagagem com conforto? Quanto custa de verdade?']],
      acoes: ['Página por destino, com roteiro e produto de entrada com preço claro.', 'Conteúdo de segurança, com certificações da ANAC e perfil dos pilotos, conforme forem obtidos.', 'Mostrar o embarque sem fila, sem raio X e sem espera em voo circular.', 'Pacotes fechados de voo e hospedagem com parceiros.'],
      next: 'A pessoa pede detalhes ou cotação por WhatsApp ou formulário.' },
    { pensa: 'Está perto de comprar, mas quer a confirmação de que o voo será pontual e seguro e de que o investimento compensa.',
      campos: [['Diferença entre os públicos', 'O Público 1 decide rápido quando vê disponibilidade para o feriado. O Público 2 decide quando consegue reservar o pacote completo para as férias.']],
      acoes: ['Cotação rápida, pedindo origem, destino, data, horário e passageiros.', 'WhatsApp com resposta rápida, porque a demora é uma lacuna dos concorrentes.', 'Preço claro e parcelamento.', '<b>Público 2:</b> pacote fechado de voo e resort, com reserva antecipada.'],
      next: 'Fechamento da reserva e realização da viagem.' },
    { campos: [['Comportamento por público', 'O Público 1 viaja várias vezes ao ano para os mesmos destinos e indica outros casais. O Público 2 recompra atrelado ao calendário de férias escolares.']],
      acoes: ['CRM desde o primeiro cliente, captando destino preferido e datas de férias.', 'Pedir autorização para usar fotos e depoimentos.', 'Pacotes de horas pré-pagos para quem viaja com frequência.', '<b>Público 2:</b> contato antes de julho, dezembro e janeiro.'],
      next: 'Recompra na próxima janela de viagem e indicação dentro do círculo social.' }]},

  { id: 'negocios', nome: 'Negócios', etapas: [
    { pensa: 'Ainda não conhece a Helitron como fornecedora, mas pensa que o diretor precisa estar em Goiânia hoje.',
      campos: [['Gatilhos', 'Reuniões fora de Brasília, visitas a unidades e obras, eventos corporativos e problemas operacionais que exigem presença imediata.'],
               ['Onde encontrar', 'LinkedIn, já que os concorrentes de aeroporto usam pouco o canal, indicação entre executivos, e prospecção direta à diretoria e a quem cuida de viagens.']],
      acoes: ['Conteúdo no LinkedIn sobre tempo e burocracia, contrapondo a espera de até 40 minutos em voo circular ao embarque direto.', 'Área de notícias com marcos reais, como licenças, helicentro e concessões.', '<b>Público 2:</b> destacar a prontidão em até 30 minutos.', '<b>Público 3:</b> destacar consistência e padrão de serviço.'],
      next: 'O executivo ou a assistente pede cotação, aceita reunião ou é indicado por outra empresa.' },
    { pensa: 'Já considera contratar e compara a Helitron com voo comercial, viagem terrestre e concorrentes.',
      campos: [['Diferença entre os públicos', 'O Público 1 compara custo-benefício. O Público 2 compara disponibilidade e resposta rápida. O Público 3 compara padrão de serviço e condições de relação contínua.'],
               ['Objeções', 'A empresa é nova, tem histórico e segurança operacional? Conseguem atender em cima da hora? Dá para ter previsibilidade de custo com o QAV em alta?']],
      acoes: ['Dossiê institucional com segurança, manutenção e conformidade com o RBAC 135 e o RBAC 155.', 'Três bases em paralelo como argumento de resiliência diante de restrições de espaço aéreo.', 'Material por decisor: tempo para a diretoria, contrato para o financeiro, agendamento para facilities.', '<b>Público 3:</b> pacotes de horas pré-pagos e contratos com cláusula de reajuste por QAV.'],
      next: 'A empresa pede proposta formal ou agenda uma primeira viagem.' },
    { pensa: 'Está perto de contratar, mas quer a confirmação de que a Helitron entrega com segurança e pontualidade.',
      campos: [['Diferença entre os públicos', 'O Público 1 decide quando a primeira viagem parece simples de contratar. O Público 2 decide ao perceber que pode acionar com pouca antecedência. O Público 3 decide quando as condições da relação contínua estão claras.']],
      acoes: ['Cotação ágil e proposta formal com condições claras para o financeiro.', '<b>Público 2:</b> canal prioritário de solicitação urgente.', '<b>Público 3:</b> acordo preferencial com padrão de serviço por escrito.', 'Transporte terrestre integrado e sala VIP no pacote.'],
      next: 'Fechamento da primeira viagem ou do contrato, e execução do deslocamento.' },
    { campos: [['Comportamento por público', 'O Público 1 aumenta a frequência se perceber ganho de tempo. O Público 2 passa a ser o fornecedor de prontidão da empresa. O Público 3 mantém relação de longo prazo.']],
      acoes: ['CRM com executivos, rotas e preferências.', 'Acompanhar viagens realizadas e tempo economizado, e propor evoluir para pacote de horas.', 'Pedir autorização para citar a empresa como referência.', 'Cruzar com os funis de Lazer e de Viagens quando o executivo também for cliente de experiências.'],
      next: 'Evolução de viagem avulsa para acordo recorrente, e indicação entre empresas.' }]},

  { id: 'agro', nome: 'Agronegócio', etapas: [
    { pensa: 'Ainda não pensa em contratar helicóptero como rotina, mas pensa que precisa vistoriar a fazenda hoje e não tem três horas de estrada para perder.',
      campos: [['Gatilhos', 'Colheita e plantio, imprevisto na fazenda, reunião com banco ou sócios, feiras como AgroBrasília e Tecnoshow COMIGO, e viagem que combina negócio com fim de semana.'],
               ['Onde encontrar', 'Boca a boca entre produtores, grupos de WhatsApp do agronegócio, feiras do setor, e LinkedIn para o perfil executivo.']],
      acoes: ['Participar de feiras do setor como canal de geração de contatos.', 'Conteúdo comparativo mostrando quanto tempo o produtor economiza.', 'Parcerias com bancos, tradings e cooperativas que já atendem esse produtor.'],
      next: 'A pessoa pede cotação ou é indicada por outro produtor que já usa o serviço.' },
    { pensa: 'Já considera contratar, mas avalia se o serviço aguenta uma rotina imprevisível ou cheia de paradas.',
      campos: [['Diferença entre os públicos', 'O Público 1 quer saber se dá para agendar com pouca antecedência e atender regiões menos urbanizadas. O Público 2 quer múltiplos destinos numa única viagem.'],
               ['Objeções', 'Confio nessa aeronave para pousar numa pista de fazenda? Conseguem me atender em cima da hora? É possível mudar a rota no meio do caminho?']],
      acoes: ['Demonstrar capacidade operacional em regiões rurais.', 'Atendimento direto e sem burocracia, porque esse público não quer central demorada.', '<b>Público 2:</b> roteiros com múltiplas paradas já na cotação, e não como pedido especial.'],
      next: 'Pedido de orçamento recorrente, ou proposta de relação contínua.' },
    { pensa: 'Decide por confiabilidade e flexibilidade. Os dois perfis têm alto poder aquisitivo, e a dúvida é se podem contar com o serviço sempre que precisarem.',
      campos: [['Diferença entre os públicos', 'O Público 1 decide rápido e sem processo formal, e quer um canal direto. O Público 2 decide quando consegue resolver tudo numa viagem só.']],
      acoes: ['Canal prioritário e direto, sem explicar o contexto a cada solicitação.', 'Facilidade de remarcação de última hora, já que o calendário agrícola é imprevisível.', '<b>Público 2:</b> pacotes com múltiplas paradas, unindo negócio e lazer.'],
      next: 'Fechamento da primeira viagem e abertura de relação recorrente.' },
    { campos: [['Comportamento por público', 'O Público 1 tem alto potencial de recorrência pela própria rotina agrícola. O Público 2 tem ticket elevado por combinar uso profissional e lazer.']],
      acoes: ['Manter histórico de rotas e preferências de cada produtor.', '<b>Público 2:</b> cruzar com o funil de Lazer quando a viagem incluir descanso em família.', 'Aproveitar a presença em feiras como ponto de reengajamento anual.'],
      next: 'Relação recorrente estabelecida e indicação entre produtores da região.' }]},

  { id: 'aeromedico', nome: 'Aeromédico', etapas: [
    { pensa: 'A instituição ainda não conhece a Helitron como fornecedora aeromédica. O decisor pensa em transferir um paciente grave com mais rapidez ou levar um órgão a tempo.',
      campos: [['Gatilhos', 'Transferências do Entorno, como Luziânia, Anápolis, Cristalina e Formosa, casos graves distantes de centros de referência, captação de órgãos e abertura de processos de contratação.'],
               ['Onde encontrar', 'Relacionamento institucional direto com diretoria médica, gestores de credenciamento, centrais de transplante e secretarias. Não é um público alcançado por anúncio.']],
      acoes: ['Apresentação institucional da capacidade aeromédica, com prontidão em até 30 minutos.', '<b>Público 1:</b> abordagem direta aos complexos hospitalares.', '<b>Público 2:</b> abordar as operadoras como fornecedora a credenciar.', '<b>Público 3:</b> monitorar editais e se preparar para licitações e convênios.'],
      next: 'A instituição aceita reunião técnica, pede documentação ou abre processo de avaliação.' },
    { pensa: 'Já considera ter um fornecedor aeromédico e compara a Helitron com os concorrentes e com o transporte terrestre.',
      campos: [['Diferença entre os públicos', 'O Público 1 avalia tempo de resposta e integração com a equipe médica. O Público 2 avalia requisitos contratuais e discrição. O Público 3 avalia regularidade documental e exigências do processo público.'],
               ['Objeções', 'A empresa é nova, tem experiência em transporte de pacientes? Tem equipe disponível a qualquer hora? Está com a documentação regular?']],
      acoes: ['Dossiê técnico com certificações da ANAC, manutenção e protocolos de segurança.', 'Visita ao heliponto e ao helicentro, com o fluxo de acionamento.', 'Parceiros homologados com acordo de nível de serviço e plano B por categoria.', '<b>Público 3:</b> proposta técnica e comprovação de regularidade, preparada para o edital.'],
      next: 'A instituição pede proposta, minuta de contrato ou inicia o credenciamento.' },
    { pensa: 'Está perto de formalizar, mas quer a certeza de que a Helitron responde na emergência e cumpre o que promete.',
      campos: [['Diferença entre os públicos', 'O Público 1 decide com um acordo de acionamento claro. O Público 2 decide pelo credenciamento. O Público 3 decide dentro do processo público, por licitação, convênio ou contrato.']],
      acoes: ['Canal único e simples de acionamento para emergências.', 'Minuta com condições, tempos de resposta e responsabilidades claros.', '<b>Público 2:</b> credenciamento facilitado, com checklist e documentação prontos.'],
      next: 'Contrato, credenciamento ou convênio assinado, e entrada na rotina de acionamento.' },
    { campos: [['Comportamento por público', 'O Público 1 tem potencial de relação recorrente. O Público 2 mantém o credenciamento enquanto o serviço cumprir as exigências. O Público 3 firma contratos de longo prazo, com renovação.']],
      acoes: ['CRM institucional com contratos, vigências e tipos de ocorrência.', 'Revisão periódica de desempenho, com revisão após cada incidente.', 'Usar os contratos como referência institucional, sem expor dados de pacientes.', 'Explorar o cruzamento entre instituições da mesma rede.'],
      next: 'Renovação do contrato e ampliação da cobertura dentro da mesma rede.' }]},

  { id: 'pilotos', nome: 'Pilotos', talento: true, etapas: [
    { pensa: 'Ainda não pensa na Helitron como opção. O comandante experiente quer uma empresa civil que aproveite sua experiência militar, e o piloto em desenvolvimento quer horas de voo de verdade.',
      campos: [['Gatilhos', 'Fim de contrato militar ou busca por estabilidade no setor privado. No outro perfil, conclusão do PCH e necessidade de acumular horas.'],
               ['Onde encontrar', 'Grupos e fóruns de aviação, LinkedIn, indicação de comandantes e instrutores, e escolas de aviação civil.']],
      acoes: ['Conteúdo no LinkedIn com foco em operação e estrutura.', '<b>Público 1:</b> destacar a diversidade operacional, unindo executivo, aeromédico e turismo.', '<b>Público 2:</b> presença em escolas de formação.', 'Aproveitar o próprio piloto como canal de indicação, porque a reputação no meio pesa mais que anúncio de vaga.'],
      next: 'A pessoa pede informação sobre a operação ou é indicada por outro piloto que já voa pela Helitron.' },
    { pensa: 'Já considera a Helitron, mas compara com outras oportunidades. O salário não é o único critério, e pesa o que a empresa oferece de estrutura e trajetória.',
      campos: [['Diferença entre os públicos', 'O Público 1 avalia procedimentos de segurança, escalas e perspectiva de permanência. O Público 2 avalia quantas horas vai voar e se terá acompanhamento de comandantes experientes.'],
               ['Objeções', 'A frota é bem conservada? A escala é previsível? Essa empresa tem cultura de segurança compatível com o que eu já vivi? Vou acumular horas ou ficar estagnado?']],
      acoes: ['Comunicar com clareza a gestão de segurança operacional, a conservação da frota e a organização das escalas.', '<b>Público 1:</b> plano de carreira e possibilidade de atuar em operações aeromédicas.', '<b>Público 2:</b> trilha de copiloto a comando, com critérios objetivos de promoção.', 'Conversa direta com quem decide.'],
      next: 'A pessoa aceita entrevista ou visita a base para conhecer a estrutura.' },
    { pensa: 'Está perto de aceitar, mas quer a confirmação de que a empresa entrega o que prometeu na conversa.',
      campos: [['Diferença entre os públicos', 'O Público 1 decide quando sente que a operação é tão ou mais organizada do que a que já viveu. O Público 2 decide quando vê rotina de voos consistente e comandantes dispostos a acompanhar.']],
      acoes: ['Visita ao hangar, com apresentação da frota e da operação em formato de imersão.', '<b>Público 1:</b> remuneração, benefícios e estabilidade de forma transparente desde o início.', '<b>Público 2:</b> plano de desenvolvimento por escrito, com horas, prazo e requisitos.'],
      next: 'Assinatura do contrato e integração à operação.' },
    { campos: [['Comportamento por público', 'O Público 1 permanece se a cultura de segurança seguir compatível com o prometido. O Público 2 cresce de copiloto a comando se houver trilha de desenvolvimento.']],
      acoes: ['Cumprir e comunicar a progressão de horas e responsabilidades, para não perder o piloto ao próximo patamar.', 'Usar os comandantes como mentores dos pilotos em desenvolvimento.', 'Aproveitar que o meio é pequeno e conectado, onde um piloto satisfeito indica outros.'],
      next: 'Permanência do piloto na operação e indicação de novos candidatos dentro da rede.' }]}
];

let fSeg = 0, fEt = 0;

function painelFunil() {
  return `
  <p class="eyebrow">Funil de vendas</p>
  <h2>A jornada de cada frente</h2>
  <p class="lead">Quatro etapas, do primeiro contato à indicação. Escolha a frente e a etapa para ver o comportamento do cliente e a atuação da Helitron. As etapas representam a sequência da jornada, e não proporção de volume.</p>
  <div class="fseg" id="fseg"></div>
  <div class="fgrid">
    <div class="funnel" id="funnel"></div>
    <article class="detail" id="detail" aria-live="polite"></article>
  </div>`;
}

function renderFunil() {
  const s = FUNIL[fSeg], e = s.etapas[fEt];

  $('#fseg').innerHTML = FUNIL.map((x, i) =>
    `<button class="sgbtn" aria-pressed="${i === fSeg}" data-s="${i}">${esc(x.nome)}${x.talento ? ' · talentos' : ''}</button>`).join('');

  $('#funnel').innerHTML = ETAPAS.map((x, i) =>
    `<button class="stage" aria-pressed="${i === fEt}" data-e="${i}">
       <span class="n">${i + 1}</span>
       <span><span class="nm">${x.nm}</span><span class="ds">${x.ds}</span></span>
     </button>`).join('');

  let h = `<h3>${s.nome} · ${ETAPAS[fEt].nm}, ${ETAPAS[fEt].ds}</h3>`;
  if (e.pensa) h += `<div class="blk"><h4>${s.talento ? 'O que o piloto pensa' : 'O que a pessoa sente e pensa'}</h4><p class="quote">${esc(e.pensa)}</p></div>`;
  (e.campos || []).forEach(c => {
    h += `<div class="blk"><h4>${esc(c[0])}</h4><p>${esc(c[1])}</p></div>`;
  });
  h += `<div class="blk"><h4>Ação da Helitron</h4><ul class="ul">${e.acoes.map(a => `<li>${rich(a)}</li>`).join('')}</ul></div>`;
  h += `<p class="next"><b>${fEt === 3 ? 'Resultado esperado.' : 'O que leva para o próximo estágio.'}</b> ${esc(e.next)}</p>`;
  $('#detail').innerHTML = h;
}

/* ------------------------------------------------------------------ abas */

const ABAS = [
  { id: 'visao', nome: 'Visão geral' },
  { id: 'mercado', nome: 'Mercado', render: painelMercado },
  { id: 'publicos', nome: 'Públicos', render: painelPublicos },
  { id: 'sazonal', nome: 'Sazonalidade', render: painelSazonal },
  { id: 'concorrencia', nome: 'Concorrência', render: painelConcorrencia },
  { id: 'funil', nome: 'Funil de vendas', render: painelFunil, after: renderFunil }
];

let aba = 'visao';

function abrir(id) {
  const a = ABAS.find(x => x.id === id) || ABAS[0];
  aba = a.id;
  ABAS.forEach(x => { $('#p-' + x.id).hidden = x.id !== aba; });
  document.querySelectorAll('.tab').forEach(t =>
    t.setAttribute('aria-selected', t.dataset.id === aba));
  const el = $('#p-' + aba);
  if (a.render && !el.dataset.done) { el.innerHTML = a.render(); el.dataset.done = '1'; }
  if (a.after) a.after();
  if (location.hash.slice(1) !== aba) history.replaceState(null, '', '#' + aba);
}

$('#tabs').innerHTML = ABAS.map(a =>
  `<button class="tab" role="tab" id="t-${a.id}" data-id="${a.id}" aria-selected="${a.id === 'visao'}" aria-controls="p-${a.id}">${esc(a.nome)}</button>`).join('');

$('#tabs').addEventListener('click', ev => {
  const b = ev.target.closest('.tab');
  if (b) abrir(b.dataset.id);
});

document.addEventListener('click', ev => {
  const sg = ev.target.closest('.sgbtn');
  if (sg) { fSeg = +sg.dataset.s; fEt = 0; renderFunil(); return; }
  const st = ev.target.closest('.stage');
  if (st) { fEt = +st.dataset.e; renderFunil(); }
});

window.addEventListener('hashchange', () => abrir(location.hash.slice(1)));

abrir(/^[a-z]+$/.test(location.hash.slice(1)) ? location.hash.slice(1) : 'visao');
