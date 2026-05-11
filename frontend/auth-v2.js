// InclusiCare Auth Logic - V2.0 (Cache Busting)
window.handleRegister = async function(event) {
    event.preventDefault();
    console.log("Register clicked");

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        console.log(data);

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.name || name);
            alert("Registration successful");
            window.location.href = "login.html";
        } else {
            alert(data.error || "Registration failed");
        }
    } catch (err) {
        console.error("Auth error:", err);
        alert("Server connection error. Please try again later.");
    }
};

window.handleLogin = async function(event) {
    event.preventDefault();
    console.log("Login clicked");

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        console.log(data);

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.name || "User");
            window.location.href = "index.html";
        } else {
            alert(data.error || "Login failed");
        }
    } catch (err) {
        console.error("Auth error:", err);
        alert("Server connection error. Please try again later.");
    }
};