"""
Authentication utilities for JWT token management and password hashing
"""
import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
import os

# Secret key for JWT (should be in environment variables)
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
ALGORITHM = 'HS256'
TOKEN_EXPIRATION_HOURS = 24

def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password, hashed_password):
    """Verify a password against a hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_token(user_id, username, role_id, role_name):
    """Generate JWT token for authenticated user"""
    payload = {
        'user_id': user_id,
        'username': username,
        'role_id': role_id,
        'role_name': role_name,
        'exp': datetime.utcnow() + timedelta(hours=TOKEN_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_token(token):
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to protect routes with JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Format: "Bearer <token>"
            except IndexError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token format'
                }), 401
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token is missing'
            }), 401
        
        # Decode token
        payload = decode_token(token)
        if not payload:
            return jsonify({
                'success': False,
                'message': 'Token is invalid or expired'
            }), 401
        
        # Add user info to request context
        request.current_user = payload
        
        # Check if function accepts current_user parameter
        import inspect
        sig = inspect.signature(f)
        if 'current_user' in sig.parameters:
            # Pass current_user as keyword argument if function accepts it
            return f(current_user=payload, *args, **kwargs)
        else:
            # Don't pass if function doesn't accept it
            return f(*args, **kwargs)
    
    return decorated

def role_required(allowed_roles):
    """Decorator to restrict routes to specific roles"""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(current_user=None, *args, **kwargs):
            user = request.current_user
            
            if user['role_name'] not in allowed_roles:
                return jsonify({
                    'success': False,
                    'message': f'Access denied. Required roles: {", ".join(allowed_roles)}'
                }), 403
            
            # Check if wrapped function accepts current_user parameter
            import inspect
            sig = inspect.signature(f)
            if 'current_user' in sig.parameters:
                # Pass current_user if function accepts it
                return f(current_user=current_user, *args, **kwargs)
            else:
                # Don't pass if function doesn't accept it
                return f(*args, **kwargs)
        
        return decorated
    return decorator
