from flask import Blueprint, request, jsonify
from app.utils.database import execute_query
from app.utils.auth import token_required, role_required

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/', methods=['GET'])
@token_required
def get_appointments(current_user):
    """Get all appointments - All authenticated users can view"""
    try:
        query = """
            SELECT a.appointment_id, a.patient_id, a.doctor_id, 
                   a.appointment_date, a.appointment_time, a.status, 
                   a.reason, a.notes, a.created_at, a.updated_at,
                   p.first_name || ' ' || p.last_name as patient_name,
                   u.username as doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            LEFT JOIN users u ON a.doctor_id = u.user_id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        """
        appointments = execute_query(query)
        
        return jsonify({
            'success': True,
            'appointments': appointments
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching appointments: {str(e)}'
        }), 500

@appointments_bp.route('/<int:appointment_id>', methods=['GET'])
@token_required
def get_appointment(current_user, appointment_id):
    """Get single appointment by ID - All authenticated users can view"""
    try:
        query = """
            SELECT a.appointment_id, a.patient_id, a.doctor_id, 
                   a.appointment_date, a.appointment_time, a.status, 
                   a.reason, a.notes, a.created_at, a.updated_at,
                   p.first_name || ' ' || p.last_name as patient_name,
                   u.username as doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            LEFT JOIN users u ON a.doctor_id = u.user_id
            WHERE a.appointment_id = %s
        """
        appointment = execute_query(query, (appointment_id,))
        
        if not appointment:
            return jsonify({
                'success': False,
                'message': 'Appointment not found'
            }), 404
        
        return jsonify({
            'success': True,
            'appointment': appointment[0]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching appointment: {str(e)}'
        }), 500

@appointments_bp.route('/patient/<int:patient_id>', methods=['GET'])
@token_required
def get_patient_appointments(current_user, patient_id):
    """Get all appointments for a specific patient"""
    try:
        query = """
            SELECT a.appointment_id, a.patient_id, a.doctor_id, 
                   a.appointment_date, a.appointment_time, a.status, 
                   a.reason, a.notes, a.created_at,
                   u.username as doctor_name
            FROM appointments a
            LEFT JOIN users u ON a.doctor_id = u.user_id
            WHERE a.patient_id = %s
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        """
        appointments = execute_query(query, (patient_id,))
        
        return jsonify({
            'success': True,
            'appointments': appointments
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching patient appointments: {str(e)}'
        }), 500

@appointments_bp.route('/', methods=['POST'])
@role_required(['Admin', 'Receptionist'])
def create_appointment(current_user):
    """Create new appointment - Admin and Receptionist only (per matrix)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['patient_id', 'appointment_date', 'appointment_time']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Convert IDs to integers
        try:
            patient_id = int(data['patient_id'])
            doctor_id = int(data['doctor_id']) if data.get('doctor_id') else None
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'message': 'Invalid patient_id or doctor_id format'
            }), 400
        
        query = """
            INSERT INTO appointments (patient_id, doctor_id, appointment_date, 
                                     appointment_time, status, reason, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING appointment_id
        """
        
        result = execute_query(query, (
            patient_id,
            doctor_id,
            data['appointment_date'],
            data['appointment_time'],
            data.get('status', 'Scheduled'),
            data.get('reason'),
            data.get('notes')
        ), fetch=True)
        
        # Log the action in audit log
        audit_query = """
            INSERT INTO auditlog (event_type, table_name, username, status, details)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(audit_query, (
            'INSERT',
            'appointments',
            current_user['username'],
            'success',
            f"Created appointment for patient ID: {patient_id}"
        ), fetch=False)
        
        return jsonify({
            'success': True,
            'message': 'Appointment created successfully',
            'appointment_id': result[0]['appointment_id']
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error creating appointment: {str(e)}'
        }), 500

@appointments_bp.route('/<int:appointment_id>', methods=['PUT'])
@role_required(['Admin', 'Receptionist'])
def update_appointment(current_user, appointment_id):
    """Update appointment - Admin and Receptionist only (per matrix)"""
    try:
        data = request.get_json()
        
        # Build dynamic UPDATE query
        update_fields = []
        values = []
        
        allowed_fields = ['patient_id', 'doctor_id', 'appointment_date', 
                         'appointment_time', 'status', 'reason', 'notes']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])
        
        if not update_fields:
            return jsonify({
                'success': False,
                'message': 'No fields to update'
            }), 400
        
        values.append(appointment_id)
        
        query = f"""
            UPDATE appointments
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE appointment_id = %s
        """
        
        execute_query(query, tuple(values), fetch=False)
        
        # Log the action in audit log
        audit_query = """
            INSERT INTO auditlog (event_type, table_name, username, status, details)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(audit_query, (
            'UPDATE',
            'appointments',
            current_user['username'],
            'success',
            f"Updated appointment ID: {appointment_id}"
        ), fetch=False)
        
        return jsonify({
            'success': True,
            'message': 'Appointment updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error updating appointment: {str(e)}'
        }), 500

@appointments_bp.route('/<int:appointment_id>', methods=['DELETE'])
@role_required(['Admin', 'Receptionist'])
def delete_appointment(current_user, appointment_id):
    """Delete appointment - Admin and Receptionist only (per matrix)"""
    try:
        # Check if appointment exists
        check_query = """
            SELECT a.appointment_id, p.first_name || ' ' || p.last_name as patient_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            WHERE a.appointment_id = %s
        """
        appointment = execute_query(check_query, (appointment_id,))
        
        if not appointment:
            return jsonify({
                'success': False,
                'message': 'Appointment not found'
            }), 404
        
        # Delete appointment
        query = "DELETE FROM appointments WHERE appointment_id = %s"
        execute_query(query, (appointment_id,), fetch=False)
        
        # Log the action in audit log
        audit_query = """
            INSERT INTO auditlog (event_type, table_name, username, status, details)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(audit_query, (
            'DELETE',
            'appointments',
            current_user['username'],
            'success',
            f"Deleted appointment for patient: {appointment[0]['patient_name']}"
        ), fetch=False)
        
        return jsonify({
            'success': True,
            'message': 'Appointment deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error deleting appointment: {str(e)}'
        }), 500

@appointments_bp.route('/stats', methods=['GET'])
@token_required
def get_appointment_stats(current_user):
    """Get appointment statistics"""
    try:
        # Count by status
        status_query = """
            SELECT status, COUNT(*) as count
            FROM appointments
            GROUP BY status
        """
        status_stats = execute_query(status_query)
        
        # Count today's appointments
        today_query = """
            SELECT COUNT(*) as count
            FROM appointments
            WHERE appointment_date = CURRENT_DATE
        """
        today_count = execute_query(today_query)
        
        # Count upcoming appointments
        upcoming_query = """
            SELECT COUNT(*) as count
            FROM appointments
            WHERE appointment_date >= CURRENT_DATE
            AND status != 'Cancelled'
        """
        upcoming_count = execute_query(upcoming_query)
        
        return jsonify({
            'success': True,
            'stats': {
                'by_status': status_stats,
                'today': today_count[0]['count'] if today_count else 0,
                'upcoming': upcoming_count[0]['count'] if upcoming_count else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching appointment stats: {str(e)}'
        }), 500
