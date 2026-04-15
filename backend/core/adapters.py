import os
import logging
from django.shortcuts import render
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialLogin
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)


def google_login(request):
    """Redirect to Google OAuth login"""
    from django.conf import settings
    from django.urls import reverse
    from django.shortcuts import redirect
    
    # Redirect to allauth Google OAuth endpoint
    return redirect('/accounts/google/login/')


def is_google_admin(email):
    admin_email = os.getenv('GOOGLE_ADMIN_EMAIL', 'victor.costa@fce.uncu.edu.ar')
    return email.lower() == admin_email.lower()


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin):
        user = super().populate_user(request, sociallogin)
        email = sociallogin.account.extra_data.get('email', '')
        
        if email:
            user.email = email
            user.username = email.split('@')[0]
        
        return user

    def pre_social_login(self, request, sociallogin):
        email = sociallogin.account.extra_data.get('email', '')
        if not email:
            return

        user_model = get_user_model()
        
        try:
            user = user_model.objects.get(email=email)
            
            existing_social = sociallogin.account.user
            if existing_social and existing_social.id != user.id:
                sociallogin.connect(request, user)
            
            sociallogin.user = user
            request.user = user
            
            if is_google_admin(email):
                user.is_staff = True
                user.is_superuser = True
                user.save()
            
        except user_model.DoesNotExist:
            pass

    def is_open_for_signup(self, request, sociallogin):
        return True

    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)
        
        email = user.email
        
        if is_google_admin(email):
            user.is_staff = True
            user.is_superuser = True
            user.save()
            logger.info(f"User {email} granted admin privileges via Google login")
        else:
            logger.info(f"Google user {email} registered - pending approval")
        
        return user