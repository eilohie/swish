// ========== service, review n likes flip javascript
  const tabs = document.querySelectorAll(".tabs span");
  const grids = document.querySelectorAll(".post-grid");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remove active state from all tabs
      tabs.forEach(t => t.classList.remove("active"));

      // Remove active state from all product grids
      grids.forEach(grid => grid.classList.remove("active-grid"));

      // Add active to clicked tab
      tab.classList.add("active");

      // Show the corresponding grid
      const targetId = tab.dataset.target;
      const targetGrid = document.getElementById(targetId);
      if (targetGrid) {
        targetGrid.classList.add("active-grid");
      }
    });
  });




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




//======= CONTACT INFO ==============

function toggleContactDropdown(el) {
    let dropdown = el.querySelector('.contact-dropdown');
    let isOpen = dropdown.style.display === "block";
    
    // Close all other dropdowns
    document.querySelectorAll('.contact-dropdown').forEach(d => d.style.display = "none");
    
    // Toggle this one
    dropdown.style.display = isOpen ? "none" : "block";
}

// Close dropdown if clicked outside
document.addEventListener("click", function(e) {
    if (!e.target.closest('.three-dots')) {
        document.querySelectorAll('.contact-dropdown').forEach(d => d.style.display = "none");
    }
});



//============= LIKED HEART FEATURE ==============
document.querySelectorAll('.heart-icon').forEach(heart => {
  heart.addEventListener('click', async () => {
    const postId = heart.dataset.postId;
    
    // Get the post card (for removing from liked page)
    const postCard = heart.closest('.post-card, .main-post, .post-item'); // adjust to your actual post container class
    
    try {
      const response = await fetch(`/post/${postId}/like/`, {  // ✅ Fixed: parentheses not backticks
        method: 'POST',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.liked) {
        // Liked → red heart
        heart.classList.add("liked");
        heart.setAttribute("src", "/static/images/red-heart.svg");
      } else {
        // Unliked → gray heart
        heart.classList.remove("liked");
        heart.setAttribute("src", "/static/images/heart-svgrepo-com.svg");
        
        // 🔥 KEY FIX: If on liked page, remove the post
        if (window.location.pathname.includes('/liked') || window.location.pathname.includes('/profile')) {
          if (postCard) {
            postCard.style.transition = 'opacity 0.3s';
            postCard.style.opacity = '0';
            setTimeout(() => postCard.remove(), 300);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  });
});

// Helper function to get CSRF token
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



// ============== SHARE FEATURE (Profiles & Posts) ==============
function shareContent(el) {
  let url = "";
  let title = "";
  let text = "";

  if (el.dataset.type === "profile") {
    const username = el.dataset.username;
    url = `${window.location.origin}/profile.html?user=${username}`;
    title = `${username}'s Profile`;
    text = `Check out ${username}'s profile on our site!`;
  } 
  else if (el.dataset.type === "post") {
    const postId = el.dataset.postid;
    url = `${window.location.origin}/post.html?id=${postId}`;
    title = `Check out this post!`;
    text = `I found this post interesting, take a look:`;
  }

  if (navigator.share) {
    navigator.share({
      title: title,
      text: text,
      url: url,
    }).catch(err => console.log("Share cancelled:", err));
  } else {
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    });
  }
}

// Attach share event to all share icons
document.querySelectorAll('.share-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    shareContent(icon);
  });
});



// ============= MESSAGES ICON ====================

// link the messages icon to conversation list
// document.getElementById("messagesIcon").addEventListener("click", () => {
//     window.location.href = "{% url 'messages_list' %}";
//   })



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


// ================== FOLLOW SYSTEM ====================
document.getElementById('follow-btn')?.addEventListener('click', async function(e) {
  e.preventDefault(); // Prevent the link from navigating
  
  const username = this.dataset.username;
  const btn = this;
  
  try {
    const response = await fetch(`/follow/${username}/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCookie('csrftoken'), // ✅ Use getCookie instead
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Update button text
      btn.textContent = data.is_following ? 'Unfollow' : 'Follow';
      
      // Update follower count
      document.getElementById('followers-count').textContent = 
        `${data.followers_count} follower${data.followers_count !== 1 ? 's' : ''}`;
    } else {
      console.error('Error:', data.error);
      alert('Something went wrong. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong. Please try again.');
  }
});