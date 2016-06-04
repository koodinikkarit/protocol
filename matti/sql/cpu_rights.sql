CREATE TABLE cpu_rights (
	cpu_port INT NOT NULL,
	token INT NOT NULL,
	FOREIGN KEY(cpu_port) REFERENCES cpu_ports(id),
	FOREIGN KEY(token) REFERENCES token(id)
);