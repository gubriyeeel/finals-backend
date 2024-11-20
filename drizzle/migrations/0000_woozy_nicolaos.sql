CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` integer NOT NULL,
	`date` text DEFAULT (current_timestamp) NOT NULL,
	`account` text NOT NULL,
	`category` text NOT NULL,
	`userEmail` text NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`userEmail`) REFERENCES `users`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text
);
