// Color Selector System for changing theme colors
document.addEventListener('DOMContentLoaded', function () {    // Define cores predefindas para o tema
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
        },
        red: {
            primary: '#ff3333',
            secondary: '#cc0000',
            accent: '#ffebeb'
        },
        teal: {
            primary: '#00b3b3',
            secondary: '#008080',
            accent: '#e6ffff'
        },
        pink: {
            primary: '#ff3399',
            secondary: '#cc0066',
            accent: '#fff0f5'
        }
    };

    // Verificar se há preferência de cor salva
    const savedColor = localStorage.getItem('themeColor') || 'blue';
    
    // Aplicar a cor salva (ou padrão)
    applyThemeColor(savedColor);
    
    // Configurar dropdown do seletor de cores
    const colorSelector = document.getElementById('color-selector');
    const colorOptions = document.querySelector('.color-theme-options');
    
    // Abrir/fechar dropdown
    if (colorSelector) {
        colorSelector.addEventListener('click', function(e) {
            e.stopPropagation();
            colorOptions.style.display = colorOptions.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', function() {
        if (colorOptions) {
            colorOptions.style.display = 'none';
        }
    });
    
    // Evento para opções de cores
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const color = this.dataset.color;
            applyThemeColor(color);
            
            // Salvar preferência
            localStorage.setItem('themeColor', color);
            
            // Fechar dropdown
            colorOptions.style.display = 'none';
        });
    });
    
    // Função para aplicar cores do tema
    function applyThemeColor(colorName) {
        const colors = themeColors[colorName];
        
        if (!colors) return;
        
        // Atualizar variáveis CSS
        document.documentElement.style.setProperty('--primary-color', colors.primary);
        document.documentElement.style.setProperty('--secondary-color', colors.secondary);
        document.documentElement.style.setProperty('--accent-color', colors.accent);
        document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`);
        document.documentElement.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`);
        
        // Atualiza a aparência do seletor de cores
        const colorPreview = document.querySelector('.color-preview');
        if (colorPreview) {
            colorPreview.style.backgroundColor = colors.primary;
        }
        
        // Atualizar cores de outros elementos específicos
        updateElementsWithNewColor(colors);
    }
    
    // Função para atualizar elementos específicos com a nova cor
    function updateElementsWithNewColor(colors) {
        // Atualizar cor de fundo dos botões
        document.querySelectorAll('.github-btn button, .projeto a button').forEach(button => {
            button.style.borderColor = colors.primary;
        });
        
        // Atualizar cor de progresso nas barras de habilidade
        document.querySelectorAll('.skill-progress').forEach(bar => {
            bar.style.backgroundColor = colors.primary;
        });
        
        // Atualizar cor dos ícones
        document.querySelectorAll('.fa-java, .fa-js, .fa-python, .fa-html5, .fa-css3-alt, .fa-node-js, .fa-code').forEach(icon => {
            icon.style.color = colors.primary;
        });
        
        // Atualizar cores nas redes sociais
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.style.backgroundColor = colors.secondary;
            btn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = colors.primary;
            });
            btn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = colors.secondary;
            });
        });
    }
});
