// ===== فلترة البطاقات =====
const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll("#cardsGrid .card");

if (filterButtons.length > 0 && cards.length > 0) {
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // إزالة active من كل الأزرار
      filterButtons.forEach((b) => b.classList.remove("active"));
      // تفعيل الزر المضغوط
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
  // ===== سلايدر الخلفية =====
  const heroSlides = document.querySelectorAll(".hero-slide");
  let currentSlide = 0;

  if (heroSlides.length > 0) {
    setInterval(() => {
      heroSlides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add("active");
    }, 4000); // كل 4 ثوانٍ
  }
}
