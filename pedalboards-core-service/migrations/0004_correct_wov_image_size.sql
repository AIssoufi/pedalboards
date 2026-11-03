-- The screenshot of wov is 393 x 369 pixels, not the 400 x 368 that the first seed stored.
-- A database seeded since then already holds these values, and this update leaves it as it is.
UPDATE plugins SET imageWidth = 393, imageHeight = 369 WHERE id = 'wov';
