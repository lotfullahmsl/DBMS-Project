
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
document.addEventListener('DOMContentLoaded', () => {
  const authLink = document.getElementById('auth-link');
  const userBadge = document.getElementById('user-badge');
  const token = localStorage.getItem('token');

  if (token) {
      // User is logged in
      authLink.textContent = 'Logout';
      authLink.href = '#';
      authLink.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('token');
          window.location.href = 'index.html';
      });

      // Fetch user data to display in the badge
      fetch('/api/user', {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      })
          .then((res) => {
              if (!res.ok) {
                  throw new Error('Failed to fetch user data');
              }
              return res.json();
          })
          .then((data) => {
              if (data.success) {
                  const user = data.user;
                  userBadge.classList.remove('hidden');

                  // Check if user has a profile picture
                  if (user.profile_picture) {
                      // Clear any existing content in the badge
                      userBadge.innerHTML = '';
                      // Create an image element for the profile picture
                      const img = document.createElement('img');
                      img.src = user.profile_picture;
                      img.alt = 'Profile Picture';
                      img.style.width = '100%';
                      img.style.height = '100%';
                      img.style.borderRadius = '50%';
                      img.style.objectFit = 'cover';
                      userBadge.appendChild(img);
                  } else {
                      // Display the first letter of the first name
                      userBadge.textContent = user.first_name ? user.first_name[0].toUpperCase() : '?';
                  }
              } else {
                  // Invalid token, clear it and redirect
                  localStorage.removeItem('token');
                  window.location.href = 'signup-signin.html';
              }
          })
          .catch((error) => {
              console.error('Error fetching user data:', error);
              localStorage.removeItem('token');
              window.location.href = 'signup-signin.html';
          });
  } else {
      // User is not logged in
      authLink.textContent = 'Login';
      authLink.href = 'signup-signin.html';
      userBadge.classList.add('hidden');
  }
});
