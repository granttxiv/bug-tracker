CREATE TABLE "ticket_members" (
	"ticket_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticket_members" ADD CONSTRAINT "ticket_members_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_members" ADD CONSTRAINT "ticket_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_members_ticket_user_unique" ON "ticket_members" USING btree ("ticket_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_members_user_id" ON "ticket_members" USING btree ("user_id");