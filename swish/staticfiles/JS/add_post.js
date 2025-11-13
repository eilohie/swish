// ================= TAGS FEATURE ==================
// ================= CATEGORY TAG SELECTION (SIMPLIFIED) ==================
const tagContainer = document.getElementById('tag-container');
const selectedCategoriesInput = document.getElementById('selected-categories');
let selectedCategories = [];

// Handle category tag clicks
if (tagContainer) {
    tagContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-tag')) {
            const categoryId = e.target.dataset.id;
            const categoryName = e.target.dataset.name;
            
            // Toggle selected state
            e.target.classList.toggle('selected');
            
            // Check if already in array
            const index = selectedCategories.findIndex(cat => cat.id === categoryId);
            
            if (index === -1) {
                // Add category
                selectedCategories.push({ id: categoryId, name: categoryName });
            } else {
                // Remove category
                selectedCategories.splice(index, 1);
            }
            
            // Update hidden input
            updateCategoriesInput();
        }
    });
}

// Update hidden input with comma-separated category IDs
function updateCategoriesInput() {
    if (selectedCategoriesInput) {
        selectedCategoriesInput.value = selectedCategories.map(cat => cat.id).join(',');
        console.log('Selected categories:', selectedCategories.map(cat => cat.name).join(', '));
    }
}



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

// ================= FILE UPLOAD LABEL ==================
const fileInput = document.getElementById("post-image");
const fileLabel = document.getElementById("file-label");

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    fileLabel.textContent = fileInput.files[0].name; // Show chosen file name
  } else {
    fileLabel.textContent = "Choose a picture"; // Reset if no file selected
  }
});




// ================= FORM SUBMISSION ==================
document.querySelector(".add-post-form").addEventListener("submit", (e) => {
  // Check if at least one category is selected
  if (selectedCategories.length === 0) {
    e.preventDefault();
    alert("Please add at least one category!");
    return false;
  }
  
  // Let the form submit normally to Django
  return true;
});

// // ================= FORM SUBMISSION ==================
// document.querySelector(".add-post-form").addEventListener("submit", (e) => {
//   e.preventDefault();

//   const title = document.getElementById("post-title").value;
//   const description = document.getElementById("post-description").value;
//   const file = fileInput.files[0] ? fileInput.files[0].name : "No image";

//   alert(
//     `✅ Post Created!\n\nTitle: ${title}\nDescription: ${description}\nImage: ${file}\nTags: ${tags.join(", ")}`
//   );
// });





// // ============= MESSAGES ICON ====================

// // link the messages icon to conversation list
// document.getElementById("messagesIcon").addEventListener("click", () => {
//   window.location.href = "messages_list.html"; 
// });


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