from flask import Blueprint, jsonify, request
from app.utils.database import execute_query
from app.utils.decorators import handle_errors

bp = Blueprint('permissions', __name__, url_prefix='/api/permissions')

@bp.route('/matrix', methods=['GET'])
@handle_errors
def get_permission_matrix():
    """Get complete permission matrix"""
    
    # Get all roles
    roles_query = "SELECT role_name FROM roles ORDER BY role_id"
    roles_result = execute_query(roles_query)
    roles = [r['role_name'] for r in roles_result]
    
    # Get all resources and actions
    resources_query = """
        SELECT DISTINCT resource_name, 
               ARRAY_AGG(DISTINCT action_name ORDER BY action_name) as actions
        FROM permissions
        GROUP BY resource_name
        ORDER BY resource_name
    """
    resources_result = execute_query(resources_query)
    resources = [{'name': r['resource_name'], 'actions': r['actions']} for r in resources_result]
    
    # Get all role-permission mappings
    permissions_query = """
        SELECT 
            r.role_name,
            p.resource_name,
            p.action_name
        FROM role_permissions rp
        JOIN roles r ON rp.role_id = r.role_id
        JOIN permissions p ON rp.permission_id = p.permission_id
    """
    permissions_result = execute_query(permissions_query)
    
    # Build permissions dict
    permissions = {}
    for role in roles:
        permissions[role] = {}
        for resource in resources:
            permissions[role][resource['name']] = []
    
    for perm in permissions_result:
        role = perm['role_name']
        resource = perm['resource_name']
        action = perm['action_name']
        if role in permissions and resource in permissions[role]:
            permissions[role][resource].append(action)
    
    return jsonify({
        'success': True,
        'data': {
            'roles': roles,
            'resources': resources,
            'permissions': permissions
        }
    })

@bp.route('/role/<int:role_id>', methods=['GET'])
@handle_errors
def get_permissions_by_role(role_id):
    """Get all permissions for a specific role"""
    query = """
        SELECT 
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

@bp.route('/grant', methods=['POST'])
@handle_errors
def grant_permission():
    """Grant a permission to a role"""
    data = request.get_json()
    
    role_id = data.get('roleId')
    resource = data.get('resource')
    action = data.get('action')
    
    # Get permission_id
    perm_query = """
        SELECT permission_id 
        FROM permissions 
        WHERE resource_name = %s AND action_name = %s
    """
    permission = execute_query(perm_query, (resource, action), fetch_one=True)
    
    if not permission:
        return jsonify({
            'success': False,
            'message': 'Permission not found'
        }), 404
    
    # Grant permission
    grant_query = """
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING
        RETURNING role_id, permission_id
    """
    
    result = execute_query(grant_query, (role_id, permission['permission_id']), fetch_one=True)
    
    return jsonify({
        'success': True,
        'message': 'Permission granted successfully',
        'data': result
    })

@bp.route('/revoke', methods=['POST'])
@handle_errors
def revoke_permission():
    """Revoke a permission from a role"""
    data = request.get_json()
    
    role_id = data.get('roleId')
    resource = data.get('resource')
    action = data.get('action')
    
    # Get permission_id
    perm_query = """
        SELECT permission_id 
        FROM permissions 
        WHERE resource_name = %s AND action_name = %s
    """
    permission = execute_query(perm_query, (resource, action), fetch_one=True)
    
    if not permission:
        return jsonify({
            'success': False,
            'message': 'Permission not found'
        }), 404
    
    # Revoke permission
    revoke_query = """
        DELETE FROM role_permissions 
        WHERE role_id = %s AND permission_id = %s
        RETURNING role_id, permission_id
    """
    
    result = execute_query(revoke_query, (role_id, permission['permission_id']), fetch_one=True)
    
    if not result:
        return jsonify({
            'success': False,
            'message': 'Permission not found for this role'
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'Permission revoked successfully'
    })
