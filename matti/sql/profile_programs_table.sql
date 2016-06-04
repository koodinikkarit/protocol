CREATE TABLE profile_programs (
	profile INT NOT NULL,
	program INT NOT NULL,
	FOREIGN KEY(profile) REFERENCES profiles(id),
	FOREIGN KEY(program) REFERENCES programs(id)
);