CREATE TABLE kwm_enabled_ports (
	con_id INT NOT NULL AUTO_INCREMENT,
	FOREIGN KEY(con_id) REFERENCES con_ports(id)
);