-- IIC Website Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admins Table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    venue VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    registration_deadline DATE NOT NULL,
    banner_image_url VARCHAR(500) NOT NULL,
    registration_open BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Event Registrations Table
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed',
    qr_code_url VARCHAR(500),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Innovation Ideas Table
CREATE TABLE innovation_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    pitch_deck_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'Submitted',
    admin_comments TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Resources Table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Photos Gallery Table
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    event_name VARCHAR(200),
    category VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    report_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(200),
    year INTEGER NOT NULL,
    pdf_url VARCHAR(500) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Members Table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(10),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15),
    linkedin_url VARCHAR(500),
    bio TEXT,
    is_faculty BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Join Applications Table
CREATE TABLE join_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    reason TEXT NOT NULL,
    experience TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Queries / Contact Form Table
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'Pending',
    admin_response TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Notices Table
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'Normal',
    expires_on DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Settings Configuration (Singleton)
CREATE TABLE site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    college_name VARCHAR(200) NOT NULL,
    iic_email VARCHAR(255) NOT NULL,
    iic_phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    linkedin_url VARCHAR(500),
    instagram_url VARCHAR(500),
    twitter_url VARCHAR(500),
    youtube_url VARCHAR(500),
    facebook_url VARCHAR(500),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Settings
INSERT INTO site_settings (id, college_name, iic_email, iic_phone, address) 
VALUES (1, 'Your College Name', 'innovahub@college.edu.in', '+91-XXXXXXXXXX', 'Innovation Cell Office, Room 101, College Campus');

-- Default Admin (Password is "admin123" encrypted with bcrypt)
INSERT INTO admins (email, password_hash, name) 
VALUES ('admin@innovahub.com', '$2b$10$O03VlC/RAsvKjN2a/YjX5uPTrRMgPjVX/EogjNTrb25N1oH5e8uG.', 'Super Admin');
