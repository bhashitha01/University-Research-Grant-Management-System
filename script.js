const toggle = document.getElementById("modeToggle");

toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){
        toggle.classList.remove("fa-moon");
        toggle.classList.add("fa-sun");
    }else{
        toggle.classList.remove("fa-sun");
        toggle.classList.add("fa-moon");
    }
});