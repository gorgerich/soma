// State switcher for the phone stage. Radio-group semantics with full
// keyboard support (arrow keys move selection, as native radios do).
(function () {
  "use strict";

  var buttons = Array.prototype.slice.call(
    document.querySelectorAll('.switcher [role="radio"]')
  );
  var shots = {
    idle: document.getElementById("shot-idle"),
    selected: document.getElementById("shot-selected"),
    front: document.getElementById("shot-front"),
    "large-type": document.getElementById("shot-large-type"),
    "small-screen": document.getElementById("shot-small-screen"),
  };
  var caption = document.getElementById("phone-caption");
  var captions = {
    idle: "Back view, no area selected",
    selected: "Back view, lower back selected",
    front: "Front view",
    "large-type": "Lower back selected with large Dynamic Type",
    "small-screen": "iPhone SE small-screen layout",
  };

  function select(state) {
    buttons.forEach(function (button) {
      var isActive = button.dataset.state === state;
      button.setAttribute("aria-checked", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });
    Object.keys(shots).forEach(function (key) {
      shots[key].classList.toggle("is-active", key === state);
    });
    caption.textContent = captions[state];
  }

  buttons.forEach(function (button, index) {
    button.addEventListener("click", function () {
      select(button.dataset.state);
    });
    button.addEventListener("keydown", function (event) {
      var delta = 0;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") delta = 1;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") delta = -1;
      if (delta === 0) return;
      event.preventDefault();
      var next = buttons[(index + delta + buttons.length) % buttons.length];
      select(next.dataset.state);
      next.focus();
    });
  });

  select("idle");
})();
