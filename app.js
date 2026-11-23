(() => {
  const { art, signals } = JSON.parse(document.getElementById("page-data").textContent);
  const byId = id => document.getElementById(id);
  const gallery = document.querySelector(".works");
  const dialog = byId("work-dialog");
  const homeView = byId("home-view");
  const teamPage = byId("team-page");
  const nav = byId("nav");
  const menu = document.querySelector(".menu-button");
  const filters = [...document.querySelectorAll("[data-filter]")];
  let activeFilter = "all";
  let browseWorks = art;
  let currentWork = 0;
  let lastTrigger;

  function closeMenu() {
    menu.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", closeMenu);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menu.focus();
    }
  });

  function showFeatured(index) {
    const item = art[index];
    const image = byId("hero-art");
    image.src = item.path;
    image.alt = item.description;
    byId("hero-plate").style.setProperty("--pigment", item.color);
    byId("hero-index").textContent = String(item.id).padStart(2, "0") + " / 12";
    byId("hero-name").textContent = item.title;
    const link = byId("hero-open");
    link.href = "#work-" + String(item.id).padStart(2, "0");
    link.setAttribute("aria-label", "View " + item.title);
    document.querySelectorAll("[data-hero]").forEach(button => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.hero) === index));
    });
  }
  document.querySelectorAll("[data-hero]").forEach(button => {
    button.addEventListener("click", () => showFeatured(Number(button.dataset.hero)));
  });

  function filteredWorks() {
    return art.filter(item => activeFilter === "all" || item.kind === activeFilter);
  }
  filters.forEach(filter => filter.addEventListener("click", () => {
    activeFilter = filter.dataset.filter;
    filters.forEach(item => item.setAttribute("aria-pressed", String(item === filter)));
    gallery.querySelectorAll(".work").forEach(node => {
      node.hidden = activeFilter !== "all" && node.dataset.kind !== activeFilter;
    });
    byId("gallery-count").textContent = filteredWorks().length + " artworks shown";
  }));

  function displayWork(id) {
    const item = art.find(entry => entry.id === id);
    if (!item) return;
    currentWork = item.id;
    const image = byId("dialog-image");
    image.src = item.path;
    image.alt = item.description;
    document.querySelector(".dialog-art").style.setProperty("--pigment", item.color);
    byId("dialog-title").textContent = item.title;
    byId("dialog-description").textContent = item.description;
    byId("dialog-count").textContent = "Sidi Genesis / " + String(item.id).padStart(2, "0") + " of 12";
    byId("dialog-motif").textContent = item.motif;
    byId("dialog-series").textContent = item.kind === "solo" ? "Solo portrait" : "Animal companion";
    if (!dialog.open) dialog.showModal();
  }
  function navigateWork(direction) {
    let index = browseWorks.findIndex(item => item.id === currentWork);
    if (index === -1) { browseWorks = art; index = currentWork - 1; }
    const next = browseWorks[(index + direction + browseWorks.length) % browseWorks.length];
    history.replaceState(history.state, "", "#work-" + String(next.id).padStart(2, "0"));
    displayWork(next.id);
  }
  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#work-"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    lastTrigger = link;
    browseWorks = link.closest(".works") ? filteredWorks() : art;
    history.pushState({ artwork: true }, "", link.getAttribute("href"));
    displayWork(Number(location.hash.slice(6)));
  });
  function dismissWork() {
    if (history.state?.artwork) history.back();
    else {
      history.replaceState(null, "", "#collection");
      renderRoute();
      byId("collection").scrollIntoView();
    }
  }
  byId("close-work").addEventListener("click", dismissWork);
  byId("prev-work").addEventListener("click", () => navigateWork(-1));
  byId("next-work").addEventListener("click", () => navigateWork(1));
  dialog.addEventListener("cancel", event => { event.preventDefault(); dismissWork(); });
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dismissWork();
  });
  document.addEventListener("keydown", event => {
    if (!dialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      navigateWork(event.key === "ArrowLeft" ? -1 : 1);
    }
  });

  function selectSignal(index) {
    const item = signals[index];
    byId("signal-title").textContent = item.title;
    byId("signal-kind").textContent = item.kind;
    byId("signal-location").textContent = item.place;
    byId("signal-body").textContent = item.body;
    byId("signal-need").textContent = item.need;
    byId("signal-link").href = item.url;
    const photo = byId("signal-img");
    photo.src = item.path || ("media/signal-" + item.img + ".webp");
    photo.alt = item.alt;
    photo.classList.toggle("poster", item.img === "odemira");
    document.querySelectorAll("[data-signal]").forEach(button => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.signal) === index));
    });
  }
  document.querySelectorAll("[data-signal]").forEach(button => {
    button.addEventListener("click", () => selectSignal(Number(button.dataset.signal)));
  });
  const livePanel = byId("live-map-panel");
  const mapButton = byId("show-map");
  mapButton.setAttribute("aria-expanded", "false");
  mapButton.setAttribute("aria-controls", "live-map-panel");
  function hideLiveMap() {
    livePanel.hidden = true;
    byId("live-map-host").replaceChildren();
    mapButton.setAttribute("aria-expanded", "false");
    mapButton.focus();
  }
  mapButton.addEventListener("click", () => {
    if (!livePanel.hidden) { hideLiveMap(); return; }
    const frame = document.createElement("iframe");
    frame.title = "Original paradiseön living map";
    frame.src = "https://paradiseon.earth/";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    byId("live-map-host").replaceChildren(frame);
    livePanel.hidden = false;
    mapButton.setAttribute("aria-expanded", "true");
    livePanel.scrollIntoView({block:"center"});
    byId("close-map").focus({preventScroll:true});
  });
  byId("close-map").addEventListener("click", hideLiveMap);

  const filmCover = byId("play-film");
  filmCover.addEventListener("click", event => {
    if (location.protocol === "file:" || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    const frame = document.createElement("iframe");
    frame.title = "Gaio, the remembering — official trailer";
    frame.src = "https://www.youtube-nocookie.com/embed/q_ofODknZrU?autoplay=1&playsinline=1";
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    byId("film-screen").replaceChildren(frame);
    frame.focus();
  });

  function renderRoute() {
    const hash = location.hash;
    const artwork = /^#work-(0[1-9]|1[0-2])$/.exec(hash);
    const team = hash === "#team-page";
    const fromTeam = !teamPage.hidden;
    homeView.hidden = team;
    teamPage.hidden = !team;
    document.title = team ? "the team · sidi genesis · paradiseön" : "sidi genesis · paradiseön";
    if (artwork) {
      displayWork(Number(artwork[1]));
      return;
    }
    if (dialog.open) {
      dialog.close();
      if (lastTrigger?.isConnected) lastTrigger.focus({preventScroll:true});
    }
    if (team) {
      if (byId("film-screen").querySelector("iframe")) byId("film-screen").replaceChildren(filmCover);
      window.scrollTo({top:0,behavior:"instant"});
      teamPage.focus({preventScroll:true});
    } else if (fromTeam || (hash && document.readyState === "loading")) {
      const target = byId(hash.slice(1));
      if (target) requestAnimationFrame(() => target.scrollIntoView());
    }
  }
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
})();
