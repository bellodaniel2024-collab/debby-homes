/* ==========================================================================
   DEBBY HOMES — main.js
   Vanilla JS only. Organised as small independent modules, each of which
   checks for the DOM it needs before running, so one file can safely be
   included on every page.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initHeaderScroll();
  initActiveNav();
  initThemeToggle();
  initBackToTop();
  initRevealOnScroll();
  initHeroSlider();
  initSearchForm();
  initCounters();
  initWishlistGlobalUI();
  initPropertyGridPages();
  initPropertyDetails();
  initFiltersPanel();
  initContactForm();
  initNewsletterForm();
  initMortgageCalculator();
  initRecentlyViewedWidget();
  initFaqSearch();
});

/* ---------------------------------------------------------------------- */
/* Loader                                                                  */
/* ---------------------------------------------------------------------- */
function initLoader(){
  const loader = document.getElementById("loader");
  if (!loader) return;
  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("hidden"), 350);
  });
  // Fallback in case 'load' already fired
  setTimeout(() => loader.classList.add("hidden"), 2200);
}

/* ---------------------------------------------------------------------- */
/* Sticky header                                                           */
/* ---------------------------------------------------------------------- */
function initHeaderScroll(){
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------------------------------------------------------------------- */
/* Active nav link + mobile menu auto close                                */
/* ---------------------------------------------------------------------- */
function initActiveNav(){
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navbar-nav .nav-link, .navbar-nav .dropdown-item").forEach(link => {
    const href = (link.getAttribute("href") || "").split("#")[0];
    if (href && href === path) link.classList.add("active");
  });
  document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
    link.addEventListener("click", () => {
      const collapse = document.getElementById("mainNav");
      if (collapse && collapse.classList.contains("show") && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(collapse).hide();
      }
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Dark mode toggle (persisted)                                            */
/* ---------------------------------------------------------------------- */
function initThemeToggle(){
  const btns = document.querySelectorAll(".theme-toggle");
  if (!btns.length) return;
  const stored = localStorage.getItem("dh_theme");
  if (stored === "dark") document.documentElement.setAttribute("data-theme", "dark");
  updateThemeIcons();

  btns.forEach(btn => btn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("dh_theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("dh_theme", "dark");
    }
    updateThemeIcons();
  }));

  function updateThemeIcons(){
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    btns.forEach(b => { b.innerHTML = isDark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>'; });
  }
}

/* ---------------------------------------------------------------------- */
/* Back to top                                                             */
/* ---------------------------------------------------------------------- */
function initBackToTop(){
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------------------------------------------------------------------- */
/* Scroll reveal animations                                                */
/* ---------------------------------------------------------------------- */
function initRevealOnScroll(){
  const items = document.querySelectorAll(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach(i => i.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(i => io.observe(i));
}

/* ---------------------------------------------------------------------- */
/* Hero image slider (home page)                                           */
/* ---------------------------------------------------------------------- */
function initHeroSlider(){
  const hero = document.querySelector(".hero[data-slider]");
  if (!hero) return;
  const slides = hero.querySelectorAll(".hero-slide");
  const dotsWrap = hero.querySelector(".hero-dots");
  if (!slides.length) return;
  let current = 0;

  slides.forEach((s, i) => {
    if (dotsWrap) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show slide ${i + 1}`);
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  });

  function goTo(i){
    slides[current].classList.remove("active");
    dotsWrap?.children[current]?.classList.remove("active");
    current = i;
    slides[current].classList.add("active");
    dotsWrap?.children[current]?.classList.add("active");
  }

  setInterval(() => goTo((current + 1) % slides.length), 5500);
}

/* ---------------------------------------------------------------------- */
/* Hero / page search form -> redirects to properties.html with query      */
/* ---------------------------------------------------------------------- */
function initSearchForm(){
  const form = document.getElementById("heroSearchForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const fd = new FormData(form);
    for (const [k, v] of fd.entries()) if (v) params.set(k, v);
    window.location.href = "properties.html?" + params.toString();
  });
}

/* ---------------------------------------------------------------------- */
/* Animated stat counters                                                  */
/* ---------------------------------------------------------------------- */
function initCounters(){
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;
  const animate = (el) => {
    const target = parseInt(el.getAttribute("data-counter"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1600;
    const start = performance.now();
    function tick(now){
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => io.observe(c));
  } else counters.forEach(animate);
}

/* ---------------------------------------------------------------------- */
/* Wishlist (localStorage) — used across cards on every page               */
/* ---------------------------------------------------------------------- */
const WISHLIST_KEY = "dh_wishlist";
function getWishlist(){
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
  catch { return []; }
}
function toggleWishlist(id){
  let list = getWishlist();
  id = Number(id);
  if (list.includes(id)) list = list.filter(x => x !== id);
  else list.push(id);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  return list;
}
function initWishlistGlobalUI(){
  updateWishlistBadge();
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".pc-wishlist");
    if (!btn) return;
    e.preventDefault();
    const id = btn.getAttribute("data-id");
    const list = toggleWishlist(id);
    btn.classList.toggle("active", list.includes(Number(id)));
    updateWishlistBadge();
  });
}
function updateWishlistBadge(){
  const count = getWishlist().length;
  document.querySelectorAll(".wishlist-badge").forEach(b => {
    b.textContent = count;
    b.style.display = count ? "flex" : "none";
  });
}

/* ---------------------------------------------------------------------- */
/* Recently viewed (localStorage)                                          */
/* ---------------------------------------------------------------------- */
const RECENT_KEY = "dh_recent";
function pushRecentlyViewed(id){
  let list = [];
  try { list = JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { list = []; }
  list = list.filter(x => x !== Number(id));
  list.unshift(Number(id));
  list = list.slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}
function initRecentlyViewedWidget(){
  const wrap = document.getElementById("recentlyViewed");
  if (!wrap || typeof PROPERTIES === "undefined") return;
  let list = [];
  try { list = JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { list = []; }
  const items = list.map(id => getPropertyById(id)).filter(Boolean);
  if (!items.length) { wrap.closest(".recent-section")?.classList.add("d-none"); return; }
  wrap.innerHTML = items.map(p => propertyCardHTML(p)).join("");
}

/* ---------------------------------------------------------------------- */
/* Property card markup (shared by home / listing / details "similar")     */
/* ---------------------------------------------------------------------- */
function propertyCardHTML(p){
  const wishlisted = getWishlist().includes(p.id);
  const tagClass = p.status === "For Sale" ? "tag-sale" : p.status === "Rent" ? "tag-rent" : "tag-shortlet";
  return `
  <div class="col-md-6 col-lg-4 property-item" data-id="${p.id}" data-status="${p.status}" data-location="${p.location}" data-type="${p.type}" data-price="${p.price}" data-beds="${p.beds}" data-baths="${p.baths}" data-furnished="${p.furnished}">
    <div class="property-card reveal in">
      <div class="pc-media">
        <span class="pc-tag ${tagClass}">${p.status}</span>
        <button class="pc-wishlist ${wishlisted ? "active" : ""}" data-id="${p.id}" aria-label="Save property">
          <i class="bi ${wishlisted ? "bi-heart-fill" : "bi-heart"}"></i>
        </button>
        <a href="property-details.html?id=${p.id}"><img src="${p.images[0]}" alt="${p.title}" loading="lazy"></a>
        <span class="pc-price-tab">${p.priceLabel}</span>
      </div>
      <div class="pc-body">
        <div class="pc-loc"><i class="bi bi-geo-alt"></i> ${p.location}, Lagos Island</div>
        <h3 class="pc-title"><a href="property-details.html?id=${p.id}">${p.title}</a></h3>
        <div class="pc-meta">
          <span><i class="bi bi-door-closed"></i> ${p.beds} Beds</span>
          <span><i class="bi bi-droplet"></i> ${p.baths} Baths</span>
          <span><i class="bi bi-arrows-angle-expand"></i> ${p.sqm} sqm</span>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* Home page featured strips + tabs                                        */
/* ---------------------------------------------------------------------- */
function initPropertyGridPages(){
  // Home page featured grids
  renderInto("featuredGrid", () => PROPERTIES.filter(p => p.featured).slice(0, 6));
  renderInto("apartmentsGrid", () => PROPERTIES.filter(p => p.type === "Apartment" || p.type === "Penthouse" || p.type === "Studio").slice(0, 6));
  renderInto("shortletsGrid", () => PROPERTIES.filter(p => p.status === "Shortlet").slice(0, 6));
  renderInto("saleGrid", () => PROPERTIES.filter(p => p.status === "For Sale").slice(0, 6));

  function renderInto(id, fn){
    const el = document.getElementById(id);
    if (!el || typeof PROPERTIES === "undefined") return;
    el.innerHTML = fn().map(propertyCardHTML).join("");
  }
}

/* ---------------------------------------------------------------------- */
/* Listing pages with filters: properties.html / apartments.html /         */
/* shortlets.html / houses.html                                            */
/* ---------------------------------------------------------------------- */
const PAGE_SIZE = 9;
let currentPage = 1;

function initFiltersPanel(){
  const grid = document.getElementById("listingGrid");
  if (!grid || typeof PROPERTIES === "undefined") return;

  const presetStatus = grid.getAttribute("data-preset-status"); // e.g. "Shortlet"
  const presetTypeGroup = grid.getAttribute("data-preset-types"); // e.g. "Apartment,Penthouse,Studio"
  const presetSaleOnly = grid.getAttribute("data-preset-sale-types"); // for houses.html

  const params = new URLSearchParams(window.location.search);

  const form = document.getElementById("filtersForm");

  // Prefill from query string
  if (form) {
    ["location", "type", "status", "beds", "baths", "furnished", "sort"].forEach(name => {
      const field = form.elements[name];
      if (field && params.get(name)) field.value = params.get(name);
    });
    const priceMin = form.elements["priceMax"];
    if (priceMin && params.get("priceMax")) priceMin.value = params.get("priceMax");
  }

  function getFiltered(){
    let list = [...PROPERTIES];
    if (presetStatus) list = list.filter(p => p.status === presetStatus);
    if (presetTypeGroup) {
      const types = presetTypeGroup.split(",");
      list = list.filter(p => types.includes(p.type));
    }
    if (presetSaleOnly) {
      list = list.filter(p => p.status === "For Sale" && presetSaleOnly.split(",").includes(p.type));
    }

    const fd = form ? new FormData(form) : new Map();
    const val = (k) => (form ? fd.get(k) : params.get(k)) || params.get(k) || "";

    const location = val("location");
    const type = val("type");
    const status = val("status");
    const beds = val("beds");
    const baths = val("baths");
    const furnished = val("furnished");
    const priceMax = val("priceMax");
    const sort = val("sort");
    const q = val("q");

    if (location) list = list.filter(p => p.location === location);
    if (type) list = list.filter(p => p.type === type);
    if (status) list = list.filter(p => p.status === status);
    if (beds) list = list.filter(p => p.beds >= Number(beds));
    if (baths) list = list.filter(p => p.baths >= Number(baths));
    if (furnished) list = list.filter(p => String(p.furnished) === furnished);
    if (priceMax) list = list.filter(p => p.price <= Number(priceMax));
    if (params.get("wishlist") === "1") { const wl = getWishlist(); list = list.filter(p => wl.includes(p.id)); }
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(needle) || p.location.toLowerCase().includes(needle));
    }

    if (sort === "price-asc") list.sort((a,b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a,b) => b.price - a.price);
    else if (sort === "newest") list.sort((a,b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    else if (sort === "beds") list.sort((a,b) => b.beds - a.beds);

    return list;
  }

  function render(){
    const list = getFiltered();
    const countEl = document.getElementById("resultsCount");
    if (countEl) countEl.innerHTML = `Showing <strong>${list.length}</strong> propert${list.length === 1 ? "y" : "ies"}`;

    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = 1;
    const pageItems = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const noResults = document.getElementById("noResults");
    if (!pageItems.length) {
      grid.innerHTML = "";
      if (noResults) noResults.classList.remove("d-none");
    } else {
      if (noResults) noResults.classList.add("d-none");
      grid.innerHTML = pageItems.map(propertyCardHTML).join("");
    }
    renderPagination(totalPages);
  }

  function renderPagination(totalPages){
    const pag = document.getElementById("pagination");
    if (!pag) return;
    let html = "";
    html += `<li class="page-item ${currentPage === 1 ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a></li>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<li class="page-item ${i === currentPage ? "active" : ""}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    html += `<li class="page-item ${currentPage === totalPages ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a></li>`;
    pag.innerHTML = html;
    pag.querySelectorAll("[data-page]").forEach(a => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const p = Number(a.getAttribute("data-page"));
        if (p >= 1 && p <= totalPages) { currentPage = p; render(); window.scrollTo({ top: grid.offsetTop - 120, behavior: "smooth" }); }
      });
    });
  }

  if (form) {
    form.addEventListener("input", () => { currentPage = 1; render(); });
    form.addEventListener("submit", (e) => { e.preventDefault(); currentPage = 1; render(); });
    const resetBtn = document.getElementById("resetFilters");
    if (resetBtn) resetBtn.addEventListener("click", () => { form.reset(); currentPage = 1; render(); });
  }

  const viewToggle = document.querySelectorAll(".view-toggle button");
  viewToggle.forEach(btn => btn.addEventListener("click", () => {
    viewToggle.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    grid.classList.toggle("row-cols-lg-1", btn.getAttribute("data-view") === "list");
  }));

  render();
}

/* ---------------------------------------------------------------------- */
/* Property details page                                                   */
/* ---------------------------------------------------------------------- */
function initPropertyDetails(){
  const root = document.getElementById("propertyDetailRoot");
  if (!root || typeof PROPERTIES === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id")) || PROPERTIES[0].id;
  const p = getPropertyById(id) || PROPERTIES[0];
  pushRecentlyViewed(p.id);

  document.title = `${p.title} | Debby Homes`;

  const tagClass = p.status === "For Sale" ? "tag-sale" : p.status === "Rent" ? "tag-rent" : "tag-shortlet";

  document.getElementById("pd-breadcrumb").textContent = p.title;
  document.getElementById("pd-title").textContent = p.title;
  document.getElementById("pd-location").innerHTML = `<i class="bi bi-geo-alt"></i> ${p.location}, Lagos Island, Nigeria`;
  document.getElementById("pd-tag").textContent = p.status;
  document.getElementById("pd-tag").className = `pc-tag ${tagClass}`;
  document.getElementById("pd-price").textContent = p.priceLabel;
  document.getElementById("pd-description").textContent = p.description;
  document.getElementById("pd-beds").textContent = p.beds;
  document.getElementById("pd-baths").textContent = p.baths;
  document.getElementById("pd-sqm").textContent = p.sqm + " sqm";
  document.getElementById("pd-type").textContent = p.type;
  document.getElementById("pd-furnished").textContent = p.furnished ? "Furnished" : "Unfurnished";
  document.getElementById("pd-id").textContent = "DH-" + String(p.id).padStart(4, "0");

  const mainImg = document.getElementByIdj("pd-main-image");
  mainImg.src = p.images[0];
  mainImg.alt = p.title;
  document.getElementById("pd-thumbs").innerHTML = p.images.map((img, i) => `<img src="${img}" alt="View ${i+1}" class="${i===0?"active":""}" data-src="${img}">`).join("");

  document.getElementById("pd-amenities").innerHTML = p.amenities.map(a => `<div class="col-6"><div class="amenity-chip"><i class="bi bi-check-circle-fill"></i> ${a}</div></div>`).join("");

  const wl = getWishlist().includes(p.id);
  const wlBtn = document.getElementById("pd-wishlist-btn");
  if (wlBtn) {
    wlBtn.classList.toggle("active", wl);
    wlBtn.innerHTML = `<i class="bi ${wl ? "bi-heart-fill" : "bi-heart"}"></i> ${wl ? "Saved" : "Save Property"}`;
    wlBtn.addEventListener("click", () => {
      const list = toggleWishlist(p.id);
      const active = list.includes(p.id);
      wlBtn.classList.toggle("active", active);
      wlBtn.innerHTML = `<i class="bi ${active ? "bi-heart-fill" : "bi-heart"}"></i> ${active ? "Saved" : "Save Property"}`;
      updateWishlistBadge();
    });
  }

  // Agent
  const a = p.agent;
  document.getElementById("pd-agent-photo").src = a.photo;
  document.getElementById("pd-agent-name").textContent = a.name;
  document.getElementById("pd-agent-role").textContent = a.role;
  document.getElementById("pd-agent-phone").textContent = a.phone;
  document.getElementById("pd-agent-phone").href = "tel:" + a.phone.replace(/\s/g, "");
  document.getElementById("pd-agent-email").textContent = a.email;
  document.getElementById("pd-agent-email").href = "mailto:" + a.email;
  const waLink = document.getElementById("pd-agent-whatsapp");
  if (waLink) waLink.href = `https://wa.me/${a.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello, I'm interested in " + p.title + " (" + window.location.href + ")")}`;

  // Gallery thumb clicks
  document.getElementById("pd-thumbs").addEventListener("click", (e) => {
    const t = e.target.closest("img");
    if (!t) return;
    mainImg.src = t.getAttribute("data-src");
    document.querySelectorAll("#pd-thumbs img").forEach(im => im.classList.remove("active"));
    t.classList.add("active");
  });

  // Similar properties
  const similar = PROPERTIES.filter(x => x.location === p.location && x.id !== p.id).slice(0, 3);
  const simEl = document.getElementById("similarProperties");
  if (simEl) simEl.innerHTML = (similar.length ? similar : PROPERTIES.filter(x => x.id !== p.id).slice(0,3)).map(propertyCardHTML).join("");

  // Mortgage calc default seed from price if it's a sale property
  const priceInput = document.getElementById("mc-price");
  if (priceInput && p.status === "For Sale") priceInput.value = p.price;
}

/* ---------------------------------------------------------------------- */
/* Mortgage calculator (property-details.html)                             */
/* ---------------------------------------------------------------------- */
function initMortgageCalculator(){
  const form = document.getElementById("mortgageForm");
  if (!form) return;
  const resultBox = document.getElementById("mortgageResult");

  function calculate(){
    const price = parseFloat(form.elements["mc-price"].value) || 0;
    const downPct = parseFloat(form.elements["mc-down"].value) || 0;
    const years = parseFloat(form.elements["mc-years"].value) || 10;
    const ratePct = parseFloat(form.elements["mc-rate"].value) || 18;

    const principal = price * (1 - downPct / 100);
    const monthlyRate = (ratePct / 100) / 12;
    const n = years * 12;
    let monthly = 0;
    if (monthlyRate > 0) {
      monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    } else {
      monthly = principal / n;
    }
    if (!isFinite(monthly) || monthly < 0) monthly = 0;

    resultBox.classList.remove("d-none");
    document.getElementById("mc-monthly").textContent = "₦" + Math.round(monthly).toLocaleString("en-NG");
    document.getElementById("mc-principal").textContent = "₦" + Math.round(principal).toLocaleString("en-NG");
    document.getElementById("mc-total").textContent = "₦" + Math.round(monthly * n).toLocaleString("en-NG");
  }

  form.addEventListener("input", calculate);
  form.addEventListener("submit", (e) => { e.preventDefault(); calculate(); });
  calculate();
}

/* ---------------------------------------------------------------------- */
/* Contact form validation (Bootstrap pattern + custom feedback)           */
/* ---------------------------------------------------------------------- */
function initContactForm(){
  const form = document.getElementById("contactForm");
  if (!form) return;
  const successMsg = document.getElementById("contactSuccess");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    form.classList.remove("was-validated");
    form.reset();
    if (successMsg) {
      successMsg.classList.remove("d-none");
      setTimeout(() => successMsg.classList.add("d-none"), 6000);
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Newsletter form                                                         */
/* ---------------------------------------------------------------------- */
function initNewsletterForm(){
  document.querySelectorAll(".newsletter-form").forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = form.querySelector(".nl-msg");
      if (msg) {
        msg.textContent = "Thank you — you're subscribed to Debby Homes insights.";
        msg.classList.remove("d-none");
      }
      form.reset();
    });
  });
}

/* ---------------------------------------------------------------------- */
/* FAQ live search                                                         */
/* ---------------------------------------------------------------------- */
function initFaqSearch(){
  const input = document.getElementById("faqSearch");
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    document.querySelectorAll(".accordion-item").forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? "" : "none";
    });
  });
}

