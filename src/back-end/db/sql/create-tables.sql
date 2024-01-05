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
    name VARCHAR(50)
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
