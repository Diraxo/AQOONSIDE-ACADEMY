import { describe, it, expect } from "vitest";
import { dueUpcomingYear, academicYearAccess } from "../src/utils/academicYearScope";

const y = (o) => ({ id: o.id, yearStart: o.s, yearEnd: o.e, isCurrent: !!o.cur, closedAt: o.closed ?? null, resultFinalizationGraceDays: 15 });
const OLD = y({ id: "old", s: "2025-09-11", e: "2026-07-07", cur: true });
const NEXT = y({ id: "next", s: "2026-09-11", e: "2027-07-07" });

describe("dueUpcomingYear", () => {
  it("is null before the start date", () => {
    expect(dueUpcomingYear([OLD, NEXT], "2026-09-10")).toBeNull();
  });
  it("returns the upcoming year on and after its start date", () => {
    expect(dueUpcomingYear([OLD, NEXT], "2026-09-11").id).toBe("next");
    expect(dueUpcomingYear([OLD, NEXT], "2026-10-16").id).toBe("next");
  });
  it("ignores the current year, closed years and years already over", () => {
    expect(dueUpcomingYear([OLD], "2026-01-01")).toBeNull();
    expect(dueUpcomingYear([OLD, y({ id: "c", s: "2024-09-11", e: "2025-07-07", closed: "2025-08-01" })], "2025-01-01")).toBeNull();
    expect(dueUpcomingYear([OLD, NEXT], "2027-08-01")).toBeNull();
  });
  it("never replaces a newer current year with an older upcoming one", () => {
    const newer = y({ id: "n", s: "2026-09-11", e: "2027-07-07", cur: true });
    expect(dueUpcomingYear([newer, y({ id: "o", s: "2025-09-11", e: "2027-12-01" })], "2026-10-01")).toBeNull();
  });
});

describe("academicYearAccess", () => {
  it("never limits the Owner, Director or Finance", () => {
    expect(academicYearAccess("OWNER", [OLD], "2027-01-01").state).toBe("open");
    expect(academicYearAccess("ADMIN", [OLD], "2027-01-01").state).toBe("open");
  });
  it("stays open while the year runs and through its finalization window", () => {
    expect(academicYearAccess("TEACHER", [OLD], "2026-03-01").state).toBe("open");
    expect(academicYearAccess("TEACHER", [OLD], "2026-07-20").state).toBe("open"); // ended, inside 15 days
  });
  it("blocks teachers and makes parents read-only once the year has closed", () => {
    expect(academicYearAccess("TEACHER", [OLD, NEXT], "2026-08-01").state).toBe("blocked");
    const parent = academicYearAccess("PARENT", [OLD, NEXT], "2026-08-01");
    expect(parent.state).toBe("read_only");
    expect(parent.year.id).toBe("old");
  });
  it("reopens by itself when the next year becomes current", () => {
    const next = { ...NEXT, isCurrent: true };
    const old = { ...OLD, isCurrent: false, closedAt: "2026-09-11" };
    expect(academicYearAccess("TEACHER", [old, next], "2026-09-11").state).toBe("open");
  });
  it("is not a 'year ended' situation when no year exists yet", () => {
    expect(academicYearAccess("TEACHER", [], "2026-09-11").state).toBe("open");
  });
});

import { expensesForYear } from "../src/utils/academicYearScope";
describe("expensesForYear", () => {
  const years = [{ ...OLD, isCurrent: false, closedAt: "2026-09-11" }, { ...NEXT, isCurrent: true }];
  const ex = [{ id: 1, date: "2026-01-05" }, { id: 2, date: "2026-08-01" }, { id: 3, date: "2026-10-01" }];
  it("each expense belongs to exactly one year; the new year starts empty", () => {
    expect(expensesForYear(ex, years, years[0]).map((e) => e.id)).toEqual([1]);
    expect(expensesForYear(ex, years, years[1]).map((e) => e.id)).toEqual([2, 3]);
    expect(expensesForYear(ex.slice(0, 1), years, years[1])).toEqual([]);
  });
});
