console.log("SuperNova site loaded successfully.");

const menuButton = document.querySelector(".hamburger");
const siteMenu = document.querySelector("#site-menu");

if (menuButton && siteMenu) {
    menuButton.addEventListener("click", () => {
        const isOpen = siteMenu.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
        siteMenu.setAttribute("aria-hidden", String(!isOpen));
    });

    document.addEventListener("click", (event) => {
        if (!siteMenu.contains(event.target) && !menuButton.contains(event.target)) {
            siteMenu.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
            siteMenu.setAttribute("aria-hidden", "true");
        }
    });
}
