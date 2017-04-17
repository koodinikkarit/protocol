CREATE TABLE kwm_connections (
	id INT NOT NULL AUTO_INCREMENT,
	cpu_port INT NOT NULL,
	con_port INT NOT NULL,
	program INT NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(cpu_port) REFERENCES cpu_ports(id),
	FOREIGN KEY(con_port) REFERENCES con_ports(id),
	FOREIGN KEY(program) REFERENCES programs(id)	
);