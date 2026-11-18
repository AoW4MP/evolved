// What the Abilities pages share (Active Abilities, Passives, Status Effects): the Spells pages' cards and board (SbCard,
// WmBoard), with the Heroes pages' cards for what gives an ability (Data/heroes.js). The abilities are the dump's
// (Data/EN/Abilities.json), with the 68 the game's texts link to that no unit has from the start
// (Data/GEN/LinkedAbilities.json, aow4_diff_tools/abilities.py); each the same thing once. Which are status effects, and
// what the game says of each (negative or positive, stacks, counters, dispellable), is Data/GEN/StatusEffects.json
// (aow4_diff_tools/statuseffects.py). Style/abilities.css, Data/worldmap.js, Data/spellbook.js and Data/heroes.js go with it.

// the damage an attack deals, by its icon tag in the dump, in the game's order
const AB_DAMAGE = [
    ["Physical", "damagephysical"],
    ["Fire", "damagefire"],
    ["Frost", "damagefrost"],
    ["Lightning", "damagelightning"],
    ["Spirit", "damagespirit"],
    ["Blight", "damageblight"]
];
// what an ability costs to use, by its icon tag in the dump
const AB_ACTIONS = [
    ["Single Action", "singleuseaction", "Ends the unit's turn unless it has Action Points left"],
    ["Repeating", "repeatingaction", "Can be used again while Action Points last"],
    ["Full Action", "fullaction", "Uses all of the unit's Action Points"],
    ["Full Action Continue", "fullactioncontinue", "Uses all Action Points, but the unit can still move"],
    ["Leave One", "leaveoneaction", "Leaves one Action Point"],
    ["Free Action", "freeaction", "Uses no Action Points"]
];
// an active ability's kind, by its requisites (the game's: Melee, Missile, Magic...): a tab each
const AB_KINDS = [
    ["Melee", '<img class="wm-tab-pic" src="/evolved/Icons/Interface/DropdownIcons/fighter_unit.png" alt="" /> Melee'],
    ["Ranged", '<img class="wm-tab-pic" src="/evolved/Icons/Interface/DropdownIcons/ranged_unit.png" alt="" /> Ranged'],
    ["Magic", '<img class="wm-tab-pic" src="/evolved/Icons/Interface/DropdownIcons/battle_mage_unit.png" alt="" /> Magic'],
    ["Support", "<buffspell></buffspell> Support"],
    ["Debuff", "<debuffspell></debuffspell> Debuff"],
    ["Summoning", "<summonspell></summonspell> Summoning"],
    ["Movement", "<mp></mp> Movement"],
    ["Other", "<casttactical></casttactical> Other"]
];
// the medal ranks a unit's rewards come at (medal_rewards_2 ... _6)
const AB_RANKS = { 2: "Soldier", 3: "Veteran", 4: "Elite", 5: "Champion", 6: "Legend" };
const AB_BY_NAME = (a, b) => AbName(a).localeCompare(AbName(b));

function AbName(e) {
    return HbPlain(e.name);
}

function AbWords(s) {
    return (s || "").replace(/<[^>]+>/g, "").trim();
}

// an ability's icon, if it has one (a few passives have none)
function AbIcon(e) {
    return e.icon ? "/evolved/Icons/UnitIcons/" + e.icon + ".png" : "";
}

// a passive's or status effect's card, as the Heroes pages' (HbCard); with no icon, no picture
function AbCard(e, type) {
    const card = HbCard(AbName(e), type, AbIcon(e), { description: e.description });
    if (!e.icon) card.querySelector(".sb-head > img")?.remove();
    card.classList.add("ab-card");
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Lists

// the dump's abilities and the linked ones; not upstream's hand-made tooltips (ExtraToolTips.json), the unit card's
// resistance lines (a unit's resistances: "<xpCol>Frost Protection</xpCol>" for each level, with no text) or the
// placeholder of a deprecated unit
function AbAll() {
    const extra = new Set(jsonExtraTooltips);
    return jsonUnitAbilitiesLocalized.filter((a) => !extra.has(a) && a.name && !/^<(xpCol|fireCol)>/.test(a.name) && !/DEPRECATED/.test(a.name));
}

let abStatus = null;
// the game's status effects, by slug: {kinds, stacks, counters, dispellable}
function AbStatusInfo() {
    abStatus ??= new Map(jsonStatusEffects.effects.map((e) => [e.slug, e]));
    return abStatus;
}

// one of each: copies with the same key are one, with all their slugs
function AbOnce(list, key) {
    const seen = new Map();
    for (const a of list) {
        const k = key(a);
        if (seen.has(k)) seen.get(k).copies.push(a);
        else seen.set(k, { ...a, copies: [a] });
    }
    for (const e of seen.values()) e.slugs = [...new Set(e.copies.map((a) => a.slug))];
    return [...seen.values()];
}

// ------------------------------------------------------------------------------------------------------------- Who has it

let abUsers = null;
// for each ability slug, what has it: units (as one of their abilities or passives, or a medal's reward), hero skills, items
// and infusions. Heroes' things are those a player can get (the Heroes pages' lists), each copy, as copies with another
// slug for the same ability are one card there
async function AbLoadUsers() {
    if (abUsers) return abUsers;
    // an item's card on hover says where it comes from
    const [sources] = await Promise.all([HbLoadSources(), HbLoadItemSources()]);
    abUsers = new Map();
    const get = (slug) => {
        if (!abUsers.has(slug)) abUsers.set(slug, { units: [], lists: new Set(), medals: [], skills: [], items: [], infusions: [] });
        return abUsers.get(slug);
    };
    for (const u of jsonUnits) {
        if (depCheckResID(u.resid)) continue;
        for (const key of ["abilities", "primary_passives", "secondary_passives"]) {
            for (const a of u[key] || []) {
                get(a.slug).units.push(u.id);
                get(a.slug).lists.add(key);
            }
        }
        for (const [rank, name] of Object.entries(AB_RANKS)) {
            for (const a of u["medal_rewards_" + rank] || []) get(a.slug).medals.push([u.id, name]);
        }
    }
    for (const s of HbSkills(sources, { all: true })) for (const a of s.abilities || []) get(a.slug).skills.push(s);
    for (const i of jsonHeroItemsLocalized.filter((i) => i.tier_numerals)) for (const a of i.ability_slugs) get(a.slug).items.push(i);
    for (const u of HbInfusions()) for (const a of u.abilities || []) get(a.slug).infusions.push(u);
    return abUsers;
}

// what has any of an ability's copies, each once
function AbUsersOf(slugs) {
    const all = { units: new Set(), medals: new Map(), skills: new Map(), items: new Map(), infusions: new Map() };
    for (const slug of slugs) {
        const u = abUsers.get(slug);
        if (!u) continue;
        u.units.forEach((id) => all.units.add(id));
        u.medals.forEach(([id, rank]) => all.medals.set(id, rank));
        u.skills.forEach((s) => all.skills.has(s.name) || all.skills.set(s.name, s));
        u.items.forEach((i) => all.items.has(i.name) || all.items.set(i.name, i));
        u.infusions.forEach((i) => all.infusions.has(i.name) || all.infusions.set(i.name, i));
    }
    return all;
}

// a list of what gives an ability, as an artifact's spells are listed (SpellList): icon and name, its card on hover
// (made when first wanted). things: [{name, icon, card: () => element}]
function AbThingList(label, things) {
    const fold = things.length > UNIT_LIST_FOLD;
    const part = WmElement(fold ? "details" : "div", "unitUnlocks", fold ? "<summary>" + label + " (" + things.length + ")</summary>" : '<div class="unitUnlocksLabel">' + label + "</div>");
    const list = WmElement("div", "unitUnlocksList");
    for (const t of things.sort((a, b) => AbWords(a.name).localeCompare(AbWords(b.name)))) {
        const entry = WmElement("a", "", (t.icon ? '<img class="unitUnlocksIcon" src="' + t.icon + '" alt="" onerror="this.remove()" />' : "") + t.name);
        const tip = document.createElement("span");
        entry.addEventListener("mouseenter", () => tip.firstChild || tip.append(t.card()), true);
        addTooltipListeners(entry, tip);
        list.append(entry);
    }
    part.append(list);
    return part;
}

// the parts of a card that say what has the ability: units (a medal's: the units whose medal it is), hero skills, items,
// infusions. A folded list is in the card's text too, so its names are searched
function AbUsersParts(card, slugs, { medal = false } = {}) {
    const users = AbUsersOf(slugs);
    const units = [...users.units];
    if (units.length) card.append(WmUnitList("Units", units));
    if (users.medals.size && medal) {
        const ranks = new Set(users.medals.values());
        card.append(WmUnitList(ranks.size === 1 ? [...ranks][0] + " medal of" : "Medal of", [...users.medals.keys()]));
    }
    const icon = (folder, name) => "/evolved/Icons/" + folder + "/" + name + ".png";
    const skills = [...users.skills.values()].map((s) => ({ name: s.name, icon: icon("UnitIcons", s.icon), card: () => HbSkillCard(s) }));
    if (skills.length) card.append(AbThingList("Hero Skills", skills));
    const items = [...users.items.values()].map((i) => ({ name: i.name, icon: icon("UnitIcons", i.icon), card: () => HbItemCard(i) }));
    if (items.length) card.append(AbThingList("Hero Items", items));
    const infusions = [...users.infusions.values()].map((u) => ({ name: u.name, icon: icon("UnitIcons", u.icon), card: () => HbInfusionCard(u) }));
    if (infusions.length) card.append(AbThingList("Infusions", infusions));
    return users;
}

// ------------------------------------------------------------------------------------------------------------- Active

// an active ability's kind (its tab), by its requisites
function AbKind(a) {
    const r = new Set((a.requisites || []).map((x) => AbWords(x.requisite)));
    const damage = /\d/.test(a.damage || "");
    if (r.has("Melee")) return "Melee";
    if (r.has("Missile")) return "Ranged";
    if (r.has("Magic") && damage) return "Magic";
    if (r.has("Summoning")) return "Summoning";
    if (r.has("Movement") || r.has("Teleport")) return "Movement";
    if (r.has("Support")) return "Support";
    if (r.has("Magic")) return "Magic";
    if (r.has("Debuff")) return "Debuff";
    return "Other";
}

// an attack's damage by kind: {damagefire: 12}
function AbDamageOf(damage) {
    const out = {};
    for (const [, n, tag] of (damage || "").matchAll(/(\d+)\s*<(\w+)><\/\2>/g)) out[tag.toLowerCase()] = (out[tag.toLowerCase()] || 0) + Number(n);
    return out;
}

function AbTotal(damage) {
    return Object.values(AbDamageOf(damage)).reduce((a, b) => a + b, 0);
}

// the copies' damage in one: the same for all, or where units differ, from the least to the most in all and its kinds
// ("9–33" and the icons of Physical and Fire: a unit's weapon or element decides)
function AbDamageRange(copies) {
    const damages = [...new Set(copies.map((c) => (c.damage || "").trim()))];
    if (damages.length === 1) return copies[0].damage;
    const totals = copies.map((c) => AbTotal(c.damage));
    const kinds = new Set(copies.flatMap((c) => Object.keys(AbDamageOf(c.damage))));
    const lo = Math.min(...totals);
    const hi = Math.max(...totals);
    return (lo === hi ? lo : lo + "–" + hi) + AB_DAMAGE.filter(([, tag]) => kinds.has(tag)).map(([, tag]) => "<" + tag + "></" + tag + ">").join("");
}

// the active abilities, each once: copies the same but for what their unit or item adds (its damage, the effects its
// passives give its attacks, an icon of its own: The Executioner's Charge Strike) are one, with the effects all of them
// have and the icon most have
function AbActives() {
    const requisites = (a) => (a.requisites || []).map((r) => AbWords(r.requisite)).sort();
    const list = AbOnce(
        AbAll().filter((a) => "actionPoints" in a),
        (a) => JSON.stringify([a.name, a.description, a.range, a.accuracy, a.actionPoints, a.notes, requisites(a)])
    );
    for (const e of list) {
        const icons = new Map();
        for (const c of e.copies) icons.set(c.icon, (icons.get(c.icon) || 0) + 1);
        e.icon = [...icons].sort((a, b) => b[1] - a[1])[0][0];
        e.kind = AbKind(e);
        e.damage = AbDamageRange(e.copies);
        e.damages = Object.keys(AbDamageOf(e.copies.map((c) => c.damage).join(" ")));
        e.most = Math.max(0, ...e.copies.map((c) => AbTotal(c.damage)));
        const sets = e.copies.map((c) => new Set((c.modifiers || []).map((m) => JSON.stringify(m))));
        e.modifiers = (e.copies[0].modifiers || []).filter((m) => sets.every((s) => s.has(JSON.stringify(m))));
        e.varies = e.copies.some((c) => (c.modifiers || []).length > e.modifiers.length);
        e.linked = e.copies.some((c) => jsonLinkedAbilities.includes(c));
    }
    return list;
}

function AbActiveCard(e) {
    const card = WmElement("div", "sb-card ab-card");
    card.append(GetAbilityToolTip(e));
    if (/–/.test(e.damage)) card.querySelector("#abilityDamage").title = "Its damage depends on the unit: see the unit";
    if (e.varies) card.append(WmElement("div", "ab-note", "Some units and items add more effects to it: see them."));
    const users = AbUsersParts(card, e.slugs);
    if (!users.units.size && !users.skills.size && !users.items.size && !users.infusions.size) {
        card.append(WmElement("div", "ab-note", e.linked ? "No unit has it from the start: something in play gives it." : "Nothing on the site has it from the start."));
    }
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Passive

// what kind of passive a unit's or hero's is (its tabs): a unit's own, a unit's type or class (its secondary passives), a
// hero's (a skill's, an item's, an infusion's), a Champion medal's; Other: none of these (Fire Protection and the like, which
// spells and traits give)
function AbPassiveTabs(e, users) {
    const tabs = [];
    const has = (key) => e.slugs.some((s) => abUsers.get(s)?.lists.has(key));
    if (has("primary_passives") || has("abilities")) tabs.push("Units");
    if (has("secondary_passives")) tabs.push("Types");
    if (users.skills.size || users.items.size || users.infusions.size) tabs.push("Heroes");
    if (users.medals.size && !/^[+-]/.test(AbName(e))) tabs.push("Medals");
    return tabs.length ? tabs : ["Other"];
}

// the passives, each once (copies with the same name and text): not the status effects, nor the rewards every unit's
// medals give (+10 Hit Points, +1 Defense)
function AbPassives() {
    const status = AbStatusInfo();
    const list = AbOnce(
        AbAll().filter((a) => !("actionPoints" in a) && !status.has(a.slug)),
        (a) => JSON.stringify([a.name, a.description])
    );
    for (const e of list) {
        const users = AbUsersOf(e.slugs);
        e.tabs = AbPassiveTabs(e, users);
        e.count = users.units.size + users.medals.size;
    }
    return list.filter((e) => !(e.tabs[0] === "Other" && AbUsersOf(e.slugs).medals.size));
}

const AB_PASSIVE_TYPES = { Units: "Unit Passive", Types: "Unit Type", Heroes: "Hero Passive", Medals: "Champion Medal", Other: "Passive" };

function AbPassiveCard(e) {
    const card = AbCard(e, AB_PASSIVE_TYPES[e.tabs[0]]);
    AbUsersParts(card, e.slugs, { medal: true });
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Status

// the status effects, each once (copies with the same name and text), with what the game says of them
function AbStatuses() {
    const status = AbStatusInfo();
    const list = AbOnce(
        AbAll().filter((a) => status.has(a.slug)),
        (a) => JSON.stringify([a.name, a.description])
    );
    for (const e of list) {
        const info = e.slugs.map((s) => status.get(s));
        e.kinds = ["Negative", "Positive"].filter((k) => info.some((i) => i.kinds.includes(k)));
        e.stacks = Math.max(0, ...info.map((i) => i.stacks || 0)) || null;
        e.dispellable = info.some((i) => i.dispellable);
        e.counters = [...new Set(info.flatMap((i) => i.counters))];
    }
    return list;
}

function AbStatusName(slug) {
    return AbName(findBy(jsonUnitAbilitiesLocalized, "slug", slug) || { name: "" });
}

function AbStatusCard(e) {
    const kind = e.kinds.length > 1 ? "Status Effect" : e.kinds[0] + " Status Effect";
    const icon = e.kinds.length > 1 ? "" : e.kinds[0] === "Negative" ? "<warningnegative></warningnegative> " : "<warningpositive></warningpositive> ";
    const card = AbCard(e, icon + kind);
    if (e.kinds.length > 1) card.append(WmElement("div", "ab-note", "The game counts it as positive where some effects give it, as negative where others do."));
    AbUsersParts(card, e.slugs);
    const facts = [];
    if (e.stacks) facts.push("<b>Stacks</b> up to " + e.stacks);
    facts.push(e.dispellable ? "Dispellable" : "Not dispellable");
    // what it counters, where its text doesn't say (most do: "Strengthened counters Weakened")
    const said = AbWords(e.description);
    const counters = [...new Set(e.counters.map(AbStatusName).filter((n) => n && !said.includes(n)))];
    card.append(HbFoot(counters.length ? WmMarkup("<b>Counters</b> " + counters.map((n) => "<hyperlink>" + n + "</hyperlink>").join(", ")) : "", facts));
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Pages

async function AbActivesPage() {
    await AbLoadUsers();
    const actives = AbActives();
    WmBoard(AB_KINDS, actives, {
        tabsOf: (e) => [e.kind],
        makeCard: AbActiveCard,
        choices: [
            {
                holder: "damages",
                buttons: AB_DAMAGE.map(([name, tag]) => ({ label: "<" + tag + "></" + tag + ">", title: name + " Damage", test: (e) => e.damages.includes(tag) }))
            },
            {
                holder: "actions",
                buttons: AB_ACTIONS.filter(([, tag]) => actives.some((e) => e.actionPoints.includes("<" + tag + ">"))).map(([name, tag, title]) => ({
                    label: "<" + tag + "></" + tag + ">",
                    title: name + ": " + title,
                    test: (e) => e.actionPoints.includes("<" + tag + ">")
                }))
            }
        ],
        sorts: [
            { id: "name", label: "Name", order: AB_BY_NAME },
            { id: "damage", label: "Damage", order: (a, b) => b.most - a.most || AB_BY_NAME(a, b) },
            { id: "range", label: "Range", order: (a, b) => (Number(b.range) || 0) - (Number(a.range) || 0) || AB_BY_NAME(a, b) }
        ]
    });
}

async function AbPassivesPage() {
    await AbLoadUsers();
    WmBoard(
        [
            ["Units", "<unit></unit> Units"],
            ["Types", '<img class="wm-tab-pic" src="/evolved/Icons/Interface/DropdownIcons/animal.png" alt="" /> Unit Types'],
            ["Heroes", "<unithero></unithero> Heroes"],
            ["Medals", "<medal_champion></medal_champion> Champion Medals"],
            ["Other", "<casttactical></casttactical> Other"]
        ],
        AbPassives(),
        {
            tabsOf: (e) => e.tabs,
            makeCard: AbPassiveCard,
            sorts: [
                { id: "name", label: "Name", order: AB_BY_NAME },
                { id: "units", label: "Most Units", order: (a, b) => b.count - a.count || AB_BY_NAME(a, b) }
            ]
        }
    );
}

async function AbStatusPage() {
    await AbLoadUsers();
    WmBoard(
        [
            ["Negative", "<warningnegative></warningnegative> Negative"],
            ["Positive", "<warningpositive></warningpositive> Positive"]
        ],
        AbStatuses(),
        {
            tabsOf: (e) => e.kinds,
            makeCard: AbStatusCard,
            choices: [
                {
                    holder: "facts",
                    buttons: [
                        { label: "Stacking", text: true, title: "Stacks more than once", test: (e) => e.stacks },
                        { label: "Dispellable", text: true, title: "A dispel or cleanse removes it", test: (e) => e.dispellable },
                        { label: "Not dispellable", text: true, title: "No dispel or cleanse removes it", test: (e) => !e.dispellable },
                        { label: "Has a counter", text: true, title: "Another status effect counters it", test: (e) => e.counters.length }
                    ]
                }
            ],
            sorts: [{ id: "name", label: "Name", order: AB_BY_NAME }]
        }
    );
}
