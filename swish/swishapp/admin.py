from django.contrib import admin
from .models import Profile, Post, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'bio']
    search_fields = ['user__username', 'phone']

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'featured', 'created_at']
    list_filter = ['featured', 'created_at', 'categories']
    search_fields = ['title', 'user__username']
    list_editable = ['featured']
    filter_horizontal = ['categories']