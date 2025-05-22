function toggleMenu() {
    let menu = document.getElementById("menu-lateral");
    menu.classList.toggle("menu-aberto");
    
    // Atualizar ARIA para acessibilidade
    const isOpen = menu.classList.contains("menu-aberto");
    menu.setAttribute("aria-expanded", isOpen ? "true" : "false");
    
    // Se o menu foi aberto, coloca o foco no primeiro item do menu
    if (isOpen) {
        const firstMenuItem = menu.querySelector("a");
        if (firstMenuItem) {
            setTimeout(() => firstMenuItem.focus(), 100);
        }
    }
}

// Configurar botão de fechar menu
document.addEventListener("DOMContentLoaded", function() {
    const closeMenuBtn = document.getElementById("close-menu");
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener("click", function() {
            toggleMenu();
        });
    }
    
    // Adicionar suporte para fechar menu com ESC quando estiver aberto
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            const menu = document.getElementById("menu-lateral");
            if (menu && menu.classList.contains("menu-aberto")) {
                toggleMenu();
            }
        }
    });
});

// Loading Screen
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
});

document.addEventListener("DOMContentLoaded", function () {
    // Criar um estilo global para desativar TODAS as animações nos cards
    const style = document.createElement('style');
    style.textContent = `
        .projeto, .skill-card, 
        .projeto *, .skill-card * {
            transform: none !important;
            transition: none !important;
            animation: none !important;
            perspective: none !important;
            transform-style: flat !important;
            box-shadow: none !important;
            will-change: auto !important;
        }
        .projeto:hover, .skill-card:hover,
        .projeto:hover *, .skill-card:hover * {
            transform: none !important;
            transition: none !important;
            animation: none !important;
            perspective: none !important;
            transform-style: flat !important;
            box-shadow: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Remover TODAS as transformações e transições dos cards
    const cards = document.querySelectorAll('.projeto, .skill-card');
    cards.forEach(card => {
        // Aplicar estilos com !important para garantir que nada seja aplicado
        card.setAttribute('style', 'transform: none !important; transition: none !important; animation: none !important; opacity: 1 !important; perspective: none !important; box-shadow: none !important;');
        
        // Desativar quaisquer efeitos existentes
        const allElements = card.querySelectorAll('*');
        allElements.forEach(el => {
            el.setAttribute('style', el.getAttribute('style') + '; transform: none !important; transition: none !important; animation: none !important;');
        });
    });
});
// Função para alternar a visibilidade do chat
function toggleChat() {
    let chatBody = document.getElementById("chat-body");
    chatBody.style.display = chatBody.style.display === "block" ? "none" : "block";
}

// Função para enviar mensagens
function sendMessage() {
    let inputField = document.getElementById("chat-input");
    let message = inputField.value.trim();
    
    if (message === "") return;

    // Exibir a mensagem do usuário no chat
    let chatMessages = document.getElementById("chat-messages");
    let userMessage = `<div style="text-align: right; color: blue; margin: 5px 0;">Você: ${message}</div>`;
    chatMessages.innerHTML += userMessage;

    // Responder automaticamente (Simulação de IA)
    setTimeout(() => {
        let botMessage = `<div style="text-align: left; color: green; margin: 5px 0;">Bot: Em breve, serei conectado a uma API! Fale com o fundador através do email: mikaelmatos.adm@gmail.com</div>`;
        chatMessages.innerHTML += botMessage;
    }, 1000);

    // Limpar input
    inputField.value = "";
    
    // Manter o scroll sempre no final
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Removido efeito parallax

// Detectar dispositivo móvel para desativar efeitos pesados
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if (isMobile()) {
    document.body.classList.add('mobile');
}

// Tema claro/escuro
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    
    // Salvar preferência do usuário
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    
    // Atualizar ícone visual
    updateThemeIcon(isLightMode);
    
    // Atualizar metadados para acessibilidade
    const themeToggle = document.getElementById('theme-toggle');
    const srText = themeToggle.querySelector('.sr-only');
    
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', isLightMode ? 'Mudar para tema escuro' : 'Mudar para tema claro');
        if (srText) {
            srText.textContent = isLightMode ? 'Mudar para tema escuro' : 'Mudar para tema claro';
        }
    }
    
    // Atualizar metatag theme-color para corresponder ao tema atual
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isLightMode ? '#ffffff' : '#0066ff');
    }
    
    // Emitir evento de tema alterado para outros componentes
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: isLightMode ? 'light' : 'dark' }}));
}

function updateThemeIcon(isLightMode = document.body.classList.contains('light-mode')) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;
    
    if (isLightMode) {
        themeIcon.className = 'fas fa-moon';
    } else {
        themeIcon.className = 'fas fa-sun';
    }
}

// Verificar preferência de tema salva
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}

// Efeito de cards removido

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.log('Falha ao registrar o ServiceWorker:', error);
            });
    });
}
