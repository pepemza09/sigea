#!/bin/bash
set -e

echo "Running migrations..."
python manage.py makemigrations unidades_academicas carreras planes materias equivalencias || true
python manage.py migrate

echo "Setting up SocialApp for Google OAuth..."
python manage.py shell << 'EOF'
from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site
import os

site, _ = Site.objects.get_or_create(id=1)
site.domain = 'localhost'
site.name = 'SIGeA'
site.save()

if not SocialApp.objects.filter(provider='google').exists():
    app = SocialApp.objects.create(
        provider='google',
        name='Google',
        client_id=os.getenv('GOOGLE_CLIENT_ID', ''),
        secret=os.getenv('GOOGLE_CLIENT_SECRET', '')
    )
    app.sites.add(site)
    print('Created SocialApp for Google')
else:
    print('SocialApp already exists')
EOF

echo "Creating admin user..."
python manage.py shell -c "from django.contrib.auth.models import User; u, _ = User.objects.get_or_create(username='admin'); u.set_password('admin123'); u.save()"

echo "Starting Gunicorn..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120