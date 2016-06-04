CREATE TABLE con_port_names (
	con_port INT NOT NULL,
	profile INT NOT NULL,
	name INT NOT NULL,
	FOREIGN KEY(con_port) REFERENCES con_ports(id),
	FOREIGN KEY(profile) REFERENCES profiles(id),
	FOREIGN KEY(name) REFERENCES names(id)
);