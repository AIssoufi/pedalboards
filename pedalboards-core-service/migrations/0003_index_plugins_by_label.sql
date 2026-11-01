-- The list pages are sorted by label, whatever the case, then by id
DROP INDEX plugins_by_name;
CREATE INDEX plugins_by_label ON plugins (label COLLATE NOCASE, id);
