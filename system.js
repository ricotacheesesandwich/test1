/* =========================================================
   청년환생교육원 SYSTEM PAGE JS
   - reveal motion: 스크롤 진입 시 요소 표시
   - flower mode: 꽃놀이패 구간에서 핑크 배경 전환
   - mobile menu: 모바일 햄버거 메뉴
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-ready");

  initMobileMenu();
  initScrollRevealMotion();
  initFlowerMode();
});

/* ---------------------------------------------------------
   01. Reveal Motion / 화면에 들어온 요소 표시
   --------------------------------------------------------- */
function initScrollRevealMotion() {
  const revealElements = Array.from(document.querySelectorAll(".reveal"));

  if (!revealElements.length) return;

  function showElement(element) {
    element.classList.add("is-visible");
  }

  function showAlreadyVisibleElements() {
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();

      if (rect.top < viewportHeight * 0.92 && rect.bottom > 0) {
        showElement(element);
      }
    });
  }

  revealElements.forEach((element, index) => {
    element.classList.remove("is-visible");
    element.classList.add("is-reveal-pending");
    element.style.setProperty(
      "--reveal-delay",
      `${Math.min(index * 70, 420)}ms`,
    );
  });

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach(showElement);
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        showElement(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.06,
      rootMargin: "0px 0px -2% 0px",
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });

  requestAnimationFrame(showAlreadyVisibleElements);
  window.addEventListener("load", showAlreadyVisibleElements);
  window.addEventListener("resize", showAlreadyVisibleElements);

  /*
    안전장치:
    혹시 브라우저/타이밍 문제로 observer가 안 붙어도
    화면이 영원히 안 보이는 상황을 막음
  */
  window.setTimeout(showAlreadyVisibleElements, 300);
}

/* ---------------------------------------------------------
   02. Flower Mode / 꽃놀이패 구간 핑크 전환
   - 시작: 꽃놀이패 타이틀이 화면에 들어올 때
   - 종료: 3-8 섹션이 화면 위로 완전히 사라진 뒤
   --------------------------------------------------------- */
function initFlowerMode() {
  const flowerStart = document.querySelector("#flower-card");
  const flowerEnd = document.querySelector('[data-no="3-8"]');

  if (!flowerStart || !flowerEnd) return;

  function getHeaderHeight() {
    const headerHeightValue = getComputedStyle(
      document.documentElement,
    ).getPropertyValue("--header-height");

    return parseFloat(headerHeightValue) || 0;
  }

  function updateFlowerMode() {
    const scrollTop = window.scrollY;
    const headerHeight = getHeaderHeight();

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
  window.addEventListener("load", updateFlowerMode);

  updateFlowerMode();
}

/* ---------------------------------------------------------
   03. Mobile Menu
   - 모바일에서 햄버거 버튼 클릭 시 왼쪽 메뉴 열기
   - 이벤트 위임 방식이라 클릭이 훨씬 안정적으로 작동함
   --------------------------------------------------------- */
function initMobileMenu() {
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (!mobileMenu) return;

  function openMobileMenu() {
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("mobile-menu-open");

    const openButton = document.querySelector("[data-mobile-menu-open]");
    if (openButton) {
      openButton.setAttribute("aria-expanded", "true");
    }
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mobile-menu-open");

    const openButton = document.querySelector("[data-mobile-menu-open]");
    if (openButton) {
      openButton.setAttribute("aria-expanded", "false");
    }
  }

  function toggleMobileMenu() {
    if (mobileMenu.classList.contains("is-open")) {
      closeMobileMenu();
      return;
    }

    openMobileMenu();
  }

  document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-mobile-menu-open]");
    const closeButton = event.target.closest("[data-mobile-menu-close]");
    const menuLink = event.target.closest(".mobile-menu__panel a");

    if (openButton) {
      event.preventDefault();
      toggleMobileMenu();
      return;
    }

    if (closeButton || menuLink) {
      closeMobileMenu();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1023) {
      closeMobileMenu();
    }
  });
}
