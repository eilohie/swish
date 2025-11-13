from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.text import slugify
from django.utils import timezone

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        default='profile_pics/default.jpg'   
    )
    phone = models.CharField(max_length=20, blank=True)

    
    def __str__(self):
        return f'{self.user.username} Profile'
    
    # Helper methods for followers/following count
    def followers_count(self):
        return self.user.followers.count()
    
    def following_count(self):
        return self.user.following.count()



class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('follower', 'following')
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"



        

class Category(models.Model):
    """Separate Category model for better flexibility"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    image = models.ImageField(upload_to='posts/')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    categories = models.ManyToManyField(Category, related_name='posts')  # Multiple categories
    featured = models.BooleanField(default=False)
    liked_by = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.title} by {self.user.username}'
        
    def total_likes(self):
        return self.liked_by.count()

    



class Comment(models.Model):
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.body[:20]}"



class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name="conversations")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Conversation {self.id}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ('timestamp',)

    def __str__(self):
        return f"{self.sender.username}: {self.body[:20]}"    



class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('reply', 'Reply'),
        ('follow', 'Follow'),
        ('message', 'Message'),
        ('new_post', 'New Post'),     
        ('new_job', 'New Job'), 
    )
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.sender.username} - {self.notification_type} - {self.recipient.username}"
    
    def get_message(self):
        """Generate notification message"""
        if self.notification_type == 'like':
            return f"{self.sender.get_full_name() or self.sender.username} liked your post"
        elif self.notification_type == 'comment':
            return f"{self.sender.get_full_name() or self.sender.username} commented on your post"
        elif self.notification_type == 'reply':
            return f"{self.sender.get_full_name() or self.sender.username} replied to your comment"
        elif self.notification_type == 'follow':
            return f"{self.sender.get_full_name() or self.sender.username} started following you"
        elif self.notification_type == 'message':
            return f"{self.sender.get_full_name() or self.sender.username} sent you a message"
        elif self.notification_type == 'new_post':
            return f"{self.sender.get_full_name() or self.sender.username} made a new post"
        elif self.notification_type == 'new_job':
            return f"{self.sender.get_full_name() or self.sender.username} posted a new job opportunity"
        return "New notification"
    
    def get_link(self):
        """Get the URL for this notification"""
        if self.notification_type == 'like' and self.post:
            return f"/post/{self.post.id}/"
        elif self.notification_type == 'comment' and self.post:
            return f"/post/{self.post.id}/"
        elif self.notification_type == 'reply' and self.post:
            return f"/post/{self.post.id}/"
        elif self.notification_type == 'follow':
            return f"/user/{self.sender.username}/"
        elif self.notification_type == 'message':
            return f"/messages/chat/{self.sender.username}/"
        elif self.notification_type == 'new_post' and self.post:
            return f"/post/{self.post.id}/"
        elif self.notification_type == 'new_job':
            return "/find_jobs/"
        return "#"

        


class JobCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Job(models.Model):
    title = models.CharField(max_length=225)
    description = models.TextField()
    email = models.EmailField()  # ✅ Add this
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    categories = models.ManyToManyField(Category, blank=True)

    def __str__(self):
        return self.title



class Review(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_written')
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    review_text = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ['reviewer', 'reviewed_user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.reviewer.username} reviewed {self.reviewed_user.username}"
    
    def time_since(self):
        """Returns human-readable time like '4 days ago'"""
        from django.utils.timesince import timesince
        return f"{timesince(self.created_at)} ago"
    


class SocialLink(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="social_links")
    platform_name = models.CharField(max_length=50)
    url = models.URLField()

    def __str__(self):
        return f"{self.platform_name} - {self.user.username}"
