import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveUpload } from "@/lib/storage";

/** Multipart upload for the admin panel. Fields: files (1..n), folder?, keep? ("1" keeps original encoding) */
export async function POST(req: Request) {
  const s = await getSession();
  if (!s || (s.role !== "admin" && s.role !== "staff")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const folder = String(form.get("folder") || "media").replace(/[^a-z0-9-]/gi, "") || "media";
  const keep = form.get("keep") === "1";
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });
  try {
    const saved = [];
    for (const f of files) saved.push(await saveUpload(f, folder, { keepOriginal: keep }));
    return NextResponse.json({ files: saved });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
