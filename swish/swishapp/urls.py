from django.urls import path
from django.contrib.auth import views as auth_views   # 👈 ADD THIS LINE
from . import views



urlpatterns = [
    path('', views.home, name='home'),
    path('find_jobs/', views.find_jobs, name='find_jobs'),
    path('create_job/', views.create_job, name='create_job'),
    path('delete_job/<int:job_id>/', views.delete_job, name='delete_job'),
    path('add_post/', views.add_post, name='add_post'),
    path('edit-profile/', views.edit_profile, name='edit_profile'),
    path('profile/', views.my_profile, name='my_profile'),
    path('login/', views.login_page, name='login'),
    path('messages/', views.conversations_list, name='messages_list'),
    path('conversation/delete/<int:conversation_id>/', views.delete_conversation, name='delete_conversation'),
    path('chat/<str:username>/', views.chat_view, name='messages_chat'),
    path('message/delete/<int:message_id>/', views.delete_message, name='delete_message'),
    path('post/<int:post_id>/', views.post_detail, name='post_detail'),
    path('api/post/<int:post_id>/comment/add/', views.api_add_comment, name='api_add_comment'),
    path('api/comment/<int:comment_id>/replies/', views.api_get_replies, name='api_get_replies'),
    path('api/comment/<int:comment_id>/delete/', views.api_delete_comment, name='api_delete_comment'),
    path('settings/', views.settings, name='settings'),
    path('signup/', views.signup, name='signup'),
    path('user/<str:username>/', views.user_profile, name='user_profile'),
    path('profile/<str:username>/review/add/', views.add_review, name='add_review'),
    path('review/<int:review_id>/delete/', views.delete_review, name='delete_review'),
    path('follow/<str:username>/', views.follow_toggle, name='follow_toggle'),
    path('category/<slug:slug>/', views.category_feed, name='category_feed'),
    path('logout/', views.logoutUser, name='logout'),
    path('post/<int:post_id>/like/', views.toggle_like, name='toggle_like'),
    path('post/<int:post_id>/delete/', views.delete_post, name='delete_post'),
    path('notifications/', views.notifications_view, name='notifications'),
    path('notification/read/<int:notification_id>/', views.mark_notification_read, name='mark_notification_read'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    path('search/', views.search, name='search'),

]
