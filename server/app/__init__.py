from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.utils.database import get_db_connection
import psycopg2

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for all routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Test database connection on startup
    try:
        conn = get_db_connection()
        conn.close()
        print("✅ Database connection successful!")
    except psycopg2.Error as e:
        print(f"❌ Database connection failed: {e}")
        print("⚠️  Make sure PostgreSQL is running and credentials are correct in .env")
    
    # Register blueprints
    from app.routes import dashboard, users, roles, permissions, audit
    
    app.register_blueprint(dashboard.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(roles.bp)
    app.register_blueprint(permissions.bp)
    app.register_blueprint(audit.bp)
    
    # Health check route
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'OK',
            'message': 'Hospital RBAC API is running',
            'version': '1.0.0'
        })
    
    # Root route
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Hospital RBAC Backend API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'dashboard': '/api/dashboard/*',
                'users': '/api/users/*',
                'roles': '/api/roles/*',
                'permissions': '/api/permissions/*',
                'audit': '/api/audit/*'
            }
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Endpoint not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500
    
    return app
