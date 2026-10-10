-- =====================================================
-- CityPulse AI - Seed Data
-- =====================================================
-- Sample data for development and demo purposes
-- Execute this after running schema.sql
-- =====================================================

-- =====================================================
-- BUSES
-- =====================================================
INSERT INTO buses (bus_code, route_name, status, last_latitude, last_longitude, last_seen_at) VALUES
    ('DL-1234', 'Route 52', 'online', 28.6139, 77.2090, NOW() - INTERVAL '5 minutes'),
    ('DL-5678', 'Route 34', 'online', 28.7041, 77.1025, NOW() - INTERVAL '3 minutes'),
    ('UP-9012', 'Route 18', 'online', 28.5355, 77.3910, NOW() - INTERVAL '2 minutes'),
    ('UP-3456', 'Route 76', 'offline', 28.6692, 77.4538, NOW() - INTERVAL '45 minutes'),
    ('HR-7890', 'Route 91', 'maintenance', 28.4595, 77.0266, NOW() - INTERVAL '2 hours'),
    ('DL-2468', 'Route 45', 'online', 28.6500, 77.2167, NOW() - INTERVAL '1 minute'),
    ('DL-1357', 'Route 89', 'online', 28.6289, 77.2065, NOW() - INTERVAL '8 minutes'),
    ('UP-2468', 'Route 22', 'offline', 28.5706, 77.3272, NOW() - INTERVAL '1 hour')
ON CONFLICT (bus_code) DO UPDATE SET
    last_latitude = EXCLUDED.last_latitude,
    last_longitude = EXCLUDED.last_longitude,
    last_seen_at = EXCLUDED.last_seen_at,
    status = EXCLUDED.status;

-- =====================================================
-- INCIDENTS
-- =====================================================
INSERT INTO incidents (
    event_type, severity, confidence, latitude, longitude, 
    detected_at, bus_id, verification_status, description
) 
SELECT
    'pothole', 'high', 89.5, 28.6139, 77.2090,
    NOW() - INTERVAL '15 minutes',
    (SELECT id FROM buses WHERE bus_code = 'DL-1234'),
    'detected',
    'Large pothole detected on main road near Connaught Place'
UNION ALL SELECT
    'crack', 'medium', 76.3, 28.7041, 77.1025,
    NOW() - INTERVAL '45 minutes',
    (SELECT id FROM buses WHERE bus_code = 'DL-5678'),
    'verified',
    'Road surface crack observed near GTB Nagar metro station'
UNION ALL SELECT
    'congestion', 'critical', 92.8, 28.5355, 77.3910,
    NOW() - INTERVAL '2 hours',
    (SELECT id FROM buses WHERE bus_code = 'UP-9012'),
    'in_progress',
    'Heavy traffic congestion at Noida Sector 18 intersection'
UNION ALL SELECT
    'debris', 'low', 84.2, 28.6692, 77.4538,
    NOW() - INTERVAL '4 hours',
    (SELECT id FROM buses WHERE bus_code = 'UP-3456'),
    'resolved',
    'Debris cleared from roadside in Ghaziabad'
UNION ALL SELECT
    'pothole', 'critical', 95.1, 28.4595, 77.0266,
    NOW() - INTERVAL '5 minutes',
    (SELECT id FROM buses WHERE bus_code = 'HR-7890'),
    'detected',
    'Deep pothole causing traffic issues in Gurugram'
UNION ALL SELECT
    'flooding', 'high', 88.7, 28.6500, 77.2167,
    NOW() - INTERVAL '30 minutes',
    (SELECT id FROM buses WHERE bus_code = 'DL-2468'),
    'verified',
    'Water accumulation on road after recent rain'
UNION ALL SELECT
    'crack', 'low', 72.4, 28.6289, 77.2065,
    NOW() - INTERVAL '1 hour',
    (SELECT id FROM buses WHERE bus_code = 'DL-1357'),
    'detected',
    'Minor surface crack detected'
UNION ALL SELECT
    'pothole', 'medium', 81.9, 28.5706, 77.3272,
    NOW() - INTERVAL '3 hours',
    (SELECT id FROM buses WHERE bus_code = 'UP-2468'),
    'assigned',
    'Medium-sized pothole reported in residential area'
UNION ALL SELECT
    'accident', 'critical', 94.5, 28.6139, 77.2095,
    NOW() - INTERVAL '10 minutes',
    (SELECT id FROM buses WHERE bus_code = 'DL-1234'),
    'detected',
    'Possible vehicle accident detected - requires immediate attention'
UNION ALL SELECT
    'congestion', 'medium', 79.3, 28.7041, 77.1030,
    NOW() - INTERVAL '20 minutes',
    (SELECT id FROM buses WHERE bus_code = 'DL-5678'),
    'detected',
    'Moderate traffic buildup during rush hour';

-- =====================================================
-- WORK ORDERS
-- =====================================================
-- Create work orders for verified/assigned incidents
INSERT INTO work_orders (
    incident_id, department_id, assigned_to, status, priority, resolution_notes
)
SELECT
    i.id,
    (SELECT id FROM departments WHERE name = 'Roads & Infrastructure'),
    'Road Repair Team A',
    'in_progress',
    'high',
    'Repair crew dispatched to location'
FROM incidents i
WHERE i.verification_status = 'in_progress'
LIMIT 1;

INSERT INTO work_orders (
    incident_id, department_id, assigned_to, status, priority, completed_at, resolution_notes
)
SELECT
    i.id,
    (SELECT id FROM departments WHERE name = 'Public Works'),
    'Cleanup Crew B',
    'completed',
    'low',
    NOW() - INTERVAL '30 minutes',
    'Debris removed and area cleaned successfully'
FROM incidents i
WHERE i.verification_status = 'resolved'
LIMIT 1;

INSERT INTO work_orders (
    incident_id, department_id, status, priority
)
SELECT
    i.id,
    (SELECT id FROM departments WHERE name = 'Roads & Infrastructure'),
    'assigned',
    'medium'
FROM incidents i
WHERE i.verification_status = 'assigned'
LIMIT 1;

-- =====================================================
-- INCIDENT OBSERVATIONS
-- =====================================================
-- Add additional observations for some incidents (multiple buses detecting same issue)
INSERT INTO incident_observations (
    incident_id, bus_id, observed_at, latitude, longitude, confidence
)
SELECT
    i.id,
    (SELECT id FROM buses WHERE bus_code = 'DL-2468'),
    NOW() - INTERVAL '10 minutes',
    28.6140, 77.2091,
    87.3
FROM incidents i
WHERE i.event_type = 'pothole' AND i.severity = 'high'
LIMIT 1;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to verify seed data was inserted:
--
-- SELECT COUNT(*) as bus_count FROM buses;
-- SELECT COUNT(*) as incident_count FROM incidents;
-- SELECT COUNT(*) as work_order_count FROM work_orders;
-- SELECT COUNT(*) as observation_count FROM incident_observations;
-- 
-- SELECT event_type, severity, verification_status, COUNT(*) 
-- FROM incidents 
-- GROUP BY event_type, severity, verification_status
-- ORDER BY event_type, severity;
-- =====================================================
