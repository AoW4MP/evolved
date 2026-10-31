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
  under it): "Manta Beta Dataset" and the "Updated:" date on the left, where the game shows resources; Settings (the
  game's gear icon, `Icons/TML/autocombat.png`; its two settings are `.toggleChip`s) and Donate (to `HTML/Donate.html`,
  which links to Buy Me a Coffee) on the right, as the game's info and settings buttons;
- the banner (`--banner-height`, 80px): just the title on the picture, which darkens towards the menu;
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
  `ItemForge.png` is the HUD's own button, `TopBar_ItemForge_DEFAULT`.
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
about 3,000 links in 1,800 texts, the Paragon abilities' links to Infernal Blaze and the others among them). An
entry's own `name` stays unlinked; a `name` inside an entry (a trait's effect lines) is relinked.

`Data/GEN/LinkedAbilities.json` (`abilities.py` in aow4_diff_tools) holds the abilities the game's texts link to that
the dump leaves out, as no unit has them from the start (Infernal Blaze, Sprint, Fire Bomb: 60), in `Abilities.json`'s
format; their icons are in `Icons/UnitIcons`. `dataloader.js` adds them to the abilities. The dump's texts lose their
links ("The Fire Bomb ability"), so they are linked wherever their name stands, as the dump's abilities are, except
those the game's own texts use as everyday words ("Renew your oath", "Priceless Possession"), marked `linkedOnly`:
linked only where a text links them.
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

`Data/src/tooltips.js`: with Selectable Tooltips on, a link inside a tooltip opens a new tooltip on top (as the game
does), the ones under it stay; each closes once the mouse is on neither it, one above it, nor the link that opened it.
Upstream had two boxes, the second replaced each time. Concept and status effect tooltips keep their links for this.

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
  the menu's own text. `index.html` no longer calls it.

### Beta data only

Evolved is played on the game's beta, so the website's own dump in `Data/EN` is already beta data and there is no switch to upstream's `Data/BETA`, which is deleted:

- `HTML/header.html`: upstream's "Switch To … Beta Dataset" checkbox is replaced by a plain notice, "Manta Beta Dataset" on the left of the top strip (`.hud-facts`). Update the beta name in it when the game's beta changes.
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

- A tab per set (Ores, Liquids, Plants, Void Stones), its bonus and requirement on top and a large card per material under it: picture, lore, global effect, local income, combat enchantment and infusions.

- Sets, their bonuses and requirements, and each material's texts, local income and combat enchantment come from `Data/GEN/MagicMaterials.json`, which `magicmaterials.py` in aow4_diff_tools generates from the live game plus the mod.
  Pictures come by the material's key, the infusion count from `Data/EN/ItemForgeUpgrades.json`.
- Each material card links to `HTML/Infusions.html?material=<name>`, which picks that material's filter.
- `Data/Builder.js`: a concept link written as `{<hp></hp>}` shows the concept's own name ("Hit Point"), on every page.

### World Map pages

`HTML/Spawners.html` (Infestations), `HTML/Landmarks.html`, `HTML/CosmicHappenings.html` and `HTML/ProvinceImprovements.html` are Evolved's own pages, replacing upstream's (same URLs and menu links, `?type=<tab>`). They share `Data/worldmap.js` and `Style/worldmap.css`: tabs and large cards, as on Ancient Wonders.

- `worldmap.py` in aow4_diff_tools generates `Data/GEN/Infestations.json`, `Landmarks.json` and `Happenings.json` from the live game plus the mod. Pictures aren't in the icon libraries it can read: it finds the site's own through upstream's `WorldStructures.json` and `CosmicHappenings.json`, by text id or name, and keeps icons it can read.
- Infestations: a tab per tier, with defenders (a Mistwalker Camp's per season), size, growth and reward. A story realm's, tome's or happening's copy under the same name is left out.
- Landmarks: all or a DLC's. The units a landmark unlocks are those its threshold property allows; the Leviathan parts have no picture on the site.
- Cosmic Happenings: Minor, Major, Intrigue (with their opening event) and Special (Visions of Ruin, Blood Moon, Warped Seasons). Story realm happenings are left out.
- Province Improvements: a tab per kind, grouped by where they come from; the search and resource buttons work across the tabs, whose counts follow. The texts stay the dump's. The victory monuments and Magic Victory structures aren't listed, as on upstream's page.

### Spells pages

`HTML/StrategicSpells.html`, `HTML/CombatSpells.html` (Tactical Spells), `HTML/TransformationSpells.html`, `HTML/EnchantmentSpells.html` and `HTML/SiegeProjects.html` are Evolved's own pages, replacing upstream's (same URLs, `?type=<tab>`). They share `Data/spellbook.js` and `Style/spellbook.css`, on top of `Data/worldmap.js` and `Style/worldmap.css`.

- `spells.py` in aow4_diff_tools generates `Data/GEN/SpellBook.json`: costs, upkeep, kinds and where a spell comes from from the live game plus the mod, the texts from the dump (the game fills in its own values there). The dump's texts have a few repairs: a value it lost ("a -hex radius"), a number run into an icon ("+1Range"), one form for any count ("3 Turn").
- A tab per kind; a Damage/Debuff Spell is on both tabs, a dual tome's enchantment on both affinities'. Search and the affinity buttons work across the tabs, whose counts follow; sorted by tier, the cards are grouped by tome tier. A list of more than six units folds away.
- A spell's source is where its unlock property is given: a tome, a hero skill, an artifact, an adventure, a happening, a building...
- Spells sharing an id with different texts each have their card (`Ancestral Harmony` for each animal); the old pages showed the first's text on every copy.
- What no one can get is left out (`left_out` in the file, with the reason): the property that unlocks it is given by nothing, such as the Empire Tree's Rites, Elemental Bane and Raise Zombies. A story realm's spells are left out too, as are those the data can't tell are unused (`NOT_SPELLS` in `spells.py`, from the maintainer): Construct Population and Signet of Loyalty (not in use), Move Portal (a button that moves a Shrouded Isles portal), Bone Horror Ritual (an old mod spell) and Astral Wisp Ritual (replaced by Astral Keeper Ritual). The Fey Invasion's relic spells and siege projects, which the dump lacks, are in, their texts filled by the tool.
- Upkeep comes from the spell's cost data, so Corrupt Pact, Tyrannical Exploitation and Faithful Whispers show theirs, which the dump leaves out.

### Search

Spells, siege projects and the world map's sites come from the files their own pages read (`SpellBook.json`, `AncientWonders.json`, `Landmarks.json`, `Infestations.json`, `MagicMaterials.json`, `Happenings.json`) and show those pages' cards: `Data/ancientwonders.js` and `Data/magicmaterials.js` hold their pages' code as modules for this, and `Data/worldmap.js` the Infestation, Landmark and Happening cards. Cosmic Happenings has its own filter. Artifacts are searched by the game's names and texts and the spells they unlock.

### Tomes

- A tome's page shows all it unlocks in the Spells pages' cards (`SbTomeCards` in `Data/spellbook.js`, also for units, structures and empire bonuses): which of a spell's versions is by the game's own link to the tome, so Storm Crow's Ancestral Harmony speaks of Storm Crow, and spells the dump's tome has no link for (Call young Dragon, Conjure Elemental) are there too. `Spells.html?spell=`, `?siege=` and `?tome=` draw the same cards; a spell's id shows all its versions. The old `showSpell` card stays only for what is left out and in a few tooltips (Faction Creator, the Artifacts page's spells).
- The dump lists an Architect's Monuments II, III and IV six times each, a version per Affinity. A tome's Initial Bonus lists each once. II's six are the same; III's and IV's differ in their Protection and Affinity, which `StructureVersions` shows as a "By Affinity" list in the one text, wherever a structure's text is drawn.
- `HTML/GeneralCultureTomes.html` (the menu's Culture) picks as the City Tree does: a row of culture emblems, then the subcultures, with General Research as an emblem of its own. Its address is `#culture=<key>&sub=<tome>`, as the City Tree's; an old `?type=<tome>` still opens that tome.

### Units

A unit's origins read the new data: `CheckIfInSpells` and `CheckIfInSiege` the spell book, so a spell no one can get is no origin and the Fey Invasion's are; `CheckIfInAncientWonder` the book's `sites`, made from `AncientWonders.json` and `Landmarks.json`, whose links go to those pages. Upstream's list was wrong on some (Haunted Battlefield's skeletons).

### Old lists

`Data/GEN/WorldStructures.json`, `CosmicHappenings.json` and `CombatEnchantments.json` aren't loaded by the site any more, and `showWorldStructure`, `showCosmicHappening` and the like are gone. Keep the first two: `worldmap.py` finds the pictures through them. `Data/GEN/Relics.json` is now written by `spells.py`, with the game's names and spells, keeping upstream's ids and pictures. An old `Spells.html?wonder=` link goes to the wonder's page.

On a phone a sidebar page has no column for its sidebar: it comes above the cards, and a card wider than the page (a unit's) scrolls by itself.

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
A value the game only knows in play, or whose tag no resource holds, stays a placeholder, `<eventColor>{key}</eventColor>`. A value several versions of an effect share a tag for, with nothing to tell which the text means, shows all of them ("+2/4 Fire Damage"). Never take `all.json` from upstream: it has vanilla numbers, older texts and broken bullets.
`Data/EN/concept_tooltips.json`, the concept tooltips, is written by the same tool: every concept the game's tooltip libraries name (Title, icon, Hyperlink wording, Description), 228 more than upstream's copy had (On Fire, Province, Hero), and the properties, structures and the like texts link to, 346 of them with their icon (`image`, exported to `Icons/UnitIcons`).
Both follow the game's grammar more closely than the game's own texts do: a word the game counts agrees with the number before it ("for 1 Turn", "3 Turns").
`Data/GEN/all_spawnsets_strategic.json`, the world map's unit pools that events link to, is written by `spawnsets.py` too (659 pools; upstream's had 416, some under garbled names).
`Data/GEN/LinkedAbilities.json` (`abilities.py`): the abilities texts link to that the dump leaves out (see above).
`Data/GEN/RealmTraits.json` and `Icons/RealmTraits/` (`realmtraits.py`) feed `HTML/RealmTraits.html`, in the World Map menu, a tab per category (`?type=Geography`): upstream's page was never linked and picked texts by id.
The rest of `Data/GEN/*.json` comes from upstream, apart from the files Evolved generates (below).

DUMPALL also writes the icon folders `AmbitionIcons`, `EmpireProgressionIcons`, `GovernanceIcons`, `SiegeProjectIcons`, `SpellIcons`, `TomeIcons`, `TraitIcons`, `UnitIcons` and `UpgradeIcons`.
The other folders under `Icons/` are made by hand. An icon they lack can be taken from the game's content libraries with `clbicons.py` in aow4_diff_tools (`find` a name, then `export … --crop`, which gives the hand-made icons' size); combat enchantments are named after the enchantment (`umbral_ramblings.png`).

When syncing, any data conflict is resolved in favour of the local dump. Non-conflicting upstream data changes are accepted; the next game dump corrects them if the mod overrides them.

After copying a new dump into `Data/EN`, double-click `update_site.bat` in aow4_diff_tools. It runs `abilities.py` (`Data/GEN/LinkedAbilities.json`), `alltexts.py` (`Data/EN/all.json`, `concept_tooltips.json`), `spawnsets.py` (`Data/GEN/all_spawnsets.json`, `all_spawnsets_strategic.json`), `tmlicons.py` (`Icons/TML`, `Style/tmlicons.css`), `realmtraits.py`, `citytree.py` (`Data/GEN/CityTreeLinks.json`, `StructurePredictions.json`) and `magicmaterials.py` (`Data/GEN/MagicMaterials.json`), in that order: `alltexts.py` leaves the abilities `abilities.py` writes out of the concept tooltips.
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
   `HTML/CityTrees.html`, `HTML/MagicMaterials.html`, `HTML/AncientWonders.html`, `HTML/Spawners.html`, `HTML/Landmarks.html`, `HTML/CosmicHappenings.html` and `HTML/ProvinceImprovements.html`, `HTML/StrategicSpells.html`, `HTML/CombatSpells.html`, `HTML/TransformationSpells.html`, `HTML/EnchantmentSpells.html` and `HTML/SiegeProjects.html`, `HTML/GeneralCultureTomes.html` are the files to keep whole: discard upstream's changes to them (`git checkout --ours` on each).
   Keep `HTML/CityTest.html`, `HTML/CityTreesNew.html` and `Data/GEN/CityTree.json` deleted, and don't let `CityTree.json` back into `dataloader.js`.
