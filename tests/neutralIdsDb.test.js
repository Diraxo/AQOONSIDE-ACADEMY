// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bootReplica, inTx } from "./helpers/pgReplica.js";

// Student and staff identifiers are neutral (no school initials, no academic year) and unique.
let db;
beforeAll(async () => { db = await bootReplica(); }, 240000);
afterAll(async () => { await db?.close?.(); });

describe("neutral identifiers", () => {
  it("generate_student_id returns STU-NNNNNN, strictly increasing and never repeating", async () => {
    await inTx(db, async (s) => {
      const a = (await s.admin("select public.generate_student_id() v")).rows[0].v;
      const b = (await s.admin("select public.generate_student_id() v")).rows[0].v;
      expect(a).toMatch(/^STU-\d{6}$/);
      expect(b).toMatch(/^STU-\d{6}$/);
      expect(Number(b.slice(4))).toBeGreaterThan(Number(a.slice(4)));
    });
  });

  it("the staff trigger assigns EMP-NNNNNN when no number is supplied", async () => {
    await inTx(db, async (s) => {
      const r = await s.admin("insert into public.staff (name, position, employment_date) values ('A', 'Guard', current_date) returning employee_number");
      expect(r.ok, r.msg).toBe(true);
      expect(r.rows[0].employee_number).toMatch(/^EMP-\d{6}$/);
    });
  });
});
