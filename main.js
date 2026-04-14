/* ── MedicareCostGuide main.js ── */

function safeBind(label, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[MCG] ${label} failed`, error);
  }
}

/* ── Mobile nav toggle ── */
function wireMenu() {
  const btn = document.querySelector(".mcg-menu-toggle");
  const nav = document.querySelector(".mcg-mobile-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });
}

/* ── Cookie banner ── */
function wireCookieBanner() {
  const banner = document.querySelector(".mcg-cookie-banner");
  if (!banner) return;

  const buttons = banner.querySelectorAll("[data-cookie-action]");
  banner.hidden = false;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      banner.hidden = true;
    });
  });
}
/* ── FAQ accordion (details elements already native) ── */
function wireFAQ() {
  document.querySelectorAll(".mcg-faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      const content = item.querySelector("p");
      if (!content) return;
      content.style.opacity = "0";
      content.style.transform = "translateY(-8px)";
      requestAnimationFrame(() => {
        content.style.transition = "opacity 0.25s ease, transform 0.25s ease";
        content.style.opacity = "1";
        content.style.transform = "translateY(0)";
      });
    });
  });
}

/* ── Local navigation uses real relative href values ── */
function wireLocalPreviewLinks() {
  // Intentionally empty: direct relative hrefs handle file:// and http:// navigation.
}

/* ── Calculator: Medicare Premium Calculator ── */
function wirePremiumCalculator() {
  const form = document.getElementById("premium-calc-form");
  if (!form) return;

  function calculate() {
    const age = parseInt(form.querySelector('[name="age"]')?.value || "65", 10);
    const partAEligible = form.querySelector('[name="partA"]')?.value || "yes";
    const income = form.querySelector('[name="income"]')?.value || "under103k";
    const wantPartD = form.querySelector('[name="partD"]')?.value || "no";
    const wantMedigap = form.querySelector('[name="medigap"]')?.value || "no";
    const medigapPlan = form.querySelector('[name="medigapPlan"]')?.value || "G";

    let partACost = 0;
    if (partAEligible === "no") partACost = 505;

    const irmaaTable = {
      under103k: 174.7,
      "103k-129k": 244.6,
      "129k-161k": 349.4,
      "161k-193k": 454.2,
      "193k-500k": 559.0,
      over500k: 594.0,
    };
    const partBCost = irmaaTable[income] || 174.7;

    let partDCost = 0;
    if (wantPartD === "yes") partDCost = 55.5;

    let medigapCost = 0;
    if (wantMedigap === "yes") {
      const medigapPrices = {
        A: 120, B: 130, C: 200, D: 140, F: 220,
        G: 165, K: 80, L: 110, M: 130, N: 135,
      };
      medigapCost = medigapPrices[medigapPlan] || 165;
      if (age > 70) medigapCost += (age - 70) * 3;
    }

    const total = partACost + partBCost + partDCost + medigapCost;

    const setResult = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = `$${val.toFixed(2)}/mo`;
    };
    setResult("result-partA", partACost);
    setResult("result-partB", partBCost);
    setResult("result-partD", partDCost);
    setResult("result-medigap", medigapCost);
    setResult("result-total", total);
  }

  form.addEventListener("input", calculate);
  form.addEventListener("change", calculate);
  calculate();
}

/* ── Calculator: Medicare vs Advantage ── */
function wireComparisonCalculator() {
  const form = document.getElementById("comparison-calc-form");
  if (!form) return;

  function calculate() {
    const age = parseInt(form.querySelector('[name="age"]')?.value || "65", 10);
    const meds = parseInt(form.querySelector('[name="meds"]')?.value || "3", 10);
    const visits = parseInt(form.querySelector('[name="visits"]')?.value || "6", 10);
    const state = form.querySelector('[name="state"]')?.value || "FL";

    const partB = 174.7;
    const medigapG = 165 + (age > 70 ? (age - 70) * 3 : 0);
    const partD = 55.5;
    const partBDeductible = 240;
    const origMonthly = partB + medigapG + partD;
    const origAnnual = origMonthly * 12 + partBDeductible;

    const stateFactors = {
      FL: 0.9, TX: 0.95, CA: 1.1, NY: 1.15, PA: 1.0,
      OH: 0.92, IL: 1.0, AZ: 0.88, GA: 0.93, NC: 0.95,
    };
    const factor = stateFactors[state] || 1.0;
    const advPremium = 18.5 * factor;
    const advDrugCopay = meds * 15 * 12;
    const advVisitCopay = visits * 25;
    const advMonthly = partB + advPremium;
    const advAnnual = advMonthly * 12 + advDrugCopay + advVisitCopay;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = typeof val === "string" ? val : `$${val.toFixed(2)}`;
    };

    set("orig-monthly", origMonthly);
    set("orig-deductible", `$${partBDeductible}`);
    set("orig-oop-max", "Unlimited without Medigap");
    set("orig-annual", origAnnual);

    set("adv-monthly", advMonthly);
    set("adv-deductible", "$0–$250 typical");
    set("adv-oop-max", "$8,850");
    set("adv-annual", advAnnual);
  }

  form.addEventListener("input", calculate);
  form.addEventListener("change", calculate);
  calculate();
}

/* ── Calculator: Drug Cost Estimator ── */
function wireDrugCalculator() {
  const form = document.getElementById("drug-calc-form");
  if (!form) return;

  function calculate() {
    const numDrugs = parseInt(form.querySelector('[name="numDrugs"]')?.value || "3", 10);
    const drugType = form.querySelector('[name="drugType"]')?.value || "generic";

    const baseCosts = { generic: 15, brand: 85, specialty: 350 };
    const monthlyCost = (baseCosts[drugType] || baseCosts.generic) * numDrugs;

    const deductible = 590;
    const initialCopayRate = 0.25;
    const oopThreshold = 8000;

    let annualCost = 0;
    let monthsInDeductible = 0;
    let monthsInInitial = 0;
    let monthsInCatastrophic = 0;
    let runningOOP = 0;
    let hitCatastrophic = false;

    for (let m = 1; m <= 12; m += 1) {
      if (runningOOP < deductible && !hitCatastrophic) {
        const remaining = deductible - runningOOP;
        if (monthlyCost <= remaining) {
          annualCost += monthlyCost;
          runningOOP += monthlyCost;
          monthsInDeductible += 1;
        } else {
          annualCost += remaining + (monthlyCost - remaining) * initialCopayRate;
          runningOOP += remaining + (monthlyCost - remaining) * initialCopayRate;
          monthsInInitial += 1;
        }
      } else if (runningOOP < oopThreshold && !hitCatastrophic) {
        const copay = monthlyCost * initialCopayRate;
        if (runningOOP + copay >= oopThreshold) {
          hitCatastrophic = true;
          monthsInCatastrophic += 1;
        } else {
          annualCost += copay;
          runningOOP += copay;
          monthsInInitial += 1;
        }
      } else {
        monthsInCatastrophic += 1;
      }
    }

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set("drug-monthly", `$${monthlyCost.toFixed(0)}/mo retail`);
    set("drug-deductible-months", `~${monthsInDeductible} months`);
    set("drug-gap-reach", runningOOP >= oopThreshold ? "Yes — $0 after cap" : `Still in coverage — $${runningOOP.toFixed(0)} of $8,000`);
    set("drug-annual", `$${annualCost.toFixed(0)}`);
  }

  form.addEventListener("input", calculate);
  form.addEventListener("change", calculate);
  calculate();
}

safeBind("mobile nav", wireMenu);
safeBind("cookie banner", wireCookieBanner);
safeBind("faq", wireFAQ);
safeBind("local preview links", wireLocalPreviewLinks);
safeBind("premium calculator", wirePremiumCalculator);
safeBind("comparison calculator", wireComparisonCalculator);
safeBind("drug calculator", wireDrugCalculator);
