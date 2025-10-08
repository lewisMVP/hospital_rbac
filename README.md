# Hospital RBAC System

## Overview
This repository implements a Role-Based Access Control (RBAC) model for a hospital management system using PostgreSQL. It includes database schemas, role definitions, auditing mechanisms, and test scripts to ensure secure and compliant access to sensitive medical data.

## Features
- **Database Schema**: Includes tables for managing Patients, MedicalRecords, Appointments, Roles, Users, and more.
- **RBAC Implementation**: Defines roles such as Admin, Doctor, Nurse, Receptionist, and Billing, each with specific permissions.
- **Auditing**: Tracks failed logins, permission changes, and unauthorized access attempts.
- **Test Scenarios**: Provides scripts to simulate real-world RBAC scenarios and audit functionality.
- **Documentation**: Offers detailed explanations and usage guides for scripts and configurations.

## File Structure
- `sql/`: SQL scripts for creating schemas, roles, permissions, audit logging, and triggers.
- `demo/`: Example scripts for testing RBAC functionalities and audit scenarios.
- `docs/`: Documentation files explaining the system setup, database design, and usage instructions.

## Usage
1. Set up a PostgreSQL database.
2. Run the SQL scripts in the `sql` folder to configure the database.
3. Assign roles and permissions using the relevant SQL scripts.
4. Enable auditing by executing the scripts in `sql/audit_permission.sql`.
5. Test RBAC and audit functionalities using scripts in the `demo` folder.

## Contributions
Feel free to contribute by opening issues or submitting pull requests.

## License
This project is open-source and available.
