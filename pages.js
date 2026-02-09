/**
 * Sistema de páginas dinâmicas para Clearview Vista
 * Gerencia renderização de páginas e rotas
 */

class PagesManager {
    constructor(mainContainer, apiUrl) {
        this.mainContainer = mainContainer;
        this.apiUrl = apiUrl;
        this.currentPage = null;
        this.currentChart = null;
    }

    /**
     * Renderiza página de detalhes de um ativo
     */
    async renderAtivoDetalhes(ticker) {
        this.mainContainer.innerHTML = `
            <div class="flex justify-center items-center p-8">
                <div class="loader border-4 border-zinc-800 rounded-full w-12 h-12"></div>
            </div>
        `;

        try {
            const response = await fetch(`${this.apiUrl}/api/ativo/${ticker}/detalhes`);
            if (!response.ok) throw new Error('Erro ao carregar dados do ativo');
            
            const data = await response.json();
            this.renderAtivoContent(data);
        } catch (error) {
            console.error('Erro:', error);
            this.mainContainer.innerHTML = `
                <div class="card-background p-8 text-center">
                    <p class="text-red-400">Erro ao carregar dados do ativo</p>
                    <button onclick="renderizarPaginaInicial()" class="mt-4 text-amber-400 hover:text-amber-300">Voltar</button>
                </div>
            `;
        }
    }

    /**
     * Renderiza conteúdo do ativo
     */
    renderAtivoContent(data) {
        const yf = data.dados_yfinance || {};
        const av = data.indicadores_alpha_vantage || {};
        const quote = data.quote_alpha_vantage || {};

        let html = `
            <div class="fade-in-up">
                <!-- Header do Ativo -->
                <div class="card-background p-6 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-4">
                            <div>${getLogoHTML(data.ticker, yf.quoteType || 'EQUITY', 'w-16 h-16')}</div>
                            <div>
                                <h1 class="text-3xl font-bold text-white">${data.ticker}</h1>
                                <p class="text-gray-400">${yf.nome || data.ticker}</p>
                            </div>
                        </div>
                        <button onclick="renderizarPaginaInicial()" class="text-gray-400 hover:text-amber-400">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Preço e Variação -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p class="text-gray-400 text-sm">Preço Atual</p>
                            <p class="text-2xl font-bold text-white">${yf.preco_atual || 'N/D'}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-sm">Variação (Dia)</p>
                            <p class="text-2xl font-bold ${yf.eh_positivo ? 'text-green-400' : 'text-red-400'}">
                                ${yf.variacao_dia_pct || 'N/D'} (${yf.variacao_dia_abs || 'N/D'})
                            </p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-sm">Tipo</p>
                            <p class="text-lg font-semibold text-amber-400">${yf.tipo_ativo || 'N/D'}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-sm">Ticker</p>
                            <p class="text-lg font-semibold text-white">${data.ticker}</p>
                        </div>
                    </div>
                </div>

                <!-- Gráfico -->
                ${data.historico_grafico ? `
                    <div class="card-background p-6 mb-6">
                        <h2 class="text-xl font-bold text-white mb-4">Gráfico de Preço</h2>
                        <canvas id="ativoChart" height="80"></canvas>
                    </div>
                ` : ''}

                <!-- Indicadores Alpha Vantage -->
                <div class="card-background p-6 mb-6">
                    <h2 class="text-xl font-bold text-white mb-4 border-l-4 border-amber-400 pl-4">Indicadores Técnicos (Alpha Vantage)</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        `;

        // Adiciona indicadores disponíveis
        const indicadores_display = [
            { key: 'SMA_20', label: 'SMA 20' },
            { key: 'SMA_50', label: 'SMA 50' },
            { key: 'SMA_200', label: 'SMA 200' },
            { key: 'RSI_14', label: 'RSI 14' },
            { key: 'MACD', label: 'MACD' },
            { key: 'ATR_14', label: 'ATR 14' },
            { key: 'ADX', label: 'ADX' },
            { key: 'OBV', label: 'OBV' }
        ];

        indicadores_display.forEach(ind => {
            const valor = av[ind.key];
            if (valor && valor !== 'N/D') {
                html += `
                    <div class="bg-zinc-900/50 p-4 rounded-lg">
                        <p class="text-gray-400 text-sm">${ind.label}</p>
                        <p class="text-lg font-semibold text-white">${typeof valor === 'number' ? valor.toFixed(2) : valor}</p>
                    </div>
                `;
            }
        });

        html += `
                    </div>
                </div>
        `;

        // Adiciona seções do Yahoo Finance se disponíveis
        if (yf.secoes && yf.secoes.length > 0) {
            yf.secoes.forEach(secao => {
                html += `
                    <div class="card-background p-6 mb-6">
                        <h2 class="text-xl font-bold text-white mb-4 border-l-4 border-amber-400 pl-4">${secao.titulo}</h2>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                `;
                
                secao.indicadores.forEach(ind => {
                    html += `
                        <div class="bg-zinc-900/50 p-4 rounded-lg">
                            <p class="text-gray-400 text-sm">${ind.label}</p>
                            <p class="text-lg font-semibold text-white">${ind.value}</p>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            });
        }

        html += `</div>`;

        this.mainContainer.innerHTML = html;

        // Renderiza gráfico se houver dados
        if (data.historico_grafico) {
            this.renderChart(data.historico_grafico);
        }
    }

    /**
     * Renderiza gráfico de preço
     */
    renderChart(historico) {
        const canvas = document.getElementById('ativoChart');
        if (!canvas) return;

        if (this.currentChart) {
            this.currentChart.destroy();
        }

        this.currentChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: historico.labels,
                datasets: [{
                    label: 'Preço de Fechamento',
                    data: historico.data,
                    borderColor: '#facc15',
                    backgroundColor: 'rgba(250, 204, 21, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#d4d4d8' }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a1a1a1' }
                    },
                    y: {
                        display: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a1a1a1' }
                    }
                }
            }
        });
    }

    /**
     * Renderiza página de calculadora de juros compostos
     */
    renderCalculadora() {
        const html = `
            <div class="fade-in-up max-w-2xl mx-auto">
                <div class="card-background p-8 mb-6">
                    <h1 class="text-3xl font-bold text-white mb-2">Calculadora de Juros Compostos</h1>
                    <p class="text-gray-400">Calcule o rendimento de seus investimentos com juros compostos</p>
                </div>

                <div class="card-background p-8 mb-6">
                    <form id="calculadoraForm" class="space-y-6">
                        <!-- Capital Inicial -->
                        <div>
                            <label class="block text-white font-semibold mb-2">Capital Inicial (R$)</label>
                            <input type="number" id="capitalInicial" placeholder="Ex: 10000" step="0.01" min="0" 
                                   class="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400" required>
                        </div>

                        <!-- Taxa de Juros -->
                        <div>
                            <label class="block text-white font-semibold mb-2">Taxa de Juros (% ao ano)</label>
                            <input type="number" id="taxaJuros" placeholder="Ex: 12" step="0.01" min="0" 
                                   class="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400" required>
                        </div>

                        <!-- Período -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-white font-semibold mb-2">Período</label>
                                <input type="number" id="periodo" placeholder="Ex: 10" step="1" min="1" 
                                       class="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400" required>
                            </div>
                            <div>
                                <label class="block text-white font-semibold mb-2">Unidade de Tempo</label>
                                <select id="unidadeTempo" class="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400">
                                    <option value="ano">Ano(s)</option>
                                    <option value="mes">Mês(es)</option>
                                    <option value="dia">Dia(s)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Aporte Regular -->
                        <div>
                            <label class="block text-white font-semibold mb-2">Aporte Regular (R$) - Opcional</label>
                            <input type="number" id="aporteRegular" placeholder="Ex: 500" step="0.01" min="0" 
                                   class="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400">
                        </div>

                        <!-- Frequência de Aporte -->
                        <div>
                            <label class="block text-white font-semibold mb-2">Frequência de Aporte</label>
                            <select id="frequenciaAporte" class="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400">
                                <option value="mensal">Mensal</option>
                                <option value="trimestral">Trimestral</option>
                                <option value="semestral">Semestral</option>
                                <option value="anual">Anual</option>
                            </select>
                        </div>

                        <!-- Capitalização -->
                        <div>
                            <label class="block text-white font-semibold mb-2">Capitalização</label>
                            <select id="capitalizacao" class="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400">
                                <option value="anual">Anual</option>
                                <option value="semestral">Semestral</option>
                                <option value="trimestral">Trimestral</option>
                                <option value="mensal">Mensal</option>
                                <option value="diaria">Diária</option>
                            </select>
                        </div>

                        <button type="submit" class="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-3 rounded-lg transition-colors">
                            Calcular
                        </button>
                    </form>
                </div>

                <!-- Resultado -->
                <div id="resultadoContainer" class="hidden card-background p-8">
                    <h2 class="text-2xl font-bold text-white mb-6">Resultado da Simulação</h2>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div class="bg-zinc-900/50 p-4 rounded-lg">
                            <p class="text-gray-400 text-sm">Capital Inicial</p>
                            <p id="resultCapitalInicial" class="text-xl font-bold text-white">R$ 0,00</p>
                        </div>
                        <div class="bg-zinc-900/50 p-4 rounded-lg">
                            <p class="text-gray-400 text-sm">Total de Aportes</p>
                            <p id="resultTotalAportes" class="text-xl font-bold text-white">R$ 0,00</p>
                        </div>
                        <div class="bg-zinc-900/50 p-4 rounded-lg">
                            <p class="text-gray-400 text-sm">Juros Ganhos</p>
                            <p id="resultJurosGanhos" class="text-xl font-bold text-green-400">R$ 0,00</p>
                        </div>
                        <div class="bg-zinc-900/50 p-4 rounded-lg md:col-span-3">
                            <p class="text-gray-400 text-sm">Montante Final</p>
                            <p id="resultMontanteFinal" class="text-3xl font-bold text-amber-400">R$ 0,00</p>
                        </div>
                    </div>
                    <canvas id="calculadoraChart" height="80"></canvas>
                </div>
            </div>
        `;

        this.mainContainer.innerHTML = html;

        // Adiciona event listener
        document.getElementById('calculadoraForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calcularJurosCompostos();
        });
    }

    /**
     * Calcula juros compostos
     */
    calcularJurosCompostos() {
        const capitalInicial = parseFloat(document.getElementById('capitalInicial').value);
        const taxaJuros = parseFloat(document.getElementById('taxaJuros').value) / 100;
        const periodo = parseFloat(document.getElementById('periodo').value);
        const unidadeTempo = document.getElementById('unidadeTempo').value;
        const aporteRegular = parseFloat(document.getElementById('aporteRegular').value) || 0;
        const frequenciaAporte = document.getElementById('frequenciaAporte').value;
        const capitalizacao = document.getElementById('capitalizacao').value;

        // Converte período para anos
        let periodoAnos = periodo;
        if (unidadeTempo === 'mes') periodoAnos = periodo / 12;
        if (unidadeTempo === 'dia') periodoAnos = periodo / 365;

        // Calcula frequência de capitalização
        const frequenciasCapitalizacao = {
            'anual': 1,
            'semestral': 2,
            'trimestral': 4,
            'mensal': 12,
            'diaria': 365
        };
        const n = frequenciasCapitalizacao[capitalizacao];

        // Calcula frequência de aporte
        const frequenciasAporte = {
            'mensal': 12,
            'trimestral': 4,
            'semestral': 2,
            'anual': 1
        };
        const aportePorAno = frequenciasAporte[frequenciaAporte];

        // Fórmula: M = C(1 + i/n)^(nt) + A * [((1 + i/n)^(nt) - 1) / (i/n)]
        const taxaPeriodo = taxaJuros / n;
        const totalPeriodos = n * periodoAnos;

        // Montante com juros compostos
        let montante = capitalInicial * Math.pow(1 + taxaPeriodo, totalPeriodos);

        // Adiciona aportes regulares
        let totalAportes = 0;
        if (aporteRegular > 0) {
            const aportePeriodo = aporteRegular / aportePorAno;
            const periodosPorAporte = n / aportePorAno;

            for (let i = 1; i <= aportePorAno * periodoAnos; i++) {
                const periodoAporte = i * periodosPorAporte;
                const montanteAporte = aportePeriodo * Math.pow(1 + taxaPeriodo, totalPeriodos - periodoAporte);
                montante += montanteAporte;
                totalAportes += aportePeriodo;
            }
        }

        const jurosGanhos = montante - capitalInicial - totalAportes;

        // Exibe resultado
        this.exibirResultadoCalculadora(capitalInicial, totalAportes, jurosGanhos, montante);
    }

    /**
     * Exibe resultado da calculadora
     */
    exibirResultadoCalculadora(capitalInicial, totalAportes, jurosGanhos, montanteFinal) {
        const formatarMoeda = (valor) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(valor);
        };

        document.getElementById('resultCapitalInicial').textContent = formatarMoeda(capitalInicial);
        document.getElementById('resultTotalAportes').textContent = formatarMoeda(totalAportes);
        document.getElementById('resultJurosGanhos').textContent = formatarMoeda(jurosGanhos);
        document.getElementById('resultMontanteFinal').textContent = formatarMoeda(montanteFinal);

        document.getElementById('resultadoContainer').classList.remove('hidden');

        // Renderiza gráfico
        const canvas = document.getElementById('calculadoraChart');
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        this.currentChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Capital Inicial', 'Aportes', 'Juros Ganhos'],
                datasets: [{
                    data: [capitalInicial, totalAportes, jurosGanhos],
                    backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981'],
                    borderColor: '#18181b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#d4d4d8' }
                    }
                }
            }
        });
    }

    /**
     * Renderiza página inicial sem preços
     */
    renderPaginaInicial() {
        // Esta função será chamada do index.html
        renderizarPaginaInicial();
    }
}
