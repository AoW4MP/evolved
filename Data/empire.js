// What the Empire pages share (Pantheon Tree, Destiny Traits, Faction Traits, Artifacts), and Search's cards for them: the
// Spells and Heroes pages' cards and board (SbCard, HbCard, WmBoard). The things are the dump's where it has them (Traits.json:
// form, society and destiny traits), else the site's own files: Relics.json (aow4_diff_tools' spells.py), FactionCreation.json
// (ruler types, cultures, prophecies), DestinyTraits.json (what a destiny trait asks) and Pantheon_Tree.json. Their texts are
// all.json's. Style/empire.css, Data/heroes.js, Data/worldmap.js and Data/spellbook.js go with it.

const EM_AFFINITIES = [
    ["Astral", "arcana", "empirearcana"],
    ["Nature", "nature", "empirenature"],
    ["Shadow", "shadow", "empireshadow"],
    ["Order", "order", "empireorder"],
    ["Chaos", "chaos", "empirechaos"],
    ["Materium", "matter", "empirematter"]
];

function EmText(key) {
    return key ? findBy(jsonAllFromPOLocalized, "id", key) : undefined;
}

function EmIcon(tag) {
    return "<" + tag + "></" + tag + ">";
}

// ------------------------------------------------------------------------------------------------------------- Artifacts

// the Artifacts page's tabs, by DLC: their ids are the old page's, which a unit's origins link to (ArtifactTab in Builder.js)
const EM_ARTIFACT_TABS = [
    ["Giants", "GIANTKINGS", "Giant Kings"],
    ["Fractured", "RISEFROMRUIN", "Rise from Ruin"],
    ["Secret", "SECRETSOFTHEARCHMAGES", "Secret Spells"],
    ["SilverSeas", "SILVERSEAS", "Silver Seas"]
];

function EmArtifacts() {
    return jsonRelics.map((r) => {
        const text = EmText(r.extraLookup) || {};
        const dlc = (r.DLC || "").trim();
        const spells = (r.spell || []).map((s) => s.id);
        // a secret scroll's text names its spell with a placeholder the game fills: the spell's name, as a link
        const names = spells.map((id) => jsonSpellBook.spells.find((s) => s.id === id)?.name).filter(Boolean);
        const description = (text.description || "").replace(/\{GLOBAL\.[^}]*\.Hyperlink\}/g, () => names.map((n) => "<hyperlink>" + n + "</hyperlink>").join(", "));
        return {
            id: r.id,
            name: text.name || r.name,
            icon: r.icon,
            dlc,
            tab: EM_ARTIFACT_TABS.find(([, key]) => key === dlc)?.[0] || "Giants",
            description,
            lore: text.lore,
            property: r.unlock,
            spells,
            units: (r.unit_unlock || []).map((u) => u.id)
        };
    });
}

function EmArtifactCard(a) {
    const scroll = a.tab === "Secret";
    const card = HbCard(a.name, (scroll ? "<spellbutton></spellbutton> Secret Scroll" : "<artifact></artifact> Artifact"), "/evolved/Icons/RelicIcons/" + a.icon + ".png", {
        dlc: a.dlc,
        description: a.description
    });
    card.classList.add("em-card");
    // a menhir's blessing: the unit property its text links to, spelled out
    if (a.property) {
        const property = EmText(a.property);
        const name = a.description.match(/RELIC_UNIT_PROP\]([^[]+)\[/)?.[1] || "Unit property";
        if (property?.description) card.append(EmPassive(name, property.description));
    }
    if (a.spells.length) card.append(SpellList(a.spells, a.spells.length === 1 ? "Unlocks Spell" : "Unlocks Spells"));
    if (a.units.length) card.append(WmUnitList("Unlocks", a.units));
    if (a.lore) card.append(WmElement("div", "wm-lore em-lore", WmMarkup(a.lore)));
    return card;
}

// a named effect in a card, as a hero skill's passive (heroes.css)
function EmPassive(name, text, icon) {
    const block = WmElement("div", "hb-passive");
    block.append(WmElement("div", "hb-passive-name", (icon ? '<img src="' + icon + '" alt="" onerror="this.remove()" />' : "") + name));
    block.append(WmElement("div", "", WmMarkup(text)));
    return block;
}

function EmArtifactsPage() {
    const artifacts = EmArtifacts();
    WmBoard(
        EM_ARTIFACT_TABS.map(([id, key, label]) => [id, '<img class="em-tab-logo" src="' + dlcMap[key].src + '" alt="" /> ' + label]),
        artifacts,
        { tabsOf: (a) => [a.tab], makeCard: EmArtifactCard, sorts: [{ id: "name", label: "Name", order: (a, b) => a.name.localeCompare(b.name) }] }
    );
}

// ------------------------------------------------------------------------------------------------------------- Traits

// the form traits' groups, in this order
const EM_FORM_GROUPS = ["Offense", "Defense", "Utility", "Mounts", "Adaptations", "Flaws"];

// the dump's form, society and destiny traits that are in use; the Visions are the Prophecy tab's (EmProphecies)
function EmTraits() {
    return jsonFactionCreation2Localized
        .filter((t) => t.enabled && t.id && !t.id.startsWith("vision_of_"))
        .map((t) => {
            const affinities = [];
            let alignment = 0;
            for (const a of t.affinities || []) {
                const amount = parseInt(a.name, 10);
                const affinity = EM_AFFINITIES.find(([, tag]) => a.name.includes("<" + tag + ">"));
                if (affinity) affinities.push({ name: affinity[0], tag: affinity[1], amount });
                else if (/Alignment/.test(a.name)) alignment = amount;
            }
            return {
                id: t.id,
                name: t.name,
                plain: HbPlain(t.name),
                kind: t.type,
                group: t.group_name || "",
                order: t.display_order,
                points: t.point_cost,
                dlc: (t.DLC || "").trim(),
                icon: "/evolved/Icons/TraitIcons/" + t.icon + ".png",
                lore: t.lore_description,
                effects: (t.effect_descriptions || []).map((e) => e.name),
                bonuses: t.starting_bonuses || [],
                incompatible: (t.incompatible_society_traits || []).map((i) => i.name),
                affinities,
                alignment,
                // the society traits the faction creator doesn't show at first are the Pantheon's (Pantheon_Tree.json has them all)
                pantheon: t.type === "society" && !t.front_end,
                units: jsonStructurePredictions?.traits?.[t.id] || []
            };
        });
}

// a starting bonus: an empire skill or a city structure the trait gives, or its own words
function EmBonus(b) {
    if (b.empire_progression_slug) {
        const skill = findBy(jsonEmpireLocalized, "id", b.empire_progression_slug);
        return "Start with the Empire Skill " + (skill ? "<hyperlink>" + HbPlain(skill.name) + "</hyperlink>" : b.empire_progression_slug);
    }
    if (b.structure_upgrade_slug) {
        const structure = findBy(jsonStructureUpgradesLocalized, "id", b.structure_upgrade_slug);
        return (
            'Start with the <a href="/evolved/HTML/Spells.html?structure=' + b.structure_upgrade_slug + '" target="_blank">' +
            (structure ? HbPlain(structure.name) : b.structure_upgrade_slug) + "</a> structure"
        );
    }
    return b.description || "";
}

function EmBullets(lines) {
    return "<bulletlist>" + lines.map((l) => "<bullet>" + l + "</bullet>").join("") + "</bulletlist>";
}

function EmTraitType(t) {
    if (t.kind === "form") return "<unit></unit> Form Trait · " + t.group;
    if (t.kind === "destiny") return "<questpoints></questpoints> Destiny Trait";
    const affinities = t.affinities.map((a) => EmIcon(a.tag)).join("");
    return (affinities || "<empiregeneral></empiregeneral>") + " Society Trait" + (t.pantheon ? " · <pantheon></pantheon> Pantheon" : "");
}

function EmTraitCard(t) {
    const card = HbCard(t.name, EmTraitType(t), t.icon, { dlc: t.dlc, description: t.lore });
    card.classList.add("em-card");
    if (t.effects.length) card.append(HbPart("Effects", WmMarkup(EmBullets(t.effects))));
    if (t.kind === "destiny") EmDestinyQuest(t, card);
    const bonuses = t.bonuses.map(EmBonus).filter(Boolean);
    if (bonuses.length) card.append(HbPart("Starting Bonus", WmMarkup(EmBullets(bonuses))));
    if (t.incompatible.length) card.append(HbPart("Incompatible With", WmMarkup(t.incompatible.join(", ")), "em-incompatible"));
    if (t.units.length) card.append(WmUnitList("Unlocks", t.units));
    const facts = [];
    if (t.kind === "form") facts.push(t.points + (t.points === 1 ? " Point" : " Points"));
    if (t.alignment) facts.push((t.alignment > 0 ? "+" : "") + t.alignment + " Alignment");
    for (const a of t.affinities) facts.push("+" + a.amount + " " + EmIcon(a.tag) + " " + a.name);
    if (facts.length) card.append(HbFoot("", facts));
    return card;
}

// how a destiny trait comes: its quest and what that asks (DestinyTraits.json)
function EmDestinyQuest(t, card) {
    const trigger = findBy(jsonDestinyTriggers, "id", t.id);
    if (!trigger) return;
    // "EventUnit <eventColor>{Sons/Daughters}</eventColor> of War": the quest's name either way
    const title = (EmText(trigger.quest)?.title || "").replace(/^EventUnit\s*/, "").replace(/\{([^}]*)\}/g, "$1");
    const part = HbPart("Gained by", "<quest></quest> Quest: " + HbPlain(title), "em-quest");
    part.append(WmElement("div", "em-needs", WmMarkup("When all of these hold:" + EmBullets(trigger.trigger.map((e) => e.entry)))));
    card.append(part);
}

function EmDestinyPage() {
    const traits = EmTraits()
        .filter((t) => t.kind === "destiny")
        .map((t) => ({ ...t, tab: "Destiny" }));
    WmBoard([["All", "Destiny Traits"]], traits, {
        tabsOf: () => ["All"],
        makeCard: EmTraitCard,
        sorts: [{ id: "name", label: "Name", order: (a, b) => a.plain.localeCompare(b.plain) }]
    });
}

// ------------------------------------------------------------------------------------------------------------- Prophecies

// the Archon Prophecy's three Visions (society traits) and what each asks and gives by the affinity it is read as
// (FactionCreation.json's SubSociety entries)
function EmProphecies() {
    const visions = ["vision_of_destiny", "vision_of_promise", "vision_of_ruin"];
    const out = [];
    visions.forEach((id, rank) => {
        const t = findBy(jsonFactionCreation2Localized, "id", id);
        out.push({
            id,
            name: t.name,
            plain: t.name,
            vision: t.name,
            rank,
            place: -1,
            kind: "vision",
            dlc: (t.DLC || "").trim(),
            icon: "/evolved/Icons/TraitIcons/" + t.icon + ".png",
            lore: t.lore_description,
            effects: (t.effect_descriptions || []).map((e) => e.name)
        });
        for (const v of jsonFactionCreation.filter((e) => e.type === "SubSociety" && e.requirement === t.name)) {
            const affinity = EM_AFFINITIES.findIndex(([, , empire]) => v.affinity.includes("<" + empire + ">"));
            // "Visions of Destiny : Astral Affinity: Scholars" is Scholars; "Visions of Promise: Order" is Order
            const name = v.name.split(":").pop().trim();
            out.push({
                id: v.id,
                name: name.replace(/ Affinity$/, ""),
                plain: name,
                vision: t.name,
                rank,
                place: affinity,
                kind: "reading",
                affinity: EM_AFFINITIES[affinity],
                dlc: (v.DLC || "").trim(),
                icon: "/evolved/Icons/FactionCreation/" + v.id + ".png",
                objective: EmText(v.objective),
                rewards: (v.rewards || []).map(EmText).filter(Boolean),
                units: (v.unit_unlocks || []).map((u) => u.slug)
            });
        }
    });
    return out;
}

// what a vision's completion gives: the reward texts' parts, in the order the old page showed them
const EM_REWARD_PARTS = ["city_cap_buff", "throne_city_buff", "unit_reward", "war", "war_houses"];

function EmProphecyCard(p) {
    if (p.kind === "vision") {
        const card = HbCard(p.name, "<questpoints></questpoints> Prophecy · Society Trait", p.icon, { dlc: p.dlc, description: p.lore });
        card.classList.add("em-card", "em-vision");
        card.append(HbPart("Effects", WmMarkup(EmBullets(p.effects))));
        return card;
    }
    const [affinity, tag] = p.affinity;
    const card = HbCard(p.name, EmIcon(tag) + " " + affinity + " · " + p.vision, p.icon, { dlc: p.dlc });
    card.classList.add("em-card");
    const objective = p.objective || {};
    const goals = ["objective_1", "objective_2", "objective_3"].map((k) => objective[k]).filter(Boolean);
    if (goals.length) card.append(HbPart("Objective", WmMarkup(goals.join("<br>"))));
    const rewards = [];
    for (const r of p.rewards) {
        for (const k of EM_REWARD_PARTS) if (r[k]) rewards.push(r[k]);
        if (r.name || r.description) rewards.push((r.name ? "<b>" + r.name + "</b><br>" : "") + (r.description || ""));
    }
    if (rewards.length) card.append(HbPart("Rewards", WmMarkup(EmBullets(rewards))));
    if (p.units.length) card.append(WmUnitList("Rally Units", p.units));
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Ruler types, cultures

// a ruler type or culture of FactionCreation.json: its texts, as the faction creator shows them (bio, lore, bullets)
function EmCreatorText(e) {
    const parts = [];
    for (const key of [e.extraLookup, e.extraLookup2]) {
        const text = EmText(key);
        if (!text) continue;
        for (const k of ["bio", "lore", "fpg_description", "description"]) {
            if (text[k] && !(k === "description" && text.fpg_description)) parts.push(text[k]);
        }
    }
    return parts.join("<br>").replace(/^(<br>)+/, "");
}

function EmRulerTypes() {
    return jsonFactionCreation
        .filter((e) => e.type === "Ruler Origin")
        .map((e) => ({
            id: e.id,
            name: e.name,
            plain: e.name,
            dlc: (e.DLC || "").trim(),
            icon: "/evolved/Icons/FactionCreation/" + e.icon + ".png",
            description: EmCreatorText(e),
            subtypes: jsonFactionCreation.filter((s) => s.type === "SubType" && s.requirement === e.name)
        }));
}

function EmRulerCard(r) {
    const card = HbCard(r.name, "<unitruler></unitruler> Ruler Type", r.icon, { dlc: r.dlc, description: r.description });
    card.classList.add("em-card", "em-portrait");
    if (r.subtypes.length) {
        const part = HbPart(r.name === "Dragon Lord" ? "Dragon Types" : r.name === "Giant King" ? "Clans" : "Bloodlines");
        for (const s of r.subtypes) {
            const text = EmText(s.extraLookup);
            const affinity = EM_AFFINITIES.find(([, , empire]) => (s.affinity || "").includes("<" + empire + ">"));
            part.append(EmPassive((affinity ? EmIcon(affinity[1]) + " " : "") + s.name, text?.description || text?.lore || ""));
        }
        card.append(part);
    }
    return card;
}

function EmCultures() {
    return jsonFactionCreation
        .filter((e) => e.type === "Culture")
        .map((e) => ({
            id: e.id,
            name: e.name,
            plain: e.name,
            dlc: (e.DLC || "").trim(),
            icon: "/evolved/Icons/FactionCreation/" + e.icon + ".png",
            affinities: EM_AFFINITIES.filter(([, , empire]) => (e.affinity || "").includes("<" + empire + ">")),
            description: EmCreatorText(e),
            subcultures: jsonFactionCreation.filter((s) => s.type === "SubCulture" && s.requirement === e.name),
            incompatible: (e.incompatible || []).map((i) => i.name)
        }));
}

function EmCultureCard(c) {
    const type = (c.affinities.map(([, tag]) => EmIcon(tag)).join("") || "<empiregeneral></empiregeneral>") + " Culture";
    const card = HbCard(c.name, type, c.icon, { dlc: c.dlc, description: c.description });
    card.classList.add("em-card");
    if (c.subcultures.length) {
        const part = HbPart("Subcultures");
        // those the data has no text for (Architect's six, Mercantile's two) are named on one line
        const bare = [];
        for (const s of c.subcultures) {
            const text = EmText(s.extraLookup)?.description || s.description;
            const name = s.name.replace(c.name + " - ", "");
            if (!text) bare.push(name);
            else part.append(EmPassive(name, text, s.icon ? "/evolved/Icons/FactionCreation/" + s.icon + ".png" : ""));
        }
        if (bare.length) part.append(WmElement("div", "", bare.join(", ")));
        card.append(part);
    }
    if (c.incompatible.length) card.append(HbPart("Incompatible With", WmMarkup(c.incompatible.join(", ")), "em-incompatible"));
    card.append(HbFoot('<a href="/evolved/HTML/' + c.name + 'Units.html" target="_blank">' + c.name + " units</a>", []));
    return card;
}

// ------------------------------------------------------------------------------------------------------------- Faction Traits page

// what the Faction Traits and Destiny Traits pages show, each with its tab: Search's too, and Spells.html?trait=
function EmFactionThings() {
    const tabs = { form: "Form", society: "Society", destiny: "Destiny" };
    return [
        ...EmTraits().map((t) => ({ ...t, tab: tabs[t.kind] })),
        ...EmProphecies().map((p) => ({ ...p, tab: "Prophecy" })),
        ...EmRulerTypes().map((r) => ({ ...r, tab: "Rulers" })),
        ...EmCultures().map((c) => ({ ...c, tab: "Cultures" }))
    ];
}

function EmFactionCard(e) {
    if (e.tab === "Prophecy") return EmProphecyCard(e);
    if (e.tab === "Rulers") return EmRulerCard(e);
    if (e.tab === "Cultures") return EmCultureCard(e);
    return EmTraitCard(e);
}

// a thing's words, for Search: its names and texts
function EmFactionWords(e) {
    const texts = (list) => list.map((s) => {
        const t = EmText(s.extraLookup);
        return [s.name, t?.description, t?.lore, s.description];
    });
    return [
        e.name, e.group, e.vision, e.pantheon && "Pantheon", e.lore, e.description, e.effects, (e.bonuses || []).map(EmBonus), e.incompatible,
        e.objective && Object.values(e.objective), (e.rewards || []).map((r) => Object.values(r)),
        texts(e.subtypes || []), texts(e.subcultures || [])
    ];
}

function EmFactionPage() {
    const things = EmFactionThings().filter((e) => e.tab !== "Destiny");
    const makeCard = EmFactionCard;
    const byName = (a, b) => a.plain.localeCompare(b.plain);
    const groupOf = (e) => {
        if (e.tab === "Form") return { name: e.group };
        if (e.tab === "Society") return { name: e.pantheon ? "Pantheon" : e.affinities[0]?.name || "Other" };
        if (e.tab === "Prophecy") return { name: e.vision };
        return { name: "" };
    };
    const place = (e) => {
        if (e.tab === "Form") return EM_FORM_GROUPS.indexOf(e.group) * 100 + e.order;
        if (e.tab === "Society") return e.pantheon ? 99 : EM_AFFINITIES.findIndex(([n]) => n === e.affinities[0]?.name);
        if (e.tab === "Prophecy") return e.rank * 10 + e.place;
        return 0;
    };
    // an affinity a thing has: a trait's, a prophecy reading's or a culture's
    const hasAffinity = (e, name) => (e.affinities || []).some((a) => (a.name || a[0]) === name) || e.affinity?.[0] === name;
    WmBoard(
        [
            ["Form", "<unit></unit> Form Traits"],
            ["Society", "<empiregeneral></empiregeneral> Society Traits"],
            ["Prophecy", "<questpoints></questpoints> Prophecies"],
            ["Rulers", "<unitruler></unitruler> Ruler Types"],
            ["Cultures", '<img class="wm-tab-pic" src="/evolved/Icons/Interface/DropdownIcons/CultureUnitsIcon.png" alt="" /> Cultures']
        ],
        things,
        {
            tabsOf: (e) => [e.tab],
            makeCard,
            choices: [
                {
                    holder: "affinities",
                    buttons: EM_AFFINITIES.map(([name, tag]) => ({ label: EmIcon(tag), title: name + " Affinity", test: (e) => hasAffinity(e, name) }))
                },
                {
                    holder: "kinds",
                    buttons: [
                        { label: "<pantheon></pantheon>", title: "Unlocked in the Pantheon", test: (e) => e.pantheon },
                        { label: "<goodact></goodact>", title: "Good alignment", test: (e) => e.alignment > 0 },
                        { label: "<evilact></evilact>", title: "Evil alignment", test: (e) => e.alignment < 0 }
                    ]
                }
            ],
            sorts: [
                { id: "group", label: "Group", order: (a, b) => place(a) - place(b) || byName(a, b), group: groupOf },
                {
                    id: "points",
                    label: "Points",
                    order: (a, b) => (a.points ?? 0) - (b.points ?? 0) || byName(a, b),
                    group: (e) => (e.tab === "Form" ? { name: e.points + (e.points === 1 ? " Point" : " Points") } : groupOf(e))
                },
                { id: "name", label: "Name", order: byName }
            ]
        }
    );
}

// ------------------------------------------------------------------------------------------------------------- Pantheon Tree

// the Pantheon's rewards by kind: [id, label, the frame's class]. A node's kind is read from its id and picture, as upstream did
const EM_PANTHEON_KINDS = [
    ["trait", "Society Traits"],
    ["origin", "Origins"],
    ["infusion", "Infusions"],
    ["mount", "Mounts"],
    ["weapon", "Weapons"],
    ["trinket", "Trinkets"],
    ["outfit", "Outfits"],
    ["banner", "Banners"],
    ["realm", "Realms"]
];
const EM_PANTHEON_KIND_NAMES = {
    trait: "Society Trait",
    origin: "Ruler Origin",
    infusion: "Infusion",
    mount: "Mount",
    weapon: "Item Forge Weapon",
    trinket: "Item Forge Trinket",
    outfit: "Outfit",
    banner: "Banner Icon",
    realm: "Realm"
};
// the two pages of the Pantheon, and the parts of a page upstream laid out apart; only some are named
const EM_PANTHEON_SECTIONS = {
    "Page 1 Realms": "Realms",
    "Page 1 Extra's": "DLC Outfits"
};

function EmPantheonKind(x) {
    for (const k of ["trait", "origin", "infusion", "weapon", "trinket"]) if (x.id.endsWith("_" + k)) return k;
    if (x.id.endsWith("_mount") || x.icon.endsWith("_mount")) return "mount";
    if (x.icon.endsWith("_banner")) return "banner";
    if (x.id.endsWith("_outfit") || x.icon.endsWith("_outfit")) return "outfit";
    if (x.tree_name.endsWith("Realms")) return "realm";
    return "outfit";
}

function EmPantheonThings() {
    const names = EmText("META_EMPIRE@PROGRESSION_ITEM") || {};
    const traits = EmTraits();
    const infusions = HbInfusions();
    const items = HbItems();
    const bare = (id) => id.replace(/^_pantheon___/, "").replace(/__(good|evil)act__$/, "");
    return jsonPantheon.map((x) => {
        const kind = EmPantheonKind(x);
        const text = EmText(x.extraLookup) || {};
        let name = text.origin_name || text.trait_name || text.name || names[x.id] || x.id;
        let description = text.origin_description || "";
        if (kind === "realm") {
            const realm = EmText(x.extraLookupExplicit) || {};
            name = realm[x.suffix] || name;
            description = realm.subtitle || "";
        } else if (x.extraLookupExplicit) {
            name = EmText(x.extraLookupExplicit)?.[x.suffix] || name;
        }
        name = HbPlain(name);
        const thing = {
            id: x.id,
            kind,
            name,
            icon: "/evolved/Icons/Pantheon/" + x.icon + ".png",
            dlc: (x.DLC || "").trim(),
            page: x.tree_name.startsWith("Page 2") ? "Page2" : "Page1",
            section: x.tree_name,
            x: x.tree_pos_x,
            y: x.tree_pos_y,
            required: (x.required_skills || []).map((r) => r.id),
            description
        };
        // the thing itself, where the site has its card: the society trait, the Item Forge's infusion, the mount
        if (kind === "trait") thing.trait = traits.find((t) => bare(t.id) === x.icon || bare(t.id) + "_trait" === x.id || t.plain === name);
        // an infusion by its id among the Pantheon's ("fearless_infusion" is fearless_infusion_equipment_upgrade, "nullify_infusion"
        // defense_mode_nullify_infusion_equipment_upgrade): the Pantheon calls it "Fearless Passive Item Infusion"
        const base = x.id.replace(/_infusion$/, "");
        // or by that name less its kind ("innate_spelljammer_infusion" is Innate Spell Jammer, "banshee_wail_infusion" Wail of the Banshee)
        const plain = name.replace(/ (Passive|Active Ability)( Item)? Infusion$/, "").toLowerCase();
        if (kind === "infusion")
            thing.infusion = infusions.find((u) => u.pantheon && ((u.ids || [u.id]).some((id) => id.includes(base)) || u.name.toLowerCase() === plain));
        // "Inferno Hound Exotic Mount" is the Inferno Hound Mount
        const mount = name.toLowerCase().replace(" exotic", "");
        if (kind === "mount") thing.item = items.find((i) => i.slot === "Mount" && i.name.toLowerCase() === mount);
        if (thing.trait) thing.name = thing.trait.plain;
        return thing;
    });
}

function EmPantheonCard(p) {
    if (p.trait) return EmTraitCard(p.trait);
    if (p.infusion) return HbInfusionCard(p.infusion);
    if (p.item) return HbItemCard(p.item);
    const card = HbCard(p.name, "<pantheon></pantheon> " + EM_PANTHEON_KIND_NAMES[p.kind], p.icon, { dlc: p.dlc, description: p.description });
    card.classList.add("em-card");
    // a cosmetic is its picture: shown large
    if (!p.description) card.append(WmElement("div", "em-pan-picture", '<img src="' + p.icon + '" alt="" />'));
    return card;
}

// a node of the tree, in its kind's frame, its card on hover
function EmPantheonNode(p) {
    const node = WmElement("div", "em-pan-node em-pan-" + p.kind, '<img src="' + p.icon + '" alt="" />');
    node.style.left = p.x + "px";
    node.style.top = p.y + "px";
    if (p.dlc && dlcMap[p.dlc]) node.append(WmElement("span", "em-pan-dlc", '<img src="' + dlcMap[p.dlc].src + '" alt="" />'));
    const tip = document.createElement("span");
    tip.append(EmPantheonCard(p));
    node.dataset.search = (p.name + " " + EM_PANTHEON_KIND_NAMES[p.kind] + " " + tip.textContent).toLowerCase();
    addTooltipListeners(node, tip);
    return node;
}

// a part of a page: its nodes where the data places them, joined by lines to the nodes they follow
function EmPantheonSection(name, things) {
    const PAD = 10;
    const NODE = 50;
    const minX = Math.min(...things.map((p) => p.x));
    const minY = Math.min(...things.map((p) => p.y));
    const at = new Map(things.map((p) => [p.id, { x: p.x - minX + PAD, y: p.y - minY + PAD }]));
    const section = WmElement("div", "em-pan-section");
    if (EM_PANTHEON_SECTIONS[name]) section.append(WmElement("div", "em-pan-title", EM_PANTHEON_SECTIONS[name]));
    const field = WmElement("div", "em-pan-field");
    for (const p of things) {
        for (const id of p.required) {
            const from = at.get(id);
            if (!from) continue;
            const to = at.get(p.id);
            const [x1, y1, x2, y2] = [from.x + NODE / 2, from.y + NODE / 2, to.x + NODE / 2, to.y + NODE / 2];
            const line = WmElement("div", "em-pan-line");
            line.style.left = x1 + "px";
            line.style.top = y1 + "px";
            line.style.width = Math.hypot(x2 - x1, y2 - y1) + "px";
            line.style.transform = "rotate(" + Math.atan2(y2 - y1, x2 - x1) + "rad)";
            line.dataset.from = id;
            line.dataset.to = p.id;
            field.append(line);
        }
    }
    for (const p of things) {
        const node = EmPantheonNode({ ...p, ...at.get(p.id) });
        p.node = node;
        field.append(node);
    }
    field.style.width = Math.max(...[...at.values()].map((v) => v.x)) + NODE + PAD + "px";
    field.style.height = Math.max(...[...at.values()].map((v) => v.y)) + NODE + PAD + "px";
    section.append(field);
    return section;
}

async function EmPantheonPage() {
    await HbLoadItemSources();
    const things = EmPantheonThings();
    const pages = [
        ["Page1", "Page 1"],
        ["Page2", "Page 2"]
    ];
    const entries = pages.map(([id, label]) => {
        const here = things.filter((p) => p.page === id);
        const panel = WmElement("div", "em-pan-page");
        const board = WmElement("div", "em-pan-board");
        const sections = [...new Set(here.map((p) => p.section))];
        for (const s of sections) board.append(EmPantheonSection(s, here.filter((p) => p.section === s)));
        // a window too narrow for the tree scrolls it alone, as the Empire Tree's
        const scroll = WmElement("div", "em-pan-scroll");
        scroll.append(board);
        panel.append(scroll);
        return { id, label, count: here.length, panel };
    });
    WmTabs(entries);

    // the search and a kind's button light up what they find and dim the rest; the tabs count what is lit
    let typed = [];
    let kind = null;
    function Light() {
        const lit = {};
        for (const p of things) {
            const on = (!kind || p.kind === kind) && typed.every((w) => p.node.dataset.search.includes(w));
            p.node.classList.toggle("em-pan-dim", !on);
            if (on) lit[p.page] = (lit[p.page] || 0) + 1;
        }
        document.querySelectorAll("#tabs .wm-tab").forEach((t) => (t.querySelector(".wm-count").textContent = lit[t.dataset.id] || 0));
        document.querySelectorAll(".em-pan-line").forEach((l) => l.classList.toggle("em-pan-dim", Boolean(kind || typed.length)));
    }
    document.getElementById("filterInput").addEventListener("input", (event) => {
        typed = event.target.value.toLowerCase().split(/\s+/).filter(Boolean);
        Light();
    });
    const holder = document.getElementById("kinds");
    for (const [id, label] of EM_PANTHEON_KINDS) {
        const count = things.filter((p) => p.kind === id).length;
        const button = WmElement("button", "wm-choice wm-choice-text em-pan-choice", '<span class="em-pan-swatch em-pan-' + id + '"></span>' + label);
        button.title = count + " " + label.toLowerCase();
        button.onclick = () => {
            kind = kind === id ? null : id;
            holder.querySelectorAll(".wm-choice").forEach((b) => b.classList.toggle("selected", b === button && kind === id));
            Light();
        };
        holder.append(button);
    }
}
