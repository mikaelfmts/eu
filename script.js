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
