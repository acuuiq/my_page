// ===== سلايدر الخلفية - انزلاق من اليسار إلى اليمين =====
const heroSlides = document.querySelectorAll(".hero-slide");
let currentSlide = 0;

if (heroSlides.length > 0) {
  heroSlides[0].classList.add("active");

  setInterval(() => {
    const current = heroSlides[currentSlide];
    const nextIndex = (currentSlide + 1) % heroSlides.length;
    const next = heroSlides[nextIndex];

    current.classList.remove("active");
    current.classList.add("exit-right");

    next.classList.add("active");

    setTimeout(() => {
      current.classList.remove("exit-right");
    }, 1200);

    currentSlide = nextIndex;
  }, 5000);
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
