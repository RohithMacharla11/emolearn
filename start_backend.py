#!/usr/bin/env python3
"""
EmoLearn Backend Server Startup Script
This script helps you start the backend server for the EmoLearn project.
"""

import os
import sys
import subprocess
import time

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_requirements():
    """Check if required packages are installed"""
    required_packages = [
        'fastapi', 'uvicorn', 'flask', 'opencv-python', 
        'mediapipe', 'deepface', 'numpy', 'pandas'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("Please install them using: pip install -r backend/requirements.txt")
        return False
    
    print("✅ All required packages are installed")
    return True

def start_server():
    """Start the FastAPI server"""
    print("\n🚀 Starting EmoLearn Backend Server...")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    if not os.path.exists(backend_dir):
        print(f"❌ Backend directory not found: {backend_dir}")
        return False
    
    os.chdir(backend_dir)
    
    try:
        # Start the server
        print("📍 Server will be available at: http://localhost:8000")
        print("📍 Games will be available at: http://localhost:8000/games/{emotion}/{game_name}")
        print("📍 API documentation at: http://localhost:8000/docs")
        print("\n⏳ Starting server... (Press Ctrl+C to stop)")
        print("-" * 50)
        
        # Run the server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "127.0.0.1", 
            "--port", "8000", 
            "--reload"
        ])
        
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        return False
    
    return True

def main():
    """Main function"""
    print("🎮 EmoLearn Backend Server Startup")
    print("=" * 40)
    
    # Check prerequisites
    if not check_python_version():
        return
    
    if not check_requirements():
        return
    
    # Start server
    start_server()

if __name__ == "__main__":
    main() 