CREATE TABLE video_rights (
	video_connection INT NOT NULL,
	token INT NOT NULL,
	FOREIGN KEY(video_connection) REFERENCES video_connections(id),
	FOREIGN KEY(token) REFERENCES token(id)
);