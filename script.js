function toggleMenu() {
    let menu = document.getElementById("menu-lateral");
    menu.classList.toggle("menu-aberto");
}

// Função para verificar quando os projetos entram na tela
document.addEventListener("DOMContentLoaded", function () {
    const projetos = document.querySelectorAll(".projeto");
    function verificarScroll() {
        projetos.forEach(projeto => {
            const posicao = projeto.getBoundingClientRect().top;
            if (posicao < window.innerHeight * 0.8) {
                projeto.classList.add("visivel");
            }
        });
    }
    window.addEventListener("scroll", verificarScroll);
    verificarScroll(); // Verifica ao carregar
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
