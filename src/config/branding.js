// Single source of truth for the school's identity. UI, printable documents, the manifest copy
// and notification titles read from here instead of repeating the name or logo path.
// Colours below were sampled from the pixels of the official emblem (src/assets/aqoonside-logo-original.jpeg)
// and are mirrored in tailwind.config.js (`brand` = royal blue, `gold` = golden yellow).
import logoUri from "../assets/aqoonside-logo-original.jpeg?inline";
import stampUri from "../assets/school-stamp.png?inline";
import cashierSignatureUri from "../assets/cashier-signature.png?inline";

export const SCHOOL_NAME = "AQOONSIDE SCHOOL";

// Full registered name as printed on the school's cash voucher pad (receipt header only).
export const SCHOOL_FULL_NAME = "AQOONSIDE PRIMARY, INTERMEDIATE & SECONDARY SCHOOL";
export const SCHOOL_FULL_NAME_AM = "አቆንሲዴ አንደኛ፣ መካከለኛና ሁለተኛ ደረጃ ትምህርት ቤት";
export const SCHOOL_MOTTO = "Knowledge, Character & Excellence";
export const SCHOOL_PORTAL_LABEL = "School Portal";

// Official emblem, inlined as a data URI so html2canvas / PDF export never hits a cross-origin fetch.
export const SCHOOL_LOGO = logoUri;

// Official school stamp and the finance cashier's signature (transparent PNGs), inlined for the same reason.
export const SCHOOL_STAMP = stampUri;
export const CASHIER_SIGNATURE = cashierSignatureUri;

export const SCHOOL_COLORS = {
  blue: "#103E95",
  gold: "#FBC11F",
  red: "#D32521",
  white: "#FFFFFF",
};

// School-owned details. Left empty on purpose: documents print a line only when its value is set.
// TODO(school): supply the official address and phone number(s) — nothing is invented here.
export const SCHOOL_CONTACT = {
  region: "",
  city: "",
  address: "",
  phones: ["+251 91 574 8367"],
};

export const SCHOOL_CONTACT_LINE = [SCHOOL_CONTACT.address, ...SCHOOL_CONTACT.phones].filter(Boolean).join("  ·  ");
export const SCHOOL_CONTACT_TEL_LINE = SCHOOL_CONTACT.phones.length ? `Tel: ${SCHOOL_CONTACT.phones.join(" / ")}` : "";
