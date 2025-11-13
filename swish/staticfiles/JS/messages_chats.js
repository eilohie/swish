// ================= HAMBURGER MENU =================
function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
    updateOverlay();
}

function closeMenu() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("active");
    updateOverlay();
}

// ================= SEARCH FEATURE =================
let searchHistory = ["Art", "Design", "Photography", "3D Art"]; // Sample data

// --- Toggle Search Bar UI ---
function toggleSearch() {
    const searchContainer = document.querySelector(".search-container");
    const input = document.getElementById("searchInput");

    searchContainer.classList.toggle("active");

    if (searchContainer.classList.contains("active")) {
        input.focus();
    } else {
        clearSearch();
    }
    updateOverlay();
}

// --- Show Dropdown Search History ---
function showHistory() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const list = document.getElementById("searchHistory");
    list.innerHTML = "";

    const filtered = searchHistory.filter(item =>
        item.toLowerCase().includes(input)
    );

    if (filtered.length > 0 && input.length > 0) {
        filtered.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            li.onclick = () => selectHistory(item);
            list.appendChild(li);
        });
        list.classList.remove("hidden");
    } else {
        list.classList.add("hidden");
    }
}

// --- Selecting Item From History ---
function selectHistory(item) {
    document.getElementById("searchInput").value = item;
    document.getElementById("searchHistory").classList.add("hidden");
    performSearch(item);
}

// --- Execute Search on Enter ---
function handleSearch(event) {
    if (event.key === "Enter") {
        const query = document.getElementById("searchInput").value.trim();
        performSearch(query);
    }
}

// --- Perform Search + Update History ---
function performSearch(query) {
    if (!query) return;

    // Add to history if new
    if (!searchHistory.includes(query)) {
        searchHistory.push(query);
    }

    // Redirect to Django search URL
    window.location.href = `/search/?q=${encodeURIComponent(query)}`;
}

// --- Clear Search Bar ---
function clearSearch() {
    document.getElementById("searchInput").value = "";
    document.getElementById("searchHistory").innerHTML = "";
    document.getElementById("searchHistory").classList.add("hidden");
    document.querySelector(".search-container").classList.remove("active");
    updateOverlay();
}


// ================= NOTIFICATIONS =================
function toggleNotifications(el) {
    const dropdown = document.getElementById("notificationsDropdown");
    const isOpen = dropdown.style.display === "block";

    // Close all first
    closeAllDropdowns();

    if (!isOpen) {
        dropdown.style.display = "block";
        el.classList.add("active");
    }
    updateOverlay();
}

function closeAllDropdowns() {
    document.querySelectorAll(".notifications-dropdown").forEach(d => d.style.display = "none");
    document.querySelectorAll(".notification-icon").forEach(icon => icon.classList.remove("active"));
    updateOverlay();
}

// ================= OVERLAY CONTROL =================
function updateOverlay() {
    const overlay = document.getElementById("menu-overlay");
    const sidebarActive = document.getElementById("sidebar").classList.contains("active");
    const searchActive = document.querySelector(".search-container").classList.contains("active");
    const notifActive = [...document.querySelectorAll(".notifications-dropdown")].some(d => d.style.display === "block");

    if (sidebarActive || searchActive || notifActive) {
        overlay.style.display = "block";
    } else {
        overlay.style.display = "none";
    }
}

// ================= GLOBAL CLICK HANDLERS =================
document.addEventListener("click", function (event) {
    const searchContainer = document.querySelector(".search-container");
    const searchIcon = document.querySelector(".search-icon");
    const sidebar = document.getElementById("sidebar");
    const hamburger = document.querySelector(".hamburger");

    // Close search if clicked outside
    if (
        searchContainer.classList.contains("active") &&
        !searchContainer.contains(event.target) &&
        !searchIcon.contains(event.target)
    ) {
        clearSearch();
    }

    // Close sidebar if clicked outside
    if (
        sidebar.classList.contains("active") &&
        !sidebar.contains(event.target) &&
        !hamburger.contains(event.target)
    ) {
        closeMenu();
    }

    // Close notifications if click happens outside
    if (!event.target.closest(".notification-icon") && !event.target.closest(".notifications-dropdown")) {
        closeAllDropdowns();
    }
});

// ================= OVERLAY CLICK =================
document.getElementById("menu-overlay").addEventListener("click", () => {
    clearSearch();
    closeMenu();
    closeAllDropdowns();
});




// // ===================== SEND BUTTON FUNTIONS =======================
// // FOR SAVING MESSAGES AND SENDING WITH THE ENTER BUTTON

// // Select elements
// const chatBox = document.querySelector(".chat-box");
// const chatInput = document.querySelector(".chat-input input");
// const sendButton = document.querySelector(".chat-input button");

// // Function to add a new message
// function sendMessage() {
//   const messageText = chatInput.value.trim();

//   if (messageText === "") return; // Don't send empty messages

//   // Create message container
//   const messageDiv = document.createElement("div");
//   messageDiv.classList.add("message", "sent");

//   // Add text
//   const messageContent = document.createElement("p");
//   messageContent.textContent = messageText;
//   messageDiv.appendChild(messageContent);

//   // Add timestamp
//   const timeSpan = document.createElement("span");
//   timeSpan.classList.add("sent-time");
//   const now = new Date();
//   timeSpan.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   messageDiv.appendChild(timeSpan);

//   // Append message to chat box
//   chatBox.appendChild(messageDiv);

//   // Auto-scroll to bottom
//   chatBox.scrollTop = chatBox.scrollHeight;

//   // Clear input
//   chatInput.value = "";
// }

// // Click send button
// sendButton.addEventListener("click", sendMessage);

// // Press Enter key
// chatInput.addEventListener("keypress", function (e) {
//   if (e.key === "Enter") {
//     e.preventDefault(); // Prevent form submit / new line
//     sendMessage();
//   }
// });



// // ============= MESSAGES ICON ====================

// // link the messages icon to conversation list
// document.getElementById("messagesIcon").addEventListener("click", () => {
//   window.location.href = "messages_list.html"; 
// });



//=============== DARKMODE FEATURE ==================

// select elements
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// check localStorage for theme preference on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeIcon.src = "/static/images/sun.svg"; // sun icon
  } else {
    document.body.classList.remove("dark-mode");
    themeIcon.src = "/static/images/moon-svgrepo-com.svg"; // moon icon
  }
});

// toggle theme on click
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    themeIcon.src = "/static/images/sun.svg"; // sun icon
    localStorage.setItem("theme", "dark");
  } else {
    themeIcon.src = "/static/images/moon-svgrepo-com.svg"; // moon icon
    localStorage.setItem("theme", "light");
  }
});



// Add after your existing JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Get CSRF token
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  const csrftoken = getCookie('csrftoken');

  // Handle delete button clicks
  document.querySelectorAll('.delete-message-form').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!confirm('Delete this message?')) return;
      
      const formData = new FormData(form);
      const messageElement = form.closest('.message');
      
      fetch(form.action, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrftoken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Fade out and remove the message
          messageElement.style.transition = 'opacity 0.3s ease';
          messageElement.style.opacity = '0';
          setTimeout(() => {
            messageElement.remove();
            
            // Check if chat is now empty
            const chatBox = document.querySelector('.chat-box');
            if (chatBox.querySelectorAll('.message').length === 0) {
              chatBox.innerHTML = '<p class="no-messages-text">Start the conversation 🎉</p>';
            }
          }, 300);
        } else {
          alert('Failed to delete message');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error deleting message');
      });
    });
  });
});



//================= NOTIFICATION BADGE STUFF ===============
function markAsRead(event, notificationId) {
    // Mark notification as read via AJAX
    fetch(`/notification/read/${notificationId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}