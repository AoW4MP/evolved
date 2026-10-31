// The Magic Materials page: a tab per set, its bonus on top and a card per material under it. Search shows the material cards
// too. Sets, texts, income and enchantments come from Data/GEN/MagicMaterials.json, which aow4_diff_tools/magicmaterials.py
// generates from the game and the mod (the dump's own texts can carry another resource's numbers); pictures and infusions
// are looked up by the material's key.
const MagicMaterialsPage = (() => {
    // the order and colour of the sets; one the list doesn't name goes last, in grey
    const SET_STYLE = {
        rings_of_binding: "rgb(150, 90, 40)",
        cosmicflux_elixir: "rgb(40, 100, 160)",
        imperial_essence: "rgb(50, 130, 50)",
        void_ink: "rgb(100, 40, 140)"
    };
    // a local income resource as the site writes it: icon, concept, name
    const INCOME = {
        "Structure Production": ["structureprod", "GLOBAL.StructureProductionConcept", "Production"],
        "Unit Production": ["unitprod", "GLOBAL.UnitProductionConcept", "Draft"],
        Mana: ["mana", "GLOBAL.ManaConcept", "Mana"],
        Knowledge: ["knowledge", "GLOBAL.KnowledgeConcept", "Knowledge"],
        Gold: ["gold", "GLOBAL.GoldConcept", "Gold"],
        Food: ["food", "GLOBAL.FoodConcept", "Food"],
        Happiness: ["happiness", "GLOBAL.CityStabilityConcept", "City Stability"],
        Imperium: ["influence", "GLOBAL.ImperiumConcept", "Imperium"]
    };

    let materials = null;

    async function Load() {
        if (!materials) materials = await fetch("/evolved/Data/GEN/MagicMaterials.json").then((res) => res.json());
    }

    async function HandlePage() {
        await Load();
        const tabs = document.getElementById("tabs");
        const page = document.getElementById("materials");
        const intro = findBy(jsonAllFromPOLocalized, "id", "TUTORIAL@MAGICMATERIALS@PAGE01");
        if (intro) document.getElementById("intro").innerHTML = intro.description;

        const order = Object.keys(SET_STYLE);
        const rank = (s) => (order.includes(s.key) ? order.indexOf(s.key) : order.length);
        const sets = [...materials.sets].sort((a, b) => rank(a) - rank(b));
        const wanted = new URLSearchParams(location.search).get("type");
        for (const set of sets) {
            const members = set.materials.map((key) => ({ key, ...materials.materials[key] }));
            members.sort((a, b) => a.name.localeCompare(b.name));
            const tab = document.createElement("button");
            tab.className = "mm-tab";
            tab.dataset.set = set.key;
            tab.innerHTML =
                '<img src="/evolved/Icons/WorldStructures/' + members[0].key + '.png" alt="" />' +
                set.category + " <span>" + members.length + "</span>";
            tab.onclick = () => OpenSet(set.key);
            tabs.append(tab);
            page.append(DrawSet(set, members));
        }
        OpenSet(sets.some((s) => s.key === wanted) ? wanted : sets[0].key, true);
        HandleExtraTooltips(page);
    }

    function OpenSet(key, keepAddress) {
        document.querySelectorAll(".mm-tab").forEach((t) => t.classList.toggle("selected", t.dataset.set === key));
        document.querySelectorAll(".mm-section").forEach((s) => (s.hidden = s.dataset.set !== key));
        if (!keepAddress) history.replaceState(null, "", "?type=" + key + "&");
    }

    function DrawSet(set, members) {
        const section = document.createElement("div");
        section.className = "mm-section";
        section.dataset.set = set.key;
        section.style.setProperty("--set", SET_STYLE[set.key] || "rgb(100, 100, 100)");

        // the game's rule: so many materials, different ones unless the set is a single material
        const needs = !set.unique
            ? set.required + " " + members.map((m) => m.name).join(" or ")
            : members.length > set.required
              ? "Any " + set.required + " of the " + members.length + " " + set.category
              : "All " + set.required + " " + set.category;
        const bonus = document.createElement("div");
        bonus.className = "mm-bonus";
        bonus.innerHTML =
            '<div class="mm-title"><span>' + set.name.toUpperCase() + "</span></div>" +
            '<div class="mm-bonus-parts">' +
            '<div><div class="mm-label">Set Bonus</div>' +
            AddTagIconsForStatusEffects(set.description.split(/(?:<br>)*Requires:/)[0].replace(/(<br>)+$/, "")) +
            "</div>" +
            '<div><div class="mm-label">Requires</div>' + needs + "</div>" +
            "</div>";
        section.append(bonus);

        for (const m of members) section.append(MaterialCard(m));
        return section;
    }

    function MaterialCard(m) {
        const card = document.createElement("div");
        card.className = "mm-card";

        const head = document.createElement("div");
        head.className = "mm-title";
        head.innerHTML =
            '<img class="mm-icon" src="/evolved/Icons/WorldStructures/' + m.key + '.png" alt="" />' +
            "<span>" + m.name.toUpperCase() + "</span>";
        if (m.dlc) head.append(AddDLCTag(m.dlc));
        card.append(head);

        const picture = document.createElement("img");
        picture.className = "mm-picture";
        picture.src = "/evolved/Icons/StructurePics/" + m.key + ".png";
        picture.alt = "";
        card.append(picture);

        const about = document.createElement("div");
        about.className = "mm-about";
        if (m.lore) {
            const lore = document.createElement("div");
            lore.className = "mm-lore";
            lore.innerHTML = AddTagIconsForStatusEffects(m.lore);
            about.append(lore);
        }

        const columns = document.createElement("div");
        columns.className = "mm-columns";
        const left = document.createElement("div");
        left.innerHTML =
            '<div class="mm-label">Global Effect</div>' +
            AddTagIconsForStatusEffects(m.description.replace(/^Unique global effect:\s*/, ""));
        if (m.income.length) {
            left.innerHTML += '<div class="mm-label mm-next">Local Income</div>' + AddTagIconsForStatusEffects(Income(m.income));
        }
        columns.append(left);
        if (m.combat) columns.append(Enchantment(m.combat));
        about.append(columns);

        // infusions name the material as the dump does
        const token = m.name;
        const infusions = new Set(
            jsonItemForgeUpgrades
                .filter((i) => (i.unlock_requirements || []).some((r) => r.token_name === token))
                .map((i) => i.name)
        );
        if (infusions.size) {
            const link = document.createElement("a");
            link.className = "mm-infusions";
            link.href = "/evolved/HTML/Infusions.html?material=" + encodeURIComponent(token);
            link.textContent = infusions.size + " Infusions ›";
            about.append(link);
        }
        card.append(about);
        return card;
    }

    function Income(income) {
        const items = income.map(([resource, amount]) => {
            const [icon, concept, name] = INCOME[resource] || [null, null, resource];
            const label = concept ? "[hyperlink," + concept + "]" + name + "[/hyperlink]" : name;
            return "<span>+" + amount + " " + (icon ? "<" + icon + "></" + icon + "> " : "") + label + "</span>";
        });
        return '<div class="mm-income">' + items.join("") + "</div>";
    }

    function Enchantment(combat) {
        const div = document.createElement("div");
        div.className = "mm-ench";
        // the picture is named after the enchantment, older ones after its text id
        const byName = combat.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
        const byId = combat.key;
        const img = document.createElement("img");
        img.className = "mm-ench-picture";
        img.alt = "";
        img.src = "/evolved/Icons/CombatEnchantments/" + byName + ".png";
        img.onerror = () => {
            if (img.src.endsWith("/" + byName + ".png") && byId && byId !== byName) img.src = "/evolved/Icons/CombatEnchantments/" + byId + ".png";
            else img.remove();
        };
        div.append(img);
        const words = document.createElement("div");
        words.innerHTML =
            '<div class="mm-label">Combat Enchantment</div>' +
            '<div class="mm-ench-name">' + combat.name + "</div>" +
            '<div class="mm-ench-text">' + AddTagIconsForStatusEffects(combat.description) + "</div>";
        div.append(words);
        return div;
    }

    return { Open: HandlePage, Load, Card: MaterialCard, All: () => Object.entries(materials.materials).map(([key, m]) => ({ key, ...m, set: materials.sets.find((x) => x.materials.includes(key)) })) };
})();
