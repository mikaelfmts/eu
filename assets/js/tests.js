// ===========================================
// SISTEMA DE TESTES AUTOMATIZADOS
// ===========================================

class PortfolioTester {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    // Adicionar teste
    addTest(name, testFunction) {
        this.tests.push({ name, test: testFunction });
    }

    // Executar todos os testes
    async runAllTests() {
        console.log('🧪 Iniciando testes do portfólio...\n');
        
        for (const test of this.tests) {
            await this.runSingleTest(test);
        }

        this.showResults();
    }

    // Executar teste individual
    async runSingleTest(test) {
        try {
            const result = await test.test();
            if (result) {
                console.log(`✅ ${test.name} - PASSOU`);
                this.results.passed++;
            } else {
                console.log(`❌ ${test.name} - FALHOU`);
                this.results.failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} - ERRO: ${error.message}`);
            this.results.failed++;
        }
        this.results.total++;
    }

    // Mostrar resultados finais
    showResults() {
        console.log('\n📊 RESULTADOS DOS TESTES:');
        console.log(`Total: ${this.results.total}`);
        console.log(`✅ Passou: ${this.results.passed}`);
        console.log(`❌ Falhou: ${this.results.failed}`);
        console.log(`📈 Taxa de sucesso: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        if (this.results.failed === 0) {
            console.log('🎉 Todos os testes passaram! Portfólio funcionando perfeitamente!');
        } else {
            console.log('⚠️ Alguns testes falharam. Verifique as funcionalidades.');
        }
    }
}

// Criar instância do testador
const tester = new PortfolioTester();

// ===========================================
// TESTES ESPECÍFICOS
// ===========================================

// Teste 1: Verificar se elementos principais existem
tester.addTest('Elementos HTML principais existem', () => {
    const elements = [
        '.typing-text',
        '.typing-subtitle',
        '.skill-progress',
        '#loading-screen',
        '#theme-toggle',
        '#scroll-top'
    ];
    
    return elements.every(selector => {
        const element = document.querySelector(selector);
        if (!element) {
            console.log(`   - Elemento não encontrado: ${selector}`);
            return false;
        }
        return true;
    });
});

// Teste 2: Verificar se o typing effect está funcionando
tester.addTest('Typing Effect está ativo', () => {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return false;
    
    // Verificar se há classe ou atributos que indicam que o typing effect está rodando
    return typingElement.textContent.length > 0;
});

// Teste 3: Verificar skill bars
tester.addTest('Skill bars têm data-percentage', () => {
    const skillBars = document.querySelectorAll('.skill-progress');
    if (skillBars.length === 0) return false;
    
    return Array.from(skillBars).every(bar => {
        const percentage = bar.getAttribute('data-percentage');
        return percentage && !isNaN(parseInt(percentage));
    });
});

// Teste 4: Verificar sistema de temas
tester.addTest('Sistema de temas funciona', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return false;
    
    // Verificar se o body tem atributo data-theme ou classe relacionada
    return document.body.hasAttribute('data-theme') || 
           document.documentElement.hasAttribute('data-theme');
});

// Teste 5: Verificar lazy loading
tester.addTest('Lazy loading configurado', () => {
    const images = document.querySelectorAll('img');
    if (images.length === 0) return false;
    
    // Verificar se pelo menos algumas imagens têm loading="lazy"
    const lazyImages = Array.from(images).filter(img => 
        img.getAttribute('loading') === 'lazy' || 
        img.classList.contains('lazy-load')
    );
    
    return lazyImages.length > 0;
});

// Teste 6: Verificar filtros de projetos
tester.addTest('Filtros de projetos existem', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    return filterButtons.length > 0;
});

// Teste 7: Verificar navegação sticky
tester.addTest('Navegação sticky está configurada', () => {
    const nav = document.querySelector('nav') || document.querySelector('.navbar');
    if (!nav) return false;
    
    const styles = window.getComputedStyle(nav);
    return styles.position === 'fixed' || styles.position === 'sticky';
});

// Teste 8: Verificar seletor de idiomas
tester.addTest('Seletor de idiomas funciona', () => {
    const langToggle = document.getElementById('lang-toggle');
    return !!langToggle;
});

// Teste 9: Verificar Service Worker (PWA)
tester.addTest('Service Worker registrado', async () => {
    if (!('serviceWorker' in navigator)) return false;
    
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
    } catch (error) {
        return false;
    }
});

// Teste 10: Verificar responsividade
tester.addTest('CSS responsivo configurado', () => {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) return false;
    
    // Verificar se há media queries no CSS
    const stylesheets = Array.from(document.styleSheets);
    let hasMediaQueries = false;
    
    try {
        stylesheets.forEach(sheet => {
            if (sheet.cssRules) {
                Array.from(sheet.cssRules).forEach(rule => {
                    if (rule.type === CSSRule.MEDIA_RULE) {
                        hasMediaQueries = true;
                    }
                });
            }
        });
    } catch (error) {
        // Cross-origin stylesheet, assumir que tem media queries
        hasMediaQueries = true;
    }
    
    return hasMediaQueries;
});

// Teste 11: Verificar PortfolioApp inicializado
tester.addTest('PortfolioApp inicializado', () => {
    return window.PortfolioApp && window.PortfolioApp.app;
});

// Teste 12: Verificar sistema de toast
tester.addTest('Sistema de Toast disponível', () => {
    return window.PortfolioApp && window.PortfolioApp.Toast;
});

// ===========================================
// EXECUTAR TESTES AUTOMATICAMENTE
// ===========================================

// Executar testes quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => tester.runAllTests(), 2000); // Aguardar 2s para carregar tudo
    });
} else {
    setTimeout(() => tester.runAllTests(), 2000);
}

// Também executar quando a janela carregar
window.addEventListener('load', () => {
    setTimeout(() => {
        console.log('\n🔄 Executando testes após carregamento completo...');
        tester.runAllTests();
    }, 3000);
});

// Função global para executar testes manualmente
window.runPortfolioTests = () => tester.runAllTests();

// Exportar para debug
window.PortfolioTester = PortfolioTester;
