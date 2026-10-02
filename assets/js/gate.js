/* Internal-preview gate.
 * Asks for a password once per browser and remembers it in localStorage.
 * This is a client-side deterrent for the preview phase only: the page HTML is
 * still downloadable, so it is NOT a security boundary. Remove this script
 * (and the html.gated style) at public launch.
 * The password is stored as a SHA-256 hex digest, not in clear text. */
(function () {
  "use strict";
  var KEY = "ailife-preview-ok";
  var HASH = "59d2fcb3f9400ca3dcdc5c3513c00bd203500cb0d0561794e0303514bb4fc81d";
  try { if (localStorage.getItem(KEY) === "1") return; } catch (e) { /* storage blocked: always ask */ }
  document.documentElement.classList.add("gated");

  // Compact SHA-256 (public-domain style implementation) so the gate also works on file://
  function sha256(s) {
    var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var b = unescape(encodeURIComponent(s)), l = b.length * 8, w = [], i, j;
    for (i = 0; i < b.length; i++) w[i >> 2] |= b.charCodeAt(i) << (24 - (i % 4) * 8);
    w[l >> 5] |= 0x80 << (24 - l % 32); w[(((l + 64) >> 9) << 4) + 15] = l;
    var rotr = function (x, n) { return (x >>> n) | (x << (32 - n)); };
    for (i = 0; i < w.length; i += 16) {
      var a = H[0], bb = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7], W = [];
      for (j = 0; j < 64; j++) {
        if (j < 16) W[j] = w[i + j] | 0;
        else { var s0 = rotr(W[j-15],7) ^ rotr(W[j-15],18) ^ (W[j-15] >>> 3), s1 = rotr(W[j-2],17) ^ rotr(W[j-2],19) ^ (W[j-2] >>> 10); W[j] = (W[j-16] + s0 + W[j-7] + s1) | 0; }
        var S1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[j] + W[j]) | 0;
        var S0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22), maj = (a & bb) ^ (a & c) ^ (bb & c), t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      H[0]=(H[0]+a)|0; H[1]=(H[1]+bb)|0; H[2]=(H[2]+c)|0; H[3]=(H[3]+d)|0; H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
    }
    return H.map(function (x) { return ("00000000" + (x >>> 0).toString(16)).slice(-8); }).join("");
  }

  function unlock() {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    document.documentElement.classList.remove("gated");
    var o = document.getElementById("gate"); if (o) o.remove();
  }
  function build() {
    var o = document.createElement("div");
    o.id = "gate";
    o.innerHTML =
      '<form class="gate-box" autocomplete="off">' +
      '<p class="gate-kicker">AiLIFE · internal preview</p>' +
      '<h1>This site is not public yet</h1>' +
      '<p>Enter the preview password shared by the organizers.</p>' +
      '<label class="sr-only" for="gate-pw">Password</label>' +
      '<div class="gate-row"><input id="gate-pw" type="password" inputmode="text" autofocus required> <button type="submit">Enter</button></div>' +
      '<p class="gate-err" hidden>Wrong password, please try again.</p>' +
      '</form>';
    document.body.appendChild(o);
    var f = o.querySelector("form"), pw = o.querySelector("#gate-pw"), err = o.querySelector(".gate-err");
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (sha256(pw.value.trim()) === HASH) unlock();
      else { err.hidden = false; pw.select(); }
    });
    setTimeout(function () { pw.focus(); }, 50);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
