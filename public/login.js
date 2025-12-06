// Redirect user to index.html if already logged in
if (localStorage.getItem("loggedIn") === "true") {
    window.location.href = "index.html";
}

// Handle login button click
document.getElementById("loginBtn").addEventListener("click", () => {
    const username = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPass").value.trim();

    // Simple validation: demo mode allows any non-empty credentials
    if (username !== "" && password !== "") {
        localStorage.setItem("loggedIn", "true");   // store login session
        window.location.href = "index.html";        // go to main page
    } else {
        alert("Please enter both username and password.");
    }
});
