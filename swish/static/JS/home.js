
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
// As you type, a little list drops down with old things you searched before (like "Art", "Photography").
// It only shows ones that match what you're typing.
// If you type nothing or nothing matches  the list hides.
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


// ================= AUTO SCROLL FOR CATEGORIES ==============
// Auto-scroll categories
const categories = document.querySelector(".categories");

let scrollAmount = 1; // speed of scroll (px per step)
let direction = 1;    // 1 = right, -1 = left

function autoScroll() {
  // Scroll horizontally
  categories.scrollLeft += scrollAmount * direction;

  // If reached right end → switch to left
  if (categories.scrollLeft + categories.clientWidth >= categories.scrollWidth) {
    direction = -1;
  }

  // If reached left end → switch to right
  if (categories.scrollLeft <= 0) {
    direction = 1;
  }
}

// run every 20ms for smooth scroll
let autoScrollInterval = setInterval(autoScroll, 20);

// Stop auto-scroll when user interacts
categories.addEventListener("mouseenter", () => clearInterval(autoScrollInterval));
categories.addEventListener("mouseleave", () => {
  autoScrollInterval = setInterval(autoScroll, 20);
});



//=============== DARKMODE FEATURE ==================

// select elements
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// it checks the local strorage for the last theme u were on when u last visited the site
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
//if on dark show cs for dark mode n put the sun icon else remove dark mode cs and put moon icon
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
// if the icon is clicked and the pge was on light mode itll change to dark and sun icon will appear also saving to the local storage memory that we are on dark now and viceversa
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





// // ============= MESSAGES ICON ====================

// // link the messages icon to conversation list
// document.getElementById("messagesIcon").addEventListener("click", () => {
//   window.location.href = "messages_list.html"; 
// });


// =================== HEADER SLIDES ================
//---- getting all the elements -----
const slides = document.querySelectorAll('.slide');
const rectContainer = document.querySelector('.rect-carousel');
const categorySpan = document.querySelector('.featured-category');
const captionTitle = document.querySelector('.featured-title');
const captionSubtitle = document.querySelector('.featured-subtitle');
const leftArrow = document.querySelector('.arrow.left');
const rightArrow = document.querySelector('.arrow.right');

let index = 0;
let timer;

// Create rects based on slide count
// The wizard counts how many pictures there are and builds exactly that many dots automatically.
rectContainer.innerHTML = Array.from(slides)
  .map(() => `<div class='rect'></div>`)
  .join("");

const rects = document.querySelectorAll('.rect');

function updateSlides() {
  //Turns off all “active/prev/next” lights from old pictures and dots
  slides.forEach(slide => slide.classList.remove('active', 'prev', 'next'));
  rects.forEach(rect => rect.classList.remove('active', 'prev', 'next'));

//   Figures out:
// Which one is in the middle now (active)
// Which one was before (prev — peeks from left)
// Which one is coming next (next — peeks from right)
  const prevIndex = (index - 1 + slides.length) % slides.length;
  const nextIndex = (index + 1) % slides.length;

  // Lights them up with special classes so CSS can make them big/faded/move
  slides[index].classList.add('active');
  slides[prevIndex].classList.add('prev');
  slides[nextIndex].classList.add('next');

  rects[index].classList.add('active');
  rects[prevIndex].classList.add('prev');
  rects[nextIndex].classList.add('next');

  const current = slides[index];
//  Reads secret notes hidden in the current picture (data-category, data-title, etc.) and puts them in the screen
  categorySpan.textContent = current.dataset.category;
  captionTitle.textContent = current.dataset.title;
  captionTitle.href = current.dataset.profileUrl;
  captionSubtitle.textContent = "By " + current.dataset.username;
}

// → Tap right arrow → go to next picture, refresh everything, and restart the timer
rightArrow.addEventListener('click', () => {
  index = (index + 1) % slides.length; //this maths is like a cirlce When you’re on the last picture and go right jumps back to the first! Never ends!
  updateSlides();
  resetTimer();
});

// ← Tap left arrow → go to previous picture
leftArrow.addEventListener('click', () => {
  index = (index - 1 + slides.length) % slides.length;
  updateSlides();
  resetTimer();
});

// Every 5 seconds (5000 milliseconds), it quietly goes to the next picture
function autoSlide() {
  index = (index + 1) % slides.length;
  updateSlides();
}

function resetTimer() {
  clearInterval(timer);
  timer = setInterval(autoSlide, 5000);
}

// Init
//When the page loads start the timer and show the first picture nicely.
timer = setInterval(autoSlide, 5000);
updateSlides();





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
