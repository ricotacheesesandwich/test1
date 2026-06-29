/* =========================================================
   청년환생교육원 홈페이지 JS
   - 경고 팝업
   - 알람 확인 후 히어로 문구 모션
   - 스크롤 등장 모션
   - 헤더 상태
   - 일정 슬라이더
   - 교육 카드 팝업
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-ready");
  document.body.classList.add("motion-ready");

  initAlarmModal();
  initScrollRevealMotion();
  initHeaderMotion();
  initScheduleSlider();
  initEducationCardPopup();
});

/* ---------------------------------------------------------
   00. Hero Intro Motion
   - 알람 확인 후 첫 화면 문구 등장
   --------------------------------------------------------- */
function startHeroIntroMotion() {
  document.body.classList.remove("hero-intro-start");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("hero-intro-start");
    });
  });
}

/* ---------------------------------------------------------
   01. Alarm Modal
   - 링크 접속 / 주소 직접 접속 시 표시
   - 헤더 메뉴 이동 시 표시 안 함
   - 새로고침 5회째마다 표시
   - 알람이 닫힌 뒤 히어로 문구 모션 시작
   --------------------------------------------------------- */
function initAlarmModal() {
  const alarmModal = document.querySelector("[data-alarm-modal]");
  const alarmCloseButton = document.querySelector("[data-alarm-close]");

  const headerMoveKey = "rebirth_header_move_v3";
  const reloadCountKey = "rebirth_alarm_reload_count_v3";

  if (!alarmModal) {
    startHeroIntroMotion();
    return;
  }

  alarmModal.classList.remove("is-open");
  alarmModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("alarm-allowed");
  document.body.classList.remove("modal-open");

  document.querySelectorAll(".header__nav a, .main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      sessionStorage.setItem(headerMoveKey, "true");
    });
  });

  function getNavigationType() {
    const navigationEntries = performance.getEntriesByType("navigation");

    if (navigationEntries.length > 0) {
      return navigationEntries[0].type;
    }

    if (performance.navigation && performance.navigation.type === 1) {
      return "reload";
    }

    return "navigate";
  }

  function openAlarmModal() {
    document.body.classList.add("alarm-allowed");
    document.body.classList.add("modal-open");

    alarmModal.classList.add("is-open");
    alarmModal.setAttribute("aria-hidden", "false");
  }

  function closeAlarmModal() {
    const wasOpen = alarmModal.classList.contains("is-open");

    alarmModal.classList.remove("is-open");
    alarmModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
    document.body.classList.remove("alarm-allowed");

    if (wasOpen) {
      setTimeout(() => {
        startHeroIntroMotion();
      }, 180);
    }
  }

  function shouldOpenAlarmModal() {
    const cameFromHeader = sessionStorage.getItem(headerMoveKey) === "true";
    const navigationType = getNavigationType();

    sessionStorage.removeItem(headerMoveKey);

    if (cameFromHeader) {
      return false;
    }

    if (navigationType === "reload") {
      const currentCount = Number(localStorage.getItem(reloadCountKey) || 0);
      const nextCount = currentCount + 1;

      localStorage.setItem(reloadCountKey, String(nextCount));

      if (nextCount >= 5) {
        localStorage.setItem(reloadCountKey, "0");
        return true;
      }

      return false;
    }

    if (navigationType === "navigate") {
      localStorage.setItem(reloadCountKey, "0");
      return true;
    }

    return false;
  }

  if (shouldOpenAlarmModal()) {
    openAlarmModal();
  } else {
    startHeroIntroMotion();
  }

  if (alarmCloseButton) {
    alarmCloseButton.addEventListener("click", closeAlarmModal);
  }

  alarmModal.addEventListener("click", (event) => {
    if (event.target === alarmModal) {
      closeAlarmModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && alarmModal.classList.contains("is-open")) {
      closeAlarmModal();
    }
  });
}

/* ---------------------------------------------------------
   02. Scroll Reveal Motion
   - 본문 텍스트 / 카드 / 섹션 순차 등장
   - 히어로 첫 문구 3개는 알람 확인 후 전용 모션으로 처리
   - 푸터는 모션 제외
   --------------------------------------------------------- */
function initScrollRevealMotion() {
  const heroIntroElements = document.querySelectorAll(
    ".hero__kicker, .hero__content h1, .hero__sub",
  );

  heroIntroElements.forEach((element) => {
    element.classList.remove("reveal");
    element.classList.remove("is-visible");
  });

  const textGroupParents = [
    ".hero__content",
    ".intro__block",
    ".institute__layout",
    ".admission__criteria",
    ".admission__qualification",
    ".admission__final",
    ".footer__layout",
  ];

  textGroupParents.forEach((selector) => {
    document.querySelectorAll(selector).forEach((parent) => {
      parent.classList.remove("reveal");
      parent.classList.remove("is-visible");
    });
  });

  const textRevealSelectors = [
    ".intro__label",
    ".intro__block h2",
    ".intro__block p",

    ".institute__content h2",
    ".institute__short",
    ".institute__content h3",
    ".institute__desc",

    ".admission__criteria h2",
    ".admission__criteria li",

    ".admission__qualification p",

    ".admission__lead",
    ".admission__final h2",
    ".admission__note",
    ".admission__sender",
  ];

  const blockRevealSelectors = [
    ".education__head",
    ".education__card",
    ".promo__layout",
    ".slider",
    ".quick__panel",
  ];

  const allRevealSelectors = [...textRevealSelectors, ...blockRevealSelectors];

  allRevealSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add("reveal");
      element.classList.remove("is-visible");
    });
  });

  const revealElements = Array.from(
    document.querySelectorAll(".reveal"),
  ).filter(
    (element) =>
      !element.closest(".alarm-modal") &&
      !element.closest(".footer") &&
      !element.matches(".hero__kicker, .hero__content h1, .hero__sub"),
  );

  revealElements.forEach((element, index) => {
    const parent = element.parentElement;

    const siblingRevealElements = parent
      ? Array.from(parent.children).filter((child) =>
          child.classList.contains("reveal"),
        )
      : [];

    const siblingIndex = siblingRevealElements.indexOf(element);
    const delayIndex = siblingIndex >= 0 ? siblingIndex : index;

    element.style.setProperty(
      "--reveal-delay",
      `${Math.min(delayIndex * 130, 520)}ms`,
    );
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });

  function showAlreadyVisibleElements() {
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();

      if (rect.top < viewportHeight * 0.9 && rect.bottom > 0) {
        element.classList.add("is-visible");
        revealObserver.unobserve(element);
      }
    });
  }

  window.addEventListener("load", showAlreadyVisibleElements);
  window.addEventListener("resize", showAlreadyVisibleElements);

  requestAnimationFrame(() => {
    showAlreadyVisibleElements();
  });
}

/* ---------------------------------------------------------
   03. Header Motion
   --------------------------------------------------------- */
function initHeaderMotion() {
  const header = document.querySelector(".header");

  if (!header) return;

  function updateHeaderState() {
    if (window.scrollY > 14) {
      header.style.boxShadow = "0 12px 34px rgba(42, 59, 87, 0.1)";
      header.style.backdropFilter = "blur(18px)";
    } else {
      header.style.boxShadow = "none";
      header.style.backdropFilter = "none";
    }
  }

  window.addEventListener("scroll", updateHeaderState, { passive: true });
  window.addEventListener("resize", updateHeaderState);

  updateHeaderState();
}

/* ---------------------------------------------------------
   04. Schedule Slider
   --------------------------------------------------------- */
function initScheduleSlider() {
  const slider = document.querySelector(".slider");
  const sliderTrack = document.querySelector(".slider__track");
  const sliderSlides = Array.from(document.querySelectorAll(".slider__slide"));
  const sliderTitlePanels = Array.from(
    document.querySelectorAll(".slider__title-panel"),
  );
  const sliderPrevButtons = Array.from(
    document.querySelectorAll(".slider__prev"),
  );
  const sliderNextButtons = Array.from(
    document.querySelectorAll(".slider__next"),
  );
  const sliderDots = Array.from(
    document.querySelectorAll(".slider__dots button"),
  );

  let sliderIndex = 0;
  let sliderMotionTimer = null;

  function updateSlider(index) {
    const totalSlides = sliderSlides.length;

    if (!totalSlides) return;

    const requestedIndex = index;
    const nextIndex =
      ((requestedIndex % totalSlides) + totalSlides) % totalSlides;

    const previousIndex = sliderIndex;

    const isSameSlide =
      nextIndex === previousIndex &&
      sliderSlides[nextIndex].classList.contains("is-active");

    const isBackward =
      requestedIndex < sliderIndex ||
      (sliderIndex === 0 && nextIndex === totalSlides - 1);

    if (slider) {
      slider.classList.remove("motion-forward", "motion-backward");

      void slider.offsetWidth;

      slider.classList.add(isBackward ? "motion-backward" : "motion-forward");
    }

    if (sliderTrack) {
      sliderTrack.style.removeProperty("--slider-index");
    }

    window.clearTimeout(sliderMotionTimer);

    sliderSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === nextIndex;
      const isLeaving = !isSameSlide && slideIndex === previousIndex;

      slide.classList.toggle("is-active", isActive);
      slide.classList.toggle("is-leaving", isLeaving);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    sliderTitlePanels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === nextIndex;

      panel.classList.toggle("is-active", isActive);
      panel.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    sliderDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === nextIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    sliderIndex = nextIndex;

    sliderMotionTimer = window.setTimeout(() => {
      sliderSlides.forEach((slide) => {
        slide.classList.remove("is-leaving");
      });
    }, 380);
  }

  sliderPrevButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateSlider(sliderIndex - 1);
    });
  });

  sliderNextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateSlider(sliderIndex + 1);
    });
  });

  sliderDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      updateSlider(Number(dot.dataset.slide || 0));
    });
  });

  updateSlider(0);
}

/* ---------------------------------------------------------
   05. Education Card Popup
   --------------------------------------------------------- */
function initEducationCardPopup() {
  const educationCards = Array.from(
    document.querySelectorAll(".education__card"),
  );
  const popup = document.querySelector("[data-education-popup]");
  const closeButton = document.querySelector("[data-education-popup-close]");

  if (!educationCards.length || !popup) return;

  const popupNumber = popup.querySelector("[data-popup-number]");
  const popupTitle = popup.querySelector("[data-popup-title]");
  const popupText = popup.querySelector("[data-popup-text]");

  function openEducationPopup(card) {
    const cardNumber = card.querySelector(":scope > span")?.textContent.trim();
    const cardTitle = card.querySelector("h3")?.textContent.trim();
    const cardText = card.querySelector("p")?.textContent.trim();

    if (popupNumber) {
      popupNumber.textContent = cardNumber || "";
    }

    if (popupTitle) {
      popupTitle.textContent = cardTitle || "";
    }

    if (popupText) {
      popupText.textContent = cardText || "";
    }

    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("education-popup-open");

    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeEducationPopup() {
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("education-popup-open");
  }

  educationCards.forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    card.addEventListener("click", () => {
      openEducationPopup(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openEducationPopup(card);
      }
    });
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeEducationPopup);
  }

  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      closeEducationPopup();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && popup.classList.contains("is-open")) {
      closeEducationPopup();
    }
  });
}
