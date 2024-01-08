CREATE EXTENSION postgis;
 CREATE EXTENSION postgis_topology;
 CREATE EXTENSION fuzzystrmatch;
 CREATE EXTENSION postgis_tiger_geocoder;


CREATE TABLE IF NOT EXISTS geometry_type (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS geometry (
    id SERIAL PRIMARY KEY,
    type_id INTEGER REFERENCES geometry_type(id),
    coordinates INTEGER[]
);

CREATE TABLE IF NOT EXISTS coordinate (
    id SERIAL PRIMARY KEY,
    -- location geometry(Point, 4326)
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

ALTER TABLE coordinate
ADD COLUMN location geometry(Point, 4326);

UPDATE coordinate
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude));

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
    property_value TEXT
);

CREATE TABLE IF NOT EXISTS hazard_property (
    property_id INTEGER REFERENCES property(id),
    hazard_id INTEGER REFERENCES hazard(id),
    PRIMARY KEY (property_id, hazard_id)
);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION check_coordinate_ids() RETURNS TRIGGER AS $$
DECLARE
    coord_id INTEGER;

BEGIN FOREACH coord_id IN ARRAY NEW.coordinates LOOP IF NOT EXISTS (
    SELECT 1 
    FROM coordinate
    WHERE id = coord_id
) THEN RAISE EXCEPTION 'Coordinate ID % not found',
coord_id;
END IF;
END LOOP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_coordinate_ids BEFORE
INSERT
    OR
UPDATE ON 
  geometry
FOR EACH ROW EXECUTE FUNCTION
check_coordinate_ids();