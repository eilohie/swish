from django.apps import AppConfig

class SwishappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'swishapp'
    
    def ready(self):
        import swishapp.signals
