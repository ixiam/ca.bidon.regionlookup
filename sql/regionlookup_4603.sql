-- add ID as first primary field

ALTER TABLE civicrm_regionlookup CHANGE state_riding stateriding varchar(127) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' NOT NULL;
ALTER TABLE civicrm_regionlookup CHANGE country_riding countryriding varchar(127) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' NOT NULL;
