/* Scroll-driven parallax, section fades and reveals (vanilla port of the original motion effects). */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // Piecewise-linear map, like motion's useTransform(value, inputs, outputs)
  const map = (v, xs, ys) => {
    if (v <= xs[0]) return ys[0];
    for (let i = 1; i < xs.length; i++) if (v <= xs[i]) return ys[i-1] + (ys[i]-ys[i-1]) * (v-xs[i-1]) / (xs[i]-xs[i-1]);
    return ys[ys.length-1];
  };
  const heroVideo = $("heroVideo"), heroContent = $("heroContent"), heroDark = $("heroDark"), heroBlur = $("heroBlur");
  const about = $("about"), aboutVideo = $("aboutVideo"), aboutContent = $("aboutContent"), aboutDark = $("aboutDark"), aboutBlur = $("aboutBlur");
  const svc = $("servicesWrap");

  function frame() {
    const y = scrollY, vh = innerHeight;
    // Hero
    if (y < vh * 1.5) {
      heroVideo.style.transform = `translateY(${map(y,[0,250,500,750,1000],[0,12,35,52,60])}px) scale(${map(y,[0,250,500,750,1000],[1,1.008,1.025,1.036,1.04])})`;
      heroContent.style.opacity = map(y,[100,250,400,550],[1,.85,.35,0]);
      heroContent.style.transform = `translateY(${map(y,[100,250,400,550],[0,-5,-18,-25])}px)`;
      heroDark.style.opacity = map(y,[150,350,550,750],[0,.25,.65,.85]);
      heroBlur.style.opacity = map(y,[150,350,450,550,800],[0,.4,.85,.4,0]);
    }
    // About -> Services (progress 0 when About enters the bottom of the screen, 1 when it leaves the top)
    const r = about.getBoundingClientRect();
    const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
    aboutVideo.style.transform = `translateY(${map(p,[.4,.65,.9],[0,15,30])}px) scale(${map(p,[.4,.65,.9],[1,1.012,1.02])})`;
    aboutContent.style.opacity = map(p,[.5,.68,.82],[1,.45,0]);
    aboutContent.style.transform = `translateY(${map(p,[.5,.68,.82],[0,-15,-30])}px) scale(${map(p,[.5,.68,.82],[1,.99,.98])})`;
    aboutDark.style.opacity = map(p,[.45,.6,.72,.85],[0,.25,.65,.85]);
    aboutBlur.style.opacity = map(p,[.55,.65,.72,.8,.9],[0,.4,.85,.4,0]);
    svc.style.transform = `translateY(${map(p,[.65,.85,1],[45,12,0])}px) scale(${map(p,[.65,.85,1],[.985,.995,1])})`;
    svc.style.opacity = map(p,[.65,.82,.95],[.5,.9,1]);
    svc.style.filter = p >= 1 ? "none" : `blur(${map(p,[.65,.85,1],[4,1,0])}px)`;
  }
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { frame(); ticking = false; }); } }, { passive: true });
  addEventListener("resize", frame);
  frame();

  // Staggered reveal as elements enter the viewport
  const groups = ["#about .about-grid > div", "#services .row.g-4 > div", "#gallery .row.g-4:last-child > div", "#contact .row.g-5 > .col-lg-7, #contact .row.g-5 > .col-lg-5"];
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  groups.forEach(sel => document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add("reveal"); el.style.transitionDelay = (i % 6) * 0.1 + "s"; io.observe(el);
  }));
})();
