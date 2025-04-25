
const token = localStorage.getItem("token");
const authLink = document.getElementById("auth-link");
const userBadge = document.getElementById("user-badge");

if (token) {
  // User is logged in
  authLink.textContent = "Logout";
  authLink.href = "#"; // Prevent navigation
  authLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "/index.html";
  });

  // Fetch user information to display badge
  fetch("/api/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }
      return res.json();
    })
    .then((data) => {
      if (data.success) {
        const user = data.user;
        // Display first letter of first name in badge
        const firstLetter = user.first_name.charAt(0).toUpperCase();
        userBadge.textContent = firstLetter;
        userBadge.classList.remove("hidden");
      } else {
        // If token is invalid, clear it and treat as logged out
        localStorage.removeItem("token");
        authLink.textContent = "Login";
        authLink.href = "signup-signin.html";
        userBadge.classList.add("hidden");
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      // If there's an error (e.g., invalid token), clear it and treat as logged out
      localStorage.removeItem("token");
      authLink.textContent = "Login";
      authLink.href = "signup-signin.html";
      userBadge.classList.add("hidden");
    });
} else {
  // User is not logged in
  authLink.textContent = "Login";
  authLink.href = "signup-signin.html";
  userBadge.classList.add("hidden");
}
