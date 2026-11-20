import React, { useState } from "react";
import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
import { setLang, getLang, translateToSomali, L } from "../src/i18n/core";
import { startDomTranslator } from "../src/i18n/domTranslator";
import { LanguageSwitcher } from "../src/i18n/LanguageContext";
import { DeleteBlockedDialog } from "../src/components/ui";
import { studentPaymentsGuidance, teacherAssignedGuidance } from "../src/utils/deleteGuidance";

const tick = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

function Demo() {
  const [name, setName] = useState("Hodan");
  const [n, setN] = useState(3);
  return (
    <div>
      <h1>Students</h1>
      <p>Welcome, {name}</p>
      <p>Correction window: {n} day{n === 1 ? "" : "s"} remaining. Every change is recorded in the change history.</p>
      <input placeholder="Search name or student ID…" />
      <button onClick={() => { setName("Hibo"); setN(1); }}>Add Student</button>
      <span translate="no">Add Student</span>
    </div>
  );
}

beforeEach(() => { setLang("en"); });
afterEach(() => { cleanup(); setLang("en"); });

describe("Somali language layer", () => {
  it("defaults to English", () => {
    expect(getLang()).toBe("en");
    expect(L("a", "b")).toBe("a");
  });

  it("translates sentences, whole-sentence templates and placeholders, and switches back", async () => {
    startDomTranslator();
    render(<Demo />);
    await tick();
    expect(screen.getByText("Students")).toBeTruthy();

    act(() => setLang("so"));
    await tick();
    expect(screen.getByText("Ardayda")).toBeTruthy();
    expect(screen.getByText("Soo dhawoow, Hodan")).toBeTruthy();
    expect(screen.getByText(/Muddada hagaajinta: 3 maalin ayaa harsan/)).toBeTruthy();
    expect(screen.getByPlaceholderText("Raadi magac ama aqoonsiga ardayga…")).toBeTruthy();
    // marked translate="no" stays English
    expect(document.querySelector('span[translate="no"]').textContent).toBe("Add Student");

    // React updating the text while Somali is on is translated again (no English leaks back)
    fireEvent.click(screen.getByRole("button"));
    await tick();
    expect(screen.getByText("Soo dhawoow, Hibo")).toBeTruthy();
    expect(screen.getByText(/Muddada hagaajinta: 1 maalin ayaa harsan/)).toBeTruthy();

    act(() => setLang("en"));
    await tick();
    expect(screen.getByText("Students")).toBeTruthy();
    expect(screen.getByText("Welcome, Hibo")).toBeTruthy();
    expect(screen.getByPlaceholderText("Search name or student ID…")).toBeTruthy();
  });

  it("language switcher toggles and persists", async () => {
    startDomTranslator();
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: "SO" }));
    expect(getLang()).toBe("so");
    expect(localStorage.getItem("aqoonside.lang")).toBe("so");
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(getLang()).toBe("en");
  });

  it("translates composite labels around separators and dates", () => {
    expect(translateToSomali("2019-2020 E.C. — current")).toBe("2019-2020 E.C. — hadda");
    expect(translateToSomali("12 November 2026")).toBe("12 Nofembar 2026");
    expect(translateToSomali("Ahmed Ali was permanently deleted.")).toBe("Ahmed Ali waa la tirtiray si joogto ah.");
  });

  it("delete guidance explains the block and the exact steps in both languages", async () => {
    startDomTranslator();
    const student = studentPaymentsGuidance({ name: "Hodan Ali", count: 2 });
    const { rerender } = render(<DeleteBlockedDialog guidance={student} onClose={() => {}} actions={[{ en: "Archive student", so: "Kaydi ardayga", onClick: () => {} }]} />);
    expect(screen.getByText("This student can't be deleted")).toBeTruthy();
    expect(screen.getByText(/2 payment records/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Archive student" })).toBeTruthy();
    act(() => setLang("so"));
    await tick();
    expect(screen.getByText("Ardaygan lama tirtiri karo")).toBeTruthy();
    expect(screen.getByText(/Fur profile-ka Hodan Ali/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Kaydi ardayga" })).toBeTruthy();
    rerender(<DeleteBlockedDialog guidance={teacherAssignedGuidance({ name: "Cali", pairs: 2, headClasses: ["5A"] })} onClose={() => {}} />);
    expect(screen.getByText("Marka hore ka saar fasallada macallinkan")).toBeTruthy();
    expect(screen.getByText(/Soo afjar Shaqada/)).toBeTruthy();
  });
});
