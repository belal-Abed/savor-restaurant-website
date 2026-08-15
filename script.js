const API = "https://www.themealdb.com/api/json/v1/1";
let meals = [],
  active = "Seafood",
  shown = 6,
  query = "";
const $ = (s) => document.querySelector(s);
const fallback = [
  {
    idMeal: "1",
    strMeal: "Mediterranean Garden Plate",
    strCategory: "Vegetarian",
    strArea: "Mediterranean",
    strMealThumb:
      "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
    strInstructions:
      "A vibrant seasonal plate of vegetables, herbs and grains.",
  },
  {
    idMeal: "2",
    strMeal: "Herb Roasted Salmon",
    strCategory: "Seafood",
    strArea: "European",
    strMealThumb: "https://www.themealdb.com/images/media/meals/1548772327.jpg",
    strInstructions:
      "Roasted salmon with fresh herbs and a bright citrus dressing.",
  },
  {
    idMeal: "3",
    strMeal: "Wild Mushroom Pasta",
    strCategory: "Pasta",
    strArea: "Italian",
    strMealThumb:
      "https://www.themealdb.com/images/media/meals/xutquv1505330523.jpg",
    strInstructions: "Silky pasta with wild mushrooms and aged cheese.",
  },
];
const categories = ["Seafood", "Chicken", "Vegetarian", "Pasta", "Dessert"];
function filters() {
  $("#mealCategories").innerHTML = categories
    .map(
      (c) =>
        `<button data-category="${c}" class="${active === c ? "active" : ""}">${c}</button>`,
    )
    .join("");
}
async function load(category = active) {
  $("#mealStatus").style.display = "block";
  $("#mealGrid").innerHTML = "";
  try {
    const r = await fetch(
      `${API}/filter.php?c=${encodeURIComponent(category)}`,
    );
    if (!r.ok) throw Error();
    meals = (await r.json()).meals || [];
  } catch {
    meals = fallback;
  }
  shown = 6;
  render();
}
function render() {
  const list = meals
    .filter((m) => m.strMeal.toLowerCase().includes(query))
    .slice(0, shown);
  $("#mealStatus").style.display = "none";
  $("#mealGrid").innerHTML = list.length
    ? list
        .map(
          (m) =>
            `<article class="meal" tabindex="0" data-id="${m.idMeal}"><div class="image"><img src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy"><span class="arrow">↗</span></div><h3>${m.strMeal}</h3><small>${m.strArea || active} · ${m.strCategory || active}</small></article>`,
        )
        .join("")
    : "<p>No dishes found. Try another search.</p>";
  $("#loadMore").style.display =
    shown < meals.filter((m) => m.strMeal.toLowerCase().includes(query)).length
      ? "block"
      : "none";
}
async function detail(id) {
  let meal = meals.find((m) => m.idMeal === id);
  try {
    const r = await fetch(`${API}/lookup.php?i=${id}`);
    const data = await r.json();
    meal = data.meals?.[0] || meal;
  } catch {}
  $("#mealDetail").innerHTML =
    `<img class="detail-img" src="${meal.strMealThumb}" alt="${meal.strMeal}"><p class="kicker">${meal.strArea || "SAVOR"} • ${meal.strCategory || active}</p><h2>${meal.strMeal}</h2><p class="detail-copy">${meal.strInstructions || "A seasonal favorite prepared with care and served for sharing."}</p>`;
  $("#mealModal").showModal();
}
document.addEventListener("click", (e) => {
  const cat = e.target.closest("[data-category]"),
    meal = e.target.closest(".meal");
  if (cat) {
    active = cat.dataset.category;
    filters();
    load();
  }
  if (meal) detail(meal.dataset.id);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.classList.contains("meal"))
    detail(e.target.dataset.id);
});
$("#mealSearch").oninput = (e) => {
  query = e.target.value.toLowerCase();
  shown = 6;
  render();
};
$("#loadMore").onclick = () => {
  shown += 6;
  render();
};
document
  .querySelectorAll(".book,#bookTop")
  .forEach((b) => (b.onclick = () => $("#bookingModal").showModal()));
document
  .querySelectorAll("dialog .close")
  .forEach((b) => (b.onclick = () => b.closest("dialog").close()));
$("#bookingForm").onsubmit = (e) => {
  e.preventDefault();
  const d = new FormData(e.target);
  $("#bookingMsg").className = "success";
  $("#bookingMsg").textContent =
    `Thanks, ${d.get("name")}! Your table request for ${d.get("date")} at ${d.get("time")} is confirmed.`;
};
filters();
load();

const motionReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
window.addEventListener("load", () =>
  setTimeout(
    () => document.querySelector("#pageLoader")?.classList.add("hidden"),
    350,
  ),
);
window.addEventListener(
  "scroll",
  () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.querySelector("#scrollProgress").style.width =
      (max ? (scrollY / max) * 100 : 0) + "%";
  },
  { passive: true },
);
const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    }),
  { threshold: 0.15 },
);
document
  .querySelectorAll(
    ".menu-intro,.menu-tools,.story>div,.visit,.quote-section,footer",
  )
  .forEach((el) => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });
const gridObserver = new MutationObserver(() =>
  document.querySelectorAll(".meal").forEach((card, index) => {
    card.style.animationDelay = `${Math.min(index * 80, 480)}ms`;
  }),
);
gridObserver.observe(document.querySelector("#mealGrid"), { childList: true });
if (!motionReduced) {
  const dot = document.querySelector(".cursor-dot");
  document.addEventListener("pointermove", (e) => {
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";
  });
  document.addEventListener("pointerover", (e) =>
    dot.classList.toggle(
      "hover",
      !!e.target.closest("a,button,.meal,input,select"),
    ),
  );
  window.addEventListener(
    "scroll",
    () => {
      const plate = document.querySelector(".plate");
      if (plate && scrollY < 800)
        plate.style.translate = `0 ${scrollY * 0.045}px`;
    },
    { passive: true },
  );
}
document
  .querySelectorAll("nav a")
  .forEach((link) =>
    link.addEventListener("click", () =>
      document
        .querySelectorAll("nav a")
        .forEach((a) => a.classList.toggle("active", a === link)),
    ),
  );
