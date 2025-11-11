from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import Job


class SignUp(UserCreationForm):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={
        'placeholder': 'Email',
        'class': 'input-field'
    }))
    
    username = forms.CharField(widget=forms.TextInput(attrs={
        'placeholder': 'Username',
        'class': 'input-field'
    }))

    password1 = forms.CharField(widget=forms.PasswordInput(attrs={
        'placeholder': 'Password',
        'class': 'input-field'
    }))

    password2 = forms.CharField(widget=forms.PasswordInput(attrs={
        'placeholder': 'Confirm Password',
        'class': 'input-field'
    }))

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']




class JobForm(forms.ModelForm):
    class Meta:
        model = Job
        fields = ['title', 'description', 'categories']
        widgets = {
            'categories': forms.CheckboxSelectMultiple()
        }
