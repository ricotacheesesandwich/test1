// ==============================
// 01. DOM 로드 후 전체 기능 실행
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-ready");
  document.body.classList.add("motion-ready");

  initPageState();
  initRevealMotion();
  initToggleBoxAnimation();
  initProfileTemplateCopy();
  initCopyButton();
  initMobileMenu();
});
// ==============================
// 02. 스크롤 진행 바와 다크모드 전환
// ==============================
function initPageState() {
  const progressFill = document.querySelector(".scroll-progress span");
  const warningStart = document.querySelector(".warning-start");

  function updatePageState() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
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

  window.addEventListener("scroll", updatePageState, { passive: true });
  window.addEventListener("resize", updatePageState);
  window.addEventListener("load", updatePageState);

  updatePageState();
}

/* ---------------------------------------------------------
   Profile Template Copy
   - 프로필 양식 아이콘 클릭 시 양식 복사
   - 복사 후 아이콘이 체크 표시로 1초간 변경
   --------------------------------------------------------- */
function initProfileTemplateCopy() {
  const copyButton = document.querySelector(".profile-template__copy");

  if (!copyButton) return;

  const profileTemplateText = `“(한마디)”

이름
장난식, 불쾌함을 유발하는 이름 불가.

성별
only xx,xy

나이 
만18세~29세 (only 성인)

키, 몸무게
정상적인 키와 체중만을 취급, 표준/미용 표기 허용

외관
안 보이는 부분 서술

성격
키워드 3개 이상 또는 30자 이상 서술

특징
호불호, 취미, 특기, 기타 사항 등. 공란 가능

선관
최대 3명. 유성애적 관계 금지 
기숙사 룸메이트 선관의 경우, 반드시 표기.`;

  async function copyProfileTemplate() {
    try {
      await navigator.clipboard.writeText(profileTemplateText);
    } catch (error) {
      const textarea = document.createElement("textarea");

      textarea.value = profileTemplateText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "-9999px";

      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    copyButton.classList.add("is-copied");
    copyButton.setAttribute("aria-label", "복사 완료");

    window.clearTimeout(copyButton.copyIconTimer);

    copyButton.copyIconTimer = window.setTimeout(() => {
      copyButton.classList.remove("is-copied");
      copyButton.setAttribute("aria-label", "프로필 양식 복사");
    }, 1000);
  }

  copyButton.addEventListener("click", copyProfileTemplate);
}

// ==============================
// 03. 스크롤 등장 모션 처리
// ==============================
function initRevealMotion() {
  const revealElements = document.querySelectorAll(".reveal");

  if (!revealElements.length) return;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

// ==============================
// 04. 토글 박스 애니메이션
// - 트리거 소재 목록 열람
// - 설정 금지 소재 열람
// ==============================
function initToggleBoxAnimation() {
  const toggleBoxes = document.querySelectorAll(".toggle-box");

  if (!toggleBoxes.length) return;

  toggleBoxes.forEach((box) => {
    const summary = box.querySelector("summary");
    const content = box.querySelector(".toggle-content");

    if (!summary || !content) return;

    let animation = null;
    const motionTime = 260;

    function isMobileScreen() {
      return window.matchMedia("(max-width: 760px)").matches;
    }

    function stopAnimation() {
      if (!animation) return;

      animation.cancel();
      animation = null;
    }

    function setOpenedState() {
      box.open = true;
      content.style.height = "auto";
      content.style.opacity = "1";
      content.style.transform = "translateY(0)";
      content.style.overflow = "visible";
    }

    function setClosedState() {
      box.open = false;
      content.style.height = "0px";
      content.style.opacity = "0";
      content.style.transform = "translateY(-4px)";
      content.style.overflow = "hidden";
    }

    if (box.open) {
      setOpenedState();
    } else {
      setClosedState();
    }

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      stopAnimation();

      const isOpen = box.open;

      /*
        모바일에서는 높이 애니메이션을 빼고 바로 열고 닫습니다.
        글자 줄바꿈 때문에 첫 열림에서 높이가 잘리는 문제를 막기 위함입니다.
      */
      if (isMobileScreen()) {
        if (isOpen) {
          setClosedState();
        } else {
          setOpenedState();
        }

        return;
      }

      /*
        데스크탑에서는 기존처럼 부드럽게 열고 닫습니다.
      */
      if (isOpen) {
        const startHeight = content.scrollHeight;

        content.style.height = `${startHeight}px`;
        content.style.opacity = "1";
        content.style.transform = "translateY(0)";
        content.style.overflow = "hidden";

        requestAnimationFrame(() => {
          animation = content.animate(
            [
              {
                height: `${startHeight}px`,
                opacity: 1,
                transform: "translateY(0)",
              },
              {
                height: "0px",
                opacity: 0,
                transform: "translateY(-4px)",
              },
            ],
            {
              duration: motionTime,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            },
          );

          animation.onfinish = () => {
            setClosedState();
            animation = null;
          };
        });

        return;
      }

      box.open = true;

      content.style.height = "auto";
      content.style.opacity = "1";
      content.style.transform = "translateY(0)";
      content.style.overflow = "hidden";

      const endHeight = content.scrollHeight;

      content.style.height = "0px";
      content.style.opacity = "0";
      content.style.transform = "translateY(-4px)";

      requestAnimationFrame(() => {
        animation = content.animate(
          [
            {
              height: "0px",
              opacity: 0,
              transform: "translateY(-4px)",
            },
            {
              height: `${endHeight}px`,
              opacity: 1,
              transform: "translateY(0)",
            },
          ],
          {
            duration: motionTime,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          },
        );

        animation.onfinish = () => {
          setOpenedState();
          animation = null;
        };
      });
    });

    window.addEventListener("resize", () => {
      stopAnimation();

      if (box.open) {
        setOpenedState();
      } else {
        setClosedState();
      }
    });
  });
}

// ==============================
// 05. 프로필 양식 복사 내용
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
// 06. 복사 버튼 클릭 처리
// ==============================
function initCopyButton() {
  const copyButtons = document.querySelectorAll(".copy-button");

  if (!copyButtons.length) return;

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const target = button.dataset.copyTarget;
      const text = copyTextMap[target] || "";
      const original = button.textContent;

      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        let buffer = document.querySelector("#copy-buffer");

        if (!buffer) {
          buffer = document.createElement("textarea");
          buffer.id = "copy-buffer";
          buffer.style.position = "fixed";
          buffer.style.left = "-9999px";
          buffer.style.top = "0";
          document.body.appendChild(buffer);
        }

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
}
/* ---------------------------------------------------------
   Mobile Menu
   - 모바일에서 햄버거 버튼 클릭 시 왼쪽 메뉴 열기
   --------------------------------------------------------- */
function initMobileMenu() {
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const openButton = document.querySelector("[data-mobile-menu-open]");
  const closeButtons = document.querySelectorAll("[data-mobile-menu-close]");
  const menuLinks = document.querySelectorAll(".mobile-menu__panel a");

  if (!mobileMenu || !openButton) return;

  function openMobileMenu() {
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    openButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("mobile-menu-open");
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    openButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("mobile-menu-open");
  }

  openButton.addEventListener("click", () => {
    if (mobileMenu.classList.contains("is-open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeMobileMenu);
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 767) {
      closeMobileMenu();
    }
  });
}
