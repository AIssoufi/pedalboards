-- One row per plugin. The columns carry the field names of the API, and author, categories and
-- controlPorts hold JSON text.
CREATE TABLE plugins (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	label TEXT NOT NULL DEFAULT '',
	brand TEXT NOT NULL DEFAULT '',
	description TEXT NOT NULL DEFAULT '',
	uri TEXT NOT NULL DEFAULT '',
	version TEXT NOT NULL DEFAULT '',
	stable INTEGER NOT NULL DEFAULT 0,
	pedalboardCount INTEGER NOT NULL DEFAULT 0,
	screenshotUrl TEXT NOT NULL DEFAULT '',
	thumbnailUrl TEXT NOT NULL DEFAULT '',
	imageWidth INTEGER,
	imageHeight INTEGER,
	author TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(author)),
	categories TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(categories)),
	controlPorts TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(controlPorts))
);

-- The list pages are sorted by name, whatever the case, then by id
CREATE INDEX plugins_by_name ON plugins (name COLLATE NOCASE, id);
