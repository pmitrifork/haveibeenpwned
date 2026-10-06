const form = document.getElementById("check-form");
const input = document.getElementById("cpr");
const result = document.getElementById("result");
const banner = document.getElementById("result-banner");
const kicker = document.getElementById("result-kicker");
const title = document.getElementById("result-title");
const lead = document.getElementById("result-lead");
const facts = document.getElementById("facts");
const again = document.getElementById("again");
const hero = document.querySelector(".hero");

const MONTHS = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
];

function digitsOnly(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function formatCpr(digits) {
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

function centuryFromSerial(year2, serialDigit) {
  // Simplified CPR century rules
  if (serialDigit <= 3) return 1900;
  if (serialDigit === 4 || serialDigit === 9) {
    return year2 <= 36 ? 2000 : 1900;
  }
  if (serialDigit >= 5 && serialDigit <= 8) {
    return year2 <= 57 ? 2000 : 1800;
  }
  return year2 <= 36 ? 2000 : 1900;
}

function isValidDate(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function parseCpr(raw) {
  const digits = digitsOnly(raw);
  if (digits.length !== 10) {
    return { ok: false, message: "CPR skal være 10 cifre (DDMMYY-XXXX)." };
  }

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year2 = Number(digits.slice(4, 6));
  const serial = digits.slice(6);
  const serialDigit = Number(serial[0]);
  const lastDigit = Number(serial[3]);
  const century = centuryFromSerial(year2, serialDigit);
  const year = century + year2;

  if (!isValidDate(year, month, day)) {
    return { ok: false, message: "Det ligner ikke en gyldig fødselsdato i CPR-formatet." };
  }

  const gender = lastDigit % 2 === 0 ? "Kvinde" : "Mand";
  const birthDate = `${day}. ${MONTHS[month - 1]} ${year}`;
  const formatted = formatCpr(digits);

  // Deterministic "rank" in the fake 1e9 database
  const hash = Number(digits.slice(0, 9)) % 1_000_000_000;
  const rank = hash + 1;

  return {
    ok: true,
    digits,
    formatted,
    birthDate,
    gender,
    year,
    rank,
  };
}

function formatDaNumber(n) {
  return n.toLocaleString("da-DK");
}

function renderPwned(parsed) {
  banner.classList.remove("is-invalid");
  kicker.textContent = "Åh nej — pwned!";
  title.textContent = "Dit CPR er i databasen";
  lead.textContent =
    `Godt forsøgt, men ${parsed.formatted} ligger sikkert og “trygt” blandt vores ` +
    `1.000.000.000 CPR-numre. Velkommen i klubben.`;

  facts.innerHTML = `
    <div>
      <dt>Fødselsdato</dt>
      <dd>${parsed.birthDate}</dd>
    </div>
    <div>
      <dt>Køn</dt>
      <dd>${parsed.gender}</dd>
    </div>
    <div>
      <dt>Status</dt>
      <dd>PWNED</dd>
    </div>
  `;

  const breachCopy = document.querySelector(".breach-copy");
  breachCopy.textContent =
    `Uvedkommende havde i ti dage adgang til CPR-oplysninger om ca. 8,8 millioner personer. ` +
    `Vores database har genereret en milliard numre for at følge med — og dit er post nr. ` +
    `${formatDaNumber(parsed.rank)}. Selvfølgelig.`;

  document.querySelector(".breach").hidden = false;
  result.hidden = false;
  hero.hidden = true;
  result.style.animation = "none";
  void result.offsetWidth;
  result.style.animation = "";
}

function renderInvalid(message) {
  banner.classList.add("is-invalid");
  kicker.textContent = "Hmm…";
  title.textContent = "Kunne ikke parse CPR";
  lead.textContent = message;
  facts.innerHTML = "";
  document.querySelector(".breach").hidden = true;
  result.hidden = false;
  hero.hidden = true;
}

input.addEventListener("input", () => {
  const digits = digitsOnly(input.value);
  input.value = formatCpr(digits);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const parsed = parseCpr(input.value);
  if (!parsed.ok) {
    renderInvalid(parsed.message);
    return;
  }
  // Always pwned — that's the joke
  renderPwned(parsed);
});

again.addEventListener("click", () => {
  result.hidden = true;
  hero.hidden = false;
  input.value = "";
  input.focus();
});

function animateCounters() {
  const nodes = document.querySelectorAll("[data-count]");
  nodes.forEach((node) => {
    const target = Number(node.dataset.count);
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      node.textContent = formatDaNumber(value);
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

animateCounters();
