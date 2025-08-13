#!/usr/bin/env python3
"""
SuperCode Python Dependency Auto-Installer
Ensures all required packages are available for n8n SuperCode node
"""

import sys
import subprocess
import importlib.util
import os

# Required packages for SuperCode Python execution
# Python equivalents of the 30+ JavaScript libraries bundled
REQUIRED_PACKAGES = [
    'pandas',
    'numpy',
    'requests',
    'beautifulsoup4', 
    'lxml',
    'urllib3',
    'python-dateutil',
    'pytz',
    'pydantic',
    'email-validator',
    'PyYAML',
    'xmltodict',
    'defusedxml',
    'jinja2',
    'cryptography',
    'pyjwt',
    'passlib',
    'openpyxl',
    'xlsxwriter',
    'pypdf2',
    'reportlab',
    'pillow',
    'qrcode',
    'opencv-python-headless',
    'scipy',
    'sympy',
    'matplotlib',
    'seaborn',
    'plotly',
    'fuzzywuzzy',
    'nltk',
    'textblob',
    'phonenumbers',
    'babel',
    'sqlalchemy',
    'pymongo',
    'scikit-learn',
    'transformers'
]

# Package name mappings for import
IMPORT_MAPPINGS = {
    'beautifulsoup4': 'bs4',
    'scikit-learn': 'sklearn', 
    'pillow': 'PIL',
    'opencv-python-headless': 'cv2',
    'python-dateutil': 'dateutil',
    'PyYAML': 'yaml',
    'email-validator': 'email_validator',
    'pyjwt': 'jwt',
    'pypdf2': 'PyPDF2'
}

def check_package_installed(package_name):
    """Check if a package is available for import"""
    import_name = IMPORT_MAPPINGS.get(package_name, package_name)
    return importlib.util.find_spec(import_name) is not None

def install_package(package_name):
    """Install a package using pip with fallback strategies"""
    install_strategies = [
        # Strategy 1: User install
        [sys.executable, '-m', 'pip', 'install', '--user', package_name],
        # Strategy 2: Break system packages (for externally managed environments)
        [sys.executable, '-m', 'pip', 'install', '--user', '--break-system-packages', package_name],
        # Strategy 3: Force reinstall
        [sys.executable, '-m', 'pip', 'install', '--user', '--force-reinstall', package_name],
    ]
    
    for i, cmd in enumerate(install_strategies, 1):
        try:
            print(f"📦 Installing {package_name} (strategy {i})...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            if result.returncode == 0:
                print(f"✅ {package_name} installed successfully")
                return True
            else:
                print(f"⚠️ Strategy {i} failed: {result.stderr.split('note:')[0].strip()}")
        except subprocess.TimeoutExpired:
            print(f"⏰ Strategy {i} timeout")
        except Exception as e:
            print(f"❌ Strategy {i} error: {str(e)}")
    
    print(f"❌ All installation strategies failed for {package_name}")
    return False

def ensure_dependencies():
    """Check and install missing dependencies"""
    print("🐍 SuperCode Python Dependency Checker")
    print("=" * 50)
    
    missing_packages = []
    
    # Check which packages are missing
    for package in REQUIRED_PACKAGES:
        if not check_package_installed(package):
            missing_packages.append(package)
    
    if not missing_packages:
        print("✅ All required packages are already installed!")
        return True
    
    print(f"📋 Missing packages: {', '.join(missing_packages)}")
    print(f"🔄 Installing {len(missing_packages)} packages...")
    
    success_count = 0
    for package in missing_packages:
        if install_package(package):
            success_count += 1
    
    print("=" * 50)
    print(f"📊 Installation Summary:")
    print(f"   ✅ Successful: {success_count}")
    print(f"   ❌ Failed: {len(missing_packages) - success_count}")
    
    return success_count > 0

if __name__ == "__main__":
    ensure_dependencies()