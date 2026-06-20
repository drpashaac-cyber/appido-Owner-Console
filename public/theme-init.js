(function () {
  try {
    var t = localStorage.getItem("appido-theme");
    if (t !== "dark" && t !== "light") {
      t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    var l = localStorage.getItem("appido-lang") === "en" ? "en" : "fa";
    var h = document.documentElement;
    h.setAttribute("data-theme", t);
    h.setAttribute("lang", l);
    h.setAttribute("dir", l === "fa" ? "rtl" : "ltr");
    h.style.background = t === "dark" ? "#1A312B" : "#F4F1E6";
  } catch (e) {}
})();
