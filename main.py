
#!/usr/bin/env python
import os
import sys
import subprocess

if __name__ == "__main__":
    # Change to django_backend directory
    os.chdir('django_backend')
    
    # Add the django_backend directory to Python path
    sys.path.insert(0, os.getcwd())
    
    # Set Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    # Run migrations first
    print("Running migrations...")
    subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
    
    # Start Django development server
    print("Starting Django server...")
    subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'])
