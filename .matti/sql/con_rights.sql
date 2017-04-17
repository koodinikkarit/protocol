CREATE TABLE con_rights (
	con_port INT NOT NULL,
	token INT NOT NULL,
	FOREIGN KEY(con_port) REFERENCES con_ports(id),
	FOREIGN KEY(token) REFERENCES token(id)
);