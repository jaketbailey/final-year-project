
SELECT 
  hazard.id AS "Hazard ID",
  hazard_date AS "Date",
  geometry_type.type AS "Geometry Type",
  coordinate.latitude AS "Lat",
  coordinate.longitude AS "Lon",
  category.name AS "Category",
  category.description AS "Category Description"
FROM
  hazard
  JOIN geometry ON geometry.id = hazard.geometry_id
  JOIN category ON category.id = hazard.category_id
  JOIN geometry_type ON geometry_type.id = geometry.type_id
  LEFT JOIN LATERAL (
    SELECT
      coordinate.latitude,
      coordinate.longitude
    FROM
      coordinate
    WHERE
      coordinate.id = ANY(
        geometry.coordinates
      )
  ) AS coordinate ON TRUE
GROUP BY  
  hazard.id,
  hazard_date,
  geometry_type.type,
  coordinate.latitude,
  coordinate.longitude,
  category.name,
  category.description
ORDER BY
  hazard.id;