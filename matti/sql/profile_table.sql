CREATE TABLE profiles (
	id INT NOT NULL AUTO_INCREMENT,
	name INT NOT NULL,
	token INT NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(name) REFERENCES names(id),
	FOREIGN KEY(token) REFERENCES token(id)
);