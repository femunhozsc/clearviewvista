// Correção do bug do comparador - sugestões específicas para comparação
function mostrarSugestoesComparador(inputElement, suggestionBoxElement) {
    const termo = inputElement.value.toLowerCase();
    
    if (termo.length < 1) {
        suggestionBoxElement.classList.add('hidden');
        return;
    }
    
    // Usa dados locais se a API não estiver disponível
    let sugestoes = [];
    if (listaAtivosCompleta && listaAtivosCompleta.length > 0) {
        sugestoes = listaAtivosCompleta.filter(ativo => 
            ativo.ticker.toLowerCase().includes(termo) || ativo.nome.toLowerCase().includes(termo)
        ).slice(0, 5);
    } else if (window.DADOS_ATIVOS) {
        sugestoes = window.DADOS_ATIVOS.buscarSugestoes(termo);
    }

    if (sugestoes.length > 0) {
        suggestionBoxElement.innerHTML = sugestoes.map(s => `
            <div data-ticker="${s.ticker}" class="suggestion-item-comparador p-3 cursor-pointer hover:bg-zinc-700 transition-colors border-b border-zinc-800 last:border-b-0 flex items-center space-x-3">
                 <div class="flex-shrink-0">${getLogoHTML(s.ticker, s.tipo, 'w-6 h-6')}</div>
                <div>
                    <span class="font-bold text-white">${s.ticker}</span>
                    <span class="text-gray-400 text-sm">- ${s.nome}</span>
                </div>
            </div>
        `).join('');

        // Event listeners específicos para o comparador
        suggestionBoxElement.querySelectorAll('.suggestion-item-comparador').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                inputElement.value = item.dataset.ticker;
                suggestionBoxElement.classList.add('hidden');
                // NÃO navega para o ativo, apenas preenche o campo
            });
        });

        suggestionBoxElement.classList.remove('hidden');
        suggestionBoxElement.style.zIndex = '9999';
    } else {
        suggestionBoxElement.classList.add('hidden');
    }
}

// Função melhorada para renderizar o comparador
function renderizarComparador(tipo, event) {
    if(event) event.preventDefault();
    mainContainer.innerHTML = `
        <div class="text-center py-12 fade-in-up">
            <h1 class="text-4xl font-bold text-white mb-2">Comparador de Ativos</h1>
            <p class="text-lg text-gray-400 mb-10">Selecione dois ativos para comparar seus indicadores e performance.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 fade-in-up" style="--animation-delay: 200ms;">
            <div class="relative">
                <input type="text" id="comparadorInput1" placeholder="Buscar Ativo 1..." class="w-full bg-zinc-900/50 border border-zinc-700 text-gray-200 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-lg" autocomplete="off">
                <div id="suggestion-box-1" class="absolute hidden w-full mt-2 card-background shadow-lg z-20 suggestion-box"></div>
            </div>
            <div class="relative">
                <input type="text" id="comparadorInput2" placeholder="Buscar Ativo 2..." class="w-full bg-zinc-900/50 border border-zinc-700 text-gray-200 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-lg" autocomplete="off">
                 <div id="suggestion-box-2" class="absolute hidden w-full mt-2 card-background shadow-lg z-20 suggestion-box"></div>
            </div>
        </div>
         <div class="text-center mb-12 fade-in-up" style="--animation-delay: 300ms;">
            <button id="compareBtn" class="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105">Comparar</button>
        </div>
        <div id="comparison-results"></div>
    `;
    
    const input1 = document.getElementById('comparadorInput1');
    const suggestionBox1 = document.getElementById('suggestion-box-1');
    const input2 = document.getElementById('comparadorInput2');
    const suggestionBox2 = document.getElementById('suggestion-box-2');

    // Usa a função específica do comparador para sugestões
    input1.addEventListener('input', () => mostrarSugestoesComparador(input1, suggestionBox1));
    input2.addEventListener('input', () => mostrarSugestoesComparador(input2, suggestionBox2));
    
    // Permite busca com Enter
    input1.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            suggestionBox1.classList.add('hidden');
            if (input1.value.trim() && input2.value.trim()) {
                buscarECompararAtivos();
            }
        }
    });
    
    input2.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            suggestionBox2.classList.add('hidden');
            if (input1.value.trim() && input2.value.trim()) {
                buscarECompararAtivos();
            }
        }
    });
    
    // Esconder sugestões quando clicar fora
    document.addEventListener('click', (e) => {
        if (!input1.contains(e.target) && !suggestionBox1.contains(e.target)) {
            suggestionBox1.classList.add('hidden');
        }
        if (!input2.contains(e.target) && !suggestionBox2.contains(e.target)) {
            suggestionBox2.classList.add('hidden');
        }
    });

    document.getElementById('compareBtn').addEventListener('click', buscarECompararAtivos);
}

// Layout melhorado para gráficos responsivos
function criarLayoutGraficoResponsivo(titulo, canvasId, periodos = ['1M', '3M', '6M', '1Y', '5Y', 'MAX']) {
    return `
        <div class="card-background p-4 md:p-6 fade-in-up" style="--animation-delay: 200ms;">
            <div class="flex flex-col space-y-4 mb-6">
                <h3 class="text-xl md:text-2xl font-bold text-white">${titulo}</h3>
                <div class="flex flex-wrap gap-2 justify-center md:justify-start">
                    ${periodos.map(p => 
                        `<button onclick="mudarPeriodoGrafico('${p.toLowerCase()}')" class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-gray-400 hover:bg-zinc-700 hover:text-amber-400 whitespace-nowrap" data-periodo="${p.toLowerCase()}">${p}</button>`
                    ).join('')}
                </div>
            </div>
            <div class="relative w-full" style="height: 300px;">
                <canvas id="${canvasId}" class="w-full h-full"></canvas>
            </div>
        </div>
    `;
}

// Função melhorada para renderizar resultado da comparação
function renderizarResultadoComparacao(data, periodo) {
    const resultsDiv = document.getElementById('comparison-results');
    const { ativo1, ativo2, indicadores_comparativos, historico_normalizado } = data;
    
    const header1 = `
        <div class="flex items-center space-x-4">
            ${getLogoHTML(ativo1.ticker, ativo1.quoteType, 'w-12 h-12', 'rounded-xl')}
            <div>
                <p class="text-xl font-bold text-white">${ativo1.ticker}</p>
                <p class="text-sm text-gray-400 truncate">${ativo1.nome}</p>
            </div>
        </div>`;
    
    const header2 = `
        <div class="flex items-center space-x-4">
             ${getLogoHTML(ativo2.ticker, ativo2.quoteType, 'w-12 h-12', 'rounded-xl')}
            <div>
                <p class="text-xl font-bold text-white">${ativo2.ticker}</p>
                <p class="text-sm text-gray-400 truncate">${ativo2.nome}</p>
            </div>
        </div>`;
    
    let tabelaHTML = '';
    indicadores_comparativos.forEach(item => {
        const winner1Class = item.winner === 1 ? 'text-green-400 font-bold' : 'text-white';
        const winner2Class = item.winner === 2 ? 'text-green-400 font-bold' : 'text-white';

        tabelaHTML += `
            <div class="grid grid-cols-3 items-center text-center py-3 border-b border-zinc-800">
                <span class="${winner1Class} text-sm md:text-base">${item.valor1}</span>
                <span class="text-gray-400 text-xs md:text-sm">${item.label}</span>
                <span class="${winner2Class} text-sm md:text-base">${item.valor2}</span>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = `
        <div class="card-background p-4 md:p-6 mb-8 fade-in-up">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                ${header1}
                ${header2}
            </div>
            <div class="mt-8 overflow-x-auto">${tabelaHTML}</div>
        </div>
        ${criarLayoutGraficoResponsivo('Performance Normalizada (Base 100)', 'comparativoChart')}
    `;
    
    setTimeout(() => inicializarGraficoComparativo(historico_normalizado), 100);
}

// Função melhorada para renderizar página de ativo
function renderizarPaginaAtivo(ativo) {
    currentTicker = ativo.ticker;
    const corVariacao = ativo.eh_positivo ? 'text-green-400' : 'text-red-400';
    const sinalVariacao = ativo.eh_positivo ? '+' : '';

    let secoesHTML = '';
    if(ativo.secoes && ativo.secoes.length > 0) {
        secoesHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            <div class="space-y-6">
                <div>
                    <h4 class="text-lg font-bold text-amber-400 mb-2">${(ativo.secoes[0] || { titulo: 'Valuation' }).titulo}</h4>
                    ${(ativo.secoes[0] || { indicadores: [] }).indicadores.map(item => `<div class="flex justify-between py-2 border-b border-zinc-800 text-sm"><span class="text-gray-400">${item.label}</span><span class="font-medium text-white">${item.value}</span></div>`).join('')}
                </div>
                ${ativo.secoes[2] ? `
                <div>
                    <h4 class="text-lg font-bold text-amber-400 mb-2">${ativo.secoes[2].titulo}</h4>
                    ${ativo.secoes[2].indicadores.map(item => `<div class="flex justify-between py-2 border-b border-zinc-800 text-sm"><span class="text-gray-400">${item.label}</span><span class="font-medium text-white">${item.value}</span></div>`).join('')}
                </div>
                ` : ''}
            </div>
            <div class="space-y-6">
                ${ativo.secoes[1] ? `
                <div>
                    <h4 class="text-lg font-bold text-amber-400 mb-2">${ativo.secoes[1].titulo}</h4>
                    ${ativo.secoes[1].indicadores.map(item => `<div class="flex justify-between py-2 border-b border-zinc-800 text-sm"><span class="text-gray-400">${item.label}</span><span class="font-medium text-white">${item.value}</span></div>`).join('')}
                </div>
                ` : ''}
                ${ativo.secoes[3] ? `
                <div>
                    <h4 class="text-lg font-bold text-amber-400 mb-2">${ativo.secoes[3].titulo}</h4>
                    ${ativo.secoes[3].indicadores.map(item => `<div class="flex justify-between py-2 border-b border-zinc-800 text-sm"><span class="text-gray-400">${item.label}</span><span class="font-medium text-white">${item.value}</span></div>`).join('')}
                </div>
                ` : ''}
            </div>
        </div>
        `;
    }

    mainContainer.innerHTML = `
        <div class="fade-in-up">
            <div class="card-background p-4 md:p-6 mb-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div class="flex items-center space-x-4 mb-4 md:mb-0">
                        ${getLogoHTML(ativo.ticker, ativo.quoteType, 'w-12 h-12 md:w-16 md:h-16', 'rounded-xl')}
                        <div>
                            <h1 class="text-2xl md:text-3xl font-bold text-white">${ativo.ticker}</h1>
                            <p class="text-gray-400 text-sm md:text-base">${ativo.nome}</p>
                            <p class="text-gray-500 text-xs md:text-sm">${ativo.tipo_ativo}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl md:text-3xl font-bold text-white">${ativo.preco_atual}</p>
                        <p class="text-lg md:text-xl font-semibold ${corVariacao}">${sinalVariacao}${ativo.variacao_dia_abs} (${ativo.variacao_dia_pct})</p>
                    </div>
                </div>
                ${secoesHTML}
            </div>
            ${criarLayoutGraficoResponsivo('Histórico de Preços', 'priceChart')}
        </div>
    `;

    if (ativo.historico_grafico) {
        setTimeout(() => inicializarGrafico(ativo.historico_grafico, '1y', 'priceChart'), 100);
    }
}