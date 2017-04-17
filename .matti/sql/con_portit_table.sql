CREATE TABLE con_ports (
	id INT NOT NULL AUTO_INCREMENT,
	matrix_id INT NOT NULL,
	port_number INT NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(matrix_id) REFERENCES matrix(id)
);