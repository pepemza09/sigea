from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create a superuser if not exists'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@sigea.edu', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created superuser: admin / admin123'))
        else:
            u = User.objects.get(username='admin')
            u.set_password('admin123')
            u.save()
            self.stdout.write(self.style.SUCCESS('Reset password for admin: admin123'))