import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as schema from "../services/db/schema";
import { factory } from "@backend/lib/utils/factory";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

const tagSchema = z.object({
  name: z.string().min(2, "Name is required"),
});

export type Tag = z.infer<typeof tagSchema>;

export const saveNewTag = factory.createHandlers(
  zValidator("json", tagSchema),
  async (c) => {
    const data = c.req.valid("json");

    //if tag exists skip
    const existingTag = await c.var.db
      .select()
      .from(schema.tags)
      .where(eq(schema.tags.name, data.name))
      .get();
    if (existingTag) {
      return c.json({ tag: existingTag });
    }

    const newTag = await c.var.db
      .insert(schema.tags)
      .values({ id: nanoid(), name: data.name })
      .returning()
      .get();

    return c.json({ tag: newTag });
  },
);

export const getAllTags = factory.createHandlers(async (c) => {
  const allTags = await c.var.db.select().from(schema.tags).all();

  return c.json({ tags: allTags });
});
