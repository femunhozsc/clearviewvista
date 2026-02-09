/**
 * Sistema de roteamento dinâmico para URLs como /bbas3, /inicio, /calculadora, /comparador
 */

class DynamicRouter {
    constructor() {
        this.routes = {
            '/inicio': () => renderizarPaginaInicial(),
            '/calculadora': () => pagesManager.renderCalculadora(),
            '/comparador': (params) => renderizarComparador('acoes', null),
            '/simulador': (params) => renderizarSimulador('acoes', null)
        };
        
        this.init();
    }

    init() {
        // Escuta mudanças de URL
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Carrega rota inicial
        this.handleRoute();
    }

    /**
     * Processa a rota atual
     */
    handleRoute() {
        const path = window.location.pathname;
        const pathLower = path.toLowerCase();
        
        // Verifica rotas exatas
        if (this.routes[pathLower]) {
            this.routes[pathLower]();
            return;
        }
        
        // Verifica se é um ticker (ex: /bbas3)
        const tickerMatch = path.match(/^\/([A-Z0-9]{4,6})$/i);
        if (tickerMatch) {
            const ticker = tickerMatch[1].toUpperCase();
            pagesManager.renderAtivoDetalhes(ticker);
            return;
        }
        
        // Rota padrão
        renderizarPaginaInicial();
    }

    /**
     * Navega para uma rota
     */
    navigate(path) {
        if (path !== window.location.pathname) {
            window.history.pushState({}, '', path);
        }
        this.handleRoute();
    }
}

// Inicializa o roteador dinâmico quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
    if (typeof dynamicRouter === 'undefined') {
        window.dynamicRouter = new DynamicRouter();
    }
});

/**
 * Função auxiliar para navegar
 */
function navigateTo(path) {
    if (window.dynamicRouter) {
        window.dynamicRouter.navigate(path);
    } else {
        window.location.href = path;
    }
}

/**
 * Função auxiliar para navegar para um ticker
 */
function navigateToTicker(ticker) {
    navigateTo(`/${ticker.toUpperCase()}`);
}
