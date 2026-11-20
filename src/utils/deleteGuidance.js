// Plain-language guidance for permanent deletes that the system must refuse (a student with payment
// records, a teacher who still has classes, or a database "still linked" error). Every guidance
// object carries BOTH languages, so the dialog can render in whichever language is active — even if
// it is switched while the dialog is open.
//
// shape: { kind, en: Copy, so: Copy }, Copy = { title, intro, stepsTitle, steps[], altTitle?, alt? }

const num = (n, one, many) => (n === 1 ? one : many);

export function studentPaymentsGuidance({ name, count = 0 }) {
  const n = Number(count) || 0;
  return {
    kind: "student-payments",
    studentStatus: true,
    en: {
      title: "This student can't be deleted",
      intro: `${name} has ${n > 0 ? `${n} payment ${num(n, "record", "records")}` : "payment records"} on file. Payments are permanent financial history: a payment can be voided, but it is never erased — and a student with any payment on file (even a voided one) is protected from permanent deletion.`,
      stepsTitle: "What to do instead",
      steps: [
        `Open ${name}'s profile and tap Edit.`,
        "Change Status to Withdrawn (left the school), Transferred (moved to another school), Graduated or Archived.",
        "Tap Save Changes.",
        "The student leaves class lists, attendance and new fee billing, while the payment history and receipts stay correct.",
      ],
      altTitle: "Added by mistake?",
      alt: "If a payment was recorded under the wrong student, open the Payments tab and Void it with a reason, then record it again under the correct student. The student still stays on file — use Archived to hide them.",
    },
    so: {
      title: "Ardaygan lama tirtiri karo",
      intro: `${name} wuxuu leeyahay ${n > 0 ? `${n} diiwaan lacag-bixin` : "diiwaanno lacag-bixin"}. Lacag-bixintu waa taariikh maaliyadeed oo joogto ah: waa la burin karaa, laakiin marnaba lama tirtiro — arday leh lacag-bixin kasta oo diiwaan ku jirta (xitaa mid la buriyay) si joogto ah looma tirtiri karo.`,
      stepsTitle: "Waxa aad ka samayn karto beddelkeeda",
      steps: [
        `Fur profile-ka ${name}, ka dibna taabo Wax ka beddel (Edit).`,
        "Xaaladda (Status) u beddel Iska bixiyay (Withdrawn) haddii uu dugsiga ka tagay, La wareejiyay (Transferred) haddii uu dugsi kale aaday, Qalinjebiyay (Graduated), ama La kaydiyay (Archived).",
        "Taabo Keydi Isbeddelada (Save Changes).",
        "Ardayga wuxuu ka baxayaa liisaska fasalka, xaadirinta iyo biilasha fiisaska cusub, halka taariikhda lacag-bixinta iyo rasiidhada ay sii ahaanayaan kuwo sax ah.",
      ],
      altTitle: "Haddii khalad lagu daray?",
      alt: "Haddii lacag-bixin lagu diiwaangeliyay arday khalad ah, fur tab-ka Lacag-bixinnada oo ku Buri sabab, ka dibna ku diiwaangeli arday sax ah. Ardaygu weli wuu ku sii jiraa diiwaanka — isticmaal La kaydiyay (Archived) si aad u qarisid.",
    },
  };
}

export function teacherAssignedGuidance({ name, pairs = 0, headClasses = [] }) {
  const head = headClasses.length ? headClasses.join(", ") : "";
  const parts = [];
  const partsSo = [];
  if (pairs > 0) { parts.push(`${pairs} class/subject ${num(pairs, "assignment", "assignments")}`); partsSo.push(`${pairs} meelayn fasal/maado`); }
  if (head) { parts.push(`head teacher of ${head}`); partsSo.push(`macallinka madaxa ee ${head}`); }
  const steps = [
    `Go to Teachers, tap Edit on ${name}, remove every class + subject assignment, then Save.`,
  ];
  const stepsSo = [
    `Tag bogga Macallimiinta, ku taabo Wax ka beddel ${name}, ka saar meelayn kasta oo fasal + maado ah, ka dibna Keydi.`,
  ];
  if (head) {
    steps.push(`Go to Classes, open ${head} → Edit Class, change the Head teacher to someone else (or none), then Save.`);
    stepsSo.push(`Tag bogga Fasallada, fur ${head} → Wax ka beddel Fasalka, Macallinka madaxa ku beddel qof kale (ama midna), ka dibna Keydi.`);
  }
  steps.push("Come back to Teachers and tap Delete Teacher Permanently.");
  stepsSo.push("Ku laabo bogga Macallimiinta oo taabo Tirtir Macallinka Si Joogto Ah.");
  return {
    kind: "teacher-assigned",
    en: {
      title: "Remove this teacher's classes first",
      intro: `${name} is still assigned to teach (${parts.join(" and ")}). A teacher who is still teaching can't be deleted, so that timetables, attendance and results for those classes are not left without a teacher.`,
      stepsTitle: "Do these steps, in order",
      steps,
      altTitle: "Did the teacher just leave the school?",
      alt: "Use End Employment instead of deleting. It stops payroll, takes them off new class assignments and disables their login — while keeping their attendance, payroll and teaching history. This is the safest way to remove a teacher who has left.",
    },
    so: {
      title: "Marka hore ka saar fasallada macallinkan",
      intro: `${name} weli waxaa loo meeleeyay inuu dhigo (${partsSo.join(" iyo ")}). Macallin weli dhigaya lama tirtiri karo, si jadwalada, xaadirinta iyo natiijooyinka fasalladaasi aysan macallin la'aan u hadin.`,
      stepsTitle: "Samee tallaabooyinkan sida isku xigta",
      steps: stepsSo,
      altTitle: "Macallinku ma dugsiga ka tagay?",
      alt: "Halkii tirtirid, isticmaal Soo afjar Shaqada (End Employment). Waxay joojisaa mushaharka, ka saartaa meelaynta fasallada cusub, waxayna xirtaa gelitaankiisa — iyadoo la ilaalinayo xaadirintiisa, mushaharkiisa iyo taariikhda dhigiddiisa. Tani waa habka ugu badbaadsan ee loo saaro macallin ka tagay dugsiga.",
    },
  };
}

// The database refused for a reason the app could not predict (e.g. the teacher or student is still
// referenced by another record). Teach the same safe alternatives.
export function stillLinkedGuidance({ kind, name }) {
  if (kind === "student") {
    const g = studentPaymentsGuidance({ name, count: 0 });
    g.kind = "student-linked";
    g.en.intro = `${name} is still linked to records the system must keep (most often payment or fee records). Because of this the permanent delete was refused.`;
    g.so.intro = `${name} wuxuu weli ku xiran yahay diiwaanno nidaamku ilaalinayo (inta badan lacag-bixin ama diiwaanno fiis). Sidaa darteed tirtirista joogtada ah waa la diiday.`;
    return g;
  }
  // teacher / staff
  return {
    kind: "teacher-linked",
    en: {
      title: "This person can't be deleted right now",
      intro: `${name} is still linked to records the system must keep, so the permanent delete was refused. Nothing was deleted.`,
      stepsTitle: "What to do",
      steps: [
        "Teachers: open Edit and remove all class + subject assignments, and replace them as Head teacher in Classes (if any), then try again.",
        "If the person has left the school, use End Employment — it stops payroll, disables the login and keeps their history intact.",
        "Still stuck? Tell the system administrator the person's name and the time you tried.",
      ],
    },
    so: {
      title: "Qofkan hadda lama tirtiri karo",
      intro: `${name} weli wuxuu ku xiran yahay diiwaanno nidaamku ilaalinayo, sidaa darteed tirtirista joogtada ah waa la diiday. Waxba lama tirtirin.`,
      stepsTitle: "Waxa aad samayso",
      steps: [
        "Macallimiinta: fur Wax ka beddel oo ka saar dhammaan meelaynta fasallada + maadooyinka, kana beddel inuu yahay Macallinka madaxa Fasallada (haddii uu jiro), ka dibna mar kale isku day.",
        "Haddii qofku dugsiga ka tagay, isticmaal Soo afjar Shaqada (End Employment) — waxay joojisaa mushaharka, xirtaa gelitaanka, waxayna ilaalisaa taariikhdiisa.",
        "Weli ma xalliyeen? U sheeg maamulaha nidaamka magaca qofka iyo waqtiga aad isku dayday.",
      ],
    },
  };
}

// True when a raw database / edge-function error means "this row is still referenced elsewhere".
export function isStillLinkedError(message) {
  return /foreign key|violates|still referenced|database error deleting|23503|restrict/i.test(String(message || ""));
}
export function isPaymentLinkedError(message) {
  return /payment_allocations|student_fee_obligations|payment/i.test(String(message || ""));
}
