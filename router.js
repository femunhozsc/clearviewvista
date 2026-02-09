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