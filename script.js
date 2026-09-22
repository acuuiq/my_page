// ===== سلايدر الخلفية - انزلاق من اليسار إلى اليمين =====
const heroSlides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".dot");
let currentSlide = 0;
let slideInterval;

function goToSlide(index) {
  // إزالة active من كل الشرائح
  heroSlides.forEach((slide) => {
    slide.classList.remove("active", "exit-right");
  });

  // إزالة active من كل النقاط
  dots.forEach((dot) => dot.classList.remove("active"));

  // الصورة الحالية تخرج لليمين
  const current = heroSlides[currentSlide];
  const next = heroSlides[index];

  if (currentSlide !== index) {
    current.classList.add("exit-right");
    setTimeout(() => current.classList.remove("exit-right"), 1200);
  }

  // الصورة الجديدة تأتي من اليسار
  next.classList.add("active");
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

// بدء السلايدر
if (heroSlides.length > 0) {
  startSlider();

  // النقر على النقاط
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
