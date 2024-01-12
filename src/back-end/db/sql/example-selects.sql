SELECT 
  h.id AS "Hazard ID",
  h.hazard_date AS "Date",
  gt.type AS "Geometry Type",
  coord.latitude AS "Lat",
  coord.longitude AS "Lon",
  c.name AS "Category",
  c.description AS "Category Description",
  p.property_name AS "Property",
  p.property_value AS "Property Value"
FROM
  hazard as h
  JOIN geometry_table as g ON g.id = h.geometry_id 
  JOIN category as c ON c.id = h.category_id 
  JOIN geometry_type as gt ON gt.id = g.type_id 
  JOIN hazard_property AS hp ON hp.hazard_id = h.id 
  JOIN property AS p ON p.id = hp.property_id 
  JOIN coordinate AS coord ON coord.id = ANY(g.coordinates)
WHERE 
  ST_DWithin(
    location::geography,
    ST_SetSRID(ST_MakePoint(-1.091160, 50.798908), 4326)::geography,
    5 * 1609.34 
  )
GROUP BY  
  h.id,
  h.hazard_date,
  gt.type,
  coord.latitude,
  coord.longitude,
  c.name,
  c.description,
  p.property_name,
  p.property_value
ORDER BY
  h.id;

