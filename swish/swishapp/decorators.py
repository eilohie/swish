from django.views.decorators.cache import never_cache
from functools import wraps

def no_cache(view_func):
    """
    Decorator to prevent page caching and force reload on back button
    """
    @wraps(view_func)
    @never_cache
    def wrapper(request, *args, **kwargs):
        response = view_func(request, *args, **kwargs)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, private'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response
    return wrapper