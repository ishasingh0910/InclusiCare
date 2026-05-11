window.handleRegister = async function(event) {
    event.preventDefault();
    console.log("Register clicked");

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    const res = await fetch("http://localhost:5000/api/auth/register", {
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
        alert("Registration successful");

        // ✅ REDIRECT TO LOGIN PAGE
        window.location.href = "login.html";
    } else {
        alert(data.error);
    }
};

window.handleLogin = async function(event) {
    event.preventDefault();
    console.log("Login clicked");

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch("http://localhost:5000/api/auth/login", {
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
        //alert("Login successful");

        // ✅ REDIRECT TO MAIN PAGE
        window.location.href = "index.html";
    } else {
        alert(data.error);
    }
};