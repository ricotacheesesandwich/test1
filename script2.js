// ==============================
// 01. DOM 요소 가져오기
// ==============================
const progressFill = document.querySelector(".scroll-progress span");
const revealElements = document.querySelectorAll(".reveal");
const warningStart = document.querySelector(".warning-start");

// ==============================
// 02. 스크롤 진행 바와 다크모드 전환
// ==============================
function updatePageState() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progressFill) {
    progressFill.style.width = `${progress}%`;
  }

  if (!warningStart) return;

  const warningTop = warningStart.getBoundingClientRect().top;
  const triggerPoint = window.innerHeight * 0.58;

  if (warningTop <= triggerPoint) {
    document.body.classList.add("is-dark");
  } else {
    document.body.classList.remove("is-dark");
  }
}

// ==============================
// 03. 스크롤 등장 모션 처리
// ==============================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  },
);

revealElements.forEach((element) => revealObserver.observe(element));

window.addEventListener("scroll", updatePageState, { passive: true });
window.addEventListener("resize", updatePageState);
window.addEventListener("load", updatePageState);

updatePageState();

// ==============================
// 04. 프로필 양식 복사 내용
// ==============================
const copyTextMap = {
  "profile-template": `“(한마디)”

이름
장난식, 불쾌함을 유발하는 이름 불가.

성별
only xx, xy

나이
만 18세~29세. only 성인.

키, 몸무게
정상적인 키와 체중만 취급. 표준/미용 표기 허용.

외관
안 보이는 부분 서술.

성격
키워드 3개 이상 또는 30자 이상 서술.

특징
호불호, 취미, 특기, 기타 사항 등. 공란 가능.

선관
최대 3명. 유성애적 관계 금지. 기숙사 룸메이트 선관의 경우 반드시 표기.`,
};

// ==============================
// 05. 복사 버튼 클릭 처리
// ==============================
document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = button.dataset.copyTarget;
    const text = copyTextMap[target] || "";
    const original = button.textContent;

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const buffer = document.querySelector("#copy-buffer");
      buffer.value = text;
      buffer.select();
      document.execCommand("copy");
    }

    button.textContent = "복사 완료";

    setTimeout(() => {
      button.textContent = original;
    }, 1400);
  });
});
