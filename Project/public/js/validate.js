// Extract JWT token from cookie
const token = getCookie("jwt");

if (token) {
  // Send fetch request with the token
  fetch(`/dashboard?token=${token}`, {
    // Include the token in the URL
    method: "GET",
    headers: {
      // ... add other headers if needed
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Handle the data from the response here
      // For example, you can update the DOM with the data
    })
    .catch((error) => {
      console.error("Error fetching dashboard:", error);
    });
} else {
  console.warn("JWT token not found in cookie");
}

// Function to get a specific cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
}
