/*
 * Renders the theory cards, interactive labs, quizzes, progress and glossary.
 * Text that comes from the visitor is always written with textContent.
 */
(function (root) {
  "use strict";

  const Versions = root.Versions;
  const Labs = root.Labs;
  const Content = root.LessonContent;
  const STORAGE_KEY = "sls-done-v1";

  const OUTCOMES = {
    "SE-12-04": "Evaluates practices to safely and securely collect, use and store data",
    "SE-12-07": "Designs, develops and implements safe and secure programming solutions",
    "SE-12-08": "Tests and evaluates language structures to refine code",
  };

  /* ---------- small DOM helper ---------- */

  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      for (const key of Object.keys(props)) {
        const value = props[key];
        if (key === "text") node.textContent = value;
        else if (key === "className") node.className = value;
        else if (key === "on") {
          for (const evt of Object.keys(value)) node.addEventListener(evt, value[evt]);
        } else if (key === "attrs") {
          for (const attr of Object.keys(value)) node.setAttribute(attr, value[attr]);
        } else node[key] = value;
      }
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  /* ---------- progress (remembered in this browser only) ---------- */

  function getDone() {
    try {
      const raw = root.localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (e) {
      return new Set();
    }
  }

  function markDone(id) {
    const done = getDone();
    done.add(id);
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(done)));
    } catch (e) {
      // Storage can be blocked. Progress then lasts only for this page visit.
    }
    return done;
  }

  function renderProgress(container, done) {
    const all = Content.VERSIONS;
    const count = all.filter((v) => done.has(v.id)).length;
    container.textContent = "";
    const heading = el("p", { className: "progress-text", text: "Your progress: " + count + " of " + all.length + " versions complete" });
    const bar = el("div", { className: "progress-bar", attrs: { role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(all.length), "aria-valuenow": String(count), "aria-label": "Versions complete" } }, [
      el("div", { className: "progress-fill", attrs: { style: "width:" + Math.round((count / all.length) * 100) + "%" } }),
    ]);
    const chips = el("div", { className: "chips" }, all.map(function (v) {
      return el("span", { className: "chip" + (done.has(v.id) ? " chip-done" : ""), text: (done.has(v.id) ? "✓ " : "") + v.id });
    }));
    container.appendChild(heading);
    container.appendChild(bar);
    container.appendChild(chips);
  }

  /* ---------- theory ---------- */

  function renderConcepts(version) {
    const badges = version.outcomes.map(function (code) {
      return el("abbr", { className: "badge", text: code, attrs: { title: OUTCOMES[code] || "" } });
    });
    return el("div", null, [
      el("p", { className: "muted small" }, ["Course outcomes covered: ", ...badges]),
      el("div", { className: "concept-grid" }, version.concepts.map(function (c) {
        return el("article", { className: "concept" }, [
          el("h3", { text: c.term }),
          el("p", { text: c.text }),
          el("p", { className: "where" }, [el("span", { className: "where-label", text: "Find it: " }), c.where]),
        ]);
      })),
    ]);
  }

  /* ---------- labs ---------- */

  function labInput(label, value, onInput) {
    const input = el("input", { type: "text", value: value, spellcheck: false, autocomplete: "off", on: { input: onInput } });
    return el("label", { className: "lab-field" }, [el("span", { text: label }), input]);
  }

  function labCheckbox(label, checked, onChange) {
    const input = el("input", { type: "checkbox", checked: checked, on: { change: onChange } });
    return el("label", { className: "lab-check" }, [input, el("span", { text: label })]);
  }

  function resultBox() {
    return el("div", { className: "lab-result", attrs: { "aria-live": "polite" } });
  }

  function labV1() {
    const result = resultBox();
    const table = el("table", { className: "lab-table" });
    const combos = [[true, true], [true, false], [false, true], [false, false]];
    const rows = combos.map(function (c) {
      const row = el("tr", null, [
        el("td", { text: c[0] ? "Correct" : "Wrong" }),
        el("td", { text: c[1] ? "Correct" : "Wrong" }),
        el("td", { text: Labs.v1Decision(c[0], c[1]).denied ? "Access Denied" : "Access Granted" }),
      ]);
      table.appendChild(row);
      return { row: row, combo: c };
    });
    const userBox = labCheckbox("Username is correct", true, update);
    const passBox = labCheckbox("Password is correct", true, update);
    const userChecked = userBox.querySelector("input");
    const passChecked = passBox.querySelector("input");
    const expr = el("code", { text: "(username != STORED_USERNAME) or (password != STORED_PASSWORD)" });

    function update() {
      const d = Labs.v1Decision(userChecked.checked, passChecked.checked);
      result.textContent = "Python result: " + (d.denied ? "Access Denied: Invalid credentials." : "Access Granted: Welcome to the system.");
      rows.forEach(function (r) {
        r.row.classList.toggle("current", r.combo[0] === userChecked.checked && r.combo[1] === passChecked.checked);
      });
    }
    update();
    return el("div", { className: "lab" }, [
      el("p", null, ["Tick each box to say whether that credential is correct. The check is:"]),
      el("p", null, [expr]),
      el("div", { className: "lab-row" }, [userBox, passBox]),
      result,
      el("p", { className: "muted small", text: "Full truth table (the highlighted row matches your ticks):" }),
      el("table", { className: "lab-table" }, [
        el("thead", null, [el("tr", null, [el("th", { text: "Username" }), el("th", { text: "Password" }), el("th", { text: "Result" })])]),
        el("tbody", null, rows.map(function (r) { return r.row; })),
      ]),
    ]);
  }

  function labV2() {
    const result = resultBox();
    const input = labInput("Type any text, including spaces:", "   ", update);
    const box = input.querySelector("input");
    function update() {
      const check = Labs.v2Check(box.value);
      result.textContent = "";
      result.appendChild(el("p", { text: "Raw input: " + JSON.stringify(check.raw) }));
      result.appendChild(el("p", { text: "After strip(): " + JSON.stringify(check.stripped) + " (length " + check.stripped.length + ")" }));
      result.appendChild(el("p", { className: check.accepted ? "ok" : "bad",
        text: check.accepted ? "Accepted: the loop moves on." : "Rejected: 'Validation Error: Username cannot be blank.'" }));
    }
    update();
    return el("div", { className: "lab" }, [
      el("p", null, ["Why does v2 use strip()? Try a few entries and watch what happens."]),
      input,
      result,
    ]);
  }

  function labV3() {
    // Three subroutines, called on their own, with their returned value shown.
    const helpers = Versions.helpers;
    const out1 = resultBox();
    const txt = labInput("text", "  alice  ", function () {});
    const box1 = txt.querySelector("input");
    const call1 = el("button", { type: "button", className: "btn", text: "Call get_non_empty_input(text)", on: { click: function () {
      const r = helpers.checkNonEmpty(box1.value);
      out1.textContent = r.ok ? "Returned: " + JSON.stringify(r.value) : "Returned nothing. Printed: " + r.message;
    } } });

    const out2 = resultBox();
    const user = labInput("username", "admin", function () {});
    const pass = labInput("password", "Password123", function () {});
    const boxU = user.querySelector("input");
    const boxP = pass.querySelector("input");
    const call2 = el("button", { type: "button", className: "btn", text: "Call validate_credentials(username, password)", on: { click: function () {
      out2.textContent = "Returned: " + (helpers.validateCredentials(boxU.value, boxP.value) ? "True" : "False");
    } } });

    const out3 = resultBox();
    const authBox = labCheckbox("is_authenticated", false, function () {});
    const authChecked = authBox.querySelector("input");
    const remaining = el("select", { attrs: { "aria-label": "remaining_attempts" } }, [3, 2, 1, 0].map(function (n) {
      return el("option", { value: String(n), text: String(n), selected: n === 2 });
    }));
    const call3 = el("button", { type: "button", className: "btn", text: "Call display_status(is_authenticated, remaining_attempts)", on: { click: function () {
      out3.textContent = "Printed: " + helpers.statusMessage(authChecked.checked, Number(remaining.value)).replace(/^\n/, "");
    } } });

    return el("div", { className: "lab" }, [
      el("p", null, ["Each subroutine can be tested alone. Change the inputs and call it, just as tests/test_v3.py does."]),
      el("div", { className: "lab-block" }, [el("h4", { text: "1. get_non_empty_input" }), txt, call1, out1]),
      el("div", { className: "lab-block" }, [el("h4", { text: "2. validate_credentials" }), user, pass, call2, out2]),
      el("div", { className: "lab-block" }, [el("h4", { text: "3. display_status" }), el("div", { className: "lab-row" }, [authBox, el("label", { className: "lab-field" }, [el("span", { text: "remaining_attempts" }), remaining])]), call3, out3]),
    ]);
  }

  function labV4() {
    // Hash stepper
    const hashOut = el("div", { className: "lab-result", attrs: { "aria-live": "polite" } });
    const hashBox = el("input", { type: "text", value: "ab", spellcheck: false, autocomplete: "off" });
    function renderHash() {
      const r = Labs.hashSteps(hashBox.value);
      const rows = [el("tr", null, [el("td", { text: "start" }), el("td", { text: "—" }), el("td", { text: "5381 (0x1505)" })])]
        .concat(r.steps.map(function (s) {
          return el("tr", null, [el("td", { text: JSON.stringify(s.ch) }), el("td", { text: String(s.code) }),
            el("td", { text: s.hash + "  (" + s.hex + ")" })]);
        }));
      hashOut.textContent = "";
      hashOut.appendChild(el("table", { className: "lab-table" }, [
        el("thead", null, [el("tr", null, [el("th", { text: "Character" }), el("th", { text: "Code (ord)" }), el("th", { text: "Running hash, mod 2^32" })])]),
        el("tbody", null, rows),
      ]));
      hashOut.appendChild(el("p", { text: "Final hash: " + r.finalHex + "   (matches Versions.customHash: " + (Versions.customHash(hashBox.value) === r.finalHex ? "yes" : "no") + ")" }));
    }
    hashBox.addEventListener("input", renderHash);

    // Collision checker
    const collOut = resultBox();
    const first = el("input", { type: "text", value: "aB", spellcheck: false, autocomplete: "off", attrs: { "aria-label": "First input" } });
    const second = el("input", { type: "text", value: "b!", spellcheck: false, autocomplete: "off", attrs: { "aria-label": "Second input" } });
    function renderColl() {
      const a = Versions.customHash(first.value);
      const b = Versions.customHash(second.value);
      collOut.textContent = "";
      collOut.appendChild(el("p", { text: JSON.stringify(first.value) + " → " + a + "     " + JSON.stringify(second.value) + " → " + b }));
      collOut.appendChild(el("p", { className: a === b ? "bad" : "ok",
        text: a === b ? "Collision: different inputs, same hash." : "No collision for these two inputs." }));
    }
    first.addEventListener("input", renderColl);
    second.addEventListener("input", renderColl);
    function preset(a, b) { return function () { first.value = a; second.value = b; renderColl(); }; }
    const presets = el("div", { className: "row-buttons" }, [
      el("button", { type: "button", className: "btn", text: "Brief's example: ab / ba", on: { click: preset("ab", "ba") } }),
      el("button", { type: "button", className: "btn", text: "Real collision: aB / b!", on: { click: preset("aB", "b!") } }),
    ]);

    // Sanitiser
    const sanOut = resultBox();
    const raw = el("input", { type: "text", value: '<Ad>:"min"', spellcheck: false, autocomplete: "off", attrs: { "aria-label": "Raw username" } });
    function renderSan() {
      const s = Labs.sanitiseSteps(raw.value);
      sanOut.textContent = "";
      const chars = el("p", { className: "chars" }, s.steps.map(function (st) {
        return el("span", { className: st.kept ? "kept" : "removed", text: st.ch });
      }));
      sanOut.appendChild(chars);
      sanOut.appendChild(el("p", { text: "Cleaned username: " + JSON.stringify(s.cleaned) }));
    }
    raw.addEventListener("input", renderSan);

    renderHash();
    renderColl();
    renderSan();

    return el("div", { className: "lab" }, [
      el("div", { className: "lab-block" }, [
        el("h4", { text: "A. Hash stepper: how the custom hash builds up" }),
        el("label", { className: "lab-field" }, [el("span", { text: "Text to hash" }), hashBox]),
        hashOut,
      ]),
      el("div", { className: "lab-block" }, [
        el("h4", { text: "B. Find a collision" }),
        el("p", { className: "muted small", text: "Two inputs collide when they give the same hash. Try the brief's claim, then a real collision." }),
        presets,
        el("div", { className: "lab-row" }, [first, second]),
        collOut,
      ]),
      el("div", { className: "lab-block" }, [
        el("h4", { text: "C. Sanitiser: what isalnum() keeps" }),
        el("p", { className: "muted small", text: "Green characters are kept. Red characters are removed before the lookup." }),
        raw,
        sanOut,
      ]),
    ]);
  }

  function labV5() {
    // SHA-256 explorer, with a sequence counter so slow results never overwrite newer ones.
    const digestA = el("p", { className: "digest" });
    const digestB = el("p", { className: "digest" });
    const bitsOut = el("p", { className: "lab-result" });
    const inputA = el("input", { type: "text", value: "Password123", spellcheck: false, autocomplete: "off", attrs: { "aria-label": "Text A" } });
    const inputB = el("input", { type: "text", value: "Password124", spellcheck: false, autocomplete: "off", attrs: { "aria-label": "Text B" } });
    let seq = 0;
    async function refresh() {
      const mine = ++seq;
      const a = await Versions.sha256Hex(inputA.value);
      const b = await Versions.sha256Hex(inputB.value);
      if (mine !== seq) return;
      digestA.textContent = a;
      digestB.textContent = b;
      const h = Labs.hammingBits(a, b);
      bitsOut.textContent = h.differing + " of " + h.total + " output bits differ (" + Math.round((100 * h.differing) / h.total) + "%). About half is the avalanche effect.";
    }
    inputA.addEventListener("input", refresh);
    inputB.addEventListener("input", refresh);
    refresh();

    // Dictionary attack, from the attacker's side
    const target = el("input", { type: "text", value: "Password123", spellcheck: false, autocomplete: "off", attrs: { "aria-label": "Password to crack" } });
    const attackOut = el("div", { className: "lab-result", attrs: { "aria-live": "polite" } });
    const attackBtn = el("button", { type: "button", className: "btn", text: "Attack the digest" });
    attackBtn.addEventListener("click", async function () {
      attackBtn.disabled = true;
      attackOut.textContent = "Attacker has only the digest. Trying " + Labs.WORDLIST.length + " common passwords…";
      const digest = await Versions.sha256Hex(target.value);
      const result = await Labs.crackWordlist(digest, Labs.WORDLIST, Versions.sha256Hex);
      attackOut.textContent = "";
      attackOut.appendChild(el("p", { text: "Target digest: " + digest }));
      attackOut.appendChild(el("p", { className: result.found ? "bad" : "ok",
        text: result.found
          ? "Recovered '" + result.found + "' after " + result.tried + " guesses in " + Math.round(result.ms) + " ms."
          : "Not recovered: none of the " + result.tried + " words matched in " + Math.round(result.ms) + " ms. A stronger password is safer." }));
      attackBtn.disabled = false;
    });

    return el("div", { className: "lab" }, [
      el("div", { className: "lab-block" }, [
        el("h4", { text: "A. SHA-256 explorer" }),
        el("label", { className: "lab-field" }, [el("span", { text: "Text A" }), inputA]),
        digestA,
        el("label", { className: "lab-field" }, [el("span", { text: "Text B (one character different)" }), inputB]),
        digestB,
        bitsOut,
      ]),
      el("div", { className: "lab-block" }, [
        el("h4", { text: "B. Be the attacker" }),
        el("p", { className: "muted small", text: "The attacker has a stolen digest and a list of common passwords. Hashing is fast, so each guess is cheap." }),
        el("label", { className: "lab-field" }, [el("span", { text: "Password the user chose" }), target]),
        el("p", { className: "muted small", text: "Try 'Wonderland2024!'. It is not in the list, so the attack fails. Real attacks use much larger lists." }),
        attackBtn,
        attackOut,
      ]),
    ]);
  }

  function labVFinal() {
    const lengthInput = el("input", { type: "range", min: "4", max: "12", value: "8", attrs: { "aria-label": "Password length" } });
    const lengthLabel = el("span", { text: "8" });
    const charset = el("select", { attrs: { "aria-label": "Characters used" } }, [
      el("option", { value: "10", text: "Digits only (10)" }),
      el("option", { value: "26", text: "Lower-case letters (26)" }),
      el("option", { value: "62", text: "Letters and digits (62)", selected: true }),
      el("option", { value: "94", text: "All printable characters (94)" }),
    ]);
    const table = el("div", { attrs: { "aria-live": "polite" } });

    const scenarios = [
      { label: "Online script, no lockout", rate: 1000, note: "1,000 guesses a second" },
      { label: "Online, vFINAL lockout", rate: 3 / 30, note: "3 guesses every 30 seconds" },
      { label: "Offline, stolen digest", rate: 1e9, note: "1 billion guesses a second (illustrative)" },
    ];

    function render() {
      const length = Number(lengthInput.value);
      lengthLabel.textContent = String(length);
      const rows = Labs.bruteForceEstimate(length, Number(charset.value), scenarios);
      table.textContent = "";
      table.appendChild(el("table", { className: "lab-table" }, [
        el("thead", null, [el("tr", null, [el("th", { text: "Attack" }), el("th", { text: "Average time to guess" })])]),
        el("tbody", null, rows.map(function (r) {
          return el("tr", null, [
            el("td", null, [el("strong", { text: r.label }), el("br"), el("span", { className: "muted small", text: r.note })]),
            el("td", { text: Labs.formatDuration(r.seconds) }),
          ]);
        })),
      ]));
      table.appendChild(el("p", { className: "muted small", text: "Average = half of all possible passwords. The space is " + Math.pow(Number(charset.value), length).toExponential(2) + " passwords." }));
    }
    lengthInput.addEventListener("input", render);
    charset.addEventListener("change", render);
    render();

    const lockoutRows = [
      { t: 60, label: "1 minute" },
      { t: 3600, label: "1 hour" },
      { t: 86400, label: "1 day" },
    ];
    return el("div", { className: "lab" }, [
      el("p", null, ["Move the sliders to see how length and the lockout change the time an attacker needs."]),
      el("label", { className: "lab-field" }, [el("span", { text: "Password length: " }), lengthInput, lengthLabel]),
      el("label", { className: "lab-field" }, [el("span", { text: "Characters: " }), charset]),
      table,
      el("div", { className: "lab-block" }, [
        el("h4", { text: "What the lockout allows" }),
        el("table", { className: "lab-table" }, [
          el("thead", null, [el("tr", null, [el("th", { text: "Time" }), el("th", { text: "Guesses allowed" })])]),
          el("tbody", null, lockoutRows.map(function (r) {
            return el("tr", null, [el("td", { text: r.label }), el("td", { text: String(Math.floor(r.t * 0.1)) })]);
          })),
        ]),
        el("p", { className: "muted small", text: "Restarting the program clears the counter, so the real limit is lower if the attacker can restart it." }),
      ]),
    ]);
  }

  const LABS = {
    "v1-truth": labV1,
    "v2-blank": labV2,
    "v3-playground": labV3,
    "v4-hash": labV4,
    "v5-sha": labV5,
    "vfinal-race": labVFinal,
  };

  /* ---------- quiz ---------- */

  function renderQuiz(version, onDone) {
    const form = el("form", { className: "quiz", attrs: { "aria-label": "Quiz for " + version.id } });
    const groups = version.quiz.map(function (item, i) {
      const name = "q-" + version.id + "-" + i;
      const options = item.options.map(function (opt, j) {
        return el("label", { className: "quiz-option" }, [
          el("input", { type: "radio", name: name, value: String(j) }),
          el("span", { text: opt }),
        ]);
      });
      const feedback = el("p", { className: "feedback", attrs: { "aria-live": "polite" } });
      return { item: item, name: name, feedback: feedback, node: el("fieldset", { className: "quiz-q" }, [
        el("legend", { text: "Question " + (i + 1) + ": " + item.q }),
        ...options,
        feedback,
      ]) };
    });
    const score = el("p", { className: "score", attrs: { "aria-live": "polite" } });
    const check = el("button", { type: "submit", className: "btn btn-primary", text: "Check my answers" });

    form.appendChild(el("p", { className: "muted small", text: "Two or three questions. Answer all of them to mark this version complete." }));
    groups.forEach(function (g) { form.appendChild(g.node); });
    form.appendChild(el("div", { className: "row-buttons" }, [check]));
    form.appendChild(score);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      let correct = 0;
      groups.forEach(function (g) {
        const picked = form.querySelector('input[name="' + g.name + '"]:checked');
        if (!picked) {
          g.feedback.className = "feedback bad";
          g.feedback.textContent = "Choose an answer.";
          return;
        }
        if (Number(picked.value) === g.item.answer) {
          correct += 1;
          g.feedback.className = "feedback ok";
          g.feedback.textContent = "Correct. " + g.item.why;
        } else {
          g.feedback.className = "feedback bad";
          g.feedback.textContent = "Not quite. The answer is: " + g.item.options[g.item.answer] + ". " + g.item.why;
        }
      });
      score.textContent = "Score: " + correct + " of " + groups.length + (correct === groups.length ? ". Version complete!" : ". Try again.");
      if (correct === groups.length && onDone) onDone(version.id);
    });
    return form;
  }

  /* ---------- glossary ---------- */

  function renderGlossary() {
    const list = el("dl", { className: "glossary" });
    Content.GLOSSARY.forEach(function (g) {
      list.appendChild(el("dt", { text: g[0] }));
      list.appendChild(el("dd", { text: g[1] }));
    });
    return list;
  }

  /* ---------- public API ---------- */

  // parts: { concepts, lab, quiz } containers. onChange runs after a version is completed.
  function renderLesson(version, parts, onChange) {
    parts.concepts.textContent = "";
    parts.concepts.appendChild(renderConcepts(version));
    parts.lab.textContent = "";
    const build = LABS[version.lab];
    parts.lab.appendChild(build ? build() : el("p", { text: "No lab for this version." }));
    parts.quiz.textContent = "";
    parts.quiz.appendChild(renderQuiz(version, function (id) {
      const done = markDone(id);
      if (onChange) onChange(done);
    }));
  }

  root.Lessons = {
    renderLesson: renderLesson,
    renderProgress: renderProgress,
    renderGlossary: renderGlossary,
    getDone: getDone,
  };
})(typeof window !== "undefined" ? window : globalThis);
