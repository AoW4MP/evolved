// What the Heroes pages share (Equipment, Item Forge, Ascension Skills, Ambitions, Governance, Skill List), and Search's hero
// cards: the Spells pages' cards and board (SbCard, WmBoard). The things are the dump's (Data/EN: HeroItems,
// ItemForgeUpgrades, ItemForgeTypes, HeroSkills, Destinies, Governance), each the same thing once. Where a skill outside the
// skill trees comes from, and which skills no one can get, is Data/GEN/HeroSkillSources.json, which
// aow4_diff_tools/heroskills.py generates from the game and the mod. Style/heroes.css, Data/worldmap.js and Data/spellbook.js
// go with it.

// the classes, in the game's order (martial, hybrid, magic), and their text icons
const HB_CLASSES = [
    ["Warrior", "classWarrior"],
    ["Defender", "classDefender"],
    ["Ranger", "classRanger"],
    ["Spellblade", "classSpellblade"],
    ["Death Knight", "classDeathknight"],
    ["Battlesaint", "classBattlesaint"],
    ["Elementalist", "classMage"],
    ["Warlock", "classWarlock"],
    ["Ritualist", "classRitualist"]
];
// a ruler's skill tree by its name in the dump
const HB_RULERS = {
    "Mortal Champion": "Champion",
    "Wizard King": "Wizard King",
    "Dragon Lord": "Dragon Lord",
    "Eldritch Sovereign": "Eldritch Sovereign",
    "Giant Kings": "Giant King",
    Vampire: "Elder Vampire"
};
// the Tomes menu's order
const HB_AFFINITIES = ["Astral", "Nature", "Shadow", "Order", "Chaos", "Materium"];
const HB_SLOTS = {
    Primary: "Primary Weapon",
    Secondary: "Secondary Weapon",
    Head: "Head",
    Torso: "Torso",
    Legs: "Legs",
    Mount: "Mount",
    Ring: "Ring",
    Miscellaneous: "Miscellaneous"
};
// what most items say of who wears them: the heroes in human form
const HB_HUMAN_HEROES = "Champion, Wizard King, Elder Vampire Pureblood";

let hbSources = null;
async function HbLoadSources() {
    hbSources ??= await fetch("/evolved/Data/GEN/HeroSkillSources.json").then((res) => res.json());
    return hbSources;
}

// where each item comes from (aow4_diff_tools: heroitems.py); an item card shows it once it is loaded
let hbItemSources = null;
async function HbLoadItemSources() {
    hbItemSources ??= await fetch("/evolved/Data/GEN/HeroItemSources.json").then((res) => res.json());
    return hbItemSources;
}

function HbPlain(html) {
    return (html || "").replace(/<[^>]+>/g, "").trim();
}

// one of each: what the dump has twice or more with the same contents (a culture's copy of a starting weapon). Its DLC is
// the copies' if they share one, else none (the base game's and a DLC's)
// each thing once: the copies with the same key merged, the ids of all of them kept (an item's sources are by id)
function HbOnce(list, key) {
    const seen = new Map();
    for (const e of list) {
        const k = key(e);
        if (!seen.has(k)) seen.set(k, { ...e, ids: [e.id] });
        else {
            seen.get(k).ids.push(e.id);
            HbSameDlc(seen.get(k), e);
        }
    }
    return [...seen.values()];
}

function HbSameDlc(kept, copy) {
    if ((kept.DLC || "").trim() !== (copy.DLC || "").trim()) kept.DLC = undefined;
}

function HbAbilityOf(slug) {
    return findBy(jsonUnitAbilitiesLocalized, "slug", slug);
}

// what an ability is, to tell copies apart
function HbAbilityKey(slug) {
    const a = HbAbilityOf(slug);
    return a ? [a.name, a.description, a.damage, a.range, a.accuracy] : [slug];
}

// an ability a skill, item or infusion gives: an active one as on a unit's card (damage, accuracy, range, actions); a
// passive one's text, under its name when it isn't the card's
function HbAbility(slug, cardName) {
    const ability = HbAbilityOf(slug);
    if (!ability) return null;
    if ("accuracy" in ability) {
        const block = WmElement("div", "hb-ability");
        block.append(GetAbilityToolTip(ability));
        return block;
    }
    const block = WmElement("div", "hb-passive");
    if (ability.name && ability.name.toLowerCase() !== (cardName || "").toLowerCase()) {
        block.append(WmElement("div", "hb-passive-name", '<img src="/evolved/Icons/UnitIcons/' + ability.icon + '.png" alt="" onerror="this.remove()" />' + ability.name));
    }
    block.append(WmElement("div", "", WmMarkup(ability.description)));
    return block;
}

// a card as the Spells pages' (SbCard), its text left out when it has none
function HbCard(name, type, icon, { tier, dlc, description, variant } = {}) {
    const card = SbCard({ name, tier, dlc, variant, description: "" }, type, icon);
    card.classList.add("hb-card");
    const text = card.querySelector(".sb-text");
    if (description) text.innerHTML = WmMarkup(description);
    else text.remove();
    return card;
}

function HbPart(label, html, className) {
    const part = WmElement("div", "wm-part", '<div class="wm-label">' + label + "</div>");
    if (html !== undefined) part.append(WmElement("div", className || "", html));
    return part;
}

// the foot of a card: what is said of where it comes from on the left, the facts on the right
function HbFoot(left, facts) {
    const foot = WmElement("div", "sb-foot");
    foot.append(WmElement("div", "sb-sources", left || ""));
    if (facts.length) foot.append(WmElement("div", "sb-costs", WmMarkup(facts.map((f) => "<span>" + f + "</span>").join(""))));
    return foot;
}

function HbClassIcon(name) {
    const icon = HB_CLASSES.find(([n]) => n === name)?.[1];
    return icon ? '<span class="hb-class" title="' + name + '"><' + icon + "></" + icon + "></span>" : "";
}

// ------------------------------------------------------------------------------------------------------------- Equipment

// the items a hero can wear: those with a tier (the others are the Item Forge's bases), each once
function HbItems() {
    return HbOnce(
        jsonHeroItemsLocalized.filter((i) => i.tier_numerals),
        (i) =>
            JSON.stringify([
                i.name,
                i.slot,
                i.tier,
                i.description,
                i.ability_slugs.map((a) => HbAbilityKey(a.slug)),
                (i.hero_classes || []).map((c) => c.name),
                (i.hero_types || []).map((c) => c.name),
                i.disabled_slots.map((s) => s.slot_name)
            ])
    );
}

// an item's tier as a number (the site's deromanize counts from 0)
function HbTier(item) {
    return { I: 1, II: 2, III: 3, IV: 4, V: 5 }[item.tier_numerals] || 0;
}

function HbItemClasses(item) {
    return (item.hero_classes || []).map((c) => HbPlain(c.name));
}

// who wears it, when not every hero in human form: a Dragon Lord's claws, a Giant King's weapons
function HbItemWearers(item) {
    const types = (item.hero_types || []).map((t) => t.name);
    if (!types.length || types.join(", ") === HB_HUMAN_HEROES) return "";
    if (types.every((t) => t.endsWith("Giant King"))) return "Giant Kings";
    return types.join(", ");
}

function HbItemCard(item) {
    const card = HbCard(item.name, HB_SLOTS[item.slot] || item.slot, "/evolved/Icons/UnitIcons/" + item.icon + ".png", {
        tier: HbTier(item),
        dlc: item.DLC,
        description: item.description
    });
    for (const a of item.ability_slugs) {
        const block = HbAbility(a.slug, item.name);
        if (block) card.append(block);
    }
    if (item.disabled_slots.length) {
        card.append(HbPart("Disabled Slots", item.disabled_slots.map((s) => "<span>" + s.slot_name + "</span>").join(""), "sb-chips"));
    }
    const sources = HbItemSourceLines(item);
    if (sources.length) card.append(HbPart("Obtained From", sources.join(""), "hb-sources"));
    const classes = HbItemClasses(item);
    const wearers = HbItemWearers(item);
    card.append(
        HbFoot(
            classes.length ? '<div class="hb-classes">' + classes.map(HbClassIcon).join("") + "</div>" : "",
            wearers ? ["<unitruler></unitruler> " + wearers + " only"] : []
        )
    );
    return card;
}

// where an item comes from, a line for each kind of source (heroitems.py's kinds), in this order, with what it means
const HB_ITEM_SOURCES = {
    Loot: ["Loot", "An item reward: exploration sites, chests, monster lairs, resource nodes, quests"],
    Shop: ["Shop", "A shop on the world map"],
    Dwelling: ["Dwelling", "A dwelling's trade, or its reward when conquered"],
    "Culture Action": ["Culture action", "A culture's action on the world map"],
    "Ancient Wonder": ["Ancient Wonder", "A story of the Ancient Wonder"],
    "Cosmic Happening": ["Cosmic Happening", "A Cosmic Happening's reward"],
    "Oceanic Happening": ["Oceanic Happening", "An Oceanic Happening's reward"],
    Quest: ["Quest", "A quest's reward"],
    Event: ["Event", "An event's reward"],
    "World Crisis": ["World Crisis", "A World Crisis' reward"],
    "Starting Loadout": ["Starting loadout", "A ruler's or hero's starting equipment: a loadout of the Faction Creator, or of a culture's heroes"],
    "Culture Default": ["Default gear", "The default equipment of a culture's heroes"],
    "Ruler Default": ["Default gear", "The default equipment of a kind of ruler"],
    "Faction Mount": ["Faction mount", "The mount a faction's heroes ride: its form's, a form trait's (the Faction Creator's Mounts), or a Pantheon unlock's"]
};

function HbItemSourceLines(item) {
    const all = (item.ids || [item.id]).flatMap((id) => hbItemSources?.items[id] || []);
    const lines = [];
    for (const [kind, [label, title]] of Object.entries(HB_ITEM_SOURCES)) {
        let names = [...new Set(all.filter((s) => s.kind === kind).map((s) => s.name))];
        if (!names.length) continue;
        let text;
        if (kind === "Loot" || kind === "Event") text = label;
        else if (kind === "Quest") text = names.includes("Hero quest") && names.length === 1 ? "Hero quest" : "Quest";
        else if (kind === "Starting Loadout") text = names.includes("Starting loadout") ? label : label + " (Pantheon unlock)";
        else if (kind === "Ancient Wonder") text = label + ": " + names.map((n) => '<a href="/evolved/HTML/AncientWonders.html" target="_blank">' + n + "</a>").join(", ");
        else if (kind === "Culture Default") text = label + ": " + names.join(", ") + " culture";
        else text = label + ": " + names.join(", ");
        lines.push('<div class="sb-source" title="' + title + '">' + text + "</div>");
    }
    return lines;
}

// ------------------------------------------------------------------------------------------------------------- Item Forge

// the Item Forge's item types, by their tags; an infusion fits a kind when its tag filter lets one of the kind's types in.
// Their pictures are the old Infusions page's, or the item a type forges
const HB_FORGE_KINDS = [
    ["onehanded", "One-Handed Weapon", /^ItemTypeWeapon\.OneHanded\.(?!Cestus)/],
    ["cestus", "Cestus", /^ItemTypeWeapon\.OneHanded\.Cestus/],
    ["twohandedheavy", "Two-Handed Weapon", /^ItemTypeWeapon\.TwoHandedHeavy\./],
    ["polearm", "Polearm", /^ItemTypeWeapon\.Polearm\./],
    ["bow", "Ranged Weapon", /^ItemTypeWeapon\.RangedPhysical\./],
    ["meleeranged", "Melee and Ranged Weapon", /^ItemTypeWeapon\.MeleeRanged\./],
    ["staff", "Staff", /^ItemTypeWeapon\.Magic\.Staff/],
    ["magicalorb", "Orb", /^ItemTypeWeapon\.Magic\.MagicalOrb/],
    ["grimoire", "Grimoire", /^ItemTypeWeapon\.Magic\.Grimoire/],
    ["magicstrike", "Magic Strike Weapon", /^ItemTypeWeapon\.MagicMeleeRanged\./],
    ["dragonclaw", "Dragon Claw", /^ItemTypeWeapon\.DragonClaw$/],
    ["warclaw", "Warclaw", /^ItemTypeWeapon\.DragonClaw\.Warclaw/],
    ["armoredclaw", "Armored Claw", /^ItemTypeWeapon\.DragonClaw\.ArmoredClaw/],
    ["eldritchrelic", "Eldritch Relic", /^ItemTypeWeapon\.EldritchRelic/],
    ["warhammer", "Warhammer", /^ItemTypeWeapon\.GiantKingWeapons\.Warhammer/],
    ["giantaxe", "Giant Axe", /^ItemTypeWeapon\.GiantKingWeapons\.GiantAxe/],
    ["obelisk", "Obelisk", /^ItemTypeWeapon\.GiantKingWeapons\.Obelisk/],
    ["shield", "Shield", /^ItemTypeArmor\.Shield/],
    ["head", "Head", /^ItemTypeArmor\.Head/],
    ["armor", "Torso", /^ItemTypeArmor\.Torso/],
    ["legs", "Legs", /^ItemTypeArmor\.Legs/],
    ["ring", "Ring", /^ItemTypeJewelry\.Ring/],
    ["wand", "Wand", /^ItemTypeMisc\.Wand/],
    ["amulet", "Trinket", /^ItemType(Jewelry\.Amulet|Misc\.)/]
];
const HB_FORGE_PICTURES = new Set(HB_FORGE_KINDS.map(([id]) => id).filter((id) => id !== "grimoire" && id !== "magicstrike"));
// the infusions the Pantheon unlocks (upstream's list, by hand: the game's data doesn't say)
const HB_PANTHEON_INFUSIONS = [
    "umbral_staff_equipment_upgrade",
    "umbral_greataxe_equipment_upgrade_(umbral_wake)",
    "umbral_greataxe_equipment_upgrade_(umbral_immunity)",
    "lashers_sword_equipment_upgrade",
    "crowmasters_bow_equipment_upgrade",
    "captains_shield_equipment_upgrade",
    "earthshaker_hammer_equipment_upgrade",
    "staff_of_necromancy_equipment_upgrade",
    "cryomancers_staff_equipment_upgrade",
    "druids_staff_equipment_upgrade",
    "berserkers_greataxe_equipment_upgrade",
    "tyrants_shield_equipment_upgrade",
    "innate_spell_jammer_infusion_equipment_upgrade",
    "inner_grace_infusion_equipment_upgrade",
    "mirror_veil_infusion_equipment_upgrade",
    "overcharge_cast_infusion_equipment_upgrade",
    "greater_farsight_infusion_equipment_upgrade",
    "pierce_shot_infusion_equipment_upgrade",
    "pull_shot_infusion_euipment_upgrade",
    "inspiring_presence_infusion_equipment_upgrade",
    "wail_of_the_banshee_infusion_equipment_upgrade",
    "summon_spirit_hawk_infusion_equipment_upgrade",
    "defense_mode_nullify_infusion_equipment_upgrade",
    "subdue_infusion_equipment_upgrade",
    "equipment_upgrade_defense_mode_protective_wall",
    "bless_infusion_equipment_upgrade",
    "fearless_infusion_equipment_upgrade",
    "magic_shield_infusion_equipment_upgrade"
];
// the materials, in the Magic Materials page's order
const HB_MATERIALS = [
    "Arcanium Ore",
    "Focus Crystals",
    "Fireforge Stone",
    "Void Stones",
    "Blood Glass",
    "Archon Blood",
    "Astral Dew",
    "Tranquility Pool",
    "Pale Tidebloom",
    "Haste Berries",
    "Silvertongue Fruit",
    "Rainbow Clover"
];

let hbForgeTypes = null;
function HbForgeTypes() {
    hbForgeTypes ??= jsonItemForgeTypes.map((t) => {
        const tags = t.tags.map((g) => g.tag);
        return { type: t, tags, kind: HB_FORGE_KINDS.find(([, , re]) => tags.some((g) => re.test(g)))?.[0] };
    });
    return hbForgeTypes;
}

function HbKindPicture(kind) {
    if (HB_FORGE_PICTURES.has(kind)) return "/evolved/Icons/ItemForge/" + kind + ".png";
    const type = HbForgeTypes().find((t) => t.kind === kind);
    const item = type && jsonHeroItems.find((i) => String(i.resid) === String(type.type.base_hero_item_resid));
    return item ? "/evolved/Icons/UnitIcons/" + item.icon + ".png" : "";
}

// a tag filter as the game reads it: "Contains inherited X" holds for X and the tags under it, "Contains X" for X alone
function HbTagFilter(node, tags) {
    const condition = HbPlain(node.condition);
    if (condition.startsWith("All of")) return node.children.every((c) => HbTagFilter(c, tags));
    if (condition.startsWith("One or More")) return node.children.some((c) => HbTagFilter(c, tags));
    const m = condition.match(/^(Contains|Does not contain)( inherited)? (\S+)/);
    if (!m) return true;
    const has = tags.some((t) => t === m[3] || (m[2] && t.startsWith(m[3] + ".")));
    return m[1] === "Contains" ? has : !has;
}

// a Damage infusion changes the damage an item deals (the game's "damage channel"), as named; True Damage and "+10% Magic
// Damage" are passives
function HbInfusionKind(infusion) {
    if (infusion.id.includes("damage_channel")) return "Damage";
    return (infusion.abilities || []).some((a) => "accuracy" in (HbAbilityOf(a.slug) || {})) ? "Ability" : "Passive";
}

// the infusions, each once, with the kinds of item they fit and what unlocks them
function HbInfusions() {
    const types = HbForgeTypes();
    const list = HbOnce(jsonItemForgeUpgradesLocalized, (u) =>
        JSON.stringify([u.name, u.description, u.point_cost, u.unlock_requirements, (u.abilities || []).map((a) => HbAbilityKey(a.slug)), u.tag_filter])
    );
    // copies with other item types are one card too: a Death Damage for each weapon its words fit
    const byWords = new Map();
    for (const u of list) {
        const key = JSON.stringify([u.name, u.description, u.point_cost, u.unlock_requirements, (u.abilities || []).map((a) => HbAbilityKey(a.slug))]);
        const fits = types.filter((t) => t.kind && HbTagFilter(u.tag_filter, t.tags)).map((t) => t.kind);
        if (byWords.has(key)) {
            fits.forEach((k) => byWords.get(key).fits.add(k));
            HbSameDlc(byWords.get(key), u);
        } else byWords.set(key, { ...u, kind: HbInfusionKind(u), fits: new Set(fits), pantheon: HB_PANTHEON_INFUSIONS.includes(u.id) });
    }
    return [...byWords.values()];
}

function HbMaterialIcon(name) {
    const tag = name.toLowerCase().replace(/[^a-z]/g, "");
    return "<" + tag + "></" + tag + ">";
}

function HbInfusionCard(u) {
    const card = HbCard(u.name, u.kind + " Infusion", "/evolved/Icons/UnitIcons/" + u.icon + ".png", { dlc: u.DLC, description: u.description });
    for (const a of u.abilities || []) {
        const block = HbAbility(a.slug, u.name);
        if (block) card.append(block);
    }
    const fits = HB_FORGE_KINDS.filter(([id]) => u.fits.has(id));
    if (fits.length) {
        card.append(
            HbPart(
                "Fits",
                fits.map(([id, label]) => '<span class="hb-fit" title="' + label + '"><img src="' + HbKindPicture(id) + '" alt="' + label + '" /></span>').join(""),
                "hb-fits"
            )
        );
        card.dataset.search = fits.map(([, label]) => label).join(" ");
    }
    const unlock = (u.unlock_requirements || []).map((r) => "<b>Requires</b> " + r.num_required + " " + HbMaterialIcon(r.token_name) + " " + r.token_name);
    if (u.pantheon) unlock.push("<pantheon></pantheon> Pantheon unlock");
    card.append(HbFoot(WmMarkup(unlock.join("<br>")), ["<b>Cost</b> " + u.point_cost + " <infusionpoint></infusionpoint>"]));
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Skills

const HB_OTHER_KINDS = {
    "Secret Spell": "Secret Spells",
    "Training Camp": "Training Camp",
    Quest: "Quests and Adventures",
    "Ancient Wonder": "Quests and Adventures",
    "Cosmic Happening": "Quests and Adventures",
    "Oceanic Happening": "Quests and Adventures",
    Event: "Quests and Adventures",
    "Ruler Background": "Ruler Backgrounds",
    Hero: "Heroes",
    Infusion: "Infusions"
};

let hbSkillByResid = null;
function HbSkillName(resid) {
    hbSkillByResid ??= new Map(jsonHeroSkillsLocalized.map((s) => [String(s.resid), s]));
    return hbSkillByResid.get(String(resid))?.name;
}

// every skill a hero can get, each once (all: every copy, to find one by its id), with its kind: a class's or ruler's tree,
// a signature skill, an affinity skill, an Ascension, or another (what gives it, from HeroSkillSources.json). What no one
// can get is left out
function HbSkills(sources, { all = false } = {}) {
    const out = new Set(sources.left_out.map((s) => s.id));
    const skills = [];
    for (const s of jsonHeroSkillsLocalized) {
        if (!s.resid || !s.name || out.has(s.id)) continue;
        const skill = { ...s, from: sources.skills[s.id] || [] };
        if (s.tree_name) {
            const className = s.tree_name.includes("<class") ? HbPlain(s.tree_name) : null;
            skill.kind = className ? "Class" : "Ruler";
            skill.className = className;
            skill.ruler = className ? null : HB_RULERS[s.tree_name] || s.tree_name;
            const clan = (s.group_name || "").match(/^Giant Kings - (\w+) -/);
            skill.heading = className || skill.ruler + (clan ? ": " + clan[1] + " Clan" : "");
        } else if (s.type === "signature") {
            skill.kind = "Signature";
            skill.heading = (s.hero_property || "").replace(/ Property$/, "") || "Other";
        } else if (s.group_name === "Affinity Hero Skill Group") {
            skill.kind = "Affinity";
            skill.heading = "";
        } else if (skill.from.some((f) => f.kind === "Ascension")) {
            skill.kind = "Ascension";
            skill.heading = "";
        } else {
            skill.kind = "Other";
            skill.heading = HB_OTHER_KINDS[skill.from[0]?.kind] || "Other";
        }
        skill.active = (s.abilities || []).some((a) => "actionPoints" in (HbAbilityOf(a.slug) || {}));
        skills.push(skill);
    }
    if (all) return skills;
    return HbOnce(skills, (s) =>
        JSON.stringify([s.kind, s.heading, s.name, s.description, (s.abilities || []).map((a) => HbAbilityKey(a.slug)), s.tree_pos_x, s.tree_pos_y])
    );
}

function HbSkillType(s) {
    if (s.kind === "Class") return HbClassIcon(s.className) + " " + s.className + " Skill";
    if (s.kind === "Ruler") return "<unitruler></unitruler> " + s.ruler + " Skill";
    if (s.kind === "Signature") return "Signature Skill" + (s.heading && s.heading !== "Other" ? " · " + s.heading : "");
    if (s.kind === "Affinity") return "Affinity Skill";
    if (s.kind === "Ascension") return "<pantheon></pantheon> Ascension Skill";
    return "Hero Skill";
}

function HbSkillSourceText(f) {
    if (f.kind === "Ancient Wonder") return 'Ancient Wonder: <a href="/evolved/HTML/AncientWonders.html" target="_blank">' + f.name + "</a>";
    if (f.kind.endsWith("Happening")) return f.kind + ": " + f.name;
    if (f.kind === "Quest") return f.name.charAt(0).toUpperCase() + f.name.slice(1);
    if (f.kind === "Ruler Background") return "Ruler background: " + f.name;
    if (f.kind === f.name) return f.name;
    return f.kind;
}

// the tome a skill needs, as a spell's source on the Spells pages (SbSource)
function HbTomeSource(name) {
    const tome = jsonTomes.find((t) => t.name === name);
    if (!tome) return "<span>" + name + "</span>";
    const affinities = Object.entries(SB_AFFINITIES)
        .filter(([, icon]) => (tome.affinities || "").includes("<" + icon + ">"))
        .map(([affinity]) => affinity);
    return SbSource({ kind: "Tome", id: tome.id, name: tome.name, tier: tome.tier, icon: tome.icon, affinities });
}

// the tomes an Ascension needs, any one of them (AscendedInfo.json)
function HbAscensionTomes(id) {
    const info = jsonExtraAscendedInfo.find((a) => a.id === id);
    return info ? info.description.split(",").map((n) => n.trim()).filter(Boolean) : [];
}

function HbAscensionAffinities(id) {
    const affinities = new Set();
    for (const name of HbAscensionTomes(id)) {
        const tome = jsonTomes.find((t) => t.name === name);
        for (const [affinity, icon] of Object.entries(SB_AFFINITIES)) if ((tome?.affinities || "").includes("<" + icon + ">")) affinities.add(affinity);
    }
    return [...affinities];
}

function HbSkillCard(s) {
    const card = HbCard(s.name, HbSkillType(s), "/evolved/Icons/UnitIcons/" + s.icon + ".png", { dlc: s.DLC, description: s.description });
    for (const a of s.abilities || []) {
        const block = HbAbility(a.slug, s.name);
        if (block) card.append(block);
    }
    const required = (s.required_skills || []).map((r) => HbSkillName(r.resid)).filter(Boolean);
    if (required.length) card.append(HbPart(required.length > 1 ? "Requires one of" : "Requires", required.join(", "), "hb-links"));
    const excluded = (s.excluded_skills || []).map((r) => HbSkillName(r.resid)).filter(Boolean);
    if (excluded.length) card.append(HbPart("Can't be taken with", excluded.join(", "), "hb-links"));
    // a spell it unlocks (AscendedInfo.json), as an artifact's spells are listed
    const spell = jsonExtraAscendedInfo.find((a) => a.id === s.id)?.extraspell;
    if (spell) card.append(SpellList([spell], "Unlocks Spell"));
    // the units it lets the empire's cities draft (StructurePredictions.json, from aow4_diff_tools/citytree.py)
    const units = jsonStructurePredictions?.skills?.[s.id];
    if (units) card.append(WmUnitList("Unlocks", units));
    if (s.kind === "Ascension") {
        const tomes = HbAscensionTomes(s.id);
        const foot = HbFoot("", []);
        if (tomes.length) {
            const sources = foot.querySelector(".sb-sources");
            sources.innerHTML = '<div class="hb-foot-label">' + (tomes.length > 1 ? "One of these tomes researched" : "Tome researched") + "</div>";
            sources.append(...tomes.map((n) => WmElement("div", "sb-source", WmMarkup(HbTomeSource(n)))));
        }
        card.append(foot);
    } else if (s.from.length) {
        card.append(HbFoot(s.from.map((f) => '<div class="sb-source">' + HbSkillSourceText(f) + "</div>").join(""), []));
    }
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Ambitions

// the ambitions a hero can have: those the game hasn't left as a work in progress
function HbAmbitions() {
    return jsonHeroAmbitionsLocalized.filter((a) => !a.screen_description.includes("WIP"));
}

function HbAmbitionCard(a) {
    const who = !a.available_to_rulers ? "Heroes only, not Rulers" : !a.available_to_non_rulers ? "Rulers only" : "";
    const card = HbCard(a.name, "Ambition" + (who ? " · " + who : ""), "/evolved/Icons/AmbitionIcons/" + a.icon + ".png", { description: a.screen_description });
    for (const goal of a.ambitions) {
        const major = goal.type === "major";
        const part = HbPart(major ? "Major Ambition" : "Minor Ambition" + (goal.repeatable ? ", repeatable" : ""));
        part.append(WmElement("div", "hb-goal", WmMarkup(goal.screen_description)));
        part.append(WmElement("div", "hb-reward", WmMarkup("+" + goal.reward_renown + " <renown></renown> Renown" + (goal.repeatable ? " each time" : ""))));
        for (const r of goal.reward_properties) {
            const reward = WmElement("div", "hb-passive hb-reward-skill");
            reward.append(WmElement("div", "hb-passive-name", '<img src="/evolved/Icons/AmbitionIcons/' + r.icon + '.png" alt="" onerror="this.remove()" />' + r.name));
            reward.append(WmElement("div", "", WmMarkup(r.screen_description)));
            part.append(reward);
        }
        card.append(part);
    }
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Governance

// the governors, each once (the dump has the Giant King's for each clan), and whose they are: a ruler type's, or a hero's
const HB_RULER_GOVERNORS = ["champion_governor", "wizard_governor", "dragon_governor", "eldritch_governor", "giant_king_governor", "elder_vampire_governor"];

function HbGovernors() {
    const governors = HbOnce(jsonHeroGovernanceLocalized, (g) => JSON.stringify([g.name, g.level_data]));
    return governors.map((g) => ({
        ...g,
        tab: HB_RULER_GOVERNORS.includes(g.id) ? "Rulers" : "Heroes",
        // a Giant King's for each clan: the giants it lets cities draft
        variant:
            governors.filter((o) => o.name === g.name).length > 1
                ? HbPlain(g.level_data.map((l) => l.effect_description).join(" ")).match(/drafting of (\w+) Giant/)?.[1]
                : null
    }));
}

function HbGovernorCard(g) {
    const card = HbCard(g.name, "Governor", "/evolved/Icons/GovernanceIcons/" + g.icon + ".png", {
        variant: g.variant ? g.variant + " Clan" : null,
        description: "While Governor, the governed city gains benefits based on the Renown level of this Hero:"
    });
    const levels = WmElement("div", "hb-levels");
    for (const level of g.level_data) {
        levels.append(WmElement("div", "hb-level-label", "Renown " + level.level));
        levels.append(WmElement("div", "", WmMarkup(level.effect_description)));
    }
    card.append(levels);
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Pages

const HB_BY_NAME = (a, b) => a.name.localeCompare(b.name);

async function HbEquipmentPage() {
    await HbLoadItemSources();
    const tabIcon = (slot) => {
        const kind = { Primary: "onehanded", Secondary: "shield", Head: "head", Torso: "armor", Legs: "legs", Ring: "ring", Miscellaneous: "amulet" }[slot];
        if (kind) return '<img class="hb-tab-pic" src="/evolved/Icons/ItemForge/' + kind + '.png" alt="" />';
        // a light one: a horse is too dark at the size of a tab's icon
        const mount = jsonHeroItems.find((i) => i.slot === "Mount" && i.name === "Celestial Griffon Mount") || jsonHeroItems.find((i) => i.slot === "Mount");
        return '<img class="hb-tab-pic" src="/evolved/Icons/UnitIcons/' + mount.icon + '.png" alt="" />';
    };
    const tier = HbTier;
    WmBoard(
        Object.entries(HB_SLOTS).map(([slot, label]) => [slot, tabIcon(slot) + " " + label]),
        HbItems(),
        {
            tabsOf: (e) => [e.slot],
            makeCard: HbItemCard,
            choices: [
                {
                    holder: "classes",
                    buttons: HB_CLASSES.map(([name, icon]) => ({
                        label: "<" + icon + "></" + icon + ">",
                        title: name,
                        test: (e) => !HbItemClasses(e).length || HbItemClasses(e).includes(name)
                    }))
                }
            ],
            sorts: [
                { id: "tier", label: "Tier", order: (a, b) => tier(a) - tier(b) || HB_BY_NAME(a, b), group: (e) => ({ name: "Tier " + e.tier_numerals }) },
                { id: "name", label: "Name", order: HB_BY_NAME }
            ]
        }
    );
}

function HbInfusionsPage() {
    const infusions = HbInfusions();
    const points = (n) => n + (n === 1 ? " Point" : " Points");
    const materials = [
        { label: "<pantheon></pantheon>", title: "Pantheon unlock", test: (u) => u.pantheon },
        ...HB_MATERIALS.filter((m) => infusions.some((u) => (u.unlock_requirements || []).some((r) => r.token_name === m))).map((m) => ({
            label: HbMaterialIcon(m),
            title: m,
            test: (u) => (u.unlock_requirements || []).some((r) => r.token_name === m)
        }))
    ];
    const rows = WmBoard(
        [
            ["Damage", "<damagePhysical></damagePhysical> Damage"],
            ["Ability", "<casttactical></casttactical> Ability"],
            ["Passive", "<armor></armor> Passive"]
        ],
        infusions,
        {
            tabsOf: (u) => [u.kind],
            makeCard: HbInfusionCard,
            choices: [
                { holder: "materials", buttons: materials },
                {
                    holder: "itemTypes",
                    buttons: HB_FORGE_KINDS.filter(([id]) => infusions.some((u) => u.fits.has(id))).map(([id, label]) => ({
                        label: '<img src="' + HbKindPicture(id) + '" alt="" />',
                        title: label,
                        test: (u) => u.fits.has(id)
                    }))
                }
            ],
            sorts: [
                { id: "points", label: "Points", order: (a, b) => a.point_cost - b.point_cost || HB_BY_NAME(a, b), group: (u) => ({ name: points(u.point_cost) }) },
                { id: "name", label: "Name", order: HB_BY_NAME }
            ]
        }
    );
    // ?material=Focus Crystals (from the Magic Materials page) picks that material
    const material = new URLSearchParams(location.search).get("material");
    if (material) rows[0][materials.findIndex((m) => m.title === material || material.startsWith(m.title))]?.click();
}

async function HbAscensionPage() {
    const sources = await HbLoadSources();
    const skills = HbSkills(sources).filter((s) => s.kind === "Ascension");
    for (const s of skills) s.affinities = HbAscensionAffinities(s.id);
    const icons = { Order: "empireorder", Chaos: "empirechaos", Nature: "empirenature", Materium: "empirematter", Astral: "empirearcana", Shadow: "empireshadow" };
    WmBoard(
        HB_AFFINITIES.map((a) => [a, "<" + icons[a] + "></" + icons[a] + "> " + a]),
        skills,
        { tabsOf: (s) => s.affinities, makeCard: HbSkillCard, sorts: [{ id: "name", label: "Name", order: HB_BY_NAME }] }
    );
}

function HbAmbitionsPage() {
    WmBoard([["All", "Ambitions"]], HbAmbitions(), {
        tabsOf: () => ["All"],
        makeCard: HbAmbitionCard,
        sorts: [{ id: "name", label: "Name", order: HB_BY_NAME }]
    });
}

function HbGovernancePage() {
    WmBoard(
        [
            ["Rulers", "<unitruler></unitruler> Rulers"],
            ["Heroes", "<unithero></unithero> Heroes"]
        ],
        HbGovernors(),
        { tabsOf: (g) => [g.tab], makeCard: HbGovernorCard, sorts: [{ id: "name", label: "Name", order: HB_BY_NAME }] }
    );
}

async function HbSkillListPage() {
    const sources = await HbLoadSources();
    const skills = HbSkills(sources).filter((s) => s.kind !== "Ascension");
    const classOrder = (s) => HB_CLASSES.findIndex(([n]) => n === s.className);
    const rulerOrder = (s) => Object.values(HB_RULERS).indexOf(s.ruler);
    const signatureOrder = (s) => {
        const i = HB_AFFINITIES.indexOf(s.heading);
        return i === -1 ? 99 : i;
    };
    const place = (s) => (s.kind === "Class" ? classOrder(s) : s.kind === "Ruler" ? rulerOrder(s) : s.kind === "Signature" ? signatureOrder(s) : 0);
    const byTree = (a, b) =>
        place(a) - place(b) ||
        a.heading.localeCompare(b.heading) ||
        (a.tree_pos_y ?? 0) - (b.tree_pos_y ?? 0) ||
        (a.tree_pos_x ?? 0) - (b.tree_pos_x ?? 0) ||
        HB_BY_NAME(a, b);
    WmBoard(
        [
            ["Class", "<unithero></unithero> Class"],
            ["Ruler", "<unitruler></unitruler> Ruler"],
            // the unit panel's Signature Skill button
            ["Signature", '<img class="hb-tab-icon" src="/evolved/Icons/Interface/SignatureSkill.png" alt="" /> Signature'],
            ["Affinity", "<spellbutton></spellbutton> Affinity"],
            ["Other", "<skillpoint></skillpoint> Other"]
        ],
        skills,
        {
            tabsOf: (s) => [s.kind],
            makeCard: HbSkillCard,
            choices: [
                {
                    holder: "classes",
                    buttons: HB_CLASSES.map(([name, icon]) => ({
                        label: "<" + icon + "></" + icon + ">",
                        title: name + ": its tree, and the skills of the other tabs",
                        test: (s) => s.kind !== "Class" || s.className === name
                    }))
                },
                {
                    holder: "kinds",
                    buttons: [
                        { label: "Active", text: true, title: "Skills that give an ability to use", test: (s) => s.active },
                        { label: "Passive", text: true, title: "Skills that work by themselves", test: (s) => !s.active }
                    ]
                }
            ],
            sorts: [
                { id: "tree", label: "Tree", order: byTree, group: (s) => ({ name: s.heading }) },
                { id: "name", label: "Name", order: HB_BY_NAME }
            ]
        }
    );
}
