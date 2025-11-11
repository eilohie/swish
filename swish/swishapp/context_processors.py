from .models import Conversation, Notification

def unread_messages(request):
    """Add unread message count to all templates"""
    if request.user.is_authenticated:
        unread_count = 0
        conversations = Conversation.objects.filter(participants=request.user)
        
        for conv in conversations:
            unread_count += conv.messages.filter(
                is_read=False
            ).exclude(sender=request.user).count()
        
        return {'unread_messages_count': unread_count}
    return {'unread_messages_count': 0}


def unread_notifications(request):
    """Add notifications and unread count to all templates"""
    if request.user.is_authenticated:
        notifications = Notification.objects.filter(
            recipient=request.user
        ).select_related('sender', 'sender__profile', 'post')[:20]  # Get 20 most recent
        
        unread_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        
        return {
            'unread_notifications_count': unread_count,
            'notifications': notifications
        }
    return {
        'unread_notifications_count': 0,
        'notifications': []
    }