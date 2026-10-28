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
  Every menu item has one of the game's round HUD medallions. Units has the Culture Units helmet (upstream: the Tome
  Units star). Abilities and World Map (upstream: the ability diamond and the Structures hammer) have Evolved's own
  `AbilitiesIcon.png` and `WorldMapIcon.png` in `Icons/Interface/Header/`: the game's tactical-cast star and province
  pin (`Icons/TML/`) in the medallions' beige, on a blank medallion made from the others. Spells, Empire and
  Builds/Planners (upstream: `SpellsIcon.png`, the grey `EmpireIcon.png` and the info "i") have the world-map HUD's own
  Spells, Empire and Item Forge buttons, `SpellsHudIcon.png`, `EmpireHudIcon.png` and `ForgeHudIcon.png`: each its
  frame, gem and picture from the game's TopBar atlas (`INTERFACEASSETS` atlas 13, read with aow4_diff_tools'
  `tmlicons.atlases`), the picture enlarged 25% so the glyph is as big as the other medallions'.
  The "Updated:" date is 14px (11px on a phone), a size under the dataset's name.
No Other Database dropdown: Evolved keeps no other databases. On a phone the strip holds just the dataset and date,
and Settings and Donate are at the foot of the ☰ menu, a drawer on the cards' panel.

`Style/style.css`: on desktop (wider than 800px) the menu bar wraps onto a second line when the window is too narrow
for it (a second stone bar), and the header grows to fit, instead of the menu forcing a page-wide scrollbar. Its items are centred.
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

- `HTML/header.html`: upstream's "Switch To … Beta Dataset" checkbox is replaced by a plain notice under the title ("Manta Beta Dataset"). Update the beta name in it when the game's beta changes.
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

`HTML/MagicMaterials.html` is Evolved's own page, replacing upstream's (same URL and menu link):

- Sets, their bonuses and requirements, and each material's texts, local income and combat enchantment come from `Data/GEN/MagicMaterials.json`, which `magicmaterials.py` in aow4_diff_tools generates from the live game plus the mod.
  Pictures and the infusion count come from `Data/GEN/WorldStructures.json` and `Data/EN/ItemForgeUpgrades.json`, by the material's key.
- Each material card links to `HTML/Infusions.html?material=<name>`, which picks that material's filter.
- `Data/Builder.js`: a concept link written as `{<hp></hp>}` shows the concept's own name ("Hit Point"), on every page.

## Game data

Most of `Data/EN/*.json` comes from Evolved's own game dumps (the game's DUMPALL, with the mod loaded), with mod balance values and mod-only content.
Examples: Specialized Troops is −40% instead of −25%, and `EN/Spells.json` has spells upstream lacks, such as Astral Keeper Ritual, Bone Horror Ritual and Bone Dragon Ritual.
`Data/EN/all.json`, the game's texts, is Evolved's own too: `alltexts.py` in aow4_diff_tools writes it from the live game's EN.MO with the mod's `.po`, filled in with the values of the resources that show each text (mod values included: Tranquility Pool −5%, Infrastructure −33%).
It started from upstream's copy and keeps its entries and order; texts the game added are appended, and texts it no longer has are kept, as pages may still look them up.
A value the game only knows in play stays a placeholder, `<eventColor>{key}</eventColor>`. Never take `all.json` from upstream: it has vanilla numbers, older texts and broken bullets.
`Data/EN/concept_tooltips.json`, the concept tooltips, is written by the same tool: every concept the game's tooltip libraries name (Title, icon, Hyperlink wording, Description), 228 more than upstream's copy had (On Fire, Province, Hero), and the properties, structures and the like texts link to, 346 of them with their icon (`image`, exported to `Icons/UnitIcons`).
Both follow the game's grammar more closely than the game's own texts do: a word the game counts agrees with the number before it ("for 1 Turn", "3 Turns").
`Data/GEN/all_spawnsets_strategic.json`, the world map's unit pools that events link to, is written by `spawnsets.py` too (659 pools; upstream's had 416, some under garbled names).
`Data/GEN/LinkedAbilities.json` (`abilities.py`): the abilities texts link to that the dump leaves out (see above).
`Data/GEN/RealmTraits.json` and `Icons/RealmTraits/` (`realmtraits.py`) feed `HTML/RealmTraits.html`, in the World Map menu: upstream's page was never linked and picked texts by id.
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
   `HTML/CityTrees.html` and `HTML/MagicMaterials.html` are the files to keep whole: discard upstream's changes to them (`git checkout --ours HTML/CityTrees.html HTML/MagicMaterials.html`).
   Keep `HTML/CityTest.html`, `HTML/CityTreesNew.html` and `Data/GEN/CityTree.json` deleted, and don't let `CityTree.json` back into `dataloader.js`.
