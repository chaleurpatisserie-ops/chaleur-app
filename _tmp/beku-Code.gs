/* BEKU Packing — backend (Google Apps Script web app).
   Separate from the Chaleur back-office app: own Sheet, own Drive folder, own sessions.
   Sign-in reads the back-office Team tab (read only): same phone + PIN.
   Pages call: fetch(API, POST text/plain {fn, args}) -> {ok, result | error}. */

const TEAM_SS_ID = '1YUKdFbidUwwXUC2fJKIpQe2hNIhIYh91gPBDTf9A5-0'; // back-office Sheet (Team tab, read only)
const TZ = 'Asia/Kuala_Lumpur';
const SHELF_MONTHS = 9;
const BEKU_WA = '60143490928';
const SITE = 'https://chaleurpatisserie-ops.github.io/chaleur-app/';

/* ---------- catalog (from the BEKU carton labels, 13 Nov 2026) ---------- */
const CATALOG = [{"sku": "BK-PG-101", "code": "PG101", "name": "OOLONG PEAR", "fam": "pistachio", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 120 g (±15 g)", "net": "1.44 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 120 g (±15 g)", "net": "4.20 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), water, sugar, eggs, pear puree, milk, wheat flour, white chocolate, peach fruit mix, pear fruit mix, cocoa butter, vegetable oil, milk chocolate, vegetable fat (cocoa butter replacer), gelatine, white compound chocolate, milk compound chocolate, pectin, modified corn starch, emulsifier, citric acid, oolong tea powder, lemon zest, baking powder, vanilla essence, vanilla seed paste, oolong tea.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-102", "code": "PG102", "name": "PISTACHIO KUNAFA", "fam": "pistachio", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 120 g (±15 g)", "net": "1.44 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 120 g (±15 g)", "net": "4.20 kg (±0.53 kg)"}], "ing": "Whipping cream, white chocolate, whipping cream blend (dairy cream, vegetable fat), pistachio paste (pistachios, sesame, almonds, vegetable oil, sugar, salt), sugar, egg white, eggs, milk, kunafa (wheat), butter, cocoa butter, milk chocolate, vegetable oil, wheat flour, water, vegetable fat (cocoa butter replacer), cooking cream, cocoa powder, corn starch, white compound chocolate, milk compound chocolate, gelatine, green tea powder, sea salt, vanilla essence, vanilla seed paste.", "contains": "milk, eggs, wheat (gluten), tree nuts (pistachio, almond), sesame", "may": "peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-103", "code": "PG103", "name": "RASPBERRY ROSE LYCHEE", "fam": "bubblegum", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 120 g (±15 g)", "net": "1.44 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 120 g (±15 g)", "net": "4.20 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), lychee, white chocolate, strawberry puree, water, milk, white compound chocolate, raspberry fruit mix, sugar, vegetable fat (cocoa butter replacer), cocoa butter, eggs, rose syrup, dark compound chocolate, raspberry puree, wheat flour, milk chocolate, milk compound chocolate, gelatine, modified corn starch, lychee fruit mix, vegetable oil, lychee syrup, pectin, vanilla essence, emulsifier, colour (titanium dioxide), baking powder, silver leaf.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-104", "code": "PG104", "name": "PANDAN GULA MELAKA", "fam": "lemon", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 140 g (±15 g)", "net": "1.68 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 140 g (±15 g)", "net": "4.90 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), sugar, eggs, water, coconut, wheat flour, coconut milk, milk, palm sugar (gula merah), vegetable oil, gelatine, modified corn starch, emulsifier, pandan essence, pectin, baking powder, salt, citric acid.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-105", "code": "PG105", "name": "CHOCOLATE HAZELNUT", "fam": "cocoa", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 110 g (±15 g)", "net": "1.32 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 110 g (±15 g)", "net": "3.85 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), dark chocolate, milk chocolate, hazelnut paste, feuilletine (wheat), white chocolate, cooking cream, milk, sugar, eggs, vegetable fat (cocoa butter replacer), cocoa butter, wheat flour, almonds, dark compound chocolate, vegetable oil, hazelnuts, butter, water, white compound chocolate, milk compound chocolate, cocoa powder, gelatine, salt, emulsifier, orange zest, baking powder, gold leaf.", "contains": "milk, eggs, wheat (gluten), tree nuts (hazelnut, almond)", "may": "peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-106", "code": "PG106", "name": "CHOCOLATE BANANA", "fam": "tangerine", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 140 g (±15 g)", "net": "1.68 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 140 g (±15 g)", "net": "4.90 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), milk, banana, water, sugar, eggs, brown sugar, milk chocolate, dark chocolate, wheat flour, white chocolate, cocoa butter, vegetable oil, vegetable fat (cocoa butter replacer), white compound chocolate, cocoa powder, milk compound chocolate, pectin, gelatine, modified corn starch, glucose syrup, emulsifier, baking powder, citric acid, cinnamon, vanilla essence, vanilla seed paste.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-107", "code": "PG107", "name": "DECADENT CHOCOLATE", "fam": "cocoa", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 120 g (±15 g)", "net": "1.44 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 120 g (±15 g)", "net": "4.20 kg (±0.53 kg)"}], "ing": "Whipping cream, dark chocolate, milk, cooking cream, sugar, whipping cream blend (dairy cream, vegetable fat), eggs, water, egg white, dark compound chocolate, vegetable fat (cocoa butter replacer), butter, milk chocolate, cocoa powder, wheat flour, gelatine, corn starch, glucose syrup, sea salt, pectin, modified corn starch, citric acid.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-108", "code": "PG108", "name": "SANTA – VANILLA STRAWBERRY", "fam": "bubblegum", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 110 g (±15 g)", "net": "1.32 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 110 g (±15 g)", "net": "3.85 kg (±0.53 kg)"}], "ing": "", "contains": "", "may": "nuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-109", "code": "PG109", "name": "GINGERBREAD MAN – BLACK FOREST", "fam": "cocoa", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 110 g (±15 g)", "net": "1.32 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 110 g (±15 g)", "net": "3.85 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), cherries, sugar, milk compound chocolate, eggs, milk chocolate, dark chocolate, water, white chocolate, milk, wheat flour, cocoa butter, almonds, vegetable oil, vegetable fat (cocoa butter replacer), cocoa powder, white compound chocolate, modified corn starch, lemon juice, gelatine, pectin, emulsifier, baking powder, agar-agar.", "contains": "milk, eggs, wheat (gluten), tree nuts (almond)", "may": "peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-110", "code": "PG110", "name": "STAR – BLUEBERRY LAVENDER", "fam": "lilac", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 110 g (±15 g)", "net": "1.32 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 110 g (±15 g)", "net": "3.85 kg (±0.53 kg)"}], "ing": "", "contains": "", "may": "nuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-112", "code": "PG112", "name": "TULIP – MANGO PASSIONFRUIT", "fam": "lemon", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 120 g (±15 g)", "net": "1.44 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 120 g (±15 g)", "net": "4.20 kg (±0.53 kg)"}], "ing": "Whipping cream, cream cheese, mango, sugar, mango puree, eggs, passionfruit puree, water, whipping cream blend (dairy cream, vegetable fat), wheat flour, corn starch, vegetable oil, gelatine, milk, lime juice, vanilla essence, agar-agar, lime zest, emulsifier, pectin, baking powder, vanilla seed paste.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-SSB-201", "code": "SSB201", "name": "LEMON POUND CAKE", "fam": "lemon", "ct": [{"t": "CTN", "pcs": 10, "pack": "10 PCS × 350 g (±15 g)", "net": "3.50 kg (±0.15 kg)"}], "ing": "Margarine, sugar, wheat flour, eggs, milk, baking powder, lemon zest, salt.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw at room temperature before serving."}, {"sku": "BK-SSB-202", "code": "SSB202", "name": "SEA-SALT CHOCOLATE ALMOND BROWNIE", "fam": "cocoa", "ct": [{"t": "CTN", "pcs": 45, "pack": "45 PCS (5 × 9 PKT) × 85 g (±5 g)", "net": "3.83 kg (±0.23 kg)"}], "ing": "Margarine, wheat flour, eggs, sugar, dark compound chocolate, chocolate chips, cocoa powder, almonds, corn starch, vanilla essence, salt, baking soda.", "contains": "eggs, wheat (gluten), tree nuts (almond)", "may": "milk, peanuts and soy", "serve": "Thaw at room temperature before serving."}, {"sku": "BK-CZ-301", "code": "CZ301", "name": "KIRIN – HEADSHOT CAKE", "fam": "pistachio", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 100 g (±15 g)", "net": "1.20 kg (±0.18 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), water, sugar, eggs, pear puree, milk, wheat flour, white chocolate, peach fruit mix, pear fruit mix, cocoa butter, vegetable oil, milk chocolate, vegetable fat (cocoa butter replacer), gelatine, white compound chocolate, milk compound chocolate, pectin, modified corn starch, emulsifier, citric acid, oolong tea powder, lemon zest, baking powder, vanilla essence, vanilla seed paste, oolong tea.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-CZ-302", "code": "CZ302", "name": "KIRIN – CHOCOLATE BANANA", "fam": "tangerine", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 100 g (±15 g)", "net": "1.20 kg (±0.18 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), milk, banana, water, sugar, eggs, brown sugar, milk chocolate, dark chocolate, wheat flour, white chocolate, cocoa butter, vegetable oil, vegetable fat (cocoa butter replacer), white compound chocolate, cocoa powder, milk compound chocolate, pectin, gelatine, modified corn starch, glucose syrup, emulsifier, baking powder, citric acid, cinnamon, vanilla essence, vanilla seed paste.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}];

/* ---------- storage ---------- */
function props_() { return PropertiesService.getScriptProperties(); }
function ss_() {
  const id = props_().getProperty('SS_ID');
  if (!id) throw new Error('BEKU is not set up yet (run setup).');
  return SpreadsheetApp.openById(id);
}
function sheet_(name) {
  const ss = ss_(); let sh = ss.getSheetByName(name);
  if (!sh && HEAD[name]) { sh = ss.insertSheet(name); sh.appendRow(HEAD[name]); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD[name].length).setFontWeight('bold'); }
  return sh;
}
const HEAD = {
  Batches: ['batch', 'sku', 'code', 'name', 'ctype', 'pcs', 'cartons', 'made', 'bestBefore', 'run', 'status', 'createdBy', 'createdAt', 'closedBy', 'closedAt', 'packed', 'voided', 'madeChanged'],
  Cartons: ['carton', 'batch', 'n', 'of', 'status', 'photo1', 'photo2', 'photoBy', 'photoAt', 'location', 'updatedAt'],
  Log: ['at', 'who', 'action', 'ref', 'detail'],
  Prints: ['at', 'who', 'batch', 'name', 'kind', 'count', 'cartons']
};

/* Run once from the editor: creates the BEKU Sheet + Drive folder and remembers them. */
function setup() {
  const p = props_();
  let ss;
  if (p.getProperty('SS_ID')) ss = SpreadsheetApp.openById(p.getProperty('SS_ID'));
  else { ss = SpreadsheetApp.create('BEKU Packing Data'); p.setProperty('SS_ID', ss.getId()); }
  Object.keys(HEAD).forEach(n => {
    let sh = ss.getSheetByName(n);
    if (!sh) sh = ss.insertSheet(n);
    if (sh.getLastRow() === 0) { sh.appendRow(HEAD[n]); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD[n].length).setFontWeight('bold'); }
    if (sh.getMaxRows() < 3000) sh.insertRowsAfter(sh.getMaxRows(), 3000 - sh.getMaxRows());
    sh.getRange(1, 1, sh.getMaxRows(), HEAD[n].length).setNumberFormat('@');
  });
  const s1 = ss.getSheetByName('Sheet1'); if (s1 && ss.getSheets().length > 1) ss.deleteSheet(s1);
  if (!p.getProperty('ROOT_ID')) {
    const root = DriveApp.createFolder('BEKU Batches');
    p.setProperty('ROOT_ID', root.getId());
    try { DriveApp.getFileById(ss.getId()).moveTo(root); } catch (e) {}
  }
  SpreadsheetApp.openById(TEAM_SS_ID).getSheetByName('Team').getLastRow(); // checks access to the Team tab
  Logger.log('Sheet: ' + ss.getUrl());
  Logger.log('Folder: https://drive.google.com/drive/folders/' + p.getProperty('ROOT_ID'));
  return 'ok';
}

/* ---------- helpers ---------- */
function now_() { return new Date(); }
function iso_(d) { return Utilities.formatDate(d, TZ, 'yyyy-MM-dd'); }
function todayIso_() { return iso_(now_()); }
function stamp_() { return Utilities.formatDate(now_(), TZ, 'yyyy-MM-dd HH:mm:ss'); }
function clean_(s, n) { return String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n || 200); }
function rows_(name) {
  const sh = sheet_(name), v = sh.getDataRange().getValues(), h = v[0];
  const f = d => (d.getHours() || d.getMinutes() || d.getSeconds()) ? Utilities.formatDate(d, TZ, 'yyyy-MM-dd HH:mm:ss') : iso_(d);
  return v.slice(1).map((r, i) => { const o = { _row: i + 2 }; h.forEach((k, j) => { o[k] = r[j] instanceof Date ? f(r[j]) : r[j]; }); return o; });
}
function setRow_(name, row, obj) {
  const sh = sheet_(name), h = HEAD[name];
  sh.getRange(row, 1, 1, h.length).setValues([h.map(k => obj[k] == null ? '' : obj[k])]);
}
function log_(who, action, ref, detail) { sheet_('Log').appendRow([stamp_(), who, action, ref, typeof detail === 'string' ? detail : JSON.stringify(detail || '')]); }
function product_(sku) { const p = CATALOG.find(x => x.sku === sku); if (!p) throw new Error('Unknown product.'); return p; }
function addMonths_(isoDate, m) {
  const [y, mo, d] = isoDate.split('-').map(Number);
  const t = new Date(Date.UTC(y, mo - 1 + m, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(d, last));
  return t.toISOString().slice(0, 10);
}
function dmy_(isoDate) { const [y, m, d] = isoDate.split('-'); return d + '/' + m + '/' + y; }
function cartonUrl_(id) { return SITE + 'b.html?c=' + encodeURIComponent(id); }

/* ---------- sign-in (same phone + PIN as the back office; Team tab read only) ---------- */
function normPhone_(s) {
  let d = String(s == null ? '' : s).replace(/\D/g, '');
  if (!d) return '';
  if (/^00/.test(d)) d = d.slice(2);
  if (/^0/.test(d)) d = '6' + d; else if (/^1\d{7,9}$/.test(d)) d = '60' + d;
  return d;
}
function normName_(s) { return String(s == null ? '' : s).toUpperCase().replace(/\s+/g, ' ').trim(); }
function teamRows_() {
  const sh = SpreadsheetApp.openById(TEAM_SS_ID).getSheetByName('Team'); if (!sh) return [];
  return sh.getDataRange().getValues().slice(1).map(r => ({
    name: String(r[0] || '').trim(), pin: String(r[1] == null ? '' : r[1]).trim(),
    active: String(r[2]).toUpperCase() !== 'FALSE', role: String(r[4] || '').toLowerCase().trim(), phone: normPhone_(r[5])
  })).filter(x => x.name);
}
function pinHash_(name, pin) { return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'beku|' + normName_(name) + '|' + String(pin))).slice(0, 16); }
function sesKey_(tok) { return 'ses_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(tok))).replace(/=+$/, ''); }
function bump_(cache, k, ttl) { const n = +(cache.get(k) || 0) + 1; cache.put(k, String(n), ttl); return n; }
function login(id, pin, remember) {
  id = clean_(id, 80); pin = String(pin == null ? '' : pin).trim();
  if (!id || !pin) throw new Error('Enter your phone number and PIN.');
  const cache = CacheService.getScriptCache(), ph = normPhone_(id);
  const rows = teamRows_().filter(r => r.active && ((ph.length >= 8 && r.phone === ph) || normName_(r.name) === normName_(id)));
  const k = 'lf_' + (ph || normName_(id)).slice(0, 60);
  if (+(cache.get(k) || 0) >= 5) throw new Error('Too many wrong PINs. Please wait 15 minutes.');
  if (+(cache.get('lf_all') || 0) >= 100) throw new Error('Too many sign-in attempts right now. Please wait 10 minutes.');
  const hit = rows.filter(r => r.pin !== '' && r.pin === pin);
  if (hit.length !== 1) { bump_(cache, k, 900); bump_(cache, 'lf_all', 600); throw new Error('Phone number or PIN not recognised.'); }
  const u = hit[0], tok = 'b1.' + (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').toLowerCase();
  const exp = Date.now() + (remember ? 30 * 864e5 : 12 * 36e5);
  props_().setProperty(sesKey_(tok), JSON.stringify({ n: u.name, p: u.phone, h: pinHash_(u.name, u.pin), x: exp }));
  cache.remove(k);
  log_(u.name, 'sign in', '', '');
  return { token: tok, name: u.name, exp: exp };
}
function user_(tok) {
  tok = String(tok == null ? '' : tok).trim();
  if (!/^b1\.[a-f0-9]{64}$/.test(tok)) throw new Error('Please sign in again.');
  const k = sesKey_(tok), raw = props_().getProperty(k);
  if (!raw) throw new Error('Please sign in again.');
  const s = JSON.parse(raw);
  if (!(Date.now() < +s.x)) { props_().deleteProperty(k); throw new Error('Your sign-in has expired. Please sign in again.'); }
  const m = teamRows_().filter(r => r.active && normName_(r.name) === normName_(s.n) && (r.phone || '') === (s.p || '') && pinHash_(r.name, r.pin) === s.h);
  if (m.length !== 1) { props_().deleteProperty(k); throw new Error('Please sign in again.'); }
  return { name: m[0].name, role: m[0].role };
}
function logout(tok) { try { props_().deleteProperty(sesKey_(tok)); } catch (e) {} return true; }
function me(tok) { return user_(tok); }

/* ---------- catalog (public) ---------- */
function catalog() { return CATALOG.map(p => ({ sku: p.sku, code: p.code, name: p.name, fam: p.fam, ct: p.ct })); }

/* ---------- batches ---------- */
function newBatch(tok, sku, ctype, count, made) {
  const u = user_(tok), p = product_(sku);
  const ct = p.ct.find(c => c.t === ctype); if (!ct) throw new Error('Pick a carton type.');
  count = Math.floor(+count);
  if (!(count >= 1 && count <= 200)) throw new Error('Number of cartons must be 1 to 200.');
  const today = todayIso_();
  made = /^\d{4}-\d{2}-\d{2}$/.test(String(made || '')) ? String(made) : today;
  if (made > today) throw new Error('Production date cannot be in the future.');
  if (made < addMonths_(today, -1)) throw new Error('Production date is more than a month ago. Please check.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const ymd = made.slice(2).replace(/-/g, '');
    const used = rows_('Batches').filter(b => b.code === p.code && String(b.made) === made).map(b => String(b.run));
    let run = 'A'; while (used.indexOf(run) >= 0) run = String.fromCharCode(run.charCodeAt(0) + 1);
    const batch = p.code + '-' + ymd + '-' + run, bb = addMonths_(made, SHELF_MONTHS), at = stamp_();
    sheet_('Batches').appendRow(HEAD.Batches.map(k => ({ batch: batch, sku: p.sku, code: p.code, name: p.name, ctype: ct.t, pcs: ct.pcs, cartons: count, made: made, bestBefore: bb, run: run, status: 'open', createdBy: u.name, createdAt: at, closedBy: '', closedAt: '', packed: 0, voided: '', madeChanged: made !== today ? 'yes' : '' })[k]));
    const w = String(count).length < 2 ? 2 : String(count).length;
    const cr = [];
    for (let i = 1; i <= count; i++) { const n = ('000' + i).slice(-w); cr.push([batch + '-' + n, batch, i, count, 'printed', '', '', '', '', 'HQ Freezer', at]); }
    const sh = sheet_('Cartons'); sh.getRange(sh.getLastRow() + 1, 1, cr.length, cr[0].length).setValues(cr);
    log_(u.name, 'new batch', batch, { sku: sku, ctype: ct.t, count: count, made: made });
    return batchGet(tok, batch);
  } finally { lock.releaseLock(); }
}
function batchInfo_(b) {
  const p = product_(b.sku), ct = p.ct.find(c => c.t === b.ctype) || p.ct[0];
  return { batch: b.batch, sku: b.sku, code: b.code, name: b.name, fam: p.fam, ctype: b.ctype, pcs: b.pcs, cartons: +b.cartons, made: String(b.made), bestBefore: String(b.bestBefore),
    madeDmy: dmy_(String(b.made)), bbDmy: dmy_(String(b.bestBefore)), pack: ct.pack, net: ct.net, status: b.status, createdBy: b.createdBy, createdAt: b.createdAt, closedBy: b.closedBy, closedAt: b.closedAt, madeChanged: b.madeChanged === 'yes' };
}
function batchGet(tok, id) {
  user_(tok);
  const b = rows_('Batches').find(x => x.batch === id); if (!b) throw new Error('Batch not found.');
  const cs = rows_('Cartons').filter(c => c.batch === id).sort((a, c) => a.n - c.n).map(c => ({ carton: c.carton, n: c.n, of: c.of, status: c.status, p1: !!c.photo1, p2: !!c.photo2, by: c.photoBy, at: c.photoAt, url: cartonUrl_(c.carton) }));
  const pr = rows_('Prints').filter(p => p.batch === id).map(p => ({ at: p.at, who: p.who, kind: p.kind, count: +p.count, cartons: p.cartons })).reverse();
  return Object.assign(batchInfo_(b), { list: cs, prints: pr });
}
/* print history: one row per PDF download. kind = 'all' | 'reprint' */
function printLog(tok, batch, ns, kind) {
  const u = user_(tok), b = rows_('Batches').find(x => x.batch === batch); if (!b) throw new Error('Batch not found.');
  ns = (ns || []).map(Number).filter(n => n >= 1 && n <= 999).sort((a, c) => a - c);
  const txt = ns.length === +b.cartons ? 'all ' + ns.length : ns.join(', ');
  sheet_('Prints').appendRow([stamp_(), u.name, batch, b.name, kind === 'reprint' ? 'reprint' : 'all', ns.length, txt]);
  return true;
}
function prints(tok) {
  user_(tok);
  return rows_('Prints').slice(-150).reverse().map(p => ({ at: p.at, who: p.who, batch: p.batch, name: p.name, kind: p.kind, count: +p.count, cartons: p.cartons }));
}
function batches(tok) {
  user_(tok);
  const cs = rows_('Cartons');
  return rows_('Batches').filter(b => b.status === 'open' || String(b.closedAt).slice(0, 10) >= addMonths_(todayIso_(), -1).slice(0, 10))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 30)
    .map(b => { const mine = cs.filter(c => c.batch === b.batch); return Object.assign(batchInfo_(b), { done: mine.filter(c => c.status === 'packed').length, voidN: mine.filter(c => c.status === 'void').length }); });
}

/* ---------- cartons ---------- */
function carton(id, tok) {
  id = clean_(id, 40).toUpperCase();
  const c = rows_('Cartons').find(x => x.carton === id); if (!c) throw new Error('Carton not found.');
  const b = rows_('Batches').find(x => x.batch === c.batch), info = batchInfo_(b), p = product_(b.sku);
  const pub = { carton: c.carton, n: c.n, of: c.of, batch: b.batch, sku: p.sku, name: p.name, fam: p.fam, pack: info.pack, net: info.net, made: info.madeDmy, bestBefore: info.bbDmy,
    ing: p.ing, contains: p.contains, may: p.may, serve: p.serve, void: c.status === 'void' };
  if (tok) { try { const u = user_(tok); pub.staff = { status: c.status, p1: !!c.photo1, p2: !!c.photo2, by: c.photoBy, at: c.photoAt, batchStatus: b.status, location: c.location, user: u.name }; } catch (e) { pub.staffError = e.message; } }
  return pub;
}
function folderFor_(batch) {
  const root = DriveApp.getFolderById(props_().getProperty('ROOT_ID'));
  const it = root.getFoldersByName(batch); return it.hasNext() ? it.next() : root.createFolder(batch);
}
/* slot 1 = cakes in the open box (top), slot 2 = label side. data = dataURL (jpeg). nonce makes a re-send harmless. */
function photo(tok, id, slot, data, nonce, takenAt) {
  const u = user_(tok); id = clean_(id, 40).toUpperCase(); slot = +slot === 2 ? 2 : 1;
  const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(String(data || ''));
  if (!m) throw new Error('Photo missing.');
  if (m[2].length > 2.5e6) throw new Error('Photo too big.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const c = rows_('Cartons').find(x => x.carton === id); if (!c) throw new Error('Carton not found.');
    if (c.status === 'void') throw new Error('This carton number was voided. Do not use this sticker.');
    const b = rows_('Batches').find(x => x.batch === c.batch); if (b.status !== 'open') throw new Error('This batch is already closed.');
    const key = 'n_' + clean_(nonce, 60);
    if (nonce && props_().getProperty(key)) return carton(id, tok);
    const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), 'image/' + m[1], id + '_' + slot + '.jpg');
    const f = folderFor_(c.batch).createFile(blob);
    c['photo' + slot] = f.getUrl(); c.photoBy = u.name; c.photoAt = clean_(takenAt, 30) || stamp_(); c.updatedAt = stamp_();
    if (c.photo1 && c.photo2) c.status = 'packed'; else if (c.status === 'printed') c.status = 'photo';
    setRow_('Cartons', c._row, c);
    if (nonce) props_().setProperty(key, '1');
    log_(u.name, 'photo ' + slot, id, '');
    return carton(id, tok);
  } finally { lock.releaseLock(); }
}
function voidCartons(tok, batch, ids) {
  const bb = rows_('Batches').find(x => x.batch === batch); if (!bb || bb.status !== 'open') throw new Error('This batch is not open.');
  const u = user_(tok), set = (ids || []).map(x => clean_(x, 40).toUpperCase());
  const cs = rows_('Cartons').filter(c => c.batch === batch && set.indexOf(c.carton) >= 0 && c.status !== 'packed');
  cs.forEach(c => { c.status = 'void'; c.updatedAt = stamp_(); setRow_('Cartons', c._row, c); });
  log_(u.name, 'void', batch, cs.map(c => c.carton).join(' '));
  return batchGet(tok, batch);
}
function reopenCarton(tok, id) { // undo a void before close
  const u = user_(tok); const c = rows_('Cartons').find(x => x.carton === id); if (!c || c.status !== 'void') return carton(id, tok);
  const b = rows_('Batches').find(x => x.batch === c.batch); if (!b || b.status !== 'open') throw new Error('This batch is closed. Void stays.');
  c.status = c.photo1 && c.photo2 ? 'packed' : (c.photo1 || c.photo2 ? 'photo' : 'printed'); setRow_('Cartons', c._row, c); log_(u.name, 'unvoid', id, ''); return carton(id, tok);
}
function tc_(s) { return String(s || '').toLowerCase().replace(/(^|[\s–-])([a-z])/g, (m, a, c) => a + c.toUpperCase()); }
/* cancel a whole batch (wrong product, wrong date...): only while nothing is packed. All its stickers become void. */
function cancelBatch(tok, id, reason) {
  const u = user_(tok);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const b = rows_('Batches').find(x => x.batch === id); if (!b) throw new Error('Batch not found.');
    if (b.status !== 'open') throw new Error('This batch is already ' + b.status + '.');
    const cs = rows_('Cartons').filter(c => c.batch === id);
    if (cs.some(c => c.status === 'packed' || c.status === 'photo')) throw new Error('Some cartons already have photos. Void the wrong cartons one by one, or close the batch.');
    cs.forEach(c => { c.status = 'void'; c.updatedAt = stamp_(); setRow_('Cartons', c._row, c); });
    b.status = 'cancelled'; b.closedBy = u.name; b.closedAt = stamp_(); b.packed = 0; b.voided = 'all';
    setRow_('Batches', b._row, b);
    log_(u.name, 'cancel batch', id, clean_(reason, 200));
    return { cancelled: true };
  } finally { lock.releaseLock(); }
}
function report_(b, cs, by) {
  const packed = cs.filter(c => c.status === 'packed'), voided = cs.filter(c => c.status === 'void');
  const people = {}; packed.forEach(c => { if (c.photoBy) people[c.photoBy] = 1; });
  const times = packed.map(c => String(c.photoAt)).filter(Boolean).sort();
  const t = s => s ? s.slice(11, 16) : '';
  const folder = props_().getProperty('ROOT_ID') ? folderFor_(b.batch).getUrl() : '';
  return ['BEKU packing done ✅', tc_(b.name) + ' · ' + b.batch,
    packed.length + ' ' + b.ctype + ' packed' + (voided.length ? ' (' + voided.map(c => String(c.n)).join(', ') + ' void)' : '') + ' · ' + packed.length + '/' + packed.length + ' photos',
    'Made ' + dmy_(String(b.made)) + ' · Best before ' + dmy_(String(b.bestBefore)),
    'By ' + (Object.keys(people).map(tc_).join(', ') || tc_(by)) + (times.length ? ' · ' + t(times[0]) + '–' + t(times[times.length - 1]) : ''),
    'Closed by ' + tc_(by), 'Photos: ' + folder].join('\n');
}
function closeBatch(tok, id, voidRest) {
  const u = user_(tok);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const b = rows_('Batches').find(x => x.batch === id); if (!b) throw new Error('Batch not found.');
    let cs = rows_('Cartons').filter(c => c.batch === id);
    const open = cs.filter(c => c.status !== 'packed' && c.status !== 'void');
    if (open.length && !voidRest) return { needConfirm: true, missing: open.map(c => ({ carton: c.carton, n: c.n, status: c.status })) };
    open.forEach(c => { c.status = 'void'; c.updatedAt = stamp_(); setRow_('Cartons', c._row, c); });
    cs = rows_('Cartons').filter(c => c.batch === id);
    const packed = cs.filter(c => c.status === 'packed').length;
    if (!packed) throw new Error('No carton has both photos yet.');
    b.status = 'closed'; b.closedBy = u.name; b.closedAt = stamp_(); b.packed = packed; b.voided = cs.filter(c => c.status === 'void').map(c => c.n).join(' ');
    setRow_('Batches', b._row, b);
    const text = report_(b, cs, u.name);
    log_(u.name, 'close batch', id, { packed: packed, voided: b.voided });
    return { closed: true, packed: packed, report: text, wa: 'https://wa.me/' + BEKU_WA + '?text=' + encodeURIComponent(text) };
  } finally { lock.releaseLock(); }
}

/* ---------- web app ---------- */
const API_FNS = { login: login, logout: logout, me: me, catalog: catalog, newBatch: newBatch, batchGet: batchGet, batches: batches, carton: carton, photo: photo, voidCartons: voidCartons, reopenCarton: reopenCarton, closeBatch: closeBatch, printLog: printLog, prints: prints, cancelBatch: cancelBatch };
function doPost(e) {
  let out;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const fn = API_FNS[req.fn]; if (!fn) throw new Error('Unknown action.');
    out = { ok: true, result: fn.apply(null, Array.isArray(req.args) ? req.args : []) };
  } catch (err) { out = { ok: false, error: (err && err.message) || String(err) }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return ContentService.createTextOutput('BEKU packing backend is running.'); }
