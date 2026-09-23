/* Before the Bell: E-Rate Tracker
   Vanilla JS, no dependencies. Sources and timeline load from data/sources.json,
   so adding a source never requires touching this file. */

(function () {
  "use strict";

  var SITE_URL = "https://minerclass.github.io/erate-tracker/";
  var STORAGE_KEY = "erate-worksheet-v1";
  var DEFAULT_DEADLINES = { comments: "2026-10-13", replies: "2026-11-12" };

  var TYPE_COLORS = {
    fcc: "var(--type-fcc)",
    advocacy: "var(--type-advocacy)",
    news: "var(--type-news)",
    analysis: "var(--type-analysis)",
    background: "var(--type-background)",
    tool: "var(--type-tool)"
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "text") node.textContent = attrs[key];
      else if (key === "class") node.className = attrs[key];
      else if (key === "style") node.setAttribute("style", attrs[key]);
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      if (child == null) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  /* ---- Dates ------------------------------------------------------------
     FCC filings are due by the end of the day Eastern, so "today" is taken
     in America/New_York. Dates are compared as whole calendar days. */

  function todayEastern() {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit"
      }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function dayNumber(iso) {
    var p = iso.split("-").map(Number);
    return Math.round(Date.UTC(p[0], p[1] - 1, p[2]) / 86400000);
  }

  function formatDate(iso, style) {
    var p = iso.split("-").map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    return d.toLocaleDateString("en-US", {
      timeZone: "UTC", year: "numeric", month: style === "long" ? "long" : "short", day: "numeric"
    });
  }

  /* ---- Deadline countdown ---------------------------------------------- */

  function renderDeadline(deadlines) {
    var today = dayNumber(todayEastern());
    var comments = dayNumber(deadlines.comments);
    var replies = dayNumber(deadlines.replies);
    var days = $("#deadline-days");
    var label = $("#deadline-label");
    var presenter = $("#presenter-deadline");

    function say(big, small, presenterText) {
      days.textContent = big;
      label.textContent = small;
      if (presenter) presenter.textContent = presenterText;
    }

    function plural(n) { return n + (n === 1 ? " day" : " days"); }

    if (today < comments) {
      var left = comments - today;
      say(plural(left), "left to file initial comments, due " + formatDate(deadlines.comments, "long"),
        "FCC comments due " + formatDate(deadlines.comments, "long") + " (" + plural(left) + " left)");
    } else if (today === comments) {
      say("Today", "Initial comments are due today, " + formatDate(deadlines.comments, "long"),
        "FCC comments are due today");
    } else if (today <= replies) {
      var r = replies - today;
      say(r === 0 ? "Today" : plural(r), "Initial comments closed. Reply comments due " + formatDate(deadlines.replies, "long"),
        "Reply comments due " + formatDate(deadlines.replies, "long"));
    } else {
      say("Closed", "The comment record closed " + formatDate(deadlines.replies, "long") + ". Watch for an FCC order.",
        "The comment record has closed; watch for an FCC order");
    }
  }

  /* ---- Morning stepper -------------------------------------------------- */

  var MORNING = [
    {
      time: "5:30 a.m.", heading: "The buses roll",
      body: "GPS routing, parent-facing bus tracking apps, and ridership scans that document who rode for compliance all run over the network.",
      tie: ""
    },
    {
      time: "6:00 a.m.", heading: "The building wakes up",
      body: "Heating, ventilation, CO2 monitoring, boilers, chillers, and lighting run on building management systems over the same IP network, often with predictive maintenance.",
      tie: ""
    },
    {
      time: "7:00 a.m.", heading: "The doors",
      body: "Electronic access control, security cameras, and visitor management come online. Many visitor systems scan a driver's license against offender registries before anyone is let in.",
      tie: ""
    },
    {
      time: "7:30 a.m.", heading: "Breakfast",
      body: "Cafeteria point-of-sale connects to federal meal-reimbursement claims and to student health records, including allergy information.",
      tie: "Federal meal-reimbursement claims"
    },
    {
      time: "8:00 a.m.", heading: "Attendance",
      body: "Attendance flows into the student information system, then into state reporting and the funding formulas built on it. An outage becomes a budget problem.",
      tie: "State attendance reporting and the funding tied to it"
    },
    {
      time: "After the bell", heading: "Then the school day starts",
      body: "State assessments are computer-based, IEP documentation and teletherapy run online, and payroll, finance, and HR run in the background. Instruction is one use of the network among many.",
      tie: "IDEA documentation, state testing, and CIPA filtering"
    },
    {
      time: "Any time", heading: "The network becomes the life-safety system",
      body: "In a lockdown, the PA system, door locks, camera feeds, and 911 calls all depend on the same network. At that moment it is life-safety infrastructure, not an amenity.",
      tie: "Kari's Law and RAY BAUM's Act (direct 911 dialing, notification, and dispatchable location), plus state panic-alarm requirements"
    }
  ];

  function initMorning() {
    var tabs = $$(".morning-rail [role=tab]");
    var panel = $("#morning-panel");
    if (!tabs.length || !panel) return;
    var current = 0;

    function show(i, focus) {
      current = (i + MORNING.length) % MORNING.length;
      var step = MORNING[current];
      tabs.forEach(function (tab, n) {
        var on = n === current;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", tabs[current].id);
      $("#morning-time").textContent = step.time;
      $("#morning-heading").textContent = step.heading;
      $("#morning-body").textContent = step.body;
      var tie = $("#morning-tie");
      tie.textContent = "";
      if (step.tie) {
        tie.appendChild(el("strong", { text: "Tied to" }));
        tie.appendChild(document.createTextNode(step.tie));
      }
      $("#morning-progress").textContent = (current + 1) + " of " + MORNING.length;
      if (focus) tabs[current].focus();
    }

    tabs.forEach(function (tab, n) {
      tab.addEventListener("click", function () { show(n); });
      tab.addEventListener("keydown", function (e) {
        var keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
        if (keys[e.key]) { e.preventDefault(); show(current + keys[e.key], true); }
        else if (e.key === "Home") { e.preventDefault(); show(0, true); }
        else if (e.key === "End") { e.preventDefault(); show(MORNING.length - 1, true); }
      });
    });
    $("#morning-prev").addEventListener("click", function () { show(current - 1); });
    $("#morning-next").addEventListener("click", function () { show(current + 1); });
    show(0);
  }

  /* ---- Source tracker --------------------------------------------------- */

  var state = { type: "all", query: "", sort: "featured" };

  function initSources(data) {
    var sources = data.sources || [];
    var types = data.types || {};
    var filters = $("#type-filters");
    var list = $("#source-list");

    var counts = {};
    sources.forEach(function (s) { counts[s.type] = (counts[s.type] || 0) + 1; });

    var allChip = $("[data-type=all]", filters);
    allChip.appendChild(el("span", { class: "n", text: String(sources.length) }));

    Object.keys(types).forEach(function (key) {
      if (!counts[key]) return;
      filters.appendChild(el("button", {
        type: "button", class: "chip", "aria-pressed": "false", "data-type": key,
        style: "--c:" + (TYPE_COLORS[key] || "var(--muted)")
      }, [
        el("span", { class: "dot", "aria-hidden": "true" }),
        types[key] + " ",
        el("span", { class: "n", text: String(counts[key]) })
      ]));
    });

    filters.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      state.type = chip.getAttribute("data-type");
      $$(".chip", filters).forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
      render();
    });

    $("#source-search").addEventListener("input", function (e) { state.query = e.target.value.trim().toLowerCase(); render(); });
    $("#source-sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });

    function matches(s) {
      if (state.type !== "all" && s.type !== state.type) return false;
      if (!state.query) return true;
      var hay = [s.title, s.publisher, s.author, s.summary, s.angle].join(" ").toLowerCase();
      return state.query.split(/\s+/).every(function (word) { return hay.indexOf(word) !== -1; });
    }

    // Featured sources keep their order from sources.json, so the file decides which leads.
    sources.forEach(function (s, i) { s._order = i; });

    function sorter(a, b) {
      if (state.sort === "featured") {
        if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
        if (a.featured) return a._order - b._order;
      }
      if (state.sort === "oldest") return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    }

    function card(s) {
      var color = TYPE_COLORS[s.type] || "var(--muted)";
      var meta = el("p", { class: "source-meta" }, [
        el("span", { class: "source-type", text: types[s.type] || s.type }),
        el("time", { datetime: s.date, text: s.dateLabel || formatDate(s.date) }),
        el("span", { text: s.publisher }),
        s.featured ? el("span", { class: "source-featured", text: "Featured" }) : null
      ]);
      var by = el("p", { class: "source-by" }, [
        el("span", { class: "source-angle", text: s.angle }),
        s.author && s.author !== s.publisher ? " · " + s.author : null
      ]);
      return el("li", { class: "source" + (s.featured ? " is-featured" : ""), style: "--c:" + color, id: "src-" + s.id }, [
        meta,
        el("h3", {}, [el("a", { href: s.url, text: s.title })]),
        by,
        el("p", { class: "source-summary", text: s.summary })
      ]);
    }

    function render() {
      var shown = sources.filter(matches).sort(sorter);
      list.textContent = "";
      shown.forEach(function (s) { list.appendChild(card(s)); });
      $("#result-count").textContent = "Showing " + shown.length + " of " + sources.length + " sources";
      $("#empty-state").hidden = shown.length !== 0;
    }

    render();
  }

  /* ---- Timeline --------------------------------------------------------- */

  function initTimeline(data) {
    var list = $("#timeline-list");
    var byId = {};
    (data.sources || []).forEach(function (s) { byId[s.id] = s; });
    var today = todayEastern();
    var items = (data.timeline || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var markerPlaced = false;

    function marker() {
      markerPlaced = true;
      return el("li", { class: "today-marker", "aria-label": "Today, " + formatDate(today, "long") }, [
        el("span", { class: "t-date", text: formatDate(today) }),
        el("p", { class: "t-label", text: "Today" })
      ]);
    }

    items.forEach(function (item) {
      if (!markerPlaced && item.date > today) list.appendChild(marker());
      var cls = [item.date <= today ? "is-past" : "is-upcoming", item.deadline ? "is-deadline" : ""].join(" ").trim();
      var src = item.source && byId[item.source];
      var label = el("p", { class: "t-label" }, [
        item.label,
        src ? el("a", { href: src.url, "aria-label": "Source: " + src.title, text: "source" }) : null
      ]);
      list.appendChild(el("li", { class: cls }, [
        el("time", { class: "t-date", datetime: item.date, text: item.approx || formatDate(item.date) }),
        label
      ]));
    });
    if (!markerPlaced) list.appendChild(marker());
  }

  /* ---- Comment worksheet ------------------------------------------------ */

  var SYSTEMS = [
    { id: "buses", label: "Buses and transportation", group: "ops",
      phrase: "bus GPS routing, parent-facing bus tracking, and ridership records" },
    { id: "building", label: "Building systems (HVAC, lighting)", group: "ops",
      phrase: "heating, ventilation, CO2 monitoring, and lighting controls" },
    { id: "doors", label: "Doors, cameras, visitor screening", group: "ops",
      phrase: "door access control, security cameras, and visitor screening" },
    { id: "emergency", label: "Emergency communications and 911", group: "ops",
      phrase: "PA and mass notification, panic alarms, and 911 calling with dispatchable location under Kari's Law and RAY BAUM's Act" },
    { id: "food", label: "Food service and meal claims", group: "ops",
      phrase: "cafeteria point-of-sale, federal meal-reimbursement claims, and student allergy records" },
    { id: "attendance", label: "Attendance and state reporting", group: "ops",
      phrase: "attendance, our student information system, and the state reporting our funding depends on" },
    { id: "business", label: "Payroll, finance, HR", group: "ops",
      phrase: "payroll, finance, procurement, and human resources systems" },
    { id: "security", label: "Cybersecurity and firewalls", group: "ops",
      phrase: "the firewalls and network security that protect student and staff data" },
    { id: "cipa", label: "CIPA filtering", group: "ops",
      phrase: "the content filtering and internet safety measures that CIPA requires" },
    { id: "testing", label: "State assessments", group: "learning",
      phrase: "computer-based state assessments" },
    { id: "sped", label: "IEPs, teletherapy, health records", group: "learning",
      phrase: "IEP documentation, teletherapy, and student health records" },
    { id: "instruction", label: "Classroom instruction", group: "learning",
      phrase: "classroom instruction and digital learning resources" },
    { id: "patrons", label: "Public access (libraries)", group: "learning",
      phrase: "public internet access for patrons, including job searches, government services, and homework help" }
  ];

  function joinList(parts) {
    if (parts.length <= 1) return parts.join("");
    if (parts.length === 2) return parts[0] + " and " + parts[1];
    return parts.slice(0, -1).join("; ") + "; and " + parts[parts.length - 1];
  }

  function buildComment(v) {
    var role = v.role || "[your role]";
    var org = v.org || "[organization]";
    var place = v.place || "[city and state]";
    var ops = SYSTEMS.filter(function (s) { return s.group === "ops" && v.systems[s.id]; }).map(function (s) { return s.phrase; });
    var learning = SYSTEMS.filter(function (s) { return s.group === "learning" && v.systems[s.id]; }).map(function (s) { return s.phrase; });

    var lines = [];
    lines.push("Re: WC Docket No. 26-133, Ensuring Children's Safe Use of Screens and E-Rate-Funded Services (FCC 26-41)");
    lines.push("");
    lines.push("I am the " + role + " at " + org + " in " + place + ". I am writing in response to the Commission's questions about whether the E-Rate program should be limited or sunset (NPRM para. 12) and what the impact on schools and libraries would be if it were terminated or limited (para. 18).");
    lines.push("");

    if (!ops.length && !learning.length) {
      lines.push("[Check the systems your network carries, and they will be listed here.]");
    } else {
      var p = "Our E-Rate-supported network carries far more than classroom instruction.";
      if (ops.length) p += " Every day it supports " + joinList(ops) + ".";
      if (learning.length) p += (ops.length ? " It also supports " : " It supports ") + joinList(learning) + ".";
      if (ops.length) p += " Most of these systems are required by federal or state law or are basic to operating a safe building, and they have nothing to do with screen time.";
      lines.push(p);
    }
    lines.push("");

    if (v.amount) {
      var f = "Over funding years 2021 through 2025, " + org + " received approximately " + v.amount + " in E-Rate commitments";
      if (v.discount) f += ", at a Category One discount rate of " + v.discount;
      lines.push(f + ".");
    } else {
      lines.push("[Add your FY2021-2025 E-Rate commitments from erate.aasa.org.]");
    }
    lines.push("");

    var impact = "If E-Rate support were reduced or eliminated, these costs would not disappear; they would shift to our local budget.";
    lines.push(impact + " " + (v.impact || "[Describe what you would have to cut, delay, or pass on to taxpayers.]"));
    lines.push("");
    lines.push("I urge the Commission to maintain E-Rate support for both internet access and internal connections, and to keep the program available to schools and libraries in every community.");
    lines.push("");
    lines.push("Respectfully submitted,");
    lines.push(role);
    lines.push(org);
    return lines.join("\n");
  }

  function initWorksheet() {
    var form = $("#worksheet-form");
    var out = $("#comment-output");
    var checks = $("#system-checks");
    if (!form) return;

    SYSTEMS.forEach(function (s) {
      checks.appendChild(el("label", {}, [
        el("input", { type: "checkbox", name: "sys", value: s.id }),
        el("span", { text: s.label })
      ]));
    });

    function read() {
      var v = { systems: {} };
      ["role", "org", "place", "kind", "amount", "discount", "impact"].forEach(function (name) {
        v[name] = (form.elements[name].value || "").trim();
      });
      $$("input[name=sys]", form).forEach(function (c) { if (c.checked) v.systems[c.value] = true; });
      return v;
    }

    function write(v) {
      ["role", "org", "place", "kind", "amount", "discount", "impact"].forEach(function (name) {
        if (v[name] != null) form.elements[name].value = v[name];
      });
      $$("input[name=sys]", form).forEach(function (c) { c.checked = !!(v.systems && v.systems[c.value]); });
    }

    function update() {
      var v = read();
      out.value = buildComment(v);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
    }

    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) write(saved);
    } catch (e) { /* ignore */ }

    // Libraries get the patron item pre-checked the first time they pick "library".
    form.elements.kind.addEventListener("change", function () {
      if (form.elements.kind.value === "library") {
        var patron = $("input[value=patrons]", form);
        if (patron) patron.checked = true;
      }
    });

    form.addEventListener("input", update);
    form.addEventListener("change", update);
    $("#worksheet-clear").addEventListener("click", function () {
      form.reset();
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
      update();
      toast("Worksheet cleared");
    });
    update();
  }

  /* ---- Share kit -------------------------------------------------------- */

  var POST_LONG = [
    "The FCC is asking whether E-rate should be limited or sunset. Initial comments close October 13.",
    "",
    "Stacy Hawthorne's piece for CoSN, \"Before a Single Student Logs On,\" is the clearest account I have read of what a school network actually carries: bus routing at 5:30, ventilation and door access by 7:00, meal claims and attendance by 8:00, and the 911 and lockdown systems that federal and state law require. Very little of that is screen time.",
    "",
    "I built a tracker that gathers the FCC's own documents, the reporting, and the advocacy tools in one place, including the specific questions the Commission is asking (with paragraph numbers) and a worksheet for drafting a local comment.",
    "",
    "As someone who writes critically about screens and AI in classrooms, I think the screen-time debate deserves serious attention. It is a pedagogical question, though, and it should not be settled by defunding the infrastructure a building needs to run safely.",
    "",
    SITE_URL,
    "",
    "#ERate #EdTech #K12 #SchoolLibraries"
  ].join("\n");

  var POST_SHORT = "The FCC is asking whether E-rate should be limited or sunset. Before the first login, a school network is already running buses, doors, HVAC, meal claims, and 911. I built a tracker of the record, with a comment worksheet. Comments due Oct 13. " + SITE_URL;

  var POST_SLIDE = "Scan to read the record: FCC 26-41, the reporting, and a worksheet for your own comment. Comments due October 13, 2026. minerclass.github.io/erate-tracker";

  function initShare() {
    $("#post-long").value = POST_LONG;
    $("#post-short").value = POST_SHORT;
    $("#post-slide").value = POST_SLIDE;
    var n = POST_SHORT.length;
    $("#post-short-count").textContent = n + " characters, including the link (Bluesky allows 300).";
    $("#share-bluesky").href = "https://bsky.app/intent/compose?text=" + encodeURIComponent(POST_SHORT);
  }

  /* ---- Copy and toast --------------------------------------------------- */

  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = el("textarea", { style: "position:fixed;opacity:0" });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  function initCopy() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-copy], [data-copy-text]");
      if (!btn) return;
      var text = btn.hasAttribute("data-copy-text")
        ? btn.getAttribute("data-copy-text")
        : $("#" + btn.getAttribute("data-copy")).value;
      copyText(text).then(function () { toast("Copied"); }, function () { toast("Copy failed; select the text and copy it manually"); });
    });
  }

  /* ---- Presenter mode --------------------------------------------------- */

  function initPresenter() {
    var dlg = $("#presenter");
    var opener = $("#presenter-open");
    var close = $("#presenter-close");
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      dlg.hidden = false;
      document.body.style.overflow = "hidden";
      close.focus();
    }
    function shut() {
      dlg.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    opener.addEventListener("click", open);
    close.addEventListener("click", shut);
    document.addEventListener("keydown", function (e) {
      if (dlg.hidden) return;
      if (e.key === "Escape") shut();
      if (e.key === "Tab") { e.preventDefault(); close.focus(); }
    });
    if (location.hash === "#present") open();
  }

  /* ---- Boot ------------------------------------------------------------- */

  function boot(data) {
    renderDeadline(data.deadlines || DEFAULT_DEADLINES);
    if (data.updated) {
      var u = $("#updated-date");
      u.setAttribute("datetime", data.updated);
      u.textContent = formatDate(data.updated, "long");
    }
    initSources(data);
    initTimeline(data);
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderDeadline(DEFAULT_DEADLINES);
    initMorning();
    initWorksheet();
    initShare();
    initCopy();
    initPresenter();

    fetch("data/sources.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(boot)
      .catch(function () {
        $("#result-count").textContent = "The source list could not load. It is also available as data/sources.json in the repository.";
      });
  });
})();
