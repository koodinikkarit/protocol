CREATE TABLE token_inheritance (
	token INT NOT NULL,
	child INT NOT NULL,
	FOREIGN KEY (token) REFERENCES token(id),
	FOREIGN KEY (child) REFERENCES token(id)
);