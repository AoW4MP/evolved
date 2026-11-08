# Evolved vs. upstream

This site is a fork of [MinionsArt/aow4db](https://github.com/MinionsArt/aow4db), adapted for the Evolved mod.
The two repositories share no git history.

**Direction:** Evolved is gradually becoming its own site and no longer follows upstream as a whole.
Every file, shared ones such as `HTML/header.html` and `Style/*.css` included, is Evolved's to change.
Upstream is a source to pick from: take a fix or feature when it is wanted
(see [Taking changes from upstream](#taking-changes-from-upstream)), rather than syncing everything.
The sections below list where Evolved already differs, so a change taken from upstream doesn't undo them.

Last full sync with upstream: `6db93706` (2026-10-20)

## Renames

Every upstream text file goes through these replacements:

| Upstream | Evolved |
| --- | --- |
| `/aow4db/` (paths) | `/evolved/` |
| `Age of Wonders 4 Database` (page titles, headings, `document.title`) | `Age of Wonders 4 Evolved` |
| `minionsart.github.io/aow4db` (site address in the downloaded edit-key file, `Data/src/settings.js`) | `aow4mp.github.io/evolved` |
| `Aow4db_EditKey.txt` (name of the downloaded Faction Creator edit-key file, `Data/src/settings.js`) | `evolved_EditKey.txt` |
| `# aow4db` (`README.md`) | `# evolved` |

`HTML/Donate.html` is Evolved's own: "Support the AoW 4 Evolved Mod", the maintainer's message and a Buy Me a Coffee
button (buymeacoffee.com/aowevolved) instead of upstream's Ko-fi widget.

## Code changes for the mod

`Data/Faction.js`: the faction creator's form trait budget is 10 points instead of 5.

| Line (approx.) | Upstream | Evolved |
| --- | --- | --- |
| 234 | `while (getPoints() < 5)` | `while (getPoints() < 10)` |
| 236 | `getPoints() + randomEntry.point_cost < 6` | `getPoints() + randomEntry.point_cost < 11` |
| 1172 | `origin.point_cost + getPoints() > 5` | `origin.point_cost + getPoints() > 10` |
| 3491 | `if (getPoints() > 5)` | `if (getPoints() > 10)` |

`HTML/header.html`: the "Updated:" date tracks Evolved's own game dumps, not upstream's. The header is drawn after the
game's world-map HUD (its sheet is `Icons/Interface/TopBar.png`), in three bands:
- the game's top strip (`.hud-strip`, `Icons/Interface/HudStrip.jpg`: the sheet's marble on dark teal, a gold line
  under it): the dataset's name ("Silver Seas Dataset") and the "Updated:" date on the left, where the game shows resources; Settings (the
  game's gear icon, `Icons/TML/autocombat.png`; its two settings are `.toggleChip`s) and Donate (to `HTML/Donate.html`,
  which links to Buy Me a Coffee) on the right, as the game's info and settings buttons;
- the banner (`--banner-height`, 100px): the title on the picture, which darkens towards the menu, and under it the
  current DLC's logo, as upstream shows it (`.dlc-logo`, `Icons/Text/SilverSeasLogo.png`, 250px wide, 170px on a phone).
  The banner was 80px with the title alone; at 100px the tallest page that fit a 1260px-high window still does
  (Culture Tomes, 1245px with a subculture's tome). Change the logo with the
  dataset's name when a new DLC comes out;
- the menu on the game's stone bar (`Icons/Interface/HudStoneBar.png`: the sheet's bar with its gem at both ends), its
  labels in the game's Header font; the dropdowns on the cards' panel, a group (Culture ▸) in gold, a page in blue.
  The stylesheet gives these colours: upstream's inline `style="color: burlywood"` on the groups and `coral` on Search
  are removed from `header.html`.
  Every menu item is a round medallion in one frame, the world-map HUD's Research/Empire frame
  (`ResearchButton_Frame`, from the game's TopBar atlas: `INTERFACEASSETS` atlas 13, exported with aow4_diff_tools'
  `hudimages.py export`), 44px and centred on the stone, the frame 86% of the image. In `Icons/Interface/Header/`:
  - `TomesHudIcon.png`, `SpellsHudIcon.png`, `EmpireHudIcon.png` and `ForgeHudIcon.png` (Builds/Planners) are the HUD's
    own Research, Spells, Empire and Item Forge buttons: their picture and glass from the same atlas, the picture
    enlarged 25% so the glyph is as big as the others'. Upstream: `TomesIcon.png`, `SpellsIcon.png`, the grey
    `EmpireIcon.png` and the info "i".
  - `HeroesIcon.png` (upstream: `HeroIcon.png`) is the HUD's own Heroes button in its normal state,
    `TopBar_Heroes_DEFAULT` (72px, from the same atlas), rebuilt to the others' glyph size: its glass with the helmet
    painted out, inside the shared frame, and the game's sharper helmet `RadialMenu_Heroes` smaller on it, coloured
    with the default icon's grey-to-teal gradient.
    `SearchIcon.png` (upstream: the light green `search.png`) is a teal-green glass with `Icons/TML/inspect.png`.
  - `UnitsIcon.png`, `WorldMapIcon.png` and `AbilitiesIcon.png` (upstream: the Tome Units star, the Structures hammer
    and the ability diamond) are the game's `unit`, `province` and `casttactical` text icons (`Icons/TML/`) in the
    medallions' beige, on a blank dark sphere made from the site's other medallions.
  Each glyph Evolved draws is centred in its sphere; the four HUD buttons keep the game's own placement.
  The dropdowns' icons are a little larger than upstream's (art about 18px): a 33px image (32px on a phone) with the art
  24px, in 30px rows in a 210px panel with a thin grey line (`#555`; black vanished against the dark page), not upstream's 9-slice border and its thick grey bars.
  `header.html` takes them from `Icons/Interface/DropdownIcons/`, copies of the originals with their art trimmed, scaled
  to 93px and centred in 128px, as the originals' art fills 72-100% of theirs. Solid ones (a tome's disc: over 72% of
  their box opaque) are 85px, 22px on screen, as they look bigger than a glyph; those with a ring like the buttons'
  (`CultureUnitsIcon`, `TomeUnitsIcon`, `WildlifeUnitsIcon`, `ItemForge`) 104px. A new menu icon needs such a copy.
  `ItemForge.png` is the HUD's own button, `TopBar_ItemForge_DEFAULT`. The rest of the Heroes menu is the game's own
  art for each kind of page, not one item's or skill's icon (were the TML item chest, Ascended Artificer, Challenger,
  Eldritch Governor and Piercing Shot):
  - `HeroEquipment.png` and `HeroSkills.png` (Skill List) are the hero panel's Equipment and Skills buttons
    (`Inventory_All_DEFAULT`, `Inventory_LevelUp_DEFAULT`; 70px, ringed: 104px).
  - `Ascension.png` is the crown of the Pantheon's Ascend button (`AscensionButton_Default`), since hero Ascensions
    are Pantheon skills. The game draws it half transparent in a dark bronze, so it is made opaque and recoloured to
    the beige of the two glyphs below it.
  - `Ambitions.png` is the Ambition Reward property's star (`UnitProperties_AmbitionReward`, Gameplay_Icons.clb).
  - `Governance.png` is the Governor property's castle (`UnitProperties_Governance`). Both are 64px sources.
  The UI atlases are packed by outline, so the box `hudimages.py export` cuts catches its neighbours' edges. These
  were masked to the margins the box's record holds (fields 14 and 15: each side's, as minus twice its fraction of
  the box), and the pieces left hugging the box's edge were removed. The Skill List's `SignatureSkill.png` was cut the
  same way.
  The Empire menu's are made the same way, where the game has art for the kind of page (were the Info "i", Mark of the
  Owl, the Adaptable trait and a blue secret scroll):
  - `Pantheon.png` and `Artifacts.png` are the game's text icons for the Pantheon (`[pantheon/]`, the laurel) and
    for Artifacts (the Artifact concept's own icon, the vase), 64px, as glyphs (93px).
  - The game has no icon for destiny or faction traits. `DestinyTraits.png` is a destiny mark whole
    (`RacialDestinyTrait_MarkofOwl`, Gameplay_Icons.clb, 256px), at 108px as its circle is a thin frame (112 by the
    title); `FactionTraits.png` is the faction creator's Human form (`Form_Human`), ringed (104px).
  The "Updated:" date is 14px (11px on a phone), a size under the dataset's name; both have a hard shadow, as a soft
  one blurs the Header font's thin lowercase.
No Other Database dropdown: Evolved keeps no other databases. On a phone the strip holds just the dataset and date,
and Settings and Donate are at the foot of the ☰ menu, a drawer on the cards' panel.

`Style/style.css`: on desktop (wider than 800px) the menu bar wraps onto a second line when the window is too narrow
for it (a second stone bar), and the header grows to fit, instead of the menu forcing a page-wide scrollbar. Its items are centred. The empty `#menuExtras` item (Settings and Donate's place in the ☰ menu) is hidden on desktop.
The page body (`.w3-container`: sidebar and content) is at most 1600px wide and centred, so on an ultrawide screen
the sidebar stays beside the content. Phones keep the ☰ menu.

The left sidebar (`#buttonHolder`) is 240px wide on every page (upstream: 200px, 240px on the Tome Units pages). A
page with a sidebar has `class="w3-container sidebarPage"`, a grid: the title (`.textblocktitle`, as high as its text or icons, 16px above what follows)
across the top, then in the middle column any filter box, sort buttons, subculture picker or Search form (`.pageHead`)
above the cards (`#dataHolder`), and the sidebar on the left, level with the first card. On desktop an empty column as
wide as the sidebar on the right keeps the middle column, and so the title, filters and cards, centred on the page.
Unit cards and a tome's cards are centred in it. A tome's cards have less space around and inside their frames and
476px content instead of 500px, with as much space between their two columns as between their rows, and its banner is as wide as they are (1006px instead of 1075px), so it leaves room beside the sidebar, and its icon, lore and initial bonus are one centred row under its name and description
(`templates.html`). Upstream pulled the cards
up beside the sidebar with a negative `margin-top` (in the HTML and set again by `Builder.js` and `lookuputils.js`
whenever the sidebar changed). Those margins are gone, as are the 200px and 250px left margins Search gave its cards.
Search's heading is a `.textblocktitle` like the other pages', and its form is as wide as a unit card. On a subculture
page every subculture's sidebar and cards take the same places in the grid (`.subDiv` is `display: contents`), and
`showSubDiv` clears a subculture's `display` instead of setting `block`. Pages whose sidebar stays empty (Abilities,
Passives, Status Effects and others) keep the old layout.

`Data/Builder.js`: `AddTagIconsForStatusEffects` rebuilds a text's bullet lists (`RebuildBulletLists`) instead of
upstream's two string patches. The game's dump writes a nested list as `<bullet>Outer:<bulletlist></bullet>…</bulletlist>`,
and the patches closed the outer list after the first nested one, so an item after a nested list fell out of its list
(about 110 texts in Spells, Abilities, Tomes and others). It also turns a raw `[bulletlist]`, `[/bulletlist]` or `[bullet/]` into a list
and leaves out empty bullets. The concept tooltip's title is 16px instead of upstream's 20px.

`Data/Builder.js`: a structure card (`showStructure`, every page and Search) and the City Tree show one Description
(`StructureDescription`) instead of upstream's "Full Description" and "Base Income Description". It is the
structure's description, then only those lines of the game's prediction it doesn't say itself (a Town Hall's
+1 Province Annex Range, not Warcamp's "+15 Draft income" or "Grants Warcamp to every Friendly Unit"). A structure
whose Show Prediction is off gets no prediction, as in the game: `Data/GEN/StructurePredictions.json`, which
`citytree.py` writes, lists them (Merchants' Guild, Workers' Guild and 59 more); `dataloader.js` loads it.

`Data/Builder.js`: `GetChampionMedalText` finds a unit's Champion medal effect for an ability. Upstream only matched a
medal named after the ability ("Champion Heal"); the Sealbearer's one medal for all three seals ("Champion Seals") has
a "Transference Seal:" section and so on, and each seal now shows its own section. `Data/src/dataloader.js`:
`AddExtraData` gives the three seal abilities the icons the dump leaves out (the game picks them by subculture);
`Icons/UnitIcons/0000049700001064`, `…68` and `…6C.png` are exported from the game with `clbicons.py`.

`Data/src/dataloader.js`: `RestoreDumpLinks` puts back the links the dump's texts lose. A dump text with the same words
as a text of `all.json` gets that text's links, written as the dump writes them ("inflicts
`<hyperlink>Seal of Transference</hyperlink>`, a link effect that lasts for 3 `<turn></turn> <hyperlink>Turns</hyperlink>`";
about 3,000 links in 1,800 texts, the Paragon abilities' links to Infernal Blaze and the others among them; the spell book's texts too, which are the dump's, so Mark of Tyranny links Cult of Tyranny). An
entry's own `name` stays unlinked; a `name` inside an entry (a trait's effect lines) is relinked.

`Data/GEN/LinkedAbilities.json` (`abilities.py` in aow4_diff_tools) holds the abilities the game's texts link to that
the dump leaves out, as no unit has them from the start (Infernal Blaze, Sprint, Fire Bomb: 68), in `Abilities.json`'s
format, with the DataStoreTags texts link them by (`tags`); their icons are in `Icons/UnitIcons`. `dataloader.js` adds them to the abilities. The dump's texts lose their
links ("The Fire Bomb ability"), so they are linked wherever their name stands, as the dump's abilities are, except
those the game's own texts use as everyday words ("Renew your oath", "Priceless Possession"), marked `linkedOnly`:
linked only where a text links them. So are the dump's active abilities named by one word that the game's texts use
unlinked: they are verbs there ("Heal 10 Hit Points", "Restore all Hit Points", "Convert your people"), and the game
links Restore only where it means the ability ("Gains the Restore ability"). About 50 of them (Heal, Restore, Convert,
Revive, Smite, Curse, Chaos...); a name a passive has too (Fury) keeps its links, as do statuses (Bleeding, Burning).
Seven share their name with a passive of the dump: the Seamare's and Sand Scorpion's Water Shift and Sand Shift passives
give the Water Shift and Sand Shift abilities ("Move to target hex"), and the Fire, Frost and Necro Hex, Arcfire Weapons and
Channel Power abilities give a passive of their own name. `abilities.py` skips only a name the dump has as an active
ability. A link to one of these (`abilityLinkSlugs`, from `GLOBAL.PROPERTIES.<tag>`) carries its slug, as its name alone
opens the dump's passive: `RestoreDumpLinks` writes it `<hyperlink data-slug="00000497000044D9">Water Shift</hyperlink>`,
and a link of all.json's the same way; `AddTagIconsForStatusEffects` hands the slug to the tooltip. Before, the passive's
"Unit gains Water Shift" linked the passive itself.
`Data/GEN/ExtraToolTips.json` (upstream's, by hand) keeps only what the game data has nowhere else (Expert Channeling,
Mindrend...), with the game's icons; its copies of the abilities above are gone.
`Data/Builder.js`: a link to an ability a unit uses opens its own tooltip (damage, accuracy, actions, requisites), as
in the game, not only its description; a game text's link to an ability with no concept tooltip opens the ability.
Ability names in plain text are linked in one pass, the longest first, outside the links a text already has, so no
link is made inside another ("Mana Drained" is one link, with no "Drained" link in it; "Chaos Affinity" no Chaos one).
A requisite is matched by its words, so Melee, Missile and Magic get their colors and icons whether written as the
dump writes them (`<hyperlink>Melee</hyperlink>`) or as `all.json` does.
A concept tooltip with an `image` (a property, structure, special operation... the link names) shows that icon by its
title. A link to a Province Improvement or City Structure (`GLOBAL.STRUCTURE_UPGRADES.…`) opens the structure's own card
(`StructureTooltip`); in a tooltip the card's build cost sits below its description.
A link never opens the text it stands in (`LinksElsewhere`, at the end of `AddTagIconsForStatusEffects`). Ability names
being linked wherever they stand, a status effect's own name in its text linked itself: Strengthened's "Strengthened
counters Weakened", Burning, Chilled, Flying, Dragon and 50-odd more. A link whose tooltip has the words of its text, or
nearly (word order kept, 80%) with the name of what the text is of (an ability, concept, spell or all.json entry), opens
another of that name with other words, else shows its words unlinked, as the game does. So a hero skill's "Gain Frost
Hex" opens the Frost Hex its enemies get (20% chance of becoming Frozen), not the casting ability of the same words that
`findBy`'s name lookup gives (its lookup map keeps the last of a name, `LinkedAbilities.json`'s; left as it is, units and
spells rely on it); Fire Hex, Necro Hex, Arcfire Weapons and Volatile Summon the same. One link of the game's own goes:
the Tooltip concept's tutorial text links itself ("you can string together tooltips endlessly").
`checktooltips.py` in aow4_diff_tools runs every text the site holds through this in Edge and lists the links whose
tooltip still repeats its text: none on 2026-11-04 (121 before).

`Data/src/tooltips.js`: with Selectable Tooltips on, a link inside a tooltip opens a new tooltip on top (as the game
does), the ones under it stay; each closes once the mouse is on neither it, one above it, nor the link that opened it.
Upstream had two boxes, the second replaced each time. Concept and status effect tooltips keep their links for this.
A selectable tooltip overlaps the bottom 2px of what it is for (`PlaceBelow`, gap -2; upstream left 3px between): moving
the mouse down to it across a list (a unit's abilities) crossed the next entry in that gap, whose tooltip replaced it and
went below that entry. A spell card in a tooltip (an artifact's spells, the Faction Creator's traits) loses the
template's empty affected-types row, whose -6px margin made the text 6px too tall and gave every trait a scroll bar,
and its 500px name and cost rows take the tooltip's width (`style.css`, `.tooltiptextnew`).

Secret spells are always shown: the Show Secret Spells setting, its blur ("Click to reveal") and the "???" unit names
are removed (`checkSecretSpell`, `secretSpellsList`).

### English only

Evolved is exported in English only, so the other languages are removed:

- `Data/DE`, `ES`, `FR`, `JA`, `KO`, `PL`, `RU` and `ZH` are deleted.
- `HTML/header.html`: the language dropdown (`<select id="languageSelect">`) is removed.
- `Data/Builder.js`: the `languageSelect` lookup is removed.
- `Data/src/settings.js`: `CheckBoxTooltips` and `SwitchToBeta` no longer save `language`.
- `Data/src/dataloader.js`: `CheckData` no longer saves a `language` default. `LocalizeUI` and the menu labels it read
  (`Data/EN/UI.json`, `Data/GEN/UI.json`) are deleted: they only translated the menu, and in English every label was
  the menu's own text. `index.html` no longer calls it. `GetAllData` downloads the English files once for both the
  English and the "localized" sets (`fetchJsonTexts`), reading each twice, as `AddExtraData` changes the two apart;
  upstream fetched every file twice at once, about 14 MB more on a first visit.

### One dataset

The website's own dump in `Data/EN` is of the game the mod is played on, a beta when there is one (the Manta beta until
it went live with the Silver Seas DLC on 2026-11-03), so there is no switch to upstream's `Data/BETA`, which is deleted:

- `HTML/header.html`: upstream's "Switch To … Beta Dataset" checkbox is replaced by a plain notice on the left of the top strip (`.hud-facts`), "Silver Seas Dataset". Update the name in it when the game's version or beta changes.
- `Data/Builder.js`: the `showBetaTooltip` lookup is removed.
- `Data/src/settings.js`: `showBeta` is no longer saved and `SwitchToBeta()` is removed.
- `Data/src/dataloader.js`: `CheckData` always calls `GetAllData("EN")`, even if a visitor's browser still has `showBeta` saved.
### City Tree

`HTML/CityTrees.html` is Evolved's own page, replacing upstream's (same URL and menu link):

- The links between buildings come from `Data/GEN/CityTreeLinks.json`, which `citytree.py` in aow4_diff_tools generates from the live game plus the mod.
  It holds only resids, keys and text ids; names, icons, costs and texts come from `Data/EN/StructureUpgrades.json`, `Tomes.json` and `all.json`.
- One culture and sub-culture at a time, with toggles for the Elder Vampire's castle and tome buildings. The cultures are a row
  of emblems (`.iconPicker`), the sub-cultures the units pages' picker (`.subcultureHolder`), the toggles `.toggleChip`s; the
  first and last are shared classes in `Style/style.css`. The title names the culture ("Feudal City Tree").
- Upstream's `HTML/CityTest.html`, `HTML/CityTreesNew.html` and `Data/GEN/CityTree.json` are deleted, as is the `CityTree.json` / `jsonCityTreeNodes` pair in `Data/src/dataloader.js`.

### Magic Materials

`HTML/MagicMaterials.html` is Evolved's own page, replacing upstream's (same URL and menu link, `?type=<set key>`), laid out as Ancient Wonders is:

- A tab per set (Ores, Liquids, Plants, Void Stones), its bonus and requirement on top and a large card per material under it: picture, lore, global effect, local income, combat enchantment and infusions. The bonus and requirement are a grid, labels in a row and texts in the next, each row by its text's baseline: an icon in the bonus's first line (Mana's) would push its text below the requirement's.

- Sets, their bonuses and requirements, and each material's texts, local income and combat enchantment come from `Data/GEN/MagicMaterials.json`, which `magicmaterials.py` in aow4_diff_tools generates from the live game plus the mod.
  Pictures come by the material's key, the infusion count from `Data/EN/ItemForgeUpgrades.json`.
- Each material card links to `HTML/Infusions.html?material=<name>`, which picks that material's filter.
- `Data/Builder.js`: a concept link written as `{<hp></hp>}` shows the concept's own name ("Hit Point"), on every page.

### World Map pages

`HTML/Spawners.html` (Infestations), `HTML/Landmarks.html`, `HTML/CosmicHappenings.html` and `HTML/ProvinceImprovements.html` are Evolved's own pages, replacing upstream's (same URLs and menu links, `?type=<tab>`). They share `Data/worldmap.js` and `Style/worldmap.css`: tabs and large cards, as on Ancient Wonders.

- `worldmap.py` in aow4_diff_tools generates `Data/GEN/Infestations.json`, `Landmarks.json` and `Happenings.json` from the live game plus the mod. Pictures aren't in the icon libraries it can read: it finds the site's own through upstream's `WorldStructures.json` and `CosmicHappenings.json`, by text id or name, and keeps icons it can read.
- Infestations: a tab per tier, with defenders (a Mistwalker Camp's per season), size, growth and reward. A story realm's, tome's or happening's copy under the same name is left out.
- Landmarks: a tab per DLC, with no All tab, as the other World Map pages have none (an old `?type=All` opens the first). The units a landmark unlocks are those its threshold property allows; the Leviathan parts have no picture on the site.
- Cosmic Happenings: Minor, Major, Intrigue (with their opening event) and Special (Visions of Ruin, Blood Moon, Warped Seasons). Story realm happenings are left out. A Minor, Major or Special one has its events as the Oceanic ones do (Foreshadowing, Beginning, End), each a fold with its choices; an intrigue keeps its opening event alone, its others being one random war event over and over. Their pictures are the game's, as the Oceanic ones' (below): every Minor and Major one, Blood Moon, and Warped Seasons' own (`UNLINKED_PICTURES`: the game has it but links it nowhere); upstream's copies of the same art are gone. Toll of Seasons keeps upstream's (no picture linked to it in the game); the intrigues and the Visions of Ruin's two ages have none in the game, their events showing where they happen, so their cards show their icon.
- Oceanic Happenings (`HTML/OceanicHappenings.html`, Evolved's own; upstream has none): the Silver Seas' 20, a tab for the Minor ones and one for the two Major ones (The Nevermoor, The Cursed Gold; the game's type and icon for them are the Minor ones', only their tags tell). They are `Happenings.json`'s group `Oceanic`. A card has the picture the game shows behind the happening's events (`Icons/CosmicHappenings/image_<key>.png`, exported by `worldmap.py` from `InterfaceAssets_SilverSeas.clb` at 512px), the units its choices unlock, then each event as a fold (Beginning, End, a contest's two prizes) with its choices: what each costs and gives, in the Ancient Wonders' words (`AncientWondersPage.Resource`, so the page loads `ancientwonders.js` too), and the units it lets cities draft (Mating Season's Feed the Spawning Shoals: Nimu, Seamare...). The menu and title icons are made from the game's 72px icon (`category_icon_oceanic.png`).
- A card's list of units folds away past 4 of them (`UNIT_LIST_FOLD` in `Builder.js`, `WmUnitList` in `worldmap.js`): what a spell summons, a structure, landmark, trait, artifact, skill or happening unlocks. A wonder's Rally of the Lieges doesn't (five units at most, on one wonder), nor do defenders.
- Province Improvements: a tab per kind, grouped by where they come from; the search and resource buttons work across the tabs, whose counts follow. The texts stay the dump's. The victory monuments and Magic Victory structures aren't listed, as on upstream's page.
- A search bar under the tabs of Infestations, Landmarks, Cosmic and Oceanic Happenings, Ancient Wonders and Realm Traits (`WmSearchBar` in `worldmap.js`, `WmTabsSearch` for a page `WmTabs` made; Ancient Wonders and Realm Traits load `worldmap.js` and `worldmap.css` for it). It searches all tabs at once: a card stays while its text holds every word typed, in any order, closed folds included and a wonder's stories too (`data-search`, as a story is built only when opened); each tab's count follows, a group heading (a Minor happening's kind, a realm trait's subcategory) goes with the last of its cards, and an emptied tab says "Nothing here matches.". It hides with a class (`.wm-filtered`), as a card's own display outranks the browser's `[hidden]`.

### Spells pages

`HTML/StrategicSpells.html`, `HTML/CombatSpells.html` (Tactical Spells), `HTML/TransformationSpells.html`, `HTML/EnchantmentSpells.html` and `HTML/SiegeProjects.html` are Evolved's own pages, replacing upstream's (same URLs, `?type=<tab>`). They share `Data/spellbook.js` and `Style/spellbook.css`, on top of `Data/worldmap.js` and `Style/worldmap.css`.

- `spells.py` in aow4_diff_tools generates `Data/GEN/SpellBook.json`: costs, upkeep, kinds and where a spell comes from from the live game plus the mod, the texts from the dump (the game fills in its own values there). The dump's texts have a few repairs: a value it lost ("a -hex radius"), a number run into an icon ("+1Range"), one form for any count ("3 Turn").
- A tab per kind; a Damage/Debuff Spell is on both tabs, a dual tome's enchantment on both affinities'. Search and the affinity buttons work across the tabs, whose counts follow (a card stays while its text holds every word typed, in any order); sorted by tier, the cards are grouped by tome tier. The tabs, search, buttons and sorts are `WmBoard` in `Data/worldmap.js`, which the Heroes pages use too (`SbBoard` gives it the affinities and sorts). A list of more than 4 units folds away (see World Map pages).
- A spell's source is where its unlock property is given: a tome, a hero skill, an artifact, an adventure, a happening, a building...
- Spells sharing an id with different texts each have their card (`Ancestral Harmony` for each animal); the old pages showed the first's text on every copy.
- What no one can get is left out (`left_out` in the file, with the reason): the property that unlocks it is given by nothing, such as the Empire Tree's Rites, Elemental Bane and Raise Zombies. A story realm's spells are left out too, as are those the data can't tell are unused (`NOT_SPELLS` in `spells.py`, from the maintainer): Construct Population and Signet of Loyalty (not in use), Move Portal (a button that moves a Shrouded Isles portal), Bone Horror Ritual (an old mod spell) and Astral Wisp Ritual (replaced by Astral Keeper Ritual). The Fey Invasion's relic spells and siege projects, which the dump lacks, are in, their texts filled by the tool.
- Upkeep comes from the spell's cost data, so Corrupt Pact, Tyrannical Exploitation and Faithful Whispers show theirs, which the dump leaves out.
- The Enchantments page is titled "Enchantments" (upstream: "Unit Enchantments").

### Heroes pages

`HTML/HeroEquipment.html`, `HTML/Infusions.html` (Item Forge), `HTML/HeroSkills.html` (Ascension Skills), `HTML/HeroAmbitions.html`, `HTML/HeroGovernance.html` and `HTML/HeroSkillsList.html` (Skill List, titled Hero Skills) are Evolved's own pages, replacing upstream's (same URLs, `?type=<tab>`). They share `Data/heroes.js` and `Style/heroes.css`, on top of the Spells pages' cards (`SbCard`) and board (`WmBoard`): tabs, a search bar, rows of choice buttons and sorts that work across the tabs.

- The things are the dump's, each once: copies with the same contents are one card (a culture's starting Greatsword, five of them), with their DLC if they share one, else none (the base game's copy and a DLC's). A skill's, item's or infusion's ability is drawn as on a unit's card; a passive one is its text.
- Equipment: a tab per slot, the items with a tier (the others are the Item Forge's bases): 418 cards for 453 items. Class buttons keep what a class can wear (an item naming no class is anyone's). A card has the item's abilities, its disabled slots, where it comes from, the classes, and who alone wears it ("Dragon Lord only", Giant Kings). Sorted by tier, under headings, or by name. Where it comes from is `Data/GEN/HeroItemSources.json` (aow4_diff_tools' `heroitems.py`, by item id; a merged card has all its copies'), a line for each kind, with what it means on hover: Loot (the general item rewards: sites, chests, lairs, resource nodes, quests), a shop (Beast Wrangler, Training Camp, Mystical Seer), a dwelling (Crystal Dwelling, the Free Captain: its trade or its reward when conquered), a culture action (Prospect Province), an Ancient Wonder, happening, quest, event or world crisis, a starting loadout (a ruler type's, a culture's heroes', a Pantheon unlock's), a culture's or ruler type's default gear (the culture weapons upstream called unobtainable: the game's T1 Unobtainable Items set, which nothing uses), and a faction mount (by form, form trait or Pantheon). 14 cards have none: NPC-only gear (the Free Captain's captains' weapons), class defaults, Camel and Sand Scorpion Mount. A slot's tab picture is drawn larger than a text icon (`hb-tab-pic`), and a class button's icon is centred (icons.css' class icons have a margin-top). Its menu link is the page alone (was `?type=Primary%20Weapon&sort=tier:true`). The site's `deromanize` counts from 0 ("I" is 0): `HbTier` reads an item's tier.
- Item Forge: a tab per kind of infusion. Damage is the game's damage channels (`damage_channel` ids, "Change damage to…"); Ability gives an ability to use; Passive is the rest, True Damage and "+10% Magic Damage" included (upstream counted every name ending in "Damage"). What an infusion fits is read from its tag filter against the Item Forge's item types' tags (`HbTagFilter`: "Contains inherited X" holds for X and the tags under it, "Contains X" for X alone), as 24 kinds of item with the old page's pictures from `Icons/ItemForge` (a Grimoire's and a Magic Strike Weapon's are the item their type forges). Copies differing only in what they fit are one card fitting all of it (Death Damage for each claw). Buttons for the materials, with the Pantheon's (upstream's hand list, now `HB_PANTHEON_INFUSIONS` in `heroes.js`), and for the kinds of item; sorted by points, under headings, or by name. `?material=<name>` (the Magic Materials page's link) picks a material.
- Ascension Skills: a tab per affinity of the tomes an Ascension needs (`AscendedInfo.json`; a dual tome's skill on both, Cosmos Chosen on all six). A card lists the tomes as the Spells pages list a tome source, the spell it unlocks as an artifact's spells are listed (`SpellList`), and the units it lets cities draft.
- Ambitions: one list (the tab bar hides when there is one tab): the major and minor ambition's goal and Renown, the skill the major one gives. The two the game marks WIP (Necromancer, Martyr) are left out, as before.
- Governance: Rulers (Champion, Wizard King, Dragon Lord, Eldritch Sovereign, Giant King, Elder Vampire: the game gives a ruler type's governor with it) and Heroes (the other ten); the benefits by Renown level. The dump has the Giant King's four times, one per clan, each enabling its own giants: four cards, named by clan.
- Skill List: tabs Class, Ruler (by ruler, the Giant Kings by clan), Signature (by the property that offers it: Astral…; its icon is the unit panel's Signature Skill button, `Icons/Interface/SignatureSkill.png` from `SignatureSkill_DEFAULT`, drawn at 28px as `hb-tab-icon`), Affinity and Other (Training Camp, Secret Spells, Quests and Adventures, Ruler Backgrounds), sorted by tree (under headings, in the tree's rows) or name. Class buttons keep a class's tree and the other tabs' skills; Active and Passive go by the ability a skill gives. A card names the skills it requires (any one of them, as the Hero Builder reads `required_skills`) and those it can't be taken with. Ascensions are on their own page. `heroskills.py` in aow4_diff_tools writes `Data/GEN/HeroSkillSources.json`: what gives a skill outside the trees, and the 85 the dump has that no one can get (the Invalid Hero Skills group, the old Ritualist and Wizard King I-III chains, nameless ones, 13 Pantheon skills now the Pantheon weapons' infusions), which upstream's list showed. Inspiring Presence is in the Invalid group but an event gives it (Cinren's Arcanum, a hero quest), so it is in.
- `Spells.html?skill=` and `?governance=` (a unit's origins link there) show these cards; the Giant King's governance its four.
- Upstream's hero cards and lists are gone from `Data/Builder.js` (`showItem`, `showSkill`, `showHeroGov`, `showInfusionListEntrySmall`, `findItemsWithArgument` and the like); `showHeroTrait` stays for the Faction Creator's ambition tooltips.

### Empire pages

`HTML/PantheonTree.html`, `HTML/DestinyTraits.html`, `HTML/FactionCreation.html` (Faction Traits) and `HTML/Artifacts.html` are Evolved's own pages, replacing upstream's (same URLs, `?type=<tab>`); the Empire Tree is its own (above). They share `Data/empire.js` and `Style/empire.css`, on the Heroes pages' cards (`HbCard`, `Data/heroes.js`) and the board (`WmBoard`), and have title icons made from their menu icons (above), as the Heroes pages' are.

- The traits are the dump's (`Traits.json`): those in use (`enabled`), each once. Their pictures are the dump's `Icons/TraitIcons`. Ruler types, cultures and the prophecies' readings are `Data/GEN/FactionCreation.json`'s (upstream's), with all.json's texts; artifacts are `Relics.json` (`spells.py`).
- Faction Traits: tabs Form Traits (by group: Offense, Defense, Utility, Mounts, Adaptations, Flaws; or by points), Society Traits (by affinity, the Pantheon's last), Prophecies, Ruler Types and Cultures. Affinity buttons work across the tabs (a trait's, a reading's, a culture's), and buttons for the Pantheon's traits and the good and evil ones. A card has the trait's effects, starting bonus (an empire skill or structure by name), what it can't be taken with, its units (`StructurePredictions.json`), and its points, alignment and affinities at its foot. The 16 society traits the faction creator doesn't show at first (`front_end` false) are the Pantheon's: `Pantheon_Tree.json` has every one.
- Prophecies: each Vision (a society trait) and its readings by affinity: objective, rewards, Rally units. A ruler type's card lists its dragon types, clans or bloodlines; a culture's its subcultures (Architect's and Mercantile's, which the data has no text for, by name on one line) and links its units page.
- Destiny Traits: the eight marks, each with the quest that gives it and what that asks (`DestinyTraits.json`; "Sons/Daughters of War" for the quest named with a placeholder).
- Artifacts: a tab per DLC with its logo; the tab ids are the old page's (`Giants`, `Fractured`, `Secret`, `SilverSeas`), which a unit's origins link to (`ArtifactTab`). A secret scroll's text names its spell with a placeholder the game fills (`{GLOBAL.SPECIAL_OPERATIONS.…Hyperlink}`): the spell's name. A menhir's blessing is spelled out, then the spells (`SpellList`), units and lore. The menu links the page alone (was `?type=Giants&`).
- Pantheon Tree: the two pages as tabs, each page's parts where `Pantheon_Tree.json` places them (upstream's headings "Page 1 Left" and the like are gone, but Realms and DLC Outfits), on the Empire Tree's panel, scrolling alone where the window is narrow. A node keeps upstream's frame for its kind. Hovering one shows the thing's own card where the site has one: the society trait's, the Item Forge's infusion (by id among `HB_PANTHEON_INFUSIONS`, or by the name less "Passive Item Infusion": Innate Spell Jammer isn't in the dump), the mount's item; else its name and picture. The search and a kind's button light up what they find and dim the rest; the tabs count what is lit.
- `Spells.html?trait=` (a unit's origins) shows the Faction Traits page's card. Upstream's cards and lists for these are gone from `Data/Builder.js` (`showRelic`, `showAllRelics`, `showDestinyTrait`, `showTraitsWithArgument` and their finders); `showTrait` stays for the Faction Creator's tooltips and anything the new lists lack.

### Search

Spells, siege projects and the world map's sites come from the files their own pages read (`SpellBook.json`, `AncientWonders.json`, `Landmarks.json`, `Infestations.json`, `MagicMaterials.json`, `Happenings.json`) and show those pages' cards: `Data/ancientwonders.js` and `Data/magicmaterials.js` hold their pages' code as modules for this, and `Data/worldmap.js` the Infestation, Landmark and Happening cards. Happenings has its own filter, and the Oceanic ones their own tab of results, by their events' texts too. Artifacts, and the traits, prophecies, ruler types and cultures, are the Empire pages' (`Data/empire.js`), searched by their texts (an artifact's spells and units too, a Pantheon trait by "pantheon"), with those pages' cards. Hero skills, equipment, infusions, ambitions and governors are the Heroes pages' (`Data/heroes.js`), searched by their texts and their abilities' (equipment by where it comes from too: "beast wrangler"), with those pages' cards; what no one can get isn't found. Governance is new to Search (its own switch, `f=hg`).

### Tomes

- A tome's page is laid out as the game's Tomes screen (`TomeOfWondersScreen.xaml`): the book in its rune circle, its name, tier and text, the skills as medallions by tier on a scroll, the Initial Bonus on a smaller scroll, then the lore. Its sizes and places are the game's, in one unit (`--u`, by the card's width, so a page with a sidebar and one without come out the same; only the book is smaller than the game's 230 units, at 180, and the medallions larger than its 135, at 165): the art is a fixed background whose centre is 150 units above the screen's middle, and everything else is one column centred on that middle, so a tome holding more has its book higher in the circle, while the circle stays. The stage is the game's screen trimmed to what the circle and the fullest tome need, so every tome's card is the same height. Beside a sidebar the tome stands under the page's title rather than in the middle of its card, from 1200px wide. The skills' scroll is in the page's middle with always three columns, the bonus beside it, centred on its height. Links in the tome's text and the bonus's affinities are made as everywhere else (`AddTagIconsForStatusEffects`), but the text has the game's links only (`onlyGameLinks`): `RestoreDumpLinks` gives it all of them (each tome's text is in all.json), and the ability names left in it are words, which linked the Heal ability to Tome of Faith's "Heal and support your units" and Convert to Tome of Exaltation's "Convert your people". Its skills are in the game's order (`SbGameOrder`): by tier, and within a tier as the game's unstable quicksort leaves the dump's list, which reproduces all 6 tomes compared with the game's screen; the data has no order of its own for them. A tome no one researches shows no tier: a culture's is unlocked from the start, a pact's spells come from a Dwelling. A medallion's frame goes by the skill's kind, as the game's does (`SbSkillFrame`), and hovering shows its card, the only place a tome's page shows it. The art is in `Icons/Interface/Tome`, exported with `hudimages.py` (`Scroll_Research`, `Scroll_Vertical`, their `_End`s, `ReserchSkillFrame_*`, `UnitPanelBackground_Lines`): the frames are cut at 86% of their height, as the atlas's next image shows below them, and the lines are lightened, which the game does itself. `ReserchSkillFrame_Tier*` and `UnitPanelBackground_Runes` export as the wrong part of their atlas, so the tier is text in the frame's ring and the runes are `Runecircle.png`.
- The medallions' cards are the Spells pages' (`SbTomeSkills` in `Data/spellbook.js`, also for units, structures and empire bonuses): which of a spell's versions is by the game's own link to the tome, so Storm Crow's Ancestral Harmony speaks of Storm Crow, and spells the dump's tome has no link for (Call young Dragon, Conjure Elemental) are there too. `Spells.html?spell=`, `?siege=` and `?tome=` draw the same cards; a spell's id shows all its versions. The old `showSpell` card stays only for what is left out and in a few tooltips (Faction Creator, the Artifacts page's spells).
- The dump lists an Architect's Monuments II, III and IV six times each, a version per Affinity. A tome's Initial Bonus lists each once. II's six are the same; III's and IV's differ in their Protection and Affinity, which `StructureVersions` shows as a "By Affinity" list in the one text, wherever a structure's text is drawn.
- `HTML/GeneralCultureTomes.html` (the menu's Culture) picks as the City Tree does: a row of culture emblems, then the subcultures, with General Research as an emblem of its own. Its address is `#culture=<key>&sub=<tome>`, as the City Tree's; an old `?type=<tome>` still opens that tome.

### Units

The Empire Tree is centred, with a title icon from `DropdownIcons/EmpireIcon.png`; its lines are placed in pixels, so all of it is enlarged together with `zoom` where the window has the room, and a narrow window scrolls the tree alone. A Units or Tomes page's sidebar starts with tier buttons (`AddTierFilter`, for the lists of `SetButtonsAndDivs` named in `TIER_LIST_TYPES`): they filter the list and the cards, the choice holds for the whole page, across its subcultures, and a tier the list doesn't have is greyed out. A list with no tiers (the pacts) has none, and the Culture page's tomes have no tier and no such list. A unit's mentions keep to its card: more than six start a second column, a source with several versions (a hero skill per hero type, an infusion per item, an ability on many units) is one icon, and what a unit cannot become is no mention (the Soulbound immunity's "cannot be transformed into a Decaying Zombie" gave Decaying Zombie 31 of them). A link to a unit opens the unit's tooltip, as the game's (`UnitTooltip`, all texts through `AddTagIconsForStatusEffects`): name, Hit Points, role, tier, Defense and Resistance, attacks, movement, upkeep; by the words of the link, name or plural. A link in other words than an ability's name opens that ability, unless a concept has those words (`AbilityLinkInOtherWords`): what all.json's links to it say ("Immobile" is `GLOBAL.PROPERTIES.IMMOBILIZED`), or its plural ("Animals", "Battle Mage Units"). A medal's named rewards link to what they do (`addRewards`); its values don't.

A Units or Tomes page whose address names no entry opens on its list's first (`OpenFirstEntry`, from `SetLevelUpStuff`), and a subculture on its first unit, as the Tomes menu's links name a tome; upstream's Units menu links named a unit, which Evolved's left out, so those pages opened on all their cards. ☰ still shows them all. A card's images load once it shows (`LazyImages`, set in the same run of code as their `src`), as do a tome medallion's card's: the other cards are still built, but no longer download their pictures (Astral Tomes about 17 MB of them). Highlight Number (`highlightNumbersInDiv`) leaves numbers in tags and entities alone: it wrapped a unit link's `data-unit` id, and the link's tooltip failed (Blessed Soul's medallion).

A unit's origins read the new data: `CheckIfInSpells` and `CheckIfInSiege` the spell book, so a spell no one can get is no origin and the Fey Invasion's are; `CheckIfInAncientWonder` the book's `sites`, made from `AncientWonders.json` and `Landmarks.json`, whose links go to those pages. Upstream's list was wrong on some (Haunted Battlefield's skeletons).

What lets cities draft a unit comes from the game (a unit's Required Structure Properties, see aow4_diff_tools'
CLAUDE.md): `StructurePredictions.json`'s `units` (structures by resid: province improvements, and city structures such
as the Vampire Castle: Soul Forge's bats; not the Shipyard's Ram Warship nor the Grand Wharf's Ballista Warship, which no
player can get: `UNUSED_UNITS` in `citytree.py`), `traits` (Tidecallers' 13 water units) and `skills`
(Ascension: Living Spider Nest's five spiders, Rosebound Noble, Nimue's secret spell), from `citytree.py`, and
`Relics.json`'s `unit_unlock` (Heart of the Maer, Head of Ceaseless Laments, Nimue's Secret Scroll), from `spells.py`.
An artifact's spells are such a list too (`SpellList`: the spell book's icon and name, a link to the spell, its card on
hover); upstream put each spell's 500px card in the text, which stood out of a narrower card (Search).
The card of each lists them (`UnitUnlocksMenu`) as the Spells pages' cards list a spell's units: an "Unlocks" label
over the links, folded away past 4 ("Unlocks (13)"), in `style.css` as `.unitUnlocks` since not every page loads
`worldmap.css`; upstream's button with a black list (`.unitUnlocksMenu`) is gone, and a Vision of Destiny's "Rally
Units" use the same list. A unit's origins name them: "Unit production unlocked by Society Trait / Artifact / Hero
Skill" (`CheckIfInSocietyTraits`, `CheckIfInArtifacts`). `Spells.html?trait=` shows a trait (upstream linked there with
nothing to show it). The Artifacts page has a Silver Seas Artifacts tab (`ArtifactTab` names a DLC's tab).
An Oceanic happening whose choices unlock a unit is one of its origins, through the spell book's `sites` ("Unit production
unlocked by a choice in Oceanic Happening Mating Season").

### Old lists

`Data/GEN/WorldStructures.json`, `CosmicHappenings.json` and `CombatEnchantments.json` aren't loaded by the site any more, and `showWorldStructure`, `showCosmicHappening` and the like are gone. Keep the first two: `worldmap.py` finds the pictures through them. `Data/GEN/Relics.json` is now written by `spells.py`, with the game's names and spells, keeping upstream's ids and pictures. An old `Spells.html?wonder=` link goes to the wonder's page.

On a phone a sidebar page has no column for its sidebar: it comes above the cards, and a card wider than the page (a unit's) scrolls by itself. A long page title wraps between its two icons.

The Spells, World Map, Heroes and Empire pages have the same icon either side of their title as their entry in the menu, at 40px. `Icons/Interface/TitleIcons` holds them, made from `Icons/Interface/DropdownIcons` so each takes up about the same space on the page, 27-28px by eye, whatever its shape, centred on its weight: by the box its art fills, not its painted area, which leaves spiky and narrow shapes small. The affinity Tomes and Tome Units pages' icons are 30px to match; a culture's medallion is 44px. The Empire Tree's dark-ringed disc is 32px of its 40.

### Silver Seas

The DLC as Evolved shows it, not upstream's pages (2026-11-03):

- `HTML/MercantileUnits.html` (Culture ▸ Mercantile: Barony and Cartel) and `HTML/SilverSeasUnits.html` (Tomes ▸ The
  Silver Seas) are the other culture and Tome Units pages' layout. Their menu icons, `DropdownIcons/mercantile.png` and
  `SilverSeas.png`, are made as above (93px art). The City Tree and the Culture tomes page pick Mercantile up from the
  data; `CityTrees.html` falls back to a culture's key when it has no icon yet.
- The dump tags the DLC `SILVERSEAS`; upstream's theorycrafting tag `THESILVERSEAS` and its four placeholder tomes in
  `Data/Faction.js` are gone. A Silver Seas unit or tome has upstream's blue corner in a sidebar (`.SILVERSEAStriangle`,
  `Style/style.css`).
- Mercantile in `Data/GEN/FactionCreation.json` is a real culture with the game's text: `extraLookup` is its lore,
  `extraLookup2` (`…@CULTURE_MERCANTILE@MERCANTILE`) its name and bullets, as for Primal and Reaver. Without the second,
  the Faction Creator's Culture menu broke on its nameless entry and opened on nothing (2026-11-05).
- `IsDwellingPact` (`Data/Builder.js`): the Pirate Dwelling's Pirate Bond is a pact though its id doesn't end in `_pact`;
  the Dwelling and Culture tome pages both ask it.
- A tome skill with no spell of its own that stands for several (Pirate Bond's Conjure Pirate Captain: a Conjure …
  Captain per captain) shows them on one medallion (`family` in `SbTomeSkills`). `spells.py` gives those six spells
  Pirate Bond as their source: a skill outside a tome's grid that requires a property one of the tome's skills gives.
- Pictures upstream made by hand are upstream's (unit previews, unlock icons, relics, structures, culture emblems).
  `UnitUnlockIcons/wavemaster.png`, which upstream lacks, is cut from its preview in the others' purple ring.
  `Data/GEN/Relics.json` got upstream's eight new relics so `spells.py` keeps them; `WorldStructures.json`,
  `FactionCreation.json`, `BuilderLookup.json` and `BuilderLookupHero.json` are upstream's, and `AscendedInfo.json`
  is upstream's, with its four new Ascensions (Eternal Ice, Piracy, the Damned and Hydromancy's Tide Summoner). A tome
  lists every entry naming it, so an entry there twice shows twice.

### Ancient Wonders

`HTML/AncientWonders.html` is Evolved's own page, replacing upstream's (same URL and menu link, `?type=Bronze|Silver|Gold`):

- A tab per tier, a card per wonder, and under it the wonder's adventures, one open at a time: the story, each option with its cost, reward, affinity check and enchantments (their text on hover), the defenders and the aftermath. The side lists the Combat Enchantments with their text: "Always active" (the event's own, and those every way into the battle adds, as Dark Whispers: the game writes it on each option) and "Depends on your choice" (the rest, a failed check's included).
- Everything but the pictures comes from `Data/GEN/AncientWonders.json`, which `ancientwonders.py` in aow4_diff_tools generates from the live game plus the mod. Upstream's hand-kept lists are gone from this page, and with them the stale incomes and enchantments; Breached and Shrouded Arcanum are listed.
- Stories read as if your leader enters, the game's own variant. What only play decides is worded generally ("your Hero", "Hero Item") in the event colour, so no `{EventHero}` placeholders remain.
- `Icons/CombatEnchantments/` gets the game's icons from the same tool, under the name `Data/Builder.js` looks for. Six enchantments have no icon the tool can read (it warns about them) and show without one.

## Game data

Most of `Data/EN/*.json` comes from Evolved's own game dumps (the game's DUMPALL, with the mod loaded), with mod balance values and mod-only content.
Examples: Specialized Troops is −40% instead of −25%, and `EN/Spells.json` has spells upstream lacks, such as Astral Keeper Ritual, Bone Horror Ritual and Bone Dragon Ritual.
`Data/EN/all.json`, the game's texts, is Evolved's own too: `alltexts.py` in aow4_diff_tools writes it from the live game's EN.MO with the mod's `.po`, filled in with the values of the resources that show each text (mod values included: Tranquility Pool −5%, Infrastructure −33%).
It started from upstream's copy and keeps its entries and order; texts the game added are appended, and texts it no longer has are kept, as pages may still look them up.
A value the game only knows in play, or whose tag no resource holds, stays a placeholder, `<eventColor>{key}</eventColor>`. A value several versions of an effect share a tag for, with nothing to tell which the text means, shows the lowest, as the game does until one applies to a unit (Cult of Tyranny's 60% and 5 Temporary Hit Points; a Single Shot attack uses the higher 90% and 10). Never take `all.json` from upstream: it has vanilla numbers, older texts and broken bullets.
`Data/EN/concept_tooltips.json`, the concept tooltips, is written by the same tool: every concept the game's tooltip libraries name (Title, icon, Hyperlink wording, Description), 228 more than upstream's copy had (On Fire, Province, Hero), and the properties, structures and the like texts link to, 346 of them with their icon (`image`, exported to `Icons/UnitIcons`). A pickup a text links to is named by the game's name for it ("Abandoned Egg Clusters", "Galleon Wreckages"), not its tag's words ("Water egg pickup guardeds").
Both follow the game's grammar more closely than the game's own texts do: a word the game counts agrees with the number before it ("for 1 Turn", "3 Turns").
`Data/GEN/all_spawnsets_strategic.json`, the world map's unit pools that events link to, is written by `spawnsets.py` too (659 pools; upstream's had 416, some under garbled names).
`Data/GEN/LinkedAbilities.json` (`abilities.py`): the abilities texts link to that the dump leaves out (see above).
`Data/GEN/RealmTraits.json` and `Icons/RealmTraits/` (`realmtraits.py`) feed `HTML/RealmTraits.html`, in the World Map menu, a tab per category (`?type=Geography`): upstream's page was never linked and picked texts by id.
The rest of `Data/GEN/*.json` comes from upstream, apart from the files Evolved generates (below).

DUMPALL also writes the icon folders `AmbitionIcons`, `EmpireProgressionIcons`, `GovernanceIcons`, `SiegeProjectIcons`, `SpellIcons`, `TomeIcons`, `TraitIcons`, `UnitIcons` and `UpgradeIcons`.
The other folders under `Icons/` are made by hand. An icon they lack can be taken from the game's content libraries with `clbicons.py` in aow4_diff_tools (`find` a name, then `export … --crop`, which gives the hand-made icons' size); combat enchantments are named after the enchantment (`umbral_ramblings.png`).

When syncing, any data conflict is resolved in favour of the local dump. Non-conflicting upstream data changes are accepted; the next game dump corrects them if the mod overrides them.

After copying a new dump into `Data/EN`, double-click `update_site.bat` in aow4_diff_tools. It runs `abilities.py` (`Data/GEN/LinkedAbilities.json`), `alltexts.py` (`Data/EN/all.json`, `concept_tooltips.json`), `spawnsets.py` (`Data/GEN/all_spawnsets.json`, `all_spawnsets_strategic.json`), `tmlicons.py` (`Icons/TML`, `Style/tmlicons.css`), `realmtraits.py`, `citytree.py` (`Data/GEN/CityTreeLinks.json`, `StructurePredictions.json`), `magicmaterials.py` (`Data/GEN/MagicMaterials.json`), `ancientwonders.py`, `worldmap.py`, `spells.py`, `affinityattacks.py` (`Data/GEN/AffinityAttacks.json`), `heroskills.py` (`Data/GEN/HeroSkillSources.json`) and `heroitems.py` (`Data/GEN/HeroItemSources.json`), in that order: `alltexts.py` leaves the abilities `abilities.py` writes out of the concept tooltips.
Then `python checktooltips.py` there lists tooltip links that open the text they are in (see `LinksElsewhere` above).
A new culture's emblem or a DLC's relic and landmark pictures have to be on the site before `citytree.py`, `spells.py`
and `worldmap.py` run, as they look for them: run those three again after adding them.
The dump gets the Architect units' attacks wrong: it writes each affinity version with the ability's default attack
(the Surveyor's Magic Bolts as 10 Lightning), not the affinity's plugin the game uses (Spirit Bolts, 6 Spirit).
`affinityattacks.py` writes the game's attacks and names to `Data/GEN/AffinityAttacks.json`, by ability slug, and
`AddExtraData` (`Data/src/dataloader.js`) puts them on the abilities.
`after_update.bat` (the mod reports) can't do this: it runs before the patched game has made the new dump.

## Taking changes from upstream

For a single fix or feature:

1. Fetch upstream: `git fetch https://github.com/MinionsArt/aow4db.git main:refs/remotes/upstream/main`
2. Look at the change (`git log upstream/main -- <path>`, `git show <commit>`) and apply only the files or hunks wanted,
   by hand or with `git diff <commit>^ <commit> -- <path> | git apply -3`. Upstream commits are not renamed,
   so apply the [renames](#renames) to what comes in.
3. Check it doesn't undo anything listed above, and that no `aow4db` references remain.

A full sync is rarely worth it now, since Evolved's own pages and changes keep growing. The procedure is kept below
for reference.

### Full sync (as done on 2026-10-22)

1. Fetch upstream as above.
2. In a temporary worktree, check out the last synced upstream commit, apply the [renames](#renames), and commit (the base).
3. Replace the worktree's contents with `upstream/main`, apply the renames again, and commit on top of the base.
4. On `main`, `git cherry-pick --no-commit <that commit>`. Git merges it three-way against the renamed base, so the customizations above survive.
5. Resolve each conflict hunk, not whole files: `git checkout --ours <file>` throws away upstream's other changes in that file too.
   For data, take the local side of the conflicting hunks; for code, merge by hand.
   Then check that no `aow4db` references remain, commit to `main`, and update the "Last full sync" commit above.
   Upstream changes to the deleted language folders arrive as "deleted by us" conflicts: keep them deleted (`git rm -r -q Data/DE Data/ES Data/FR Data/JA Data/KO Data/PL Data/RU Data/ZH`).
   A brand-new upstream language folder would arrive without a conflict, so check `Data/` for one.
   `HTML/CityTrees.html`, `HTML/MagicMaterials.html`, `HTML/AncientWonders.html`, `HTML/Spawners.html`, `HTML/Landmarks.html`, `HTML/CosmicHappenings.html` and `HTML/ProvinceImprovements.html`, `HTML/StrategicSpells.html`, `HTML/CombatSpells.html`, `HTML/TransformationSpells.html`, `HTML/EnchantmentSpells.html` and `HTML/SiegeProjects.html`, `HTML/GeneralCultureTomes.html`, `HTML/HeroEquipment.html`, `HTML/Infusions.html`, `HTML/HeroSkills.html`, `HTML/HeroAmbitions.html`, `HTML/HeroGovernance.html` and `HTML/HeroSkillsList.html` are the files to keep whole: discard upstream's changes to them (`git checkout --ours` on each).
   Keep `HTML/CityTest.html`, `HTML/CityTreesNew.html` and `Data/GEN/CityTree.json` deleted, and don't let `CityTree.json` back into `dataloader.js`.
