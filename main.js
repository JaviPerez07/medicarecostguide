/* ── MedicareCostGuide main.js ── */

const site = {
  name: "MedicareCostGuide",
  domain: "https://medicarecostguide.com",
};

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
  const choice = localStorage.getItem("mcg-cookie-choice");
  if (!choice) banner.hidden = false;
  banner.querySelectorAll("[data-cookie-action]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem("mcg-cookie-choice", button.dataset.cookieAction);
      banner.hidden = true;
    });
  });
}

/* ── FAQ accordion (details elements already native) ── */
function wireFAQ() {
  // FAQs use <details> so they work natively; this just adds smooth animation
  document.querySelectorAll(".mcg-faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        const content = item.querySelector("p");
        if (content) {
          content.style.opacity = "0";
          content.style.transform = "translateY(-8px)";
          requestAnimationFrame(() => {
            content.style.transition = "opacity 0.25s ease, transform 0.25s ease";
            content.style.opacity = "1";
            content.style.transform = "translateY(0)";
          });
        }
      }
    });
  });
}

/* ── Clickable cards ── */
function wireCards() {
  document.querySelectorAll(".mcg-card[data-href], .mcg-tool-card[data-href], .mcg-spotlight-item[data-href]").forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      const href = card.dataset.href;
      if (href) window.location.href = href;
    });
  });
}

/* ── Local file:// preview link rewriting ── */
function rootPrefix() {
  if (location.protocol !== "file:") return "";
  const path = location.pathname;
  const marker = "/medicarecostguide/";
  const idx = path.indexOf(marker);
  if (idx === -1) return "";
  return path.slice(0, idx + marker.length);
}

function cleanPathnameToFile(pathname) {
  if (!pathname || pathname === "/") return "/index.html";
  if (pathname.endsWith("/")) return `${pathname}index.html`;
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname;
  return `${pathname}.html`;
}

function localTargetFromHref(href) {
  if (!href) return null;
  if (/^(mailto:|tel:|#|javascript:)/i.test(href)) return null;
  if (/^https?:\/\//i.test(href) && !href.includes("medicarecostguide.com")) return null;
  try {
    let pathname;
    if (/^https?:/i.test(href)) {
      const parsed = new URL(href);
      pathname = parsed.pathname;
    } else {
      const parsed = new URL(href, location.href);
      pathname = parsed.pathname;
      const marker = "/medicarecostguide/";
      const idx = pathname.indexOf(marker);
      if (idx !== -1) pathname = pathname.slice(idx + marker.length - 1);
    }
    const filePath = cleanPathnameToFile(pathname);
    return `${rootPrefix()}${filePath.replace(/^\//, "")}`;
  } catch {
    return null;
  }
}

function wireLocalPreviewLinks() {
  if (location.protocol !== "file:") return;
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor) return;
    const localTarget = localTargetFromHref(anchor.getAttribute("href"));
    if (!localTarget) return;
    event.preventDefault();
    location.href = localTarget;
  });
}

/* ── Calculator: Medicare Premium Calculator ── */
function wirePremiumCalculator() {
  const form = document.getElementById("premium-calc-form");
  if (!form) return;

  function calculate() {
    const age = parseInt(form.querySelector('[name="age"]')?.value || "65");
    const partAEligible = form.querySelector('[name="partA"]')?.value || "yes";
    const income = form.querySelector('[name="income"]')?.value || "under103k";
    const wantPartD = form.querySelector('[name="partD"]')?.value || "no";
    const wantMedigap = form.querySelector('[name="medigap"]')?.value || "no";
    const medigapPlan = form.querySelector('[name="medigapPlan"]')?.value || "G";

    // Part A
    let partACost = 0;
    if (partAEligible === "no") partACost = 505;

    // Part B with IRMAA
    const irmaaTable = {
      "under103k": 174.70,
      "103k-129k": 244.60,
      "129k-161k": 349.40,
      "161k-193k": 454.20,
      "193k-500k": 559.00,
      "over500k": 594.00
    };
    let partBCost = irmaaTable[income] || 174.70;

    // Part D
    let partDCost = 0;
    if (wantPartD === "yes") partDCost = 55.50;

    // Medigap
    let medigapCost = 0;
    if (wantMedigap === "yes") {
      const medigapPrices = {
        "A": 120, "B": 130, "C": 200, "D": 140, "F": 220,
        "G": 165, "K": 80, "L": 110, "M": 130, "N": 135
      };
      medigapCost = medigapPrices[medigapPlan] || 165;
      // Age adjustment
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
    const age = parseInt(form.querySelector('[name="age"]')?.value || "65");
    const meds = parseInt(form.querySelector('[name="meds"]')?.value || "3");
    const visits = parseInt(form.querySelector('[name="visits"]')?.value || "6");
    const state = form.querySelector('[name="state"]')?.value || "FL";

    // Original Medicare + Medigap Plan G
    const partB = 174.70;
    const medigapG = 165 + (age > 70 ? (age - 70) * 3 : 0);
    const partD = 55.50;
    const partBDeductible = 240;
    const origMonthly = partB + medigapG + partD;
    const origAnnual = origMonthly * 12 + partBDeductible;

    // Medicare Advantage estimate
    const stateFactors = {
      "FL": 0.9, "TX": 0.95, "CA": 1.1, "NY": 1.15, "PA": 1.0,
      "OH": 0.92, "IL": 1.0, "AZ": 0.88, "GA": 0.93, "NC": 0.95
    };
    const factor = stateFactors[state] || 1.0;
    const advPremium = 18.50 * factor;
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
    const numDrugs = parseInt(form.querySelector('[name="numDrugs"]')?.value || "3");
    const phase = form.querySelector('[name="phase"]')?.value || "initial";
    const drugType = form.querySelector('[name="drugType"]')?.value || "generic";

    const baseCosts = { generic: 15, brand: 85, specialty: 350 };
    const monthlyCost = baseCosts[drugType] * numDrugs;

    const deductible = 590;
    const initialCopayRate = drugType === "generic" ? 0.25 : drugType === "brand" ? 0.25 : 0.25;
    const gapCopayRate = 0.25;
    const catastrophicRate = 0;
    const oopThreshold = 8000;

    let annualCost = 0;
    let monthsInDeductible = 0;
    let monthsInInitial = 0;
    let monthsInGap = 0;
    let monthsInCatastrophic = 0;
    let runningOOP = 0;
    let hitGap = false;
    let hitCatastrophic = false;

    for (let m = 1; m <= 12; m++) {
      if (runningOOP < deductible && !hitGap && !hitCatastrophic) {
        const remaining = deductible - runningOOP;
        if (monthlyCost <= remaining) {
          annualCost += monthlyCost;
          runningOOP += monthlyCost;
          monthsInDeductible++;
        } else {
          annualCost += remaining + (monthlyCost - remaining) * initialCopayRate;
          runningOOP += remaining + (monthlyCost - remaining) * initialCopayRate;
          monthsInInitial++;
        }
      } else if (runningOOP < oopThreshold && !hitCatastrophic) {
        const copay = monthlyCost * initialCopayRate;
        if (runningOOP + copay >= oopThreshold) {
          hitCatastrophic = true;
          monthsInCatastrophic++;
          annualCost += 0;
        } else {
          annualCost += copay;
          runningOOP += copay;
          monthsInInitial++;
        }
      } else {
        monthsInCatastrophic++;
        annualCost += 0;
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

/* ── Init ── */
wireMenu();
wireCookieBanner();
wireFAQ();
wireCards();
wireLocalPreviewLinks();
wirePremiumCalculator();
wireComparisonCalculator();
wireDrugCalculator();
