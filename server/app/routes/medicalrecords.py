from flask import Blueprint, request, jsonify
from app.utils.database import execute_query
from app.utils.auth import token_required, role_required

medicalrecords_bp = Blueprint('medicalrecords', __name__)

@medicalrecords_bp.route('/', methods=['GET'])
@token_required
def get_medical_records(current_user):
    """Get all medical records - All authenticated users can view"""
    try:
        # All roles can SELECT medical records according to matrix
        query = """
            SELECT mr.record_id, mr.patient_id, mr.doctor_id, mr.diagnosis, 
                   mr.treatment, mr.prescription, mr.notes, mr.record_date,
                   mr.created_at, mr.updated_at,
                   p.first_name || ' ' || p.last_name as patient_name,
                   u.username as doctor_name
            FROM medicalrecords mr
            JOIN patients p ON mr.patient_id = p.patient_id
            LEFT JOIN users u ON mr.doctor_id = u.user_id
            ORDER BY mr.record_date DESC, mr.created_at DESC
        """
        records = execute_query(query)
        
        return jsonify({
            'success': True,
            'records': records
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching medical records: {str(e)}'
        }), 500

@medicalrecords_bp.route('/<int:record_id>', methods=['GET'])
@token_required
def get_medical_record(current_user, record_id):
    """Get single medical record by ID - All authenticated users can view"""
    try:
        query = """
            SELECT mr.record_id, mr.patient_id, mr.doctor_id, mr.diagnosis, 
                   mr.treatment, mr.prescription, mr.notes, mr.record_date,
                   mr.created_at, mr.updated_at,
                   p.first_name || ' ' || p.last_name as patient_name,
                   u.username as doctor_name
            FROM medicalrecords mr
            JOIN patients p ON mr.patient_id = p.patient_id
            LEFT JOIN users u ON mr.doctor_id = u.user_id
            WHERE mr.record_id = %s
        """
        record = execute_query(query, (record_id,))
        
        if not record:
            return jsonify({
                'success': False,
                'message': 'Medical record not found'
            }), 404
        
        return jsonify({
            'success': True,
            'record': record[0]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching medical record: {str(e)}'
        }), 500

@medicalrecords_bp.route('/patient/<int:patient_id>', methods=['GET'])
@token_required
def get_patient_records(current_user, patient_id):
    """Get all medical records for a specific patient"""
    try:
        query = """
            SELECT mr.record_id, mr.patient_id, mr.doctor_id, mr.diagnosis, 
                   mr.treatment, mr.prescription, mr.notes, mr.record_date,
                   mr.created_at, mr.updated_at,
                   u.username as doctor_name
            FROM medicalrecords mr
            LEFT JOIN users u ON mr.doctor_id = u.user_id
            WHERE mr.patient_id = %s
            ORDER BY mr.record_date DESC
        """
        records = execute_query(query, (patient_id,))
        
        return jsonify({
            'success': True,
            'records': records
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching patient records: {str(e)}'
        }), 500

@medicalrecords_bp.route('/', methods=['POST'])
@role_required(['Admin', 'Doctor'])
def create_medical_record(current_user):
    """Create new medical record - Admin and Doctor only (per matrix)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['patient_id', 'diagnosis', 'record_date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Set doctor_id to current user if they are a doctor
        doctor_id = data.get('doctor_id')
        if current_user['role_name'] == 'Doctor':
            doctor_id = current_user['user_id']
        
        # Convert IDs to integers
        try:
            patient_id = int(data['patient_id'])
            doctor_id = int(doctor_id) if doctor_id else None
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'message': 'Invalid patient_id or doctor_id format'
            }), 400
        
        query = """
            INSERT INTO medicalrecords (patient_id, doctor_id, diagnosis, 
                                       treatment, prescription, notes, record_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING record_id
        """
        
        result = execute_query(query, (
            patient_id,
            doctor_id,
            data['diagnosis'],
            data.get('treatment'),
            data.get('prescription'),
            data.get('notes'),
            data['record_date']
        ), fetch=True)
        
        # Log the action in audit log
        audit_query = """
            INSERT INTO auditlog (event_type, table_name, username, status, details)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(audit_query, (
            'INSERT',
            'medicalrecords',
            current_user['username'],
            'success',
            f"Created medical record for patient ID: {patient_id}"
        ), fetch=False)
        
        return jsonify({
            'success': True,
            'message': 'Medical record created successfully',
            'record_id': result[0]['record_id']
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error creating medical record: {str(e)}'
        }), 500

@medicalrecords_bp.route('/<int:record_id>', methods=['PUT'])
@role_required(['Admin', 'Doctor'])
def update_medical_record(current_user, record_id):
    """Update medical record - Admin and Doctor only (per matrix)"""
    try:
        data = request.get_json()
        
        # If user is Doctor, verify they own this record
        if current_user['role_name'] == 'Doctor':
            check_query = "SELECT doctor_id FROM medicalrecords WHERE record_id = %s"
            existing = execute_query(check_query, (record_id,))
            if not existing or existing[0]['doctor_id'] != current_user['user_id']:
                return jsonify({
                    'success': False,
                    'message': 'You can only update your own medical records'
                }), 403
        
        # Build dynamic UPDATE query
        update_fields = []
        values = []
        
        allowed_fields = ['diagnosis', 'treatment', 'prescription', 'notes', 'record_date']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])
        
        if not update_fields:
            return jsonify({
                'success': False,
                'message': 'No fields to update'
            }), 400
        
        values.append(record_id)
        
        query = f"""
            UPDATE medicalrecords
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE record_id = %s
        """
        
        execute_query(query, tuple(values), fetch=False)
        
        # Log the action in audit log
        audit_query = """
            INSERT INTO auditlog (event_type, table_name, username, status, details)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(audit_query, (
            'UPDATE',
            'medicalrecords',
            current_user['username'],
            'success',
            f"Updated medical record ID: {record_id}"
        ), fetch=False)
        
        return jsonify({
            'success': True,
            'message': 'Medical record updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error updating medical record: {str(e)}'
        }), 500

@medicalrecords_bp.route('/<int:record_id>', methods=['DELETE'])
@role_required(['Admin'])
def delete_medical_record(current_user, record_id):
    """Delete medical record - Admin only (per matrix)"""
    try:
        # Check if record exists
        check_query = """
            SELECT mr.record_id, p.first_name || ' ' || p.last_name as patient_name
            FROM medicalrecords mr
            JOIN patients p ON mr.patient_id = p.patient_id
            WHERE mr.record_id = %s
        """
        record = execute_query(check_query, (record_id,))
        
        if not record:
            return jsonify({
                'success': False,
                'message': 'Medical record not found'
            }), 404
        
        # Delete record
        query = "DELETE FROM medicalrecords WHERE record_id = %s"
        execute_query(query, (record_id,), fetch=False)
        
        # Log the action in audit log
        audit_query = """
            INSERT INTO auditlog (event_type, table_name, username, status, details)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(audit_query, (
            'DELETE',
            'medicalrecords',
            current_user['username'],
            'success',
            f"Deleted medical record for patient: {record[0]['patient_name']}"
        ), fetch=False)
        
        return jsonify({
            'success': True,
            'message': 'Medical record deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error deleting medical record: {str(e)}'
        }), 500
