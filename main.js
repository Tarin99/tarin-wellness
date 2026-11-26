/* TARIN WELLNESS - 공통 동작
   1) 상단 메뉴·하단 푸터를 모든 페이지에 넣기  2) 모바일 메뉴  3) 천천히 나타나는 효과
   4) Journal 카테고리 필터  5) 예약 폼 확인 */

// ── 메뉴 항목: 바꾸고 싶으면 여기만 고치세요 ──
const PAGES = [
  ["index.html", "Home"],
  ["about.html", "About"],
  ["method.html", "Our Method"],
  ["services.html", "Services"],
  ["journal.html", "Journal"],
];

const FEATHER = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <path d="M52 8C30 10 14 26 12 50c-.3 3 .2 5 1 6 1-8 6-14 12-19"/>
  <path d="M52 8c2 20-8 36-28 40"/>
  <path d="M20 44c10-4 20-12 26-26M26 36c6-1 12-5 16-10"/>
</svg>`;

const current = document.body.dataset.page || "index.html";

const header = `
<a class="skip" href="#main">본문으로 바로가기</a>
<header class="site-header"><div class="wrap nav">
  <a class="brand" href="index.html" aria-label="TARIN WELLNESS 홈">${FEATHER}<span>TARIN</span></a>
  <button class="menu-toggle" aria-expanded="false" aria-controls="menu">메뉴</button>
  <ul class="menu" id="menu">
    ${PAGES.map(([href, name]) => `<li><a href="${href}"${href === current ? ' aria-current="page"' : ""}>${name}</a></li>`).join("")}
    <li><a class="nav-cta" href="booking.html"${current === "booking.html" ? ' aria-current="page"' : ""}>예약하기</a></li>
  </ul>
</div></header>`;

const footer = `
<footer class="site-footer"><div class="wrap">
  <div class="cols">
    <div><h4>TARIN WELLNESS</h4><p>Bringing People Back Home.<br>자신의 몸과 마음으로 돌아오는 여정.</p></div>
    <div><h4>Menu</h4><ul>${PAGES.map(([h, n]) => `<li><a href="${h}">${n}</a></li>`).join("")}<li><a href="booking.html">Booking</a></li></ul></div>
    <div><h4>Contact</h4><ul><li>전화: <a href="tel:01058633347">010-5863-3347</a></li><li>이메일: <a href="mailto:tarinwellness@gmail.com">tarinwellness@gmail.com</a></li><li>인스타그램: (준비 중)</li></ul></div>
  </div>
  <p class="disclaimer">본 프로그램은 웰니스 교육 서비스이며 의료적 진단·치료를 대체하지 않습니다. 질환이나 통증이 있다면 먼저 의료 전문가와 상담하세요.<br>© 2026 TARIN WELLNESS</p>
</div></footer>`;

document.body.insertAdjacentHTML("afterbegin", header);
document.body.insertAdjacentHTML("beforeend", footer);

// 모바일 메뉴 열기/닫기
const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});

// 스크롤하면 부드럽게 나타나기
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Journal 카테고리 필터
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === chip));
    const cat = chip.dataset.cat;
    document.querySelectorAll("article.post").forEach((p) => {
      p.classList.toggle("hidden", cat !== "all" && p.dataset.cat !== cat);
    });
  });
});

// 예약 폼 (1단계: 서버로 보내지 않고, 화면에서 입력 확인만 합니다)
const form = document.getElementById("booking-form");
if (form) {
  const tension = document.getElementById("tension");
  const tensionOut = document.getElementById("tension-out");
  tension.addEventListener("input", () => (tensionOut.textContent = tension.value));

  // 서비스 선택에 맞춰 안내 문구 바꾸기
  const svc = document.getElementById("service");
  const svcHint = document.getElementById("service-hint");
  const hints = {
    session: "1:1 세션 · 75~90분 · 99,000원 (초기 테스트 가격)",
    group: "4주 소그룹 · 주 1회 · 4~8명 · 160,000원 (초기 테스트 가격)",
  };
  svc.addEventListener("change", () => (svcHint.textContent = hints[svc.value] || ""));

  const label = { session: "개인 세션 (Body Awareness Session)", group: "4주 소그룹 (Reconnect With Your Body)", online: "온라인", offline: "오프라인" };
  const need = (id, msg) => {
    const el = document.getElementById(id);
    const err = document.getElementById(id + "-err");
    const bad = !el.value.trim() || (el.type === "checkbox" && !el.checked);
    err.textContent = bad ? msg : "";
    return !bad;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const okName = need("name", "이름을 입력해 주세요.");
    const okContact = need("contact", "연락받을 이메일이나 전화번호를 입력해 주세요.");
    const okService = need("service", "서비스를 선택해 주세요.");
    const okAgree = need("agree", "개인정보 수집·이용에 동의해 주세요.");
    const mode = form.querySelector("input[name=mode]:checked");
    document.getElementById("mode-err").textContent = mode ? "" : "진행 방식을 선택해 주세요.";
    if (!(okName && okContact && okService && okAgree && mode)) {
      form.querySelector(".err:not(:empty)")?.scrollIntoView({ block: "center" });
      return;
    }
    // 확인 화면에 입력값 보여주기 (textContent 사용: 입력한 글이 코드로 실행되지 않게 함)
    document.getElementById("c-name").textContent = document.getElementById("name").value.trim();
    document.getElementById("c-service").textContent = label[svc.value];
    document.getElementById("c-mode").textContent = label[mode.value];
    document.getElementById("c-date").textContent = document.getElementById("date").value || "협의 후 정해요";
    form.style.display = "none";
    const box = document.getElementById("confirm");
    box.classList.add("show");
    box.scrollIntoView({ block: "start" });
  });
}
