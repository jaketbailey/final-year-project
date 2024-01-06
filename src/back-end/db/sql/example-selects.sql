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
  JOIN geometry as g ON g.id = h.geometry_id 
  JOIN category as c ON c.id = h.category_id 
  JOIN geometry_type as gt ON gt.id = g.type_id 
  JOIN hazard_property AS hp ON hp.hazard_id = h.id 
  JOIN property AS p ON p.id = hp.property_id 
  LEFT JOIN LATERAL (
    SELECT
      coordinate.latitude,
      coordinate.longitude
    FROM
      coordinate
    WHERE
      coordinate.id = ANY(
        g.coordinates
      )
  ) AS coord ON TRUE
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