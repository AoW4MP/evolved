// Spells, siege projects and the world map's sites come from the files their own pages read, made from the game and the mod
// (aow4_diff_tools: spells.py, ancientwonders.py, magicmaterials.py, worldmap.py); so do the cards shown for them. So do the
// hero skills, equipment, infusions, ambitions and governors: the Heroes pages' things (Data/heroes.js), what no one can
// get left out
let searchBooks = null;

async function LoadSearchBooks() {
    const read = (name) => fetch("/evolved/Data/GEN/" + name + ".json").then((res) => res.json());
    const [book, infestations, landmarks, happenings, , , heroSources] = await Promise.all([
        SbLoad(),
        read("Infestations"),
        read("Landmarks"),
        read("Happenings"),
        AncientWondersPage.Load(),
        MagicMaterialsPage.Load(),
        HbLoadSources(),
        HbLoadItemSources()
    ]);
    // the dump's DLC, as the books' own (a trailing space in the dump)
    const withDlc = (list) => list.map((e) => ({ ...e, dlc: (e.DLC || "").trim() || null }));
    searchBooks = {
        spells: book.spells,
        siege: book.siege,
        infestations: infestations.infestations,
        landmarks: landmarks.landmarks,
        happenings: happenings.happenings,
        wonders: AncientWondersPage.All(),
        materials: MagicMaterialsPage.All(),
        heroSkills: withDlc(HbSkills(heroSources)),
        heroItems: withDlc(HbItems()),
        infusions: withDlc(HbInfusions()),
        ambitions: withDlc(HbAmbitions()),
        governors: HbGovernors()
    };
}

// the names and texts of the abilities a hero skill, item or infusion gives
function SearchAbilities(slugs) {
    return (slugs || []).map((a) => {
        const ability = HbAbilityOf(a.slug);
        return ability ? [ability.name, ability.description, (ability.modifiers || []).map((m) => [m.name, m.description])] : [];
    });
}

// a thing's text, as words: without links, icons and other markup
function SearchWords(parts) {
    return parts
        .flat(Infinity)
        .filter(Boolean)
        .join(" ")
        .replace(/\[\/?[^\]]*\]|<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .toUpperCase();
}

const SEARCH_WORDS = {
    spells: (e) => [e.name, e.variant, e.type, e.description, e.requisites, e.units, e.sources.map((s) => s.name)],
    siege: (e) => [e.name, e.description, e.sources.map((s) => s.name)],
    infestations: (e) => [e.name, e.tier, e.description, e.lore, e.pools.map((p) => [p.label, p.units, p.others])],
    landmarks: (e) => [e.name, e.lore, e.adjacent, e.city, e.enchantments.map((x) => [x.name, x.description]), e.units],
    happenings: (e) => [e.name, e.category, e.sub, e.description, e.story?.text, e.story?.options, e.events?.map((v) => [v.text, v.options.map((o) => o.text)]), e.units],
    wonders: (e) => [e.name, e.tier, e.description, e.lore, e.units, e.stories.map((s) => [s.title, s.names])],
    materials: (e) => [e.name, e.description, e.lore, e.combat?.name, e.combat?.description, e.set?.name, e.set?.category, e.set?.description],
    heroSkills: (e) => [e.name, e.description, e.heading, e.className, e.ruler, SearchAbilities(e.abilities), e.from.map((f) => f.name)],
    heroItems: (e) => [e.name, e.description, HB_SLOTS[e.slot], SearchAbilities(e.ability_slugs), HbItemSourceLines(e)],
    infusions: (e) => [e.name, e.description, e.kind, SearchAbilities(e.abilities), (e.unlock_requirements || []).map((r) => r.token_name)],
    ambitions: (e) => [e.name, e.screen_description, e.ambitions.map((g) => [g.screen_description, g.reward_properties.map((r) => [r.name, r.screen_description])])],
    governors: (e) => [e.name, e.variant, e.tab, e.level_data.map((l) => l.effect_description)]
};

function returnFromBook(book, fieldToSearch) {
    if (!fieldToSearch) return [];
    if (DLCCheck(fieldToSearch)) return searchBooks[book].filter((e) => e.dlc === fieldToSearch.toUpperCase());
    const search = fieldToSearch.replaceAll("_", " ").toUpperCase();
    return searchBooks[book].filter((e) => SearchWords(SEARCH_WORDS[book](e)).includes(search));
}

// a tab of results from a book, its cards in a grid when small
function ShowFromBook(title, list, makeCard, grid) {
    if (list.length === 0) return;
    SetCollapsibleButtonsAndDivs(title, list, "searchBook");
    const holder = document.getElementById(title);
    const cards = list.map(makeCard);
    if (grid) {
        const cardsHolder = WmElement("div", "sb-cards");
        cardsHolder.append(...cards);
        holder.append(cardsHolder);
    } else {
        holder.append(...cards);
    }
}

const excludeListStructures = [
    "shadow_focus_crystal",
    "nature_focus_crystal",
    "materium_focus_crystal",
    "chaos_focus_crystal",
    "order_focus_crystal",
    "astral_focus_crystal"
];

const filterMap = {
    unitsCheck: "u",
    namesCheck: "un",
    abilityNamesCheck: "an",
    abilityDescriptionCheck: "ad",
    passivesCheck: "p",
    resistancesCheck: "r",
    spellsCheck: "s",
    siegeCheck: "sg",
    heroSkillsCheck: "hs",
    heroItemsCheck: "hi",
    ambitionsCheck: "ha",
    governanceCheck: "hg",
    worldStructuresCheck: "ws",
    happeningsCheck: "ch",
    cityStructuresCheck: "cs",
    factionTraitCheck: "ft",
    empireTreeCheck: "et",
    artifactCheck : "ar",
    infusionsCheck: "i"
};

const input = document.getElementById("searchInput");
const output = document.getElementById("searchOutput");
const result = document.getElementById("searchResult");

// unit checks
const unitsChecked = document.getElementById("unitsCheck");
const namesChecked = document.getElementById("namesCheck");
const abilityNamesChecked = document.getElementById("abilityNamesCheck");
const abilityDescriptionChecked = document.getElementById("abilityDescriptionCheck");
const passivesChecked = document.getElementById("passivesCheck");
const resistancesChecked = document.getElementById("resistancesCheck");

// rest checks
const spellsChecked = document.getElementById("spellsCheck");
const siegeChecked = document.getElementById("siegeCheck");
const artifactChecked = document.getElementById("artifactCheck");
const empireTreeChecked = document.getElementById("empireTreeCheck");
const heroSkillChecked = document.getElementById("heroSkillsCheck");
const factionTraitsChecked = document.getElementById("factionTraitCheck");
const heroItemsChecked = document.getElementById("heroItemsCheck");
const worldStructuresChecked = document.getElementById("worldStructuresCheck");
const happeningsChecked = document.getElementById("happeningsCheck");
const cityStructuresChecked = document.getElementById("cityStructuresCheck");
const ambitionsChecked = document.getElementById("ambitionsCheck");
const governanceChecked = document.getElementById("governanceCheck");
const infusionsChecked = document.getElementById("infusionsCheck");

const deprecatedCheckList = ["000003e300005fe2", "000003e300005fe5", "000003e300005fe7", "000003e300005fe6"];
const invalidUnitCheckList = ["fracture", "townsman"];

function normalizeText(str) {
    return Sanitize(str || "").toUpperCase();
}

function matches(text, keyword) {
    return normalizeText(text).includes(keyword);
}

function pushUnique(set, value) {
    if (value) set.add(value);
}

function isInArray(array, search) {
    return array.indexOf(search) >= 0;
}

async function rememberSearch() {
    // filter settings
    const rawSearch = window.location.search.replace(/&amp;/g, "&");
    let params = new URLSearchParams(rawSearch);
    const filters = (params.get("f") || "").split(",");
    if (filters != "") {
        for (const [id, code] of Object.entries(filterMap)) {
            const el = document.getElementById(id);
            if (el) el.checked = filters.includes(code);
        }
    }
    // restore keyword too, if you have it
    const keyword = params.get("q") || "";
    if (keyword != "") {
        input.value = keyword;
        searchData(searchKeyword);
    }
}

function getActiveFilters() {
    const active = [];
    for (const [id, code] of Object.entries(filterMap)) {
        const el = document.getElementById(id);
        if (el && el.checked) active.push(code);
    }
    return active.join(",");
}

function restoreFiltersFromURL() {}

function searchData(keywords) {
    let filter = "";

    output.innerHTML = "";
    if (keywords != undefined) {
        filter = keywords.toUpperCase();
    } else {
        filter = input.value.toUpperCase();
        keywords = input.value;
    }

    let test = filter;
    searchAll(test);
    let currenturl = window.location.href.split("?")[0];

    const filterState = getActiveFilters(); // f = filters

    const params = new URLSearchParams();
    params.set("q", keywords);
    params.set("f", getActiveFilters()); // f = filters
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);

    // window.history.replaceState({}, "foo", currenturl + "?search=" + keywords + ":" + filterState);

    // extra tooltip after search is done
    setTimeout(function () {
        HandleExtraTooltips();
    }, 2000);
}

function depCheckResID(resid) {
    let unitEN = findBy(jsonUnits, "resid", resid);
    if (invalidUnitCheckList.includes(unitEN.id)) {
        return true;
    }
    let unit = findBy(jsonUnitsLocalized, "resid", resid);
    if (unit != undefined) {
        for (let l = 0; l < unit.primary_passives.length; l++) {
            if (deprecatedCheckList.includes(unit.primary_passives[l].slug)) {
                return true;
            }
        }
    }
    return false;
}



function DLCCheck(fieldToSearch) {
    return fieldToSearch.toUpperCase() in dlcMap;
}

function DLCAdd(jsonLookup, DLC, type, toArray, depCheck = false) {
    const results = new Set();
    for (const unit of jsonLookup) {
        if ("DLC" in unit) {
            if (unit.DLC.indexOf(DLC) != -1) {
                if (depCheck == true) {
                    if (!depCheckResID(unit.resid)) {
                        if (type == null) {
                            results.add(unit);
                        } else {
                            results.add(unit[type]);
                        }
                    }
                } else {
                    if (type == null) {
                        results.add(unit);
                    } else {
                        results.add(unit[type]);
                    }
                }
            }
        }
    }
    //  console.log(results);
    if (toArray) {
        return Array.from(results);
    } else {
        return results;
    }
}

function returnUnitList(fieldToSearch) {
    if (!fieldToSearch) return [];

    const search = fieldToSearch.toLowerCase();
    const results = new Set();

    if (DLCCheck(fieldToSearch)) {
        return DLCAdd(jsonUnits, fieldToSearch, "id", false, (depCheck = true));
    }

    // --- Name-based search ---

    for (const unit of jsonUnitsLocalized) {
        const enUnit = findBy(jsonUnits, "resid", unit.resid);
        if (namesChecked.checked) {
            if (unit.name.toLowerCase().includes(search) && !depCheckResID(unit.resid)) {
                let entry;

                if (unit.sub_culture_name && !architectCultureUnits.includes(enUnit.id)) {
                    entry = `${enUnit.id},${enUnit.sub_culture_name}`;
                } else {
                    entry = enUnit.id;
                }
                results.add(entry);
            }
        }

        if (resistancesChecked.checked) {
            if (Array.isArray(unit.resistances)) {
                for (const resistance of unit.resistances) {
                    if (
                        resistance.slug.toLowerCase().replaceAll("_", " ").includes(search) &&
                        !depCheckResID(unit.resid)
                    ) {
                        let entry;
                        if (unit.sub_culture_name && !architectCultureUnits.includes(enUnit.id)) {
                            entry = `${enUnit.id},${enUnit.sub_culture_name}`;
                        } else {
                            entry = enUnit.id;
                        }
                        results.add(entry);
                    }
                }
            }
        }
    }
    return results;
}

function returnEmpireTreeList(fieldToSearch) {
    if (!fieldToSearch) return [];

    const search = fieldToSearch.replaceAll("_", " ").toUpperCase();
    const results = new Set();

    if (DLCCheck(fieldToSearch)) {
        return DLCAdd(jsonEmpire, fieldToSearch, "id", true);
    }

    for (const spell of jsonEmpireLocalized) {
        const name = spell.name?.toUpperCase() || "";
        const description = Sanitize(spell.description || "").toUpperCase();

        if (name.includes(search) || description.includes(search)) {
            const spellEN = findBy(jsonEmpire, "icon", spell.icon);
            results.add(spellEN.id);
        }
    }

    return Array.from(results);
}

function returnArtifactsList(fieldsToSearch){
      if (!fieldsToSearch) return [];

    const search = fieldsToSearch.replaceAll("_", " ").toUpperCase();
    const results = new Set();

    if (DLCCheck(fieldsToSearch)) {
        return DLCAdd(jsonRelics, fieldsToSearch, null, true);
    }

    for (const trait of jsonRelics) {
        const text = findBy(jsonAllFromPOLocalized, "id", trait.extraLookup);
        const spells = (trait.spell || []).map((s) => findBy(jsonSpells, "id", s.id)?.name);
        if (SearchWords([trait.name, text?.description, spells]).includes(search)) results.add(trait);
    }

    return Array.from(results);
}

function returnLocList(fieldsToSearch) {
    if (!fieldsToSearch) return [];

    const search = fieldsToSearch.replaceAll("_", " ").toUpperCase();
    const results = new Set();

    if (DLCCheck(fieldsToSearch)) {
        return DLCAdd(jsonHeroAmbitions, fieldsToSearch, null, true);
    }

    for (const entry of jsonAllFromPOLocalized) {
        const name = entry.name?.toUpperCase() || "";
        const description = Sanitize(entry.description || "").toUpperCase();

        if (name.includes(search) || description.includes(search)) {
            // const traitEN = findBy(jsonHeroAmbitions, "icon", trait.icon);
            results.add(entry);
        }
    }

    return Array.from(results);
}

function returnTraitsList(fieldToSearch, locToCheck) {
    if (!fieldToSearch) return [];

    const search = fieldToSearch.replaceAll("_", " ").toUpperCase();
    const results = new Set();

    if (DLCCheck(fieldToSearch)) {
        let setExtra = DLCAdd(jsonFactionCreation2, fieldToSearch, "id", true);
        const setExtra2 = DLCAdd(jsonFactionCreation, fieldToSearch, "id", true);
        setExtra = new Set([...setExtra, ...setExtra2]);

        return Array.from(setExtra);
    }

    for (const trait of jsonFactionCreation2) {
        const name = trait.name?.toUpperCase() || "";
        const description = Sanitize(trait.description || "").toUpperCase();

        if (name.includes(search) || description.includes(search)) {
            results.add(trait.id);
        }
        if (Array.isArray(trait.effect_descriptions)) {
            for (const effect of trait.effect_descriptions) {
                if (effect.name.toUpperCase().includes(search)) {
                    const traitEN = findBy(jsonFactionCreation2, "icon", trait.icon);
                    results.add(traitEN.id);
                }
            }
        }
    }
    // manual check
    for (const trait of jsonFactionCreation) {
        const name = trait.name?.toUpperCase() || "";
        const description = Sanitize(trait.description || "").toUpperCase();

        // check lookup
        if ("extraLookup" in trait) {
            const exists = locToCheck.some((e) => e.id === trait.extraLookup);

            if (exists) {
                results.add(trait.id);
            }
        }

        if (name.includes(search) || description.includes(search)) {
            // const traitEN = findBy(jsonFactionCreation, "id", trait.id);
        }
    }

    return Array.from(results);
}

function Sanitize(string) {
    string = string.replaceAll("<hyperlink>", "");
    string = string.replaceAll("</hyperlink>", "");
    return string;
}

function returnStructure(fieldToSearch) {
    if (!fieldToSearch) return [];

    const search = fieldToSearch.replaceAll("_", " ").toUpperCase();
    const results = new Set();
    const excludeSet = new Set(excludeListStructures);

    if (DLCCheck(fieldToSearch)) {
        return DLCAdd(jsonStructureUpgrades, fieldToSearch, "id", true);
    }

    const checkAndAdd = (struct, text) => {
        if (text && text.toUpperCase().includes(search) && !excludeSet.has(struct.id)) {
            const structEN = findBy(jsonStructureUpgrades, "resid", struct.resid);

            results.add(structEN.id);
        }
    };

    for (const struct of jsonStructureUpgradesLocalized) {
        // Name check
        checkAndAdd(struct, struct.name);
        checkAndAdd(struct, Sanitize(struct.description || ""));
        checkAndAdd(struct, Sanitize(struct.prediction_description || ""));
    }
    return Array.from(results);
}

function searchAll(keyword) {
    var i, textvalue, j, l;

    var fields = keyword.split("+", 3);
    let listSet = new Set();

    // return all DLC stuff

    const listMatchingUnitAbilities = GetAllMatchingAbilities(fields[0]);
  //  console.log(listMatchingUnitAbilities);

    if (unitsChecked.checked) {
        listSet = returnUnitList(fields[0]);
        listSet = returnAbilitiesUnits(fields[0], listSet, listMatchingUnitAbilities);
    }
    let list = Array.from(listSet);


    let listStructures = cityStructuresChecked.checked ? returnStructure(fields[0]) : "";
    let listEmpireTree = empireTreeChecked.checked ? returnEmpireTreeList(fields[0]) : "";
    let listArtifacts = artifactChecked.checked ? returnArtifactsList(fields[0]) : "";
    // javascript exports
    // get all localization and then back
    let listOfLocEntries = returnLocList(fields[0]);
    // check if IDs are used in any of the javascript exported files

    // console.log(listOfLocEntries);
    let listTraits = factionTraitsChecked.checked ? returnTraitsList(fields[0], listOfLocEntries) : "";

    var buttonHolder = document.getElementById("buttonHolder");

    buttonHolder.innerHTML = "";
    var dataHolder = document.getElementById("dataHolder");
    dataHolder.innerHTML = "";
    list.sort((a, b) => {
        if (a.toLowerCase() < b.toLowerCase()) return -1;
        if (a.toLowerCase() > b.toLowerCase()) return 1;
        return 0;
    });

    if (list.length > 0) {
        SetCollapsibleButtonsAndDivs("Units", list, "unit");
        SetButtonsAndDivs(list, "Units" + "-button", "searchUnit", undefined, undefined, undefined);
        //   SetButtonsAndDivs(list, "buttonHolder", "searchUnit", undefined, undefined, undefined);
    }
    if (spellsChecked.checked) ShowFromBook("Spells", returnFromBook("spells", fields[0]), SbSpellCard, true);
    if (siegeChecked.checked) ShowFromBook("Siege Projects", returnFromBook("siege", fields[0]), SbSiegeCard, true);
    if (listStructures.length > 0) {
        SetCollapsibleButtonsAndDivs("Structures", listStructures, "searchStruct");
    }
    if (worldStructuresChecked.checked) {
        ShowFromBook("Ancient Wonders", returnFromBook("wonders", fields[0]), AncientWondersPage.Card);
        ShowFromBook("Landmarks", returnFromBook("landmarks", fields[0]), WmLandmark);
        ShowFromBook("Infestations", returnFromBook("infestations", fields[0]), WmInfestation);
        ShowFromBook("Magic Materials", returnFromBook("materials", fields[0]), MagicMaterialsPage.Card);
    }
    if (happeningsChecked.checked) {
        const found = returnFromBook("happenings", fields[0]);
        ShowFromBook("Cosmic Happenings", found.filter((e) => e.group !== "Oceanic"), WmHappening);
        ShowFromBook("Oceanic Happenings", found.filter((e) => e.group === "Oceanic"), WmHappening);
    }
    if (heroSkillChecked.checked) ShowFromBook("Hero Skills", returnFromBook("heroSkills", fields[0]), HbSkillCard, true);
    if (heroItemsChecked.checked) ShowFromBook("Hero Equipment", returnFromBook("heroItems", fields[0]), HbItemCard, true);
    if (infusionsChecked.checked) ShowFromBook("Item Forge Infusions", returnFromBook("infusions", fields[0]), HbInfusionCard, true);
    if (listEmpireTree.length > 0) {
        SetCollapsibleButtonsAndDivs("Empire Tree", listEmpireTree, "searchEmpire");
    }
    
    if(listArtifacts.length > 0){
         SetCollapsibleButtonsAndDivs("Artifacts/Secret Spells", listArtifacts, "searchRelics");
    }

    if (listTraits.length > 0) {
        SetCollapsibleButtonsAndDivs("Faction Traits", listTraits, "searchTraits");
    }
    if (ambitionsChecked.checked) ShowFromBook("Hero Ambitions", returnFromBook("ambitions", fields[0]), HbAmbitionCard, true);
    if (governanceChecked.checked) ShowFromBook("Hero Governance", returnFromBook("governors", fields[0]), HbGovernorCard, true);

    SetLevelUpStuff();
    SetCollapsibleStuff();
}

function GetAllMatchingAbilities(fieldToSearch) {
    let abilitiesList = new Set();
    const search = fieldToSearch.replaceAll("_", " ").toUpperCase();

    for (const ability of jsonUnitAbilitiesLocalized) {
        const matches = (text) => text && text.toUpperCase().includes(search);

        if (abilityNamesChecked.checked && matches(ability.name)) {
            abilitiesList.add(ability.slug);
        }
        if (abilityDescriptionChecked.checked && matches(ability.description)) {
            abilitiesList.add(ability.slug);
        }

        if (abilityDescriptionChecked.checked && Array.isArray(ability.modifiers)) {
            for (const mod of ability.modifiers) {
                if (matches(mod.description) || matches(mod.name)) {
                    abilitiesList.add(ability.slug);
                    break; // stop early if already matched
                }
            }
        }
    }
    return abilitiesList;
}

function returnAbilitiesUnits(fieldToSearch, unitSetToCheckTo, allMatchedAbilitiesList) {
    let returnList = new Set();
    for (const slug of allMatchedAbilitiesList) {
        findUnitWithAbility(slug, returnList);
    }

    for (const unit of returnList) {
        unitSetToCheckTo.add(unit);
    }

    return unitSetToCheckTo;
}

function searchArray(keyword, arraytosearch, listToPushTo, index) {
    var j = 0;
    for (j in arraytosearch) {
        if ("slug" in arraytosearch[j]) {
            textvalue = arraytosearch[j].slug;
            if (textvalue.toUpperCase().indexOf(keyword) > -1) {
                // if (listToPushTo.length >= 1) {

                if ("sub_culture_name" in jsonUnitsLocalized[index]) {
                    // not architects
                    if (jsonUnitsLocalized[index].culture_name == "Architect") {
                        // skip
                        newEntry = jsonUnitsLocalized[index].id;
                    } else {
                        newEntry = jsonUnitsLocalized[index].id + "," + jsonUnitsLocalized[index].sub_culture_name;
                    }
                } else {
                    newEntry = jsonUnitsLocalized[index].id;
                }
                listToPushTo.push(newEntry);
            }
        }
    }
}

function findUnitWithAbility(ability, results) {
    for (const unit of jsonUnitsLocalized) {
        const enUnit = findBy(jsonUnits, "resid", unit.resid);
        const checkSources = [
            ...(unit.abilities || []),
            ...(passivesChecked.checked ? unit.primary_passives || [] : []),
            ...(passivesChecked.checked ? unit.secondary_passives || [] : [])
        ];

        if (checkSources.some((source) => source.slug === ability) && !depCheckResID(unit.resid)) {
            const entry =
                unit.sub_culture_name && !architectCultureUnits.includes(enUnit.id)
                    ? `${enUnit.id},${enUnit.sub_culture_name}`
                    : enUnit.id;

            results.add(entry);
        }
    }
}
