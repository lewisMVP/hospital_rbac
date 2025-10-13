from flask import Blueprint, jsonify, request
from app.utils.database import execute_query, execute_transaction
from app.utils.decorators import handle_errors
from app.utils.auth import token_required, role_required, hash_password

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('/doctors', methods=['GET'])
@token_required  # Any authenticated user can view doctors list
@handle_errors
def get_doctors():
    """Get all doctors - accessible by authenticated users for appointments/medical records"""
    query = """
        SELECT 
            u.user_id,
            u.username,
            r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE r.role_name = 'Doctor'
        ORDER BY u.username
    """
    
    doctors = execute_query(query)
    
    return jsonify({
        'success': True,
        'data': doctors
    })

@bp.route('/', methods=['GET'])
@role_required(['Admin'])  # Only Admin can view users
@handle_errors
def get_all_users():
    """Get all users with their roles"""
    search = request.args.get('search', '')
    
    query = """
        SELECT 
            u.user_id,
            u.username,
            u.password_hash,
            u.role_id,
            r.role_name as roles,
            u.created_at,
            u.updated_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
    """
    
    params = []
    if search:
        query += " WHERE u.username ILIKE %s"
        params = [f"%{search}%"]
    
    query += " ORDER BY u.created_at DESC"
    
    users = execute_query(query, tuple(params) if params else None)
    
    # Add avatar emoji based on roles
    for user in users:
        if user['roles'] and 'Doctor' in user['roles']:
            user['avatar'] = '👨‍⚕️'
        elif user['roles'] and 'Nurse' in user['roles']:
            user['avatar'] = '👩‍⚕️'
        elif user['roles'] and 'Admin' in user['roles']:
            user['avatar'] = '⚙️'
        else:
            user['avatar'] = '👤'
    
    return jsonify({
        'success': True,
        'data': users
    })

@bp.route('/<int:user_id>', methods=['GET'])
@role_required(['Admin'])
@handle_errors
def get_user(user_id):
    """Get user by ID"""
    query = """
        SELECT 
            u.*,
            r.role_name as roles
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = %s
    """
    
    user = execute_query(query, (user_id,), fetch_one=True)
    
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    return jsonify({
        'success': True,
        'data': user
    })

@bp.route('/', methods=['POST'])
@role_required(['Admin'])
@handle_errors
def create_user():
    """Create new user"""
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    role_id = data.get('role_id')  # Single role only
    
    # Hash password before storing
    password_hash = hash_password(password)
    
    # Insert user with role
    insert_user_query = """
        INSERT INTO users (username, password_hash, role_id)
        VALUES (%s, %s, %s)
        RETURNING user_id, username, role_id
    """
    
    user = execute_query(insert_user_query, (username, password_hash, role_id), fetch_one=True)
    
    return jsonify({
        'success': True,
        'message': 'User created successfully',
        'data': user
    }), 201

@bp.route('/<int:user_id>', methods=['PUT'])
@role_required(['Admin'])
@handle_errors
def update_user(user_id):
    """Update user"""
    data = request.get_json()
    
    username = data.get('username')
    role_id = data.get('role_id')
    password = data.get('password')  # Optional password update
    
    # If password is provided, hash it and update
    if password:
        password_hash = hash_password(password)
        query = """
            UPDATE users 
            SET username = %s, role_id = %s, password_hash = %s, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = %s
            RETURNING user_id, username, role_id
        """
        user = execute_query(query, (username, role_id, password_hash, user_id), fetch_one=True)
    else:
        # Update without changing password
        query = """
            UPDATE users 
            SET username = %s, role_id = %s, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = %s
            RETURNING user_id, username, role_id
        """
        user = execute_query(query, (username, role_id, user_id), fetch_one=True)
    
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'User updated successfully',
        'data': user
    })

@bp.route('/<int:user_id>', methods=['DELETE'])
@role_required(['Admin'])
@handle_errors
def delete_user(user_id):
    """Delete user (hard delete since no is_active column)"""
    query = """
        DELETE FROM users 
        WHERE user_id = %s
        RETURNING user_id
    """
    
    result = execute_query(query, (user_id,), fetch_one=True)
    
    if not result:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'User deleted successfully'
    })

@bp.route('/<int:user_id>/roles', methods=['POST'])
@role_required(['Admin'])
@handle_errors
def assign_role(user_id):
    """Assign role to user (updates role_id in users table)"""
    data = request.get_json()
    role_id = data.get('roleId')
    
    query = """
        UPDATE users
        SET role_id = %s
        WHERE user_id = %s
        RETURNING user_id, role_id
    """
    
    result = execute_query(query, (role_id, user_id), fetch_one=True)
    
    if not result:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'Role assigned successfully',
        'data': result
    })
