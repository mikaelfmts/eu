function toggleMenu() {
    let menu = document.getElementById("menu-lateral");
    menu.classList.toggle("menu-aberto");
}

// Função para animação na entrada dos elementos
function animateOnScroll() {
    const elements = document.querySelectorAll('.projeto, .skill-card, .certificados');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
                if (entry.target.classList.contains('skill-card')) {
                    const progressBars = entry.target.querySelectorAll('.skill-progress');
                    progressBars.forEach(bar => bar.style.width = bar.parentElement.getAttribute('data-progress'));
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(element => observer.observe(element));
}

// Inicializa as animações quando o DOM estiver carregado
// Loading Screen
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
});

document.addEventListener("DOMContentLoaded", function () {
    animateOnScroll();
    
    // Adiciona efeito de hover suave nos cards
    const cards = document.querySelectorAll('.skill-card, .projeto');
    cards.forEach(card => {
        card.addEventListener('mouseenter', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.transform = `
                perspective(1000px)
                rotateX(${(y - rect.height / 2) / 20}deg)
                rotateY(${-(x - rect.width / 2) / 20}deg)
                translateZ(10px)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateZ(0)';
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

// Efeito de parallax no fundo
document.addEventListener('mousemove', e => {
    const moveX = (e.clientX * -1 / 50);
    const moveY = (e.clientY * -1 / 50);
    document.body.style.backgroundPosition = `${moveX}px ${moveY}px`;
});

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
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.getElementById('theme-icon');
    if (document.body.classList.contains('light-mode')) {
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

// Efeito suave nos cards
function handleCardEffect() {
    const cards = document.querySelectorAll('.projeto, .skill-card');
    let timeout;

    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            clearTimeout(timeout);
            cards.forEach(c => c.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / 10) * -1;
            const rotateY = (x - centerX) / 10;
            
            card.style.transform = `
                translateY(-5px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
            `;
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / 10) * -1;
            const rotateY = (x - centerX) / 10;
            
            card.style.transform = `
                translateY(-5px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
            timeout = setTimeout(() => {
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 300);
        });
    });
}

// Inicializar efeito dos cards quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', handleCardEffect);

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
