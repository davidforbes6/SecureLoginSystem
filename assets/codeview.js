/*
 * Shows the real Python source next to the terminal. The file is fetched from src/,
 * so the page always shows the code that is in the repository.
 * Theory cards ask for a line by its anchor text (concept.anchor in content.js).
 */
(function (root) {
  "use strict";

  const KEYWORDS = /\b(?:def|class|if|elif|else|while|for|in|return|import|from|as|with|try|except|and|or|not|True|False|None|break|continue|pass|raise|is|lambda)\b/;
  const BUILTINS = /\b(?:print|input|len|ord|int|str|range|open|hex|format|isinstance|getattr|sorted|list|dict|set|tuple|bool|max|min|sum|any|all|IOError)\b/;
  // One pass over a line: comment, string, number, keyword, builtin, or plain text.
  const TOKEN = new RegExp(
    [
      "(#.*$)",
      "(\"[^\"]*\"|'[^']*')",
      "(\\b\\d+(?:\\.\\d+)?\\b)",
      "(" + KEYWORDS.source + ")",
      "(" + BUILTINS.source + ")",
    ].join("|"),
    "g"
  );
  const CLASSES = ["c-comment", "c-string", "c-number", "c-keyword", "c-builtin"];

  // Split one line into [text, className] pairs. Docstring lines are passed in as already marked.
  function tokenise(line, inDocstring) {
    if (inDocstring) return [[line, "c-string"]];
    const parts = [];
    let last = 0;
    let match;
    TOKEN.lastIndex = 0;
    while ((match = TOKEN.exec(line)) !== null) {
      if (match.index > last) parts.push([line.slice(last, match.index), ""]);
      const group = match.slice(1).findIndex((g) => g !== undefined);
      parts.push([match[0], CLASSES[group]]);
      last = match.index + match[0].length;
      if (match[0].length === 0) TOKEN.lastIndex++;
    }
    if (last < line.length) parts.push([line.slice(last), ""]);
    return parts;
  }

  // Works out which lines are inside a triple-quoted docstring.
  function docstringFlags(lines) {
    let open = false;
    return lines.map(function (line) {
      const count = (line.match(/"""/g) || []).length;
      const flag = open || count > 0;
      if (count % 2 === 1) open = !open;
      return flag;
    });
  }

  // Lines that belong to the block starting at index (for def / if / while / for).
  function blockRange(lines, index) {
    const header = lines[index];
    const indent = header.length - header.trimStart().length;
    let end = index;
    for (let i = index + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "") continue;
      const lineIndent = line.length - line.trimStart().length;
      if (lineIndent <= indent) break;
      end = i;
    }
    return { start: index, end: end };
  }

  // Finds the first line containing the anchor text, and the lines it highlights.
  function findAnchor(lines, anchor) {
    const index = lines.findIndex((line) => line.includes(anchor));
    if (index === -1) return null;
    const trimmed = lines[index].trim();
    const isBlock = /^(def|class|if|while|for|with|try)\b/.test(trimmed);
    return isBlock ? blockRange(lines, index) : { start: index, end: index };
  }

  const state = { lines: [], rows: [], panel: null, body: null, status: null, link: null, title: null };

  function setStatus(text) {
    if (state.status) state.status.textContent = text;
  }

  function render(lines, file) {
    const flags = docstringFlags(lines);
    state.body.textContent = "";
    state.rows = lines.map(function (line, i) {
      const row = document.createElement("div");
      row.className = "code-line";
      const num = document.createElement("span");
      num.className = "line-no";
      num.textContent = String(i + 1);
      const text = document.createElement("span");
      text.className = "line-text";
      tokenise(line, flags[i]).forEach(function (part) {
        if (part[1]) {
          const span = document.createElement("span");
          span.className = part[1];
          span.textContent = part[0];
          text.appendChild(span);
        } else {
          text.appendChild(document.createTextNode(part[0]));
        }
      });
      row.appendChild(num);
      row.appendChild(text);
      state.body.appendChild(row);
      return row;
    });
    state.title.textContent = file;
  }

  function clearHighlight() {
    state.rows.forEach((row) => row.classList.remove("hl"));
  }

  function highlight(anchor) {
    if (!state.rows.length) return;
    clearHighlight();
    const range = findAnchor(state.lines, anchor);
    if (!range) {
      setStatus("Could not find that line in this file.");
      return;
    }
    for (let i = range.start; i <= range.end; i++) state.rows[i].classList.add("hl");
    const first = state.rows[range.start];
    state.body.scrollTop = Math.max(0, first.offsetTop - state.body.clientHeight / 3);
    setStatus("Highlighted lines " + (range.start + 1) + " to " + (range.end + 1) + " for “" + anchor + "”.");
  }

  function showFallback(file) {
    state.body.textContent = "";
    const message = document.createElement("p");
    message.className = "code-fallback";
    message.textContent = "The source could not be loaded here. Open the file on GitHub instead.";
    state.body.appendChild(message);
    setStatus("");
  }

  async function load(file) {
    state.title.textContent = file;
    state.link.href = "https://github.com/davidforbes6/SecureLoginSystem/blob/main/src/" + encodeURIComponent(file);
    state.body.textContent = "Loading " + file + "…";
    state.rows = [];
    state.lines = [];
    setStatus("");
    try {
      const response = await fetch("src/" + encodeURIComponent(file));
      if (!response.ok) throw new Error("HTTP " + response.status);
      const text = await response.text();
      state.lines = text.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
      render(state.lines, file);
    } catch (e) {
      showFallback(file);
    }
  }

  function init() {
    state.panel = document.getElementById("code-panel");
    state.body = document.getElementById("code-body");
    state.status = document.getElementById("code-status");
    state.link = document.getElementById("code-link");
    state.title = document.getElementById("code-title");
    document.addEventListener("sls:highlight", function (event) {
      if (!state.panel) return;
      state.panel.scrollIntoView({ behavior: "smooth", block: "center" });
      highlight(event.detail);
    });
  }

  root.CodeView = {
    init: init,
    load: load,
    highlight: highlight,
    // Exposed for tests
    tokenise: tokenise,
    findAnchor: findAnchor,
    docstringFlags: docstringFlags,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.CodeView;
  }
})(typeof window !== "undefined" ? window : globalThis);
