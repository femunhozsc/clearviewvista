// Sistema de Roteamento para Clearview Vista
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Escuta mudanças no histórico do navegador
        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.pathname);
        });

        // Intercepta cliques em links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="/"]') || e.target.closest('a[href^="/"]')) {
                e.preventDefault();
                const link = e.target.matches('a') ? e.target : e.target.closest('a');
                this.navigate(link.getAttribute('href'));
            }
        });

        // Carrega a rota inicial
        this.handleRoute(window.location.pathname);
    }

    // Registra uma nova rota
    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    // Navega para uma nova rota
    navigate(path) {
        if (path !== window.location.pathname) {
            window.history.pushState({}, '', path);
        }
        this.handleRoute(path);
    }

    // Processa a rota atual
    handleRoute(path) {
        this.currentRoute = path;
        
        // Remove parâmetros de query da URL para matching
        const cleanPath = path.split('?')[0];
        
        // Verifica rotas exatas primeiro
        if (this.routes[cleanPath]) {
            this.routes[cleanPath](path);
            return;
        }

        // Verifica rotas com parâmetros
        for (const route in this.routes) {
            const routeRegex = this.createRouteRegex(route);
            const match = cleanPath.match(routeRegex);
            if (match) {
                const params = this.extractParams(route, cleanPath);
                this.routes[route](path, params);
                return;
            }
        }

        // Rota não encontrada - redireciona para home
        this.navigate('/');
    }

    // Cria regex para rotas com parâmetros
    createRouteRegex(route) {
        const regexPattern = route
            .replace(/:[^/]+/g, '([^/]+)')
            .replace(/\//g, '\\/');
        return new RegExp(`^${regexPattern}$`);
    }

    // Extrai parâmetros da URL
    extractParams(route, path) {
        const routeParts = route.split('/');
        const pathParts = path.split('/');
        const params = {};

        routeParts.forEach((part, index) => {
            if (part.startsWith(':')) {
                const paramName = part.slice(1);
                params[paramName] = pathParts[index];
            }
        });

        return params;
    }

    // Obtém parâmetros de query da URL
    getQueryParams(path) {
        const queryString = path.split('?')[1];
        if (!queryString) return {};
        
        const params = {};
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
        return params;
    }
}

// Instância global do router
const router = new Router();

// Registra as rotas da aplicação
function setupRoutes() {
    // Página inicial
    router.addRoute('/', () => {
        renderizarPaginaInicial();
    });

    // Página de ativo específico
    router.addRoute('/:ticker', (path, params) => {
        const queryParams = router.getQueryParams(path);
        const periodo = queryParams.periodo || '1y';
        buscarAtivo(params.ticker.toUpperCase(), periodo);
    });

    // Página do comparador
    router.addRoute('/comparador', () => {
        renderizarComparador('acoes');
    });

    // Página de comparação específica
    router.addRoute('/comparador/:comparison', (path, params) => {
        const [ticker1, ticker2] = params.comparison.split('-');
        if (ticker1 && ticker2) {
            renderizarComparador('acoes');
            // Aguarda um pouco para o DOM ser renderizado
            setTimeout(() => {
                document.getElementById('comparadorInput1').value = ticker1.toUpperCase();
                document.getElementById('comparadorInput2').value = ticker2.toUpperCase();
                buscarECompararAtivos();
            }, 100);
        } else {
            router.navigate('/comparador');
        }
    });

    // Página de notícias
    router.addRoute('/noticias', () => {
        renderizarPaginaNoticias();
    });

    // Página do Bitcoin
    router.addRoute('/bitcoin', () => {
        buscarAtivo('BTC-BRL');
    });

    // Página de simulador
    router.addRoute('/simulador', () => {
        renderizarSimulador('acoes');
    });

    // Página de ranking
    router.addRoute('/ranking/:tipo', (path, params) => {
        renderizarPaginaRanking(params.tipo);
    });
}

// Funções auxiliares para navegação
function navigateToAsset(ticker) {
    router.navigate(`/${ticker.toUpperCase()}`);
}

function navigateToComparison(ticker1, ticker2) {
    router.navigate(`/comparador/${ticker1.toLowerCase()}-${ticker2.toLowerCase()}`);
}

function navigateToComparator() {
    router.navigate('/comparador');
}

function navigateToNews() {
    router.navigate('/noticias');
}

function navigateToHome() {
    router.navigate('/');
}

// Atualiza as funções existentes para usar o router
function renderizarPaginaInicial(event) {
    if (event) event.preventDefault();
    
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
        <div id="homepage-content" class="mt-12">
            <div class="flex justify-center items-center p-8"><div class="loader border-4 border-zinc-800 rounded-full w-12 h-12"></div></div>
        </div>
    `;

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

    carregarDadosHomepage();
}

// Função para renderizar página de notícias
function renderizarPaginaNoticias() {
    mainContainer.innerHTML = `
        <div class="fade-in-up">
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Notícias do Mercado</h1>
                <p class="text-lg text-gray-400">Fique por dentro das últimas novidades do mercado financeiro</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="card-background card-hover p-6">
                    <div class="h-48 bg-zinc-800 rounded-lg mb-4 flex items-center justify-center">
                        <span class="text-gray-500">Imagem da notícia</span>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">Mercado em alta nesta semana</h3>
                    <p class="text-gray-400 mb-4">Principais índices registram ganhos significativos com otimismo dos investidores...</p>
                    <span class="text-amber-400 text-sm">Há 2 horas</span>
                </div>
                
                <div class="card-background card-hover p-6">
                    <div class="h-48 bg-zinc-800 rounded-lg mb-4 flex items-center justify-center">
                        <span class="text-gray-500">Imagem da notícia</span>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">Petrobras anuncia novos investimentos</h3>
                    <p class="text-gray-400 mb-4">Empresa divulga plano estratégico para os próximos anos com foco em sustentabilidade...</p>
                    <span class="text-amber-400 text-sm">Há 4 horas</span>
                </div>
                
                <div class="card-background card-hover p-6">
                    <div class="h-48 bg-zinc-800 rounded-lg mb-4 flex items-center justify-center">
                        <span class="text-gray-500">Imagem da notícia</span>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">Bitcoin atinge nova máxima</h3>
                    <p class="text-gray-400 mb-4">Criptomoeda registra valorização expressiva impulsionada por fatores macroeconômicos...</p>
                    <span class="text-amber-400 text-sm">Há 6 horas</span>
                </div>
            </div>
            
            <div class="text-center mt-12">
                <p class="text-gray-500">Funcionalidade de notícias em desenvolvimento</p>
            </div>
        </div>
    `;
}

// Função para renderizar página de ranking
function renderizarPaginaRanking(tipo) {
    const titulos = {
        'altas': 'Maiores Altas do Dia',
        'baixas': 'Maiores Baixas do Dia',
        'dy': 'Maiores Dividend Yields',
        'market_cap': 'Maiores Valores de Mercado'
    };

    const titulo = titulos[tipo] || 'Ranking';

    mainContainer.innerHTML = `
        <div class="fade-in-up">
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">${titulo}</h1>
                <p class="text-lg text-gray-400">Ranking completo dos ativos</p>
            </div>
            
            <div class="card-background p-6">
                <div id="ranking-content" class="flex justify-center items-center p-16">
                    <div class="loader border-4 border-zinc-800 rounded-full w-12 h-12"></div>
                </div>
            </div>
        </div>
    `;

    carregarRankingCompleto(tipo);
}

async function carregarRankingCompleto(tipo) {
    const contentDiv = document.getElementById('ranking-content');
    
    try {
        const response = await fetch(`${apiUrl}/api/ranking/${tipo}`);
        const data = await response.json();
        
        let contentHTML = '<div class="grid grid-cols-1 gap-3">';
        data.forEach((ativo, index) => {
            let valor;
            let corValor = '';
            switch(tipo) {
                case 'altas': valor = `+${ativo.variacao}`; corValor = 'text-green-400'; break;
                case 'baixas': valor = ativo.variacao; corValor = 'text-red-400'; break;
                case 'dy': valor = ativo.dy_formatado; corValor = 'text-blue-400'; break;
                case 'market_cap': valor = ativo.market_cap_formatado; corValor = 'text-purple-400'; break;
            }

            contentHTML += `
                <div onclick="navigateToAsset('${ativo.ticker}')" class="bg-zinc-900/70 p-4 rounded-lg flex items-center cursor-pointer hover:bg-zinc-800 transition-colors">
                    <span class="mr-4 text-gray-500 font-bold w-8">${index + 1}.</span>
                    <div class="mr-4 flex-shrink-0">${getLogoHTML(ativo.ticker, ativo.quoteType, 'w-8 h-8')}</div>
                    <div class="flex-1 flex justify-between items-center">
                        <div>
                            <span class="font-bold text-white text-lg">${ativo.ticker}</span>
                            <span class="text-gray-400 ml-2">${ativo.preco}</span>
                        </div>
                        <span class="font-semibold ${corValor} text-lg">${valor}</span>
                    </div>
                </div>
            `;
        });
        contentHTML += '</div>';
        contentDiv.innerHTML = contentHTML;

    } catch(e) {
        contentDiv.innerHTML = '<p class="text-red-400 text-center">Não foi possível carregar o ranking.</p>';
    }
}

// Inicializa o sistema de rotas quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    setupRoutes();
});

