function toggleMenu() {
    let menu = document.getElementById("menu-lateral");

    if (menu.classList.contains("menu-aberto")) {
        menu.classList.remove("menu-aberto");
    } else {
        menu.classList.add("menu-aberto");
    }
}
