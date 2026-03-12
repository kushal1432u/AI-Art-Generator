import subprocess
import os
import sys
import time
import signal

def run_backend():
    print("Starting backend...")
    # Change directory to backend and run uvicorn
    backend_path = os.path.join(os.getcwd(), "backend")
    # Using python -m uvicorn to ensure it's run from the correct environment
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
        cwd=backend_path
    )

def run_frontend():
    print("Starting frontend...")
    # Change directory to frontend and run npm run dev
    frontend_path = os.path.join(os.getcwd(), "frontend")
    # Shell=True is often needed for npm on Windows
    return subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_path,
        shell=True
    )

def main():
    backend_process = None
    frontend_process = None
    
    try:
        backend_process = run_backend()
        # Give backend a moment to start
        time.sleep(2)
        
        frontend_process = run_frontend()
        
        print("\n" + "="*50)
        print("AI Art Generator is running!")
        print(f"Backend API: http://localhost:8000")
        print(f"Frontend:    http://localhost:3000")
        print("Press Ctrl+C to stop both servers.")
        print("="*50 + "\n")
        
        # Keep the main process alive
        while True:
            # Check if processes are still running
            if backend_process.poll() is not None:
                print("Backend process terminated unexpectedly.")
                break
            if frontend_process.poll() is not None:
                print("Frontend process terminated unexpectedly.")
                break
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nStopping servers...")
    finally:
        if backend_process:
            print("Terminating backend...")
            backend_process.terminate()
        if frontend_process:
            print("Terminating frontend...")
            # On Windows, terminating an npm process might require killing the process tree
            if os.name == 'nt':
                subprocess.run(['taskkill', '/F', '/T', '/PID', str(frontend_process.pid)], capture_output=True)
            else:
                frontend_process.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
