// The Ancient Wonders page: a tab per tier, a card per wonder, and under it its stories, one open at a time. Search shows the
// cards too. Everything comes from Data/GEN/AncientWonders.json, which aow4_diff_tools/ancientwonders.py generates from the
// game and the mod; only the pictures are looked up, by the wonder's key.
const AncientWondersPage = (() => {
    const TIERS = ["Bronze", "Silver", "Gold"];
    const TIER_ICON = { Bronze: "bronzewonder", Silver: "silverwonder", Gold: "goldwonder" };
    // a resource as the site writes it: icon, concept, name
    const RESOURCE = {
        "Structure Production": ["structureprod", "GLOBAL.StructureProductionConcept", "Production"],
        Production: ["structureprod", "GLOBAL.StructureProductionConcept", "Production"],
        "Unit Production": ["unitprod", "GLOBAL.UnitProductionConcept", "Draft"],
        Draft: ["unitprod", "GLOBAL.UnitProductionConcept", "Draft"],
        Mana: ["mana", "GLOBAL.ManaConcept", "Mana"],
        Knowledge: ["knowledge", "GLOBAL.KnowledgeConcept", "Knowledge"],
        Gold: ["gold", "GLOBAL.GoldConcept", "Gold"],
        Food: ["food", "GLOBAL.FoodConcept", "Food"],
        Happiness: ["happiness", "GLOBAL.CityStabilityConcept", "City Stability"],
        "City Stability": ["happiness", "GLOBAL.CityStabilityConcept", "City Stability"],
        Imperium: ["influence", "GLOBAL.ImperiumConcept", "Imperium"],
        Souls: ["souls", null, "Souls"],
        Pop: ["population", null, "Population"]
    };
    const AFFINITY = { Astral: "arcana", Chaos: "chaos", Materium: "matter", Nature: "nature", Order: "order", Shadow: "shadow" };

    let wonders = null;

    async function Load() {
        if (!wonders) wonders = await fetch("/evolved/Data/GEN/AncientWonders.json").then((res) => res.json());
    }

    async function HandlePage() {
        await Load();
        const tabs = document.getElementById("tabs");
        const page = document.getElementById("wonders");
        const wanted = new URLSearchParams(location.search).get("type");
        const first = TIERS.includes(wanted) ? wanted : TIERS[0];
        for (const tier of TIERS) {
            const here = wonders.wonders.filter((w) => w.tier === tier);
            const tab = document.createElement("button");
            tab.className = "aw-tab";
            tab.dataset.tier = tier;
            tab.innerHTML = "<" + TIER_ICON[tier] + "></" + TIER_ICON[tier] + "> " + tier + " <span>" + here.length + "</span>";
            tab.onclick = () => OpenTier(tier);
            tabs.append(tab);
            const holder = document.createElement("div");
            holder.className = "aw-tier";
            holder.dataset.tier = tier;
            for (const w of here) holder.append(WonderCard(w));
            page.append(holder);
        }
        OpenTier(first, true);
        HandleExtraTooltips(page);
    }

    function OpenTier(tier, keepAddress) {
        document.querySelectorAll(".aw-tab").forEach((t) => t.classList.toggle("selected", t.dataset.tier === tier));
        document.querySelectorAll(".aw-tier").forEach((t) => (t.hidden = t.dataset.tier !== tier));
        if (!keepAddress) history.replaceState(null, "", "?type=" + tier + "&");
    }

    function Markup(text) {
        return AddTagIconsForStatusEffects(text || "");
    }

    function Resource(resource) {
        const [icon, concept, name] = RESOURCE[resource] || [null, null, resource];
        return (icon ? "<" + icon + "></" + icon + "> " : "") + (concept ? "[hyperlink," + concept + "]" + name + "[/hyperlink]" : name);
    }

    // a unit by its name, linked if the site lists it
    function UnitLink(name) {
        const unit = jsonUnits.find((u) => u.name === name);
        const link = document.createElement(unit ? "a" : "span");
        link.className = "aw-unit";
        if (unit) {
            link.href = "/evolved/HTML/Units.html?unit=" + unit.id;
            link.target = "_blank";
            link.innerHTML = GetUnitTierAndName(unit.id);
        } else {
            link.textContent = name;
        }
        return link;
    }

    function WonderCard(w) {
        const card = document.createElement("div");
        card.className = "aw-card";
        card.style.setProperty("--tier", "var(--aw-" + w.tier.toLowerCase() + ")");

        const head = document.createElement("div");
        head.className = "aw-title";
        head.innerHTML = "<" + TIER_ICON[w.tier] + "></" + TIER_ICON[w.tier] + "><span>" + w.name.toUpperCase() + "</span>";
        if (w.dlc) head.append(AddDLCTag(w.dlc));
        card.append(head);

        const picture = document.createElement("img");
        picture.className = "aw-picture";
        picture.src = "/evolved/Icons/StructurePics/" + w.key + ".png";
        picture.alt = "";
        picture.onerror = () => picture.remove();
        card.append(picture);

        const about = document.createElement("div");
        about.className = "aw-about";
        if (w.lore) {
            const lore = document.createElement("div");
            lore.className = "aw-lore";
            lore.innerHTML = Markup(w.lore);
            about.append(lore);
        }
        const effects = document.createElement("div");
        effects.className = "aw-effects";
        effects.innerHTML = Markup(w.description);
        about.append(effects);

        const province = document.createElement("div");
        province.className = "aw-province";
        const counts = w.counts ? findBy(jsonAllFromPOLocalized, "id", "INTERFACE@COUNTS_AS")?.[w.counts] : null;
        // one entry a resource: Vaultsphere has two stability costs
        const income = new Map();
        for (const [resource, amount] of w.income) income.set(resource, (income.get(resource) || 0) + amount);
        province.innerHTML =
            (counts ? '<div class="aw-label">' + Markup(counts) + "</div>" : "") +
            '<div class="aw-income">' +
            [...income].map(([r, a]) => "<span>" + (a > 0 ? "+" : "") + a + " " + Markup(Resource(r)) + "</span>").join("") +
            "</div>";
        about.append(province);

        if (w.units.length) {
            // never folded, unlike other unit lists (UNIT_LIST_FOLD): five at most, and only one wonder has that many
            const rally = document.createElement("div");
            rally.className = "aw-rally";
            rally.innerHTML = '<div class="aw-head">Rally of the Lieges</div>';
            const list = document.createElement("div");
            list.className = "aw-units";
            for (const u of w.units) list.append(UnitLink(u));
            rally.append(list);
            about.append(rally);
        }
        card.append(about);

        if (w.stories.length) card.append(Stories(w));
        return card;
    }

    function Stories(w) {
        const holder = document.createElement("div");
        holder.className = "aw-stories";
        const head = document.createElement("div");
        head.className = "aw-head";
        head.textContent = w.stories.length + " possible adventures";
        holder.append(head);
        const tiles = document.createElement("div");
        tiles.className = "aw-tiles";
        holder.append(tiles);
        const panel = document.createElement("div");
        panel.className = "aw-story";
        panel.hidden = true;
        holder.append(panel);

        for (const s of w.stories) {
            const tile = document.createElement("button");
            tile.className = "aw-tile";
            tile.setAttribute("aria-expanded", "false");
            tile.innerHTML =
                '<span class="aw-tile-name"><quest></quest> ' + (s.title || "Adventure") + "</span>" +
                (s.names.length ? '<span class="aw-tile-sites">' + s.names.join(" · ") + "</span>" : "");
            tile.onclick = () => {
                const opening = tile.getAttribute("aria-expanded") !== "true";
                tiles.querySelectorAll(".aw-tile").forEach((t) => t.setAttribute("aria-expanded", "false"));
                tile.setAttribute("aria-expanded", opening);
                panel.hidden = !opening;
                panel.replaceChildren();
                if (opening) {
                    panel.append(StoryPanel(s));
                    HandleExtraTooltips(panel);
                }
            };
            tiles.append(tile);
        }
        return holder;
    }

    function StoryPanel(s) {
        const panel = document.createDocumentFragment();
        const main = document.createElement("div");
        main.className = "aw-story-main";
        main.append(Passage(s.text), Options(s.options || []));
        if (s.aftermath) {
            const after = document.createElement("details");
            after.className = "aw-aftermath";
            const summary = document.createElement("summary");
            summary.textContent = "After the battle: " + s.aftermath.title;
            after.append(summary, Passage(s.aftermath.text), Options(s.aftermath.options));
            main.append(after);
        }
        panel.append(main);

        const side = document.createElement("div");
        side.className = "aw-story-side";
        if (s.enchantments.length) {
            const head = document.createElement("div");
            head.className = "aw-head";
            head.textContent = "Always active";
            side.append(head);
            for (const k of s.enchantments) side.append(Enchantment(k));
        }
        // what one option or another brings, or a failed check: on the option as a chip, its text here
        const chosen = [...new Set((s.options || []).flatMap((o) => [...o.adds, ...(o.check?.failure_adds || [])]))];
        if (chosen.length) {
            const head = document.createElement("div");
            head.className = "aw-head";
            head.textContent = "Depends on your choice";
            side.append(head);
            for (const k of chosen) side.append(Enchantment(k));
        }
        if (s.mandatory.length || s.pool.length) {
            const head = document.createElement("div");
            head.className = "aw-head";
            head.textContent = "Defenders";
            side.append(head);
            const list = document.createElement("div");
            list.className = "aw-units";
            for (const u of s.mandatory) list.append(UnitLink(u));
            side.append(list);
            if (s.pool.length) {
                const others = document.createElement("div");
                others.className = "aw-units aw-pool";
                for (const u of s.pool) others.append(UnitLink(u));
                side.append(others);
            }
        }
        panel.append(side);
        return panel;
    }

    function Passage(parts) {
        const text = document.createElement("div");
        text.className = "aw-passage";
        for (const part of parts || []) {
            const p = document.createElement("p");
            p.innerHTML = Markup(part);
            text.append(p);
        }
        return text;
    }

    function Options(options) {
        const list = document.createElement("div");
        list.className = "aw-options";
        for (const o of options) list.append(Option(o));
        return list;
    }

    function Option(o) {
        const row = document.createElement("div");
        row.className = "aw-option";
        if (o.kind.startsWith("Retreat")) row.classList.add("aw-leave");
        const text = document.createElement("div");
        text.className = "aw-option-text";
        text.innerHTML = Markup(o.text);
        row.append(text);

        const notes = document.createElement("div");
        notes.className = "aw-notes";
        const note = (html, cls) => {
            const n = document.createElement("span");
            n.className = "aw-note " + (cls || "");
            n.innerHTML = html;
            notes.append(n);
            return n;
        };
        if (o.check) note("<" + AFFINITY[o.check.affinity] + "></" + AFFINITY[o.check.affinity] + "> " + o.check.affinity + " Affinity check", "aw-check");
        for (const [r, level] of o.costs) note("Costs " + level + " " + Markup(Resource(r)), "aw-cost");
        for (const [r, level] of o.rewards) note(level + " " + Markup(Resource(r)), "aw-reward");
        for (const k of o.adds) notes.append(EnchantmentChip(k));
        for (const k of o.removes) notes.append(EnchantmentChip(k, true));
        for (const g of o.gains) note("Gains " + Markup(g), "aw-reward");
        if (notes.children.length) row.append(notes);

        if (o.check && (o.check.success || o.check.failure)) {
            const ends = document.createElement("div");
            ends.className = "aw-ends";
            ends.innerHTML =
                (o.check.header ? "<div>" + Markup(o.check.header) + "</div>" : "") +
                (o.check.success ? '<div><span class="aw-win">Success:</span> ' + Markup(o.check.success) + "</div>" : "") +
                (o.check.failure ? '<div><span class="aw-lose">Failure:</span> ' + Markup(o.check.failure) + "</div>" : "");
            if (o.check.failure_adds.length) {
                const chips = document.createElement("div");
                chips.className = "aw-notes";
                for (const k of o.check.failure_adds) chips.append(EnchantmentChip(k));
                ends.append(chips);
            }
            row.append(ends);
        }
        return row;
    }

    function EnchantmentIcon(e) {
        const img = document.createElement("img");
        img.alt = "";
        if (e.icon) img.src = "/evolved/Icons/CombatEnchantments/" + e.icon;
        else img.hidden = true;
        img.onerror = () => img.remove();
        return img;
    }

    // an enchantment an option brings: its name, its text on hover
    function EnchantmentChip(key, removed) {
        const e = wonders.enchantments[key];
        const chip = document.createElement("span");
        chip.className = "aw-note aw-chip" + (removed ? " aw-removed" : "");
        chip.append(EnchantmentIcon(e));
        const name = document.createElement("span");
        name.textContent = (removed ? "Removes " : "") + e.name;
        chip.append(name);
        const words = document.createElement("span");
        words.innerHTML = '<span style="color: #deb887">' + e.name.toUpperCase() + "</span><br><br>" + Markup(e.description);
        addTooltipListeners(chip, words);
        return chip;
    }

    function Enchantment(key) {
        const e = wonders.enchantments[key];
        const div = document.createElement("div");
        div.className = "aw-ench";
        div.append(EnchantmentIcon(e));
        const words = document.createElement("div");
        words.innerHTML = '<div class="aw-ench-name">' + e.name + "</div>" + Markup(e.description);
        div.append(words);
        return div;
    }

    return { Open: HandlePage, Load, Card: WonderCard, All: () => wonders.wonders, Resource };
})();
