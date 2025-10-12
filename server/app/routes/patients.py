from flask import Blueprint, request, jsonify
from app.utils.database import execute_query
from app.utils.auth import token_required, role_required

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/', methods=['GET'])
@token_required
def get_patients(current_user):
    """Get all patients - All authenticated users can view"""
    try:
        # All roles can SELECT patients according to matrix
        query = """
            SELECT patient_id, first_name, last_name, date_of_birth, 
                   gender, phone, email, address, created_at, updated_at
            FROM patients
            ORDER BY created_at DESC
        """
        patients = execute_query(query)
        
        return jsonify({
            'success': True,
            'patients': patients
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching patients: {str(e)}'
        }), 500

@patients_bp.route('/<int:patient_id>', methods=['GET'])
@token_required
def get_patient(current_user, patient_id):
    """Get single patient by ID - All authenticated users can view"""
    try:
        query = """
            SELECT patient_id, first_name, last_name, date_of_birth, 
                   gender, phone, email, address, created_at, updated_at
            FROM patients
            WHERE patient_id = %s
        """
        patient = execute_query(query, (patient_id,))
        
        if not patient:
            return jsonify({
                'success': False,
                'message': 'Patient not found'
            }), 404
        
        return jsonify({
            'success': True,
            'patient': patient[0]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching patient: {str(e)}'
        }), 500

@patients_bp.route('/', methods=['POST'])
@role_required(['Admin', 'Receptionist'])
def create_patient(current_user):
    """Create new patient - Admin and Receptionist only (per matrix)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'date_of_birth', 'gender']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        query = """
            INSERT INTO patients (first_name, last_name, date_of_birth, gender, 
                                phone, email, address)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING patient_id
        """
        
        result = execute_query(query, (
            data['first_name'],
            data['last_name'],
            data['date_of_birth'],
            data['gender'],
            data.get('phone'),
            data.get('email'),
            data.get('address')
        ))
        
        # Log the action in audit log
        audit_query = """
            INSERT INTO auditlog (event_type, table_name, username, status, details)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(audit_query, (
            'INSERT',
            'patients',
            current_user['username'],
            'success',
            f"Created patient: {data['first_name']} {data['last_name']}"
        ), fetch=False)
        
        return jsonify({
            'success': True,
            'message': 'Patient created successfully',
            'patient_id': result[0]['patient_id']
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error creating patient: {str(e)}'
        }), 500

@patients_bp.route('/<int:patient_id>', methods=['PUT'])
@role_required(['Admin'])
def update_patient(current_user, patient_id):
    """Update patient - Admin only (per matrix)"""
    try:
        data = request.get_json()
        
        # Build dynamic UPDATE query based on provided fields
        update_fields = []
        values = []
        
        allowed_fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 
                         'phone', 'email', 'address']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])
        
        if not update_fields:
            return jsonify({
                'success': False,
                'message': 'No fields to update'
            }), 400
        
        values.append(patient_id)
        
        query = f"""
            UPDATE patients
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE patient_id = %s
        """
        
        execute_query(query, tuple(values), fetch=False)
        
        # Log the action in audit log
        audit_query = """
            INSERT INTO auditlog (event_type, table_name, username, status, details)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(audit_query, (
            'UPDATE',
            'patients',
            current_user['username'],
            'success',
            f"Updated patient ID: {patient_id}"
        ), fetch=False)
        
        return jsonify({
            'success': True,
            'message': 'Patient updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error updating patient: {str(e)}'
        }), 500

@patients_bp.route('/<int:patient_id>', methods=['DELETE'])
@role_required(['Admin'])
def delete_patient(current_user, patient_id):
    """Delete patient - Admin only (per matrix)"""
    try:
        # Check if patient exists
        check_query = "SELECT first_name, last_name FROM patients WHERE patient_id = %s"
        patient = execute_query(check_query, (patient_id,))
        
        if not patient:
            return jsonify({
                'success': False,
                'message': 'Patient not found'
            }), 404
        
        # Delete patient
        query = "DELETE FROM patients WHERE patient_id = %s"
        execute_query(query, (patient_id,), fetch=False)
        
        # Log the action in audit log
        audit_query = """
            INSERT INTO auditlog (event_type, table_name, username, status, details)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(audit_query, (
            'DELETE',
            'patients',
            current_user['username'],
            'success',
            f"Deleted patient: {patient[0]['first_name']} {patient[0]['last_name']}"
        ), fetch=False)
        
        return jsonify({
            'success': True,
            'message': 'Patient deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error deleting patient: {str(e)}'
        }), 500
