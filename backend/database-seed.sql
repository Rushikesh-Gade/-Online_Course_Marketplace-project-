-- ================================================
-- LearnHub Sample Data (Run after database.sql)
-- ================================================

USE learnhub;

-- Sample Instructor
INSERT INTO users (first_name, last_name, email, password, role, is_verified, is_active)
VALUES ('Rishi', 'Patil', 'rishi@learnhub.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh', 'instructor', TRUE, TRUE);

-- Sample Courses (instructor_id = 2 which is Rishi)
INSERT INTO courses (title, description, instructor_id, category_id, price, difficulty, language, status, total_lectures, total_hours, avg_rating, total_reviews, total_students) VALUES
('Complete JavaScript Bootcamp 2024', 'Master JavaScript from scratch to advanced — including ES6+, DOM, APIs, and real-world projects.', 2, 1, 499.00, 'beginner', 'English', 'published', 320, 42.0, 4.80, 2340, 12500),
('UI/UX Design Masterclass with Figma', 'Learn UI/UX design from scratch using Figma. Build beautiful interfaces and improve user experience.', 2, 2, 599.00, 'intermediate', 'English', 'published', 210, 28.0, 4.90, 1820, 8300),
('AWS Cloud Practitioner — Zero to Hero', 'Prepare for AWS Cloud Practitioner certification. Learn cloud concepts, AWS services, and architecture.', 2, 3, 799.00, 'beginner', 'English', 'published', 280, 35.0, 4.70, 3100, 15200),
('Machine Learning with Python', 'Complete guide to machine learning using Python, scikit-learn, and TensorFlow.', 2, 4, 699.00, 'intermediate', 'English', 'published', 410, 50.0, 4.90, 980, 7800),
('Ethical Hacking & Penetration Testing', 'Learn ethical hacking, penetration testing, and cybersecurity from scratch.', 2, 5, 899.00, 'advanced', 'English', 'published', 295, 38.0, 4.60, 1540, 9200),
('Data Science & Analytics with Python', 'Learn data analysis, visualization, and statistics using Python, Pandas, and Matplotlib.', 2, 7, 0.00, 'beginner', 'English', 'published', 360, 45.0, 4.40, 2100, 18000),
('Node.js & Express Backend Development', 'Build REST APIs and backend applications with Node.js, Express, and MySQL.', 2, 1, 649.00, 'intermediate', 'English', 'published', 240, 32.0, 4.75, 1200, 6500),
('React.js Complete Course 2024', 'Master React.js including Hooks, Context API, Redux, and build real projects.', 2, 1, 549.00, 'intermediate', 'English', 'published', 290, 38.0, 4.85, 1890, 11200);

-- Sample Sections for first course
INSERT INTO sections (course_id, title, position) VALUES
(1, 'Getting Started with JavaScript', 1),
(1, 'Functions and Scope', 2),
(1, 'DOM Manipulation', 3),
(1, 'Async JavaScript & APIs', 4);

-- Sample Lessons for section 1
INSERT INTO lessons (section_id, title, type, duration, position, is_preview) VALUES
(1, 'Introduction to JavaScript', 'video', 330, 1, TRUE),
(1, 'Setting up VS Code', 'video', 495, 2, FALSE),
(1, 'Your First JavaScript Program', 'video', 720, 3, TRUE),
(1, 'Variables and Data Types', 'video', 1125, 4, FALSE),
(1, 'Operators and Expressions', 'video', 920, 5, FALSE);

-- Sample Lessons for section 2
INSERT INTO lessons (section_id, title, type, duration, position, is_preview) VALUES
(2, 'Defining Functions', 'video', 840, 1, FALSE),
(2, 'Arrow Functions', 'video', 630, 2, FALSE),
(2, 'Scope and Closures', 'video', 1200, 3, FALSE);
