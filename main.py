
#!/usr/bin/env python
import os
import subprocess
import sys

if __name__ == "__main__":
    # Change to django_backend directory
    os.chdir('django_backend')
    
    # Run migrations first
    print("Running migrations...")
    subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
    
    # Start Django development server
    print("Starting Django server on port 8000...")
    subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'])
