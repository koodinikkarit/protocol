CREATE TABLE program_timers (
	id INT NOT NULL AUTO_INCREMENT,
	program INT NOT NULL,
	start TIMESTAMP NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(program) REFERENCES programs(id)	
);