from flask import Blueprint, jsonify, request
from app.utils.database import execute_query
from app.utils.auth import token_required

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@bp.route('/stats', methods=['GET'])
@token_required  # All authenticated users can view dashboard
def get_stats(current_user):
    """Get dashboard statistics"""
    try:
        # Get user count
        user_count = execute_query("SELECT COUNT(*) as count FROM users")[0]['count']
        
        # Get role count
        role_count = execute_query("SELECT COUNT(*) as count FROM roles")[0]['count']
        
        # Get failed logins (last 24 hours)
        failed_logins = execute_query("""
            SELECT COUNT(*) as count 
            FROM auditlog 
            WHERE event_type = 'FAILED_LOGIN' 
                AND event_time >= NOW() - INTERVAL '24 hours'
        """)[0]['count']
        
        # Get total audit entries
        audit_count = execute_query("SELECT COUNT(*) as count FROM auditlog")[0]['count']
        
        stats = [
            {
                'label': 'Total Users',
                'value': str(user_count),
                'change': '+12%',
                'trend': 'up',
                'icon': '👥',
                'color': '#007aff'
            },
            {
                'label': 'Active Roles',
                'value': str(role_count),
                'change': '+3',
                'trend': 'up',
                'icon': '🔑',
                'color': '#34c759'
            },
            {
                'label': 'Failed Logins',
                'value': str(failed_logins),
                'change': '-15%',
                'trend': 'down',
                'icon': '❌',
                'color': '#ff3b30'
            },
            {
                'label': 'Audit Entries',
                'value': str(audit_count),
                'change': '+234',
                'trend': 'up',
                'icon': '📊',
                'color': '#af52de'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        print(f"Error in get_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Error fetching stats',
            'error': str(e)
        }), 500

@bp.route('/activities', methods=['GET'])
@token_required
def get_recent_activities(current_user):
    """Get recent activities"""
    try:
        limit = int(request.args.get('limit', 5))
        
        query = """
            SELECT 
                event_type as type,
                username as user,
                event_time as time,
                table_name as details
            FROM auditlog
            ORDER BY event_time DESC
            LIMIT %s
        """
        
        activities = execute_query(query, (limit,))
        
        return jsonify({
            'success': True,
            'data': activities
        })
    except Exception as e:
        print(f"Error in get_recent_activities: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error fetching activities',
            'error': str(e)
        }), 500

@bp.route('/role-distribution', methods=['GET'])
@token_required
def get_role_distribution(current_user):
    """Get role distribution"""
    try:
        query = """
            SELECT 
                r.role_name as name,
                COUNT(u.user_id) as value
            FROM roles r
            LEFT JOIN users u ON r.role_id = u.role_id
            GROUP BY r.role_name
            ORDER BY value DESC
        """
        
        distribution = execute_query(query)
        
        return jsonify({
            'success': True,
            'data': distribution
        })
    except Exception as e:
        print(f"Error in get_role_distribution: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error fetching role distribution',
            'error': str(e)
        }), 500
