/* =========================================================
   청년환생교육원 SYSTEM PAGE JS
   - reveal motion: 스크롤 진입 시 요소 표시
   - flower mode: 꽃놀이패 구간에서 핑크 배경 전환
   ========================================================= */

/* ---------------------------------------------------------
   01. Reveal Motion / 화면에 들어온 요소 표시
   --------------------------------------------------------- */
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.12 },
);

revealElements.forEach((element) => revealObserver.observe(element));

/* ---------------------------------------------------------
   02. Flower Mode / 꽃놀이패 구간 핑크 전환
   - 시작: 꽃놀이패 타이틀이 화면에 들어올 때
   - 종료: 3-8 섹션이 화면 위로 완전히 사라진 뒤
   --------------------------------------------------------- */
const flowerStart = document.querySelector("#flower-card");
const flowerEnd = document.querySelector('[data-no="3-8"]');

function updateFlowerMode() {
  if (!flowerStart || !flowerEnd) return;

  const scrollTop = window.scrollY;
  const headerHeight =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--header-height",
      ),
    ) || 0;
  const flowerTop = flowerStart.getBoundingClientRect().top + window.scrollY;
  const flowerBottom =
    flowerEnd.getBoundingClientRect().bottom + window.scrollY;

  const startPoint = flowerTop - window.innerHeight * 0.62;
  const endPoint = flowerBottom - headerHeight;
  const isInFlowerRange = scrollTop >= startPoint && scrollTop < endPoint;

  document.body.classList.toggle("is-flower-mode", isInFlowerRange);
}

window.addEventListener("scroll", updateFlowerMode, { passive: true });
window.addEventListener("resize", updateFlowerMode);
updateFlowerMode();
