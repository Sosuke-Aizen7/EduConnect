
#!/usr/bin/env python
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_backend.config.settings')
    sys.path.append('django_backend')
    
    django.setup()
    
    # Run Django development server
    execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:5000'])
