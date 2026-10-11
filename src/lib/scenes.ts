import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { scenes } from "@/db/schema";
import type { SceneData } from "@/components/visualizer/idol-in-scene";

export function listScenes(): SceneData[] {
  return db
    .select()
    .from(scenes)
    .where(eq(scenes.isActive, true))
    .orderBy(asc(scenes.sortOrder))
    .all()
    .filter((s) => s.kind !== "photo" || !!s.image)
    .map((s) => ({ key: s.key, name: s.name, tagline: s.tagline, kind: s.kind, image: s.image, anchorX: s.anchorX, anchorY: s.anchorY, baseScale: s.baseScale }));
}
