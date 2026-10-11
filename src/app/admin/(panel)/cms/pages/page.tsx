import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge, EmptyState, LinkButton, PageHeader, Table, td } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/client";
import { deletePage } from "./actions";

export const metadata = { title: "Pages" };

const CORE = ["about", "shipping-policy", "returns-refunds", "privacy-policy", "terms"];

export default async function PagesList() {
  await requireAdmin();
  const rows = db.select().from(pages).orderBy(asc(pages.title)).all();
  return (
    <>
      <PageHeader
        title="Pages"
        description="Our Story, policies and any other long-form pages. Each lives at /p/your-slug."
        actions={<LinkButton href="/admin/cms/pages/new">New page</LinkButton>}
      />
      {rows.length === 0 ? (
        <EmptyState title="No pages yet" body="Create your About page and store policies so customers know who they are buying from." action={<LinkButton href="/admin/cms/pages/new">Create a page</LinkButton>} />
      ) : (
        <Table head={["Page", "Public URL", "Status", "Footer", "Updated", ""]}>
          {rows.map((p) => (
            <tr key={p.id} className="transition hover:bg-ivory/40">
              <td className={td}>
                <Link href={`/admin/cms/pages/${p.id}`} className="font-medium hover:text-maroon">{p.title}</Link>
              </td>
              <td className={td}>
                <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="text-ink/50 hover:text-maroon">/p/{p.slug} ↗</a>
              </td>
              <td className={td}>{p.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}</td>
              <td className={td}>{p.showInFooter ? <Badge tone="gold">In footer</Badge> : <span className="text-xs text-ink/35">—</span>}</td>
              <td className={`${td} whitespace-nowrap text-ink/50`}>{formatDate(p.updatedAt)}</td>
              <td className={`${td} text-right`}>
                <ActionButton
                  action={deletePage.bind(null, p.id)}
                  confirm={
                    CORE.includes(p.slug)
                      ? `“${p.title}” is a core page linked from the store (e.g. footer, checkout). Deleting it will break those links. Delete anyway?`
                      : `Delete “${p.title}”? This cannot be undone.`
                  }
                >
                  Delete
                </ActionButton>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
