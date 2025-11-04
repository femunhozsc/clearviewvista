// Arquivo: comparator.js

// Variáveis globais para os gráficos
let chart1 = null;
let chart2 = null;

/**
 * Renderiza a página do comparador de ativos.
 * @param {string} tipo - O tipo de ativo a ser comparado ('acoes' ou 'fiis').
 */
function renderizarComparador(tipo) {
    const mainContent = document.getElementById('main-content');
    const isAcoes = tipo === 'acoes';
    const titulo = isAcoes ? 'Comparador de Ações' : 'Comparador de Fundos Imobiliários (FIIs)';
    const placeholder = isAcoes ? 'Ex: PETR4, VALE3' : 'Ex: MXRF11, KNRI11';

    mainContent.innerHTML = `
        <div class="container mx-auto px-6 py-12 fade-in-up" style="--animation-delay: 0.1s;">
            <h1 class="text-4xl font-bold text-amber-400 mb-8">${titulo}</h1>
            
            <div class="flex flex-col md:flex-row gap-6 mb-8">
                <!-- Input 1 -->
                <div class="flex-1 relative">
                    <label for="comparadorInput1" class="block text-sm font-medium text-gray-400 mb-1">Ativo 1</label>
                    <input type="text" id="comparadorInput1" placeholder="${placeholder}"
                           class="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-amber-500 focus:border-amber-500 transition-all"
                           oninput="mostrarSugestoesComparador(this, 1)">
                    <div id="suggestion-box-1" class="suggestion-box w-full mt-1 hidden"></div>
                </div>

                <!-- Input 2 -->
                <div class="flex-1 relative">
                    <label for="comparadorInput2" class="block text-sm font-medium text-gray-400 mb-1">Ativo 2</label>
                    <input type="text" id="comparadorInput2" placeholder="${placeholder}"
                           class="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-amber-500 focus:border-amber-500 transition-all"
                           oninput="mostrarSugestoesComparador(this, 2)">
                    <div id="suggestion-box-2" class="suggestion-box w-full mt-1 hidden"></div>
                </div>
            </div>

            <button onclick="buscarECompararAtivos()"
                    class="w-full md:w-auto px-6 py-3 bg-amber-500 text-zinc-900 font-bold rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/30">
                Comparar Ativos
            </button>

            <!-- Área de Resultados -->
            <div id="comparador-resultados" class="mt-12">
                <p class="text-center text-gray-500">Insira dois ativos para iniciar a comparação.</p>
            </div>
        </div>
    `;
    
    // Limpa os gráficos anteriores
    chart1 = null;
    chart2 = null;
    
    // Configura o tipo de ativo para a busca
    window.COMPARATOR_ASSET_TYPE = isAcoes ? 'EQUITY' : 'MUTUALFUND';
    
    // Adiciona o evento de fechar sugestões ao clicar fora
    document.addEventListener('click', fecharSugestoesComparador);
}

/**
 * Mostra sugestões de ativos ao digitar nos campos do comparador.
 * @param {HTMLInputElement} inputElement - O elemento de input.
 * @param {number} boxId - O ID da caixa de sugestões (1 ou 2).
 */
function mostrarSugestoesComparador(inputElement, boxId) {
    const termo = inputElement.value.trim();
    const suggestionBox = document.getElementById(\`suggestion-box-\${boxId}\`);
    
    if (termo.length < 2) {
        suggestionBox.classList.add('hidden');
        return;
    }

    // Usa a função de busca de sugestões do data_loader.js
    const sugestoes = window.DADOS_ATIVOS.buscarSugestoes(termo)
        .filter(ativo => ativo.tipo === window.COMPARATOR_ASSET_TYPE);

    if (sugestoes.length === 0) {
        suggestionBox.classList.add('hidden');
        return;
    }

    suggestionBox.innerHTML = sugestoes.map(ativo => \`
        <div class="p-3 cursor-pointer hover:bg-zinc-700/70 transition-colors" 
             onclick="selecionarSugestaoComparador('${ativo.ticker}', ${boxId})">
            <span class="font-bold text-amber-400">${ativo.ticker}</span> - ${ativo.nome}
        </div>
    \`).join('');

    suggestionBox.classList.remove('hidden');
    
    // Posiciona a caixa de sugestões
    const rect = inputElement.getBoundingClientRect();
    suggestionBox.style.top = \`\${rect.height + 5}px\`;
    suggestionBox.style.left = '0';
    suggestionBox.style.width = \`\${rect.width}px\`;
}

/**
 * Seleciona uma sugestão e preenche o campo de input.
 * @param {string} ticker - O ticker do ativo selecionado.
 * @param {number} boxId - O ID da caixa de sugestões (1 ou 2).
 */
function selecionarSugestaoComparador(ticker, boxId) {
    document.getElementById(\`comparadorInput\${boxId}\`).value = ticker;
    document.getElementById(\`suggestion-box-\${boxId}\`).classList.add('hidden');
}

/**
 * Fecha as caixas de sugestões.
 * @param {Event} event - O evento de clique.
 */
function fecharSugestoesComparador(event) {
    if (!event.target.closest('#comparadorInput1') && !event.target.closest('#suggestion-box-1')) {
        document.getElementById('suggestion-box-1')?.classList.add('hidden');
    }
    if (!event.target.closest('#comparadorInput2') && !event.target.closest('#suggestion-box-2')) {
        document.getElementById('suggestion-box-2')?.classList.add('hidden');
    }
}

/**
 * Busca e compara os ativos.
 */
async function buscarECompararAtivos() {
    const ticker1 = document.getElementById('comparadorInput1').value.trim().toUpperCase();
    const ticker2 = document.getElementById('comparadorInput2').value.trim().toUpperCase();
    const resultadosDiv = document.getElementById('comparador-resultados');

    if (!ticker1 || !ticker2) {
        resultadosDiv.innerHTML = \`<p class="text-center text-red-400">Por favor, insira dois ativos para comparar.</p>\`;
        return;
    }

    resultadosDiv.innerHTML = \`
        <div class="flex justify-center items-center py-10">
            <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            <p class="text-gray-400 ml-4">Buscando dados de ${ticker1} e ${ticker2}...</p>
        </div>
    \`;

    try {
        const [data1, data2] = await Promise.all([
            fetch(\`/api/ativo/\${ticker1}\`).then(res => res.json()),
            fetch(\`/api/ativo/\${ticker2}\`).then(res => res.json())
        ]);

        if (data1.erro || data2.erro) {
            resultadosDiv.innerHTML = \`<p class="text-center text-red-400">Erro ao buscar dados: \${data1.erro || data2.erro}</p>\`;
            return;
        }

        renderizarResultadosComparacao(ticker1, data1, ticker2, data2);
        
        // Atualiza a URL para que a comparação possa ser compartilhada
        navigateToComparison(ticker1, ticker2);

    } catch (error) {
        console.error('Erro na comparação de ativos:', error);
        resultadosDiv.innerHTML = \`<p class="text-center text-red-400">Ocorreu um erro ao processar a comparação. Tente novamente.</p>\`;
    }
}

/**
 * Renderiza a tabela e os gráficos de comparação.
 * @param {string} ticker1 - Ticker do ativo 1.
 * @param {object} data1 - Dados do ativo 1.
 * @param {string} ticker2 - Ticker do ativo 2.
 * @param {object} data2 - Dados do ativo 2.
 */
function renderizarResultadosComparacao(ticker1, data1, ticker2, data2) {
    const resultadosDiv = document.getElementById('comparador-resultados');
    
    // Indicadores a serem comparados
    const indicadores = [
        { key: 'regularMarketPrice', nome: 'Preço Atual', format: (v) => formatarMoeda(v) },
        { key: 'dividend_yield', nome: 'Dividend Yield', format: (v) => formatarPorcentagem(v) },
        { key: 'p_l', nome: 'P/L (Preço/Lucro)', format: (v) => formatarNumero(v) },
        { key: 'p_vp', nome: 'P/VP (Preço/Valor Patrimonial)', format: (v) => formatarNumero(v) },
        { key: 'roic', nome: 'ROIC', format: (v) => formatarPorcentagem(v) },
        { key: 'lpa', nome: 'LPA (Lucro por Ação)', format: (v) => formatarNumero(v) },
        { key: 'vpa', nome: 'VPA (Valor Patrimonial por Ação)', format: (v) => formatarNumero(v) },
        { key: 'marketCap', nome: 'Valor de Mercado', format: (v) => formatarMilhoes(v) },
        { key: 'ebitda', nome: 'EBITDA', format: (v) => formatarMilhoes(v) },
    ];

    let tabelaHTML = \`
        <h2 class="text-3xl font-semibold text-white mb-6 border-b border-zinc-700 pb-3">Comparação de Indicadores</h2>
        <div class="card-background p-6 shadow-xl overflow-x-auto">
            <table class="min-w-full divide-y divide-zinc-700">
                <thead>
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Indicador</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">${ticker1}</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">${ticker2}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800">
    \`;

    indicadores.forEach(indicador => {
        const valor1 = data1.indicadores[indicador.key] || data1.info[indicador.key];
        const valor2 = data2.indicadores[indicador.key] || data2.info[indicador.key];
        
        const formatado1 = valor1 !== undefined && valor1 !== null ? indicador.format(valor1) : 'N/A';
        const formatado2 = valor2 !== undefined && valor2 !== null ? indicador.format(valor2) : 'N/A';

        // Lógica simples para destacar o melhor (verde) e o pior (vermelho)
        let class1 = '';
        let class2 = '';
        
        // Indicadores onde MAIOR é melhor (ex: DY, P/L baixo, ROIC)
        if (['dividend_yield', 'roic', 'lpa', 'vpa', 'marketCap', 'ebitda'].includes(indicador.key)) {
            if (valor1 > valor2) { class1 = 'text-green-400 font-bold'; class2 = 'text-red-400'; }
            else if (valor2 > valor1) { class2 = 'text-green-400 font-bold'; class1 = 'text-red-400'; }
        } 
        // Indicadores onde MENOR é melhor (ex: P/L, P/VP)
        else if (['p_l', 'p_vp'].includes(indicador.key)) {
            if (valor1 < valor2) { class1 = 'text-green-400 font-bold'; class2 = 'text-red-400'; }
            else if (valor2 < valor1) { class2 = 'text-green-400 font-bold'; class1 = 'text-red-400'; }
        }
        // Preço Atual não tem "melhor"
        else if (indicador.key === 'regularMarketPrice') {
            class1 = 'text-amber-400';
            class2 = 'text-amber-400';
        }

        tabelaHTML += \`
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">${indicador.nome}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm \${class1}">${formatado1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm \${class2}">${formatado2}</td>
            </tr>
        \`;
    });

    tabelaHTML += \`
                </tbody>
            </table>
        </div>
    \`;
    
    // Adiciona a seção de gráficos
    tabelaHTML += \`
        <h2 class="text-3xl font-semibold text-white mt-12 mb-6 border-b border-zinc-700 pb-3">Gráfico de Retorno (1 Ano)</h2>
        <div class="card-background p-6 shadow-xl">
            <canvas id="comparadorChart"></canvas>
        </div>
    \`;

    resultadosDiv.innerHTML = tabelaHTML;
    
    // Renderiza o gráfico
    renderizarGraficoComparacao(ticker1, data1.historico, ticker2, data2.historico);
}

/**
 * Renderiza o gráfico de comparação de retorno.
 * @param {string} ticker1 - Ticker do ativo 1.
 * @param {object} historico1 - Histórico de preços do ativo 1.
 * @param {string} ticker2 - Ticker do ativo 2.
 * @param {object} historico2 - Histórico de preços do ativo 2.
 */
function renderizarGraficoComparacao(ticker1, historico1, ticker2, historico2) {
    const ctx = document.getElementById('comparadorChart').getContext('2d');
    
    // Função para calcular o retorno percentual normalizado
    function calcularRetornoNormalizado(historico) {
        if (!historico || historico.length === 0) return [];
        
        const precos = historico.map(item => item.Close);
        const datas = historico.map(item => item.Date);
        
        const precoInicial = precos[0];
        if (!precoInicial || precoInicial === 0) return [];
        
        const retornos = precos.map(preco => ({
            x: datas[precos.indexOf(preco)],
            y: ((preco - precoInicial) / precoInicial) * 100
        }));
        
        return retornos;
    }

    const retornos1 = calcularRetornoNormalizado(historico1);
    const retornos2 = calcularRetornoNormalizado(historico2);
    
    // Destrói o gráfico anterior se existir
    if (chart1) {
        chart1.destroy();
    }

    chart1 = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: ticker1,
                    data: retornos1,
                    borderColor: 'rgb(250, 204, 21)', // Amarelo
                    backgroundColor: 'rgba(250, 204, 21, 0.1)',
                    tension: 0.1,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: ticker2,
                    data: retornos2,
                    borderColor: 'rgb(59, 130, 246)', // Azul
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#a1a1aa' // gray-400
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2) + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month'
                    },
                    title: {
                        display: true,
                        text: 'Data',
                        color: '#a1a1aa'
                    },
                    ticks: {
                        color: '#a1a1aa'
                    },
                    grid: {
                        color: 'rgba(63, 63, 70, 0.5)' // zinc-700
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Retorno (%)',
                        color: '#a1a1aa'
                    },
                    ticks: {
                        color: '#a1a1aa',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(63, 63, 70, 0.5)' // zinc-700
                    }
                }
            }
        }
    });
}

// Funções de formatação importadas do data_loader.js
const formatarMoeda = window.DADOS_ATIVOS.formatarMoeda;
const formatarPorcentagem = window.DADOS_ATIVOS.formatarPorcentagem;
const formatarNumero = window.DADOS_ATIVOS.formatarNumero;
const formatarMilhoes = window.DADOS_ATIVOS.formatarMilhoes;

// Garante que as funções de navegação estejam disponíveis
window.renderizarComparador = renderizarComparador;
window.buscarECompararAtivos = buscarECompararAtivos;
window.mostrarSugestoesComparador = mostrarSugestoesComparador;
window.selecionarSugestaoComparador = selecionarSugestaoComparador;
window.navigateToComparison = navigateToComparison; // Assumindo que navigateToComparison está em router.js
