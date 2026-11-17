/* BEKU Packing — backend (Google Apps Script web app).
   Separate from the Chaleur back-office app: own Sheet, own Drive folder, own sessions.
   Sign-in reads the back-office Team tab (read only): same phone + PIN.
   Pages call: fetch(API, POST text/plain {fn, args}) -> {ok, result | error}. */

const TEAM_SS_ID = '1YUKdFbidUwwXUC2fJKIpQe2hNIhIYh91gPBDTf9A5-0'; // back-office Sheet (Team tab, read only)
const TZ = 'Asia/Kuala_Lumpur';
const SHELF_MONTHS = 9;
const BEKU_WA = '60143490928';
const BOT_SS_ID = '1QahunHiZ_0g8d0BCaWIXI6AfI9D8guFZtEIiwzHtcGg'; // BEKU Customers & Leads (WhatsApp bot sheet): Orders tab read only; posts queued in tab 'BEKU packing'
const BOT_TAB = 'BEKU packing';
const SITE = 'https://chaleurpatisserie-ops.github.io/chaleur-app/';

/* ---------- catalog (from the BEKU carton labels, 13 Nov 2026) ---------- */
const CATALOG = [{"sku": "BK-PG-101", "code": "PG101", "name": "OOLONG PEAR", "fam": "pistachio", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 120 g (±15 g)", "net": "1.44 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 120 g (±15 g)", "net": "4.20 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), water, sugar, eggs, pear puree, milk, wheat flour, white chocolate, peach fruit mix, pear fruit mix, cocoa butter, vegetable oil, milk chocolate, vegetable fat (cocoa butter replacer), gelatine, white compound chocolate, milk compound chocolate, pectin, modified corn starch, emulsifier, citric acid, oolong tea powder, lemon zest, baking powder, vanilla essence, vanilla seed paste, oolong tea.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-102", "code": "PG102", "name": "PISTACHIO KUNAFA", "fam": "pistachio", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 120 g (±15 g)", "net": "1.44 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 120 g (±15 g)", "net": "4.20 kg (±0.53 kg)"}], "ing": "Whipping cream, white chocolate, whipping cream blend (dairy cream, vegetable fat), pistachio paste (pistachios, sesame, almonds, vegetable oil, sugar, salt), sugar, egg white, eggs, milk, kunafa (wheat), butter, cocoa butter, milk chocolate, vegetable oil, wheat flour, water, vegetable fat (cocoa butter replacer), cooking cream, cocoa powder, corn starch, white compound chocolate, milk compound chocolate, gelatine, green tea powder, sea salt, vanilla essence, vanilla seed paste.", "contains": "milk, eggs, wheat (gluten), tree nuts (pistachio, almond), sesame", "may": "peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-103", "code": "PG103", "name": "RASPBERRY ROSE LYCHEE", "fam": "bubblegum", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 120 g (±15 g)", "net": "1.44 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 120 g (±15 g)", "net": "4.20 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), lychee, white chocolate, strawberry puree, water, milk, white compound chocolate, raspberry fruit mix, sugar, vegetable fat (cocoa butter replacer), cocoa butter, eggs, rose syrup, dark compound chocolate, raspberry puree, wheat flour, milk chocolate, milk compound chocolate, gelatine, modified corn starch, lychee fruit mix, vegetable oil, lychee syrup, pectin, vanilla essence, emulsifier, colour (titanium dioxide), baking powder, silver leaf.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-104", "code": "PG104", "name": "PANDAN GULA MELAKA", "fam": "lemon", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 140 g (±15 g)", "net": "1.68 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 140 g (±15 g)", "net": "4.90 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), sugar, eggs, water, coconut, wheat flour, coconut milk, milk, palm sugar (gula merah), vegetable oil, gelatine, modified corn starch, emulsifier, pandan essence, pectin, baking powder, salt, citric acid.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-105", "code": "PG105", "name": "CHOCOLATE HAZELNUT", "fam": "cocoa", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 110 g (±15 g)", "net": "1.32 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 110 g (±15 g)", "net": "3.85 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), dark chocolate, milk chocolate, hazelnut paste, feuilletine (wheat), white chocolate, cooking cream, milk, sugar, eggs, vegetable fat (cocoa butter replacer), cocoa butter, wheat flour, almonds, dark compound chocolate, vegetable oil, hazelnuts, butter, water, white compound chocolate, milk compound chocolate, cocoa powder, gelatine, salt, emulsifier, orange zest, baking powder, gold leaf.", "contains": "milk, eggs, wheat (gluten), tree nuts (hazelnut, almond)", "may": "peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-106", "code": "PG106", "name": "CHOCOLATE BANANA", "fam": "tangerine", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 140 g (±15 g)", "net": "1.68 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 140 g (±15 g)", "net": "4.90 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), milk, banana, water, sugar, eggs, brown sugar, milk chocolate, dark chocolate, wheat flour, white chocolate, cocoa butter, vegetable oil, vegetable fat (cocoa butter replacer), white compound chocolate, cocoa powder, milk compound chocolate, pectin, gelatine, modified corn starch, glucose syrup, emulsifier, baking powder, citric acid, cinnamon, vanilla essence, vanilla seed paste.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-107", "code": "PG107", "name": "DECADENT CHOCOLATE", "fam": "cocoa", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 120 g (±15 g)", "net": "1.44 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 120 g (±15 g)", "net": "4.20 kg (±0.53 kg)"}], "ing": "Whipping cream, dark chocolate, milk, cooking cream, sugar, whipping cream blend (dairy cream, vegetable fat), eggs, water, egg white, dark compound chocolate, vegetable fat (cocoa butter replacer), butter, milk chocolate, cocoa powder, wheat flour, gelatine, corn starch, glucose syrup, sea salt, pectin, modified corn starch, citric acid.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-108", "code": "PG108", "name": "SANTA – VANILLA STRAWBERRY", "fam": "bubblegum", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 110 g (±15 g)", "net": "1.32 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 110 g (±15 g)", "net": "3.85 kg (±0.53 kg)"}], "ing": "", "contains": "", "may": "nuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-109", "code": "PG109", "name": "GINGERBREAD MAN – BLACK FOREST", "fam": "cocoa", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 110 g (±15 g)", "net": "1.32 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 110 g (±15 g)", "net": "3.85 kg (±0.53 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), cherries, sugar, milk compound chocolate, eggs, milk chocolate, dark chocolate, water, white chocolate, milk, wheat flour, cocoa butter, almonds, vegetable oil, vegetable fat (cocoa butter replacer), cocoa powder, white compound chocolate, modified corn starch, lemon juice, gelatine, pectin, emulsifier, baking powder, agar-agar.", "contains": "milk, eggs, wheat (gluten), tree nuts (almond)", "may": "peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-110", "code": "PG110", "name": "STAR – BLUEBERRY LAVENDER", "fam": "lilac", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 110 g (±15 g)", "net": "1.32 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 110 g (±15 g)", "net": "3.85 kg (±0.53 kg)"}], "ing": "", "contains": "", "may": "nuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-PG-112", "code": "PG112", "name": "TULIP – MANGO PASSIONFRUIT", "fam": "lemon", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 120 g (±15 g)", "net": "1.44 kg (±0.18 kg)"}, {"t": "B CTN", "pcs": 35, "pack": "35 PCS × 120 g (±15 g)", "net": "4.20 kg (±0.53 kg)"}], "ing": "Whipping cream, cream cheese, mango, sugar, mango puree, eggs, passionfruit puree, water, whipping cream blend (dairy cream, vegetable fat), wheat flour, corn starch, vegetable oil, gelatine, milk, lime juice, vanilla essence, agar-agar, lime zest, emulsifier, pectin, baking powder, vanilla seed paste.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-SSB-201", "code": "SSB201", "name": "LEMON POUND CAKE", "fam": "lemon", "ct": [{"t": "CTN", "pcs": 10, "pack": "10 PCS × 350 g (±15 g)", "net": "3.50 kg (±0.15 kg)"}], "ing": "Margarine, sugar, wheat flour, eggs, milk, baking powder, lemon zest, salt.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw at room temperature before serving."}, {"sku": "BK-SSB-202", "code": "SSB202", "name": "SEA-SALT CHOCOLATE ALMOND BROWNIE", "fam": "cocoa", "ct": [{"t": "CTN", "pcs": 45, "pack": "45 PCS (5 × 9 PKT) × 85 g (±5 g)", "net": "3.83 kg (±0.23 kg)"}], "ing": "Margarine, wheat flour, eggs, sugar, dark compound chocolate, chocolate chips, cocoa powder, almonds, corn starch, vanilla essence, salt, baking soda.", "contains": "eggs, wheat (gluten), tree nuts (almond)", "may": "milk, peanuts and soy", "serve": "Thaw at room temperature before serving."}, {"sku": "BK-CZ-301", "code": "CZ301", "name": "KIRIN – HEADSHOT CAKE", "fam": "pistachio", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 100 g (±15 g)", "net": "1.20 kg (±0.18 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), water, sugar, eggs, pear puree, milk, wheat flour, white chocolate, peach fruit mix, pear fruit mix, cocoa butter, vegetable oil, milk chocolate, vegetable fat (cocoa butter replacer), gelatine, white compound chocolate, milk compound chocolate, pectin, modified corn starch, emulsifier, citric acid, oolong tea powder, lemon zest, baking powder, vanilla essence, vanilla seed paste, oolong tea.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}, {"sku": "BK-CZ-302", "code": "CZ302", "name": "KIRIN – CHOCOLATE BANANA", "fam": "tangerine", "ct": [{"t": "CTN", "pcs": 12, "pack": "12 PCS × 100 g (±15 g)", "net": "1.20 kg (±0.18 kg)"}], "ing": "Whipping cream blend (dairy cream, vegetable fat), milk, banana, water, sugar, eggs, brown sugar, milk chocolate, dark chocolate, wheat flour, white chocolate, cocoa butter, vegetable oil, vegetable fat (cocoa butter replacer), white compound chocolate, cocoa powder, milk compound chocolate, pectin, gelatine, modified corn starch, glucose syrup, emulsifier, baking powder, citric acid, cinnamon, vanilla essence, vanilla seed paste.", "contains": "milk, eggs, wheat (gluten)", "may": "nuts, peanuts and soy", "serve": "Thaw 2–3 hrs in chiller (0–5°C). Best consumed within 3 days after thawing."}];

/* ---------- storage ---------- */
function props_() { return PropertiesService.getScriptProperties(); }
let SS_ = null;
function ss_() {
  if (SS_) return SS_;
  const id = props_().getProperty('SS_ID');
  if (!id) throw new Error('BEKU is not set up yet (run setup).');
  return (SS_ = SpreadsheetApp.openById(id));
}
const HDR_OK_ = {};
function sheet_(name) {
  const ss = ss_(); let sh = ss.getSheetByName(name);
  if (!sh && HEAD[name]) { sh = ss.insertSheet(name); sh.appendRow(HEAD[name]); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD[name].length).setFontWeight('bold'); sh.getRange(1, 1, Math.max(sh.getMaxRows(), 1000), HEAD[name].length).setNumberFormat('@'); }
  else if (sh && HEAD[name] && !HDR_OK_[name]) { // new columns added in later versions
    const n = sh.getLastColumn();
    if (n < HEAD[name].length) { sh.getRange(1, 1, 1, HEAD[name].length).setValues([HEAD[name]]).setFontWeight('bold'); sh.getRange(1, n + 1, sh.getMaxRows(), HEAD[name].length - n).setNumberFormat('@'); }
  }
  HDR_OK_[name] = 1;
  return sh;
}
const HEAD = {
  Batches: ['batch', 'sku', 'code', 'name', 'ctype', 'pcs', 'cartons', 'made', 'bestBefore', 'run', 'status', 'createdBy', 'createdAt', 'closedBy', 'closedAt', 'packed', 'voided', 'madeChanged'],
  Cartons: ['carton', 'batch', 'n', 'of', 'status', 'photo1', 'photo2', 'photoBy', 'photoAt', 'location', 'updatedAt', 'delivery'],
  Deliveries: ['id', 'customer', 'ref', 'status', 'cartons', 'createdBy', 'createdAt', 'sentBy', 'sentAt', 'note', 'invoice', 'deliveryDate', 'address', 'group', 'need', 'photo', 'photoBy', 'photoAt'],
  Checks: ['id', 'status', 'location', 'startedBy', 'startedAt', 'expected', 'doneBy', 'doneAt', 'report', 'note', 'resolved'],
  CheckScans: ['check', 'carton', 'by', 'at', 'verdict'],
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
const MEMO_ = {};
/* sheet snapshot cached in CacheService (2 min); every write clears it */
function rowsKey_(name) { return 'rows2_' + name; }
function dropRows_(name) { delete MEMO_[name]; try { CacheService.getScriptCache().remove(rowsKey_(name)); } catch (e) {} }
let FRESH_ = false; // writers read the sheet itself, never the cached copy
function rows_(name) {
  if (MEMO_[name]) return MEMO_[name].map(o => Object.assign({}, o));
  if (!FRESH_) try { const c = CacheService.getScriptCache().get(rowsKey_(name)); if (c) { MEMO_[name] = JSON.parse(c); return MEMO_[name].map(o => Object.assign({}, o)); } } catch (e) {}
  const sh = sheet_(name), v = sh.getDataRange().getValues(), h = v[0];
  const f = d => (d.getHours() || d.getMinutes() || d.getSeconds()) ? Utilities.formatDate(d, TZ, 'yyyy-MM-dd HH:mm:ss') : iso_(d);
  MEMO_[name] = v.slice(1).map((r, i) => { const o = { _row: i + 2 }; h.forEach((k, j) => { o[k] = r[j] instanceof Date ? f(r[j]) : r[j]; }); return o; });
  try { const js = JSON.stringify(MEMO_[name]); if (js.length < 95000) CacheService.getScriptCache().put(rowsKey_(name), js, 120); } catch (e) {}
  return MEMO_[name].map(o => Object.assign({}, o));
}
function setRow_(name, row, obj) {
  dropRows_(name);
  const sh = sheet_(name), h = HEAD[name];
  sh.getRange(row, 1, 1, h.length).setValues([h.map(k => obj[k] == null ? '' : obj[k])]);
}
function log_(who, action, ref, detail) { delete MEMO_.Log; sheet_('Log').appendRow([stamp_(), who, action, ref, typeof detail === 'string' ? detail : JSON.stringify(detail || '')]); }
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
function teamRows_(fresh) {
  const cache = CacheService.getScriptCache();
  if (!fresh) { const c = cache.get('team_v1'); if (c) return JSON.parse(c); }
  const t = teamRowsRead_();
  try { cache.put('team_v1', JSON.stringify(t), 600); } catch (e) {}
  return t;
}
function teamRowsRead_() {
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
  const pick = t => t.filter(r => r.active && ((ph.length >= 8 && r.phone === ph) || normName_(r.name) === normName_(id)));
  let rows = pick(teamRows_());
  if (!rows.some(r => r.pin !== '' && r.pin === pin)) rows = pick(teamRows_(true)); // PIN or staff may have just changed
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
  const match = t => t.filter(r => r.active && normName_(r.name) === normName_(s.n) && (r.phone || '') === (s.p || '') && pinHash_(r.name, r.pin) === s.h);
  let m = match(teamRows_()); if (m.length !== 1) m = match(teamRows_(true));
  if (m.length !== 1) { props_().deleteProperty(k); throw new Error('Please sign in again.'); }
  return { name: m[0].name, role: m[0].role };
}
function logout(tok) { try { props_().deleteProperty(sesKey_(tok)); } catch (e) {} return true; }
function me(tok) { return user_(tok); }

/* ---------- catalog (public) ---------- */
function catalog() { return CATALOG.map(p => ({ sku: p.sku, code: p.code, name: p.name, fam: p.fam, ct: p.ct })); }

/* ---------- batches ---------- */
function newBatch(tok, sku, ctype, count, made) {
  FRESH_ = true;
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
    dropRows_('Batches'); dropRows_('Cartons');
    sheet_('Batches').appendRow(HEAD.Batches.map(k => ({ batch: batch, sku: p.sku, code: p.code, name: p.name, ctype: ct.t, pcs: ct.pcs, cartons: count, made: made, bestBefore: bb, run: run, status: 'open', createdBy: u.name, createdAt: at, closedBy: '', closedAt: '', packed: 0, voided: '', madeChanged: made !== today ? 'yes' : '' })[k]));
    const w = String(count).length < 2 ? 2 : String(count).length;
    const cr = [];
    for (let i = 1; i <= count; i++) { const n = ('000' + i).slice(-w); cr.push([batch + '-' + n, batch, i, count, 'printed', '', '', '', '', 'HQ Freezer', at]); }
    const sh = sheet_('Cartons'); sh.getRange(sh.getLastRow() + 1, 1, cr.length, cr[0].length).setValues(cr); dropRows_('Batches'); dropRows_('Cartons');
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
  FRESH_ = true;
  const u = user_(tok), b = rows_('Batches').find(x => x.batch === batch); if (!b) throw new Error('Batch not found.');
  ns = (ns || []).map(Number).filter(n => n >= 1 && n <= 999).sort((a, c) => a - c);
  const txt = ns.length === +b.cartons ? 'all ' + ns.length : ns.join(', ');
  dropRows_('Prints');
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
  return rows_('Batches').filter(b => b.status === 'open' || (b.status === 'closed' && String(b.closedAt).slice(0, 10) >= addMonths_(todayIso_(), -1).slice(0, 10)))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 30)
    .map(b => { const mine = cs.filter(c => c.batch === b.batch); return Object.assign(batchInfo_(b), { done: mine.filter(c => ['packed', 'picked', 'sent'].indexOf(c.status) >= 0).length, voidN: mine.filter(c => c.status === 'void').length }); });
}

/* ---------- cartons ---------- */
function carton(id, tok) {
  id = clean_(id, 40).toUpperCase();
  const c = rows_('Cartons').find(x => x.carton === id); if (!c) throw new Error('Carton not found.');
  const b = rows_('Batches').find(x => x.batch === c.batch), info = batchInfo_(b), p = product_(b.sku);
  const pub = { carton: c.carton, n: c.n, of: c.of, batch: b.batch, sku: p.sku, name: p.name, fam: p.fam, pack: info.pack, net: info.net, made: info.madeDmy, bestBefore: info.bbDmy,
    ing: p.ing, contains: p.contains, may: p.may, serve: p.serve, void: c.status === 'void' };
  if (tok) { try { const u = user_(tok); pub.staff = { status: c.status, p1: !!c.photo1, p2: !!c.photo2, by: c.photoBy, at: c.photoAt, batchStatus: b.status, location: c.location, delivery: c.delivery || '', user: u.name }; } catch (e) { pub.staffError = e.message; } }
  return pub;
}
function folderFor_(batch) {
  const root = DriveApp.getFolderById(props_().getProperty('ROOT_ID'));
  const it = root.getFoldersByName(batch); return it.hasNext() ? it.next() : root.createFolder(batch);
}
/* returns a photo as a data URL so staff can see it in the app (Drive files stay private). */
function photoData(tok, id, slot) {
  user_(tok); id = clean_(id, 40).toUpperCase(); slot = +slot === 2 ? 2 : 1;
  const c = rows_('Cartons').find(x => x.carton === id); if (!c) throw new Error('Carton not found.');
  const url = String(c['photo' + slot] || ''); if (!url) throw new Error('No photo yet.');
  const m = /\/d\/([\w-]{10,})/.exec(url) || /[?&]id=([\w-]{10,})/.exec(url); if (!m) throw new Error('Photo link not readable.');
  const b = DriveApp.getFileById(m[1]).getBlob();
  return { slot: slot, data: 'data:' + (b.getContentType() || 'image/jpeg') + ';base64,' + Utilities.base64Encode(b.getBytes()) };
}
/* slot 1 = cakes in the open box (top), slot 2 = label side. data = dataURL (jpeg). nonce makes a re-send harmless. */
function photo(tok, id, slot, data, nonce, takenAt) {
  FRESH_ = true;
  const u = user_(tok); id = clean_(id, 40).toUpperCase(); slot = +slot === 2 ? 2 : 1;
  const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(String(data || ''));
  if (!m) throw new Error('Photo missing.');
  if (m[2].length > 2.5e6) throw new Error('Photo too big.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const c = rows_('Cartons').find(x => x.carton === id); if (!c) throw new Error('Carton not found.');
    if (c.status === 'void') throw new Error('This carton number was voided. Do not use this sticker.');
    const b = rows_('Batches').find(x => x.batch === c.batch); if (b.status !== 'open') throw new Error('Packing for this batch is already done.');
    const key = 'n_' + clean_(nonce, 60);
    if (nonce && props_().getProperty(key)) return { carton: id, dup: true };
    const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), 'image/' + m[1], id + '_' + slot + '.jpg');
    const f = folderFor_(c.batch).createFile(blob);
    c['photo' + slot] = f.getUrl(); c.photoBy = u.name; c.photoAt = clean_(takenAt, 30) || stamp_(); c.updatedAt = stamp_();
    if (c.photo1 && c.photo2) c.status = 'packed'; else if (c.status === 'printed') c.status = 'photo';
    setRow_('Cartons', c._row, c);
    if (nonce) props_().setProperty(key, '1');
    log_(u.name, 'photo ' + slot, id, '');
    return { carton: id, status: c.status, p1: !!c.photo1, p2: !!c.photo2 };
  } finally { lock.releaseLock(); }
}
function voidCartons(tok, batch, ids) {
  FRESH_ = true;
  const bb = rows_('Batches').find(x => x.batch === batch); if (!bb || bb.status !== 'open') throw new Error('This batch is not open.');
  const u = user_(tok), set = (ids || []).map(x => clean_(x, 40).toUpperCase());
  const cs = rows_('Cartons').filter(c => c.batch === batch && set.indexOf(c.carton) >= 0 && ['packed', 'picked', 'sent', 'void'].indexOf(c.status) < 0);
  cs.forEach(c => { c.status = 'void'; c.updatedAt = stamp_(); setRow_('Cartons', c._row, c); });
  log_(u.name, 'void', batch, cs.map(c => c.carton).join(' '));
  return batchGet(tok, batch);
}
function reopenCarton(tok, id) { // undo a void before close
  FRESH_ = true;
  const u = user_(tok); const c = rows_('Cartons').find(x => x.carton === id); if (!c || c.status !== 'void') return carton(id, tok);
  const b = rows_('Batches').find(x => x.batch === c.batch); if (!b || b.status !== 'open') throw new Error('This batch is closed. Void stays.');
  c.status = c.photo1 && c.photo2 ? 'packed' : (c.photo1 || c.photo2 ? 'photo' : 'printed'); setRow_('Cartons', c._row, c); log_(u.name, 'unvoid', id, ''); return carton(id, tok);
}
function tc_(s) { return String(s || '').toLowerCase().replace(/(^|[\s–-])([a-z])/g, (m, a, c) => a + c.toUpperCase()); }
/* cancel a whole batch (wrong product, wrong date...): only while nothing is packed. All its stickers become void. */
function cancelBatch(tok, id, reason) {
  FRESH_ = true;
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
  const packed = cs.filter(c => c.status === 'packed' || c.status === 'picked' || c.status === 'sent'), voided = cs.filter(c => c.status === 'void');
  const people = {}; packed.forEach(c => { if (c.photoBy) people[c.photoBy] = 1; });
  const times = packed.map(c => String(c.photoAt)).filter(Boolean).sort();
  const t = s => s ? s.slice(11, 16) : '';
  const folder = props_().getProperty('ROOT_ID') ? folderFor_(b.batch).getUrl() : '';
  return ['🧊 *BEKU PACKING DONE* ✅', '*' + tc_(b.name) + '* · batch ' + b.batch,
    packed.length + ' ' + b.ctype + ' packed' + (voided.length ? ' (' + voided.map(c => String(c.n)).join(', ') + ' void)' : '') + ' · ' + packed.length + '/' + packed.length + ' photos',
    'Made ' + dmy_(String(b.made)) + ' · Best before ' + dmy_(String(b.bestBefore)),
    'By ' + (Object.keys(people).map(tc_).join(', ') || tc_(by)) + (times.length ? ' · ' + t(times[0]) + '–' + t(times[times.length - 1]) : ''),
    'Closed by ' + tc_(by), 'Photos: ' + folder].join('\n');
}
function closeBatch(tok, id, voidRest) {
  FRESH_ = true;
  const u = user_(tok);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const b = rows_('Batches').find(x => x.batch === id); if (!b) throw new Error('Batch not found.');
    let cs = rows_('Cartons').filter(c => c.batch === id);
    const isPk = c => c.status === 'packed' || c.status === 'picked' || c.status === 'sent';
    const open = cs.filter(c => !isPk(c) && c.status !== 'void');
    if (open.length && !voidRest) return { needConfirm: true, missing: open.map(c => ({ carton: c.carton, n: c.n, status: c.status })) };
    open.forEach(c => { c.status = 'void'; c.updatedAt = stamp_(); setRow_('Cartons', c._row, c); });
    cs = rows_('Cartons').filter(c => c.batch === id);
    const packed = cs.filter(isPk).length;
    if (!packed) throw new Error('No carton has both photos yet.');
    b.status = 'closed'; b.closedBy = u.name; b.closedAt = stamp_(); b.packed = packed; b.voided = cs.filter(c => c.status === 'void').map(c => c.n).join(' ');
    setRow_('Batches', b._row, b);
    const text = report_(b, cs, u.name);
    log_(u.name, 'close batch', id, { packed: packed, voided: b.voided });
    const queued = notify_('batch', b.batch, '', text, cs.filter(isPk).map(c => c.carton).join(' '), b.batch);
    return { closed: true, packed: packed, report: text, queued: queued, wa: 'https://wa.me/?text=' + encodeURIComponent(text) };
  } finally { lock.releaseLock(); }
}


/* ---------- auto sign-in from the Chaleur back-office app (same website, so its saved sign-in is readable) ---------- */
const CA_API = 'https://script.google.com/macros/s/AKfycbyX_DH98Kfqa3SHKgM_XXCM7MIJaJokTbjuCq8Rcf6uueS7kSDy7wg2CmvXsOACtZfivw/exec';
function loginCA(caTok, remember) {
  caTok = String(caTok || '').trim();
  if (!/^s1\.[a-f0-9]{64}$/.test(caTok)) throw new Error('Please sign in.');
  let r;
  try { r = JSON.parse(UrlFetchApp.fetch(CA_API, { method: 'post', contentType: 'text/plain;charset=utf-8', payload: JSON.stringify({ fn: 'me', args: [caTok] }), muteHttpExceptions: true, followRedirects: true }).getContentText()); }
  catch (e) { throw new Error('Please sign in.'); }
  if (!r || !r.ok || !r.result || !r.result.name) throw new Error('Please sign in.');
  const nm = normName_(String(r.result.name).replace(/\s*\(as [^)]*\)\s*$/, ''));
  const rows = teamRows_().filter(x => x.active && normName_(x.name) === nm);
  if (rows.length !== 1) throw new Error('Please sign in.');
  const u = rows[0], tok = 'b1.' + (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').toLowerCase();
  const exp = Date.now() + (remember === false ? 12 * 36e5 : 30 * 864e5);
  props_().setProperty(sesKey_(tok), JSON.stringify({ n: u.name, p: u.phone, h: pinHash_(u.name, u.pin), x: exp }));
  log_(u.name, 'sign in (from CA app)', '', '');
  return { token: tok, name: u.name, exp: exp };
}

/* ---------- stock ---------- */
function stock(tok) {
  user_(tok);
  const bs = {}; rows_('Batches').forEach(b => { bs[b.batch] = b; });
  const today = todayIso_(), soon = addMonths_(today, 2);
  const out = {};
  rows_('Cartons').forEach(c => {
    if (c.status !== 'packed' && c.status !== 'picked') return;
    const b = bs[c.batch]; if (!b || b.status === 'cancelled') return;
    const p = CATALOG.find(x => x.sku === b.sku) || { name: b.name, fam: '' };
    const k = b.sku;
    if (!out[k]) out[k] = { sku: b.sku, code: b.code, name: p.name, fam: p.fam, inStock: 0, picked: 0, lots: {} };
    const o = out[k], lk = b.batch + '|' + b.ctype;
    if (!o.lots[lk]) o.lots[lk] = { batch: b.batch, ctype: b.ctype, bestBefore: String(b.bestBefore), bbDmy: dmy_(String(b.bestBefore)), inStock: 0, picked: 0, expired: String(b.bestBefore) < today, soon: String(b.bestBefore) < soon };
    if (c.status === 'packed') { o.inStock++; o.lots[lk].inStock++; } else { o.picked++; o.lots[lk].picked++; }
  });
  return Object.keys(out).map(k => { const o = out[k]; o.lots = Object.keys(o.lots).map(x => o.lots[x]).sort((a, b) => a.bestBefore.localeCompare(b.bestBefore)); return o; })
    .sort((a, b) => a.code.localeCompare(b.code));
}

/* ---------- stock check (HQ Freezer) ---------- */
const CHECK_DAY = 15, CHECK_FROM = '2026-12-15'; // stock check once a month on the 15th, first one 15 Dec 2026
function the15th_(iso, add) { const y = +iso.slice(0, 4), m = +iso.slice(5, 7) - 1 + (add || 0); const d = new Date(Date.UTC(y, m, CHECK_DAY)); return d.toISOString().slice(0, 10); }
function isMgr_(u) { return /owner|manager|office|admin|director/.test(String(u.role || '')); }
function checkSummary_(k, cs, bs, scans) {
  const exp = String(k.expected || '').split(' ').filter(Boolean), seen = {}, odd = [];
  scans.forEach(s => { seen[s.carton] = s; });
  const byId = {}; cs.forEach(c => { byId[c.carton] = c; });
  const prod = {}, P = sku => prod[sku] || (prod[sku] = { sku: sku, name: (CATALOG.find(x => x.sku === sku) || {}).name || sku, exp: 0, found: 0 });
  const missing = [];
  exp.forEach(id => { const c = byId[id], b = c && bs[c.batch]; const p = P(b ? b.sku : '?'); p.exp++; if (seen[id]) p.found++; else missing.push({ carton: id, name: p.name, status: c ? c.status : '?', bb: b ? dmy_(String(b.bestBefore)) : '' }); });
  const today = todayIso_();
  scans.forEach(s => { if (exp.indexOf(s.carton) < 0) { const c = byId[s.carton], b = c && bs[c.batch]; odd.push({ carton: s.carton, name: b ? (CATALOG.find(x => x.sku === b.sku) || {}).name || b.name : '?', status: c ? c.status : 'unknown', delivery: c ? c.delivery || '' : '', by: s.by }); } });
  const expired = scans.map(s => byId[s.carton]).filter(c => c && bs[c.batch] && String(bs[c.batch].bestBefore) < today).map(c => c.carton);
  return { id: k.id, status: k.status, startedBy: k.startedBy, startedAt: String(k.startedAt), doneBy: k.doneBy, doneAt: String(k.doneAt || ''), expected: exp.length,
    found: exp.length - missing.length, scanned: scans.length, products: Object.keys(prod).map(x => prod[x]).sort((a, b) => String(a.sku).localeCompare(String(b.sku))),
    missing: missing, odd: odd, expired: expired, resolved: k.resolved ? JSON.parse(k.resolved) : {} };
}
function checkScans_(id) { return rows_('CheckScans').filter(s => s.check === id); }
function checkStatus(tok) {
  user_(tok);
  const ks = rows_('Checks'), open = ks.find(k => k.status === 'open'), done = ks.filter(k => k.status === 'done').sort((a, b) => String(b.doneAt).localeCompare(String(a.doneAt)));
  const last = done[0], lastDay = last ? String(last.doneAt).slice(0, 10) : '';
  const today = todayIso_(), cur = +today.slice(8, 10) >= CHECK_DAY ? the15th_(today, 0) : the15th_(today, -1);
  let due = false, dueOn;
  if (cur < CHECK_FROM) dueOn = CHECK_FROM;
  else { const doneThis = done.some(k => String(k.doneAt).slice(0, 10) >= cur); due = !open && !doneThis; dueOn = doneThis ? the15th_(cur, 1) : cur; }
  return { open: open ? open.id : '', last: last ? { id: last.id, at: String(last.doneAt).slice(0, 16), by: last.doneBy } : null, due: due, dueOn: dueOn, every: 'month',
    recent: done.slice(0, 6).map(k => ({ id: k.id, at: String(k.doneAt).slice(0, 16), by: k.doneBy, note: k.note || '' })) };
}
function checkStart(tok) {
  FRESH_ = true;
  const u = user_(tok), lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const ex = rows_('Checks').find(k => k.status === 'open'); if (ex) return checkGet(tok, ex.id);
    const bs = bmap_();
    const exp = rows_('Cartons').filter(c => (c.status === 'packed' || c.status === 'picked') && bs[c.batch] && bs[c.batch].status !== 'cancelled').map(c => c.carton);
    const ymd = todayIso_().slice(2).replace(/-/g, ''), pre = 'SC' + ymd + '-', n = rows_('Checks').filter(k => String(k.id).indexOf(pre) === 0).length + 1, id = pre + ('0' + n).slice(-2);
    sheet_('Checks'); dropRows_('Checks');
    sheet_('Checks').appendRow([id, 'open', 'HQ Freezer', u.name, stamp_(), exp.join(' '), '', '', '', '', '']);
    log_(u.name, 'stock check start', id, exp.length + ' expected');
    return checkGet(tok, id);
  } finally { lock.releaseLock(); }
}
function checkGet(tok, id) {
  const u = user_(tok);
  const k = rows_('Checks').find(x => x.id === id); if (!k) throw new Error('Stock check not found.');
  const out = checkSummary_(k, rows_('Cartons'), bmap_(), checkScans_(id)); out.mgr = isMgr_(u); return out;
}
function checkScan(tok, id, cid) {
  FRESH_ = true;
  const u = user_(tok); cid = clean_(cid, 40).toUpperCase();
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const k = rows_('Checks').find(x => x.id === id); if (!k) throw new Error('Stock check not found.');
    if (k.status !== 'open') throw new Error('This stock check is finished.');
    const c = rows_('Cartons').find(x => x.carton === cid), bs = bmap_(), b = c && bs[c.batch];
    const exp = String(k.expected || '').split(' ').indexOf(cid) >= 0;
    const name = b ? tc_((CATALOG.find(x => x.sku === b.sku) || {}).name || b.name) : '';
    const already = checkScans_(id).some(s => s.carton === cid);
    let verdict = exp ? 'found' : !c ? 'unknown' : 'odd';
    if (!already) { sheet_('CheckScans'); dropRows_('CheckScans'); sheet_('CheckScans').appendRow([id, cid, u.name, stamp_(), verdict]); }
    const msg = already ? 'Already counted' : verdict === 'found' ? 'Counted' : verdict === 'unknown' ? 'Not a BEKU carton in the system' : 'In the system as ' + (c.status === 'sent' ? 'SENT' + (c.delivery ? ' (' + c.delivery + ')' : '') : String(c.status).toUpperCase()) + ', should not be here';
    const expired = b && String(b.bestBefore) < todayIso_();
    return { carton: cid, name: name, verdict: already ? 'dup' : verdict, msg: msg, expired: !!expired, bb: b ? dmy_(String(b.bestBefore)) : '', sum: checkGet(tok, id) };
  } finally { lock.releaseLock(); }
}
function checkUnscan(tok, id, cid) {
  FRESH_ = true;
  const u = user_(tok), k = rows_('Checks').find(x => x.id === id); if (!k || k.status !== 'open') throw new Error('This stock check is finished.');
  const s = checkScans_(id).find(x => x.carton === cid); if (!s) return checkGet(tok, id);
  sheet_('CheckScans').deleteRow(s._row); dropRows_('CheckScans'); log_(u.name, 'stock check unscan', id, cid);
  return checkGet(tok, id);
}
function checkFinish(tok, id, note) {
  FRESH_ = true;
  const u = user_(tok), lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const k = rows_('Checks').find(x => x.id === id); if (!k) throw new Error('Stock check not found.');
    if (k.status !== 'open') throw new Error('This stock check is already finished.');
    const sm = checkSummary_(k, rows_('Cartons'), bmap_(), checkScans_(id));
    const text = ['🧊 *BEKU STOCK CHECK* – HQ Freezer', 'Counted by ' + tc_(u.name) + ' · ' + stamp_().slice(0, 16), '',
      (sm.missing.length || sm.odd.length ? '⚠️ ' : '✅ ') + '*' + sm.found + ' of ' + sm.expected + ' cartons found*', '']
      .concat(sm.products.map(p => (p.found === p.exp ? '✓ ' : '✗ ') + tc_(p.name) + ': ' + p.found + ' / ' + p.exp))
      .concat(sm.missing.length ? ['', '❌ *Missing (' + sm.missing.length + ')*'].concat(sm.missing.map(m => '• ' + m.carton + ' · ' + tc_(m.name))) : [])
      .concat(sm.odd.length ? ['', '⚠️ *Should not be here (' + sm.odd.length + ')*'].concat(sm.odd.map(o => '• ' + o.carton + ' · ' + (o.name === '?' ? 'unknown' : tc_(o.name)) + ' · system: ' + o.status + (o.delivery ? ' ' + o.delivery : ''))) : [])
      .concat(sm.expired.length ? ['', '📅 *Expired, take out (' + sm.expired.length + ')*'].concat(sm.expired.map(x => '• ' + x)) : [])
      .concat(note ? ['', 'Note: ' + clean_(note, 300)] : []).concat(['', 'Ref ' + id]).join('\n');
    k.status = 'done'; k.doneBy = u.name; k.doneAt = stamp_(); k.report = text; k.note = clean_(note || '', 300); setRow_('Checks', k._row, k);
    const queued = notify_('stockcheck', id, '', text, sm.missing.map(m => m.carton).join(' '), '');
    log_(u.name, 'stock check done', id, sm.found + '/' + sm.expected);
    const out = checkSummary_(k, rows_('Cartons'), bmap_(), checkScans_(id)); out.report = text; out.queued = queued; return out;
  } finally { lock.releaseLock(); }
}
function checkCancel(tok, id) {
  FRESH_ = true;
  const u = user_(tok), k = rows_('Checks').find(x => x.id === id); if (!k || k.status !== 'open') throw new Error('Nothing to cancel.');
  k.status = 'cancelled'; k.doneBy = u.name; k.doneAt = stamp_(); setRow_('Checks', k._row, k); log_(u.name, 'stock check cancel', id, '');
  return checkStatus(tok);
}
/* manager only: a missing carton is written off as lost or damaged (leaves stock). */
function checkResolve(tok, id, cid, kind) {
  FRESH_ = true;
  const u = user_(tok); if (!isMgr_(u)) throw new Error('Only a manager can write off a carton.');
  kind = kind === 'damaged' ? 'damaged' : kind === 'found' ? 'found' : 'lost';
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const k = rows_('Checks').find(x => x.id === id); if (!k || k.status !== 'done') throw new Error('Finish the stock check first.');
    const c = rows_('Cartons').find(x => x.carton === cid); if (!c) throw new Error('Carton not found.');
    if (kind !== 'found') { if (c.status !== 'packed' && c.status !== 'picked') throw new Error('Carton is ' + c.status + ' now.'); c.status = kind; c.location = kind.toUpperCase() + ' (' + id + ')'; c.updatedAt = stamp_(); setRow_('Cartons', c._row, c); }
    const r = k.resolved ? JSON.parse(k.resolved) : {}; r[cid] = { kind: kind, by: u.name, at: stamp_() }; k.resolved = JSON.stringify(r); setRow_('Checks', k._row, k);
    log_(u.name, 'stock check ' + kind, id, cid);
    return checkGet(tok, id);
  } finally { lock.releaseLock(); }
}

/* ---------- orders from the WhatsApp bot sheet (read only) ---------- */
function norm_(s) { return String(s || '').toUpperCase().replace(/[–—-]/g, ' ').replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
function skuFor_(name) {
  const n = norm_(name); if (!n) return '';
  const ex = CATALOG.find(p => norm_(p.name) === n); if (ex) return ex.sku;
  const part = CATALOG.filter(p => n.indexOf(norm_(p.name)) >= 0 || norm_(p.name).indexOf(n) >= 0);
  return part.length === 1 ? part[0].sku : '';
}
function isoOf_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  const s = String(v || '').trim(); let m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s); if (m) return m[3] + '-' + ('0' + m[1]).slice(-2) + '-' + ('0' + m[2]).slice(-2);
  m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); return m ? m[0] : '';
}
function addDays_(iso, n) { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function orders_() {
  if (MEMO_.orders) return MEMO_.orders;
  const ch = CacheService.getScriptCache(), hit = ch.get('orders_v1'); if (hit) return (MEMO_.orders = JSON.parse(hit));
  let out = [];
  try {
    const sh = SpreadsheetApp.openById(BOT_SS_ID).getSheetByName('Orders');
    const v = sh ? sh.getDataRange().getValues() : []; const h = (v[0] || []).map(x => String(x).trim().toLowerCase());
    const col = re => h.findIndex(x => re.test(x));
    const cInv = col(/invoice/), cName = col(/business name/), cItems = col(/items/), cDel = col(/delivery date/), cAddr = col(/address/), cTo = col(/whatsapp/), cPay = col(/payment/), cDate = col(/^date$/);
    if (cInv >= 0) out = v.slice(1).filter(r => String(r[cInv] || '').trim()).map(r => ({
      invoice: String(r[cInv]).trim(), customer: String(r[cName] || '').trim(), date: isoOf_(r[cDate]), deliveryDate: isoOf_(r[cDel]),
      address: String(r[cAddr] || '').trim(), group: String(r[cTo] || '').trim(), paid: String(r[cPay] || '').trim(),
      items: String(r[cItems] || '').split(/;|\n/).map(x => x.trim()).filter(Boolean).map(x => { const m = /^(.*?)\s*[x×]\s*(\d+)\s*$/i.exec(x); const name = m ? m[1].trim() : x; return { name: name, n: m ? +m[2] : 1, sku: skuFor_(name) }; })
    }));
  } catch (e) { out = []; }
  ch.put('orders_v1', JSON.stringify(out), 60);
  return (MEMO_.orders = out);
}
/* orders still to send: delivery date from 3 days ago onward (or no date), not already sent */
function ordersToPack(tok) {
  user_(tok);
  const ds = rows_('Deliveries').filter(d => d.status !== 'cancelled'), cut = addDays_(todayIso_(), -3), cs = rows_('Cartons');
  return orders_().filter(o => !o.deliveryDate || o.deliveryDate >= cut).map(o => {
    const d = ds.find(x => String(x.invoice || x.ref) === o.invoice);
    const got = d ? cs.filter(c => c.delivery === d.id && (c.status === 'picked' || c.status === 'sent')).length : 0;
    return { invoice: o.invoice, customer: o.customer, deliveryDate: o.deliveryDate, ddDmy: o.deliveryDate ? dmy_(o.deliveryDate) : '', items: o.items,
      need: o.items.reduce((a, i) => a + i.n, 0), got: got, delivery: d ? d.id : '', status: d ? d.status : 'new' };
  }).filter(o => o.status !== 'sent').sort((a, b) => (a.deliveryDate || '9').localeCompare(b.deliveryDate || '9'));
}
function deliveryFromOrder(tok, invoice) {
  FRESH_ = true;
  const u = user_(tok); invoice = clean_(invoice, 40);
  const o = orders_().find(x => x.invoice === invoice); if (!o) throw new Error('Order ' + invoice + ' not found in the order list.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const ex = rows_('Deliveries').find(x => x.status !== 'cancelled' && String(x.invoice || x.ref) === invoice);
    if (ex) return deliveryGet(tok, ex.id);
    const ymd = todayIso_().slice(2).replace(/-/g, ''), pre = 'D' + ymd + '-';
    const n = rows_('Deliveries').filter(d => String(d.id).indexOf(pre) === 0).length + 1, id = pre + ('0' + n).slice(-2);
    sheet_('Deliveries'); dropRows_('Deliveries');
    sheet_('Deliveries').appendRow([id, o.customer, invoice, 'open', 0, u.name, stamp_(), '', '', '', invoice, o.deliveryDate, o.address, o.group, JSON.stringify(o.items)]);
    log_(u.name, 'delivery from order', id, invoice);
    return deliveryGet(tok, id);
  } finally { lock.releaseLock(); }
}
/* queue a message for the BEKU ORDER staff group. The WhatsApp bot (its own 5-min trigger) posts rows whose "Sent at" is empty, then fills Sent at / Error. */
function notify_(kind, ref, customer, text, cartons, batches, photo, custText, custGroup) {
  try {
    const ss = SpreadsheetApp.openById(BOT_SS_ID); let sh = ss.getSheetByName(BOT_TAB);
    const H = ['Queued', 'Kind', 'Invoice / batch', 'Customer', 'Message', 'Cartons', 'Batches', 'Sent at', 'Error', 'Photo', 'Customer message', 'Customer group', 'Customer sent at'];
    if (!sh) { sh = ss.insertSheet(BOT_TAB); sh.appendRow(H); sh.setFrozenRows(1); }
    else H.forEach((h, i) => { if (i >= 9 && String(sh.getRange(1, i + 1).getValue()) !== h) sh.getRange(1, i + 1).setValue(h); });
    sh.appendRow([stamp_(), kind, ref, customer || '', text, cartons || '', batches || '', '', '', photo || '', custText || '', custGroup || '', '']);
    return true;
  } catch (e) { try { log_('system', 'notify failed', ref, String(e && e.message || e)); } catch (x) {} return false; }
}

/* ---------- deliveries (pick & send) ---------- */
function deliveryInfo_(d, cs, bs) {
  const mine = cs.filter(c => c.delivery === d.id && (c.status === 'picked' || c.status === 'sent'));
  const lines = {};
  mine.forEach(c => { const b = bs[c.batch] || {}; const k = b.sku + '|' + b.ctype; if (!lines[k]) lines[k] = { sku: b.sku, name: b.name, ctype: b.ctype, n: 0, cartons: [] }; lines[k].n++; lines[k].cartons.push({ carton: c.carton, batch: c.batch, bestBefore: dmy_(String(b.bestBefore || '')) }); });
  let need = []; try { need = d.need ? JSON.parse(d.need) : []; } catch (e) { need = []; }
  need = need.map(i => ({ name: i.name, sku: i.sku, n: +i.n || 0, got: mine.filter(c => i.sku && (bs[c.batch] || {}).sku === i.sku).length }));
  const extra = mine.filter(c => need.length && !need.some(i => i.sku && (bs[c.batch] || {}).sku === i.sku)).map(c => c.carton);
  const complete = need.length ? need.every(i => i.got === i.n) && !extra.length : true;
  return { id: d.id, customer: d.customer, ref: d.ref, invoice: d.invoice || '', deliveryDate: d.deliveryDate ? isoOf_(d.deliveryDate) : '', ddDmy: d.deliveryDate && isoOf_(d.deliveryDate) ? dmy_(isoOf_(d.deliveryDate)) : '', address: d.address || '',
    status: d.status, createdBy: d.createdBy, createdAt: d.createdAt, sentBy: d.sentBy, sentAt: d.sentAt, note: d.note, count: mine.length, need: need, extra: extra, complete: complete, photo: !!d.photo, photoBy: d.photoBy || '', photoAt: d.photoAt ? String(d.photoAt) : '',
    lines: Object.keys(lines).map(k => lines[k]).sort((a, b) => String(a.sku).localeCompare(String(b.sku))) };
}
function bmap_() { const bs = {}; rows_('Batches').forEach(b => { bs[b.batch] = b; }); return bs; }
function deliveries(tok) {
  user_(tok);
  const cs = rows_('Cartons'), bs = bmap_(), ds = rows_('Deliveries');
  const cut = addMonths_(todayIso_(), -1);
  const list = ds.filter(d => d.status === 'open' || String(d.createdAt).slice(0, 10) >= cut).reverse().slice(0, 40).map(d => deliveryInfo_(d, cs, bs));
  const cust = {}; ds.forEach(d => { if (d.customer) cust[String(d.customer)] = 1; });
  return { list: list, customers: Object.keys(cust).sort() };
}
function deliveryNew(tok, customer, ref) {
  FRESH_ = true;
  const u = user_(tok); customer = clean_(customer, 80); ref = clean_(ref, 60);
  if (!customer) throw new Error('Type the customer name.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const ymd = todayIso_().slice(2).replace(/-/g, ''), pre = 'D' + ymd + '-';
    const n = rows_('Deliveries').filter(d => String(d.id).indexOf(pre) === 0).length + 1;
    const id = pre + ('0' + n).slice(-2);
    dropRows_('Deliveries');
    sheet_('Deliveries').appendRow([id, customer, ref, 'open', 0, u.name, stamp_(), '', '', '']);
    log_(u.name, 'new delivery', id, customer);
    return deliveryGet(tok, id);
  } finally { lock.releaseLock(); }
}
function deliveryGet(tok, id) {
  user_(tok);
  const d = rows_('Deliveries').find(x => x.id === id); if (!d) throw new Error('Delivery not found.');
  return deliveryInfo_(d, rows_('Cartons'), bmap_());
}
function deliveryEdit(tok, id, customer, ref) {
  FRESH_ = true;
  const u = user_(tok), d = rows_('Deliveries').find(x => x.id === id); if (!d) throw new Error('Delivery not found.');
  if (customer != null) d.customer = clean_(customer, 80) || d.customer;
  if (ref != null) d.ref = clean_(ref, 60);
  setRow_('Deliveries', d._row, d); log_(u.name, 'edit delivery', id, d.customer + ' ' + d.ref);
  return deliveryGet(tok, id);
}
/* scan a carton into a delivery. Oldest best-before first: a newer carton needs force=true. Expired = blocked. */
function pick(tok, id, cid, force) {
  FRESH_ = true;
  const u = user_(tok); cid = clean_(cid, 40).toUpperCase();
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const d = rows_('Deliveries').find(x => x.id === id); if (!d) throw new Error('Delivery not found.');
    if (d.status !== 'open') throw new Error('This delivery is already ' + d.status + '.');
    const cs = rows_('Cartons'), bs = bmap_();
    const c = cs.find(x => x.carton === cid); if (!c) throw new Error('Carton not found: ' + cid);
    const b = bs[c.batch];
    if (c.status === 'void') throw new Error(cid + ' is void. Do not send it.');
    if (c.delivery === id && c.status === 'picked') return { already: true, info: deliveryInfo_(d, cs, bs) };
    if (c.status === 'picked') throw new Error(cid + ' is already in delivery ' + c.delivery + '.');
    if (c.status === 'sent') throw new Error(cid + ' was already sent (' + c.delivery + ').');
    if (c.status !== 'packed') throw new Error(cid + ' has no packing photos yet. Finish packing first.');
    if (String(b.bestBefore) < todayIso_()) throw new Error(cid + ' is past its best-before date (' + dmy_(String(b.bestBefore)) + '). Do not send.');
    if (!force && d.need) {
      let need = []; try { need = JSON.parse(d.need); } catch (e) {}
      const it = need.find(i => i.sku === b.sku);
      if (need.length && !it) return { warn: tc_(b.name) + ' is NOT in order ' + (d.invoice || d.ref) + '. Add it anyway?', carton: cid };
      if (it) { const got = cs.filter(x => x.delivery === id && x.status === 'picked' && bs[x.batch] && bs[x.batch].sku === b.sku).length; if (got >= +it.n) return { warn: 'Order ' + (d.invoice || d.ref) + ' needs only ' + it.n + ' carton(s) of ' + tc_(b.name) + ' and you already have ' + got + '. Add one more anyway?', carton: cid }; }
    }
    if (!force) {
      const older = cs.filter(x => x.status === 'packed' && x.carton !== cid && bs[x.batch] && bs[x.batch].sku === b.sku && bs[x.batch].ctype === b.ctype && String(bs[x.batch].bestBefore) < String(b.bestBefore) && String(bs[x.batch].bestBefore) >= todayIso_());
      if (older.length) {
        const ob = bs[older[0].batch];
        return { warn: 'Older stock first: ' + older.length + ' carton(s) of ' + tc_(b.name) + ' have an earlier best-before (' + dmy_(String(ob.bestBefore)) + ', batch ' + ob.batch + '). Send those first?', carton: cid };
      }
    }
    c.status = 'picked'; c.delivery = id; c.updatedAt = stamp_(); setRow_('Cartons', c._row, c);
    log_(u.name, 'pick', id, cid + (force ? ' (newer first, confirmed)' : ''));
    return { picked: cid, name: tc_(b.name), info: deliveryGet(tok, id) };
  } finally { lock.releaseLock(); }
}
function unpick(tok, id, cid) {
  FRESH_ = true;
  const u = user_(tok); cid = clean_(cid, 40).toUpperCase();
  const d = rows_('Deliveries').find(x => x.id === id); if (!d || d.status !== 'open') throw new Error('This delivery cannot be changed.');
  const c = rows_('Cartons').find(x => x.carton === cid && x.delivery === id && x.status === 'picked'); if (!c) throw new Error('Carton not in this delivery.');
  c.status = 'packed'; c.delivery = ''; c.updatedAt = stamp_(); setRow_('Cartons', c._row, c); log_(u.name, 'unpick', id, cid);
  return deliveryGet(tok, id);
}
function deliveryCancel(tok, id) {
  FRESH_ = true;
  const u = user_(tok), d = rows_('Deliveries').find(x => x.id === id); if (!d || d.status !== 'open') throw new Error('Only an open delivery can be cancelled.');
  rows_('Cartons').filter(c => c.delivery === id && c.status === 'picked').forEach(c => { c.status = 'packed'; c.delivery = ''; c.updatedAt = stamp_(); setRow_('Cartons', c._row, c); });
  d.status = 'cancelled'; d.sentBy = u.name; d.sentAt = stamp_(); setRow_('Deliveries', d._row, d); log_(u.name, 'cancel delivery', id, '');
  return { cancelled: true };
}
/* dispatch photo for a delivery (required before Mark sent). Shared by link so the WhatsApp bot can post it. */
function deliveryPhoto(tok, id, data) {
  FRESH_ = true;
  const u = user_(tok);
  const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(String(data || '')); if (!m) throw new Error('Photo missing.');
  if (m[2].length > 2.5e6) throw new Error('Photo too big.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const d = rows_('Deliveries').find(x => x.id === id); if (!d) throw new Error('Delivery not found.');
    if (d.status !== 'open') throw new Error('This delivery is already ' + d.status + '.');
    const root = DriveApp.getFolderById(props_().getProperty('ROOT_ID')), it = root.getFoldersByName('Deliveries'), fo = it.hasNext() ? it.next() : root.createFolder('Deliveries');
    const f = fo.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), 'image/' + m[1], id + '_' + clean_(d.invoice || d.ref || '', 30) + '_dispatch.jpg'));
    try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
    d.photo = f.getUrl(); d.photoBy = u.name; d.photoAt = stamp_(); setRow_('Deliveries', d._row, d);
    log_(u.name, 'dispatch photo', id, '');
    return deliveryGet(tok, id);
  } finally { lock.releaseLock(); }
}
function deliveryPhotoData(tok, id) {
  user_(tok);
  const d = rows_('Deliveries').find(x => x.id === id); if (!d || !d.photo) throw new Error('No photo yet.');
  const mm = /\/d\/([\w-]{10,})/.exec(String(d.photo)); if (!mm) throw new Error('Photo link not readable.');
  const b = DriveApp.getFileById(mm[1]).getBlob();
  return { data: 'data:' + (b.getContentType() || 'image/jpeg') + ';base64,' + Utilities.base64Encode(b.getBytes()) };
}
function deliverySend(tok, id, force) {
  FRESH_ = true;
  const u = user_(tok);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const d = rows_('Deliveries').find(x => x.id === id); if (!d) throw new Error('Delivery not found.');
    if (d.status !== 'open') throw new Error('This delivery is already ' + d.status + '.');
    const cs = rows_('Cartons').filter(c => c.delivery === id && c.status === 'picked');
    if (!cs.length) throw new Error('No cartons scanned yet.');
    if (!d.photo) throw new Error('Take the dispatch photo first.');
    const pre = deliveryInfo_(d, rows_('Cartons'), bmap_());
    if (!pre.complete && !force) return { short: pre.need.filter(i => i.got !== i.n).map(i => tc_(i.name) + ': ' + i.got + ' of ' + i.n).concat(pre.extra.length ? [pre.extra.length + ' carton(s) not in the order'] : []) };
    cs.forEach(c => { c.status = 'sent'; c.location = d.customer; c.updatedAt = stamp_(); setRow_('Cartons', c._row, c); });
    d.status = 'sent'; d.cartons = cs.length; d.sentBy = u.name; d.sentAt = stamp_(); setRow_('Deliveries', d._row, d);
    const info = deliveryGet(tok, id);
    const bl = {}; info.lines.forEach(l => l.cartons.forEach(c => { bl[c.batch] = c.bestBefore; }));
    const uniq = a => a.filter((x, i) => a.indexOf(x) === i);
    const text = ['📦 *ORDER PACKED & SENT* – ' + (d.invoice || d.ref || id), 'Customer: *' + d.customer + '*' + (info.ddDmy ? '\nDelivery date: ' + info.ddDmy : '')]
      .concat([''], info.lines.map(l => '• *' + tc_(l.name) + '* × ' + l.n + ' ' + l.ctype + uniq(l.cartons.map(c => c.batch)).map(bt => { const cc = l.cartons.filter(c => c.batch === bt); return '\n   batch ' + bt + ' (BB ' + cc[0].bestBefore + ') – carton ' + cc.map(c => c.carton.split('-').pop()).join(', '); }).join('')))
      .concat(info.need.length && !info.complete ? ['', '⚠️ Not matching the order: ' + info.need.filter(i => i.got !== i.n).map(i => tc_(i.name) + ' ' + i.got + '/' + i.n).concat(info.extra.length ? [info.extra.length + ' extra carton(s)'] : []).join(', ')] : [])
      .concat(['', 'Total ' + cs.length + ' carton' + (cs.length > 1 ? 's' : '') + ' · by ' + tc_(u.name) + ' · ' + stamp_().slice(0, 16), 'Ref ' + id]).join('\n');
    const cust = ['Hi! Your beku° order' + (d.invoice || d.ref ? ' *' + (d.invoice || d.ref) + '*' : '') + ' is on the way 🚚', '']
      .concat(info.lines.map(l => '• ' + tc_(l.name) + ' × ' + l.n + ' ' + l.ctype))
      .concat(['', (info.ddDmy ? 'Delivery date: ' + info.ddDmy + '\n' : '') + 'Photo: your cartons at dispatch (keep frozen at -18°C on arrival).', 'Thank you! – beku°']).join('\n');
    const queued = notify_('delivery', d.invoice || d.ref || id, d.customer, text, cs.map(c => c.carton).join(' '), Object.keys(bl).join(' '), d.photo, d.group ? cust : '', d.group || '');
    log_(u.name, 'send delivery', id, cs.length + ' cartons');
    return { sent: true, info: info, report: text, queued: queued, wa: 'https://wa.me/?text=' + encodeURIComponent(text) };
  } finally { lock.releaseLock(); }
}

/* ---------- web app ---------- */
const API_FNS = { login: login, logout: logout, me: me, catalog: catalog, newBatch: newBatch, batchGet: batchGet, batches: batches, carton: carton, photo: photo, photoData: photoData, voidCartons: voidCartons, reopenCarton: reopenCarton, closeBatch: closeBatch, printLog: printLog, prints: prints, cancelBatch: cancelBatch, loginCA: loginCA, stock: stock, deliveries: deliveries, deliveryNew: deliveryNew, deliveryGet: deliveryGet, deliveryEdit: deliveryEdit, pick: pick, unpick: unpick, deliveryCancel: deliveryCancel, deliverySend: deliverySend, ordersToPack: ordersToPack, deliveryFromOrder: deliveryFromOrder, deliveryPhoto: deliveryPhoto, deliveryPhotoData: deliveryPhotoData, checkStatus: checkStatus, checkStart: checkStart, checkGet: checkGet, checkScan: checkScan, checkUnscan: checkUnscan, checkFinish: checkFinish, checkCancel: checkCancel, checkResolve: checkResolve };
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
