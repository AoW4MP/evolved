// What the Spells pages share (Strategic, Tactical, Transformations, Enchantments, Siege Projects), and Search's spell and
// siege cards. Everything comes from Data/GEN/SpellBook.json, which aow4_diff_tools/spells.py generates from the game and
// the mod. Style/spellbook.css and Data/worldmap.js go with it.

const SB_AFFINITIES = { Order: "empireorder", Chaos: "empirechaos", Nature: "empirenature", Materium: "empirematter", Astral: "empirearcana", Shadow: "empireshadow" };
// the unit classes an enchantment names among its Affected Unit Types (the Enchantments page's buttons), melee first
const SB_UNIT_CLASSES = {
    Fighter: "unitFighter",
    Shield: "unitShield",
    Polearm: "unitPolearm",
    Shock: "unitShock",
    "Magic Fighter": "unitMagicFighter",
    Skirmisher: "unitSkirmisher",
    Ranged: "unitRanged",
    "Battle Mage": "unitBattleMage",
    Support: "unitSupport",
    Scout: "unitScout",
    Mythic: "unitMythic"
};
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

// A unit type a spell affects, a link as in the game: "<unitMerfolk></unitMerfolk> Merfolk". Most are abilities, linked by
// name wherever they stand; Merfolk (a race's transformation) and Fiend (a group of types) are only the game's concepts,
// which plain words don't link to, so a type's words are written as a link where they name one. Not "Tier I": its concept
// is the tier's upkeep
function SbRequisite(r) {
    const type = r.match(/^(<(unit\w+)><\/\2>\s*)(.+)$/);
    return WmMarkup(type && ConceptKeyByName(type[3]) ? type[1] + "<hyperlink>" + type[3] + "</hyperlink>" : r);
}

function SbSpellCard(s) {
    const card = SbCard(s, s.type, "/evolved/Icons/" + s.icon);
    if (s.requisites.length) {
        const part = WmElement("div", "wm-part", '<div class="wm-label">Affected Unit Types</div>');
        part.append(WmElement("div", "sb-chips", s.requisites.map((r) => "<span>" + SbRequisite(r) + "</span>").join("")));
        card.append(part);
    }
    if (s.units.length) {
        // a long list folds away, or it stretches the row of cards it is on
        card.append(WmUnitList(s.type.includes("Summon") ? "Summons" : "Units", s.units));
    }
    const chances = SpellSpawnChances(s.id, s.spawns, s.offers);
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
    if (unlocks) card.append(WmUnitList("Unlocks", unlocks));
    if (loc.requirement_description) card.append(WmElement("div", "wm-part", '<div class="wm-label">Requires</div>' + WmMarkup(AsBulletList(loc.requirement_description))));
    card.append(SbFoot({ sources: [] }, ["<b>Build Cost</b> " + loc.cost]));
    return card;
}

// a tome's skills in the game's order. It sorts the list the dump has by tier alone, with a quicksort that doesn't keep the
// order of equals (Delphi's TList.Sort: the pivot is the middle one): nothing else gave the order of the tomes compared
function SbGameOrder(skills) {
    const list = [...skills];
    const tier = (skill) => skill.tier || 0;
    const sort = (left, right) => {
        if (left >= right) return;
        const pivot = tier(list[(left + right) >> 1]);
        let i = left;
        let j = right;
        while (i <= j) {
            while (tier(list[i]) < pivot) i++;
            while (tier(list[j]) > pivot) j--;
            if (i <= j) {
                [list[i], list[j]] = [list[j], list[i]];
                i++;
                j--;
            }
        }
        sort(left, j);
        sort(i, right);
    };
    sort(0, list.length - 1);
    return list;
}

// all a tome unlocks, by tier as in the game, by what the game says comes from it: which of a spell's versions, and what
// its skills have no link to. Each with its card or cards (a spell's versions). On its page the tome, its tier and its DLC
// are said already
function SbTomeSkills(tome) {
    const fromTome = (e) => e.sources.some((s) => s.kind === "Tome" && s.id === tome.id);
    const spells = jsonSpellBook.spells.filter(fromTome);
    const siege = jsonSpellBook.siege.filter(fromTome);
    const shown = new Set();
    const skills = [];
    const add = (skill, list, makeCard) => {
        const cards = [];
        for (const e of list) {
            if (shown.has(e)) continue;
            shown.add(e);
            cards.push(makeCard({ ...e, tier: null, dlc: null, sources: [] }));
        }
        if (cards.length) skills.push({ ...skill, cards });
    };
    for (const skill of SbGameOrder(tome.skills || [])) {
        const named = (e) => e.id === skill.spell_slug || e.id === skill.siege_project_slug || e.name === skill.name;
        // a skill standing for several spells, one per choice the player makes: Pirate Bond's Conjure Pirate Captain is a
        // Conjure … Captain per captain. Its tome's spells with its first and last word and as many words
        const words = skill.name.split(" ");
        const family = (e) => {
            const w = e.name.split(" ");
            return !skill.spell_slug && w.length === words.length && w[0] === words[0] && w.at(-1) === words.at(-1);
        };
        if (skill.unit_slug) skills.push({ ...skill, cards: [SbUnitCard(skill)] });
        else if (skill.upgrade_slug) {
            const card = SbStructureCard(skill);
            if (card) skills.push({ ...skill, cards: [card] });
        } else if (siege.some(named)) add(skill, siege.filter(named), SbSiegeCard);
        else if (spells.some(named)) add(skill, spells.filter(named), SbSpellCard);
        else if (spells.some(family)) add(skill, spells.filter(family), SbSpellCard);
        else if (!jsonSpellBook.left_out.some((e) => e.name === skill.name)) {
            const type = skill.type.includes("Empire Bonus") ? "<empire></empire> Empire Bonus" : skill.type;
            const card = SbCard({ name: skill.name, description: skill.description }, type, "/evolved/Icons/ExtraIcons/" + skill.name.replaceAll(" ", "_").toLowerCase() + ".png");
            skills.push({ ...skill, cards: [card] });
        }
    }
    for (const e of spells) add({ name: e.name, tier: tome.tier, type: e.type }, [e], SbSpellCard);
    for (const e of siege) add({ name: e.name, tier: tome.tier, type: "Siege Project" }, [e], SbSiegeCard);
    return skills.sort((a, b) => (a.tier || 0) - (b.tier || 0));
}

// the frame the game gives a skill of a kind (TomeOfWondersScreen.xaml); an enchantment's for a unit and anything else
function SbSkillFrame(type) {
    if (/Summon/.test(type)) return "summon";
    if (/Transformation/.test(type)) return "transformation";
    if (/Unit Enchantment/.test(type) || !/cast(strategic|tactical)/.test(type)) return "enchantment";
    return type.includes("casttactical") ? "tactical" : "strategic";
}

// the scroll's medallions, as in the game: a skill's card when the mouse is on it
function SbTomeMedallions(skills, holder) {
    holder.closest(".tome-scroll").hidden = !skills.length;
    for (const skill of skills) {
        const icon = skill.cards[0].querySelector(".sb-head > img")?.getAttribute("src");
        const medallion = WmElement(
            "div",
            "tome-skill",
            '<span class="tome-medallion"><img src="/evolved/Icons/Interface/Tome/frame_' + SbSkillFrame(skill.type) + '.png" alt="" />' +
                (icon ? '<img class="tome-skill-icon" src="' + icon + '" alt="" onerror="this.remove()" />' : "") +
                '<span class="tome-skill-tier">' + romanize(skill.tier || 1) + "</span></span>" +
                '<span class="tome-skill-name">' + skill.name + "</span>"
        );
        const tip = document.createElement("span");
        tip.append(...skill.cards);
        LazyImages(tip);
        addTooltipListeners(medallion, tip);
        holder.append(medallion);
    }
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

// the classes a spell's Affected Unit Types name ("<unitShield></unitShield> Shield Unit"), by their icon tag. None: it
// is for a kind of unit of any class (Animal, Tier I), or for any unit
function SbClasses(e) {
    return (e.requisites || []).map((r) => r.match(/^<(unit\w+)><\/\1>\s*.+ Unit$/)?.[1]).filter(Boolean);
}

// the unit types a spell's Affected Unit Types name, the others with an icon tag ("<unitAnimal></unitAnimal> Animal"):
// [tag, name]. Not Magic Origin, Tier I or Units that Evolve, which are no type and have none
function SbTypes(e) {
    return (e.requisites || [])
        .map((r) => r.match(/^<(unit\w+)><\/\1>\s*(.+)$/))
        .filter((m) => m && !/ Unit$/.test(m[2]))
        .map((m) => [m[1], m[2]]);
}

// tabs: [[id, label (HTML)]]. tabsOf: the tabs a thing is on. A thing on two tabs has a card on each. The search and the
// affinity buttons work across all tabs, whose counts follow (WmBoard). units: a button per unit class (in #classes),
// which keeps what is for that class and what names none (Empowered Beasts is for an Animal of any class), as Hero
// Equipment does with a hero's class; and per unit type the things name (in #types), which keeps what names it
function SbBoard(tabs, items, tabsOf, makeCard, { units = false } = {}) {
    const byName = (a, b) => a.name.localeCompare(b.name);
    const icon = (tag) => "<" + tag + "></" + tag + ">";
    const affinities = Object.entries(SB_AFFINITIES).map(([name, tag]) => ({
        label: icon(tag),
        title: name,
        test: (e) => (e.affinities || []).includes(name)
    }));
    const choices = [{ holder: "affinities", buttons: affinities }];
    if (units) {
        choices.push({
            holder: "classes",
            buttons: Object.entries(SB_UNIT_CLASSES).map(([name, tag]) => ({
                label: icon(tag),
                title: name + " Units",
                test: (e) => !SbClasses(e).length || SbClasses(e).includes(tag)
            }))
        });
        const types = new Map(items.flatMap(SbTypes));
        choices.push({
            holder: "types",
            buttons: [...types]
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([tag, name]) => ({ label: icon(tag), title: name, test: (e) => SbTypes(e).some(([t]) => t === tag) }))
        });
    }
    return WmBoard(tabs, items, {
        tabsOf,
        makeCard,
        choices,
        sorts: [
            { id: "tier", label: "Tier", order: (a, b) => SbGroup(a).rank - SbGroup(b).rank || byName(a, b), group: SbGroup },
            { id: "name", label: "Name", order: byName },
            { id: "cost", label: "Cost", order: (a, b) => SbCost(a) - SbCost(b) || byName(a, b) }
        ]
    });
}
