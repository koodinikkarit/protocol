CREATE TABLE lock_repeat (
	program_lock INT NOT NULL,
	interval_time INT NOT NULL,
	FOREIGN KEY(program_lock) REFERENCES program_locks(id),
	FOREIGN KEY(interval_time) REFERENCES interval_time(id)
);