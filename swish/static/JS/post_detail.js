// // ================= HOMEPAGE TO POST DETAIL FEED =================

// // --- Mock image list (you can later fetch from backend/database) ---
// const allImages = [];

// // Get clicked image from query
// const params = new URLSearchParams(window.location.search);
// let currentImg = params.get("img") || allImages[0]; // default first

// // Display main image
// document.getElementById("mainImage").src = currentImg;

// // Filter suggestions (remove current big post)
// const suggestions = allImages.filter(img => img !== currentImg);

// // Add suggested posts dynamically
// const suggestedGrid = document.getElementById("suggestedGrid");
// suggestions.forEach(img => {
//   const thumb = document.createElement("img");
//   thumb.src = img;
//   thumb.alt = "Suggested Post";

//   // Make clickable → reloads post_detail.html with new main post
//   thumb.addEventListener("click", () => {
//     window.location.href = `post_detail.html?img=${encodeURIComponent(img)}`;
//   });

//   suggestedGrid.appendChild(thumb);
// });



let page = 1;
const grid = document.querySelector(".suggested-grid");
let loading = false;

async function loadPosts() {
    if (loading) return;
    loading = true;

    const res = await fetch(`/suggested-posts?page=${page}`);
    const data = await res.json();

    data.posts.forEach(item => {
        const postEl = document.createElement('div');
        postEl.classList.add('suggested-item');
        postEl.innerHTML = `
            <a href="post_detail.html?img=${item.image}">
                <img src="${item.image}" alt="${item.query}">
            </a>
        `;
        grid.appendChild(postEl);
    });

    if (data.has_next) {
        page++;
        loading = false;
    }
}

loadPosts(); // Load first batch

// Infinite scroll trigger
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadPosts();
    }
});





// // ============= MESSAGES ICON ====================

// // link the messages icon to conversation list
// document.getElementById("messagesIcon").addEventListener("click", () => {
//   window.location.href = "messages_list.html"; 
// });

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



// ============= READ MORE / READ LESS FOR ABOUT POST ===============
const desc = document.getElementById("post-description");
const readMoreBtn = document.getElementById("readMoreBtn");

readMoreBtn.addEventListener("click", () => {
  if (desc.classList.contains("expanded")) {
    desc.classList.remove("expanded");
    readMoreBtn.textContent = "More";
  } else {
    desc.classList.add("expanded");
    readMoreBtn.textContent = "Less";
  }
});




// ====================== COMMENT SECTION ========================
document.addEventListener('DOMContentLoaded', () => {
  // -------------------- CSRF Helper --------------------
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  const csrftoken = getCookie('csrftoken');

  // -------------------- DOM References --------------------
  const root = document.getElementById('comment-section-root');
  const commentList = document.querySelector('.comments-wrapper');
  const form = document.getElementById('comment-form');
  const input = document.querySelector('.comment-message');
  const commentsCountEl = document.querySelector('.comments-count');
  const replyIndicator = document.querySelector('.reply-indicator');
  const replyUserSpan = document.querySelector('.reply-user');
  const cancelReplyBtn = document.querySelector('.cancel-reply');

  const postOwnerId = root ? Number(root.dataset.postOwnerId) : null;
  const currentUserId = root && root.dataset.currentUserId ? Number(root.dataset.currentUserId) : null;

  const MAX_LENGTH = 120;
  let replyToCommentEl = null;

  // -------------------- Time Formatting --------------------
  function timeAgo(iso) {
    const d = new Date(iso); //creates a date object easy to understand from ms
    const diff = Math.floor((Date.now() - d.getTime()) / 1000); // date.now is the date now in ms and d.gettime is the date the comment was made in ms and /1000 converts it to seconds maths floor removes decimals
    if (diff < 60) return 'Just now'; // 60 seconds = to 1 minutes so thats the maths for below
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString(); // here it means the comment has passed a week so itll just show the date it was made instead of saying 8 days ago or 100 days ago
  }

  // -------------------- Truncation --------------------
  function applyTruncationToElement(commentEl) {
    const p = commentEl.querySelector('.comment-text');
    if (!p) return;
    const text = p.textContent.trim();
    if (text.length <= MAX_LENGTH) return;
    p.dataset.full = text;
    p.textContent = text.slice(0, MAX_LENGTH) + '...';

    let btn = commentEl.querySelector('.read-more');
    if (!btn) {
      btn = document.createElement('span');
      btn.className = 'read-more';
      btn.textContent = 'Read more';
      btn.style.cursor = 'pointer';
      p.insertAdjacentElement('afterend', btn);
    }
    btn.addEventListener('click', () => {
      const isCollapsed = btn.textContent === 'Read more';
      p.textContent = isCollapsed ? p.dataset.full : p.dataset.full.slice(0, MAX_LENGTH) + '...';
      btn.textContent = isCollapsed ? 'Read less' : 'Read more';
    });
  }

  document.querySelectorAll('.comment').forEach(applyTruncationToElement);

  // -------------------- Comment Count --------------------
  function setCommentCount(n) {
    commentsCountEl.dataset.count = n;
    commentsCountEl.textContent = `${n} comments`;
  }

  // -------------------- Create Comment/Reply --------------------
  function createCommentElementFromData(data, isReply = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'comment fade-in';
    if (isReply) wrapper.classList.add('reply');

    wrapper.dataset.commentId = data.id;
    wrapper.dataset.userId = data.user.id;

    const username = data.user.username;
    const avatar = data.user.avatar || '/static/images/default-avatar.png';
    const timestamp = timeAgo(data.created_at);

    const isPostOwner = postOwnerId && data.user.id === postOwnerId;
    const isCurrentUser = currentUserId && data.user.id === currentUserId;

    const bubble = document.createElement('div');
    bubble.className = 'comment-bubble';
    if (isReply && isPostOwner) bubble.classList.add('bubble-owner');
    else if (isReply) bubble.classList.add('bubble-other');
    else bubble.classList.add('bubble-normal');

    bubble.innerHTML = `
      <a href="/profile/${username}/" class="profile-link">
        <img src="${avatar}" alt="${username}" class="comment-avatar">
      </a>
      <div class="comment-body">
        <div class="comment-topline">
          <a href="/profile/${username}/" class="comment-username">${username}</a>
          <span class="timestamp" data-time="${data.created_at}">${timestamp}</span>
        </div>
        <p class="comment-text"></p>
      </div>
    `;
    wrapper.appendChild(bubble);
    wrapper.querySelector('.comment-text').textContent = data.body;

    // -------------------- Replies Container --------------------
    const repliesContainer = document.createElement('div');
    repliesContainer.className = 'replies-container hidden';
    repliesContainer.dataset.loaded = 'false';
    wrapper.appendChild(repliesContainer);

    // -------------------- Actions & Delete --------------------
    const actions = document.createElement('div');
    actions.className = 'comment-actions';

    if (!isReply) {
      if (data.replies_count > 0) {
        actions.innerHTML += `<button class="reply-toggle" data-comment-id="${data.id}">Show replies (<span class="replies-count">${data.replies_count}</span>)</button>`;
      }
      actions.innerHTML += `<button class="reply-open" data-comment-id="${data.id}">Reply</button>`;
      wrapper.appendChild(actions);
    } else {
      actions.innerHTML += `<button class="reply-open" data-comment-id="${data.id}">Reply</button>`;
      wrapper.appendChild(actions);
    }

    if (isCurrentUser) {
      const del = document.createElement('button');
      del.className = 'delete-comment';
      del.textContent = '✖';
      del.addEventListener('click', () => handleDelete(wrapper, data.id));
      wrapper.querySelector('.comment-topline').appendChild(del);
    }

    applyTruncationToElement(wrapper);
    attachCommentListeners(wrapper);
    return wrapper;
  }

  // -------------------- Fetch Replies with Toggle Text --------------------
  async function fetchAndRenderReplies(commentEl, commentId) {
    const container = commentEl.querySelector('.replies-container');
    if (!container) return;

    const toggleBtn = commentEl.querySelector('.reply-toggle');
    if (!toggleBtn) return;

    const loaded = container.dataset.loaded === 'true';
    if (loaded) {
      // Just toggle visibility
      const isCurrentlyHidden = container.classList.contains('hidden');
      container.classList.toggle('hidden');
      
      // Update button text while preserving the span
      const countEl = toggleBtn.querySelector('.replies-count');
      const count = countEl.textContent;
      
      if (isCurrentlyHidden) {
        // Was hidden, now showing
        toggleBtn.innerHTML = `Hide replies (<span class="replies-count">${count}</span>)`;
      } else {
        // Was showing, now hiding
        toggleBtn.innerHTML = `Show replies (<span class="replies-count">${count}</span>)`;
      }
      return;
    }

    // If not loaded, fetch from server
    container.innerHTML = `<div class="replies-loader">Loading replies…</div>`;
    container.classList.remove('hidden');
    
    try {
      const res = await fetch(`/api/comment/${commentId}/replies/`);
      if (!res.ok) throw new Error('Failed to load replies');
      const data = await res.json();
      container.innerHTML = '';
      data.replies.forEach(r => {
        const el = createCommentElementFromData({
          id: r.id,
          body: r.body,
          created_at: r.created_at,
          user: r.user,
          replies_count: r.replies_count || 0
        }, true);
        container.appendChild(el);
      });
      container.dataset.loaded = 'true';
      
      // Update button text to "Hide" since we just showed them
      const countEl = toggleBtn.querySelector('.replies-count');
      const count = countEl.textContent;
      toggleBtn.innerHTML = `Hide replies (<span class="replies-count">${count}</span>)`;
    } catch (err) {
      container.innerHTML = `<div class="replies-error">Could not load replies</div>`;
      console.error(err);
    }
  }

  // -------------------- Submit Comment --------------------
  async function submitCommentAJAX(bodyText) {
    if (!bodyText.trim()) return;
    try {
      const postId = window.location.pathname.split('/').filter(Boolean).pop();
      const formData = new FormData();
      formData.append('body', bodyText);

      const res = await fetch(`/api/post/${postId}/comment/add/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrftoken },
        body: formData,
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error posting comment');

      const c = data.comment;
      const newEl = createCommentElementFromData({
        id: c.id,
        body: c.body,
        created_at: c.created_at,
        user: c.user,
        replies_count: 0
      }, false);

      commentList.prepend(newEl);
      setCommentCount(data.comments_count);
      input.value = '';
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not post comment');
    }
  }

  // -------------------- Submit Reply with Toggle Creation --------------------
  async function submitReplyAJAX(parentCommentEl, bodyText) {
    if (!bodyText.trim()) return;
    try {
      const postId = window.location.pathname.split('/').filter(Boolean).pop();
      const parentId = parentCommentEl.dataset.commentId;
      const formData = new FormData();
      formData.append('body', bodyText);
      formData.append('parent', parentId);

      const res = await fetch(`/api/post/${postId}/comment/add/`, {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
        body: formData,
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error posting reply');

      const r = data.comment;
      const replyEl = createCommentElementFromData({
        id: r.id, body: r.body, created_at: r.created_at, user: r.user, replies_count: 0
      }, true);

      const container = parentCommentEl.querySelector('.replies-container');
      
      // Check if this is the first reply
      const isFirstReply = !parentCommentEl.querySelector('.reply-toggle');
      
      container.appendChild(replyEl);
      container.dataset.loaded = 'true';
      container.classList.remove('hidden');

      // Update or create "show/hide replies" button
      let toggleBtn = parentCommentEl.querySelector('.reply-toggle');
      if (toggleBtn) {
        // Button already exists, just update count
        const countEl = toggleBtn.querySelector('.replies-count');
        const newCount = parseInt(countEl.textContent || '0') + 1;
        toggleBtn.innerHTML = `Hide replies (<span class="replies-count">${newCount}</span>)`;
      } else {
        // Create the toggle button for the first time
        const actionsDiv = parentCommentEl.querySelector('.comment-actions');
        const btn = document.createElement('button');
        btn.className = 'reply-toggle';
        btn.dataset.commentId = parentCommentEl.dataset.commentId;
        btn.innerHTML = `Hide replies (<span class="replies-count">1</span>)`;
        
        // Insert before the Reply button
        const replyBtn = actionsDiv.querySelector('.reply-open');
        actionsDiv.insertBefore(btn, replyBtn);
        
        // Attach event listener using the same function used elsewhere
        btn.addEventListener('click', function() {
          const commentId = this.dataset.commentId;
          fetchAndRenderReplies(parentCommentEl, commentId);
        });
      }

      setCommentCount(data.comments_count);
      input.value = '';
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not post reply');
    }
  }

  // -------------------- Delete --------------------
  async function handleDelete(commentEl, commentId) {
    try {
      const res = await fetch(`/api/comment/${commentId}/delete/`, {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      const wasReply = commentEl.classList.contains('reply');
      const parentCommentEl = wasReply ? commentEl.closest('.comment:not(.reply)') : null;

      // Remove the comment element
      commentEl.classList.add('fade-out');
      setTimeout(() => commentEl.remove(), 280);

      // Update comment count if top-level comment
      if (!wasReply) setCommentCount(data.comments_count);

      // Update parent replies count if it was a reply
      if (wasReply && parentCommentEl) {
        const toggleBtn = parentCommentEl.querySelector('.reply-toggle');
        if (toggleBtn) {
          const replyCountEl = toggleBtn.querySelector('.replies-count');
          let count = parseInt(replyCountEl.textContent || '0') - 1;
          if (count <= 0) {
            // Remove the "show replies" button if no more replies
            toggleBtn.remove();
          } else {
            // Update the count and text
            const container = parentCommentEl.querySelector('.replies-container');
            const isHidden = container.classList.contains('hidden');
            toggleBtn.innerHTML = `${isHidden ? 'Show' : 'Hide'} replies (<span class="replies-count">${count}</span>)`;
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not delete comment');
    }
  }

  // -------------------- Reply Mode --------------------
  function setReplyMode(commentEl) {
    replyToCommentEl = commentEl;
    const username = commentEl.querySelector('.comment-username').textContent;
    replyIndicator.style.display = 'block';
    replyUserSpan.textContent = username;
    input.placeholder = `Replying to ${username}...`;
    input.focus();
  }
  
  function cancelReplyMode() {
    replyToCommentEl = null;
    replyIndicator.style.display = 'none';
    replyUserSpan.textContent = '';
    input.placeholder = 'Add a comment...';
  }
  
  cancelReplyBtn.addEventListener('click', cancelReplyMode);

  // -------------------- Attach Listeners --------------------
  function attachCommentListeners(commentEl) {
    const toggle = commentEl.querySelector('.reply-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const commentId = toggle.dataset.commentId;
        fetchAndRenderReplies(commentEl, commentId);
      });
    }

    const replyOpen = commentEl.querySelector('.reply-open');
    if (replyOpen) {
      replyOpen.addEventListener('click', () => setReplyMode(commentEl));
    }

    const deleteBtn = commentEl.querySelector('.delete-comment');
    if (deleteBtn) {
      const commentId = commentEl.dataset.commentId;
      deleteBtn.addEventListener('click', () => handleDelete(commentEl, commentId));
    }
  }

  document.querySelectorAll('.comment').forEach(attachCommentListeners);

  // -------------------- Form Submission --------------------
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      if (replyToCommentEl) {
        submitReplyAJAX(replyToCommentEl, val);
        cancelReplyMode();
      } else {
        submitCommentAJAX(val);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
  }
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