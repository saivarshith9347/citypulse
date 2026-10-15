-- =====================================================
-- CityPulse AI - Sample Data Seed
-- =====================================================
-- This file populates the database with sample data for testing
-- Run this AFTER executing schema.sql
-- =====================================================

-- =====================================================
-- SEED BUSES
-- =====================================================
INSERT INTO buses (bus_code, route_name, status, last_latitude, last_longitude, last_seen_at) VALUES
    ('DL-1234', 'Route 52', 'online', 28.6139, 77.2090, NOW() - INTERVAL '5 minutes'),
    ('DL-5678', 'Route 34', 'online', 28.7041, 77.1025, NOW() - INTERVAL '10 minutes'),
    ('UP-9012', 'Route 18', 'online', 28.5355, 77.3910, NOW() - INTERVAL '2 minutes'),
    ('UP-3456', 'Route 76', 'offline', 28.6692, 77.4538, NOW() - INTERVAL '2 hours'),
    ('HR-7890', 'Route 91', 'maintenance', 28.4595, 77.0266, NOW() - INTERVAL '5 hours'),
    ('DL-2468', 'Route 45', 'online', 28.6500, 77.2167, NOW() - INTERVAL '8 minutes')
ON CONFLICT (bus_code) DO NOTHING;

-- =====================================================
-- SEED INCIDENTS
-- =====================================================
INSERT INTO incidents (
    event_type, severity, confidence, latitude, longitude, 
    bus_id, verification_status, description, detected_at
)
SELECT 
    'pothole', 'high', 89.5, 28.6139, 77.2090,
    (SELECT id FROM buses WHERE bus_code = 'DL-1234'), 'detected',
    'Large pothole detected on main road',
    NOW() - INTERVAL '15 minutes'
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE latitude = 28.6139 AND longitude = 77.2090);

INSERT INTO incidents (
    event_type, severity, confidence, latitude, longitude, 
    bus_id, verification_status, description, detected_at
)
SELECT 
    'crack', 'medium', 76.3, 28.7041, 77.1025,
    (SELECT id FROM buses WHERE bus_code = 'DL-5678'), 'verified',
    'Road surface crack observed',
    NOW() - INTERVAL '45 minutes'
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE latitude = 28.7041 AND longitude = 77.1025);

INSERT INTO incidents (
    event_type, severity, confidence, latitude, longitude, 
    bus_id, verification_status, description, detected_at
)
SELECT 
    'congestion', 'critical', 92.1, 28.5355, 77.3910,
    (SELECT id FROM buses WHERE bus_code = 'UP-9012'), 'in_progress',
    'Heavy traffic congestion detected',
    NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE latitude = 28.5355 AND longitude = 77.3910);

INSERT INTO incidents (
    event_type, severity, confidence, latitude, longitude, 
    bus_id, verification_status, description, detected_at
)
SELECT 
    'debris', 'low', 84.2, 28.6692, 77.4538,
    (SELECT id FROM buses WHERE bus_code = 'UP-3456'), 'resolved',
    'Debris on roadside',
    NOW() - INTERVAL '4 hours'
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE latitude = 28.6692 AND longitude = 77.4538);

INSERT INTO incidents (
    event_type, severity, confidence, latitude, longitude, 
    bus_id, verification_status, description, detected_at
)
SELECT 
    'pothole', 'critical', 95.7, 28.4595, 77.0266,
    (SELECT id FROM buses WHERE bus_code = 'HR-7890'), 'detected',
    'Deep pothole causing traffic issues',
    NOW() - INTERVAL '5 minutes'
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE latitude = 28.4595 AND longitude = 77.0266);

INSERT INTO incidents (
    event_type, severity, confidence, latitude, longitude, 
    bus_id, verification_status, description, detected_at
)
SELECT 
    'flooding', 'high', 88.9, 28.6500, 77.2167,
    (SELECT id FROM buses WHERE bus_code = 'DL-2468'), 'verified',
    'Road flooding after rain',
    NOW() - INTERVAL '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE latitude = 28.6500 AND longitude = 77.2167);

-- =====================================================
-- SEED WORK ORDERS
-- =====================================================
-- Create work orders for verified/in-progress incidents
INSERT INTO work_orders (
    incident_id, department_id, status, priority, assigned_to
)
SELECT 
    i.id,
    (SELECT id FROM departments WHERE name = 'Roads & Infrastructure'),
    'in_progress',
    'high',
    'John Doe'
FROM incidents i
WHERE i.verification_status = 'in_progress'
    AND i.event_type = 'congestion'
    AND NOT EXISTS (SELECT 1 FROM work_orders WHERE incident_id = i.id)
LIMIT 1;

INSERT INTO work_orders (
    incident_id, department_id, status, priority, assigned_to, completed_at, resolution_notes
)
SELECT 
    i.id,
    (SELECT id FROM departments WHERE name = 'Public Works'),
    'completed',
    'low',
    'Jane Smith',
    NOW() - INTERVAL '30 minutes',
    'Debris cleared from roadside'
FROM incidents i
WHERE i.verification_status = 'resolved'
    AND i.event_type = 'debris'
    AND NOT EXISTS (SELECT 1 FROM work_orders WHERE incident_id = i.id)
LIMIT 1;

INSERT INTO work_orders (
    incident_id, department_id, status, priority
)
SELECT 
    i.id,
    (SELECT id FROM departments WHERE name = 'Roads & Infrastructure'),
    'pending',
    'high'
FROM incidents i
WHERE i.verification_status = 'verified'
    AND i.event_type = 'flooding'
    AND NOT EXISTS (SELECT 1 FROM work_orders WHERE incident_id = i.id)
LIMIT 1;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to verify the data was inserted:
-- SELECT COUNT(*) FROM buses;
-- SELECT COUNT(*) FROM incidents;
-- SELECT COUNT(*) FROM work_orders;
-- SELECT * FROM buses ORDER BY bus_code;
-- SELECT event_type, severity, verification_status FROM incidents;
-- =====================================================
