from flask import Blueprint, jsonify, request
from app.utils.database import execute_query, execute_transaction
from app.utils.decorators import handle_errors

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('/', methods=['GET'])
@handle_errors
def get_all_users():
    """Get all users with their roles"""
    search = request.args.get('search', '')
    
    query = """
        SELECT 
            u.user_id as id,
            u.username,
            u.email,
            u.full_name as name,
            CASE WHEN u.is_active THEN 'Active' ELSE 'Inactive' END as status,
            STRING_AGG(r.role_name, ', ') as role,
            u.created_at
        FROM users u
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
    """
    
    params = []
    if search:
        query += " WHERE u.username ILIKE %s OR u.email ILIKE %s OR u.full_name ILIKE %s"
        search_param = f"%{search}%"
        params = [search_param, search_param, search_param]
    
    query += """
        GROUP BY u.user_id, u.username, u.email, u.full_name, u.is_active, u.created_at
        ORDER BY u.created_at DESC
    """
    
    users = execute_query(query, tuple(params) if params else None)
    
    # Add avatar emoji based on role
    for user in users:
        if user['role'] and 'Doctor' in user['role']:
            user['avatar'] = '👨‍⚕️'
        elif user['role'] and 'Nurse' in user['role']:
            user['avatar'] = '👩‍⚕️'
        elif user['role'] and 'Admin' in user['role']:
            user['avatar'] = '⚙️'
        else:
            user['avatar'] = '👤'
    
    return jsonify({
        'success': True,
        'data': {
            'users': users
        }
    })

@bp.route('/<int:user_id>', methods=['GET'])
@handle_errors
def get_user(user_id):
    """Get user by ID"""
    query = """
        SELECT 
            u.*,
            ARRAY_AGG(r.role_name) as roles,
            ARRAY_AGG(r.role_id) as role_ids
        FROM users u
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        WHERE u.user_id = %s
        GROUP BY u.user_id
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
@handle_errors
def create_user():
    """Create new user"""
    data = request.get_json()
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')  # In production, hash this!
    full_name = data.get('full_name')
    role_ids = data.get('role_ids', [])
    
    # Insert user
    insert_user_query = """
        INSERT INTO users (username, email, password_hash, full_name, is_active)
        VALUES (%s, %s, %s, %s, TRUE)
        RETURNING user_id, username, email, full_name
    """
    
    user = execute_query(insert_user_query, (username, email, password, full_name), fetch_one=True)
    
    # Assign roles
    if role_ids:
        role_queries = []
        for role_id in role_ids:
            role_queries.append((
                "INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s)",
                (user['user_id'], role_id)
            ))
        execute_transaction(role_queries)
    
    return jsonify({
        'success': True,
        'message': 'User created successfully',
        'data': user
    }), 201

@bp.route('/<int:user_id>', methods=['PUT'])
@handle_errors
def update_user(user_id):
    """Update user"""
    data = request.get_json()
    
    full_name = data.get('full_name')
    email = data.get('email')
    is_active = data.get('is_active', True)
    
    query = """
        UPDATE users 
        SET full_name = %s, email = %s, is_active = %s
        WHERE user_id = %s
        RETURNING user_id, username, email, full_name, is_active
    """
    
    user = execute_query(query, (full_name, email, is_active, user_id), fetch_one=True)
    
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
@handle_errors
def delete_user(user_id):
    """Delete user (soft delete)"""
    query = """
        UPDATE users 
        SET is_active = FALSE
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
@handle_errors
def assign_role(user_id):
    """Assign role to user"""
    data = request.get_json()
    role_id = data.get('roleId')
    
    query = """
        INSERT INTO user_roles (user_id, role_id)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING
        RETURNING user_id, role_id
    """
    
    result = execute_query(query, (user_id, role_id), fetch_one=True)
    
    return jsonify({
        'success': True,
        'message': 'Role assigned successfully',
        'data': result
    })
