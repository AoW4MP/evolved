// What the Spells pages share (Strategic, Tactical, Transformations, Enchantments, Siege Projects), and Search's spell and
// siege cards. Everything comes from Data/GEN/SpellBook.json, which aow4_diff_tools/spells.py generates from the game and
// the mod. Style/spellbook.css and Data/worldmap.js go with it.

const SB_AFFINITIES = { Order: "empireorder", Chaos: "empirechaos", Nature: "empirenature", Materium: "empirematter", Astral: "empirearcana", Shadow: "empireshadow" };
// where a spell's source is listed
const SB_SOURCE_PAGE = {
    "Ancient Wonder": (s) => "AncientWonders.html" + (s.tab ? "?type=" + s.tab + "&" : ""),
    Landmark: () => "Landmarks.html",
    "Cosmic Happening": (s) => "CosmicHappenings.html" + (s.tab ? "?type=" + s.tab + "&" : ""),
    Artifact: () => "Artifacts.html",
    "Secret Spell": () => "Artifacts.html",
    "Hero Skill": () => "HeroSkillsList.html",
    "City Structure": () => "CityTrees.html"
};

async function SbLoad() {
    return jsonSpellBook;
}

function SbAmounts(rows) {
    return rows.map(([amount, icon]) => amount + " <" + icon + "></" + icon + ">").join(" ");
}

function SbSource(s) {
    if (s.kind === "Tome") {
        const icons = (s.affinities || []).map((a) => "<" + SB_AFFINITIES[a] + "></" + SB_AFFINITIES[a] + ">").join("");
        return (
            '<a class="sb-tome" href="/evolved/HTML/Spells.html?tome=' + s.id + '" target="_blank">' +
            '<img src="/evolved/Icons/TomeIcons/' + s.icon + '.png" alt="" /><span>' + s.name + "</span></a>" +
            (s.tier ? '<span class="sb-tome-tier">Tier ' + romanize(s.tier) + "</span>" : "") +
            icons
        );
    }
    const label = s.kind === s.name || s.kind === "Magic Victory" || s.kind === "Secret Spell" ? s.name : s.kind + ": " + s.name;
    const page = SB_SOURCE_PAGE[s.kind];
    return page ? '<a href="/evolved/HTML/' + page(s) + '" target="_blank">' + label + "</a>" : "<span>" + label + "</span>";
}

function SbCard(e, type, icon) {
    const card = WmElement("div", "sb-card");
    const head = WmElement("div", "sb-head");
    head.innerHTML =
        '<img src="' + icon + '" alt="" onerror="this.remove()" />' +
        '<div class="sb-names"><div class="sb-name">' + e.name + (e.variant ? ' <span class="sb-variant">' + e.variant + "</span>" : "") + "</div>" +
        '<div class="sb-type">' + type + (e.tier ? " · Tier " + romanize(e.tier) : "") + "</div></div>";
    if (e.dlc) head.append(AddDLCTag(e.dlc));
    card.append(head);
    card.append(WmElement("div", "sb-text", WmMarkup((e.description || "").replaceAll("<bulletlist></bullet>", "<bulletlist>"))));
    return card;
}

function SbFoot(e, facts) {
    const foot = WmElement("div", "sb-foot");
    if (e.sources.length) foot.append(WmElement("div", "sb-sources", WmMarkup(e.sources.map((s) => '<div class="sb-source">' + SbSource(s) + "</div>").join(""))));
    foot.append(WmElement("div", "sb-costs", WmMarkup(facts.map((f) => "<span>" + f + "</span>").join(""))));
    return foot;
}

function SbSpellCard(s) {
    const card = SbCard(s, s.type, "/evolved/Icons/" + s.icon);
    if (s.requisites.length) {
        const part = WmElement("div", "wm-part", '<div class="wm-label">Affected Unit Types</div>');
        part.append(WmElement("div", "sb-chips", s.requisites.map((r) => "<span>" + WmMarkup(r) + "</span>").join("")));
        card.append(part);
    }
    if (s.units.length) {
        const label = s.type.includes("Summon") ? "Summons" : "Units";
        // a long list folds away, or it stretches the row of cards it is on
        const part = s.units.length > 6
            ? WmElement("details", "wm-story", "<summary>" + label + " (" + s.units.length + ")</summary>")
            : WmElement("div", "wm-part", '<div class="wm-label">' + label + "</div>");
        part.append(WmUnits(s.units));
        card.append(part);
    }
    const chances = SpellSpawnChances(s.id);
    if (chances) {
        const details = WmElement("details", "wm-story sb-chances", "<summary>Spawn chances</summary>");
        details.append(...chances);
        card.append(details);
    }
    const facts = [];
    if (s.cost.length) facts.push("<b>Cost</b> " + SbAmounts(s.cost));
    if (s.op) facts.push(s.op + (s.tactical ? " <casttactical></casttactical>" : " <caststrategic></caststrategic>"));
    if (s.upkeep.length) facts.push("<b>Upkeep</b> " + SbAmounts(s.upkeep));
    card.append(SbFoot(s, facts));
    return card;
}

function SbSiegeCard(p) {
    const card = SbCard(p, "<garrison></garrison> Siege Project", "/evolved/Icons/SiegeProjectIcons/" + p.icon);
    const facts = [];
    if (p.damage) facts.push("<b>Fortification Damage</b> +" + p.damage + " <siegehealthdamage></siegehealthdamage>");
    facts.push(p.cost.length ? "<b>Cost</b> " + SbAmounts(p.cost) : "<b>No cost</b>");
    card.append(SbFoot(p, facts));
    return card;
}

// a tome's other unlocks, in the same cards
function SbUnitCard(skill) {
    const unit = findBy(jsonUnits, "id", skill.unit_slug);
    const loc = findBy(jsonUnitsLocalized, "resid", unit.resid);
    const card = SbCard({ name: loc.name, description: skill.description }, "<unit></unit> " + skill.type, "/evolved/Icons/UnitUnlockIcons/" + skill.unit_slug + ".png");
    const dragons = ["young_fire_dragon", "young_frost_dragon", "young_obsidian_dragon", "young_golden_dragon"];
    const part = WmElement("div", "wm-part");
    part.append(WmUnits(skill.name === "Young Dragon" ? dragons : [skill.unit_slug]));
    card.append(part);
    card.append(SbFoot({ sources: [] }, ["<b>Recruit Cost</b> " + GetCostUnit(skill.unit_slug)]));
    return card;
}

function SbStructureCard(skill) {
    const structure = jsonStructureUpgrades.find((s) => s.id === skill.upgrade_slug && (s.description || s.prediction_description));
    if (!structure) return null;
    const loc = findBy(jsonStructureUpgradesLocalized, "resid", structure.resid);
    const type = "<structure></structure> " + (loc.is_sector_upgrade ? "Province Improvement" : "City Structure");
    const card = SbCard({ name: loc.name.replace(/<br>/g, ""), description: StructureDescription(loc) }, type, "/evolved/Icons/UpgradeIcons/" + loc.icon + ".png");
    card.querySelector(".sb-text").insertAdjacentHTML("beforeend", StructureHelp(loc));
    const unlocks = jsonStructurePredictions?.units?.[String(structure.resid)];
    if (unlocks) {
        const part = WmElement("div", "wm-part", '<div class="wm-label">Unlocks</div>');
        part.append(WmUnits(unlocks));
        card.append(part);
    }
    if (loc.requirement_description) card.append(WmElement("div", "wm-part", '<div class="wm-label">Requires</div>' + WmMarkup(AsBulletList(loc.requirement_description))));
    card.append(SbFoot({ sources: [] }, ["<b>Build Cost</b> " + loc.cost]));
    return card;
}

// all a tome unlocks, in its own order, by what the game says comes from it: which of a spell's versions, and what its
// skills have no link to. On its page the tome, its tier and its DLC are said already
function SbTomeCards(tome) {
    const fromTome = (e) => e.sources.some((s) => s.kind === "Tome" && s.id === tome.id);
    const spells = jsonSpellBook.spells.filter(fromTome);
    const siege = jsonSpellBook.siege.filter(fromTome);
    const shown = new Set();
    const cards = [];
    const add = (list, makeCard) => {
        for (const e of list) {
            if (shown.has(e)) continue;
            shown.add(e);
            cards.push(makeCard({ ...e, tier: null, dlc: null, sources: [] }));
        }
    };
    for (const skill of tome.skills || []) {
        const named = (e) => e.id === skill.spell_slug || e.id === skill.siege_project_slug || e.name === skill.name;
        if (skill.unit_slug) cards.push(SbUnitCard(skill));
        else if (skill.upgrade_slug) {
            const card = SbStructureCard(skill);
            if (card) cards.push(card);
        } else if (siege.some(named)) add(siege.filter(named), SbSiegeCard);
        else if (spells.some(named)) add(spells.filter(named), SbSpellCard);
        else if (!jsonSpellBook.left_out.some((e) => e.name === skill.name)) {
            const type = skill.type.includes("Empire Bonus") ? "<empire></empire> Empire Bonus" : skill.type;
            cards.push(SbCard({ name: skill.name, description: skill.description }, type, "/evolved/Icons/ExtraIcons/" + skill.name.replaceAll(" ", "_").toLowerCase() + ".png"));
        }
    }
    add(spells, SbSpellCard);
    add(siege, SbSiegeCard);
    return cards;
}

// a spell's or siege project's own page
function SbShowCards(cards, divID) {
    const grid = WmElement("div", "sb-cards" + (cards.length === 1 ? " sb-single" : ""));
    grid.append(...cards);
    document.getElementById(divID).append(grid);
}

// a spell's place in a tab sorted by tier
function SbGroup(e) {
    if (e.tier) return { rank: e.tier, name: "Tier " + romanize(e.tier) + " Tomes" };
    return e.sources.some((s) => s.kind === "Tome") ? { rank: 10, name: "Culture and special tomes" } : { rank: 11, name: "Not from a tome" };
}

function SbCost(e) {
    return e.cost.reduce((sum, [amount]) => sum + amount, 0);
}

// tabs: [[id, label (HTML)]]. tabsOf: the tabs a thing is on. A thing on two tabs has a card on each. The search and the
// affinity buttons work across all tabs, whose counts follow
function SbBoard(tabs, items, tabsOf, makeCard, { affinity = true } = {}) {
    const cards = [];
    const panels = {};
    const entries = tabs.map(([id, label]) => {
        const here = items.filter((e) => tabsOf(e).includes(id));
        const panel = WmElement("div", "sb-panel");
        panels[id] = panel;
        for (const e of here) {
            const card = makeCard(e);
            const words = (e.name + " " + card.textContent).toLowerCase();
            cards.push({ e, id, card, words });
        }
        return { id, label, count: here.length, panel };
    });

    const wanted = { words: "", affinity: null, sort: "tier" };
    const order = {
        tier: (a, b) => SbGroup(a.e).rank - SbGroup(b.e).rank || a.e.name.localeCompare(b.e.name),
        name: (a, b) => a.e.name.localeCompare(b.e.name),
        cost: (a, b) => SbCost(a.e) - SbCost(b.e) || a.e.name.localeCompare(b.e.name)
    };

    function Lay() {
        for (const [id, panel] of Object.entries(panels)) {
            panel.replaceChildren();
            const here = cards.filter((c) => c.id === id && c.shown).sort(order[wanted.sort]);
            const groups = new Map();
            for (const c of here) {
                const name = wanted.sort === "tier" ? SbGroup(c.e).name : "";
                if (!groups.has(name)) groups.set(name, []);
                groups.get(name).push(c.card);
            }
            for (const [name, list] of groups) {
                if (name && groups.size > 1) panel.append(WmElement("div", "wm-group", name));
                const grid = WmElement("div", "sb-cards");
                grid.append(...list);
                panel.append(grid);
            }
            if (!here.length) panel.append(WmElement("div", "sb-none", "Nothing here matches."));
        }
    }

    function Refilter() {
        const left = {};
        for (const c of cards) {
            c.shown = (!wanted.words || c.words.includes(wanted.words)) && (!wanted.affinity || (c.e.affinities || []).includes(wanted.affinity));
            if (c.shown) left[c.id] = (left[c.id] || 0) + 1;
        }
        document.querySelectorAll(".wm-tab").forEach((t) => (t.querySelector("span").textContent = left[t.dataset.id] || 0));
        Lay();
    }

    for (const c of cards) c.shown = true;
    Lay();
    WmTabs(entries);

    document.getElementById("filterInput").addEventListener("input", (event) => {
        wanted.words = event.target.value.trim().toLowerCase();
        Refilter();
    });
    const affinities = document.getElementById("affinities");
    if (affinity) {
        for (const [name, icon] of Object.entries(SB_AFFINITIES)) {
            const button = WmElement("button", "wm-choice", "<" + icon + "></" + icon + ">");
            button.title = name;
            button.onclick = () => {
                wanted.affinity = wanted.affinity === name ? null : name;
                affinities.querySelectorAll(".wm-choice").forEach((b) => b.classList.toggle("selected", b === button && wanted.affinity === name));
                Refilter();
            };
            affinities.append(button);
        }
    } else {
        affinities.remove();
    }
    const sorts = document.getElementById("sorts");
    for (const [id, label] of [["tier", "Tier"], ["name", "Name"], ["cost", "Cost"]]) {
        const button = WmElement("button", "wm-sort" + (id === wanted.sort ? " selected" : ""), label);
        button.onclick = () => {
            wanted.sort = id;
            sorts.querySelectorAll(".wm-sort").forEach((b) => b.classList.toggle("selected", b === button));
            Lay();
        };
        sorts.append(button);
    }
}
