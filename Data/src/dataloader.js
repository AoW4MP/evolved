function cleanTranslation(text) {
    if (!text) return text;

    return (
        text
            // Remove ^fa{[1]}fn{[2]} style markers
            .replace(/\^fa\{\[\d+\]\}fn\{\[\d+\]\}/g, "")
            // Remove any ^ followed by a single letter (e.g. ^m, ^N, ^a)
            .replace(/\^[a-zA-Z]/g, "")
            // Clean up leftover spaces
            .trim()
    );
}

const architectCultureUnits = ["surveyor", "cultivator", "earthbreaker", "guardian", "shademaker", "architect"];

const MountedSpecialList = [
    "pioneer",
    "pathfinder",
    "scout",
    "lightseeker",
    "knight",
    "outrider",
    "dark_knight",
    "tyrant_knight",
    "wildspeaker",
    "houndmaster",
    "spellbreaker",
    "dragoon",
    "spirit_tracker",
    "spellshield"
];

const extraFormUnitsList = [
    "phantasm_warrior",
    "evoker",
    "white_witch",
    "necromancer",
    "zombie",
    "decaying_zombie",
    "skeleton",
    "chaplain",
    "zealot",
    "inquisitor",
    "glade_runner",
    "pyromancer",
    "warbreed",
    "exemplar",
    "transmuter",
    "zephyr_archer",
    "afflictor",
    "stormbringer",
    "constrictor",
    "pyre_templar",
    "monk",
    "shade",
    "wildspeaker",
    "houndmaster",
    "geomancer",
    "paladin",
    "oracle",
    "pain_bringer",
    "blood_cultist",
    "subjugator",
    "lieutenant",
    "warlord",
    "temptress",
    "priest_of_the_weave"
];

const incorrectIconOverrideList = [
    "summon_zealot",
    "summon_lightbringer",
    "conjure_divine_beacon",
    "summon_lesser_snow_spirit",
    "summon_wind_rager",
    "summon_balor",
    "summon_lesser_magma_spirit",
    "summon_horned_god",
    "summon_corrupt_soul",
    "summon_lesser_light_spirit",
    "summon_blessed_soul"
];

const extraAbilities = [];

const extraSkills = [];

function fetchJsonFiles(filePaths) {
    return Promise.all(
        filePaths.map((filePath) =>
            fetch(filePath).then((response) => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                // a mod's own resources have resids past what a JS number holds exactly, and nearby ones
                // round to the same number (Bone Dragon Ritual and Bone Horror Ritual): keep those as text
                return response.text().then((text) =>
                    JSON.parse(
                        text.replace(/("resid":\s*)(-?\d{16,})\b/g, (all, key, n) =>
                            Number.isSafeInteger(Number(n)) ? all : key + '"' + n + '"'
                        )
                    )
                );
            })
        )
    );
}
var jsonSiegeProjects;

const dlcMap = {
    DRAGONLORDS: {
        src: "/evolved/Icons/Text/DragonDawn.png",
        text: "Part of the Dragon Dawn DLC"
    },
    EMPIRESANDASHES: {
        src: "/evolved/Icons/Text/EmpiresAshes.png",
        text: "Part of the Empires & Ashes DLC"
    },
    PRIMALFURY: {
        src: "/evolved/Icons/Text/PrimalFury.png",
        text: "Part of the Primal Fury DLC"
    },
    ELDRITCHREALMS: {
        src: "/evolved/Icons/Text/EldritchRealms.png",
        text: "Part of the Eldritch Realms DLC"
    },
    HERALDOFGLORY: {
        src: "/evolved/Icons/Text/herald_of_glory.png",
        text: "Part of the Herald of Glory DLC"
    },
    WAYSOFWAR: {
        src: "/evolved/Icons/Text/waysofwar.png",
        text: "Part of the Ways of War DLC"
    },
    GIANTKINGS: {
        src: "/evolved/Icons/Text/GKLogo.png",
        text: "Part of the Giant Kings DLC"
    },
    ARCHONPROPHECY: {
        src: "/evolved/Icons/Text/ArchonProphecy.png",
        text: "Part of the Archon Prophecy DLC"
    },
    COSMICWANDERER: {
        src: "/evolved/Icons/Text/CosmicWanderer.png",
        text: "Part of the Cosmic Wanderer DLC"
    },
    THRONESOFBLOOD: {
        src: "/evolved/Icons/Text/ThronesOfBlood.png",
        text: "Part of the Thrones of Blood DLC"
    },
    RISEFROMRUIN: {
        src: "/evolved/Icons/Text/RiseFromRuin.png",
        text: "Part of the Rise From Ruin DLC"
    },
    SECRETSOFTHEARCHMAGES: {
        src: "/evolved/Icons/Text/SecretsOfTheArchmages.png",
        text: "Part of the Secrets of the Archmages DLC"
    },
    WITCHOFTHEWAVES: {
        src: "/evolved/Icons/Text/singer_of_storms.png",
        text: "Part of the Singer of Storms DLC"
    },
    THESILVERSEAS: {
        src: "/evolved/Icons/Text/the_silver_seas.png",
        text: "Silver Seas for theorycrafting"
    }
};

async function GetAllData(selectedLang) {
    let basePathEN = `/evolved/Data/EN/`;

    if (selectedLang == "BETA") {
        basePathEN = `/evolved/Data/BETA/`;
    }

    const basePathGen = `/evolved/Data/GEN/`;
    // }
    //  const basePathEN = `/evolved/Data/EN/`;
    const basePathLocal = `/evolved/Data/${selectedLang}/`;

    const fileNamesGeneric = [
        "EnchantmentTables.json",
        "all_spawnsets.json",
        "BuilderLookup.json",
        "AscendedInfo.json",
        "BuilderLookupHero.json",
        "FactionCreation.json",
        "StatusEffects.json",
        "ExtraToolTips.json",
        "CombatEnchantments.json",
        "WorldStructures.json",
        "CosmicHappenings.json",
        "all_spawnsets_strategic.json",
        "FreeCities.json",
        "DestinyTraits.json",
        "Relics.json",
        "Pantheon_Tree.json",
        "ExtraLookSpellsOrigin.json",
        "StructurePredictions.json"
    ];
    const fileNames = [
        // ingame dump files
        "HeroItems.json",
        "HeroSkills.json",
        "SiegeProjects.json",
        "Units.json",
        "Traits.json",
        "Tomes.json",
        "Abilities.json",
        "EmpireProgression.json",
        "Spells.json",
        "StructureUpgrades.json",
        "Destinies.json",
        "Governance.json",
        "ItemForgeTypes.json",
        "ItemForgeUpgrades.json",
        // non-ingame-dump-json-files
        "all.json",
        "concept_tooltips.json"
    ];

    // Create file paths
    const filesToFetchGeneric = fileNamesGeneric.map((f) => basePathGen + f);
    const filesToFetchEN = fileNames.map((f) => basePathEN + f);
    const filesToFetchLocal = fileNames.map((f) => basePathLocal + f);

    try {
        const [dataGen, dataEN, dataLocal, templatesHtml] = await Promise.all([
            fetchJsonFiles(filesToFetchGeneric),
            fetchJsonFiles(filesToFetchEN),
            fetchJsonFiles(filesToFetchLocal),
            fetch("/evolved/HTML/templates.html").then((res) => res.text())
        ]);

        const genericTargets = [
            "jsonEnchantments",
            "jsonSpawnTables",
            "jsonBuilderLookUp",
            "jsonExtraAscendedInfo",
            "jsonBuilderHeroLookUp",

            "jsonFactionCreation",
            "jsonStatusEffects",
            "jsonExtraTooltips",
            "jsonCombatEnchantments",
            "jsonWorldStructures",
            "jsonCosmicHappenings",
            "jsonSpawnSetsStrat",
            "jsonFreeCities",
            "jsonDestinyTriggers",
            "jsonRelics",
            "jsonPantheon",
            "jsonExtraSpellsLookup",
            "jsonStructurePredictions"
        ];
        const targets = [
            "jsonHeroItems",
            "jsonHeroSkills",
            "jsonSiegeProjects",
            "jsonUnits",
            "jsonFactionCreation2",
            "jsonTomes",
            "jsonUnitAbilities",
            "jsonEmpire",
            "jsonSpells",
            "jsonStructureUpgrades",
            "jsonHeroAmbitions",
            "jsonHeroGovernance",
            "jsonItemForgeTypes",
            "jsonItemForgeUpgrades",
            "jsonAllFromPO",
            "jsonConceptTooltips"
        ];

        // Assign data to global vars
        genericTargets.forEach((key, i) => {
            window[key] = dataGen[i];
        });

        targets.forEach((key, i) => {
            window[key] = dataEN[i];
            window[key + "Localized"] = dataLocal[i];
        });

        // Inject the template HTML into the page
        const templateContainer = document.createElement("div");
        templateContainer.innerHTML = templatesHtml;
        document.body.appendChild(templateContainer); // or attach to a hidden container
    } catch (error) {
        console.error("Error loading data or templates:", error.message);
    }
}

function AddExtraData() {
    // add extra data to the main data set
    jsonHeroSkills = [...jsonHeroSkills, ...extraSkills];
    jsonHeroSkillsLocalized = [...jsonHeroSkillsLocalized, ...extraSkills];

    jsonUnitAbilities = [...jsonUnitAbilities, ...extraAbilities];
    jsonUnitAbilitiesLocalized = [...jsonUnitAbilitiesLocalized, ...extraAbilities];

    jsonUnitAbilities = [...jsonUnitAbilities, ...jsonExtraTooltips];
    jsonUnitAbilitiesLocalized = [...jsonUnitAbilitiesLocalized, ...jsonExtraTooltips];

    // the dump leaves out the Sealbearer's seal icons: the game picks them by subculture
    const missingAbilityIcons = {
        magic_seal_ability_0000049000000E8C_0000049700000fb5: "0000049700001068", // Transference Seal
        magic_seal_ability_0000049000000E8C_0000049700000fb2: "0000049700001064", // Resonance Seal
        magic_seal_ability_0000049000000E8C_0000049700000fb8: "000004970000106C" // Fire Seal
    };
    // and the links of the Oathsworn's Paragon abilities to the ability they grant, which the game's text has
    // ("gain the [hyperlink,GLOBAL.PROPERTIES.INFERNAL_BLAZE]Infernal Blaze[/hyperlink] ability")
    const missingAbilityLinks = {
        "0000049700001555": "Infernal Blaze", // Paragon of Strife
        "0000049700001558": "Radiant Slash", // Paragon of Righteousness
        "000004970000155a": "Arrow of Harmony" // Paragon of Harmony
    };
    for (const ability of [...jsonUnitAbilities, ...jsonUnitAbilitiesLocalized]) {
        if (ability.icon == undefined && ability.slug in missingAbilityIcons) {
            ability.icon = missingAbilityIcons[ability.slug];
        }
        const linked = missingAbilityLinks[ability.slug];
        if (linked && !ability.description.includes(`<hyperlink>${linked}</hyperlink>`)) {
            ability.description = ability.description.replace(` ${linked} `, ` <hyperlink>${linked}</hyperlink> `);
        }
    }
}

const abilityMap = {};
const abilityNameMap = {};

async function CheckData() {
    if (jsonSiegeProjects === undefined) {
        let storedSettings = getUserSettings();
        if (storedSettings === null) {
            setUserSettings({
                tooltipselectable: false,
                fontSize: "16px"
            });
            storedSettings = getUserSettings();
        }
        //checkboxTooltip = document.getElementById("tooltipCheckbox");
        checkboxTooltip.checked = storedSettings.tooltipselectable;

        //checkboxNumbers = document.getElementById("numbersCheckbox");
        //checkboxNumbers = document.getElementById("numbersCheckbox");
        checkboxNumbers.checked = storedSettings.isolateNumber;

        let hoverDiv = document.getElementById("hoverDiv");
        let hoverDiv2 = document.getElementById("hoverDiv2");
        if (checkboxTooltip.checked === true) {
            addTooltipListeners(hoverDiv, null);
            addTooltipListeners(hoverDiv2, null, "something");
        } else {
            removeToolTipListeners(hoverDiv);
            removeToolTipListeners(hoverDiv2);
        }
        CheckBoxTooltips();

        await GetAllData("EN");

        AddExtraData();

        jsonUnitAbilitiesLocalized.forEach((a) => (abilityMap[a.slug] = a));
        jsonUnitAbilitiesLocalized.forEach((a) => (abilityNameMap[a.name] = a));

        // maps
        HandlePage();
    }
}

const lookupMaps = new Map(); // cache of maps per "array+key" combo

function buildLookupMap(array, key) {
    const mapKey =
        array === jsonUnits
            ? "jsonUnits:" + key
            : array === jsonUnitAbilities
              ? "jsonUnitAbilities:" + key
              : array === jsonUnitAbilitiesLocalized
                ? "jsonUnitAbilitiesLocalized:" + key
                : array === jsonSpells
                  ? "jsonSpells:" + key
                  : array === jsonSpellsLocalized
                    ? "jsonSpellsLocalized:" + key
                    : array === jsonTomes
                      ? "jsonTomes:" + key
                      : array === jsonTomesLocalized
                        ? "jsonTomesLocalized:" + key
                        : array === jsonHeroSkills
                          ? "jsonHeroSkills:" + key
                          : array === jsonAllFromPOLocalized
                            ? "jsonAllFromPOLocalized:" + key
                            : null;

    if (!mapKey) return null; // not a static array we track

    if (!lookupMaps.has(mapKey)) {
        const map = new Map();
        for (const entry of array) {
            if (entry[key] !== undefined) {
                map.set(entry[key], entry);
            }
        }
        lookupMaps.set(mapKey, map);
    }
    return lookupMaps.get(mapKey);
}

const patchDates = [
    // date ranges of patches
    { name: "Sprite 1.2", from: new Date("2026-07-02"), to: new Date("2026-11-29") },
    { name: "Sprite 1.1", from: new Date("2026-06-24"), to: new Date("2026-07-01") },
    { name: "Sprite 1.0", from: new Date("2026-06-16"), to: new Date("2026-06-23") },
    { name: "Scorpion 1.2.1", from: new Date("2026-04-01"), to: new Date("2026-06-15") },
    { name: "Scorpion 1.2", from: new Date("2026-03-24"), to: new Date("2026-03-31") },
    { name: "Scorpion 1.1", from: new Date("2026-03-12"), to: new Date("2026-03-23") },
    { name: "Scorpion 1.0", from: new Date("2026-03-09"), to: new Date("2026-03-11") },
    { name: "Gargoyle 1.2.2", from: new Date("2025-12-09"), to: new Date("2026-03-08") },
    { name: "Gargoyle 1.2.1", from: new Date("2025-11-26"), to: new Date("2025-12-08") },
    { name: "Gargoyle 1.2", from: new Date("2025-11-25"), to: new Date("2025-11-25") },
    { name: "Gargoyle 1.1", from: new Date("2025-11-13"), to: new Date("2025-11-24") },
    { name: "Gargoyle 1.0", from: new Date("2025-11-11"), to: new Date("2025-11-12") },
    { name: "Wisp", from: new Date("2025-09-30"), to: new Date("2025-11-10") },
    { name: "Griffon 1.2", from: new Date("2025-08-26"), to: new Date("2025-09-29") },
    { name: "Griffon 1.1", from: new Date("2025-08-14"), to: new Date("2025-08-25") },
    { name: "Griffon 1.0", from: new Date("2025-08-12"), to: new Date("2025-11-13") },
    { name: "Ogre 1.2.1", from: new Date("2025-04-29"), to: new Date("2025-08-11") },
    { name: "Ogre 1.2", from: new Date("2025-04-15"), to: new Date("2025-04-28") }
];

