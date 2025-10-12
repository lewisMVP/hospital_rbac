from flask import Blueprint, request, jsonify
from app.utils.database import execute_query
from app.utils.auth import role_required

bp = Blueprint('audit', __name__, url_prefix='/api/audit')

@bp.route('/', methods=['GET'])
@role_required(['Admin'])  # Only Admin can view audit logs
def get_audit_logs():
    """Get audit logs with pagination and filters"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        event_type = request.args.get('event_type')
        search = request.args.get('search')
        
        offset = (page - 1) * limit
        
        # Debug log
        print(f"🔍 Audit Log Query - page: {page}, limit: {limit}, event_type: {event_type}, search: {search}")
        
        # Base query - SỬA TÊN BẢNG
        query = """
            SELECT a.audit_id, a.event_type, a.table_name, 
                   a.username, a.event_time as timestamp,
                   a.status, a.details, a.ip_address
            FROM auditlog a
            WHERE 1=1
        """
        params = []
        
        # Add filters
        if event_type:
            query += " AND a.event_type = %s"
            params.append(event_type)
        
        if search:
            query += " AND (a.username ILIKE %s OR a.table_name ILIKE %s)"
            params.extend([f'%{search}%', f'%{search}%'])
        
        # Order and pagination
        query += " ORDER BY a.event_time DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        print(f"📊 Query: {query}")
        print(f"📊 Params: {params}")
        
        logs = execute_query(query, tuple(params))
        
        print(f"✅ Found {len(logs)} logs")
        
        # Get total count
        count_query = "SELECT COUNT(*) as total FROM auditlog WHERE 1=1"
        count_params = []
        
        if event_type:
            count_query += " AND event_type = %s"
            count_params.append(event_type)
        
        if search:
            count_query += " AND (username ILIKE %s OR table_name ILIKE %s)"
            count_params.extend([f'%{search}%', f'%{search}%'])
        
        total = execute_query(count_query, tuple(count_params) if count_params else None)[0]['total']
        
        return jsonify({
            'success': True,
            'data': logs,
            'total': total,
            'page': page,
            'limit': limit
        })
    except Exception as e:
        print(f"Error in get_audit_logs: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error fetching audit logs',
            'error': str(e)
        }), 500

@bp.route('/stats', methods=['GET'])
def get_audit_stats():
    """Get audit statistics"""
    try:
        query = """
            SELECT 
                COUNT(*) as total_events,
                COUNT(CASE WHEN event_type = 'FAILED_LOGIN' THEN 1 END) as failed_logins,
                COUNT(DISTINCT username) as active_users,
                COUNT(CASE WHEN event_time >= NOW() - INTERVAL '24 hours' THEN 1 END) as events_24h
            FROM auditlog
        """
        
        stats = execute_query(query)[0]
        
        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        print(f"Error in get_audit_stats: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error fetching audit stats',
            'error': str(e)
        }), 500

@bp.route('/security-alerts', methods=['GET'])
def get_security_alerts():
    """Get recent security alerts"""
    try:
        # Query failed login attempts in last 24 hours
        query = """
            SELECT 
                audit_id as id,
                'Failed Login Attempt' as message,
                event_time as timestamp,
                CASE 
                    WHEN COUNT(*) OVER (PARTITION BY username) > 5 THEN 'critical'
                    WHEN COUNT(*) OVER (PARTITION BY username) > 3 THEN 'high'
                    ELSE 'medium'
                END as severity,
                '🔒' as icon
            FROM auditlog
            WHERE event_type = 'FAILED_LOGIN' 
                AND event_time >= NOW() - INTERVAL '24 hours'
            ORDER BY event_time DESC
            LIMIT 10
        """
        
        alerts = execute_query(query)
        
        return jsonify({
            'success': True,
            'data': alerts
        })
    except Exception as e:
        print(f"Error in get_security_alerts: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error fetching security alerts',
            'error': str(e)
        }), 500
