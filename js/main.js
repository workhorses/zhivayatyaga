document.addEventListener("DOMContentLoaded", function () {

    // ===== BURGER =====
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");

    if (burger && nav) {
        burger.addEventListener("click", () => {
            nav.classList.toggle("active");
        });
    }

});
