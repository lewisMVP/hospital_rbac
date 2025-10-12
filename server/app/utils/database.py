import psycopg2
from psycopg2.extras import RealDictCursor
from app.config import Config
from datetime import date, time, datetime
from decimal import Decimal

def serialize_value(value):
    """Convert non-JSON-serializable types to strings"""
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    elif isinstance(value, time):
        return value.strftime('%H:%M:%S')
    elif isinstance(value, Decimal):
        return float(value)
    return value

def serialize_row(row):
    """Convert a database row to JSON-serializable dict"""
    if row is None:
        return None
    return {key: serialize_value(value) for key, value in row.items()}

def get_db_connection():
    """
    Create and return a PostgreSQL database connection
    Returns connection with RealDictCursor for dict-like results
    """
    try:
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            cursor_factory=RealDictCursor
        )
        return conn
    except psycopg2.Error as e:
        print(f"❌ Database connection error: {e}")
        raise

def execute_query(query, params=None, fetch=True, fetch_one=False):
    """
    Execute a SQL query and return results
    
    Args:
        query: SQL query string
        params: Query parameters (tuple or dict)
        fetch: Whether to fetch results (True for SELECT, False for INSERT/UPDATE/DELETE)
        fetch_one: Whether to fetch only one row
    
    Returns:
        Query results or affected row count
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(query, params)
        
        if fetch:
            if fetch_one:
                result = cursor.fetchone()
                result = serialize_row(result) if result else None
            else:
                result = cursor.fetchall()
                result = [serialize_row(row) for row in result] if result else []
            # Commit even for SELECT with RETURNING clause
            conn.commit()
            conn.close()
            return result
        else:
            conn.commit()
            affected_rows = cursor.rowcount
            conn.close()
            return affected_rows
            
    except psycopg2.Error as e:
        conn.rollback()
        conn.close()
        print(f"❌ Query execution error: {e}")
        raise

def execute_transaction(queries):
    """
    Execute multiple queries in a transaction
    
    Args:
        queries: List of (query, params) tuples
    
    Returns:
        True if successful, raises exception otherwise
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        for query, params in queries:
            cursor.execute(query, params)
        
        conn.commit()
        conn.close()
        return True
        
    except psycopg2.Error as e:
        conn.rollback()
        conn.close()
        print(f"❌ Transaction error: {e}")
        raise
