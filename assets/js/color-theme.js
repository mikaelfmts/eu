// Sistema simplificado de seleção de cores para o tema
document.addEventListener('DOMContentLoaded', function() {
    // Define cores predefinidas para o tema
    const themeColors = {
        blue: {
            primary: '#0066ff',
            secondary: '#0044aa',
            accent: '#ffffff'
        },
        green: {
            primary: '#00cc66',
            secondary: '#009933',
            accent: '#ecffec'
        },
        purple: {
            primary: '#9933cc',
            secondary: '#7700aa',
            accent: '#f5e6ff'
        },
        orange: {
            primary: '#ff6600',
            secondary: '#cc5500',
            accent: '#fff5ec'
        }
    };

    // Verificar se há preferência de cor salva
    const savedColor = localStorage.getItem('themeColor') || 'blue';
    
    // Aplicar a cor salva (ou padrão)
    applyThemeColor(savedColor);
    
    // Expor a função applyThemeColor globalmente para uso em outros scripts
    window.applyThemeColor = applyThemeColor;
    
    // Função para aplicar cor do tema
    function applyThemeColor(colorName) {
        // Verificar se a cor existe nas opções
        if (!themeColors[colorName]) {
            console.warn(`Cor de tema "${colorName}" não disponível, usando azul como padrão`);
            colorName = 'blue';
        }
        
        const colors = themeColors[colorName];
        
        // Define variáveis CSS para cores do tema
        document.documentElement.style.setProperty('--primary-color', colors.primary);
        document.documentElement.style.setProperty('--secondary-color', colors.secondary);
        document.documentElement.style.setProperty('--accent-color', colors.accent);
        document.documentElement.style.setProperty('--gradient-primary', 
            `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`);
            
        // Atualiza a meta tag de tema
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', colors.primary);
        }
        
        // Atualiza classe no body para CSS específico de tema
        document.body.className = document.body.className
            .replace(/\btheme-\S+/g, '')
            .trim();
        document.body.classList.add(`theme-${colorName}`);
        
        // Salvar preferência do usuário
        localStorage.setItem('themeColor', colorName);
    }
});