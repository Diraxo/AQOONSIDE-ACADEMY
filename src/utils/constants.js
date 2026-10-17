import { SCHOOL_LOGO } from "../config/branding";

const ROLES = { OWNER: "OWNER", ADMIN: "ADMIN", FINANCE: "FINANCE", TEACHER: "TEACHER", PARENT: "PARENT" };
// Display-only relabel: the ADMIN role's internal key/behavior is unchanged, it just reads
// as "Educational Director" everywhere in the UI now that OWNER sits above it.
const ROLE_LABEL = { OWNER: "Owner", ADMIN: "Educational Director", FINANCE: "Finance & Operations Director", TEACHER: "Teacher", PARENT: "Parent" };
const ACCOUNT_STATUS = ["ACTIVE", "SUSPENDED", "DISABLED"];
// Separate from ACCOUNT_STATUS (login access) — whether the person is currently employed by the
// school. See src/utils/staffEmploymentStatus.js's employmentActiveOn for the date-based rule this
// backs, and DataContext's endEmployment/reactivateEmployment for the only mutators that set it.
const EMPLOYMENT_STATUSES = ["ACTIVE", "ENDED"];
const STAFF_POSITIONS = ["Teacher", "Educational Director", "Finance Director", "Cleaner", "Guard", "Driver", "Cook", "Other"];
const STUDENT_STATUS = ["ACTIVE", "ABSENT", "SUSPENDED", "TRANSFERRED", "GRADUATED", "WITHDRAWN", "ARCHIVED"];
const BEHAVIOR_TYPES = ["Positive", "Warning", "Fighting", "Late", "Disrespect", "Academic concern", "Other"];
const SEVERITIES = ["Low", "Medium", "High"];
const ATTENDANCE_STATUSES = ["Present", "Late", "Sick", "Permission", "Excused", "Absent"];
const ATTENDANCE_STATUS_TONE = { Present: "green", Late: "amber", Sick: "indigo", Permission: "sky", Excused: "slate", Absent: "red" };
// A teacher with one of these staff-attendance statuses is genuinely unavailable for their own
// periods today, so those periods need substitute coverage. Present/Late never trigger this —
// a Late teacher is still expected to take their own class. Shared so the timetable's Today's
// Journal, getPeriodCoverage, canTakePeriodAttendance's ED exception, and the Staff Attendance
// page's per-teacher "needs substitute" list all agree on exactly the same rule.
const TEACHER_UNAVAILABLE_STATUSES = ["Absent", "Sick", "Permission"];
// Shift-based staff (e.g. a driver's morning school run vs. afternoon run) record attendance
// twice a day instead of once — see staff.hasShifts and staffAttendance's `period` field.
const STAFF_SHIFT_PERIODS = ["AM", "PM"];
const STAFF_SHIFT_PERIOD_LABEL = { AM: "Morning", PM: "Afternoon", FULL_DAY: "" };
const LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED"];
// Statuses a leave/permission request can grant — Late/Absent aren't requestable in advance.
const LEAVE_REQUEST_REASONS = ["Sick", "Permission", "Excused"];
// Quick-pick reasons for a school closure — free text is still allowed alongside these.
const CLOSURE_REASON_PRESETS = ["Government Holiday", "National Celebration", "Emergency Closure", "Other"];
// Groups a staff position into the three buckets the Owner/Educational Director permission
// matrix and Staff Attendance page organize by — shared so DataContext's permission checks and
// the UI's grouping always agree on who counts as a "Director".
function staffGroupLabel(position) {
  if (position === "Educational Director" || position === "Finance Director") return "Directors";
  if (position === "Teacher") return "Teachers";
  return "Other Staff";
}
const SCHOOL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
function todayDayName() { return SCHOOL_DAYS[new Date().getDay() - 1] || null; } // null on weekends
// Same as todayDayName but for an arbitrary date key — used wherever a picked date (not just
// today) needs to resolve to a school-day name, e.g. a parent browsing a past date's periods.
function dayNameForDate(dateKey) { return SCHOOL_DAYS[new Date(dateKey + "T00:00:00").getDay() - 1] || null; }
// Turns raw cycle counts into month/date coverage so a parent sees "paid through November", not just "2 of 4 cycles".
function academicYearStart() {
  const now = new Date();
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1; // school year starts September
  return new Date(year, 8, 1);
}
function addMonthsFloat(date, months) {
  const d = new Date(date);
  d.setDate(d.getDate() + Math.round(months * 30.44));
  return d;
}
// `start` should be the active academic year's start date (see activeYearStartDate in
// academicCalendar.js) — defaults to the Sept-1 guess only for callers that don't have a
// configured calendar in scope.
function feeCoverage(paidUnits, feeType, start = academicYearStart()) {
  const monthsPaid = paidUnits * feeType.unitMonths;
  const totalMonths = feeType.unitsPerYear * feeType.unitMonths;
  const coveredThrough = monthsPaid > 0 ? addMonthsFloat(start, monthsPaid) : null;
  const remainingMonths = Math.max(0, totalMonths - monthsPaid);
  const remainingFrom = coveredThrough || start;
  const remainingTo = remainingMonths > 0 ? addMonthsFloat(remainingFrom, remainingMonths) : null;
  return { start, coveredThrough, remainingMonths, remainingFrom, remainingTo, totalMonths, monthsPaid };
}
const SUBJECTS = ["English", "Mathematics", "Science", "Somali", "Amharic", "Social Studies", "ICT"];
const MIN_PERIODS = 1;
const MAX_PERIODS = 8;
const DEFAULT_TIMETABLE_CONFIG = { periodsCount: 5, startTime: "08:00", periodDurationMins: 45, breakDurationMins: 15, breakAfterPeriod: 3 };
const GRADES = ["KG1", "KG2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const SECTIONS = ["", "A", "B"];
function sectionLabel(s) { return s ? `Section ${s}` : "None"; }
// Orders two {grade, section}-shaped objects (classes, students, homework...) by GRADES' canonical
// order (KG1, KG2, Grade 1...Grade 12), then by section — shared so every grade/class list sorts
// the same way instead of drifting between ad-hoc localeCompare calls.
function gradeSectionCompare(a, b) {
  const gi = GRADES.indexOf(a.grade) - GRADES.indexOf(b.grade);
  return gi !== 0 ? gi : (a.section || "").localeCompare(b.section || "");
}
// THE grade ordering for every list of grades (selectors, tabs, overview rows, apply targets): KG1, KG2,
// Grade 1 ... Grade 12 by GRADES; a grade GRADES doesn't know sorts after the known ones, numerically.
// Never sort grade labels as text — that gives "Grade 10, 11, 12, 9".
function gradeRank(g) { const i = GRADES.indexOf(g); return i === -1 ? GRADES.length : i; }
function compareGrades(a, b) { return gradeRank(a) - gradeRank(b) || String(a).localeCompare(String(b), undefined, { numeric: true }); }
function sortGrades(list) { return [...list].sort(compareGrades); }
const STORAGE_KEY = "tma_school_db_v1";
const CURRENCY = "Birr";
const DEFAULT_PAYMENT_METHODS = ["Cash", "HelloCash", "E-birr", "Sahay", "E-sahal", "ACC/Bank", "Kaafi"];
function formatMoney(n) { return `${Math.round(n).toLocaleString()} ${CURRENCY}`; }

// AQOONSIDE SCHOOL brand palette — see tailwind.config.js for the full `brand` (royal blue) and
// `gold` (golden yellow) colour scales; identity strings and the logo live in ../config/branding.js.
const BRAND = {
  primary: "brand-600",
  primaryHover: "brand-700",
  primarySoft: "brand-50",
  accent: "gold-400",
  accentSoft: "gold-50",
};

const LOGO_DATA_URI = SCHOOL_LOGO;

const REPORT_CARD_STATUS = ["DRAFT", "READY", "GENERATED", "PUBLISHED", "LOCKED"];

// Results model: Student → Subject → Semester → Assessment → Score. Semesters are independent
// 100-point containers (no gating between them). The assessment structure itself (names, weights,
// Test/Non-test) is NOT defined here — the Owner/Educational Director configures it per academic
// year + semester + grade in Results Settings (result_configurations); the only universal rule is
// that a structure's weights total RESULT_TOTAL_WEIGHT.
const SEMESTERS = ["S1", "S2"];
const SEMESTER_LABEL = { S1: "Semester 1", S2: "Semester 2" };
const RESULT_TOTAL_WEIGHT = 100;
const ASSESSMENT_KIND = { TEST: "TEST", NON_TEST: "NON_TEST" };
const ASSESSMENT_KIND_LABEL = { TEST: "Test", NON_TEST: "Non-test" };
const RESULT_PUBLISH_STATUS = ["DRAFT", "PUBLISHED", "LOCKED"];
// Component scores accept decimals (e.g. 15.5) for partial credit. Rounding to 2 decimal places
// clears binary floating-point noise (0.1 + 0.2 style artifacts) from summed/averaged scores
// without discarding any precision a teacher would realistically enter.
function round2(n) { return Math.round(n * 100) / 100; }
// A semester result is "Incomplete" (no total, never a partial percentage) until every
// assessment of ITS configured structure has a score — the total is always derived, never
// hand-typed, and a missing score is never treated as 0. `record` may be null/undefined (no result
// saved yet for this student+subject+semester). `record.assessments` is the structure the record
// is pinned to ([{ id, name, weight, kind }], attached by DataContext) and `record.components` maps
// assessment id -> { score, ... }, so this works for ANY configuration totalling 100.
// `entered`/`enteredWeight` describe partial progress ("59 of 100 points entered so far").
function computeSemesterResult(record) {
  const assessments = record && Array.isArray(record.assessments) ? record.assessments : [];
  const requiredCount = assessments.length;
  const totalWeight = round2(assessments.reduce((sum, a) => sum + a.weight, 0));
  if (!record || requiredCount === 0) {
    return { completionStatus: "INCOMPLETE", total: null, completedCount: 0, requiredCount, entered: 0, enteredWeight: 0, totalWeight, remainingWeight: totalWeight };
  }
  const scored = assessments.filter((a) => {
    const c = record.components?.[a.id];
    return c && c.score !== null && c.score !== undefined;
  });
  const completedCount = scored.length;
  const entered = round2(scored.reduce((sum, a) => sum + record.components[a.id].score, 0));
  const enteredWeight = round2(scored.reduce((sum, a) => sum + a.weight, 0));
  const completionStatus = completedCount === requiredCount ? "COMPLETE" : "INCOMPLETE";
  return {
    completionStatus,
    total: completionStatus === "COMPLETE" ? entered : null,
    completedCount, requiredCount, entered, enteredWeight, totalWeight,
    remainingWeight: round2(totalWeight - enteredWeight),
  };
}

export {
  ROLES, ROLE_LABEL, ACCOUNT_STATUS, EMPLOYMENT_STATUSES, STAFF_POSITIONS, STUDENT_STATUS, BEHAVIOR_TYPES, SEVERITIES,
  ATTENDANCE_STATUSES, ATTENDANCE_STATUS_TONE, TEACHER_UNAVAILABLE_STATUSES, STAFF_SHIFT_PERIODS, STAFF_SHIFT_PERIOD_LABEL, LEAVE_STATUSES, LEAVE_REQUEST_REASONS,
  CLOSURE_REASON_PRESETS, staffGroupLabel, SCHOOL_DAYS,
  todayDayName, dayNameForDate, academicYearStart, addMonthsFloat, feeCoverage,
  SUBJECTS, GRADES, SECTIONS, sectionLabel, gradeSectionCompare, gradeRank, compareGrades, sortGrades,
  MIN_PERIODS, MAX_PERIODS, DEFAULT_TIMETABLE_CONFIG,
  STORAGE_KEY, CURRENCY, DEFAULT_PAYMENT_METHODS, formatMoney,
  BRAND, LOGO_DATA_URI, REPORT_CARD_STATUS,
  SEMESTERS, SEMESTER_LABEL, RESULT_TOTAL_WEIGHT, ASSESSMENT_KIND, ASSESSMENT_KIND_LABEL,
  RESULT_PUBLISH_STATUS, computeSemesterResult, round2,
};
