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
}
