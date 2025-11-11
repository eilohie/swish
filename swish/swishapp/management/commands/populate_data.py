from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from swishapp.models import Profile, Post
from django.core.files import File
import os

class Command(BaseCommand):
    help = 'Populates the database with sample users and posts'

    def handle(self, *args, **kwargs):
        # Create users
        users_data = [
            {'username': 'ifeomachukwuka', 'email': 'ifeoma@example.com', 'first_name': 'Ifeoma', 'last_name': 'Chukwuka'},
            {'username': 'alex_designs', 'email': 'alex@example.com', 'first_name': 'Alex', 'last_name': 'Designer'},
            {'username': 'sarah_photos', 'email': 'sarah@example.com', 'first_name': 'Sarah', 'last_name': 'Photos'},
            {'username': 'john_artist', 'email': 'john@example.com', 'first_name': 'John', 'last_name': 'Artist'},
            {'username': 'maya_baker', 'email': 'maya@example.com', 'first_name': 'Maya', 'last_name': 'Baker'},
        ]
        
        created_users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name']
                }
            )
            if created:
                user.set_password('password123')  # Set a default password
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created user: {user.username}'))
            created_users.append(user)
        
        # Update profiles
        profiles_data = [
            {'user': 'ifeomachukwuka', 'bio': 'Creative designer & artist 🎨', 'phone': '+234 800 123 4567'},
            {'user': 'alex_designs', 'bio': 'Digital designer', 'phone': '+234 800 123 4568'},
            {'user': 'sarah_photos', 'bio': 'Photographer', 'phone': '+234 800 123 4569'},
            {'user': 'john_artist', 'bio': '3D Artist', 'phone': '+234 800 123 4570'},
            {'user': 'maya_baker', 'bio': 'Baker & food stylist', 'phone': '+234 800 123 4571'},
        ]
        
        for profile_data in profiles_data:
            user = User.objects.get(username=profile_data['user'])
            Profile.objects.update_or_create(
                user=user,
                defaults={
                    'bio': profile_data['bio'],
                    'phone': profile_data['phone']
                }
            )
        
        # Create posts
        posts_data = [
            {'user': 'ifeomachukwuka', 'image': '/static/images/💜💅🏾✨🧚🏾_♀.jpg', 'title': 'Purple Aesthetic', 'category': 'illustration', 'featured': True},
            {'user': 'ifeomachukwuka', 'image': '/static/images/pixel art.jpeg', 'title': 'Pixel Art Creation', 'category': 'pixel_art', 'featured': False},
            {'user': 'alex_designs', 'image': '/static/images/pink gym aesthetic💗.jpeg', 'title': 'Gym Aesthetic', 'category': 'fitness', 'featured': True},
            {'user': 'sarah_photos', 'image': '/static/images/Newspaper photoshoot.jpeg', 'title': 'Editorial Shoot', 'category': 'photography', 'featured': False},
            {'user': 'john_artist', 'image': '/static/images/wall painting.jpeg', 'title': 'Wall Art', 'category': 'wall_painting', 'featured': True},
            {'user': 'maya_baker', 'image': '/static/images/cinnamon rolls.jpeg', 'title': 'Cinnamon Rolls', 'category': 'baking', 'featured': True},
            {'user': 'ifeomachukwuka', 'image': "/static/images/Mom's Mix_ 80s Music Gift Vibes.jpeg", 'title': '80s Vibes', 'category': 'music', 'featured': False},
            {'user': 'alex_designs', 'image': '/static/images/Maximalism in Graphic Design - Zeka Design.jpeg', 'title': 'Maximalism Design', 'category': 'design', 'featured': True},
        ]
        
        for post_data in posts_data:
            user = User.objects.get(username=post_data['user'])
            Post.objects.get_or_create(
                user=user,
                image=post_data['image'],
                defaults={
                    'title': post_data['title'],
                    'category': post_data['category'],
                    'featured': post_data['featured']
                }
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database!'))