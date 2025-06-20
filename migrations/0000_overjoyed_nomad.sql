CREATE TABLE `attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`paper_id` int NOT NULL,
	`mode` varchar(255) NOT NULL,
	`responses` json NOT NULL,
	`score` int,
	`total_questions` int,
	`time_spent` int,
	`status` varchar(255) DEFAULT 'completed',
	`started_at` timestamp DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`category` varchar(255),
	`is_popular` boolean DEFAULT false,
	`total_questions` int DEFAULT 0,
	`years_available` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `papers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exam_id` int NOT NULL,
	`year` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`total_questions` int DEFAULT 0,
	`duration` int,
	`is_free` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `papers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`exam_id` int NOT NULL,
	`type` varchar(255) NOT NULL,
	`amount` decimal(10,2) DEFAULT '0',
	`stripe_payment_id` varchar(255),
	`status` varchar(255) DEFAULT 'completed',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paper_id` int NOT NULL,
	`question_number` int NOT NULL,
	`question_text` text NOT NULL,
	`options` json NOT NULL,
	`correct_answer` varchar(255) NOT NULL,
	`explanation` text,
	`subject` varchar(255),
	`topic` varchar(255),
	`difficulty` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sid` varchar(255) NOT NULL,
	`sess` json NOT NULL,
	`expire` timestamp NOT NULL,
	CONSTRAINT `sessions_sid` PRIMARY KEY(`sid`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`email` varchar(255),
	`first_name` varchar(255),
	`last_name` varchar(255),
	`profile_image_url` varchar(255),
	`password_hash` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `attempts` ADD CONSTRAINT `attempts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attempts` ADD CONSTRAINT `attempts_paper_id_papers_id_fk` FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `papers` ADD CONSTRAINT `papers_exam_id_exams_id_fk` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_exam_id_exams_id_fk` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_paper_id_papers_id_fk` FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `IDX_session_expire` ON `sessions` (`expire`);