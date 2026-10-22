# Evolved vs. upstream

This site is a fork of [MinionsArt/aow4db](https://github.com/MinionsArt/aow4db), adapted for the Evolved mod.
The two repositories share no git history, so syncing is done by hand (see [Syncing](#syncing-with-upstream)).

Last synced upstream commit: `6db93706` (2026-10-20)

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
- `HTML/CityTrees.html`: the Trade Route tree is always shown instead of only with the beta checkbox.

## Game data

`Data/EN/*.json` and `Data/GEN/*.json` are produced by Evolved's own game dumps, with mod balance values and mod-only content.
Examples: Specialized Troops is −40% instead of −25%, and `EN/Spells.json` has spells upstream lacks, such as Astral Keeper Ritual, Summon Frost Giant, Bone Horror Ritual and Bone Dragon Ritual.

When syncing, any data conflict is resolved in favour of the local dump. Non-conflicting upstream data changes are accepted; the next game dump corrects them if the mod overrides them.

## Syncing with upstream

1. Fetch upstream: `git fetch https://github.com/MinionsArt/aow4db.git main:refs/remotes/upstream/main`
2. In a temporary worktree, check out the last synced upstream commit, apply the [renames](#renames), and commit (the base).
3. Replace the worktree's contents with `upstream/main`, apply the renames again, and commit on top of the base.
4. On `main`, `git cherry-pick --no-commit <that commit>`. Git merges it three-way against the renamed base, so the customizations above survive.
5. Resolve each conflict hunk, not whole files: `git checkout --ours <file>` throws away upstream's other changes in that file too.
   For data, take the local side of the conflicting hunks; for code, merge by hand.
   Then check that no `aow4db` references remain, commit to `main`, and update the "Last synced" commit above.
   Upstream changes to the deleted language folders arrive as "deleted by us" conflicts: keep them deleted (`git rm -r -q Data/DE Data/ES Data/FR Data/JA Data/KO Data/PL Data/RU Data/ZH`).
   A brand-new upstream language folder would arrive without a conflict, so check `Data/` for one.
