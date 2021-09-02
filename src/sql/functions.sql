CREATE OR REPLACE FUNCTION distance("city_id" int, "offer_id" int) RETURNS float AS $$
DECLARE
  city_location geography;
  offer_location geography;
BEGIN
  -- Get choosen city coordinates
  SELECT city.coordinates INTO city_location FROM city WHERE id = $1;
  
  -- Get offer coordinates
  SELECT offer.coordinates INTO offer_location FROM offer WHERE id = $2;

  RETURN (SELECT ST_Distance(city_location, offer_location));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_reviews_with_offer_id()
RETURNS TABLE
(
  id int,
  text character varying,
  rating numeric,
  booking_id int,
  offer_id int
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    review.id,
    review.text,
    review.rating,
    booking.offerId
  FROM review
  INNER JOIN booking 
  WHERE
    review.bookingId = booking.id
END

CREATE OR REPLACE FUNCTION get_available_offers_from_city("city_id" int)
RETURNS TABLE
(
  "id"          int,
  "title"       character varying,
  "description" text,
  "distance"    float,
  "status"      offer_status_enum
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    offer.id,
    offer.title,
    offer.description,
    distance($1, offer.id) as "distance",
    offer.status
  FROM
    offer
  WHERE
    offer.status = 'AVAILABLE'
  ORDER BY
    distance;
END;
$$ LANGUAGE plpgsql;
