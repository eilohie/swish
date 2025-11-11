from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.db.models import Q
from .forms import SignUp, JobForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import Post, Profile,Category,Comment,Conversation, Message,Notification,Job, JobCategory, Follow,Review,SocialLink
from django.core.paginator import Paginator
from django.http import JsonResponse, HttpResponseForbidden, HttpResponseBadRequest
from django.views.decorators.http import require_POST, require_http_methods
from django.utils import timezone
from .decorators import no_cache # my decorator
from django.db.models.signals import post_save
from django.dispatch import receiver





@no_cache
@login_required(login_url='login')
def home(request):
    featured_posts = Post.objects.filter(featured=True).order_by('?')[:6]
    all_posts = Post.objects.order_by('?')[:20]
    categories = Category.objects.all().order_by('?')  # Optional: shuffle categories

    context = {
        'featured_posts': featured_posts,
        'all_posts': all_posts,
        'categories': categories,
    }
    return render(request, 'home.html', context)


@no_cache
def category_feed(request, slug):
    """Show posts filtered by category"""
    category = get_object_or_404(Category, slug=slug)
    posts = Post.objects.filter(categories=category).order_by('-created_at')
    all_categories = Category.objects.all()
    
    context = {
        'category': category,
        'posts': posts,
        'all_categories': all_categories,
    }
    return render(request, 'category_feed.html', context)


@no_cache
@login_required(login_url='login')
def find_jobs(request):
    selected_category = request.GET.get('category', 'all')
    categories = Category.objects.all()

    if selected_category == 'all' or not selected_category:
        jobs = Job.objects.all()
    else:
        jobs = Job.objects.filter(categories__slug=selected_category)

    context = {
        'categories': categories,
        'jobs': jobs,
        'selected_category': selected_category,
    }
    return render(request, 'find_jobs.html', context)


def create_job(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        email = request.POST.get('email')
        category_ids = request.POST.getlist('categories')

        job = Job.objects.create(
            title=title,
            description=description,
            email=email,
            user=request.user  # if jobs are tied to logged-in user
        )

        job.categories.set(category_ids)
        return redirect('find_jobs')

    categories = Category.objects.all()
    return render(request, 'find_jobs.html', {'categories': categories})



@login_required
def delete_job(request, job_id):
    job = get_object_or_404(Job, id=job_id, user=request.user)

    if request.method == "POST":
        job.delete()
        messages.success(request, "Job deleted successfully!")
        return redirect('find_jobs')

    messages.error(request, "Unauthorized action!")
    return redirect('find_jobs')


@no_cache
@login_required(login_url='login')
def add_post(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        image = request.FILES.get('image')
        category_ids = request.POST.get('categories', '')
        
        print(f"DEBUG - Title: {title}")
        print(f"DEBUG - Description: {description}")
        print(f"DEBUG - Image: {image}")
        print(f"DEBUG - Categories: {category_ids}")
        
        if not title or not description or not image or not category_ids:
            categories = Category.objects.all()
            return render(request, 'add_post.html', {
                'categories': categories,
                'error': 'All fields are required!'
            })
        
        # Create the post
        post = Post.objects.create(
            user=request.user,
            title=title,
            description=description,
            image=image
        )
        
        # Add categories
        category_id_list = [int(id.strip()) for id in category_ids.split(',') if id.strip()]
        post.categories.set(category_id_list)
        
        print(f"DEBUG - Post created with ID: {post.id}")
        
        return redirect('my_profile')
    
    # GET request
    categories = Category.objects.all()
    return render(request, 'add_post.html', {'categories': categories})


@no_cache
@login_required(login_url='login')
def edit_profile(request):
    profile = request.user.profile
    error = None

    if request.method == 'POST':
        full_name = request.POST.get('fullName')
        username = request.POST.get('username').strip()
        bio = request.POST.get('bio')
        phone = request.POST.get('phone')
        email = request.POST.get('email')
        profile_pic = request.FILES.get('profilePic')

        # ✅ Username validation
        if User.objects.filter(username=username).exclude(id=request.user.id).exists():
            error = "This username is already taken. Try another 🤧"
        else:
            # ✅ Save name details
            if full_name:
                parts = full_name.split(" ", 1)
                request.user.first_name = parts[0]
                request.user.last_name = parts[1] if len(parts) > 1 else ""

            request.user.username = username
            request.user.email = email
            request.user.save()

            # ✅ Save profile fields
            profile.bio = bio
            profile.phone = phone

            if profile_pic:
                profile.profile_picture = profile_pic
            profile.save()

            # ✅ Handle social links
            # Clear existing ones
            request.user.social_links.all().delete()

            # Save new ones
            platforms = request.POST.getlist("platform_name[]")
            urls = request.POST.getlist("platform_url[]")

            for platform, url in zip(platforms, urls):
                if platform and url:
                    SocialLink.objects.create(
                        user=request.user,
                        platform_name=platform,
                        url=url
                    )

            return redirect('user_profile', request.user.username)

    return render(request, 'edit_profile.html', {
        'error': error,
        'social_links': request.user.social_links.all()
    })



def signup(request):
    if request.user.is_authenticated:
        return redirect('home')

    form = SignUp(request.POST or None)

    if request.method == 'POST':
        if form.is_valid():
            user = form.save()
            # Remove this line - the signal handles it automatically
            # Profile.objects.get_or_create(user=user)
            login(request, user)
            return redirect('home')

    return render(request, 'signup.html', {'form': form})


@no_cache
def login_page(request):
    # Prevent logged-in users from seeing login page again
    if request.user.is_authenticated:
        return redirect('home')
    else:
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect('home')
            else:
                messages.error(request, 'Invalid username or password. Please try again.')

        return render(request, 'login.html')
    

@no_cache
@login_required(login_url='login')
def logoutUser(request):
    logout(request)
    return redirect('login')



@no_cache
@login_required(login_url='login')
def post_detail(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    comments = post.comments.filter(parent__isnull=True).select_related('user').order_by('-created_at')
    suggested_posts = Post.objects.exclude(id=post_id).order_by('?')[:200]
    comments_count = post.comments.count()

    context = {
        'post': post,
        'comments': comments,
        'suggested_posts': suggested_posts,
        'comments_count': comments_count,
        'post_owner_id': post.user.id,
        'current_user_id': request.user.id if request.user.is_authenticated else None,
    }
    return render(request, 'post_detail.html', context)




@no_cache
@login_required
@require_POST
def api_add_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    body = request.POST.get('body', '').strip()
    parent_id = request.POST.get('parent')  # optional

    if not body:
        return JsonResponse({'error': 'Empty comment'}, status=400)

    parent = None
    if parent_id:
        try:
            parent = Comment.objects.get(id=int(parent_id), post=post)
        except Comment.DoesNotExist:
            return JsonResponse({'error': 'Parent not found'}, status=404)

    comment = Comment.objects.create(
        post=post,
        user=request.user,
        body=body,
        parent=parent
    )

    # ✅ Create notification
    if parent:
        # Reply to a comment - notify the comment author
        if request.user != parent.user:
            Notification.objects.create(
                recipient=parent.user,
                sender=request.user,
                notification_type='reply',
                post=post,
                comment=comment
            )
    else:
        # Comment on post - notify the post author
        if request.user != post.user:
            Notification.objects.create(
                recipient=post.user,
                sender=request.user,
                notification_type='comment',
                post=post,
                comment=comment
            )

    # Build returned payload
    data = {
        'id': comment.id,
        'body': comment.body,
        'created_at': comment.created_at.isoformat(),
        'is_reply': comment.parent is not None,
        'parent_id': comment.parent.id if comment.parent else None,
        'user': {
            'id': comment.user.id,
            'username': comment.user.username,
            'profile_url': '',
            'avatar': getattr(comment.user.profile, 'profile_picture', None) and comment.user.profile.profile_picture.url or '/static/images/default-avatar.png'
        }
    }
    return JsonResponse({'comment': data, 'comments_count': post.comments.count()})


@no_cache
@login_required
@require_http_methods(['DELETE', 'POST'])
def api_delete_comment(request, comment_id):
    try:
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if comment.user != request.user:
        return HttpResponseForbidden('Not allowed')

    post = comment.post
    
    # ✅ Delete associated notifications when comment is deleted
    Notification.objects.filter(comment=comment).delete()
    
    comment.delete()
    return JsonResponse({'success': True, 'comments_count': post.comments.count()})


@no_cache
def api_get_replies(request, comment_id):
    try:
        parent = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    replies = parent.replies.select_related('user').order_by('created_at')
    data = []
    for r in replies:
        data.append({
            'id': r.id,
            'body': r.body,
            'created_at': r.created_at.isoformat(),
            'user': {
                'id': r.user.id,
                'username': r.user.username,
                'avatar': getattr(r.user.profile, 'profile_picture', None) and r.user.profile.profile_picture.url or '/static/images/default-avatar.png'
            }
        })

    return JsonResponse({'replies': data})


@no_cache
@login_required
@require_POST
def toggle_like(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    
    if request.user in post.liked_by.all():
        # Unlike
        post.liked_by.remove(request.user)
        liked = False
        
        # ✅ Delete the like notification
        Notification.objects.filter(
            sender=request.user,
            recipient=post.user,
            post=post,
            notification_type='like'
        ).delete()
    else:
        # Like
        post.liked_by.add(request.user)
        liked = True
        
        # ✅ Create like notification (don't notify yourself)
        if request.user != post.user:
            Notification.objects.create(
                recipient=post.user,
                sender=request.user,
                notification_type='like',
                post=post
            )
    
    return JsonResponse({
        'liked': liked,
        'like_count': post.liked_by.count()
    })



@no_cache
@login_required(login_url='login')
def settings(request):
    return render(request, 'settings.html')



    


@no_cache
@login_required(login_url='login')
def my_profile(request):
    if not request.user.is_authenticated:
        return redirect('login')

    user_posts = Post.objects.filter(user=request.user).order_by('-created_at')
    liked_posts = request.user.liked_posts.all()

    context = {
        'profile_user': request.user,
        'user_posts': user_posts,
        'liked_posts': liked_posts,
        'is_own_profile': True,  # Flag to show/hide edit buttons
    }
    return render(request, 'user_profile.html', context)



@no_cache
@login_required(login_url='login')
def user_profile(request, username):
    # Get the user whose profile we're viewing
    profile_user = get_object_or_404(User, username=username)
    
    # Get all posts by this user
    user_posts = Post.objects.filter(user=profile_user).order_by('-created_at')
    
    # Get posts liked by this user (for the Likes tab)
    liked_posts = profile_user.liked_posts.all()
    
    # Count followers/following using the Follow model
    followers_count = profile_user.followers.count()
    following_count = profile_user.following.count()
    
    # Check if the current user is following this profile
    is_following = False
    if request.user.is_authenticated and request.user != profile_user:
        is_following = Follow.objects.filter(
            follower=request.user, 
            following=profile_user
        ).exists()
    
    # ===== REVIEW SYSTEM =====
    # Get all reviews for this profile user
    reviews = Review.objects.filter(reviewed_user=profile_user).select_related('reviewer')
    
    # Check if current user can add a review
    can_review = (
        request.user.is_authenticated and 
        request.user != profile_user and
        not Review.objects.filter(reviewer=request.user, reviewed_user=profile_user).exists()
    )
    
    # Count total reviews
    reviews_count = reviews.count()
    
    context = {
        'profile_user': profile_user,
        'user_posts': user_posts,
        'liked_posts': liked_posts,
        'followers_count': followers_count,
        'following_count': following_count,
        'is_following': is_following,
        'is_own_profile': (request.user == profile_user),
        'reviews': reviews,
        'can_review': can_review,
        'reviews_count': reviews_count,
    }

    return render(request, 'user_profile.html', context)



@login_required
@require_POST
def add_review(request, username):
    """Add a review to another user's profile"""
    reviewed_user = get_object_or_404(User, username=username)
    
    # Prevent self-review
    if request.user == reviewed_user:
        return JsonResponse({'error': 'Cannot review your own account'}, status=400)
    
    # Check if review already exists
    if Review.objects.filter(reviewer=request.user, reviewed_user=reviewed_user).exists():
        return JsonResponse({'error': 'You already reviewed this user'}, status=400)
    
    review_text = request.POST.get('review', '').strip()
    if not review_text:
        return JsonResponse({'error': 'Review cannot be empty'}, status=400)
    
    review = Review.objects.create(
        reviewer=request.user,
        reviewed_user=reviewed_user,
        review_text=review_text
    )
    
    return JsonResponse({
        'success': True,
        'review_id': review.id,
        'message': 'Review added successfully'
    })

@login_required
@require_POST
def delete_review(request, review_id):
    """Delete a review (only if you wrote it)"""
    review = get_object_or_404(Review, id=review_id)
    
    # Only allow deletion if user is the reviewer
    if review.reviewer != request.user:
        return JsonResponse({'error': 'Cannot delete someone else\'s review'}, status=403)
    
    review.delete()
    return JsonResponse({'success': True, 'message': 'Review deleted'})



@login_required(login_url='login')
def follow_toggle(request, username):
    if request.method == 'POST':
        user_to_follow = get_object_or_404(User, username=username)

        # Prevent users from following themselves
        if request.user == user_to_follow:
            return JsonResponse({'error': 'You cannot follow yourself'}, status=400)

        follow_instance = Follow.objects.filter(
            follower=request.user,
            following=user_to_follow
        )

        if follow_instance.exists():
            # ✅ UNFOLLOW
            follow_instance.delete()
            is_following = False

            # ✅ Delete follow notification
            Notification.objects.filter(
                sender=request.user,
                recipient=user_to_follow,
                notification_type='follow'
            ).delete()

        else:
            # ✅ FOLLOW
            Follow.objects.create(follower=request.user, following=user_to_follow)
            is_following = True

            # ✅ Create notification if not their own profile
            if request.user != user_to_follow:
                Notification.objects.create(
                    sender=request.user,
                    recipient=user_to_follow,
                    notification_type='follow'
                )

        followers_count = user_to_follow.followers.count()

        return JsonResponse({
            'is_following': is_following,
            'followers_count': followers_count
        })

    return JsonResponse({'error': 'Invalid request'}, status=400)

    

# ✅ Notify followers when someone posts a new Post
@receiver(post_save, sender=Post)
def notify_followers_new_post(sender, instance, created, **kwargs):
    if created:
        author = instance.user
        followers = Follow.objects.filter(following=author)

        for follower_rel in followers:
            Notification.objects.create(
                recipient=follower_rel.follower,
                sender=author,
                notification_type='new_post',
                post=instance
            )


# ✅ Notify followers when someone posts a new Job
@receiver(post_save, sender=Job)
def notify_followers_new_job(sender, instance, created, **kwargs):
    if created:
        employer = instance.user
        followers = Follow.objects.filter(following=employer)

        for follower_rel in followers:
            Notification.objects.create(
                recipient=follower_rel.follower,
                sender=employer,
                notification_type='new_job'
            )


@no_cache
@login_required(login_url='login')
def delete_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    
    # Check if the user owns this post
    if post.user != request.user:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'error': 'Not authorized'}, status=403)
        return redirect('my_profile')
    
    # Delete the post
    post.delete()
    
    # Return JSON for AJAX requests
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True})
    
    # Redirect for regular requests
    return redirect('my_profile')


@no_cache
def suggested_posts(request):
    page = request.GET.get('page', 1)
    posts = Post.objects.all().order_by('-id')
    paginator = Paginator(posts, 30)  # 30 images per load

    results = []
    try:
        items = paginator.page(page)
        for post in items:
            results.append({
                "image": post.image.url,
                "query": post.query if hasattr(post, 'query') else ""
            })
        return JsonResponse({"posts": results, "has_next": items.has_next()})
    except:
        return JsonResponse({"posts": [], "has_next": False})





@no_cache
@login_required(login_url='login')
def messages_list(request):
    return render(request, 'messages_list.html')



#FOR MESSAGES List
@no_cache
@login_required
def conversations_list(request):
    conversations = Conversation.objects.filter(participants=request.user)

    conversation_data = []
    for conv in conversations:
        other_user = conv.participants.exclude(id=request.user.id).first()
        last_message = conv.messages.order_by('-timestamp').first()
        
        # Count unread messages from the other user
        unread_count = conv.messages.filter(
            is_read=False
        ).exclude(sender=request.user).count()

        conversation_data.append({
            'conversation': conv,
            'other_user': other_user,
            'last_message': last_message,
            'unread_count': unread_count  # 👈 Add this
        })

    return render(request, 'messages_list.html', {
        'conversations': conversation_data
    })



@no_cache
@login_required
def delete_conversation(request, conversation_id):
    if request.method == 'POST':
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Only allow participants to delete the conversation
        if request.user in conversation.participants.all():
            conversation.delete()
            
            # If using AJAX, return JSON response
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'status': 'success'})
            
            # Otherwise redirect back to conversations list
            return redirect('conversations_list')
        else:
            return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=403)
    
    return JsonResponse({'status': 'error'}, status=400)

# @login_required(login_url='login')
# def messages_chat(request):
#     return render(request, 'messages_chat.html')


#FOR MESSAGES CHAT
@no_cache
@login_required
def chat_view(request, username):

    if request.user.username == username:
        return redirect('user_profile', username=username)

    other_user = get_object_or_404(User, username=username)

    # ✅ Find existing conversation
    conversations = Conversation.objects.filter(participants=request.user)\
                                       .filter(participants=other_user)

    if conversations.exists():
        conversation = conversations.order_by('-updated_at').first()
        if conversations.count() > 1:
            conversations.exclude(id=conversation.id).delete()
    else:
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, other_user)

    # ✅ Mark unread messages as read
    conversation.messages.filter(
        sender=other_user, is_read=False
    ).update(is_read=True)

    # ✅ Handle POST
    if request.method == 'POST':
        message_text = request.POST.get('message', '').strip()
        if message_text:
            Message.objects.create(
                conversation=conversation,
                sender=request.user,
                body=message_text
            )
            conversation.save()

        # ✅ Re-render page instead of redirect (keeps CSRF token valid)
        return render(request, 'messages_chats.html', {
            'conversation': conversation,
            'messages': conversation.messages.all(),
            'other_user': other_user
        })

    # ✅ GET response — this was missing before!
    return render(request, 'messages_chats.html', {
        'conversation': conversation,
        'messages': conversation.messages.all(),
        'other_user': other_user
    })



@no_cache
@login_required
def delete_message(request, message_id):
    if request.method == 'POST':
        message = get_object_or_404(Message, id=message_id)
        
        # Only allow the sender to delete their own message
        if message.sender == request.user:
            conversation = message.conversation
            message.delete()
            
            # Update conversation timestamp
            conversation.save()
            
            # If using AJAX, return JSON response
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'status': 'success'})
            
            # Otherwise redirect back to the chat
            other_user = conversation.participants.exclude(id=request.user.id).first()
            return redirect('messages_chat', username=other_user.username)
        else:
            return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=403)
    
    return JsonResponse({'status': 'error'}, status=400)




@no_cache
@login_required
def notifications_view(request):
    """Get notifications for dropdown"""
    notifications = Notification.objects.filter(
        recipient=request.user
    )[:30]  # Limit to 30 most recent
    
    # Mark as read when viewed
    if request.method == 'POST':
        notification_id = request.POST.get('notification_id')
        if notification_id:
            notif = get_object_or_404(Notification, id=notification_id, recipient=request.user)
            notif.is_read = True
            notif.save()
            return redirect(notif.get_link())
    
    return render(request, 'notifications_dropdown.html', {
        'notifications': notifications
    })

@login_required
def mark_notification_read(request, notification_id):
    """Mark a single notification as read"""
    if request.method == 'POST':
        notification = get_object_or_404(Notification, id=notification_id, recipient=request.user)
        notification.is_read = True
        notification.save()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'success'})
        
        return redirect(notification.get_link())
    
    return JsonResponse({'status': 'error'}, status=400)

@login_required
def mark_all_notifications_read(request):
    """Mark all notifications as read"""
    if request.method == 'POST':
        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'success'})
        
        return redirect(request.META.get('HTTP_REFERER', '/'))
    
    return JsonResponse({'status': 'error'}, status=400)





def search(request):
    query = request.GET.get('q', '').strip()

    posts = []
    users = []

    if query:
        keywords = query.split()

        post_query = Q()
        user_query = Q()

        for word in keywords:
            post_query |= Q(title__icontains=word)
            post_query |= Q(description__icontains=word)
            post_query |= Q(categories__name__icontains=word)
            post_query |= Q(user__username__icontains=word)
            post_query |= Q(user__first_name__icontains=word)
            post_query |= Q(user__last_name__icontains=word)

            user_query |= Q(username__icontains=word)
            user_query |= Q(first_name__icontains=word)
            user_query |= Q(last_name__icontains=word)

        posts = Post.objects.filter(post_query).distinct()
        users = User.objects.filter(user_query).distinct()

    return render(request, 'search_results.html', {
        'query': query,
        'posts': posts,
        'users': users,
    })