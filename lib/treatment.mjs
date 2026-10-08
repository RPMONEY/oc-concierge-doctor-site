// Renders one treatment page from src/treatments/<slug>.json.
// Section order: hero, is-it-for-you, the basics (+ optional options), how it works,
// questions, related treatments, next step.
// Text fields may contain inline HTML (<i>, <b>, &amp;). Placeholders like [PRICE TO COME]
// stay visible on purpose so they get filled before launch.

export const GROUPS = {
  medical: "Medical Care",
  aesthetics: "Aesthetics",
  regenerative: "Regenerative",
};

// Each group also gets its own page listing its treatments.
export const GROUP_PAGES = {
  medical: {
    slug: "medical-care",
    desc: "Primary and urgent care, chronic conditions, weight and hormones.",
    title: "Medical Care in Tustin | Primary, Urgent &amp; Hormone Care | OC Concierge Doctor",
    h1: "Medical care from one doctor.",
    lede: "Physicals, same-day sick visits, chronic conditions, weight and hormones, all with Dr. Khan, who already knows your history.",
  },
  aesthetics: {
    slug: "aesthetics",
    desc: "Injectables, lasers and body contouring, placed by a physician.",
    title: "Medical Aesthetics in Tustin | Botox, Fillers &amp; Lasers | OC Concierge Doctor",
    h1: "Aesthetics, placed by a physician.",
    lede: "Botox, fillers, laser treatments and body contouring from a board-certified physician with years of aesthetic training.",
  },
  regenerative: {
    slug: "regenerative",
    desc: "Exosome treatments for skin, hair, ED and recovery support.",
    title: "Regenerative &amp; Exosome Treatments in Tustin | OC Concierge Doctor",
    h1: "Regenerative treatments.",
    lede: "Exosome treatments for skin, hair, erectile dysfunction and recovery, offered alongside proven care, never in place of it.",
  },
};

export function renderGroup(g, list) {
  const m = GROUP_PAGES[g];
  const cards = list.map((t) => `<a href="/${t.slug}" class="tx-card"><b>${t.name}</b><span>${t.short}</span><i aria-hidden="true">&rarr;</i></a>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{{ROBOTS}}
<title>${m.title}</title>
<meta name="description" content="${attr(m.lede)}">
<link rel="canonical" href="https://www.occonciergedoctor.com/${m.slug}">
{{> head}}
</head>
<body>
{{> header}}
<main id="main">
<section class="wrap sec" style="padding-top:clamp(32px,4vw,56px)">
<div class="stack gap-m" style="max-width:860px">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><i>/</i><b>${GROUPS[g]}</b></nav>
<span class="eyebrow">${GROUPS[g]} · ${list.length} treatments</span>
<h1 class="h1">${m.h1}</h1>
<p class="lede">${m.lede}</p>
</div>
</section>
<section class="wrap sec">
<div class="tx-cards">
${cards}
</div>
</section>
<section class="wrap sec">
<div class="stack gap-m"><span class="eyebrow">All care</span>
{{> care-cards}}
</div>
</section>
<section class="wrap sec-last" id="start">
<div class="panel-ink on-ink" style="display:flex;flex-wrap:wrap;gap:32px 48px;align-items:center">
<div style="flex:1 1 420px;min-width:0" class="stack gap-m">
<span class="eyebrow">Next step</span>
<h2 class="h2">Not sure which one?</h2>
<p style="max-width:540px">Book a visit and Dr. Khan will recommend what fits your goals.</p>
</div>
{{> cta}}
</div>
</section>
</main>
{{> footer}}
<!-- build {{BUILD}} -->
</body>
</html>
`;
}

const attr = (s) => String(s).replace(/<[^>]+>/g, "").replace(/&(?!amp;|#|quot;)/g, "&amp;").replace(/"/g, "&quot;");
const strip = (s) => String(s).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&");

export function renderTreatment(d, bySlug) {
  const group = GROUPS[d.group];
  const facts = `<div class="facts">\n${d.facts.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join("\n")}\n</div>`;

  const signs = `<section class="wrap sec" id="for-you">
<div class="panel split">
<div class="side">
<span class="eyebrow">Is it for you?</span>
<h2 class="h2">${d.signs.heading || "Who it helps"}</h2>
<p class="muted">${d.signs.intro}</p>
</div>
<ul class="checks main" style="align-self:center">
${d.signs.items.map((t) => `<li>${t}</li>`).join("\n")}
</ul>
</div>
</section>`;

  const opts = d.basics.options
    ? `\n<ul class="opts">\n${d.basics.options.map((o) => `<li>${o.meta ? `<em>${o.meta}</em>` : ""}<b>${o.name}</b><span>${o.text}</span></li>`).join("\n")}\n</ul>`
    : "";
  const basics = `<section class="wrap sec" id="basics">
<div class="split" style="padding-inline:clamp(0px,4.5vw,60px)">
<div class="side">
<span class="eyebrow">The basics</span>
<h2 class="h2">${d.basics.heading}</h2>
</div>
<div class="main stack gap-m" style="max-width:780px;font-size:18px;line-height:1.7">
${d.basics.paras.map((p) => `<p>${p}</p>`).join("\n")}${opts}
</div>
</div>
</section>`;

  const steps = `<section class="wrap sec" id="how">
<div class="panel stack gap-l">
<div class="stack gap-s"><span class="eyebrow">How it works</span><h2 class="h2">${d.steps.heading}</h2></div>
<ol class="steps" style="--n:${d.steps.items.length}">
${d.steps.items.map(([t, x]) => `<li><b>${t}</b><span>${x}</span></li>`).join("\n")}
</ol>
</div>
</section>`;

  const faq = `<section class="wrap sec" id="faq">
<div class="split" style="padding-inline:clamp(0px,4.5vw,60px)">
<div class="side"><span class="eyebrow">Questions</span><h2 class="h2">Before your visit</h2></div>
<div class="faq main" style="max-width:780px">
${d.faq.map(([q, a]) => `<details><summary>${q}</summary>${[].concat(a).map((p) => `<p>${p}</p>`).join("")}</details>`).join("\n")}
</div>
</div>
</section>`;

  const related = (d.related || []).length
    ? `<section class="wrap sec" id="related">
<div class="stack gap-m">
<span class="eyebrow">Related care</span>
<div class="pillars" style="grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))">
${d.related.map((s) => { const r = bySlug[s]; return `<a href="/${r.slug}" class="pillar" style="text-decoration:none;gap:8px"><span style="font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--soft)">${GROUPS[r.group]}</span><h3 style="font-size:26px">${r.name}</h3><span style="color:var(--mute);font-size:15px">${r.short}</span></a>`; }).join("\n")}
</div>
</div>
</section>`
    : "";

  const next = `<section class="wrap sec-last" id="start">
<div class="panel-ink on-ink" style="display:flex;flex-wrap:wrap;gap:32px 48px;align-items:center">
<div style="flex:1 1 420px;min-width:0" class="stack gap-m">
<span class="eyebrow">Next step</span>
<h2 class="h2">${d.next.heading}</h2>
<p style="max-width:540px">${d.next.para}</p>
</div>
{{> cta}}
</div>
</section>`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: strip(d.title),
    about: { "@type": "MedicalProcedure", name: strip(d.name) },
    reviewedBy: { "@type": "Physician", name: "Tariq A. Khan, MD" },
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: d.faq.map(([q, a]) => ({ "@type": "Question", name: strip(q), acceptedAnswer: { "@type": "Answer", text: strip([].concat(a).join(" ")) } })),
    },
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{{ROBOTS}}
<title>${d.title}</title>
<meta name="description" content="${attr(d.description)}">
<link rel="canonical" href="https://www.occonciergedoctor.com/${d.slug}">
<meta property="og:title" content="${attr(d.title)}">
<meta property="og:description" content="${attr(d.description)}">
<meta property="og:type" content="website">
{{> head}}
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
{{> header}}
<main id="main">

<section class="wrap sec" id="top" style="padding-top:clamp(32px,4vw,56px);display:flex;flex-wrap:wrap;gap:40px 56px;align-items:stretch">
<div style="flex:1 1 500px;min-width:0" class="stack gap-m">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><i>/</i><a href="/${GROUP_PAGES[d.group].slug}">${group}</a><i>/</i><b>${d.name}</b></nav>
<span class="eyebrow">${d.eyebrow || `${group} · Tustin`}</span>
<h1 class="h1">${d.h1}</h1>
<p class="lede">${d.lede}</p>
<div class="btn-row" style="margin-top:6px"><a href="/contact" class="btn">Request an appointment</a><a href="tel:+16572189859" class="btn btn-ghost">Call 657.218.9859</a></div>
</div>
<aside class="panel stack gap-m" style="flex:1 1 400px;min-width:0;justify-content:space-between;padding:clamp(22px,3vw,36px);background:var(--acc-tint)">
<div class="stack gap-s">
<span class="eyebrow">At a glance</span>
<p style="font-family:var(--display);font-weight:700;font-size:clamp(24px,2.4vw,30px);line-height:1.2;color:var(--ink)">${d.glance}</p>
</div>
${facts}
<div style="display:flex;align-items:center;gap:12px;padding-top:16px;border-top:1px solid var(--line)">
<span style="flex:0 0 44px;height:44px;border-radius:50%;background:var(--acc);color:var(--on);display:flex;align-items:center;justify-content:center;padding:9px">{{> mark}}</span>
<span style="display:flex;flex-direction:column;line-height:1.3"><b style="font-size:15px">Treated by Tariq A. Khan, MD</b><span style="font-size:14px;color:var(--mute)">Board-certified, internal medicine · <a href="/dr-khan" class="ulink" style="font-weight:600;text-decoration-thickness:1.5px">Meet Dr. Khan</a></span></span>
</div>
</aside>
</section>

${signs}

${basics}

${steps}

${faq}

${related}

${next}

</main>
{{> footer}}
<!-- build {{BUILD}} -->
</body>
</html>
`;
}
