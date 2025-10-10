CREATE TABLE Roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL  -- e.g., 'Doctor', 'Nurse', 'Receptionist'
);

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),  -- Không dùng plain text!
    role_id INTEGER REFERENCES Roles(role_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Patients (
    patient_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES Users(user_id),  -- Audit: Ai tạo
    updated_by INTEGER REFERENCES Users(user_id)   -- Audit: Ai cập nhật
);

CREATE TABLE Appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES Patients(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES Users(user_id),  -- Giả sử doctor là user
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled',  -- e.g., 'Scheduled', 'Completed'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES Users(user_id),
    updated_by INTEGER REFERENCES Users(user_id)
);

CREATE TABLE MedicalRecords (
    record_id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES Patients(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES Users(user_id),
    diagnosis TEXT,
    treatment_notes TEXT,
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES Users(user_id),
    updated_by INTEGER REFERENCES Users(user_id)
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON Patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON Appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicalrecords_updated_at BEFORE UPDATE ON MedicalRecords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

