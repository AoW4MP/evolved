/** @OnlyCurrentDoc */
// (the script asks Google for its own sheet alone, not all of its owner's spreadsheets)

// Evolved's Builds List: a Google Apps Script web app over a Google Sheet, which the Faction Creator publishes builds to
// and HTML/FactionList.html reads (Data/builds.js). EVOLVED.md, "Builds List", has how to set it up.
//
// The sheet "Builds" has a row per build. Its columns:
//   Id       the build's own id, made here
//   Created  when it was published, Updated when it was last saved (ISO dates)
//   Dataset  the game version it was made on, as the site's top strip names it ("Silver Seas")
//   Name     the name its maker gave it, or empty
//   Code     the Faction Creator's code for it (its link's ?u=)
//   Tags     the tags its maker picked, comma separated
//   Notes    its maker's notes, plain text
//   Views    how often it was opened from the list
//   Owner    a SHA-256 hash of its maker's edit key, so the key itself is never stored or shown
//   Hidden   type anything here to hide the build from the list, without deleting it
// To remove a build, delete its row.
//
// Every answer is JSON: {ok: true, ...} or {ok: false, error}.
//   GET  ?action=list                                      {builds: [build]}, without the hidden ones
//   POST action=view, id                                   counts a view, {build}
//   POST action=save, key, dataset, name, code, tags, notes  publishes a new build, {build}
//   POST action=edit, key, id, dataset, name, code, tags, notes  saves over the key's own build, {build}
//   POST action=delete, key, id                            deletes the key's own build
// A build: {id, created, updated, dataset, name, code, tags: [], notes, views, owner}

const SHEET = "Builds";
const COLUMNS = ["Id", "Created", "Updated", "Dataset", "Name", "Code", "Tags", "Notes", "Views", "Owner", "Hidden"];
const TAGS = ["Roleplay", "Theme", "PvP", "Casual", "Hardcore"];
const LIMITS = { name: 80, notes: 5000, code: 1000, dataset: 40, key: 100, perOwner: 100 };
// the edit key is hashed with this in front, as Data/builds.js does (BdOwner)
const OWNER_SALT = "evolved-builds:";

function doGet(e) {
    return Answer(() => Handle((e && e.parameter) || {}, false));
}

function doPost(e) {
    return Answer(() => Handle((e && e.parameter) || {}, true));
}

function Answer(work) {
    let out;
    try {
        out = work();
    } catch (err) {
        out = { ok: false, error: typeof err === "string" ? err : "Something went wrong: " + err };
    }
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function Handle(p, posted) {
    if (p.action === "list") return { ok: true, builds: Rows(Table()).filter((r) => !r.hidden).map(Public) };
    const writes = { view: View, save: Save, edit: Edit, delete: Delete };
    const write = writes[p.action];
    if (!write) throw "Unknown action.";
    if (!posted) throw "Send this with POST.";
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
        return write(p);
    } finally {
        lock.releaseLock();
    }
}

// ------------------------------------------------------------------------------------------------------------- actions

function View(p) {
    const sheet = Table();
    const r = Find(sheet, p.id);
    r.views += 1;
    Cell(sheet, r.row, "Views", String(r.views));
    return { ok: true, build: Public(r) };
}

function Save(p) {
    const owner = Owner(p.key);
    const sheet = Table();
    const rows = Rows(sheet);
    const mine = rows.filter((r) => r.owner === owner);
    if (mine.length >= LIMITS.perOwner) throw "One edit key can publish " + LIMITS.perOwner + " builds: delete one of yours first.";
    const code = Code(p.code);
    if (mine.some((r) => r.code === code)) throw "You have already published this build.";
    const now = new Date().toISOString();
    const r = {
        id: NewId(rows),
        created: now,
        updated: now,
        dataset: Text(p.dataset, LIMITS.dataset, "dataset"),
        name: Text(p.name, LIMITS.name, "name"),
        code,
        tags: Tags(p.tags),
        notes: Text(p.notes, LIMITS.notes, "notes"),
        views: 0,
        owner,
        hidden: false
    };
    Write(sheet, sheet.getLastRow() + 1, r);
    return { ok: true, build: Public(r) };
}

function Edit(p) {
    const sheet = Table();
    const r = Find(sheet, p.id);
    if (r.owner !== Owner(p.key)) throw "This build was published with another edit key.";
    r.updated = new Date().toISOString();
    r.dataset = Text(p.dataset, LIMITS.dataset, "dataset");
    r.name = Text(p.name, LIMITS.name, "name");
    r.code = Code(p.code);
    r.tags = Tags(p.tags);
    r.notes = Text(p.notes, LIMITS.notes, "notes");
    Write(sheet, r.row, r);
    return { ok: true, build: Public(r) };
}

function Delete(p) {
    const sheet = Table();
    const r = Find(sheet, p.id);
    if (r.owner !== Owner(p.key)) throw "This build was published with another edit key.";
    sheet.deleteRow(r.row);
    return { ok: true };
}

// ------------------------------------------------------------------------------------------------------------- the sheet

function Table() {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = book.getSheetByName(SHEET);
    if (!sheet) {
        sheet = book.insertSheet(SHEET);
        sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight("bold");
        sheet.setFrozenRows(1);
    }
    return sheet;
}

// every build, with its row number. The columns are found by their headings, so they can be moved
function Rows(sheet) {
    const values = sheet.getDataRange().getValues();
    const head = values[0].map(String);
    const at = {};
    for (const c of COLUMNS) {
        at[c] = head.indexOf(c);
        if (at[c] < 0) throw "The sheet has no " + c + " column.";
    }
    const text = (v, c) => {
        const x = v[at[c]];
        return x instanceof Date ? x.toISOString() : String(x === null || x === undefined ? "" : x).trim();
    };
    return values.slice(1).map((v, i) => ({
        row: i + 2,
        id: text(v, "Id"),
        created: text(v, "Created"),
        updated: text(v, "Updated"),
        dataset: text(v, "Dataset"),
        name: text(v, "Name"),
        code: text(v, "Code"),
        tags: text(v, "Tags").split(",").map((t) => t.trim()).filter(Boolean),
        notes: text(v, "Notes"),
        views: Number(text(v, "Views")) || 0,
        owner: text(v, "Owner"),
        hidden: text(v, "Hidden") !== ""
    })).filter((r) => r.id);
}

function Head(sheet) {
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
}

// a build's row, its values in the sheet's own column order (a column the sheet has besides these is left empty), as
// plain text, or Sheets reads a code such as "22:35" as a time
function Write(sheet, row, r) {
    const by = {
        Id: r.id,
        Created: r.created,
        Updated: r.updated,
        Dataset: r.dataset,
        Name: r.name,
        Code: r.code,
        Tags: r.tags.join(","),
        Notes: r.notes,
        Views: String(r.views),
        Owner: r.owner,
        Hidden: r.hidden ? "x" : ""
    };
    const head = Head(sheet);
    const old = row <= sheet.getLastRow() ? sheet.getRange(row, 1, 1, head.length).getValues()[0] : [];
    const values = head.map((c, i) => (c in by ? by[c] : old[i] === undefined ? "" : old[i]));
    sheet.getRange(row, 1, 1, head.length).setNumberFormat("@").setValues([values]);
}

function Cell(sheet, row, column, value) {
    sheet.getRange(row, Head(sheet).indexOf(column) + 1).setNumberFormat("@").setValue(value);
}

function Find(sheet, id) {
    const r = Rows(sheet).find((x) => x.id === String(id || ""));
    if (!r || r.hidden) throw "That build isn't in the list any more.";
    return r;
}

function Public(r) {
    return {
        id: r.id,
        created: r.created,
        updated: r.updated,
        dataset: r.dataset,
        name: r.name,
        code: r.code,
        tags: r.tags,
        notes: r.notes,
        views: r.views,
        owner: r.owner
    };
}

// ------------------------------------------------------------------------------------------------------------- checks

function NewId(rows) {
    const taken = new Set(rows.map((r) => r.id));
    let id;
    do id = Utilities.getUuid().replace(/-/g, "").slice(0, 10);
    while (taken.has(id));
    return id;
}

function Owner(key) {
    key = String(key || "").trim();
    if (key.length < 8 || key.length > LIMITS.key) throw "Your edit key is missing or not valid.";
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, OWNER_SALT + key, Utilities.Charset.UTF_8);
    return bytes.map((b) => ("0" + ((b + 256) % 256).toString(16)).slice(-2)).join("");
}

function Text(value, most, what) {
    const text = String(value || "").replace(/\r\n?/g, "\n").trim();
    if (text.length > most) throw "The " + what + " is too long: " + most + " characters at most.";
    return text;
}

function Code(value) {
    const code = String(value || "").trim();
    // what would break the link it goes in (a ruler's name in it has its spaces as %20)
    if (!code || code.length > LIMITS.code || /[\s<>"&?#]/.test(code)) throw "That isn't a Faction Creator build code.";
    return code;
}

// the tags picked that are TAGS, in its spelling and order, whatever their case ("PVP" is PvP)
function Tags(value) {
    const picked = String(value || "").split(",").map((t) => t.trim().toLowerCase());
    return TAGS.filter((t) => picked.includes(t.toLowerCase()));
}
