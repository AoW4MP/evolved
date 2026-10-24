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

Exception: `HTML/Donate.html` keeps the title `Age of Wonders 4 Database - Donate` and the heading "Support the AoW 4 Database".

## Code changes for the mod

`Data/Faction.js`: the faction creator's form trait budget is 10 points instead of 5.

| Line (approx.) | Upstream | Evolved |
| --- | --- | --- |
| 234 | `while (getPoints() < 5)` | `while (getPoints() < 10)` |
| 236 | `getPoints() + randomEntry.point_cost < 6` | `getPoints() + randomEntry.point_cost < 11` |
| 1172 | `origin.point_cost + getPoints() > 5` | `origin.point_cost + getPoints() > 10` |
| 3491 | `if (getPoints() > 5)` | `if (getPoints() > 10)` |

`HTML/header.html`: the "Updated:" date tracks Evolved's own game dumps, not upstream's.

`Style/style.css`: on desktop (wider than 800px) the menu bar wraps onto a second line when the window is too narrow
for it, and the header grows to fit, instead of the menu forcing a page-wide scrollbar. Its items are centred.
The page body (`.w3-container`: sidebar and content) is at most 1600px wide and centred, so on an ultrawide screen
the sidebar stays beside the content. The header's corners (Settings, the "Updated" date, Donate, Other Database)
stay within the same 1600px. Phones keep the ☰ menu.

### English only

Evolved is exported in English only, so the other languages are removed:

- `Data/DE`, `ES`, `FR`, `JA`, `KO`, `PL`, `RU` and `ZH` are deleted.
- `HTML/header.html`: the language dropdown (`<select id="languageSelect">`) is replaced by an empty 95px-wide `<div>`.
  The top bar spaces its items evenly, so without that placeholder the Donate button moves to the middle.
- `Data/Builder.js`: the `languageSelect` lookup is removed.
- `Data/src/settings.js`: `CheckBoxTooltips` and `SwitchToBeta` no longer save `language`.
- `Data/src/dataloader.js`: `CheckData` no longer saves a `language` default or calls `LocalizeUI()` for other languages.
  `GetAllData` and `LocalizeUI` themselves are unchanged: the landing page still uses `LocalizeUI` with the English text.

### Beta data only

Evolved is played on the game's beta, so the website's own dump in `Data/EN` is already beta data and there is no switch to upstream's `Data/BETA`:

- `HTML/header.html`: upstream's "Switch To … Beta Dataset" checkbox is replaced by a plain notice in the same yellow text. Update the beta name in it when the game's beta changes.
- `Data/Builder.js`: the `showBetaTooltip` lookup is removed.
- `Data/src/settings.js`: `showBeta` is no longer saved and `SwitchToBeta()` is removed.
- `Data/src/dataloader.js`: `CheckData` always calls `GetAllData("EN")`, even if a visitor's browser still has `showBeta` saved.
### City Tree

`HTML/CityTrees.html` is Evolved's own page, replacing upstream's (same URL and menu link):

- The links between buildings come from `Data/GEN/CityTreeLinks.json`, which `citytree.py` in aow4_diff_tools generates from the live game plus the mod.
  It holds only resids, keys and text ids; names, icons, costs and texts come from `Data/EN/StructureUpgrades.json`, `Tomes.json` and `all.json`.
- One culture and sub-culture at a time, with toggles for the Elder Vampire's castle and tome buildings.
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
The exceptions are `Data/EN/all.json`, `concept_tooltips.json` and `UI.json`, which come from upstream, as does `Data/GEN/*.json` apart from the files Evolved generates (below).
`all.json` holds the game's texts with the numbers of upstream's vanilla game at the time they made it: no mod values, and older than the live game after an update.
Upstream's conversion broke every bullet that starts with a hyperlink (`[bullet/][hyperlink,…]` became `<bullet></bullet> text`, its closing tag misplaced).
Evolved repaired these in `Data/EN/` and `Data/BETA/concept_tooltips.json` (Gold, Production, Mana, the pacts and others), so a `concept_tooltips.json` taken from upstream brings the broken bullets back; `all.json` still has them.

DUMPALL also writes the icon folders `AmbitionIcons`, `EmpireProgressionIcons`, `GovernanceIcons`, `SiegeProjectIcons`, `SpellIcons`, `TomeIcons`, `TraitIcons`, `UnitIcons` and `UpgradeIcons`.
The other folders under `Icons/` are made by hand. An icon they lack can be taken from the game's content libraries with `clbicons.py` in aow4_diff_tools (`find` a name, then `export … --crop`, which gives the hand-made icons' size); combat enchantments are named after the enchantment (`umbral_ramblings.png`).

When syncing, any data conflict is resolved in favour of the local dump. Non-conflicting upstream data changes are accepted; the next game dump corrects them if the mod overrides them.

After copying a new dump into `Data/EN`, run `python citytree.py` and `python magicmaterials.py` in aow4_diff_tools to regenerate `Data/GEN/CityTreeLinks.json` and `Data/GEN/MagicMaterials.json`.
A page that shows numbers from `all.json` can be out of date or miss the mod (Focus Crystals +10% where the game now says +20%, Tranquility Pool −10% where the mod says −5%); `magicmaterials.py` reads its texts from the live game and the mod instead.

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
