/*
 * Page controller: tabs, the terminal, the prompt line and the audit log.
 * The login logic itself lives in versions.js.
 */
(function () {
  "use strict";

  const REPO_SRC = window.LessonContent.REPO_SRC;
  const CANCELLED = { cancelled: true };
  const VERSIONS = window.LessonContent.VERSIONS;

  const els = {
    tabs: document.getElementById("tabs"),
    info: document.getElementById("info"),
    output: document.getElementById("output"),
    terminalTitle: document.getElementById("terminal-title"),
    form: document.getElementById("prompt-form"),
    label: document.getElementById("prompt-label"),
    input: document.getElementById("prompt-input"),
    restart: document.getElementById("restart"),
    logCard: document.getElementById("log-card"),
    logList: document.getElementById("log-list"),
    clearLog: document.getElementById("clear-log"),
    progress: document.getElementById("progress"),
    concepts: document.getElementById("concepts"),
    lab: document.getElementById("lab"),
    quiz: document.getElementById("quiz"),
    glossary: document.getElementById("glossary"),
  };

  // Kept for the life of the page, like a file on disk.
  const auditLog = [];
  let current = null;   // { version, cancel, submit, pending }
  let tabButtons = [];

  /* ---------- formatting helpers ---------- */

  function pad2(n) { return String(n).padStart(2, "0"); }

  function timestamp(date) {
    return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate()) +
      " " + pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + ":" + pad2(date.getSeconds());
  }

  function logLine(entry) {
    return "[" + entry.time + "] EVENT: " + entry.event.padEnd(22) +
      " | USER: " + entry.user.padEnd(15) + " | DETAILS: " + entry.details;
  }

  /* ---------- rendering ---------- */

  function addLine(text, cls) {
    const div = document.createElement("div");
    div.className = "line" + (cls ? " " + cls : "");
    div.textContent = text;
    els.output.appendChild(div);
    els.output.scrollTop = els.output.scrollHeight;
  }

  function printText(text) {
    // The Python print() adds a newline; a leading \n gives a blank line.
    for (const part of String(text).split("\n")) {
      addLine(part);
    }
  }

  function setPrompt(label, secret, enabled) {
    els.label.textContent = label;
    els.label.classList.toggle("waiting", !enabled);
    els.input.type = secret ? "password" : "text";
    els.input.disabled = !enabled;
    els.input.value = "";
    if (enabled) {
      els.input.focus();
    }
  }

  function renderLog() {
    els.logList.textContent = "";
    if (auditLog.length === 0) {
      const empty = document.createElement("span");
      empty.className = "empty";
      empty.textContent = "(empty)";
      els.logList.appendChild(empty);
      return;
    }
    els.logList.textContent = auditLog.map(logLine).join("\n");
    els.logList.scrollTop = els.logList.scrollHeight;
  }

  function renderInfo(version) {
    const parts = [];
    parts.push('<h2>' + escapeHtml(version.tab + "  " + version.title) + "</h2>");
    parts.push('<p>' + escapeHtml(version.summary) + "</p>");
    parts.push('<p class="gap-note"><strong>Limitation:</strong> ' + escapeHtml(version.gaps) + "</p>");

    const rows = version.hints.map(function (h) {
      return "<tr><td>" + escapeHtml(h[0]) + "</td><td><code>" + escapeHtml(h[1]) + "</code></td></tr>";
    }).join("");
    parts.push(
      '<details open><summary>Test accounts</summary><div><table class="hint-table">' + rows + "</table></div></details>"
    );
    parts.push(
      '<p style="margin-top:12px;"><a href="' + REPO_SRC + encodeURIComponent(version.file) +
      '">View ' + escapeHtml(version.file) + " on GitHub</a></p>"
    );
    els.info.innerHTML = parts.join("");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderTabs() {
    els.tabs.textContent = "";
    tabButtons = VERSIONS.map(function (v) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tab";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "output");
      button.textContent = v.tab;
      button.addEventListener("click", function () { startVersion(v.id); });
      els.tabs.appendChild(button);
      return button;
    });
  }

  /* ---------- the session: runs one program and answers its prompts ---------- */

  function createSession(version, program) {
    let cancelled = false;
    let pending = null;
    const timers = new Set();

    const io = {
      print: function (text) {
        if (!cancelled) printText(text);
      },
      ask: function (prompt, opts) {
        const secret = !!(opts && opts.secret);
        return new Promise(function (resolve, reject) {
          if (cancelled) return reject(CANCELLED);
          pending = { prompt: prompt, secret: secret, resolve: resolve, reject: reject };
          setPrompt(prompt, secret, true);
        });
      },
      sleep: function (ms) {
        return new Promise(function (resolve, reject) {
          if (cancelled) return reject(CANCELLED);
          const timer = setTimeout(function () { timers.delete(timer); resolve(); }, ms);
          timers.add(timer);
        });
      },
      log: function (event, user, details) {
        if (cancelled) return;
        auditLog.push({ time: timestamp(new Date()), event: event, user: user || "ANONYMOUS", details: details });
        renderLog();
      },
    };

    function submit(value) {
      if (!pending) return;
      const answer = pending;
      pending = null;
      setPrompt("...", false, false);
      addLine(answer.prompt + (answer.secret ? "" : value), "echo");
      answer.resolve(value);
    }

    function cancel() {
      cancelled = true;
      timers.forEach(function (t) { clearTimeout(t); });
      timers.clear();
      if (pending) {
        const p = pending;
        pending = null;
        p.reject(CANCELLED);
      }
    }

    program(io).then(
      function () {
        if (!cancelled) {
          addLine("[program finished]", "system");
          setPrompt("...", false, false);
        }
      },
      function (err) {
        if (err !== CANCELLED && !cancelled) {
          addLine("[program stopped: " + (err && err.message ? err.message : err) + "]", "error");
          setPrompt("...", false, false);
        }
      }
    );

    return { cancel: cancel, submit: submit };
  }

  /* ---------- page actions ---------- */

  function startVersion(id) {
    const version = VERSIONS.find(function (v) { return v.id === id; });
    if (!version) return;

    if (current) current.cancel();
    els.output.textContent = "";
    els.terminalTitle.textContent = "python " + version.file;

    tabButtons.forEach(function (button, i) {
      button.setAttribute("aria-selected", VERSIONS[i].id === id ? "true" : "false");
    });

    renderInfo(version);
    window.CodeView.load(version.file);
    els.logCard.hidden = !version.hasLog;
    renderLog();
    window.Lessons.renderLesson(version, {
      concepts: els.concepts,
      lab: els.lab,
      quiz: els.quiz,
    }, function (done) {
      window.Lessons.renderProgress(els.progress, done);
    });

    const session = createSession(version, window.Versions.programs[version.program]);
    current = { id: id, cancel: session.cancel };
    els.form.onsubmit = function (event) {
      event.preventDefault();
      if (els.input.disabled) return;
      session.submit(els.input.value);
    };
    els.restart.onclick = function () { startVersion(id); };
    els.output.setAttribute("aria-label", "Output from " + version.file);
  }

  els.clearLog.addEventListener("click", function () {
    auditLog.length = 0;
    renderLog();
  });

  /* ---------- start ---------- */

  renderTabs();
  renderLog();
  window.CodeView.init();
  window.Lessons.renderProgress(els.progress, window.Lessons.getDone());
  els.glossary.textContent = "";
  els.glossary.appendChild(window.Lessons.renderGlossary());
  startVersion("v1");
})();
