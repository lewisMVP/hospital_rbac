from functools import wraps
from flask import jsonify

def handle_errors(f):
    """
    Decorator to handle errors in route functions
    Returns JSON error response with appropriate status code
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            print(f"❌ Error in {f.__name__}: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }), 500
    return decorated_function
