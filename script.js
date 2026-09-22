// ===== سلايدر الخلفية - انزلاق أفقي =====
const heroSlides = document.querySelectorAll(".hero-slide");
let currentSlide = 0;

if (heroSlides.length > 0) {
  // الصورة الأولى مفعّلة
  heroSlides[0].classList.add("active");

  setInterval(() => {
    const current = heroSlides[currentSlide];
    const nextIndex = (currentSlide + 1) % heroSlides.length;
    const next = heroSlides[nextIndex];

    // الصورة الحالية تخرج لليسار
    current.classList.remove("active");
    current.classList.add("exit-left");

    // الصورة الجديدة تأتي من اليمين
    next.classList.add("active");

    // بعد انتهاء الحركة، نُزيل exit-left من الصورة القديمة
    setTimeout(() => {
      current.classList.remove("exit-left");
    }, 1000);

    currentSlide = nextIndex;
  }, 4000);
}
{
  setInterval(() => {
    heroSlides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % heroSlides.length;
    heroSlides[currentSlide].classList.add("active");
  }, 4000);
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
