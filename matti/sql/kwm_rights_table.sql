CREATE TABLE kwm_rights (
	kwm_connection INT NOT NULL,
	token INT NOT NULL,
	FOREIGN KEY(kwm_connection) REFERENCES kwm_connections(id),
	FOREIGN KEY(token) REFERENCES token(id)
);