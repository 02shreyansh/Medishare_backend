CREATE TABLE "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(15) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar DEFAULT 'user' NOT NULL,
	"refresh_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email"),
	CONSTRAINT "User_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "User_refresh_token_unique" UNIQUE("refresh_token")
);
