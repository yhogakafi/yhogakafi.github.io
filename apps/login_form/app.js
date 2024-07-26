const button = document.querySelector(".pushable");

// Add an event listener to the document or any specific element
document.addEventListener('mousemove', mouse_position);

// Define the mouse_position function
function mouse_position(event) {
  const mouseX = document.getElementById("XC").textContent = event.clientX;
  const mouseY = document.getElementById("YC").textContent  = event.clientY;
  
  const buttonOffset = getOffset(button);
  const buttonX = buttonOffset.left + (button.offsetWidth /2);
  const buttonY = buttonOffset.top ;

  
  const distance = document.getElementById("DIS").textContent = calculateDistance(mouseX, mouseY, buttonX, buttonY);
  console.log(distance);

  const email = document.getElementById("login-email")
  const password = document.getElementById("login-password")

  if (email.value !== "admin@gmail.com" || password.value !== "admin") {

    email.style.outline = "red"

    if (distance < 100) {
      // Calculate the displacement factor based on the distance
      const displacementFactor = (100 - distance) * 0.1;
      
      // Calculate the perspective factor based on the button's position
      const perspectiveFactor = calculatePerspectiveFactor(buttonX, buttonY);
      
      // Displace the button in the opposite direction with the factors applied
      button.style.transform = `translate(${-(mouseX - buttonX) * displacementFactor * perspectiveFactor}px, ${-(mouseY - buttonY) * displacementFactor * perspectiveFactor}px)`;
      
    } else {
      // Reset the button's transform when the distance is greater than or equal to 100
      button.style.transform = 'none';
      button.style.perspective = 'none';
      button.style.transformStyle = 'flat';
    }
  }
  else {
    // Reset the button's transform when the distance is greater than or equal to 100
    button.style.transform = 'none';
    button.style.perspective = 'none';
    button.style.transformStyle = 'flat';
  }
  
}

button.addEventListener("click", function() {
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  
  const emailValue = emailInput.value;
  const passwordValue = passwordInput.value;
  
  if (emailValue !== "admin@gmail.com" || passwordValue !== "admin") {
    alert("Invalid credentials. Please try again.");
  } else {
    alert("Sign in successful!");
  }
});


function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

function calculateDistance(X, Y, x, y) {
  const dist = Math.sqrt((X - x) ** 2 + (Y - y) ** 2);
  return Math.ceil(dist);
}

function calculatePerspectiveFactor(x, y) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate the distance of the button from the center of the screen
    const distanceFromCenter = Math.sqrt((x - screenWidth / 2) ** 2 + (y - screenHeight / 2) ** 2);
    
    // Calculate the perspective factor based on the distance from the center
    const perspectiveFactor = 1 - distanceFromCenter / (Math.sqrt(screenWidth ** 2 + screenHeight ** 2) / 2);
    
    return perspectiveFactor;
  }


