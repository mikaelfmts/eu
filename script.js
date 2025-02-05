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

// Função para enviar mensagens para a API do chatbot
async function sendMessage() {
    let inputField = document.getElementById("chat-input");
    let message = inputField.value.trim();
    
    if (message === "") return;

    // Exibir a mensagem do usuário no chat
    let chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML += `<div style="text-align: right; color: blue; margin: 5px 0;">Você: ${message}</div>`;

    try {
        // Fazendo a requisição para a API
        let response = await fetch("http://localhost:3000/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensagem: message })
});

        let data = await response.json();

        // Exibir a resposta do chatbot no chat
        chatMessages.innerHTML += `<div style="text-align: left; color: green; margin: 5px 0;">Bot: ${data.resposta}</div>`;
    } catch (error) {
        chatMessages.innerHTML += `<div style="text-align: left; color: red; margin: 5px 0;">Erro ao se conectar à API!</div>`;
        console.error("Erro:", error);
    }

    // Limpar input
    inputField.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;
