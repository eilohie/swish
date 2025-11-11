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



//=========== JOB DESCRIPTION POPUP ===========
const modal = document.getElementById("jobModal");
const closeBtn = document.querySelector("#jobModal .close-btn");


const modalHirerImg = document.getElementById("modalHirerImg");
const modalHirerName = document.getElementById("modalHirerName");
const modalHirerUsername = document.getElementById("modalHirerUsername");
const modalJobTitle = document.getElementById("modalJobTitle");
const modalJobDescription = document.getElementById("modalJobDescription");
const modalJobDate = document.getElementById("modalJobDate");
const applyBtn = document.getElementById("applyBtn");

// Open modal from job cards
document.querySelectorAll(".job-card").forEach(card => {
  card.addEventListener("click", () => {
    modalHirerImg.src = card.querySelector(".hirer-icon img").src;
    modalHirerName.innerText = card.querySelector(".hirer-name").innerText;
    modalHirerUsername.innerText = card.querySelector(".hirer-username").innerText;
    modalJobTitle.innerText = card.querySelector(".job-title h1").innerText;
    modalJobDescription.innerText = card.querySelector(".job-paragraph p").innerText;
    modalJobDate.innerText = card.querySelector(".job-date p").innerText;

    const email = card.dataset.email;
    applyBtn.href = `mailto:${email}?subject=Job Application: ${modalJobTitle.innerText}&body=Hi,%0D%0AI'm interested in this position!`;


    modal.style.display = "flex";
  });
});

// Close modal
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};



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


// // ============= MESSAGES ICON ====================

// // link the messages icon to conversation list
// document.getElementById("messagesIcon").addEventListener("click", () => {
//   window.location.href = "messages_list.html"; 
// });


// ============= CREATE JOB FORM POPUP ====================

// safer unique variable names so they don't clash with "jobModal"
const createJobModal = document.getElementById("createJobModal");
const openCreateJobBtn = document.getElementById("postJobBtn");
const closeCreateJobBtn = createJobModal ? createJobModal.querySelector(".close-btn") : null;
const createJobForm = document.getElementById("createJobForm");
const jobList = document.getElementById("jobList");

// open modal
if (openCreateJobBtn && createJobModal) {
  openCreateJobBtn.addEventListener("click", (e) => {
    e.preventDefault();
    createJobModal.style.display = "flex";
  });
}

// close modal
if (closeCreateJobBtn) {
  closeCreateJobBtn.addEventListener("click", () => {
    createJobModal.style.display = "none";
  });
}

// close if clicked outside modal
window.addEventListener("click", (e) => {
  if (e.target === createJobModal) createJobModal.style.display = "none";
});

// form submit handler (adds job cards dynamically)
// if (createJobForm) {
//   createJobForm.addEventListener("submit", (e) => {
//     e.preventDefault();

//     const name = document.getElementById("hirerName").value;
//     const username = document.getElementById("hirerUsername").value;
//     const image = document.getElementById("hirerImage").value;
//     const title = document.getElementById("jobTitle").value;
//     const desc = document.getElementById("jobDescription").value;
//     const email = document.getElementById("hirerEmail").value;

//     const card = document.createElement("div");
//     card.classList.add("job-card");
//     card.dataset.email = email;
//     card.innerHTML = `
//       <div class="hirer-profile">
//         <div class="hirer-icon"><img src="${image}" alt=""></div>
//         <div class="hirer-details">
//           <h1 class="hirer-name">${name}</h1>
//           <h4 class="hirer-username">${username}</h4>
//         </div>b
//       </div>
//       <div class="job-title"><h1>${title}</h1></div>
//       <div class="job-paragraph"><p>${desc}</p></div>
//       <div class="job-date"><p>Just now</p></div>
//     `;

//     if (jobList) jobList.prepend(card);

//     createJobModal.style.display = "none";
//     createJobForm.reset();
//   });
// }



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