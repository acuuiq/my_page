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
// ===== سحب سلايدر البطاقات بالماوس =====
const cardsSliders = document.querySelectorAll(".cards-slider");

cardsSliders.forEach((slider) => {
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.style.cursor = "grabbing";
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.style.cursor = "grab";
  });

  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.style.cursor = "grab";
  });

  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  });

  // دعم اللمس (للجوال)
  let touchStartX = 0;
  let touchScrollLeft = 0;

  slider.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = slider.scrollLeft;
    },
    { passive: true },
  );

  slider.addEventListener(
    "touchmove",
    (e) => {
      const x = e.touches[0].pageX;
      const walk = (touchStartX - x) * 1.5;
      slider.scrollLeft = touchScrollLeft + walk;
    },
    { passive: true },
  );
});
