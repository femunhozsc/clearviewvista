// Sistema de Lazy Loading para Clearview Vista
class LazyLoader {
    constructor() {
        this.loadedSections = new Set();
        this.loadingPromises = new Map();
        this.intersectionObserver = null;
        this.init();
    }

    init() {
        // Configura o Intersection Observer para lazy loading
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const loadType = element.dataset.lazyLoad;
                        if (loadType && !this.loadedSections.has(loadType)) {
                            this.loadSection(loadType, element);
                        }
                    }
                });
            },
            { rootMargin: '100px' }
        );
    }

    // Observa um elemento para lazy loading
    observe(element, loadType) {
        element.dataset.lazyLoad = loadType;
        this.intersectionObserver.observe(element);
    }

    // Para de observar um elemento
    unobserve(element) {
        this.intersectionObserver.unobserve(element);
    }

    // Carrega uma seção específica
    async loadSection(sectionType, element) {
        if (this.loadingPromises.has(sectionType)) {
            return this.loadingPromises.get(sectionType);
        }

        const loadingPromise = this.performLoad(sectionType, element);
        this.loadingPromises.set(sectionType, loadingPromise);

        try {
            await loadingPromise;
            this.loadedSections.add(sectionType);
        } catch (error) {
            console.error(`Erro ao carregar seção ${sectionType}:`, error);
        } finally {
            this.loadingPromises.delete(sectionType);
        }

        return loadingPromise;
    }

    // Executa o carregamento baseado no tipo
    async performLoad(sectionType, element) {
        switch (sectionType) {
            case 'homepage-rankings':
                return this.loadHomepageRankings(element);
            case 'homepage-market':
                return this.loadHomepageMarket(element);
            case 'ranking-more':
                return this.loadMoreRankingItems(element);
            case 'asset-details':
                return this.loadAssetDetails(element);
            default:
                console.warn(`Tipo de carregamento desconhecido: ${sectionType}`);
        }
    }

    // Carrega os rankings da homepage
    async loadHomepageRankings(element) {
        try {
            const response = await fetch(`${apiUrl}/api/homepage/destaques`);
            const data = await response.json();
            
            this.renderHomepageRankings(element, data);
        } catch (error) {
            element.innerHTML = '<p class="text-red-400 text-center">Erro ao carregar rankings</p>';
        }
    }

    // Carrega dados do mercado da homepage
    async loadHomepageMarket(element) {
        try {
            const response = await fetch(`${apiUrl}/api/homepage/destaques`);
            const data = await response.json();
            
            this.renderHomepageMarket(element, data.dados_mercado);
        } catch (error) {
            element.innerHTML = '<p class="text-red-400 text-center">Erro ao carregar dados do mercado</p>';
        }
    }

    // Renderiza os rankings da homepage
    renderHomepageRankings(element, data) {
        const { maiores_altas, maiores_baixas, maiores_dy, maiores_market_cap } = data;
        
        element.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${this.createRankingCard('Maiores Altas', maiores_altas, 'altas', 'text-green-400')}
                ${this.createRankingCard('Maiores Baixas', maiores_baixas, 'baixas', 'text-red-400')}
                ${this.createRankingCard('Maiores DY', maiores_dy, 'dy', 'text-blue-400')}
                ${this.createRankingCard('Maior Valor de Mercado', maiores_market_cap, 'market_cap', 'text-purple-400')}
            </div>
        `;
    }

    // Renderiza dados do mercado
    renderHomepageMarket(element, dadosMercado) {
        if (!dadosMercado || dadosMercado.length === 0) {
            element.innerHTML = '<p class="text-gray-400 text-center">Nenhum dado de mercado disponível</p>';
            return;
        }

        element.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${dadosMercado.map(ativo => `
                    <div onclick="navigateToAsset('${ativo.ticker_busca || ativo.ticker}')" class="card-background card-hover p-6 cursor-pointer">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-3">
                                ${getLogoHTML(ativo.ticker, ativo.quoteType, 'w-8 h-8')}
                                <div>
                                    <h3 class="font-bold text-white">${ativo.ticker}</h3>
                                    <p class="text-sm text-gray-400">${ativo.nome}</p>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">BRL</span>
                                <span class="font-semibold text-white">${ativo.preco_brl}</span>
                            </div>
                            ${ativo.preco_usd ? `
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-400">USD</span>
                                    <span class="font-semibold text-white">${ativo.preco_usd}</span>
                                </div>
                            ` : ''}
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Variação</span>
                                <span class="font-semibold ${ativo.eh_positivo ? 'text-green-400' : 'text-red-400'}">${ativo.variacao}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Cria um card de ranking
    createRankingCard(titulo, dados, tipo, corClasse) {
        return `
            <div class="card-background card-hover p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">${titulo}</h3>
                    <button onclick="router.navigate('/ranking/${tipo}')" class="text-amber-400 hover:text-amber-300 text-sm font-medium">Ver mais</button>
                </div>
                <div class="space-y-3">
                    ${dados.slice(0, 5).map((ativo, index) => `
                        <div onclick="navigateToAsset('${ativo.ticker}')" class="flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 p-2 rounded transition-colors">
                            <div class="flex items-center space-x-3">
                                <span class="text-gray-500 font-bold w-4">${index + 1}.</span>
                                ${getLogoHTML(ativo.ticker, ativo.quoteType, 'w-6 h-6')}
                                <span class="font-medium text-white">${ativo.ticker}</span>
                            </div>
                            <span class="font-semibold ${corClasse}">
                                ${tipo === 'altas' ? '+' + ativo.variacao : 
                                  tipo === 'baixas' ? ativo.variacao :
                                  tipo === 'dy' ? ativo.dy_formatado :
                                  ativo.market_cap_formatado}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Cria skeleton loading
    createSkeleton(type = 'default') {
        switch (type) {
            case 'ranking-card':
                return `
                    <div class="card-background p-6 animate-pulse">
                        <div class="flex justify-between items-center mb-4">
                            <div class="h-6 bg-zinc-700 rounded w-32"></div>
                            <div class="h-4 bg-zinc-700 rounded w-16"></div>
                        </div>
                        <div class="space-y-3">
                            ${Array(5).fill(0).map(() => `
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-4 h-4 bg-zinc-700 rounded"></div>
                                        <div class="w-6 h-6 bg-zinc-700 rounded-full"></div>
                                        <div class="h-4 bg-zinc-700 rounded w-16"></div>
                                    </div>
                                    <div class="h-4 bg-zinc-700 rounded w-12"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            case 'market-card':
                return `
                    <div class="card-background p-6 animate-pulse">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-zinc-700 rounded-full"></div>
                            <div>
                                <div class="h-5 bg-zinc-700 rounded w-16 mb-1"></div>
                                <div class="h-3 bg-zinc-700 rounded w-24"></div>
                            </div>
                        </div>
                        <div class="space-y-2">
                            ${Array(3).fill(0).map(() => `
                                <div class="flex justify-between items-center">
                                    <div class="h-4 bg-zinc-700 rounded w-8"></div>
                                    <div class="h-4 bg-zinc-700 rounded w-16"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            default:
                return `
                    <div class="animate-pulse">
                        <div class="h-4 bg-zinc-700 rounded w-full mb-2"></div>
                        <div class="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
                        <div class="h-4 bg-zinc-700 rounded w-1/2"></div>
                    </div>
                `;
        }
    }

    // Limpa observadores
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        this.loadedSections.clear();
        this.loadingPromises.clear();
    }
}

// Instância global do lazy loader
const lazyLoader = new LazyLoader();

// Função para criar homepage com lazy loading
function renderizarHomepageComLazyLoading() {
    mainContainer.innerHTML = `
        <div class="relative z-10 text-center py-16 md:py-21 fade-in-up">
            <h1 class="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                Análise de Ativos e <span class="text-amber-400"> Indicadores Financeiros</span>
            </h1>
            <p class="text-lg text-gray-400 mb-10 max-w-3xl mx-auto">
                Dados, gráficos e indicadores para tomar as melhores decisões de investimento no mercado financeiro.
            </p>
            <div class="relative max-w-xl mx-auto">
                <input type="text" id="heroSearchInput" placeholder="Buscar por nome ou ticker... (ex: PETR4, BOVA11, bitcoin)" class="w-full bg-zinc-900/50 border border-zinc-700 text-gray-200 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all text-lg" autocomplete="off">
                <button id="heroSearchButton" class="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-400 hover:text-amber-400 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
                <div id="suggestion-box" class="absolute hidden w-full mt-2 card-background shadow-lg"></div>
            </div>
        </div>

        <!-- Seção de Rankings com Lazy Loading -->
        <div class="mt-12">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-white mb-2">Rankings do Mercado</h2>
                <p class="text-gray-400">Principais movimentações do dia</p>
            </div>
            <div id="homepage-rankings" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${Array(4).fill(0).map(() => lazyLoader.createSkeleton('ranking-card')).join('')}
            </div>
        </div>

        <!-- Seção de Mercado com Lazy Loading -->
        <div class="mt-16">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-white mb-2">Mercado em Tempo Real</h2>
                <p class="text-gray-400">Principais ativos e criptomoedas</p>
            </div>
            <div id="homepage-market" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${Array(4).fill(0).map(() => lazyLoader.createSkeleton('market-card')).join('')}
            </div>
        </div>
    `;

    // Configura os event listeners da busca
    const searchInput = document.getElementById('heroSearchInput');
    const searchButton = document.getElementById('heroSearchButton');
    const suggestionBox = document.getElementById('suggestion-box');

    searchInput.addEventListener('input', () => mostrarSugestoes(searchInput, suggestionBox));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const termo = searchInput.value.trim();
            if (termo) {
                navigateToAsset(termo);
            }
        }
    });

    searchButton.addEventListener('click', () => {
        const termo = searchInput.value.trim();
        if (termo) {
            navigateToAsset(termo);
        }
    });

    // Esconde sugestões ao clicar fora
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionBox.contains(e.target)) {
            suggestionBox.classList.add('hidden');
        }
    });

    // Configura lazy loading para as seções
    const rankingsSection = document.getElementById('homepage-rankings');
    const marketSection = document.getElementById('homepage-market');

    lazyLoader.observe(rankingsSection, 'homepage-rankings');
    lazyLoader.observe(marketSection, 'homepage-market');
}

// Atualiza a função original para usar lazy loading
function renderizarPaginaInicial(event) {
    if (event) event.preventDefault();
    renderizarHomepageComLazyLoading();
    carregarListaDeAtivos(); // Carrega lista de ativos para sugestões
}

