// Evolved's Builds List: the faction builds people publish from the Faction Creator, kept in a Google Sheet behind a
// Google Apps Script web app (Server/builds.gs; EVOLVED.md, "Builds List", has how to set it up). HTML/FactionList.html
// lists them (BdListPage), HTML/FactionCreator.html publishes and opens them (BdPublishPanel, BdOpenBuild).
// Style/builds.css goes with it.

// the web app's address (…/exec), deployed 2026-11-19; empty, the list and the publish form say the list isn't open
const BD_API = "https://script.google.com/macros/s/AKfycbzU2TMnODTRyjqaGosINF7qGdiV0xZa5D3WSrqtd-YpVI7AS6jkD2D9AsLdVC_rmX82yA/exec";
// the tags a build can have, as Server/builds.gs keeps them
const BD_TAGS = ["Roleplay", "Theme", "PvP", "Casual", "Hardcore"];
// the edit key is hashed with this in front, as Server/builds.gs does (Owner)
const BD_OWNER_SALT = "evolved-builds:";

// ------------------------------------------------------------------------------------------------------------- the store

// the game version the site shows, as the top strip names it: header.html's data-dataset ("Silver Seas")
function BdDataset() {
    return document.querySelector(".hud-facts [data-dataset]")?.dataset.dataset || "";
}

// the hash the store keeps of an edit key, as Server/builds.gs makes it
async function BdOwner(key) {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(BD_OWNER_SALT + key));
    return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

let bdMine = null;
function BdMine() {
    return (bdMine ??= BdOwner(getOrCreateUserEditKey()));
}

// a call to the store: list is a GET, the rest POSTs (a form's body, so the browser asks nothing first). Throws the
// store's own words when it refuses
async function BdCall(action, params = {}) {
    if (!BD_API) throw new Error("The Builds List isn't set up yet.");
    let response;
    try {
        response =
            action === "list"
                ? await fetch(BD_API + "?action=list")
                : await fetch(BD_API, { method: "POST", body: new URLSearchParams({ action, ...params }) });
    } catch {
        throw new Error("The Builds List can't be reached right now. Try again in a moment.");
    }
    let out;
    try {
        out = await response.json();
    } catch {
        throw new Error("The Builds List gave an answer the site can't read.");
    }
    if (!out.ok) throw new Error(out.error || "The Builds List refused that.");
    return out;
}

// a link that opens a build in the Faction Creator; with its id, the creator shows its name, notes and tags
function BdLink(code, id) {
    return "/evolved/HTML/FactionCreator.html?u=" + code + (id ? "&b=" + encodeURIComponent(id) : "");
}

// ------------------------------------------------------------------------------------------------------------- a build

// what a Faction Creator code holds (GenerateQuickLink in Faction.js writes it, reversLookUp reads it into the creator):
// its parts are comma separated, a part's entries colon separated, each entry its place in BuilderLookup.json in hex.
//   0 form traits ("F": none)   1, 2 society traits (and a Vision's reading)   3 form   4 culture (and subculture)
//   5 ruler type   6 dragon type, clan or bloodline ("s": none)   7 tomes, in order   8 extra affinity points
//   9 class   10 ascension ("a")   11 highlights ("h")   12 ruler's and race's names ("n", "r")   13 ambition ("am")
function BdDecode(code) {
    const parts = code.split(",");
    const id = (hex) => jsonBuilderLookUp[parseInt(hex, 16)]?.id;
    const find = (hex, list) => {
        const wanted = id(hex);
        return wanted ? list.find((x) => x.id === wanted) : undefined;
    };
    const traits = parts[0] && parts[0] !== "F" ? parts[0].split(":").map((h) => find(h, jsonFactionCreation2)).filter(Boolean) : [];
    const [society1, vision1] = (parts[1] || "").split(":");
    const [society2, vision2] = (parts[2] || "").split(":");
    const [cultureCode, subcultureCode] = (parts[4] || "").split(":");
    let culture = find(cultureCode, jsonFactionCreation);
    let subculture = subcultureCode ? find(subcultureCode, jsonFactionCreation) : undefined;
    // an old code names the subculture alone
    if (culture?.type === "SubCulture") {
        subculture = culture;
        culture = jsonFactionCreation.find((x) => x.type === "Culture" && x.name === subculture.requirement);
    }
    const origin = find(parts[5], jsonFactionCreation);
    const subtype = parts[6] && parts[6] !== "s" ? find(parts[6], jsonFactionCreation) : undefined;
    let heroClass = parts[9] && parts[9] !== "s" ? find(parts[9], jsonFactionCreation) : undefined;
    // an old code has the starting weapon where the dragon type is, and no class
    if (!heroClass && subtype && !/Dragon|Giant|Vampire/.test(subtype.name)) {
        heroClass = jsonFactionCreation.find((x) => x.type === "Class" && x.name === GetClassFromWeaponId(subtype.id));
    }
    const extras = (parts[8] || "").split("").map(Number);
    const [ruler, race] = (parts[12] || "").split(":");
    const word = (w, none) => {
        if (!w || w === none) return "";
        try {
            return decodeURIComponent(w);
        } catch {
            return w.replaceAll("%20", " ");
        }
    };
    const build = {
        traits,
        society1: find(society1, jsonFactionCreation2),
        vision1: vision1 ? find(vision1, jsonFactionCreation) : undefined,
        society2: find(society2, jsonFactionCreation2),
        vision2: vision2 ? find(vision2, jsonFactionCreation) : undefined,
        form: find(parts[3], jsonFactionCreation),
        culture,
        subculture,
        origin,
        subtype: subtype && /Dragon|Giant|Vampire/.test(subtype.name) ? subtype : undefined,
        tomes: (parts[7] || "").split(":").filter(Boolean).map((h) => find(h, jsonTomes)).filter(Boolean),
        heroClass,
        ascension: parts[10] && parts[10] !== "a" ? find(parts[10], jsonHeroSkills) : undefined,
        ambition: parts[13] && parts[13] !== "am" ? find(parts[13], jsonHeroAmbitions) : undefined,
        rulerName: word(ruler, "n"),
        raceName: word(race, "r")
    };
    if (!build.origin || !build.culture || !build.form) return null;
    build.affinities = BdAffinities(build, extras);
    return build;
}

// a build's affinity points as the Faction Creator counts them (GetAffinityTotalFromList), its extra points added:
// [{name, tag, empire, amount}], the most first
function BdAffinities(build, extras) {
    const total = GetAffinityTotalFromList([build.culture, build.society1, build.society2], build.tomes, build.subtype, build.subculture, build.vision1, build.vision2);
    const amounts = {};
    for (const [, tag, amount] of total.matchAll(/<(empire\w+)><\/\1>\s*(\d+)/g)) amounts[tag] = Number(amount);
    // the code's extra points: Astral, Chaos, Materium, Nature, Order, Shadow
    ["empirearcana", "empirechaos", "empirematter", "empirenature", "empireorder", "empireshadow"].forEach((tag, i) => {
        if (extras[i] > 0) amounts[tag] = (amounts[tag] || 0) + extras[i];
    });
    return EM_AFFINITIES.map(([name, tag, empire]) => ({ name, tag, empire, amount: amounts[empire] || 0 }))
        .filter((a) => a.amount > 0)
        .sort((a, b) => b.amount - a.amount);
}

// a build's main affinities: its most, and those as many or one fewer
function BdMainAffinities(build) {
    const most = build.affinities[0]?.amount || 0;
    return build.affinities.filter((a) => a.amount >= most - 1).map((a) => a.name);
}

// the DLCs a build needs
function BdDlcs(build) {
    const things = [build.origin, build.subtype, build.form, build.culture, build.subculture, build.society1, build.society2, build.heroClass, ...build.traits, ...build.tomes];
    return [...new Set(things.map((x) => (x?.DLC || "").replaceAll(" ", "")).filter((d) => d && dlcMap[d]))];
}

// a build's name when its maker gave it none: its culture, form and class ("Dark Elfkin Warlock")
function BdGeneratedName(build) {
    return [build.culture.name, build.form.name, build.heroClass?.name].filter(Boolean).join(" ");
}

// a build's tags in BD_TAGS' spelling, whatever the store has ("PVP", before the store spelled it PvP)
function BdTags(tags) {
    return BD_TAGS.filter((t) => tags.some((x) => x.toLowerCase() === t.toLowerCase()));
}

// a published build for the list: the store's build, what its code holds, whether it is the visitor's
function BdModel(b, mine) {
    const build = BdDecode(b.code);
    return {
        ...b,
        tags: BdTags(b.tags),
        build,
        title: b.name || (build ? BdGeneratedName(build) : "A build"),
        // WmBoard searches a thing's name and its card's text
        name: b.name,
        mine: b.owner === mine,
        current: b.dataset === BdDataset(),
        time: Date.parse(b.updated || b.created) || 0
    };
}

// ------------------------------------------------------------------------------------------------------------- its card

// plain text of a maker's notes, as the page shows it: lines kept, **bold**, a line starting with "# " a heading, and
// [hp] the game's icon of that name (only an icon tag: a name the browser doesn't know as an element). Not the site's
// markup, which links words: "Tome of Zeal" would link the Zeal status effect
function BdNotes(text) {
    const escape = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    const lines = String(text || "").split("\n").map((line) => {
        let html = escape(line)
            .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
            .replace(/\[([a-zA-Z][a-zA-Z0-9_]*)\]/g, (whole, tag) => (BdIconTag(tag) ? "<" + tag + "></" + tag + ">" : whole));
        if (/^#\s/.test(line)) return '<div class="bd-notes-head">' + html.replace(/^#\s+/, "") + "</div>";
        return "<div>" + (html || "<br>") + "</div>";
    });
    return lines.join("");
}

function BdIconTag(tag) {
    return document.createElement(tag) instanceof HTMLUnknownElement && tag.toLowerCase() !== "hyperlink";
}

// a thing of a build: its icon, its card on hover (made when first wanted), or its name and type
function BdThing(icon, card, { big } = {}) {
    const thing = WmElement("span", "bd-thing" + (big ? " bd-big" : ""), '<img src="' + icon + '" alt="" onerror="this.remove()" />');
    const tip = document.createElement("span");
    thing.addEventListener("mouseenter", () => tip.firstChild || tip.append(card()), true);
    addTooltipListeners(thing, tip);
    return thing;
}

// a small card for what has no card of its own on the site's pages (a tome, a form, a subculture, a dragon type)
function BdSmallCard(name, type, icon, text) {
    const card = HbCard(name, type, icon, { description: text || "" });
    card.classList.add("bd-tip");
    return card;
}

let bdEmTraits = null;
let bdEmRulers = null;
let bdEmCultures = null;
function BdTraitCard(t) {
    const e = (bdEmTraits ??= EmTraits()).find((x) => x.id === t.id);
    return e ? EmTraitCard(e) : BdSmallCard(t.name, "Trait", "/evolved/Icons/FactionCreation/" + t.id + ".png");
}
function BdRulerCard(o) {
    const e = (bdEmRulers ??= EmRulerTypes()).find((x) => x.id === o.id);
    return e ? EmRulerCard(e) : BdSmallCard(o.name, "Ruler Type", "/evolved/Icons/FactionCreation/" + o.icon + ".png");
}
function BdCultureCard(c) {
    const e = (bdEmCultures ??= EmCultures()).find((x) => x.id === c.id);
    return e ? EmCultureCard(e) : BdSmallCard(c.name, "Culture", "/evolved/Icons/FactionCreation/" + c.icon + ".png");
}
function BdTomeCard(t) {
    const affinities = (t.affinities || "").match(/<empire\w+><\/empire\w+>/g) || [];
    const type = [...new Set(affinities)].join("") + " Tome" + (t.tier ? " · Tier " + romanize(Number(t.tier)) : "");
    return BdSmallCard(t.name, type, "/evolved/Icons/TomeIcons/" + t.icon + ".png", t.gameplay_description);
}

// the card of a published build
function BdCard(m, { onDelete } = {}) {
    const card = WmElement("div", "sb-card hb-card bd-card");
    const b = m.build;
    const head = WmElement("a", "sb-head bd-head");
    head.href = BdLink(m.code, m.id);
    // the culture's emblem: the ruler types' portraits are dark scenes, alike at this size
    const portrait = b ? "/evolved/Icons/FactionCreation/" + b.culture.icon + ".png" : "/evolved/Icons/Interface/TitleIcons/FactionTraits.png";
    const type = b ? [b.subtype?.name || b.origin.name, b.form.name, b.culture.name].join(" · ") : "This build's code can't be read any more";
    head.innerHTML =
        '<img src="' + portrait + '" alt="" onerror="this.remove()" />' +
        '<div class="sb-names"><div class="sb-name"></div><div class="sb-type"></div></div>';
    head.querySelector(".sb-name").textContent = m.title;
    head.querySelector(".sb-type").textContent = type;
    card.append(head);
    if (b) {
        const dlcs = BdDlcs(b);
        if (dlcs.length) {
            const tags = WmElement("div", "bd-dlcs");
            for (const d of dlcs) tags.append(AddDLCTag(d));
            head.append(tags);
        }
        if (b.affinities.length) {
            card.append(WmElement("div", "bd-affinities", WmMarkup(b.affinities.map((a) => '<span title="' + a.name + ' Affinity">' + EmIcon(a.tag) + a.amount + "</span>").join(""))));
        }
        const row = (label, things) => {
            const list = things.filter(Boolean);
            if (!list.length) return;
            const part = WmElement("div", "bd-row", '<div class="wm-label">' + label + "</div>");
            const holder = WmElement("div", "bd-things");
            holder.append(...list);
            part.append(holder);
            card.append(part);
        };
        const pic = (folder, name) => "/evolved/Icons/" + folder + "/" + name + ".png";
        row("Ruler", [
            BdThing(pic("FactionCreation", b.origin.icon), () => BdRulerCard(b.origin), { big: true }),
            b.subtype && BdThing(pic("FactionCreation", b.subtype.icon || b.subtype.id), () => BdSmallCard(b.subtype.name, b.origin.name, pic("FactionCreation", b.subtype.icon || b.subtype.id), EmText(b.subtype.extraLookup)?.description)),
            b.heroClass && BdHeroClass(b.heroClass),
            b.ascension && BdThing(pic("UnitIcons", b.ascension.icon), () => HbSkillCard({ ...b.ascension, kind: "Ascension", from: [] })),
            b.ambition && BdThing(pic("AmbitionIcons", b.ambition.icon), () => HbAmbitionCard(b.ambition))
        ]);
        row("Race", [
            BdThing(pic("FactionCreation", b.form.icon || b.form.id), () => BdSmallCard(b.form.name, "Form", pic("FactionCreation", b.form.icon || b.form.id), EmText(b.form.extraLookup)?.description || b.form.description), { big: true }),
            ...b.traits.map((t) => BdThing(pic("TraitIcons", t.icon), () => BdTraitCard(t)))
        ]);
        row("Culture", [
            BdThing(pic("FactionCreation", b.culture.icon), () => BdCultureCard(b.culture), { big: true }),
            b.subculture && BdThing(pic("FactionCreation", b.subculture.icon || b.subculture.id), () => BdSmallCard(b.subculture.name, "Subculture", pic("FactionCreation", b.subculture.icon || b.subculture.id), EmText(b.subculture.extraLookup)?.description || b.subculture.description)),
            ...[b.society1, b.society2].filter(Boolean).map((t) => BdThing(pic("TraitIcons", t.icon), () => BdTraitCard(t)))
        ]);
        row("Tomes", b.tomes.map((t) => BdThing(pic("TomeIcons", t.icon), () => BdTomeCard(t))));
        if (b.rulerName || b.raceName) {
            const names = WmElement("div", "bd-names");
            names.textContent = [b.rulerName, b.raceName].filter(Boolean).join(" of the ");
            card.append(names);
        }
    }
    if (m.tags.length) card.append(WmElement("div", "sb-chips bd-tags", m.tags.map((t) => "<span>" + t + "</span>").join("")));
    if (m.notes) {
        const notes = WmElement("details", "bd-notes", "<summary>Notes</summary>");
        notes.append(WmElement("div", "bd-notes-text", BdNotes(m.notes)));
        card.append(notes);
        // folded, so its words are searched by these
        card.dataset.search = m.notes;
    }
    const when = new Date(m.time).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    const foot = HbFoot(m.dataset + " · " + when, [m.views + (m.views === 1 ? " view" : " views")]);
    if (m.mine && onDelete) {
        const own = WmElement("div", "bd-own");
        const edit = WmElement("a", "wm-sort", "Edit");
        edit.href = BdLink(m.code, m.id);
        const del = WmElement("button", "wm-sort", "Delete");
        del.onclick = () => onDelete(m, del);
        own.append(edit, del);
        foot.querySelector(".sb-sources").append(own);
    }
    card.append(foot);
    return card;
}

function BdHeroClass(c) {
    const tag = HB_CLASSES.find(([n]) => n === c.name)?.[1];
    const thing = WmElement("span", "bd-thing bd-class", tag ? "<" + tag + "></" + tag + ">" : c.name);
    const tip = document.createElement("span");
    tip.innerHTML = c.name + " Class";
    addTooltipListeners(thing, tip);
    return thing;
}

// ------------------------------------------------------------------------------------------------------------- the edit key

// the visitor's edit key: what it is for, and showing, copying, saving and replacing it (settings.js keeps it)
function BdKeyPanel(holder) {
    const panel = WmElement(
        "details",
        "bd-key",
        "<summary>Your edit key</summary>" +
            '<div class="bd-key-text">Your builds are published with this key, which this browser keeps. With it you can edit and delete them, ' +
            "here or in another browser. Save it somewhere: if this browser's data is cleared, it is gone.</div>"
    );
    const row = WmElement("div", "bd-key-row");
    const shown = WmElement("code", "bd-key-value", "••••••••-••••-••••-••••-••••••••••••");
    let visible = false;
    const show = WmElement("button", "wm-sort", "Show");
    show.onclick = () => {
        visible = !visible;
        shown.textContent = visible ? getOrCreateUserEditKey() : "••••••••-••••-••••-••••-••••••••••••";
        show.textContent = visible ? "Hide" : "Show";
    };
    const copy = WmElement("button", "wm-sort", "Copy");
    copy.onclick = () => navigator.clipboard.writeText(getOrCreateUserEditKey()).then(() => (copy.textContent = "Copied"));
    const save = WmElement("button", "wm-sort", "Save to a file");
    save.onclick = downloadEditKeyFile;
    row.append(shown, show, copy, save);
    panel.append(row);
    const other = WmElement("div", "bd-key-row");
    const input = WmElement("input", "wm-search bd-key-input");
    input.placeholder = "Paste a key you saved before";
    const use = WmElement("button", "wm-sort", "Use this key");
    use.onclick = () => {
        const key = input.value.trim();
        if (key.length < 8) return BdSay(panel, "That key is too short to be an edit key.", true);
        localStorage.setItem("editKey", key);
        bdMine = null;
        BdSay(panel, "This browser now uses that key.");
        panel.dispatchEvent(new CustomEvent("bd-key"));
    };
    other.append(input, use);
    panel.append(other);
    holder.append(panel);
    return panel;
}

// a message under a part of the page (the same element again replaces it)
function BdSay(holder, text, bad) {
    let say = holder.querySelector(":scope > .bd-say");
    if (!say) holder.append((say = WmElement("div", "bd-say")));
    say.classList.toggle("bd-bad", !!bad);
    say.textContent = text;
    return say;
}

// ------------------------------------------------------------------------------------------------------------- the list page

const BD_RULERS = ["champion", "wizard_king", "dragon_lord", "eldritch_sovereign", "giant_king", "elder_vampire"];

async function BdListPage() {
    const panels = document.getElementById("panels");
    const key = BdKeyPanel(document.getElementById("buildTools"));
    const dataset = BdDataset();
    // a sentence to a line, centred; the older versions' a remark of its own
    const intro = document.getElementById("intro");
    intro.append(
        WmElement("div", "", "Factions made by the players of the Evolved mod and published from the Faction Creator."),
        WmElement("div", "", "A build opens in the creator, where it can be changed and published as a build of your own.")
    );
    if (dataset) {
        intro.append(WmElement("div", "bd-remark", "A build made on an older version of the game is under Older Versions: it may not be what the game has now."));
    }
    if (!BD_API) {
        document.querySelector(".wm-filters").hidden = true;
        panels.append(WmElement("div", "bd-message", "The Builds List isn't open yet: publishing and listing builds come soon."));
        return;
    }
    const loading = panels.appendChild(WmElement("div", "bd-message", "Loading the builds…"));
    let builds;
    try {
        builds = (await BdCall("list")).builds;
    } catch (err) {
        loading.textContent = err.message;
        return;
    }
    loading.remove();
    const mine = await BdMine();
    const models = builds.map((b) => BdModel(b, mine));
    BdBoard(models);
    key.addEventListener("bd-key", async () => {
        const now = await BdMine();
        for (const m of models) m.mine = m.owner === now;
        BdBoard(models);
    });
}

// the list's board: Builds of this dataset, the visitor's own, and those of older ones, with their buttons and sorts. Made
// again when one is deleted (the holders are emptied, the search bar made anew, so it holds no listener twice)
function BdBoard(models) {
    for (const id of ["tabs", "panels", "affinities", "rulers", "cultures", "tags", "sorts"]) document.getElementById(id).replaceChildren();
    const old = document.getElementById("filterInput");
    const input = old.cloneNode();
    old.replaceWith(input);
    const dataset = BdDataset();
    const dlc = dataset.replaceAll(" ", "").toUpperCase();
    const tabs = [["current", (dlcMap[dlc] ? "<" + dlc + "></" + dlc + "> " : "") + (dataset || "This Version")], ["mine", "<favourite></favourite> My Builds"]];
    if (models.some((m) => !m.current)) tabs.push(["older", "<turn></turn> Older Versions"]);
    const cultures = jsonFactionCreation.filter((e) => e.type === "Culture").sort((a, b) => a.name.localeCompare(b.name));
    const rulers = BD_RULERS.map((id) => jsonFactionCreation.find((e) => e.id === id)).filter(Boolean);
    const byName = (a, b) => a.title.localeCompare(b.title);
    const onDelete = async (m, button) => {
        if (!confirm('Delete "' + m.title + '" from the Builds List? This can\'t be undone.')) return;
        button.disabled = true;
        try {
            await BdCall("delete", { key: getOrCreateUserEditKey(), id: m.id });
            models.splice(models.indexOf(m), 1);
            BdBoard(models);
        } catch (err) {
            button.disabled = false;
            alert(err.message);
        }
    };
    WmBoard(tabs, models, {
        tabsOf: (m) => [m.current ? "current" : "older", ...(m.mine ? ["mine"] : [])],
        makeCard: (m) => BdCard(m, { onDelete }),
        choices: [
            {
                holder: "affinities",
                buttons: EM_AFFINITIES.map(([name, tag]) => ({ label: EmIcon(tag), title: "Mostly " + name, test: (m) => !!m.build && BdMainAffinities(m.build).includes(name) }))
            },
            {
                holder: "rulers",
                buttons: rulers.map((o) => ({
                    label: '<img src="/evolved/Icons/FactionCreation/' + o.icon + '.png" alt="" />',
                    title: o.name,
                    test: (m) => m.build?.origin.id === o.id
                }))
            },
            {
                holder: "cultures",
                buttons: cultures.map((c) => ({
                    label: '<img src="/evolved/Icons/Interface/DropdownIcons/' + c.id + '.png" alt="" />',
                    title: c.name,
                    test: (m) => m.build?.culture.id === c.id
                }))
            },
            { holder: "tags", buttons: BD_TAGS.map((t) => ({ label: t, title: t, text: true, test: (m) => m.tags.includes(t) })) }
        ],
        sorts: [
            { id: "new", label: "Newest", order: (a, b) => b.time - a.time || byName(a, b), group: (m) => (m.current ? null : { name: m.dataset || "Unknown version" }) },
            { id: "views", label: "Most Viewed", order: (a, b) => b.views - a.views || b.time - a.time },
            { id: "name", label: "Name", order: byName }
        ]
    });
    for (const panel of document.getElementById("panels").children) {
        const none = panel.querySelector(".sb-none");
        if (none && !models.length) none.textContent = "No builds yet: make one in the Faction Creator and publish it.";
    }
}

// ------------------------------------------------------------------------------------------------------------- the Faction Creator

// the build the Faction Creator opened from the list (?b=<id>): the store's build, and whether it is the visitor's
let bdOpened = null;

// the Faction Creator's publish form, under the creator: a name, tags, notes (with a preview), the edit key, and
// Publish, or Save Changes when the build opened is the visitor's
function BdPublishPanel(holder) {
    const panel = WmElement("div", "bd-publish");
    panel.innerHTML =
        '<div class="bd-publish-title">Publish to the Builds List</div>' +
        '<div class="bd-publish-text">Share this faction with other players of the Evolved mod.</div>' +
        '<label class="bd-field"><span class="wm-label">Name</span><input id="bdName" class="wm-search" maxlength="80" placeholder="Leave empty to name it after its culture, class and ruler type" /></label>' +
        '<div class="bd-field"><span class="wm-label">Tags</span><div id="bdTags" class="wm-choices"></div></div>' +
        '<label class="bd-field"><span class="wm-label">Notes</span><textarea id="bdNotes" maxlength="5000" rows="6" placeholder="How to play it, what to pick first, what it beats... A line starting with # is a heading, **words** are bold, and [hp], [mana], [gold] and the like are the game\'s icons."></textarea></label>' +
        '<div class="bd-field bd-preview-field" hidden><span class="wm-label">Preview</span><div id="bdPreview" class="bd-notes-text"></div></div>' +
        '<div class="bd-actions"><button id="bdPublish" class="wm-sort selected">Publish</button><button id="bdSave" class="wm-sort" hidden>Save Changes</button></div>';
    holder.append(panel);
    const tags = panel.querySelector("#bdTags");
    for (const t of BD_TAGS) {
        const button = WmElement("button", "wm-choice wm-choice-text", t);
        button.onclick = () => button.classList.toggle("selected");
        tags.append(button);
    }
    const notes = panel.querySelector("#bdNotes");
    const preview = panel.querySelector("#bdPreview");
    notes.addEventListener("input", () => {
        preview.parentElement.hidden = !notes.value.trim();
        preview.innerHTML = BdNotes(notes.value);
    });
    BdKeyPanel(panel).addEventListener("bd-key", () => BdCheckOwner(panel));
    const publish = panel.querySelector("#bdPublish");
    const save = panel.querySelector("#bdSave");
    publish.onclick = () => BdSend(panel, "save");
    save.onclick = () => BdSend(panel, "edit");
    if (!BD_API) {
        publish.disabled = true;
        BdSay(panel, "The Builds List isn't open yet: publishing comes soon. Copy Share Link gives a link to this build meanwhile.");
    }
    return panel;
}

function BdFormValues(panel) {
    return {
        name: panel.querySelector("#bdName").value.trim(),
        tags: [...panel.querySelectorAll("#bdTags .selected")].map((b) => b.textContent).join(","),
        notes: panel.querySelector("#bdNotes").value
    };
}

async function BdSend(panel, action) {
    const buttons = panel.querySelectorAll(".bd-actions button");
    buttons.forEach((b) => (b.disabled = true));
    BdSay(panel, action === "save" ? "Publishing…" : "Saving…");
    try {
        const params = { key: getOrCreateUserEditKey(), dataset: BdDataset(), code: GenerateQuickLink(), ...BdFormValues(panel) };
        if (action === "edit") params.id = bdOpened.id;
        const { build } = await BdCall(action, params);
        bdOpened = { ...build, mine: true };
        history.replaceState(null, "", BdLink(build.code, build.id));
        BdCheckOwner(panel);
        BdShowOpened();
        const say = BdSay(panel, (action === "save" ? "Published. " : "Saved. ") + "It is in the Builds List: ");
        const link = WmElement("a", "", "see it there");
        link.href = "/evolved/HTML/FactionList.html?type=mine&";
        say.append(link, ".");
    } catch (err) {
        BdSay(panel, err.message, true);
    } finally {
        buttons.forEach((b) => (b.disabled = false));
    }
}

// Save Changes for the visitor's own build, Publish for a new one
async function BdCheckOwner(panel) {
    const mine = bdOpened && bdOpened.owner === (await BdMine());
    if (bdOpened) bdOpened.mine = mine;
    panel.querySelector("#bdSave").hidden = !mine;
    panel.querySelector("#bdPublish").textContent = mine ? "Publish as a New Build" : "Publish";
    panel.querySelector("#bdPublish").classList.toggle("selected", !mine);
    panel.querySelector("#bdSave").classList.toggle("selected", !!mine);
}

// a build opened from the list (?b=<id>): counts its view and shows its name, facts and notes above the creator. The
// visitor's own fills the form, to save changes to it; another's leaves it empty, as what they publish is their own
async function BdOpenBuild(panel) {
    const id = new URLSearchParams(location.search).get("b");
    if (!id || !BD_API) return;
    try {
        const { build } = await BdCall("view", { id });
        bdOpened = build;
    } catch (err) {
        BdSay(panel, err.message, true);
        return;
    }
    await BdCheckOwner(panel);
    if (bdOpened.mine) {
        panel.querySelector("#bdName").value = bdOpened.name;
        panel.querySelector("#bdNotes").value = bdOpened.notes;
        panel.querySelector("#bdNotes").dispatchEvent(new Event("input"));
        panel.querySelectorAll("#bdTags .wm-choice").forEach((b) => b.classList.toggle("selected", BdTags(bdOpened.tags).includes(b.textContent)));
    }
    BdShowOpened();
}

// the build the creator opened or last published, above it: name, facts, notes
function BdShowOpened() {
    const shown = document.getElementById("bdShown");
    if (!shown || !bdOpened) return;
    shown.hidden = false;
    shown.querySelector(".bd-shown-name").textContent = bdOpened.name || "A published build";
    const facts = [bdOpened.dataset, bdOpened.views + (bdOpened.views === 1 ? " view" : " views")];
    if (bdOpened.tags.length) facts.push(BdTags(bdOpened.tags).join(", "));
    if (bdOpened.mine) facts.push("yours");
    if (bdOpened.dataset !== BdDataset()) facts.push("made on an older version of the game");
    shown.querySelector(".bd-shown-facts").textContent = facts.join(" · ");
    const notes = shown.querySelector(".bd-notes-text");
    notes.innerHTML = BdNotes(bdOpened.notes);
    // folded (the Faction Creator's line), the fold goes when there are none
    (notes.closest("details") || notes).hidden = !bdOpened.notes;
}
