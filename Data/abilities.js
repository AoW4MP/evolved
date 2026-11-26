// What the Abilities pages share (Active Abilities, Passives, Status Effects): the Spells pages' cards and board (SbCard,
// WmBoard), with the Heroes pages' cards for what gives an ability (Data/heroes.js). The abilities are the dump's
// (Data/EN/Abilities.json), with the 68 the game's texts link to that no unit has from the start
// (Data/GEN/LinkedAbilities.json, aow4_diff_tools/abilities.py); each the same thing once, and only what a player meets in
// the game: what a unit in play, a hero skill, item or infusion a player can get, or a unit's medal has, or what the game
// gives otherwise, not what is only in its files (Data/GEN/AbilitiesInPlay.json, aow4_diff_tools/inplay.py). Which are
// status effects, and what the game says of each (negative or positive, stacks, counters, dispellable), is
// Data/GEN/StatusEffects.json (aow4_diff_tools/statuseffects.py). Style/abilities.css, Data/worldmap.js, Data/spellbook.js
// and Data/heroes.js go with it.

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
// a unit's type and class among its secondary passives (the small icons by its name), by slug, which the Passives page
// leaves out: the Units menu's Types and Class pages group the units by them, and a unit card's icon, or a link to one, shows
// its text. The game writes them in one group of texts (UPGRADES_CORE_UNITPROPERTIES@); the classes are the Units menu's
// Class pages', with Settler and Civilian (getUnitTypeTag). The other secondary passives are a unit's movement, terrain,
// size and the like (Floating, Forest Walk, Large Target, Cannot be Displaced, Magic Origin, Cavalry: written as
// requisites), on the Units tab
const AB_UNIT_TYPES = new Set([
    "000003fe00000018", // Animal
    "0000048b00000406", // Accursed Fiend
    "000003e3000059af", // Celestial
    "000003e3000071ff", // Construct
    "000003e30000426c", // Dragon
    "000003e300004968", // Elemental
    "000003e300004802", // Ethereal
    "000003fe0000001c", // Fey
    "000003fe000000c2", // Infernal Fiend
    "0000049700003d5f", // Penguin
    "000003e3000051e7", // Plant
    "000004150000025b", // Spider
    "0000049700000cbe", // Umbral Demon
    "000003e500001a37" // Undead
]);
const AB_UNIT_CLASSES = new Set([
    "000003e300004ea6", // Fighter
    "0000039f000016f0", // Shield
    "0000039f000016f2", // Polearm
    "000003bd000028b7", // Shock
    "0000049700003951", // Magic Fighter
    "000003e600000492", // Skirmisher
    "0000039f000016f1", // Ranged
    "000003e300004c86", // Battle Mage
    "000003bd000020c0", // Support
    "000003fe00000060", // Scout
    "000003e300004e9f", // Mythic
    "000003fe00000020", // Siegecraft
    "0000041b00001910", // Tower
    "000003fe000000c6", // Settler
    "000003ec000021b1" // Civilian
]);
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
// what nothing in play holds and the game gives nowhere a player meets it: by slug (aow4_diff_tools/inplay.py)
let abLeftOut = new Set();
let abSources = null;
// what the lists need: the Heroes pages' hero skill sources and what is left out of play. Search waits for this alone,
// the map of what has an ability (AbUsers, about 90ms) being made when a card first wants it
async function AbLoad() {
    if (abSources) return;
    // an item's card on hover says where it comes from
    const [sources, , inPlay] = await Promise.all([
        HbLoadSources(),
        HbLoadItemSources(),
        fetch("/evolved/Data/GEN/AbilitiesInPlay.json").then((res) => res.json())
    ]);
    abLeftOut = new Set(inPlay.left_out.map((e) => e.slug));
    abSources = sources;
}

async function AbLoadUsers() {
    await AbLoad();
    return AbUsers();
}

// for each ability slug, what has it: units in play (as one of their abilities or passives, or a medal's reward), hero
// skills, items and infusions. Heroes' things are those a player can get (the Heroes pages' lists, and the Item Forge's
// base items: the Eldritch Relics' Mind Spike), each copy, as copies with another slug for the same ability are one card there
function AbUsers() {
    if (abUsers) return abUsers;
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
    for (const s of HbSkills(abSources, { all: true })) for (const a of s.abilities || []) get(a.slug).skills.push(s);
    const bases = new Set(jsonItemForgeTypes.map((t) => String(t.base_hero_item_resid)));
    for (const i of jsonHeroItemsLocalized.filter((i) => i.tier_numerals || bases.has(String(i.resid)))) {
        for (const a of i.ability_slugs) get(a.slug).items.push(i);
    }
    for (const u of HbInfusions()) for (const a of u.abilities || []) get(a.slug).infusions.push(u);
    return abUsers;
}

// what has any of an ability's copies, each once
function AbUsersOf(slugs) {
    const all = { units: new Set(), medals: new Map(), skills: new Map(), items: new Map(), infusions: new Map() };
    for (const slug of slugs) {
        const u = AbUsers().get(slug);
        if (!u) continue;
        u.units.forEach((id) => all.units.add(id));
        u.medals.forEach(([id, rank]) => all.medals.set(id, rank));
        u.skills.forEach((s) => all.skills.has(s.name) || all.skills.set(s.name, s));
        u.items.forEach((i) => all.items.has(i.name) || all.items.set(i.name, i));
        u.infusions.forEach((i) => all.infusions.has(i.name) || all.infusions.set(i.name, i));
    }
    return all;
}

// whether a unit in play, a hero skill, item or infusion a player can get, or a medal has it
function AbHeld(users) {
    return users.units.size + users.medals.size + users.skills.size + users.items.size + users.infusions.size > 0;
}

// whether a player meets a thing nothing of the dump in play holds: what the game gives otherwise (a linked ability, a
// status effect), as inplay.py traces it. Its copies are one card, which a player meets if they meet one copy
function AbGiven(e) {
    return e.slugs.some((s) => !abLeftOut.has(s));
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
    if (skills.length) card.append(WmThingList("Hero Skills", skills));
    const items = [...users.items.values()].map((i) => ({ name: i.name, icon: icon("UnitIcons", i.icon), card: () => HbItemCard(i) }));
    if (items.length) card.append(WmThingList("Hero Items", items));
    const infusions = [...users.infusions.values()].map((u) => ({ name: u.name, icon: icon("UnitIcons", u.icon), card: () => HbInfusionCard(u) }));
    if (infusions.length) card.append(WmThingList("Infusions", infusions));
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
    // what a player meets: what something in play has (not only an old hero skill's Bless, a deprecated unit's attack), or
    // a linked ability the game gives in play (a spell's, a signature skill's)
    return list.filter((e) => AbHeld(AbUsersOf(e.slugs)) || (e.linked && AbGiven(e)));
}

function AbActiveCard(e) {
    const card = WmElement("div", "sb-card ab-card");
    card.append(GetAbilityToolTip(e));
    if (/–/.test(e.damage)) card.querySelector("#abilityDamage").title = "Its damage depends on the unit: see the unit";
    if (e.varies) card.append(WmElement("div", "ab-note", "Some units and items add more effects to it: see them."));
    const users = AbUsersParts(card, e.slugs);
    if (!AbHeld(users)) card.append(WmElement("div", "ab-note", "No unit has it from the start: something in play gives it."));
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Passive

// a passive's tabs: a unit's (its own, its movement, size...), a hero's (a skill's, an item's, an infusion's), a Champion
// medal's (a unit's medal reward that names it: not the +10 Hit Points every unit's medals give). None for a unit's type
// or class
function AbPassiveTabs(e, users) {
    if (e.slugs.some((s) => AB_UNIT_TYPES.has(s) || AB_UNIT_CLASSES.has(s))) return [];
    const tabs = [];
    if (users.units.size) tabs.push("Units");
    if (users.skills.size || users.items.size || users.infusions.size) tabs.push("Heroes");
    if (users.medals.size && !/^[+-]/.test(AbName(e))) tabs.push("Medals");
    return tabs;
}

// the passives, each once (copies with the same name and text), that something in play has: not the status effects, a
// unit's type or class, nor what only an old or disabled hero skill holds (the Dragon Lords' Auras, Cull the Weak), nor the bonuses of a spell the
// dump has for such a skill (the Primal Communions: the enchantments' passives are on the Enchantments page)
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
    return list.filter((e) => e.tabs.length);
}

const AB_PASSIVE_TYPES = { Units: "Unit Passive", Heroes: "Hero Passive", Medals: "Champion Medal" };

function AbPassiveCard(e) {
    const card = AbCard(e, AB_PASSIVE_TYPES[e.tabs[0]]);
    AbUsersParts(card, e.slugs, { medal: true });
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Status

// the status effects a player meets, each once (copies with the same name and text), with what the game says of the copies
// in play: not those only the files have (the old affinity traits, a spell's status from before it changed: Earth Shatter)
function AbStatuses() {
    const status = AbStatusInfo();
    const list = AbOnce(
        AbAll().filter((a) => status.has(a.slug)),
        (a) => JSON.stringify([a.name, a.description])
    ).filter(AbGiven);
    for (const e of list) {
        e.slugs = e.slugs.filter((s) => !abLeftOut.has(s));
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
            ["Heroes", "<unithero></unithero> Heroes"],
            ["Medals", "<medal_champion></medal_champion> Champion Medals"]
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
