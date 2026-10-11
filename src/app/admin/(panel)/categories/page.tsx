import { asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { Badge, LinkButton, PageHeader, Table, Thumb, td } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/client";
import { deleteCategory } from "./actions";
import Link from "next/link";

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  const rows = db
    .select({
      c: categories,
      count: sql<number>`(select count(*) from products where products.category_id = ${categories.id})`,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder))
    .all();
  return (
    <>
      <PageHeader title="Categories" description="Group your idols into collections shown across the store." actions={<LinkButton href="/admin/categories/new">New category</LinkButton>} />
      <Table head={["Category", "Slug", "Products", "Status", ""]} empty="No categories yet.">
        {rows.map(({ c, count }) => (
          <tr key={c.id} className="transition hover:bg-ivory/40">
            <td className={td}>
              <Link href={`/admin/categories/${c.id}`} className="flex items-center gap-3 font-medium hover:text-maroon">
                <Thumb src={c.image} /> {c.name}
              </Link>
            </td>
            <td className={`${td} text-ink/50`}>/{c.slug}</td>
            <td className={td}>{count}</td>
            <td className={td}>{c.isActive ? <Badge tone="green">Active</Badge> : <Badge>Hidden</Badge>}</td>
            <td className={`${td} text-right`}>
              <ActionButton action={deleteCategory.bind(null, c.id)} confirm={`Delete “${c.name}”?`}>Delete</ActionButton>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
