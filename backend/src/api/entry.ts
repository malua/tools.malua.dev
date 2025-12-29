import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as schema from "../services/db/schema";
import { nanoid } from "nanoid";
import { factory } from "@backend/lib/utils/factory";
import { eq, inArray, like } from "drizzle-orm";

const entrySchema = z.object({
  name: z.string().min(1, "Name is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

export type Entry = z.infer<typeof entrySchema>;

export const saveNewEntry = factory.createHandlers(
  zValidator("json", entrySchema),
  async (c) => {
    const data = c.req.valid("json");

    const newEntry = await c.var.db
      .insert(schema.entries)
      .values({
        id: nanoid(),
        name: data.name,
        websiteUrl: data.websiteUrl || "",
        githubUrl: data.githubUrl || "",
      })
      .returning()
      .get({
        with: {
          entryTags: true,
        },
      });

    const tags = await c.var.db
      .select()
      .from(schema.tags)
      .where(inArray(schema.tags.name, data.tags))
      .all();

    await c.var.db.insert(schema.entriesToTags).values(
      tags.map((tag) => ({
        entryId: newEntry.id,
        tagId: tag.id,
      })),
    );

    return c.json({ entry: newEntry }, 201);
  },
);

export const getAllEntries = factory.createHandlers(async (c) => {
  const nameFilter = c.req.query("name") || "";
  const tagsFilter = c.req.query("tags")?.split(",").filter(Boolean) || [];

  const allEntries = await c.var.db.query.entries.findMany({
    where: nameFilter
      ? (entries, { like }) => like(entries.name, `%${nameFilter}%`)
      : undefined,
    with: {
      entryTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  // Filter by tags (entry must have ALL selected tags)
  const filteredEntries =
    tagsFilter.length > 0
      ? allEntries.filter((entry) => {
          const entryTagNames = entry.entryTags.map((et) => et.tag.name);
          return tagsFilter.every((tag) => entryTagNames.includes(tag));
        })
      : allEntries;

  return c.json({ entries: filteredEntries });
});

export const getEntryById = factory.createHandlers(async (c) => {
  const requestId = c.req.param("id");

  if (!requestId) {
    return c.json({ error: "Invalid request ID" }, 400);
  }

  const entry = await c.var.db.query.entries.findFirst({
    with: {
      entryTags: {
        with: {
          tag: true,
        },
      },
    },
    where({ id }, { eq }) {
      return eq(id, requestId!);
    },
  });

  if (!entry) {
    return c.json({ error: "Entry not found" }, 404);
  }

  return c.json({ entry });
});

export const updateEntry = factory.createHandlers(
  zValidator("json", entrySchema),
  async (c) => {
    const requestId = c.req.param("id");
    const data = c.req.valid("json");

    const updatedEntry = await c.var.db
      .update(schema.entries)
      .set({
        name: data.name,
        websiteUrl: data.websiteUrl || "",
        githubUrl: data.githubUrl || "",
        updatedAt: new Date(),
      })
      .where(eq(schema.entries.id, requestId!))
      .returning();
  },
);

export const deleteEntry = factory.createHandlers(async (c) => {
  const requestId = c.req.param("id");

  if (!requestId) {
    return c.json({ error: "Invalid request ID" }, 400);
  }

  // First, delete all tag references for this entry
  await c.var.db
    .delete(schema.entriesToTags)
    .where(eq(schema.entriesToTags.entryId, requestId));

  const deleted = await c.var.db
    .delete(schema.entries)
    .where(eq(schema.entries.id, requestId!))
    .returning({ id: schema.entries.id });

  if (deleted.length === 0) {
    return c.json({ error: "Entry not found" }, 404);
  }

  return c.json({ success: true });
});
