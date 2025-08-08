-- Corticon Studio Database Initialization Script
-- This script creates all the necessary data for local development
-- Run this script on your PostgreSQL database after running `npm run db:push`

-- Clear existing data (optional - uncomment if you want to start fresh)
-- DELETE FROM assets;
-- DELETE FROM projects;
-- DELETE FROM users;

-- Insert test user
INSERT INTO users (id, email, first_name, last_name, profile_image_url, created_at, updated_at, theme, language)
VALUES (
           'test-user-123',
           'demo@example.com',
           'Demo',
           'User',
           'https://avatars.githubusercontent.com/u/1?v=4',
           '2025-07-21 18:10:35.468097',
           '2025-08-08 00:42:08.745',
           'dark',
           'en'
       ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    profile_image_url = EXCLUDED.profile_image_url,
    theme = EXCLUDED.theme,
    language = EXCLUDED.language,
    updated_at = EXCLUDED.updated_at;

-- Insert demo projects
INSERT INTO projects (id, name, description, owner_id, created_at, updated_at) VALUES
                                                                                   (
                                                                                       1,
                                                                                       'Demo Corticon Project',
                                                                                       'A demonstration project showing vocabulary, rulesheets, ruleflow, and rulestest assets',
                                                                                       'test-user-123',
                                                                                       '2025-07-21 18:10:40.531694',
                                                                                       '2025-07-21 18:10:40.531694'
                                                                                   ),
                                                                                   (
                                                                                       2,
                                                                                       'Project 1',
                                                                                       NULL,
                                                                                       'test-user-123',
                                                                                       '2025-07-22 15:19:19.118153',
                                                                                       '2025-07-22 15:19:19.118153'
                                                                                   ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    owner_id = EXCLUDED.owner_id,
    updated_at = EXCLUDED.updated_at;

-- Insert demo assets for Project 1
INSERT INTO assets (id, name, type, project_id, created_at, updated_at, content) VALUES
                                                                                     (1, 'Policy', 'vocabulary', 1, '2025-07-21 18:10:53.845772', '2025-07-21 18:10:53.845772', '{"entities": [], "relationships": []}'),
                                                                                     (2, 'PremiumCalculation', 'rulesheets', 1, '2025-07-21 18:10:53.845772', '2025-07-21 18:10:53.845772', '{"rules": [], "conditions": []}'),
                                                                                     (3, 'PolicyWorkflow', 'ruleflow', 1, '2025-07-21 18:10:53.845772', '2025-07-21 18:10:53.845772', '{"nodes": [], "connections": []}'),
                                                                                     (4, 'PolicyTests', 'rulestest', 1, '2025-07-21 18:10:53.845772', '2025-07-21 18:10:53.845772', '{"tests": [], "results": []}')
    ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
                            type = EXCLUDED.type,
                            project_id = EXCLUDED.project_id,
                            content = EXCLUDED.content,
                            updated_at = EXCLUDED.updated_at;

-- Insert test rulesheets for Project 2 (used in Test Sequential Flow)
INSERT INTO assets (id, name, type, project_id, created_at, updated_at, content) VALUES
                                                                                     (18, 'testRS 1', 'rulesheets', 2, '2025-08-04 22:22:17.730136', '2025-08-04 22:22:17.730136', '{"rules": [{"id": 1, "condition": "input.value > 0", "action": "output.result = input.value * 1.1"}]}'),
                                                                                     (19, 'testRS 2', 'rulesheets', 2, '2025-08-04 22:22:17.730136', '2025-08-04 22:22:17.730136', '{"rules": [{"id": 1, "condition": "input.value > 10", "action": "output.result = input.value * 1.2"}]}'),
                                                                                     (20, 'testRS 3', 'rulesheets', 2, '2025-08-04 22:22:17.730136', '2025-08-04 22:22:17.730136', '{"rules": [{"id": 1, "condition": "input.value > 20", "action": "output.result = input.value * 1.3"}]}'),
                                                                                     (21, 'testRS 4', 'rulesheets', 2, '2025-08-04 22:22:17.730136', '2025-08-04 22:22:17.730136', '{"rules": [{"id": 1, "condition": "input.value > 30", "action": "output.result = input.value * 1.4"}]}'),
                                                                                     (22, 'testRS 5', 'rulesheets', 2, '2025-08-04 22:22:17.730136', '2025-08-04 22:22:17.730136', '{"rules": [{"id": 1, "condition": "input.value > 40", "action": "output.result = input.value * 1.5"}]}'),
                                                                                     (23, 'testRS 6', 'rulesheets', 2, '2025-08-04 22:22:17.730136', '2025-08-04 22:22:17.730136', '{"rules": [{"id": 1, "condition": "input.value > 50", "action": "output.result = input.value * 1.6"}]}'),
                                                                                     (24, 'testRS 7', 'rulesheets', 2, '2025-08-04 22:22:17.730136', '2025-08-04 22:22:17.730136', '{"rules": [{"id": 1, "condition": "input.value > 60", "action": "output.result = input.value * 1.7"}]}'),
                                                                                     (25, 'testRS 8', 'rulesheets', 2, '2025-08-04 22:22:17.730136', '2025-08-04 22:22:17.730136', '{"rules": [{"id": 1, "condition": "input.value > 70", "action": "output.result = input.value * 1.8"}]}'),
                                                                                     (26, 'testRS 9', 'rulesheets', 2, '2025-08-04 22:22:17.730136', '2025-08-04 22:22:17.730136', '{"rules": [{"id": 1, "condition": "input.value > 80", "action": "output.result = input.value * 1.9"}]}'),
                                                                                     (27, 'testRS 10', 'rulesheets', 2, '2025-08-04 22:22:17.730136', '2025-08-04 22:22:17.730136', '{"rules": [{"id": 1, "condition": "input.value > 90", "action": "output.result = input.value * 2.0"}]}')
    ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
                            type = EXCLUDED.type,
                            project_id = EXCLUDED.project_id,
                            content = EXCLUDED.content,
                            updated_at = EXCLUDED.updated_at;

-- Update the sequence for projects table to continue from the highest ID
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects) + 1, false);

-- Insert the Test Sequential Flow ruleflow with complete data
INSERT INTO assets (
    id,
    name,
    type,
    project_id,
    created_at,
    updated_at,
    content,
    structural_data,
    ui_data
) VALUES (
             35,
             'Test Sequential Flow',
             'ruleflow',
             2,
             '2025-08-04 22:35:47.317252',
             '2025-08-04 22:35:47.317252',
             '{}',
             '{"nodes": [{"id": "testRS1", "name": "testRS 1", "type": "rulesheets", "fontSize": 12, "metadata": {}}, {"id": "testRS2", "name": "testRS 2", "type": "rulesheets", "fontSize": 12, "metadata": {}}, {"id": "testRS3", "name": "testRS 3", "type": "rulesheets", "fontSize": 12, "metadata": {}}, {"id": "testRS4", "name": "testRS 4", "type": "rulesheets", "fontSize": 12, "metadata": {}}, {"id": "testRS5", "name": "testRS 5", "type": "rulesheets", "fontSize": 12, "metadata": {}}, {"id": "testRS6", "name": "testRS 6", "type": "rulesheets", "fontSize": 12, "metadata": {}}, {"id": "testRS7", "name": "testRS 7", "type": "rulesheets", "fontSize": 12, "metadata": {}}, {"id": "testRS8", "name": "testRS 8", "type": "rulesheets", "fontSize": 12, "metadata": {}}, {"id": "testRS9", "name": "testRS 9", "type": "rulesheets", "fontSize": 12, "metadata": {}}, {"id": "testRS10", "name": "testRS 10", "type": "rulesheets", "fontSize": 12, "metadata": {}}, {"id": "node-13-1754348398554", "name": "subflow1", "type": "ruleflow", "fontSize": 12, "metadata": {}}, {"id": "text-1754493444298", "name": "Text Note", "text": "This is my decision service", "type": "text", "fontSize": 22, "metadata": {}}], "version": "1.0", "metadata": {}, "connections": [{"id": "conn1to2", "metadata": {}, "toNodeId": "testRS2", "fromNodeId": "testRS1"}, {"id": "conn2to3", "metadata": {}, "toNodeId": "testRS3", "fromNodeId": "testRS2"}, {"id": "conn3to4", "metadata": {}, "toNodeId": "testRS4", "fromNodeId": "testRS3"}, {"id": "conn4to5", "metadata": {}, "toNodeId": "testRS5", "fromNodeId": "testRS4"}, {"id": "conn5to6", "metadata": {}, "toNodeId": "testRS6", "fromNodeId": "testRS5"}, {"id": "conn6to7", "metadata": {}, "toNodeId": "testRS7", "fromNodeId": "testRS6"}, {"id": "conn7to8", "metadata": {}, "toNodeId": "testRS8", "fromNodeId": "testRS7"}, {"id": "conn8to9", "metadata": {}, "toNodeId": "testRS9", "fromNodeId": "testRS8"}, {"id": "conn9to10", "metadata": {}, "toNodeId": "testRS10", "fromNodeId": "testRS9"}, {"id": "conn-testRS10-node-13-1754348398554-1754348403388", "metadata": {}, "toNodeId": "node-13-1754348398554", "fromNodeId": "testRS10"}]}',
             '{"nodes": [{"id": "testRS1", "size": {"width": 150, "height": 50}, "style": {}, "position": {"x": 129, "y": 39}, "isVisible": true}, {"id": "testRS2", "size": {"width": 150, "height": 50}, "style": {}, "position": {"x": 225, "y": 190}, "isVisible": true}, {"id": "testRS3", "size": {"width": 150, "height": 50}, "style": {}, "position": {"x": 500, "y": 200}, "isVisible": true}, {"id": "testRS4", "size": {"width": 150, "height": 50}, "style": {}, "position": {"x": 700, "y": 200}, "isVisible": true}, {"id": "testRS5", "size": {"width": 150, "height": 50}, "style": {}, "position": {"x": 900, "y": 200}, "isVisible": true}, {"id": "testRS6", "size": {"width": 150, "height": 50}, "style": {}, "position": {"x": 900, "y": 350}, "isVisible": true}, {"id": "testRS7", "size": {"width": 150, "height": 50}, "style": {}, "position": {"x": 700, "y": 350}, "isVisible": true}, {"id": "testRS8", "size": {"width": 150, "height": 50}, "style": {}, "position": {"x": 500, "y": 350}, "isVisible": true}, {"id": "testRS9", "size": {"width": 150, "height": 50}, "style": {}, "position": {"x": 300, "y": 350}, "isVisible": true}, {"id": "testRS10", "size": {"width": 150, "height": 50}, "style": {}, "position": {"x": 100, "y": 350}, "isVisible": true}, {"id": "node-13-1754348398554", "size": {"width": 180, "height": 60}, "style": {}, "position": {"x": 144.81416844534775, "y": 490.1723631787953}, "isVisible": true}, {"id": "text-1754493444298", "size": {"width": 325.2473666984978, "height": 71.95378595457208}, "style": {}, "position": {"x": 374.38696562262396, "y": 46.617256079058606}, "isVisible": true}], "canvas": {"panX": 0, "panY": 0, "size": {"width": 1200, "height": 600}, "zoom": 0.8175602580091552, "gridSize": 20, "viewport": {"scrollX": 0, "scrollY": 0}}, "version": "1.0", "connections": [{"id": "conn1to2", "style": {}, "toPoint": {"x": 284.10596026490066, "y": 190}, "fromPoint": {"x": 219.89403973509934, "y": 89}, "isVisible": true}, {"id": "conn2to3", "style": {}, "toPoint": {"x": 500, "y": 222.27272727272728}, "fromPoint": {"x": 375, "y": 217.72727272727272}, "isVisible": true}, {"id": "conn3to4", "style": {}, "toPoint": {"x": 700, "y": 225}, "fromPoint": {"x": 650, "y": 225}, "isVisible": true}, {"id": "conn4to5", "style": {}, "toPoint": {"x": 900, "y": 225}, "fromPoint": {"x": 850, "y": 225}, "isVisible": true}, {"id": "conn5to6", "style": {}, "toPoint": {"x": 975, "y": 350}, "fromPoint": {"x": 975, "y": 250}, "isVisible": true}, {"id": "conn6to7", "style": {}, "toPoint": {"x": 850, "y": 375}, "fromPoint": {"x": 900, "y": 375}, "isVisible": true}, {"id": "conn7to8", "style": {}, "toPoint": {"x": 650, "y": 375}, "fromPoint": {"x": 700, "y": 375}, "isVisible": true}, {"id": "conn8to9", "style": {}, "toPoint": {"x": 450, "y": 375}, "fromPoint": {"x": 500, "y": 375}, "isVisible": true}, {"id": "conn9to10", "style": {}, "toPoint": {"x": 250, "y": 375}, "fromPoint": {"x": 300, "y": 375}, "isVisible": true}, {"id": "conn-testRS10-node-13-1754348398554-1754348403388", "style": {}, "toPoint": {"x": 222.45351649983655, "y": 490.1723631787953}, "fromPoint": {"x": 185.300543287926, "y": 400}, "isVisible": true}]}'
         ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    project_id = EXCLUDED.project_id,
    content = EXCLUDED.content,
    structural_data = EXCLUDED.structural_data,
    ui_data = EXCLUDED.ui_data,
    updated_at = EXCLUDED.updated_at;

-- Update the sequence for assets table to continue from the highest ID
SELECT setval('assets_id_seq', (SELECT MAX(id) FROM assets) + 1, false);

-- Display confirmation
SELECT 'Database initialization completed successfully!' as status;
SELECT 'Users created: ' || COUNT(*) as user_count FROM users WHERE id = 'test-user-123';
SELECT 'Projects created: ' || COUNT(*) as project_count FROM projects;
SELECT 'Assets created: ' || COUNT(*) as asset_count FROM assets;

-- Show the test user and projects for verification
SELECT 'Test User:' as section, id, email, first_name, last_name FROM users WHERE id = 'test-user-123';
SELECT 'Projects:' as section, id, name, description FROM projects ORDER BY id;
SELECT 'Sample Assets:' as section, id, name, type, project_id FROM assets WHERE project_id IN (1, 2) ORDER BY project_id, id;
