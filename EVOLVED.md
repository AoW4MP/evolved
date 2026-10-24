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

Evolved is played on the game's beta, so the website's own dump in `Data/EN` is already beta data and there is no switch to upstream's `Data/BETA`, which is deleted:

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
`Data/EN/all.json`, the game's texts, is Evolved's own too: `alltexts.py` in aow4_diff_tools writes it from the live game's EN.MO with the mod's `.po`, filled in with the values of the resources that show each text (mod values included: Tranquility Pool −5%, Infrastructure −33%).
It started from upstream's copy and keeps its entries and order; texts the game added are appended, and texts it no longer has are kept, as pages may still look them up.
A value the game only knows in play stays a placeholder, `<eventColor>{key}</eventColor>`. Never take `all.json` from upstream: it has vanilla numbers, older texts and broken bullets.
`Data/EN/concept_tooltips.json`, the concept tooltips, is written by the same tool: every concept the game's tooltip libraries name (Title, icon, Hyperlink wording, Description), 228 more than upstream's copy had (On Fire, Province, Hero).
`UI.json` still comes from upstream, as does `Data/GEN/*.json` apart from the files Evolved generates (below).

DUMPALL also writes the icon folders `AmbitionIcons`, `EmpireProgressionIcons`, `GovernanceIcons`, `SiegeProjectIcons`, `SpellIcons`, `TomeIcons`, `TraitIcons`, `UnitIcons` and `UpgradeIcons`.
The other folders under `Icons/` are made by hand. An icon they lack can be taken from the game's content libraries with `clbicons.py` in aow4_diff_tools (`find` a name, then `export … --crop`, which gives the hand-made icons' size); combat enchantments are named after the enchantment (`umbral_ramblings.png`).

When syncing, any data conflict is resolved in favour of the local dump. Non-conflicting upstream data changes are accepted; the next game dump corrects them if the mod overrides them.

After copying a new dump into `Data/EN`, double-click `update_site.bat` in aow4_diff_tools. It runs `alltexts.py` (`Data/EN/all.json`), `spawnsets.py` (`Data/GEN/all_spawnsets.json`), `citytree.py` (`Data/GEN/CityTreeLinks.json`, `StructurePredictions.json`) and `magicmaterials.py` (`Data/GEN/MagicMaterials.json`), in that order, as `magicmaterials.py` words its links the way `all.json` does.
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
