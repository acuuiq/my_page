// ===== سلايدر الخلفية - موحّد لكل الأجهزة =====
const heroSlides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".dot");
let currentSlide = 0;
let slideInterval;

function goToSlide(index) {
  heroSlides.forEach((slide) => slide.classList.remove("active"));
  dots.forEach((dot) => dot.classList.remove("active"));

  heroSlides[index].classList.add("active");
  dots[index].classList.add("active");

  currentSlide = index;
}

function nextSlide() {
  const nextIndex = (currentSlide + 1) % heroSlides.length;
  goToSlide(nextIndex);
}

function startSlider() {
  slideInterval = setInterval(nextSlide, 6000);
}

function resetSlider() {
  clearInterval(slideInterval);
  startSlider();
}

if (heroSlides.length > 0) {
  startSlider();

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.dataset.dot);
      goToSlide(index);
      resetSlider();
    });
  });
}

// ===== فلترة البطاقات =====
const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll("#cardsGrid .card");

if (filterButtons.length > 0 && cards.length > 0) {
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        if (filter === "all" || card.dataset.category === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

// ===== شاشة التحميل عند الانتقال بين الصفحات =====
const loadingOverlay = document.getElementById("loadingOverlay");

if (loadingOverlay) {
  document.querySelectorAll('a[href$=".html"]').forEach((link) => {
    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto:")
    ) {
      return;
    }

    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetUrl = link.href;

      loadingOverlay.classList.add("active");

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 600);
    });
  });

  window.addEventListener("pageshow", () => {
    loadingOverlay.classList.remove("active");
  });

  setTimeout(() => {
    loadingOverlay.classList.remove("active");
  }, 1500);
}
// ===== إظهار/إخفاء البطاقات الإضافية (كمبيوتر فقط) =====
// ===== إظهار/إخفاء البطاقات الإضافية (يدعم كل الأقسام) =====
(function () {
  const sections = [
    {
      showBtn: "showMoreBtn",
      hideBtn: "hideMoreBtn",
      slider: "cardsSlider",
    },
    {
      showBtn: "showGamesBtn",
      hideBtn: "hideGamesBtn",
      slider: "gamesSlider",
    },
  ];

  sections.forEach(({ showBtn, hideBtn, slider }) => {
    const showMoreBtn = document.getElementById(showBtn);
    const hideMoreBtn = document.getElementById(hideBtn);
    const sliderEl = document.getElementById(slider);

    if (!showMoreBtn || !hideMoreBtn || !sliderEl) return;

    // إظهار المزيد
    showMoreBtn.addEventListener("click", () => {
      sliderEl.classList.add("expanded");
      setTimeout(() => {
        sliderEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    });

    // إخفاء
    hideMoreBtn.addEventListener("click", () => {
      sliderEl.classList.remove("expanded");
      setTimeout(() => {
        sliderEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    });
  });
})();
// ===== فلترة البطاقات داخل قسم الألعاب والتطبيقات =====
(function () {
  const filterBar = document.querySelector(".filter-bar-inline");
  const slider = document.getElementById("gamesSlider");

  if (!filterBar || !slider) return;

  const filterButtons = filterBar.querySelectorAll(".filter-btn");
  const cards = slider.querySelectorAll(".card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // تحديث الأزرار
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      // فلترة البطاقات
      cards.forEach((card) => {
        if (filter === "all" || card.dataset.category === filter) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
})();
