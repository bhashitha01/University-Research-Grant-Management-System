<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="front.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResearchDesk.com</title>
</head>

<body>

    <div class="navbar">

        <div class="logo">
            <img src="logo.png" alt="logo">
        </div>

        <div class="link">

            <a href="#">Home</a>

            <a href="#">Project</a>

            <!-- ABOUT BUTTON -->
            <a href="javascript:void(0)" onclick="showAbout()">About</a>

            <!-- CONTACT BUTTON -->
            <a href="javascript:void(0)" onclick="showContact()">Contact Us</a>

            <a href="#">Register</a>

        </div>

        <div class="btn">
            <a href="login.html">
                <button class="SingIn">SingIn</button>
            </a>
        </div>

    </div>

    <!-- MAIN CONTENT -->

    <div class="content">

        <div class="text">

            <h1>
                Welocome To <br>

                <span class="blue">Reserch</span>
                <span class="green">Desk</span>
            </h1>

            <p>
                Manage your Research projects efficiently in <br>
                One place. Strat to Completion....
            </p>

            <br>

        </div>

        <div class="startd">

            <a href="login.html">
                <button class="start">Start Now</button>
            </a>

        </div>

    </div>

    <!-- ROUND -->

    <div class="round">

        <div class="round1">
            <div>
                <p>
                    5000+ <br>
                    Projects
                </p>
            </div>
        </div>

        <div class="round2">
            <p>
                1000+ <br>
                Students
            </p>
        </div>

    </div>

    <!-- IMAGE -->

    <div class="gboy">
        <img src="gboy.png" alt="Graduate Boy">
    </div>

    <!-- ABOUT SECTION -->

    <section id="aboutSection">

    <h2>About Us</h2>

    <p>
        Research Management System is a modern platform designed to help
        students and researchers manage their research projects efficiently.
        The system provides an easy way to organize project details,
        track progress, manage documents, and improve collaboration
        between students and supervisors.
    </p>

    <br>
    <br>
    <br>

    <p>
        Our goal is to simplify the research process by providing
        a user-friendly and reliable environment for academic work.
        Research Management System helps users save time,
        increase productivity, and successfully complete
        research projects from start to finish.
    </p>


    </section>

    <!-- CONTACT SECTION -->

    <section id="contactSection">

        <h2>Contact Us</h2>

        <h4>Email : researchDESK@gmail.com</h4>

        <h4>Phone : +94 77 123 4567</h4>

        <h4>Location : Faculty of Technology, University of Ruhuna</h4>

    </section>

    <!-- SCRIPT -->

<script>

function showAbout(){

    let about = document.getElementById("aboutSection");
    let contact = document.getElementById("contactSection");

    contact.style.display = "none";

    if(about.style.display === "block"){
        about.style.display = "none";
    }

    else{
        about.style.display = "block";

        about.scrollIntoView({
            behavior: "smooth"
        });
    }

}

function showContact(){

    let about = document.getElementById("aboutSection");
    let contact = document.getElementById("contactSection");

    about.style.display = "none";

    if(contact.style.display === "block"){
        contact.style.display = "none";
    }

    else{
        contact.style.display = "block";

        contact.scrollIntoView({
            behavior: "smooth"
        });
    }

}

</script>
</body>
</html>