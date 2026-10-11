import { asc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge, Card, EmptyState, Field, Input, PageHeader, Select } from "@/components/admin/ui";
import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/client";
import { changeOwnPassword, createTeamMember, resetTeamPassword, setTeamMemberActive, setTeamMemberRole } from "./actions";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const session = await requireAdmin();
  const isAdmin = session.role === "admin";
  const team = db.select().from(users).where(inArray(users.role, ["admin", "staff"])).orderBy(asc(users.createdAt)).all();
  const activeAdmins = team.filter((u) => u.role === "admin" && u.isActive).length;

  return (
    <>
      <PageHeader title="Team" description="People who can sign in to this control room. Admins manage everything; staff can run orders and content but not the team." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {team.length === 0 ? (
            <EmptyState title="No team members" />
          ) : (
            <ul className="space-y-3">
              {team.map((u) => {
                const me = u.id === session.uid;
                const lastAdmin = u.role === "admin" && u.isActive && activeAdmins <= 1;
                return (
                  <li key={u.id} className={`rounded-[1.5rem] bg-white p-5 ring-1 ring-ink/[0.06] ${u.isActive ? "" : "opacity-70"}`}>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-lg ${u.role === "admin" ? "bg-maroon text-gold-bright" : "bg-ivory text-maroon ring-1 ring-ink/[0.06]"}`}>
                        {u.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 font-medium">
                          {u.name}
                          {me && <span className="text-[11px] font-normal text-ink/45">(you)</span>}
                        </p>
                        <p className="truncate text-xs text-ink/50">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge tone={u.role === "admin" ? "maroon" : "blue"}>{u.role}</Badge>
                        {u.isActive ? <Badge tone="green">Active</Badge> : <Badge>Deactivated</Badge>}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-ink/[0.05] pt-3">
                      <span className="mr-auto text-[11px] text-ink/40">Added {formatDate(u.createdAt)}</span>
                      {isAdmin && !me && (
                        <>
                          {u.role === "staff" ? (
                            <ActionButton action={setTeamMemberRole.bind(null, u.id, "admin")} confirm={`Make ${u.name} an admin? They'll be able to manage the team and settings.`}>Make admin</ActionButton>
                          ) : (
                            !lastAdmin && <ActionButton action={setTeamMemberRole.bind(null, u.id, "staff")} confirm={`Change ${u.name} to staff?`}>Make staff</ActionButton>
                          )}
                          {u.isActive ? (
                            !lastAdmin && (
                              <ActionButton action={setTeamMemberActive.bind(null, u.id, false)} confirm={`Deactivate ${u.name}? They won't be able to sign in.`} className="text-sindoor hover:bg-sindoor/10 hover:text-sindoor">
                                Deactivate
                              </ActionButton>
                            )
                          ) : (
                            <ActionButton action={setTeamMemberActive.bind(null, u.id, true)} variant="secondary">Reactivate</ActionButton>
                          )}
                        </>
                      )}
                      {isAdmin && (
                        <details className="group w-full sm:w-auto">
                          <summary className="inline-flex h-8 cursor-pointer list-none items-center rounded-full px-3.5 text-xs font-medium text-ink/70 transition hover:bg-ink/[0.05] hover:text-ink [&::-webkit-details-marker]:hidden">
                            {me ? "Set new password" : "Reset password"}
                          </summary>
                          <ActionForm action={resetTeamPassword.bind(null, u.id)} resetOnSuccess className="mt-2 flex gap-2" confirm={me ? undefined : `Set a new password for ${u.name}?`}>
                            <Input name="password" type="password" minLength={8} required placeholder="New password (8+ chars)" autoComplete="new-password" className="min-w-0 flex-1 sm:w-56" />
                            <SubmitButton size="sm" className="h-auto">Save</SubmitButton>
                          </ActionForm>
                        </details>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          {isAdmin && (
            <Card title="Add team member" description="They'll sign in at /admin/login with this email and password.">
              <ActionForm action={createTeamMember} resetOnSuccess className="space-y-4">
                <Field label="Full name"><Input name="name" required maxLength={80} autoComplete="off" /></Field>
                <Field label="Email"><Input name="email" type="email" required autoComplete="off" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Role">
                    <Select name="role" defaultValue="staff">
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </Field>
                  <Field label="Phone"><Input name="phone" type="tel" maxLength={20} /></Field>
                </div>
                <Field label="Password" hint="At least 8 characters — share it privately">
                  <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
                </Field>
                <SubmitButton className="w-full">Add member</SubmitButton>
              </ActionForm>
            </Card>
          )}
          <Card title="Change your password">
            <ActionForm action={changeOwnPassword} resetOnSuccess className="space-y-4">
              <Field label="Current password"><Input name="current" type="password" required autoComplete="current-password" /></Field>
              <Field label="New password" hint="At least 8 characters"><Input name="next" type="password" required minLength={8} autoComplete="new-password" /></Field>
              <Field label="Confirm new password"><Input name="confirm" type="password" required minLength={8} autoComplete="new-password" /></Field>
              <SubmitButton variant="secondary" className="w-full">Update password</SubmitButton>
            </ActionForm>
          </Card>
        </div>
      </div>
    </>
  );
}
