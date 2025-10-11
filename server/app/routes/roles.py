from flask import Blueprint, jsonify, request
from app.utils.database import execute_query, execute_transaction
from app.utils.decorators import handle_errors

bp = Blueprint('roles', __name__, url_prefix='/api/roles')

@bp.route('/', methods=['GET'])
@handle_errors
def get_all_roles():
    """Get all roles with user count and permission count"""
    query = """
        SELECT 
            r.role_id,
            r.role_name,
            COUNT(u.user_id) as user_count,
            0 as permission_count
        FROM roles r
        LEFT JOIN users u ON r.role_id = u.role_id
        GROUP BY r.role_id, r.role_name
        ORDER BY r.role_id
    """
    
    roles = execute_query(query)
    
    # Add colors and icons
    colors = ['#007aff', '#34c759', '#ff9500', '#5856d6', '#ff3b30']
    icons = ['👨‍⚕️', '👩‍⚕️', '👩', '⚙️', '💰']
    
    for i, role in enumerate(roles):
        role['color'] = colors[i % len(colors)]
        role['icon'] = icons[i % len(icons)]
    
    return jsonify({
        'success': True,
        'data': roles
    })

@bp.route('/<int:role_id>', methods=['GET'])
@handle_errors
def get_role(role_id):
    """Get role by ID"""
    query = """
        SELECT r.*, 
               COUNT(DISTINCT u.user_id) as user_count,
               0 as permission_count
        FROM roles r
        LEFT JOIN users u ON r.role_id = u.role_id
        WHERE r.role_id = %s
        GROUP BY r.role_id
    """
    
    role = execute_query(query, (role_id,), fetch_one=True)
    
    if not role:
        return jsonify({
            'success': False,
            'message': 'Role not found'
        }), 404
    
    return jsonify({
        'success': True,
        'data': role
    })

@bp.route('/', methods=['POST'])
@handle_errors
def create_role():
    """Create new role"""
    data = request.get_json()
    
    role_name = data.get('role_name')
    description = data.get('description', '')
    
    query = """
        INSERT INTO roles (role_name, description)
        VALUES (%s, %s)
        RETURNING role_id, role_name, description
    """
    
    role = execute_query(query, (role_name, description), fetch_one=True)
    
    return jsonify({
        'success': True,
        'message': 'Role created successfully',
        'data': role
    }), 201

@bp.route('/<int:role_id>/permissions', methods=['GET'])
@handle_errors
def get_role_permissions(role_id):
    """Get permissions for a role"""
    query = """
        SELECT 
            p.permission_id,
            p.resource_name,
            p.action_name,
            p.description
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE rp.role_id = %s
        ORDER BY p.resource_name, p.action_name
    """
    
    permissions = execute_query(query, (role_id,))
    
    return jsonify({
        'success': True,
        'data': permissions
    })
