import {
  int,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

const id = text().primaryKey().notNull();
const createdAt = int("created_at", { mode: "timestamp" })
  .default(sql`current_timestamp`)
  .notNull();
export const updatedAt = int("updated_at", { mode: "timestamp" })
  .default(sql`current_timestamp`)
  .notNull();

export const users = sqliteTable("user", {
  id,
  name: text().notNull().notNull().default(""),
  email: text().notNull().unique(),
  hashedPassword: text().notNull(),
  createdAt,
});

export const entries = sqliteTable("entries", {
  id,
  name: text().notNull(),
  websiteUrl: text().default(""),
  githubUrl: text().default(""),
  createdAt,
  updatedAt,
});

export const entryRelations = relations(entries, ({ many }) => ({
  entryTags: many(entriesToTags),
}));

export const tags = sqliteTable("tags", {
  id,
  name: text().notNull(),
});

export const tagRelations = relations(tags, ({ many }) => ({
  entries: many(entriesToTags),
}));

export const entriesToTags = sqliteTable(
  "entries_to_tags",
  {
    entryId: text()
      .notNull()
      .references(() => entries.id),
    tagId: text()
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.entryId, t.tagId] })],
);

export const entriesToTagsRelations = relations(entriesToTags, ({ one }) => ({
  entry: one(entries, {
    fields: [entriesToTags.entryId],
    references: [entries.id],
  }),
  tag: one(tags, { fields: [entriesToTags.tagId], references: [tags.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
