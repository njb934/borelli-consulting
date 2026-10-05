/* The Edge: sign-up pop-up.
   Shows the beehiiv sign-up form (the same light form as the subscribe box) in a dialog once a
   reader has spent some time with an issue. Loaded only on The Edge's pages (issue pages and the
   archive), never on the homepage or the workshop tools.

   When it opens
   - after the reader scrolls 40% of the page and has been on it 15 seconds, or has scrolled 15% and
     been on it 45 seconds;
   - on Workshop pages, only near the end (80% scrolled), never in the middle of an exercise;
   - never once the subscribe box at the bottom of the page has been on screen (they've seen it);
   - at most once per visit.
   When it stays away
   - closed without signing up: 14 days;
   - signed up here or in the subscribe box (beehiiv reports success): for good;
   - arrived from the newsletter email (beehiiv's link tags): for good.
   ?signup=preview opens it straight away and remembers nothing (for reviewing the design).

   The form loads only when the pop-up opens, so pages don't fetch a second form for nothing. */
(function () {
  "use strict";
  var KEY = "edge-signup";
  var DAY = 864e5, SNOOZE_DAYS = 14;
  var test = window.__edgeSignupTest || {};
  var MIN_MS = test.minMs != null ? test.minMs : 15000;
  var MAX_MS = test.maxMs != null ? test.maxMs : 45000;
  var tpl = document.getElementById("signup-pop-tpl");
  if (!tpl || !("content" in tpl) || typeof HTMLDialogElement !== "function") return;

  var params = new URLSearchParams(location.search);
  var preview = params.get("signup") === "preview";
  var workshop = document.body.classList.contains("workshop");
  var t0 = Date.now(), shown = false, boxSeen = false, dlg = null, lastFocus = null, timer = null;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(patch) {
    if (preview) return;
    try {
      var s = load();
      for (var k in patch) s[k] = patch[k];
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) { /* storage blocked: the once-per-visit rule still holds */ }
  }
  function sessionSeen() {
    try { return sessionStorage.getItem(KEY) === "shown"; } catch (e) { return false; }
  }

  // Readers who came from the newsletter email are already subscribed.
  var medium = (params.get("utm_medium") || "").toLowerCase();
  var source = (params.get("utm_source") || "").toLowerCase();
  if (params.has("_bhlid") || medium === "email" || medium === "newsletter" || source.indexOf("beehiiv") > -1) {
    save({ reader: true });
  }

  function eligible() {
    if (preview) return true;
    var s = load();
    if (s.subscribed || s.reader) return false;
    if (s.dismissed && Date.now() - s.dismissed < SNOOZE_DAYS * DAY) return false;
    return !sessionSeen();
  }

  function depth() {
    var room = document.documentElement.scrollHeight - window.innerHeight;
    return room <= 0 ? 1 : window.scrollY / room;
  }
  function boxOnScreen() {
    var box = document.getElementById("subscribe");
    if (!box) return false;
    var r = box.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  // Only ever opens while the reader is still: never mid-scroll, and never on the way down to the
  // subscribe box (the "Subscribe free" button scrolls there smoothly, past the 40% mark).
  var lastScroll = 0, settle = null, pending = false;
  function check() {
    if (shown || boxSeen) return stop();
    if (boxOnScreen()) { boxSeen = true; return stop(); }
    if (document.hidden || Date.now() - lastScroll < 700) return;
    var held = Date.now() - t0, d = depth();
    var due = workshop ? d >= 0.8 : (d >= 0.4 && held >= MIN_MS) || (d >= 0.15 && held >= MAX_MS);
    if (due) open();
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    clearTimeout(settle);
    window.removeEventListener("scroll", onScroll);
  }
  function onScroll() {
    lastScroll = Date.now();
    clearTimeout(settle);
    settle = setTimeout(check, 800);
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      if (boxOnScreen()) { boxSeen = true; stop(); }
    });
  }
  function headingForBox() { boxSeen = true; stop(); }
  if (location.hash === "#subscribe") headingForBox();
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href="#subscribe"]');
    if (a) headingForBox();
  });

  function open() {
    if (shown || boxSeen) return;
    shown = true;
    stop();
    try { if (!preview) sessionStorage.setItem(KEY, "shown"); } catch (e) {}
    document.body.appendChild(tpl.content.cloneNode(true));
    dlg = document.querySelector("dialog.signup-pop");
    lastFocus = document.activeElement;
    dlg.querySelector(".signup-pop-close").addEventListener("click", function () { dlg.close("closed"); });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close("closed");   // a click on the dimmed page around the pop-up
    });
    dlg.addEventListener("close", function () {
      document.documentElement.classList.remove("signup-open");
      if (dlg.returnValue !== "subscribed") save({ dismissed: Date.now() });
      if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
    });
    document.documentElement.classList.add("signup-open");
    dlg.showModal();
    dlg.querySelector(".signup-pop-close").focus();
  }

  // beehiiv's form tells the page when someone signs up (its embed script then shows the
  // "You're in" message on the page). Remember it, and close the pop-up so the message is visible.
  window.addEventListener("message", function (e) {
    if (!e.data || e.data.type !== "beehiiv:success-toast") return;
    var ours = [].some.call(document.querySelectorAll("iframe.beehiiv-embed"), function (f) {
      return f.contentWindow === e.source;
    });
    if (!ours) return;
    save({ subscribed: true });
    if (dlg && dlg.open) dlg.close("subscribed");
    shown = true;
    stop();
  });

  if (preview) {
    open();
  } else if (eligible()) {
    timer = setInterval(check, 1000);
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  window.edgeSignup = { open: open, state: load };
})();
