CREATE TABLE program_rights (
	program INT NOT NULL,
	token INT NOT NULL,
	FOREIGN KEY(program) REFERENCES programs(id),
	FOREIGN KEY(token) REFERENCES token(id)
);