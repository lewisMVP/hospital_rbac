"""
Authentication routes: login, logout, current user
"""
from flask import Blueprint, jsonify, request
from app.utils.database import execute_query
from app.utils.decorators import handle_errors
from app.utils.auth import hash_password, verify_password, generate_token, token_required

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
@handle_errors
def login():
    """
    Login endpoint - authenticate user and return JWT token
    """
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({
            'success': False,
            'message': 'Username and password are required'
        }), 400
    
    # Get user from database
    query = """
        SELECT 
            u.user_id,
            u.username,
            u.password_hash,
            u.role_id,
            r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.username = %s
    """
    
    user = execute_query(query, (username,), fetch_one=True)
    
    if not user:
        # Log failed login attempt
        print(f"[AUDIT] Logging failed login for user not found: {username}")
        try:
            log_query = """
                INSERT INTO auditlog (event_type, username, table_name, details, status)
                VALUES (%s, %s, %s, %s, %s)
            """
            execute_query(log_query, (
                'LOGIN',
                username,
                'users',
                f'Failed login attempt - user not found',
                'failed'
            ), fetch=False)
            print(f"[AUDIT] Successfully logged failed login for: {username}")
        except Exception as e:
            print(f"[AUDIT ERROR] Failed to log: {str(e)}")
        
        return jsonify({
            'success': False,
            'message': 'Invalid username or password'
        }), 401
    
    # Verify password
    if not verify_password(password, user['password_hash']):
        # Log failed login attempt
        print(f"[AUDIT] Logging failed login for incorrect password: {username}")
        try:
            log_query = """
                INSERT INTO auditlog (event_type, username, table_name, details, status)
                VALUES (%s, %s, %s, %s, %s)
            """
            execute_query(log_query, (
                'LOGIN',
                username,
                'users',
                f'Failed login attempt - incorrect password',
                'failed'
            ), fetch=False)
            print(f"[AUDIT] Successfully logged failed login for: {username}")
        except Exception as e:
            print(f"[AUDIT ERROR] Failed to log: {str(e)}")
        
        return jsonify({
            'success': False,
            'message': 'Invalid username or password'
        }), 401
    
    # Generate JWT token
    token = generate_token(
        user['user_id'],
        user['username'],
        user['role_id'],
        user['role_name']
    )
    
    # Log successful login
    log_query = """
        INSERT INTO auditlog (event_type, username, table_name, details, status)
        VALUES (%s, %s, %s, %s, %s)
    """
    execute_query(log_query, (
        'LOGIN',
        username,
        'users',
        f'Successful login',
        'success'
    ), fetch=False)
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'data': {
            'token': token,
            'user': {
                'user_id': user['user_id'],
                'username': user['username'],
                'role_id': user['role_id'],
                'role_name': user['role_name']
            }
        }
    })

@bp.route('/logout', methods=['POST'])
@token_required
@handle_errors
def logout():
    """
    Logout endpoint - log the logout event
    """
    user = request.current_user
    
    # Log logout
    log_query = """
        INSERT INTO auditlog (event_type, username, table_name, details, status)
        VALUES (%s, %s, %s, %s, %s)
    """
    execute_query(log_query, (
        'LOGOUT',
        user['username'],
        'users',
        f'User logged out',
        'success'
    ), fetch=False)
    
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    })

@bp.route('/me', methods=['GET'])
@token_required
@handle_errors
def get_current_user():
    """
    Get current authenticated user info
    """
    user = request.current_user
    
    # Get full user details
    query = """
        SELECT 
            u.user_id,
            u.username,
            u.role_id,
            r.role_name,
            u.created_at,
            u.updated_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = %s
    """
    
    user_data = execute_query(query, (user['user_id'],), fetch_one=True)
    
    if not user_data:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    return jsonify({
        'success': True,
        'data': user_data
    })

@bp.route('/change-password', methods=['POST'])
@token_required
@handle_errors
def change_password():
    """
    Change password for current user
    """
    user = request.current_user
    data = request.get_json()
    
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({
            'success': False,
            'message': 'Current password and new password are required'
        }), 400
    
    # Get current password hash
    query = "SELECT password_hash FROM users WHERE user_id = %s"
    result = execute_query(query, (user['user_id'],), fetch_one=True)
    
    if not result:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    # Verify current password
    if not verify_password(current_password, result['password_hash']):
        return jsonify({
            'success': False,
            'message': 'Current password is incorrect'
        }), 401
    
    # Hash new password
    new_hash = hash_password(new_password)
    
    # Update password
    update_query = """
        UPDATE users 
        SET password_hash = %s, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = %s
    """
    execute_query(update_query, (new_hash, user['user_id']), fetch=False)
    
    # Log password change
    log_query = """
        INSERT INTO auditlog (event_type, username, table_name, details, status)
        VALUES (%s, %s, %s, %s, %s)
    """
    execute_query(log_query, (
        'UPDATE',
        user['username'],
        'users',
        'Password changed',
        'success'
    ), fetch=False)
    
    return jsonify({
        'success': True,
        'message': 'Password changed successfully'
    })
