CREATE TABLE IF NOT EXISTS geometry_type (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS geometry (
    id SERIAL PRIMARY KEY,
    type_id INTEGER REFERENCES geometry_type(id)
);

CREATE TABLE IF NOT EXISTS coordinate (
    id SERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS geometry_coords (
    geometry_id INTEGER REFERENCES geometry(id),
    coordinate_id INTEGER REFERENCES coordinate(id),
    PRIMARY KEY (geometry_id, coordinate_id)
);

CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    description TEXT
);

CREATE TABLE IF NOT EXISTS hazard (
    id SERIAL PRIMARY KEY,
    hazard_date DATE,
    hazard_timeframe TIME,
    geometry_id INTEGER REFERENCES geometry(id),
    category_id INTEGER REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS property (
    id SERIAL PRIMARY KEY,
    property_name VARCHAR(50),
    property_value VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS hazard_property (
    property_id INTEGER REFERENCES property(id),
    hazard_id INTEGER REFERENCES hazard(id),
    PRIMARY KEY (property_id, hazard_id)
);

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
('ground_clearance', 'A place (usually a hill or incline) where vehicles with long wheelbases risk being grounded.'),
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
