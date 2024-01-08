-- INSERT OSM Hazard types into category from https://wiki.openstreetmap.org/wiki/Key:hazard
-- Inserts for category table
INSERT INTO category (name, description) VALUES 
('archery_range', 'An area with a risk of bow-launched projectiles.'),
('avalanche', 'All the hazards that involve massive displacement of snow and / or ice.'),
('biohazard', 'Area where biological hazard is present.'),
('contamination', 'An area contaminated by chemical agents.'),
('electricity', 'An area with a risk of electric shock.'),
('minefield', 'Active or possibly active mine fields from past or present military conflicts.'),
('nuclear', 'A radioactive area hazardous to human life.'),
('shooting_range', 'An area with a risk of accidental gunfire.'),
('unexploded_ordnance', 'Active or possibly active ordnance from past or present military conflicts or from a military training area such as a bombing range.'),
('quicksand', 'An area of quicksand'),
('hole', 'A hole which is a hazard'),
('animal_crossing', 'A place where animals are known to appear unexpectedly, presenting a collision hazard to motorists.'),
('bump', 'A bump in the road which may be hazardous to motorists.'),
('children', 'A place where children are known to play in the roadway, presenting a collision hazard to children and motorists.'),
('curve', 'A section of road which presents a risk to motorists due to a single curve.'),
('curves', 'A section of road which presents a risk to motorists due to multiple curves.'),
('cyclists', 'An area where cyclists share a roadway with motor vehicles'),
('dangerous_junction', 'A junction or intersection that has a high rate of traffic collisions.'),
('dip', 'A dip in the road which may be hazardous to motorists.'),
('emergency_vehicles', 'A section of road approaching near an intersection with road for emergency vehicles where it is recommended to reduce speed.'),
('falling_rocks', 'An area in which rocks, dirt, or other natural materials may fall unexpectedly from cliffs above, or may have fallen, presenting a hazard.'),
('fog', 'An area where fog tends to form more frequently than surrounding areas.'),
('frail_pedestrians', 'A place where frail or disabled pedestrians are likely to cross a road'),
('frost_heave', 'An area where the road is known to bulge because of ice underneath the roadway.'),
('ground_clearance', 'A place (usually a hill
 or incline) where vehicles with long wheelbases risk being grounded.'),
('horse_riders', 'An area where horse riders share a roadway with motor vehicles.'),
('ice', 'An area where ice tends to form more frequently than surrounding areas.'),
('illegal_crossing', 'Illegal crossing marked with boards informing about the prohibition.'),
('landslide', 'An area where landslides, mudslides or rockslides are known to occur.'),
('loose_gravel', 'An area along the road where rocks and stones may be present, presenting a hazard to motorists.'),
('low_flying_aircraft', 'An area where low flying aircraft are known to appear.'),
('pedestrians', 'An area where pedestrians share a roadway with motor vehicles'),
('queues_likely', 'An area which frequently experiences a queue of cars backed up on the roadway'),
('road_narrows', 'A place where the road narrows immediately following the sign.'),
('roadworks', 'A section of road with workers on the roadway.'),
('school_zone', 'An area near a school where special traffic laws apply.'),
('side_winds', 'An area which frequently receives high winds that present a danger to people.'),
('slippery', 'An area or stretch of roadway which is slippery, or slippery under certain conditions, presenting a hazard to motorists'),
('turn', 'A section of road that turns sharply'),
('turns', 'A section of road that turns sharply two times, in opposite directions'),
('damaged_road', 'A section of damaged road where it is recommended to reduce speed'),
('traffic_signals', 'A section of road approaching near traffic lights where it is recommended to reduce speed'),
('roundabout', 'A section of road approaching near a roundabout where it is recommended to reduce speed'),
('flooding', 'Whether or not the feature or area is likely to flood after very heavy rain.'),
('leeches', 'Leeches are present'),
('washout', 'A section of road which presents a risk to motorists due to washouts.');


-- Inserting data into the 'coordinate' table
INSERT INTO coordinate (latitude, longitude) VALUES
  (50.794659, -1.129070), -- Gosport
  (50.909698, -1.404351), -- Los Angeles
  (50.798908, -1.091160), -- Portsmouth
  (50.8056317, -0.9800537), -- Hayling Island
  (50.8526637,-1.1783134); -- Fareham

INSERT INTO coordinate (latitude, longitude) VALUES
(50.7930237, -1.1086033),
(50.7964959, -1.0317196),
(50.7767442, -1.0885243);

INSERT INTO geometry_type (type) VALUES
    ('Point'),
    ('LineString'),
    ('Polygon'),
    ('MultiPoint'),
    ('MultiLineString'),
    ('MultiPolygon'),
    ('GeometryCollection');

INSERT INTO geometry (type_id, coordinates) VALUES
  (4, ARRAY[1,2]),
  (1, ARRAY[2]),
  (1, ARRAY[3]),
  (1, ARRAY[4]);

INSERT INTO geometry (type_id, coordinates) VALUES (3, ARRAY[
  6, 7, 8
]);

-- Inserting data into the 'hazard' table
INSERT INTO hazard (hazard_date, hazard_timeframe, geometry_id, category_id) VALUES
  ('2023-05-15', '12:00', 1, 3),
  ('2023-07-20', '15:30', 2, 7),
  ('2023-06-10', '08:45', 3, 5),
  ('2023-08-05', '09:00', 4, 2),
  ('2023-04-22', '18:20', 5, 9);

-- Inserting data into the 'property' table
INSERT INTO property (property_name, property_value) VALUES
  ('severity', 'High'),
  ('severity', 'Low'),
  ('impact', 'Major'),
  ('impact', 'Minor'),
  ('evacuation', 'Required');

-- Inserting data into the 'hazard_property' table
INSERT INTO hazard_property (property_id, hazard_id) VALUES
  (1, 1),
  (3, 1),
  (2, 2),
  (4, 2),
  (3, 3),
  (5, 4),
  (1, 5),
  (5, 5);
