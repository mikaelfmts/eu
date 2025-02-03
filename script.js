function toggleMenu() {
    let menu = document.getElementById("menu-lateral");

    if (menu.classList.contains("menu-aberto")) {
        menu.classList.remove("menu-aberto");
    } else {
        menu.classList.add("menu-aberto");
    }
}

// Função para verificar quando os projetos entram na tela
document.addEventListener("DOMContentLoaded", function () {
    const projetos = document.querySelector("#projetos");
    function verificarVisibilidade() {
        const posicao = projetos.getBoundingClientRect().top;
        if (posicao < window.innerHeight - 100) {
            projetos.classList.add("projetos-visiveis");
        }
    }
    window.addEventListener("scroll", verificarVisibilidade);
    verificarVisibilidade();
});
