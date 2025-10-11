from flask import Blueprint, jsonify, request
from app.utils.database import execute_query
from app.utils.decorators import handle_errors

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@bp.route('/stats', methods=['GET'])
@handle_errors
def get_stats():
    """Get dashboard statistics"""
    
    # Total Users
    total_users_query = "SELECT COUNT(*) as count FROM users WHERE is_active = TRUE"
    total_users = execute_query(total_users_query, fetch_one=True)
    
    # Active Roles
    active_roles_query = "SELECT COUNT(*) as count FROM roles"
    active_roles = execute_query(active_roles_query, fetch_one=True)
    
    # Failed Logins (last 24 hours)
    failed_logins_query = """
        SELECT COUNT(*) as count 
        FROM audit_log 
        WHERE action_type = 'LOGIN' 
        AND status = 'FAILED'
        AND timestamp >= NOW() - INTERVAL '24 hours'
    """
    failed_logins = execute_query(failed_logins_query, fetch_one=True)
    
    # Total Audit Entries
    audit_entries_query = "SELECT COUNT(*) as count FROM audit_log"
    audit_entries = execute_query(audit_entries_query, fetch_one=True)
    
    stats = [
        {
            'label': 'Total Users',
            'value': str(total_users['count'] if total_users else 0),
            'change': '+12%',
            'trend': 'up',
            'icon': '👥',
            'color': '#007aff'
        },
        {
            'label': 'Active Roles',
            'value': str(active_roles['count'] if active_roles else 0),
            'change': '+2',
            'trend': 'up',
            'icon': '🔐',
            'color': '#34c759'
        },
        {
            'label': 'Failed Logins',
            'value': str(failed_logins['count'] if failed_logins else 0),
            'change': '-15%',
            'trend': 'down',
            'icon': '⚠️',
            'color': '#ff9500'
        },
        {
            'label': 'Audit Entries',
            'value': str(audit_entries['count'] if audit_entries else 0),
            'change': '+89',
            'trend': 'up',
            'icon': '📋',
            'color': '#5856d6'
        }
    ]
    
    return jsonify({
        'success': True,
        'data': stats
    })

@bp.route('/activities', methods=['GET'])
@handle_errors
def get_recent_activities():
    """Get recent activities"""
    limit = request.args.get('limit', 5, type=int)
    
    query = """
        SELECT 
            u.full_name as user,
            al.action_type || ' ' || al.resource_name as action,
            TO_CHAR(NOW() - al.timestamp, 'FMDD"d" FMHH24"h"') as time,
            CASE 
                WHEN al.action_type = 'SELECT' THEN 'view'
                WHEN al.action_type = 'UPDATE' THEN 'update'
                WHEN al.action_type = 'INSERT' THEN 'create'
                WHEN al.action_type = 'DELETE' THEN 'delete'
                ELSE 'other'
            END as type
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.user_id
        ORDER BY al.timestamp DESC
        LIMIT %s
    """
    
    activities = execute_query(query, (limit,))
    
    # Format time ago
    for activity in activities:
        if 'd' in activity['time']:
            activity['time'] = activity['time'].split('d')[0] + ' days ago'
        elif 'h' in activity['time']:
            hours = activity['time'].split('h')[0]
            activity['time'] = hours + ' hours ago' if int(hours) > 1 else hours + ' hour ago'
        else:
            activity['time'] = 'just now'
    
    return jsonify({
        'success': True,
        'data': activities
    })

@bp.route('/role-distribution', methods=['GET'])
@handle_errors
def get_role_distribution():
    """Get role distribution statistics"""
    
    query = """
        SELECT 
            r.role_name as role,
            COUNT(DISTINCT ur.user_id) as count,
            ROUND(COUNT(DISTINCT ur.user_id)::NUMERIC / NULLIF((SELECT COUNT(*) FROM users WHERE is_active = TRUE), 0) * 100, 0) as percentage
        FROM roles r
        LEFT JOIN user_roles ur ON r.role_id = ur.role_id
        LEFT JOIN users u ON ur.user_id = u.user_id AND u.is_active = TRUE
        GROUP BY r.role_id, r.role_name
        ORDER BY count DESC
    """
    
    roles = execute_query(query)
    
    # Add colors
    colors = ['#007aff', '#34c759', '#ff9500', '#5856d6', '#ff3b30', '#86868b']
    for i, role in enumerate(roles):
        role['color'] = colors[i % len(colors)]
        role['percentage'] = int(role['percentage'] or 0)
    
    return jsonify({
        'success': True,
        'data': roles
    })
