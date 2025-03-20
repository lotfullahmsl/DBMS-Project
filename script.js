// script.js
let isLogin = true;

function toggleForm() {
    isLogin = !isLogin;
    document.getElementById('form-title').innerText = isLogin ? 'Login' : 'Sign Up';
    document.getElementById('toggle-text').innerHTML = isLogin ? "Don't have an account? <span onclick='toggleForm()'>Sign up</span>" : "Already have an account? <span onclick='toggleForm()'>Login</span>";
    document.getElementById('extra-fields').style.display = isLogin ? 'none' : 'block';
}

function togglePassword() {
    let passwordField = document.getElementById('password');
    passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
}

function validateForm() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let emailError = document.getElementById('email-error');
    
    if (!email.endsWith("@gmail.com")) {
        emailError.innerText = "Invalid email. Use @gmail.com";
        return false;
    } else {
        emailError.innerText = "";
    }
    
    if (password.trim() === "") {
        alert("Password cannot be empty");
        return false;
    }
    
    if (!isLogin) {
        let age = document.getElementById('age').value;
        let gender = document.getElementById('gender').value;
        let dob = document.getElementById('dob').value;

        if (age.trim() === "" || isNaN(age) || age < 1) {
            alert("Please enter a valid age");
            return false;
        }

        if (gender === "") {
            alert("Please select your gender");
            return false;
        }

        if (dob === "") {
            alert("Please enter your date of birth");
            return false;
        }
    }
    
    return true;
}