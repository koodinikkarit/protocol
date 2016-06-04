CREATE TABLE program_timer_repeat (
	program_timer INT NOT NULL,
	interval_time INT NOT NULL,
	FOREIGN KEY(program_timer) REFERENCES program_timers(id),
	FOREIGN KEY(interval_time) REFERENCES interval_time(id)	
);