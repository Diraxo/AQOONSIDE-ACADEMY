// Hand-written Somali (Af-Soomaali) that is not part of the generated dictionary in so.js:
// status codes the app prints as-is, small helper words, and sentences added with the language feature.
// Keys are the exact English text; "{}" in a key matches any text, "{1}" in a value re-inserts it.
export const SO_EXTRA = {
  // ---- status / role codes shown as-is ----
  ACTIVE: "Hawlgal",
  ABSENT: "Maqan",
  SUSPENDED: "La hakiyay",
  DISABLED: "La xiray",
  TRANSFERRED: "La wareejiyay",
  GRADUATED: "Qalinjebiyay",
  WITHDRAWN: "Iska bixiyay",
  ARCHIVED: "La kaydiyay",
  ENDED: "Dhammaaday",
  PENDING: "La sugayo",
  APPROVED: "La ansixiyay",
  REJECTED: "La diiday",
  DRAFT: "Qabyo",
  PUBLISHED: "La daabacay",
  LOCKED: "La qufuliyay",
  UNLOCKED: "La furay",
  PAID: "La bixiyay",
  PARTIAL: "Qayb ahaan",
  UNPAID: "Aan la bixin",
  VOIDED: "La buriyay",
  GENERATED: "La sameeyay",
  READY: "Diyaar",
  COMPLETE: "Dhammaystiran",
  INCOMPLETE: "Aan dhammaystirnayn",
  CURRENT: "Hadda",
  OWNER: "Mulkiile",
  ADMIN: "Agaasimaha Waxbarashada",
  FINANCE: "Agaasimaha Maaliyadda",
  TEACHER: "Macallin",
  PARENT: "Waalid",
  STUDENT: "Arday",
  STAFF: "Shaqaale",

  // ---- subjects, grades, payment methods ----
  ICT: "Teknoolajiyada (ICT)",
  KG1: "Barbaarin 1aad (KG1)",
  KG2: "Barbaarin 2aad (KG2)",
  "E-birr": "E-birr",
  "E-sahal": "E-sahal",
  "ACC/Bank": "Bangi / Akoon",

  // ---- common small phrases ----
  Search: "Raadi",
  "Search…": "Raadi…",
  "Loading…": "Waa soo dhacayaa…",
  "No data": "Xog ma jirto",
  Welcome: "Soo dhawoow",
  "Good morning": "Subax wanaagsan",
  students: "arday",
  student: "arday",
  parents: "waalidiin",
  parent: "waalid",
  teachers: "macallimiin",
  teacher: "macallin",
  classes: "fasallo",
  days: "maalmood",
  day: "maalin",
  months: "bilood",
  month: "bil",
  "Got it": "Waan fahmay",

  // ---- delete confirmations (updated wording) ----
  "This will permanently delete this student's information and associated records — enrollment history, attendance, behavior, results and documents. A student who has any payment record cannot be deleted (use Withdrawn or Archived instead). This action cannot be undone.":
    "Tani waxay si joogto ah u tirtiraysaa macluumaadka ardaygan iyo diiwaannada la xiriira — taariikhda diiwaangelinta, xaadirinta, anshaxa, natiijooyinka iyo dukumeentiyada. Arday leh diiwaan lacag-bixin kasta lama tirtiri karo (halkii isticmaal Iska bixiyay ama La kaydiyay). Tallaabadan dib looma celin karo.",
  "This permanently removes {}'s login, staff/payroll record, and class/subject assignments. Homework, results, and behavior records they already entered stay on students' history. A teacher who is still assigned to classes must have those assignments removed first (or use End Employment instead). This can't be undone.":
    "Tani waxay si joogto ah u saaraysaa gelitaanka {1}, diiwaankiisa shaqaalaha/mushaharka, iyo meelaynta fasallada/maadooyinka. Hawlaha guriga, natiijooyinka iyo diiwaannada anshaxa ee uu horey u geliyay way sii jiraan taariikhda ardayda. Macallin weli loo meelaynayo fasallo waa in marka hore laga saaraa meelaynta (ama isticmaal Soo afjar Shaqada). Dib looma celin karo.",
  "Status changed to Withdrawn.": "Xaaladda waxaa loo beddelay Iska bixiyay.",
  "Student archived.": "Ardayga waa la kaydiyay.",
  "Mark as Withdrawn": "U calaamadi Iska bixiyay",
  "Archive student": "Kaydi ardayga",

  // ---- Ethiopian-calendar months (printed by the app) ----
};
