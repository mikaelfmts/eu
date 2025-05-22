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
