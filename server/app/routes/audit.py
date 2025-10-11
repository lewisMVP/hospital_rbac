from flask import Blueprint, jsonify, request
from app.utils.database import execute_query
from app.utils.decorators import handle_errors

bp = Blueprint('audit', __name__, url_prefix='/api/audit')

@bp.route('/logs', methods=['GET'])
@handle_errors
def get_audit_logs():
    """Get audit logs with filters"""
    date_range = request.args.get('dateRange', 'today')
    status = request.args.get('status', 'all')
    limit = request.args.get('limit', 50, type=int)
    
    query = """
        SELECT 
            al.audit_id as id,
            TO_CHAR(al.timestamp, 'YYYY-MM-DD HH24:MI:SS') as timestamp,
            COALESCE(u.full_name, u.username, al.username) as user,
            al.action_type as action,
            al.resource_name as resource,
            CASE WHEN al.status = 'SUCCESS' THEN 'Success' ELSE 'Failed' END as status,
            al.ip_address as ip,
            al.details
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.user_id
        WHERE 1=1
    """
    
    params = []
    
    # Date range filter
    if date_range == 'today':
        query += " AND al.timestamp >= CURRENT_DATE"
    elif date_range == 'week':
        query += " AND al.timestamp >= CURRENT_DATE - INTERVAL '7 days'"
    elif date_range == 'month':
        query += " AND al.timestamp >= CURRENT_DATE - INTERVAL '30 days'"
    
    # Status filter
    if status != 'all':
        query += " AND LOWER(al.status) = %s"
        params.append(status.lower())
    
    query += " ORDER BY al.timestamp DESC LIMIT %s"
    params.append(limit)
    
    logs = execute_query(query, tuple(params) if params else None)
    
    return jsonify({
        'success': True,
        'data': {
            'logs': logs
        }
    })

@bp.route('/failed-logins', methods=['GET'])
@handle_errors
def get_failed_logins():
    """Get failed login attempts"""
    limit = request.args.get('limit', 20, type=int)
    
    query = """
        SELECT 
            al.audit_id as id,
            TO_CHAR(al.timestamp, 'YYYY-MM-DD HH24:MI:SS') as timestamp,
            al.username as user,
            al.ip_address as ip,
            al.details
        FROM audit_log al
        WHERE al.action_type = 'LOGIN' 
        AND al.status = 'FAILED'
        ORDER BY al.timestamp DESC
        LIMIT %s
    """
    
    logs = execute_query(query, (limit,))
    
    return jsonify({
        'success': True,
        'data': logs
    })

@bp.route('/alerts', methods=['GET'])
@handle_errors
def get_security_alerts():
    """Get security alerts"""
    
    # Multiple failed logins from same IP
    failed_logins_query = """
        SELECT 
            ip_address,
            COUNT(*) as count,
            MAX(timestamp) as last_attempt
        FROM audit_log
        WHERE action_type = 'LOGIN' 
        AND status = 'FAILED'
        AND timestamp >= NOW() - INTERVAL '24 hours'
        GROUP BY ip_address
        HAVING COUNT(*) >= 3
        ORDER BY count DESC
        LIMIT 5
    """
    failed_logins = execute_query(failed_logins_query)
    
    alerts = []
    
    for fl in failed_logins:
        severity = 'high' if fl['count'] >= 5 else 'medium'
        alerts.append({
            'id': len(alerts) + 1,
            'severity': severity,
            'message': f"Multiple failed login attempts from IP {fl['ip_address']}",
            'count': fl['count'],
            'timestamp': fl['last_attempt'].strftime('%H:%M') if fl['last_attempt'] else 'N/A'
        })
    
    # Unusual access patterns
    unusual_query = """
        SELECT 
            u.full_name,
            COUNT(DISTINCT al.resource_name) as resources_accessed,
            MAX(al.timestamp) as last_access
        FROM audit_log al
        JOIN users u ON al.user_id = u.user_id
        WHERE al.timestamp >= NOW() - INTERVAL '1 hour'
        GROUP BY u.user_id, u.full_name
        HAVING COUNT(DISTINCT al.resource_name) >= 5
        LIMIT 3
    """
    unusual = execute_query(unusual_query)
    
    for ua in unusual:
        alerts.append({
            'id': len(alerts) + 1,
            'severity': 'medium',
            'message': f"Unusual access pattern detected for user: {ua['full_name']}",
            'count': 1,
            'timestamp': ua['last_access'].strftime('%H:%M') if ua['last_access'] else 'N/A'
        })
    
    return jsonify({
        'success': True,
        'data': alerts
    })

@bp.route('/stats', methods=['GET'])
@handle_errors
def get_audit_stats():
    """Get audit statistics"""
    
    # Total events today
    total_query = """
        SELECT COUNT(*) as count 
        FROM audit_log 
        WHERE timestamp >= CURRENT_DATE
    """
    total = execute_query(total_query, fetch_one=True)
    
    # Failed logins today
    failed_query = """
        SELECT COUNT(*) as count 
        FROM audit_log 
        WHERE action_type = 'LOGIN' 
        AND status = 'FAILED'
        AND timestamp >= CURRENT_DATE
    """
    failed = execute_query(failed_query, fetch_one=True)
    
    # Unauthorized access attempts
    unauth_query = """
        SELECT COUNT(*) as count 
        FROM audit_log 
        WHERE status = 'FAILED'
        AND action_type != 'LOGIN'
        AND timestamp >= CURRENT_DATE
    """
    unauth = execute_query(unauth_query, fetch_one=True)
    
    # Role changes today
    role_changes_query = """
        SELECT COUNT(*) as count 
        FROM audit_log 
        WHERE resource_name = 'roles'
        AND timestamp >= CURRENT_DATE
    """
    role_changes = execute_query(role_changes_query, fetch_one=True)
    
    stats = [
        {
            'label': 'Total Events',
            'value': str(total['count'] if total else 0),
            'icon': '📊',
            'color': '#007aff'
        },
        {
            'label': 'Failed Logins',
            'value': str(failed['count'] if failed else 0),
            'icon': '⚠️',
            'color': '#ff9500'
        },
        {
            'label': 'Unauthorized Access',
            'value': str(unauth['count'] if unauth else 0),
            'icon': '🚫',
            'color': '#ff3b30'
        },
        {
            'label': 'Role Changes',
            'value': str(role_changes['count'] if role_changes else 0),
            'icon': '🔑',
            'color': '#34c759'
        }
    ]
    
    return jsonify({
        'success': True,
        'data': stats
    })
