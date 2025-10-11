from app import create_app

app = create_app()

if __name__ == '__main__':
    print("Starting Hospital RBAC Backend Server...")
    print("API will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    print("\n  Make sure:")
    print("   1. PostgreSQL is running")
    print("   2. Database 'hospital_rbac' exists")
    print("   3. .env file is configured correctly")
    print("\n" + "="*50 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
