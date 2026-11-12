// What the World Map pages made from the game's data share (Infestations, Landmarks, Cosmic and Oceanic Happenings,
// Province Improvements): their tabs, cards and unit links, and the tabs (WmTab) and search bar Ancient Wonders and Realm
// Traits use too (Magic Materials, the tabs).
// Style/worldmap.css goes with it.

// entries: {id, label (HTML), count, panel}. A tab's own address is ?type=<id>&; returns the function that opens a tab
function WmTabs(entries) {
    const tabs = document.getElementById("tabs");
    const page = document.getElementById("panels");
    const open = (id, keepAddress) => {
        tabs.querySelectorAll(".wm-tab").forEach((t) => t.classList.toggle("selected", t.dataset.id === id));
        for (const e of entries) e.panel.hidden = e.id !== id;
        if (!keepAddress) history.replaceState(null, "", "?type=" + id + "&");
    };
    for (const e of entries) {
        const tab = WmTab(e.id, e.label, e.count);
        tab.onclick = () => open(e.id);
        tabs.append(tab);
        page.append(e.panel);
    }
    const wanted = new URLSearchParams(location.search).get("type");
    open(entries.some((e) => e.id === wanted) ? wanted : entries[0].id, true);
    HandleExtraTooltips(page);
    return open;
}

// a tab (.wm-tab, its id in data-id), for WmTabs and the pages that open their tabs themselves (Ancient Wonders, Magic
// Materials, Realm Traits): its icon, and its words and count (.wm-count) in one line of text, on one baseline, that
// line centred beside the icon. label: HTML, its icon a tag or an <img>
function WmTab(id, label, count) {
    const tab = WmElement("button", "wm-tab", label);
    tab.dataset.id = id;
    const words = [...tab.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE);
    const line = WmElement("span", "wm-tab-words", "");
    line.append(words.map((n) => n.textContent).join("").trim() + " ", WmElement("span", "wm-count", String(count)));
    words.forEach((n) => n.remove());
    tab.append(line);
    return tab;
}

// the search bar of a page WmTabs made: its tabs and their panels, in the same order; .wm-card cards
function WmTabsSearch(placeholder, heads) {
    const panels = document.getElementById("panels").children;
    WmSearchBar([...document.querySelectorAll("#tabs .wm-tab")].map((tab, i) => [tab, panels[i]]), ".wm-card", heads, placeholder);
}

// a search bar under a page's tabs, over the cards of all of them at once (the World Map pages, Ancient Wonders, Realm
// Traits). A card stays while its text holds every word typed, folded parts and its data-search words too (a wonder's
// stories, built only when opened); each tab's count follows, a group heading goes with the last of its cards, and a tab
// with nothing left says so. pairs: [tab, panel] (a tab's count is its .wm-count); cards and heads: selectors in a panel
function WmSearchBar(pairs, cards, heads, placeholder) {
    const filters = WmElement("div", "wm-filters");
    const input = WmElement("input", "wm-search");
    input.type = "search";
    input.placeholder = placeholder;
    filters.append(input);
    document.getElementById("tabs").after(filters);
    const words = (el) => (el.textContent + " " + (el.dataset.search || "")).toLowerCase();
    const panels = pairs.map(([tab, panel]) => {
        const none = WmElement("div", "wm-none", "Nothing here matches.");
        none.hidden = true;
        panel.append(none);
        const items = [...panel.querySelectorAll(cards + (heads ? ", " + heads : ""))].map((el) => ({
            el,
            head: heads ? el.matches(heads) : false,
            words: words(el)
        }));
        return { tab, none, items };
    });
    input.addEventListener("input", () => {
        const typed = input.value.toLowerCase().split(/\s+/).filter(Boolean);
        for (const p of panels) {
            let left = 0;
            let head = null;
            let headLeft = 0;
            // a class, not hidden: a card's own display (grid, flex) outranks the browser's [hidden]
            const closeHead = () => head && head.el.classList.toggle("wm-filtered", !headLeft);
            for (const it of p.items) {
                if (it.head) {
                    closeHead();
                    head = it;
                    headLeft = 0;
                    continue;
                }
                const shown = typed.every((w) => it.words.includes(w));
                it.el.classList.toggle("wm-filtered", !shown);
                if (shown) left++, headLeft++;
            }
            closeHead();
            p.tab.querySelector(".wm-count").textContent = left;
            p.none.hidden = left > 0;
        }
    });
}

// A page of cards in tabs, built once (the Spells and Heroes pages). tabs: [[id, label (HTML)]]; tabsOf: the tabs a thing is
// on, with a card on each. The search (#filterInput) and the rows of choice buttons work across all tabs, whose counts
// follow: a card stays while its text holds every word typed and every row's chosen button passes it.
//   choices: [{holder: element id, buttons: [{label (HTML), title, test (thing => bool), text (a word, not an icon)}]}]
//   sorts:   [{id, label, order (a, b => number), group (thing => {name}): the heading it goes under}], the first at first
// Returns the rows' buttons, so a page can pick one from its address
function WmBoard(tabs, items, { tabsOf, makeCard, choices = [], sorts = [] }) {
    const cards = [];
    const panels = {};
    const entries = tabs.map(([id, label]) => {
        const here = items.filter((e) => tabsOf(e).includes(id));
        const panel = WmElement("div", "sb-panel");
        panels[id] = panel;
        for (const e of here) {
            const card = makeCard(e);
            LazyImages(card);
            cards.push({ e, id, card, words: ((e.name || "") + " " + card.textContent + " " + (card.dataset.search || "")).toLowerCase(), shown: true });
        }
        return { id, label, count: here.length, panel };
    });

    const chosen = choices.map(() => null);
    let typed = [];
    let sort = sorts[0];

    function Lay() {
        for (const [id, panel] of Object.entries(panels)) {
            panel.replaceChildren();
            const here = cards.filter((c) => c.id === id && c.shown);
            if (sort) here.sort((a, b) => sort.order(a.e, b.e));
            const groups = new Map();
            for (const c of here) {
                const name = sort?.group?.(c.e)?.name || "";
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
            c.shown = typed.every((w) => c.words.includes(w)) && chosen.every((b) => !b || b.test(c.e));
            if (c.shown) left[c.id] = (left[c.id] || 0) + 1;
        }
        document.querySelectorAll("#tabs .wm-tab").forEach((t) => (t.querySelector(".wm-count").textContent = left[t.dataset.id] || 0));
        Lay();
    }

    Lay();
    WmTabs(entries);
    // one tab is no choice: the page has its search alone
    document.getElementById("tabs").hidden = entries.length < 2;

    document.getElementById("filterInput").addEventListener("input", (event) => {
        typed = event.target.value.toLowerCase().split(/\s+/).filter(Boolean);
        Refilter();
    });
    const rows = choices.map((row, i) => {
        const holder = document.getElementById(row.holder);
        return row.buttons.map((b) => {
            const button = WmElement("button", "wm-choice" + (b.text ? " wm-choice-text" : ""), b.label);
            button.title = b.title || "";
            button.onclick = () => {
                chosen[i] = chosen[i] === b ? null : b;
                holder.querySelectorAll(".wm-choice").forEach((x) => x.classList.toggle("selected", x === button && chosen[i] === b));
                Refilter();
            };
            holder.append(button);
            return button;
        });
    });
    const sortHolder = document.getElementById("sorts");
    if (sortHolder && sorts.length > 1) {
        for (const s of sorts) {
            const button = WmElement("button", "wm-sort" + (s === sort ? " selected" : ""), s.label);
            button.onclick = () => {
                sort = s;
                sortHolder.querySelectorAll(".wm-sort").forEach((b) => b.classList.toggle("selected", b === button));
                Lay();
            };
            sortHolder.append(button);
        }
    } else if (sortHolder) {
        sortHolder.remove();
    }
    return rows;
}

function WmElement(tag, className, html) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (html !== undefined) element.innerHTML = html;
    return element;
}

function WmMarkup(text) {
    return AddTagIconsForStatusEffects(text || "");
}

// a card: the title's band and icon (HTML), and its picture, the icon alone if it has none
function WmCard(name, { band, icon, note, dlc, picture, iconOnly }) {
    const card = WmElement("div", "wm-card");
    if (band) card.style.setProperty("--band", band);
    const title = WmElement("div", "wm-title", (icon || "") + "<span>" + name.toUpperCase() + "</span>");
    if (dlc) title.append(AddDLCTag(dlc));
    if (note) title.append(WmElement("span", "wm-title-note", note));
    card.append(title);
    if (picture || iconOnly) {
        const img = WmElement("img", "wm-picture" + (picture ? "" : " wm-icon-only"));
        img.src = picture || iconOnly;
        img.alt = "";
        img.onerror = () => img.remove();
        card.append(img);
    }
    return card;
}

// a unit by its name or id, linked if the site lists it
function WmUnit(nameOrId) {
    const unit = jsonUnits.find((u) => u.id === nameOrId || u.name === nameOrId);
    const link = WmElement(unit ? "a" : "span", "wm-unit");
    if (unit) {
        link.href = "/evolved/HTML/Units.html?unit=" + unit.id;
        link.target = "_blank";
        link.innerHTML = GetUnitTierAndName(unit.id);
    } else {
        link.textContent = nameOrId;
    }
    return link;
}

// units under a label, folded away past UNIT_LIST_FOLD (Builder.js) of them: what a spell summons, a structure or landmark unlocks
function WmUnitList(label, units) {
    const part = units.length > UNIT_LIST_FOLD
        ? WmElement("details", "wm-story", "<summary>" + label + " (" + units.length + ")</summary>")
        : WmElement("div", "wm-part", '<div class="wm-label">' + label + "</div>");
    part.append(WmUnits(units));
    return part;
}

function WmUnits(units, others) {
    const holder = document.createElement("div");
    if (units.length) {
        const list = WmElement("div", "wm-units");
        for (const u of units) list.append(WmUnit(u));
        holder.append(list);
    }
    if (others && others.length) holder.append(WmElement("div", "wm-units wm-others", others.map((o) => "<span>" + o + "</span>").join("")));
    return holder;
}

function WmEnchantment(e) {
    const div = WmElement("div", "wm-ench");
    if (e.icon) {
        const img = WmElement("img");
        img.src = "/evolved/Icons/CombatEnchantments/" + e.icon;
        img.alt = "";
        div.append(img);
    }
    div.append(WmElement("div", "", '<div class="wm-ench-name">' + e.name + "</div>" + WmMarkup(e.description)));
    return div;
}

// the cards of the Infestations, Landmarks and Cosmic Happenings pages, which Search shows too
const WM_TIER_BAND = { Bronze: "rgb(150, 90, 40)", Silver: "rgb(120, 130, 145)", Gold: "rgb(165, 130, 40)" };
const WM_REWARD_ICON = { Production: "structureprod", Knowledge: "knowledge", Gold: "gold", Food: "food", Mana: "mana" };
const WM_HAPPENING_GROUPS = {
    Minor: ["Minor", "category_icon_Constellation.png", "rgb(50, 110, 150)"],
    Major: ["Major", "category_icon_Major.png", "rgb(150, 90, 40)"],
    Intrigue: ["Intrigue", "icon_honor_and_intrigue.png", "rgb(120, 45, 70)"],
    Special: ["Special", "icon_blood_moon.png", "rgb(100, 40, 140)"]
};
const WM_HAPPENING_ICONS = "/evolved/Icons/CosmicHappenings/";
// the Oceanic Happenings page's tabs: label, the cards' band
const WM_OCEANIC_KINDS = { Minor: ["Minor", "rgb(30, 120, 140)"], Major: ["Major", "rgb(20, 70, 120)"] };

function WmInfestation(e) {
    const tag = "infestation" + e.tier.toLowerCase();
    const card = WmCard(e.name, {
        band: WM_TIER_BAND[e.tier],
        icon: "<" + tag + "></" + tag + ">",
        note: e.water ? "On water" : "",
        dlc: e.dlc,
        picture: e.picture ? "/evolved/Icons/StructurePics/" + e.picture + ".png" : ""
    });
    const about = WmElement("div", "wm-about");
    if (e.lore) about.append(WmElement("div", "wm-lore", WmMarkup(e.lore)));
    about.append(WmElement("div", "", WmMarkup(e.description)));

    const reward = e.reward.resource
        ? "<span><b>Reward:</b> Tier " + e.reward.tier + ", <" + WM_REWARD_ICON[e.reward.resource] + "></" + WM_REWARD_ICON[e.reward.resource] + "> " + e.reward.resource + " and an Item</span>"
        : "";
    about.append(
        WmElement(
            "div",
            "wm-facts",
            "<span><b>Starts with</b> " + e.size.start + " Provinces</span>" +
                "<span><b>Grows to</b> " + e.size.max + " Provinces</span>" +
                "<span><b>Growth:</b> every " + e.size.growth + " <turn></turn> Turns</span>" +
                reward
        )
    );

    const units = WmElement("div", "wm-part", '<div class="wm-label">Defenders</div>');
    for (const p of e.pools) {
        if (p.label) units.append(WmElement("div", "wm-season", p.label));
        units.append(WmUnits(p.units, p.others));
    }
    about.append(units);
    card.append(about);
    return card;
}

function WmLandmark(e) {
    const card = WmCard(e.name, {
        icon: "<landmark></landmark>",
        dlc: e.dlc,
        picture: e.picture ? "/evolved/Icons/StructurePics/" + e.picture + ".png" : "",
        iconOnly: e.icon ? "/evolved/Icons/WorldStructures/" + e.icon : ""
    });
    const about = WmElement("div", "wm-about");
    if (e.lore) about.append(WmElement("div", "wm-lore", WmMarkup(e.lore)));
    const columns = WmElement("div", "wm-columns");
    columns.append(WmElement("div", "", WmMarkup(e.adjacent)));
    if (e.city) columns.append(WmElement("div", "", WmMarkup(e.city)));
    about.append(columns);
    if (e.enchantments.length) {
        const part = WmElement("div", "wm-part", '<div class="wm-label">Combat Enchantment</div>');
        for (const x of e.enchantments) part.append(WmEnchantment(x));
        about.append(part);
    }
    if (e.units.length) {
        about.append(WmUnitList("Units it unlocks", e.units));
    }
    card.append(about);
    return card;
}

function WmHappening(e) {
    const card = WmCard(WmMarkup(e.name).replace(/<[^>]+>/g, "").trim(), {
        band: e.group === "Oceanic" ? WM_OCEANIC_KINDS[e.category][1] : WM_HAPPENING_GROUPS[e.group][2],
        icon: '<img src="' + WM_HAPPENING_ICONS + e.icon + '" alt="" />',
        note: e.group === "Oceanic" ? (e.category === "Major" ? "Major" : "") : e.group === "Minor" ? "" : e.category,
        dlc: e.dlc,
        picture: e.image ? WM_HAPPENING_ICONS + e.image : "",
        iconOnly: e.icon ? WM_HAPPENING_ICONS + e.icon : ""
    });
    const about = WmElement("div", "wm-about");
    // the header repeats the effects on the cosmic ones; on the others it sets the scene
    if (!e.category || e.group === "Intrigue") about.append(WmElement("div", "wm-lore", WmMarkup(e.sub)));
    about.append(WmElement("div", "", WmMarkup(e.description)));
    const facts = [];
    if (e.warning) facts.push("<span><b>Foreshadowed</b> " + e.warning + " <turn></turn> Turns ahead</span>");
    if (e.duration) facts.push("<span><b>Lasts</b> " + e.duration + " <turn></turn> Turns</span>");
    if (facts.length) about.append(WmElement("div", "wm-facts", facts.join("")));
    if (e.story) {
        const story = WmElement("details", "wm-story", "<summary>The event</summary>" + e.story.text.map((t) => "<p>" + WmMarkup(t) + "</p>").join(""));
        for (const o of e.story.options) story.append(WmElement("div", "wm-story-option", WmMarkup(o)));
        about.append(story);
    }
    // an Oceanic one: the units its choices unlock, then its events, each a fold with its choices
    if (e.units?.length) about.append(WmUnitList("Unlocks", e.units));
    for (const ev of e.events || []) {
        const story = WmElement("details", "wm-story", "<summary>" + ev.label + "</summary>" + ev.text.map((t) => "<p>" + WmMarkup(t) + "</p>").join(""));
        for (const o of ev.options) story.append(WmChoice(o));
        about.append(story);
    }
    card.append(about);
    return card;
}

// an event's choice: its text, then what it costs and gives (in the Ancient Wonders' words) and the units it unlocks
function WmChoice(o) {
    const row = WmElement("div", "wm-story-option", WmMarkup(o.text));
    const resource = (r) => WmMarkup(AncientWondersPage.Resource(r));
    const once = (pairs) => [...new Map(pairs.map((p) => [p.join(" "), p])).values()];    // a reward for each case: once
    const notes = [
        ...once(o.costs).map(([r, level]) => '<span class="wm-cost">Costs ' + level + " " + resource(r) + "</span>"),
        ...once(o.rewards).map(([r, level]) => '<span class="wm-reward">' + level + " " + resource(r) + "</span>")
    ];
    if (notes.length) row.append(WmElement("div", "wm-notes", notes.join("")));
    if (o.units.length) {
        const units = WmElement("div", "wm-notes", '<span class="wm-reward">Unlocks</span>');
        units.append(WmUnits(o.units));
        row.append(units);
    }
    return row;
}
