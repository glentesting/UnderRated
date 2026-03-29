-- Seed: 80 MOS/Rate risk profiles across all branches
-- Run in Supabase SQL Editor AFTER running schema.sql

INSERT INTO mos_risk_profiles (mos_code, mos_title, branch, high_risk_conditions, exposure_types, common_claims) VALUES

-- ═══════════════════════════════════════════
-- ARMY (30 codes)
-- ═══════════════════════════════════════════

('11B', 'Infantryman', 'Army',
 ARRAY['Tinnitus','Hearing loss','PTSD','Low back strain','Knee conditions','TBI','Flat feet','Sleep apnea'],
 ARRAY['blast','noise','combat','chemical','burn pit'],
 ARRAY['Tinnitus','PTSD','Low back strain','Bilateral knee condition','Hearing loss','Flat feet']),

('11C', 'Indirect Fire Infantryman', 'Army',
 ARRAY['Tinnitus','Hearing loss','PTSD','Low back strain','Shoulder conditions','TBI','Knee conditions'],
 ARRAY['blast','noise','combat','repetitive heavy lifting'],
 ARRAY['Tinnitus','Hearing loss','PTSD','Low back strain','Shoulder limitation','Knee condition']),

('12B', 'Combat Engineer', 'Army',
 ARRAY['Tinnitus','Hearing loss','TBI','PTSD','Low back strain','Knee conditions','Respiratory conditions','Skin conditions'],
 ARRAY['blast','noise','combat','chemical','asbestos','burn pit'],
 ARRAY['Tinnitus','Hearing loss','Low back strain','PTSD','TBI','Knee condition']),

('13B', 'Cannon Crewmember', 'Army',
 ARRAY['Tinnitus','Hearing loss','Low back strain','Shoulder conditions','TBI','Knee conditions','PTSD'],
 ARRAY['blast','extreme noise','repetitive heavy lifting','combat'],
 ARRAY['Tinnitus','Hearing loss','Low back strain','Shoulder condition','PTSD','Knee condition']),

('13F', 'Fire Support Specialist', 'Army',
 ARRAY['Tinnitus','Hearing loss','PTSD','Low back strain','Knee conditions','TBI'],
 ARRAY['blast','noise','combat','burn pit'],
 ARRAY['Tinnitus','Hearing loss','PTSD','Low back strain','Knee condition','TBI']),

('18X', 'Special Forces Candidate', 'Army',
 ARRAY['PTSD','TBI','Low back strain','Knee conditions','Shoulder conditions','Tinnitus','Hearing loss','Sleep apnea'],
 ARRAY['blast','noise','combat','parachute operations','diving','chemical','burn pit'],
 ARRAY['PTSD','Low back strain','Bilateral knee condition','Tinnitus','Shoulder condition','TBI']),

('19D', 'Cavalry Scout', 'Army',
 ARRAY['Tinnitus','Hearing loss','PTSD','Low back strain','Knee conditions','TBI','Neck strain'],
 ARRAY['blast','noise','combat','vehicle vibration','burn pit'],
 ARRAY['Tinnitus','PTSD','Low back strain','Hearing loss','Knee condition','TBI']),

('19K', 'M1 Armor Crewman', 'Army',
 ARRAY['Tinnitus','Hearing loss','Low back strain','Neck strain','TBI','Knee conditions','PTSD'],
 ARRAY['extreme noise','blast','vehicle vibration','confined space','combat'],
 ARRAY['Tinnitus','Hearing loss','Low back strain','Neck strain','PTSD','Knee condition']),

('25B', 'Information Technology Specialist', 'Army',
 ARRAY['Low back strain','Neck strain','Migraines','Carpal tunnel','Depression','Tinnitus'],
 ARRAY['noise','sedentary posture','screen exposure'],
 ARRAY['Low back strain','Neck strain','Tinnitus','Migraines','Depression']),

('25U', 'Signal Support Systems Specialist', 'Army',
 ARRAY['Low back strain','Tinnitus','Hearing loss','Knee conditions','Neck strain','PTSD'],
 ARRAY['noise','heavy equipment','combat deployment','burn pit'],
 ARRAY['Low back strain','Tinnitus','Hearing loss','Knee condition','PTSD']),

('31B', 'Military Police', 'Army',
 ARRAY['PTSD','Low back strain','Knee conditions','Tinnitus','Hearing loss','Sleep apnea','Depression'],
 ARRAY['noise','combat','law enforcement stress','MST risk','burn pit'],
 ARRAY['PTSD','Low back strain','Knee condition','Tinnitus','Depression','Sleep apnea']),

('35F', 'Intelligence Analyst', 'Army',
 ARRAY['PTSD','Depression','Migraines','Low back strain','Neck strain','Anxiety','Carpal tunnel'],
 ARRAY['secondary trauma','sedentary posture','screen exposure','combat deployment'],
 ARRAY['PTSD','Low back strain','Migraines','Depression','Neck strain','Anxiety']),

('42A', 'Human Resources Specialist', 'Army',
 ARRAY['Low back strain','Neck strain','Carpal tunnel','Depression','Anxiety','Tinnitus'],
 ARRAY['sedentary posture','noise from weapons qualification','deployment stress'],
 ARRAY['Low back strain','Tinnitus','Neck strain','Depression','Knee condition']),

('68W', 'Combat Medic Specialist', 'Army',
 ARRAY['PTSD','Low back strain','Knee conditions','Tinnitus','Depression','TBI','Sleep apnea','Hearing loss'],
 ARRAY['blast','noise','combat','secondary trauma','heavy lifting','burn pit'],
 ARRAY['PTSD','Low back strain','Tinnitus','Knee condition','Depression','Hearing loss']),

('88M', 'Motor Transport Operator', 'Army',
 ARRAY['Low back strain','Hearing loss','Tinnitus','Knee conditions','Neck strain','PTSD','Sleep apnea'],
 ARRAY['vehicle vibration','noise','IED blast','combat','burn pit'],
 ARRAY['Low back strain','Tinnitus','Hearing loss','Knee condition','PTSD','Neck strain']),

('91B', 'Wheeled Vehicle Mechanic', 'Army',
 ARRAY['Low back strain','Hearing loss','Tinnitus','Knee conditions','Shoulder conditions','Skin conditions','Carpal tunnel'],
 ARRAY['noise','chemical solvents','heavy lifting','asbestos','burn pit'],
 ARRAY['Low back strain','Tinnitus','Hearing loss','Knee condition','Shoulder condition']),

('92F', 'Petroleum Supply Specialist', 'Army',
 ARRAY['Respiratory conditions','Skin conditions','Low back strain','Hearing loss','Tinnitus','Cancer risk'],
 ARRAY['chemical','fuel vapors','noise','burn pit','carcinogens'],
 ARRAY['Low back strain','Tinnitus','Hearing loss','Respiratory condition','Skin condition']),

('92G', 'Culinary Specialist', 'Army',
 ARRAY['Low back strain','Knee conditions','Burns/scars','Flat feet','Carpal tunnel','Respiratory conditions'],
 ARRAY['heat exposure','repetitive motion','heavy lifting','burn pit'],
 ARRAY['Low back strain','Knee condition','Flat feet','Burns','Carpal tunnel']),

('92Y', 'Unit Supply Specialist', 'Army',
 ARRAY['Low back strain','Knee conditions','Shoulder conditions','Tinnitus','Carpal tunnel'],
 ARRAY['heavy lifting','noise','burn pit'],
 ARRAY['Low back strain','Knee condition','Tinnitus','Shoulder condition','Carpal tunnel']),

('89D', 'Explosive Ordnance Disposal', 'Army',
 ARRAY['TBI','PTSD','Tinnitus','Hearing loss','Low back strain','Knee conditions','Anxiety','Sleep apnea'],
 ARRAY['blast','extreme noise','combat','chemical','lead','burn pit'],
 ARRAY['PTSD','TBI','Tinnitus','Hearing loss','Low back strain','Anxiety']),

('74D', 'CBRN Specialist', 'Army',
 ARRAY['Respiratory conditions','Skin conditions','Cancer risk','Anxiety','Low back strain','Tinnitus'],
 ARRAY['chemical','biological','radiation','noise','burn pit'],
 ARRAY['Respiratory condition','Skin condition','Tinnitus','Anxiety','Low back strain']),

('15T', 'UH-60 Helicopter Repairer', 'Army',
 ARRAY['Hearing loss','Tinnitus','Low back strain','Neck strain','Shoulder conditions','Knee conditions'],
 ARRAY['extreme noise','heavy lifting','vibration','chemical solvents','fuel vapors'],
 ARRAY['Hearing loss','Tinnitus','Low back strain','Shoulder condition','Knee condition']),

('14T', 'Patriot Launching Station Operator', 'Army',
 ARRAY['Tinnitus','Hearing loss','Low back strain','Knee conditions','Neck strain','Anxiety'],
 ARRAY['noise','radar radiation','heavy lifting','burn pit'],
 ARRAY['Tinnitus','Hearing loss','Low back strain','Knee condition','Neck strain']),

('68A', 'Biomedical Equipment Specialist', 'Army',
 ARRAY['Low back strain','Neck strain','Carpal tunnel','Radiation exposure','Depression'],
 ARRAY['radiation','sedentary posture','chemical solvents'],
 ARRAY['Low back strain','Neck strain','Carpal tunnel','Depression']),

('37F', 'Psychological Operations Specialist', 'Army',
 ARRAY['PTSD','Depression','Anxiety','Low back strain','Tinnitus','Sleep apnea','TBI'],
 ARRAY['combat','secondary trauma','noise','burn pit'],
 ARRAY['PTSD','Depression','Low back strain','Tinnitus','Anxiety','Sleep apnea']),

('27D', 'Paralegal Specialist', 'Army',
 ARRAY['Low back strain','Neck strain','Carpal tunnel','Depression','Migraines'],
 ARRAY['sedentary posture','deployment stress','noise'],
 ARRAY['Low back strain','Neck strain','Tinnitus','Depression','Migraines']),

('36B', 'Financial Management Technician', 'Army',
 ARRAY['Low back strain','Neck strain','Carpal tunnel','Depression','Anxiety','Tinnitus'],
 ARRAY['sedentary posture','deployment stress','noise'],
 ARRAY['Low back strain','Neck strain','Tinnitus','Depression','Carpal tunnel']),

('94F', 'Computer/Detection Systems Repairer', 'Army',
 ARRAY['Low back strain','Hearing loss','Tinnitus','Neck strain','Carpal tunnel','Knee conditions'],
 ARRAY['noise','chemical solvents','sedentary posture','heavy lifting'],
 ARRAY['Low back strain','Tinnitus','Hearing loss','Neck strain','Knee condition']),

('68X', 'Behavioral Health Specialist', 'Army',
 ARRAY['PTSD','Depression','Anxiety','Low back strain','Sleep apnea','Secondary trauma'],
 ARRAY['secondary trauma','combat deployment','noise'],
 ARRAY['PTSD','Depression','Anxiety','Low back strain','Sleep apnea']),

('38B', 'Civil Affairs Specialist', 'Army',
 ARRAY['PTSD','Depression','Low back strain','Tinnitus','Knee conditions','Anxiety'],
 ARRAY['combat','noise','burn pit','cultural stress'],
 ARRAY['PTSD','Low back strain','Tinnitus','Depression','Knee condition']),

-- ═══════════════════════════════════════════
-- MARINES (15 codes)
-- ═══════════════════════════════════════════

('0311', 'Rifleman', 'Marines',
 ARRAY['Tinnitus','Hearing loss','PTSD','Low back strain','Knee conditions','TBI','Flat feet','Sleep apnea'],
 ARRAY['blast','noise','combat','burn pit'],
 ARRAY['Tinnitus','PTSD','Low back strain','Knee condition','Hearing loss','Flat feet']),

('0331', 'Machine Gunner', 'Marines',
 ARRAY['Tinnitus','Hearing loss','Low back strain','Shoulder conditions','PTSD','Neck strain','Knee conditions'],
 ARRAY['extreme noise','blast','combat','heavy lifting'],
 ARRAY['Tinnitus','Hearing loss','Low back strain','PTSD','Shoulder condition','Knee condition']),

('0341', 'Mortarman', 'Marines',
 ARRAY['Tinnitus','Hearing loss','PTSD','Low back strain','Knee conditions','TBI','Shoulder conditions'],
 ARRAY['blast','extreme noise','combat','heavy lifting'],
 ARRAY['Tinnitus','Hearing loss','PTSD','Low back strain','Knee condition','Shoulder condition']),

('0351', 'Infantry Assaultman', 'Marines',
 ARRAY['Tinnitus','Hearing loss','PTSD','Low back strain','Shoulder conditions','TBI','Knee conditions'],
 ARRAY['blast','extreme noise','combat','demolitions'],
 ARRAY['Tinnitus','Hearing loss','PTSD','Low back strain','Shoulder condition','TBI']),

('0621', 'Field Radio Operator', 'Marines',
 ARRAY['Low back strain','Tinnitus','Hearing loss','Knee conditions','Neck strain','PTSD'],
 ARRAY['noise','heavy equipment','combat deployment','burn pit'],
 ARRAY['Low back strain','Tinnitus','Hearing loss','Knee condition','PTSD']),

('0811', 'Field Artillery Cannoneer', 'Marines',
 ARRAY['Tinnitus','Hearing loss','Low back strain','Shoulder conditions','TBI','Knee conditions'],
 ARRAY['extreme noise','blast','heavy lifting','combat'],
 ARRAY['Tinnitus','Hearing loss','Low back strain','Shoulder condition','Knee condition']),

('1141', 'Electrician', 'Marines',
 ARRAY['Low back strain','Hearing loss','Tinnitus','Knee conditions','Electrical burns','Carpal tunnel'],
 ARRAY['noise','electrical hazard','heavy lifting','asbestos'],
 ARRAY['Low back strain','Tinnitus','Hearing loss','Knee condition','Carpal tunnel']),

('1371', 'Combat Engineer', 'Marines',
 ARRAY['Tinnitus','Hearing loss','TBI','PTSD','Low back strain','Knee conditions','Respiratory conditions'],
 ARRAY['blast','noise','combat','chemical','demolitions','burn pit'],
 ARRAY['Tinnitus','Hearing loss','PTSD','TBI','Low back strain','Knee condition']),

('3531', 'Motor Vehicle Operator', 'Marines',
 ARRAY['Low back strain','Hearing loss','Tinnitus','Knee conditions','Neck strain','PTSD'],
 ARRAY['vehicle vibration','noise','IED blast','combat','burn pit'],
 ARRAY['Low back strain','Tinnitus','Hearing loss','Knee condition','PTSD','Neck strain']),

('3043', 'Supply Administration', 'Marines',
 ARRAY['Low back strain','Knee conditions','Carpal tunnel','Tinnitus','Depression'],
 ARRAY['heavy lifting','noise','deployment stress'],
 ARRAY['Low back strain','Knee condition','Tinnitus','Carpal tunnel','Depression']),

('5811', 'Military Police', 'Marines',
 ARRAY['PTSD','Low back strain','Knee conditions','Tinnitus','Hearing loss','Depression','Sleep apnea'],
 ARRAY['noise','combat','law enforcement stress','MST risk','burn pit'],
 ARRAY['PTSD','Low back strain','Knee condition','Tinnitus','Depression','Hearing loss']),

('0317', 'Scout Sniper', 'Marines',
 ARRAY['PTSD','Tinnitus','Hearing loss','Low back strain','Knee conditions','TBI','Depression','Sleep apnea'],
 ARRAY['noise','combat','extreme physical stress','burn pit'],
 ARRAY['PTSD','Tinnitus','Hearing loss','Low back strain','Knee condition','Depression']),

('0321', 'Reconnaissance Marine', 'Marines',
 ARRAY['PTSD','TBI','Low back strain','Knee conditions','Shoulder conditions','Tinnitus','Sleep apnea'],
 ARRAY['blast','noise','combat','parachute operations','diving','burn pit'],
 ARRAY['PTSD','Low back strain','Knee condition','Tinnitus','TBI','Shoulder condition']),

('6176', 'Helicopter/Tiltrotor Crew Chief', 'Marines',
 ARRAY['Hearing loss','Tinnitus','Low back strain','Neck strain','PTSD','Shoulder conditions'],
 ARRAY['extreme noise','vibration','combat aviation','fuel vapors'],
 ARRAY['Hearing loss','Tinnitus','Low back strain','Neck strain','PTSD']),

('2336', 'Explosive Ordnance Disposal Technician', 'Marines',
 ARRAY['TBI','PTSD','Tinnitus','Hearing loss','Low back strain','Anxiety','Knee conditions','Sleep apnea'],
 ARRAY['blast','extreme noise','combat','chemical','lead'],
 ARRAY['PTSD','TBI','Tinnitus','Hearing loss','Low back strain','Anxiety']),

-- ═══════════════════════════════════════════
-- NAVY (15 codes)
-- ═══════════════════════════════════════════

('HM', 'Hospital Corpsman', 'Navy',
 ARRAY['PTSD','Low back strain','Depression','Knee conditions','Tinnitus','Sleep apnea','Secondary trauma'],
 ARRAY['combat','secondary trauma','noise','heavy lifting','burn pit'],
 ARRAY['PTSD','Low back strain','Depression','Knee condition','Tinnitus','Sleep apnea']),

('IT', 'Information Systems Technician', 'Navy',
 ARRAY['Low back strain','Neck strain','Carpal tunnel','Migraines','Tinnitus','Depression'],
 ARRAY['sedentary posture','noise','screen exposure','deployment stress'],
 ARRAY['Low back strain','Neck strain','Tinnitus','Carpal tunnel','Migraines']),

('BM', 'Boatswain''s Mate', 'Navy',
 ARRAY['Hearing loss','Tinnitus','Low back strain','Knee conditions','Shoulder conditions','Skin conditions'],
 ARRAY['noise','heavy lifting','chemical exposure','sun/weather','fuel vapors'],
 ARRAY['Hearing loss','Tinnitus','Low back strain','Knee condition','Shoulder condition']),

('GM', 'Gunner''s Mate', 'Navy',
 ARRAY['Tinnitus','Hearing loss','Low back strain','Shoulder conditions','TBI','PTSD'],
 ARRAY['extreme noise','blast','chemical propellants','heavy lifting'],
 ARRAY['Tinnitus','Hearing loss','Low back strain','Shoulder condition','PTSD']),

('MM', 'Machinist''s Mate', 'Navy',
 ARRAY['Hearing loss','Tinnitus','Low back strain','Respiratory conditions','Skin conditions','Asbestosis'],
 ARRAY['extreme noise','asbestos','chemical solvents','fuel vapors','heat'],
 ARRAY['Hearing loss','Tinnitus','Low back strain','Respiratory condition','Skin condition']),

('ET', 'Electronics Technician', 'Navy',
 ARRAY['Tinnitus','Hearing loss','Low back strain','Neck strain','Carpal tunnel','Radiation exposure'],
 ARRAY['noise','radiation','sedentary posture','chemical solvents'],
 ARRAY['Tinnitus','Hearing loss','Low back strain','Neck strain','Carpal tunnel']),

('CTI', 'Cryptologic Technician Interpretive', 'Navy',
 ARRAY['PTSD','Depression','Migraines','Neck strain','Low back strain','Hearing loss','Tinnitus'],
 ARRAY['secondary trauma','sedentary posture','headset noise','screen exposure'],
 ARRAY['Low back strain','Tinnitus','Migraines','Depression','Neck strain','Hearing loss']),

('EOD', 'Explosive Ordnance Disposal Technician', 'Navy',
 ARRAY['TBI','PTSD','Tinnitus','Hearing loss','Low back strain','Knee conditions','Anxiety','Sleep apnea'],
 ARRAY['blast','extreme noise','combat','chemical','diving','lead'],
 ARRAY['PTSD','TBI','Tinnitus','Hearing loss','Low back strain','Anxiety']),

('SO', 'Special Warfare Operator (SEAL)', 'Navy',
 ARRAY['PTSD','TBI','Low back strain','Knee conditions','Shoulder conditions','Tinnitus','Hearing loss','Sleep apnea'],
 ARRAY['blast','noise','combat','diving','parachute operations','chemical','burn pit'],
 ARRAY['PTSD','Low back strain','Bilateral knee condition','Tinnitus','TBI','Shoulder condition']),

('SW', 'Steelworker', 'Navy',
 ARRAY['Low back strain','Hearing loss','Tinnitus','Knee conditions','Shoulder conditions','Burns/scars','Respiratory conditions'],
 ARRAY['noise','welding fumes','heavy lifting','asbestos','heat'],
 ARRAY['Low back strain','Hearing loss','Tinnitus','Knee condition','Shoulder condition','Respiratory condition']),

('MA', 'Master-at-Arms', 'Navy',
 ARRAY['PTSD','Low back strain','Knee conditions','Tinnitus','Depression','Sleep apnea'],
 ARRAY['noise','combat','law enforcement stress','MST risk','burn pit'],
 ARRAY['PTSD','Low back strain','Knee condition','Tinnitus','Depression','Sleep apnea']),

('DC', 'Damage Controlman', 'Navy',
 ARRAY['Respiratory conditions','Low back strain','Hearing loss','Tinnitus','Knee conditions','Burns/scars','Asbestosis'],
 ARRAY['asbestos','chemical','noise','heat','fire fighting'],
 ARRAY['Respiratory condition','Low back strain','Hearing loss','Tinnitus','Knee condition']),

('ND', 'Navy Diver', 'Navy',
 ARRAY['Low back strain','Knee conditions','Tinnitus','Hearing loss','Sinus conditions','Shoulder conditions','Sleep apnea'],
 ARRAY['diving pressure','noise','heavy lifting','cold water'],
 ARRAY['Low back strain','Tinnitus','Knee condition','Hearing loss','Sinus condition','Shoulder condition']),

('LS', 'Logistics Specialist', 'Navy',
 ARRAY['Low back strain','Knee conditions','Shoulder conditions','Tinnitus','Carpal tunnel'],
 ARRAY['heavy lifting','noise','deployment stress'],
 ARRAY['Low back strain','Knee condition','Tinnitus','Shoulder condition','Carpal tunnel']),

('OS', 'Operations Specialist', 'Navy',
 ARRAY['Low back strain','Neck strain','Migraines','Tinnitus','Depression','Anxiety'],
 ARRAY['noise','screen exposure','shift work','deployment stress'],
 ARRAY['Low back strain','Neck strain','Tinnitus','Migraines','Depression']),

-- ═══════════════════════════════════════════
-- AIR FORCE (15 codes)
-- ═══════════════════════════════════════════

('3P0X1', 'Security Forces', 'Air Force',
 ARRAY['PTSD','Low back strain','Knee conditions','Tinnitus','Hearing loss','Depression','Sleep apnea'],
 ARRAY['noise','combat','law enforcement stress','MST risk','burn pit'],
 ARRAY['PTSD','Low back strain','Knee condition','Tinnitus','Depression','Hearing loss']),

('2W1X1', 'Aircraft Armament Systems', 'Air Force',
 ARRAY['Hearing loss','Tinnitus','Low back strain','Shoulder conditions','Knee conditions','Respiratory conditions'],
 ARRAY['extreme noise','heavy lifting','chemical propellants','fuel vapors'],
 ARRAY['Hearing loss','Tinnitus','Low back strain','Shoulder condition','Knee condition']),

('1A0X1', 'In-Flight Refueling', 'Air Force',
 ARRAY['Low back strain','Hearing loss','Tinnitus','Neck strain','Knee conditions','Sleep apnea'],
 ARRAY['extreme noise','vibration','altitude','fuel vapors'],
 ARRAY['Low back strain','Hearing loss','Tinnitus','Neck strain','Knee condition','Sleep apnea']),

('1C1X1', 'Air Traffic Control', 'Air Force',
 ARRAY['Anxiety','Migraines','Tinnitus','Hearing loss','Low back strain','Depression','Sleep disorders'],
 ARRAY['noise','high stress','shift work','screen exposure'],
 ARRAY['Anxiety','Tinnitus','Migraines','Low back strain','Depression','Hearing loss']),

('3D1X2', 'Cyber Transport Systems', 'Air Force',
 ARRAY['Low back strain','Neck strain','Carpal tunnel','Migraines','Tinnitus','Depression'],
 ARRAY['sedentary posture','noise','screen exposure','shift work'],
 ARRAY['Low back strain','Neck strain','Tinnitus','Carpal tunnel','Migraines']),

('4N0X1', 'Aerospace Medical Service', 'Air Force',
 ARRAY['Low back strain','Knee conditions','Depression','PTSD','Tinnitus','Hearing loss'],
 ARRAY['secondary trauma','noise','heavy lifting','burn pit'],
 ARRAY['Low back strain','Tinnitus','Knee condition','Depression','Hearing loss']),

('6C0X1', 'Contracting', 'Air Force',
 ARRAY['Low back strain','Neck strain','Carpal tunnel','Migraines','Depression','Anxiety'],
 ARRAY['sedentary posture','deployment stress','noise'],
 ARRAY['Low back strain','Neck strain','Tinnitus','Depression','Carpal tunnel']),

('1C2X1', 'Combat Control', 'Air Force',
 ARRAY['PTSD','TBI','Low back strain','Knee conditions','Tinnitus','Hearing loss','Shoulder conditions','Sleep apnea'],
 ARRAY['blast','noise','combat','parachute operations','diving','burn pit'],
 ARRAY['PTSD','Low back strain','Knee condition','Tinnitus','TBI','Hearing loss']),

('1T2X1', 'Pararescue', 'Air Force',
 ARRAY['PTSD','TBI','Low back strain','Knee conditions','Shoulder conditions','Tinnitus','Hearing loss','Sleep apnea'],
 ARRAY['blast','noise','combat','parachute operations','diving','extreme physical stress','burn pit'],
 ARRAY['PTSD','Low back strain','Bilateral knee condition','Tinnitus','TBI','Shoulder condition']),

('2A3X3', 'F-16 Aircraft Maintenance', 'Air Force',
 ARRAY['Hearing loss','Tinnitus','Low back strain','Knee conditions','Shoulder conditions','Respiratory conditions'],
 ARRAY['extreme noise','chemical solvents','fuel vapors','heavy lifting','jet exhaust'],
 ARRAY['Hearing loss','Tinnitus','Low back strain','Knee condition','Shoulder condition']),

('3E8X1', 'Explosive Ordnance Disposal', 'Air Force',
 ARRAY['TBI','PTSD','Tinnitus','Hearing loss','Low back strain','Knee conditions','Anxiety','Sleep apnea'],
 ARRAY['blast','extreme noise','combat','chemical','lead'],
 ARRAY['PTSD','TBI','Tinnitus','Hearing loss','Low back strain','Anxiety']),

('1N0X1', 'Operations Intelligence', 'Air Force',
 ARRAY['PTSD','Depression','Migraines','Neck strain','Low back strain','Anxiety'],
 ARRAY['secondary trauma','sedentary posture','screen exposure','shift work'],
 ARRAY['PTSD','Depression','Low back strain','Migraines','Neck strain','Anxiety']),

('3E7X1', 'Fire Protection', 'Air Force',
 ARRAY['Respiratory conditions','Low back strain','Knee conditions','PTSD','Hearing loss','Tinnitus','Cancer risk'],
 ARRAY['AFFF/PFAS chemicals','fire fighting','noise','asbestos','burn pit'],
 ARRAY['Respiratory condition','Low back strain','Knee condition','PTSD','Hearing loss','Cancer']),

('2A5X1', 'Aerospace Maintenance', 'Air Force',
 ARRAY['Hearing loss','Tinnitus','Low back strain','Knee conditions','Shoulder conditions','Carpal tunnel'],
 ARRAY['extreme noise','heavy lifting','chemical solvents','fuel vapors'],
 ARRAY['Hearing loss','Tinnitus','Low back strain','Knee condition','Shoulder condition']),

('8F000', 'First Sergeant', 'Air Force',
 ARRAY['Low back strain','PTSD','Depression','Knee conditions','Tinnitus','Sleep apnea','Anxiety'],
 ARRAY['noise','deployment stress','secondary trauma','burn pit'],
 ARRAY['Low back strain','PTSD','Depression','Tinnitus','Knee condition','Sleep apnea']),

-- ═══════════════════════════════════════════
-- COAST GUARD (5 codes)
-- ═══════════════════════════════════════════

('BM-CG', 'Boatswain''s Mate', 'Coast Guard',
 ARRAY['Hearing loss','Tinnitus','Low back strain','Knee conditions','Shoulder conditions','Skin conditions','Cold injury'],
 ARRAY['noise','heavy lifting','cold water','sun/weather','fuel vapors'],
 ARRAY['Hearing loss','Tinnitus','Low back strain','Knee condition','Shoulder condition']),

('ME', 'Maritime Enforcement Specialist', 'Coast Guard',
 ARRAY['PTSD','Low back strain','Knee conditions','Tinnitus','Hearing loss','Depression','Sleep apnea'],
 ARRAY['noise','law enforcement stress','combat boarding','cold water','MST risk'],
 ARRAY['PTSD','Low back strain','Knee condition','Tinnitus','Depression','Hearing loss']),

('MK', 'Machinery Technician', 'Coast Guard',
 ARRAY['Hearing loss','Tinnitus','Low back strain','Respiratory conditions','Skin conditions','Knee conditions'],
 ARRAY['extreme noise','chemical solvents','fuel vapors','asbestos','heavy lifting'],
 ARRAY['Hearing loss','Tinnitus','Low back strain','Respiratory condition','Knee condition']),

('OS-CG', 'Operations Specialist', 'Coast Guard',
 ARRAY['Low back strain','Neck strain','Migraines','Tinnitus','Depression','Anxiety'],
 ARRAY['noise','screen exposure','shift work','deployment stress'],
 ARRAY['Low back strain','Neck strain','Tinnitus','Migraines','Depression']),

('HS', 'Health Services Technician', 'Coast Guard',
 ARRAY['Low back strain','Depression','Knee conditions','Tinnitus','Anxiety','Secondary trauma'],
 ARRAY['secondary trauma','noise','heavy lifting'],
 ARRAY['Low back strain','Depression','Tinnitus','Knee condition','Anxiety']);
