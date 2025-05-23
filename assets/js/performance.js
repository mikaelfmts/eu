// Otimizações de Performance

/**
 * Gerenciador de Lazy Loading e otimizações de performance
 */
class PerformanceOptimizer {
    constructor() {
        this.imagesLoaded = 0;
        this.totalImages = 0;
    }

    init() {
        // Implementar lazy loading para imagens
        this.setupLazyLoading();
        
        // Otimizar recursos críticos
        this.optimizeCriticalPath();
        
        // Reportar métricas de performance
        this.reportPerformanceMetrics();
    }

    // Configurar lazy loading para imagens
    setupLazyLoading() {
        // Verificar suporte nativo do navegador a lazy loading
        const hasNativeLazyLoad = 'loading' in HTMLImageElement.prototype;
        
        // Selecionar todas as imagens que não são críticas para renderização inicial
        const images = Array.from(document.querySelectorAll('img:not(.critical-image)'));
        this.totalImages = images.length;
        
        if (hasNativeLazyLoad) {
            // Usar lazy loading nativo
            images.forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
                
                // Adicionar evento para rastrear carregamento
                img.addEventListener('load', () => this.handleImageLoaded(img));
            });
        } else {
            // Fallback para navegadores sem suporte nativo
            this.implementIntersectionObserverLazyLoad(images);
        }
        
        // Adicionar lazy loading em iframes não críticos também
        const iframes = Array.from(document.querySelectorAll('iframe:not(.critical-iframe)'));
        iframes.forEach(iframe => {
            iframe.setAttribute('loading', 'lazy');
        });
    }

    // Implementar lazy loading usando Intersection Observer
    implementIntersectionObserverLazyLoad(images) {
        if (!('IntersectionObserver' in window)) {
            // Se não houver suporte a Intersection Observer, carrega tudo normalmente
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                
                img.addEventListener('load', () => this.handleImageLoaded(img));
            });
            return;
        }
        
        const config = {
            rootMargin: '50px 0px',
            threshold: 0.01
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    
                    img.addEventListener('load', () => this.handleImageLoaded(img));
                    observer.unobserve(img);
                }
            });
        }, config);
        
        images.forEach(img => {
            observer.observe(img);
        });
    }

    // Manipular o carregamento de imagens individuais
    handleImageLoaded(img) {
        this.imagesLoaded++;
        
        // Adicionar classe para fade-in na imagem
        img.classList.add('loaded');
        
        // Verificar se todas as imagens foram carregadas
        if (this.imagesLoaded === this.totalImages) {
            this.allImagesLoaded();
        }
    }

    // Método chamado quando todas as imagens estão carregadas
    allImagesLoaded() {
        console.log('Todas as imagens foram carregadas!');
        document.body.classList.add('images-loaded');
        
        // Emitir evento personalizado
        document.dispatchEvent(new CustomEvent('allImagesLoaded'));
    }

    // Otimização do caminho crítico
    optimizeCriticalPath() {
        // Adiar carregamento de recursos não críticos
        this.deferNonCriticalResources();
        
        // Pré-carregar recursos importantes para navegação
        this.prefetchImportantResources();
    }

    // Adiar carregamento de recursos não críticos
    deferNonCriticalResources() {
        // Adiar carregamento de scripts não críticos
        document.querySelectorAll('script[data-defer]').forEach(script => {
            script.setAttribute('defer', '');
        });
        
        // Adiar carregamento de estilos não críticos usando o pattern "preload com onload"
        document.querySelectorAll('link[data-defer]').forEach(link => {
            const href = link.getAttribute('href');
            
            // Remover link original para evitar carregamento duplo
            link.parentNode.removeChild(link);
            
            // Adicionar ao final do body após o carregamento inicial da página
            window.addEventListener('load', () => {
                const newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = href;
                document.body.appendChild(newLink);
            });
        });
    }

    // Pré-carregar recursos que serão necessários em breve
    prefetchImportantResources() {
        // Lista de URLs para pré-carregar (recursos que serão usados em breve)
        const prefetchUrls = [
            'pages/projetos.html',
            'assets/js/github-api.js'
            // Adicione mais URLs conforme necessário
        ];
        
        // Verificar se o navegador está ocioso para não afetar a performance
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
                this.performPrefetch(prefetchUrls);
            });
        } else {
            // Fallback para setTimeout com delay
            setTimeout(() => {
                this.performPrefetch(prefetchUrls);
            }, 2000);
        }
    }

    // Realizar o prefetch dos recursos
    performPrefetch(urls) {
        const head = document.getElementsByTagName('head')[0];
        
        urls.forEach(url => {
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = url;
            head.appendChild(prefetchLink);
        });
    }

    // Reportar métricas de performance
    reportPerformanceMetrics() {
        if (!('performance' in window) || !('getEntriesByType' in performance)) {
            console.log('API de Performance não suportada neste navegador.');
            return;
        }
          // Reportar métricas após carregamento completo
        window.addEventListener('load', () => {
            // Dar um tempo para que tudo seja computado
            setTimeout(() => {
                try {
                    const paintMetrics = performance.getEntriesByType('paint') || [];
                    const navigationEntries = performance.getEntriesByType('navigation') || [];
                    const navigationTiming = navigationEntries.length > 0 ? navigationEntries[0] : null;
                    
                    if (paintMetrics.length) {
                        const fpEntry = paintMetrics.find(entry => entry.name === 'first-paint');
                        const fcpEntry = paintMetrics.find(entry => entry.name === 'first-contentful-paint');
                        
                        if (fpEntry) {
                            console.log('First Paint (FP):', Math.round(fpEntry.startTime), 'ms');
                        }
                        
                        if (fcpEntry) {
                            console.log('First Contentful Paint (FCP):', Math.round(fcpEntry.startTime), 'ms');
                        }
                    }
                    
                    if (navigationTiming) {
                        // Verifica se os valores são válidos antes de calcular
                        const dclStart = navigationTiming.domContentLoadedEventStart || 0;
                        const dclEnd = navigationTiming.domContentLoadedEventEnd || 0;
                        const loadStart = navigationTiming.loadEventStart || 0;
                        const loadEnd = navigationTiming.loadEventEnd || 0;
                        
                        const dcl = dclEnd - dclStart;
                        const load = loadEnd - loadStart;
                        
                        // Só exibe se os valores forem válidos
                        if (dcl >= 0) {
                            console.log('DOM Content Loaded:', Math.round(dcl), 'ms');
                        }
                        
                        if (load >= 0) {
                            console.log('Page Load:', Math.round(load), 'ms');
                        }
                    }
                    
                    // Emitir evento customizado com as métricas
                    const metricsEvent = new CustomEvent('performanceMetricsCollected', {
                        detail: {
                            paintMetrics,
                            navigationTiming
                        }
                    });
                    document.dispatchEvent(metricsEvent);
                } catch (e) {
                    console.warn('Erro ao coletar métricas de performance:', e);
                }
            }, 100); // Um pouco mais de tempo para garantir que tudo carregou
        });
        
        // Reportar LCP (Largest Contentful Paint)
        this.reportLCP();
    }    // Reportar Largest Contentful Paint (LCP)
    reportLCP() {
        if (!('PerformanceObserver' in window)) {
            console.warn('PerformanceObserver não suportado neste navegador');
            return;
        }
        
        try {
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                if (entries.length === 0) return;
                
                const lastEntry = entries[entries.length - 1];
                if (!lastEntry) return;
                
                // Verifica se o startTime é válido antes de usar
                if (lastEntry.startTime && lastEntry.startTime > 0) {
                    console.log('Largest Contentful Paint (LCP):', Math.round(lastEntry.startTime), 'ms');
                    
                    // Emitir evento
                    const lcpEvent = new CustomEvent('lcpCollected', {
                        detail: { lcp: lastEntry }
                    });
                    document.dispatchEvent(lcpEvent);
                }
            });
            
            // Use try/catch para o observe também, já que isso pode falhar em alguns navegadores
            try {
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (observeError) {
                console.warn('Erro ao observar LCP:', observeError);
            }
        } catch (e) {
            console.warn('Erro ao configurar observador LCP:', e);
        }
    }
}

// Inicializar otimizador de performance quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const performanceOptimizer = new PerformanceOptimizer();
    performanceOptimizer.init();
    
    // Expor globalmente para uso em outros scripts
    window.performanceOptimizer = performanceOptimizer;
});
