from flask import Blueprint, jsonify, request
from app.utils.database import execute_query, execute_transaction
from app.utils.decorators import handle_errors
from app.utils.auth import role_required

bp = Blueprint('roles', __name__, url_prefix='/api/roles')

@bp.route('/', methods=['GET'])
@role_required(['Admin'])  # Only Admin can view roles
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

@bp.route('/<int:role_id>', methods=['DELETE'])
@role_required(['Admin'])  # Only Admin can delete roles
@handle_errors
def delete_role(role_id):
    """Delete a role"""
    from flask import g
    
    # Check if role exists
    check_query = "SELECT role_name FROM roles WHERE role_id = %s"
    role = execute_query(check_query, (role_id,), fetch_one=True)
    
    if not role:
        return jsonify({
            'success': False,
            'error': 'Role not found'
        }), 404
    
    role_name = role['role_name']
    
    # Check if role is in use
    users_query = "SELECT COUNT(*) as count FROM users WHERE role_id = %s"
    result = execute_query(users_query, (role_id,), fetch_one=True)
    
    if result['count'] > 0:
        return jsonify({
            'success': False,
            'error': f'Cannot delete role. {result["count"]} user(s) are assigned to this role.'
        }), 400
    
    # Delete role (CASCADE will delete related permissions)
    delete_query = "DELETE FROM roles WHERE role_id = %s"
    execute_query(delete_query, (role_id,))
    
    # Log audit
    try:
        username = g.current_user.get('username', 'Unknown') if hasattr(g, 'current_user') else 'Unknown'
        audit_query = """
            INSERT INTO auditlog (event_type, table_name, username, status, details)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(audit_query, (
            'DELETE',
            'roles',
            username,
            'success',
            f'Deleted role: {role_name} (ID: {role_id})'
        ))
    except Exception as e:
        print(f"Audit log error: {e}")
    
    return jsonify({
        'success': True,
        'message': f'Role "{role_name}" deleted successfully'
    })
