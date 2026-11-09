

function findBy(array, key, value, options) {
    // fast path: try the lookup map first
    if (!options?.all) {
        const map = buildLookupMap(array, key);
        if (map) {
            return map.get(value);
        }
    }
    // slow path: fallback for untracked arrays or {all:true} queries
    if (options?.all) {
        return array.filter(entry => entry[key] === value);
    }
    return array.find(entry => entry[key] === value);
}

function findByFuzzy(array, key, value, { all = false } = {}) {
  return all
    ? array.filter(item => item[key].includes(value))  // all matches
    : array.find(item => item[key].includes(value));   // first match
}

function maybeHighlight(text) {
  return getUserSettings().isolateNumber ? highlightNumbersInDiv(text) : text;
}

function tagReplace(text, keyword, tagHTML) {
  const pattern = new RegExp(`\\b${keyword}\\b`, "g");
  return text.replace(pattern, tagHTML);
}

function Unblur(element, clickerelement, event){
    
    element.classList.remove("blurred");
    clickerelement.setAttribute("style", "display:none");
}

/**
 * Find an object in an array where any nested array matches a condition.
 *
 * @param {Array} array - top-level array to search (e.g., jsonTomesLocalized)
 * @param {string} nestedKey - the property that holds the nested array (e.g., "skills")
 * @param {string} matchKey - property to check inside the nested array (e.g., "spell_slug")
 * @param {any} matchValue - value to match against
 * @returns {Object|null} - the found parent object or null
 */
function findParentByNested(array, nestedKey, matchKey, matchValue) {
  for (const parent of array) {
    if (!Array.isArray(parent[nestedKey])) continue;
    if (parent[nestedKey].some(child => child[matchKey] === matchValue)) {
      return parent;
    }
  }
  return null;
}

let ascendingOrder = false;

function sortDivs(sortType, savedOrder) {
    let i = "";

    // 2 - Detemine the selector
    if (savedOrder != null) {
        ascendingOrder = savedOrder;
    } else {
        ascendingOrder = !ascendingOrder;
    }

    let buttontargets = document.getElementsByClassName("sortingButton");

    for (i in buttontargets) {
        buttontargets[i].className = "sortingButton";
    }
    let currentbutton = document.getElementById(sortType + "-button");

    if (ascendingOrder) {
        currentbutton.className += " activeDown";
    } else {
        currentbutton.className += " activeUp";
    }

    // 3 - Choose the wanted order
    //  ascendingOrder = !ascendingOrder;
    const isNumeric = true;

    // 4 - Select all elements
    let container;
    if (currentView === "") {
        container = document.getElementById("dataHolder");
    } else {
        container = document.getElementById(currentView);
    }

    let element = [...container.querySelectorAll(".mod_card")];

    let selector = (element) => element.querySelector(".mod_name").innerHTML;
    if (sortType === "tier") {
        selector = (element) => element.querySelector(".spell_tier").innerHTML;
    } else if (sortType === "cost") {
        selector = (element) => element.querySelector(".spell_cost").innerHTML;
    }

    // 5 - Find their parent
    const parentElement = container;

    // 6 - Sort the elements
    const collator = new Intl.Collator(undefined, {
        numeric: isNumeric,
        sensitivity: "base"
    });

    element
        .sort((elementA, elementB) => {
            const [firstElement, secondElement] = ascendingOrder ? [elementA, elementB] : [elementB, elementA];

            let textOfFirstElement = selector(firstElement);

            let textOfSecondElement = selector(secondElement);

            if (sortType === "tier") {
                let fields = textOfFirstElement.split("Tier ");

                textOfFirstElement = deromanize(fields[1]);
                let fields2 = textOfSecondElement.split("Tier ");
                textOfSecondElement = deromanize(fields2[1]);
                //console.log("first: " + fields2[1]);
            }

            return collator.compare(textOfFirstElement, textOfSecondElement);
        })
        .forEach((element) => parentElement.appendChild(element));

    let currenturl = window.location.href.split("&")[0];

    window.history.replaceState({}, "foo", currenturl + "&sort=" + sortType + ":" + ascendingOrder);
    sorting = sortType + ":" + ascendingOrder;
}

async function SetCollapsibleStuff() {
    let coll = document.getElementsByClassName("collapsibleUnits");

    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            let contents = document.getElementsByClassName("contentUnits");
            let content = this.nextElementSibling;

            for (j = 0; j < contents.length; j++) {
                if (contents[j].style != null) {
                    if (contents[j].style.display === "grid") {
                        if (contents[j].id === content.id) {
                        } else {
                            coll[j].classList.toggle("active");
                            contents[j].style.display = "none";
                        }
                    }
                }
            }
            this.classList.toggle("active");

            if (content.style.display === "grid") {
                content.style.display = "none";
            } else {
                content.style.display = "grid";
            }
        });
    }
}


function expandTags(input) {
    // Regular expression to match patterns like "2<empirearcana></empirearcana>"
    const tagPattern = /(\d+)(<.*?>.*?<\/.*?>)/g;

    // Function to replace each match with the expanded form
    const expanded = input.replace(tagPattern, (match, count, tag) => {
        // Repeat the tag the specified number of times
        return tag.repeat(Number(count));
    });

    return expanded;
}


function HideAll(cardClassName) {
    let divs = document.getElementsByClassName(cardClassName);

    for (let i = 0; i < divs.length; i++) {
        let div = divs[i];
        div.style.display = "none";
    }
    return divs;
}

function transformString(inputString) {
    // Remove the word "Property"
    let transformedString = inputString.replace("Property", "");
    transformedString = transformedString.replace("/", ",");
    // Replace the specified words with the corresponding tags
    const replacements = {
        Astral: "<empirearcana></empirearcana>",
        Chaos: "<empirechaos></empirechaos>",
        Order: "<empireorder></empireorder>",
        Shadow: "<empireshadow></empireshadow>",
        Materium: "<empirematter></empirematter>",
        Elementum: "<empirematter></empirematter>",
        Nature: "<empirenature></empirenature>"
    };

    // Use a regular expression to replace all occurrences of the keys with the corresponding values
    for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${key}\\b`, "g");
        transformedString = transformedString.replace(regex, value);
    }

    // Remove any extra spaces (especially around the removed "Property" word)
    transformedString = transformedString.trim();

    return transformedString;
}

function ShowAllDivsWithFilters(cardClassName, displaystyle = "table") {
    let listOfDivs = HideAll(cardClassName);
    //   var list = new Array();
    let filter = document.getElementById("filterInput");

    let filterText = filter.value.toUpperCase();

    for (let j = 0; j < listOfDivs.length; j++) {
        if (listOfDivs[j].innerText.toUpperCase().indexOf(filterText) != -1) {
            listOfDivs[j].style.display = displaystyle;
        }
    }
}

async function SetLevelUpStuff() {
    let coll = document.getElementsByClassName("collapsibleLevelup");
    let content = document.getElementsByClassName("contentLevelup");

    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            //this.classList.toggle("active");

            let content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    }

   searchParams = new URLSearchParams(window.location.search);
    const product = searchParams.get("type");

    if (product != undefined) {
        let splits = product.split("&");
        closeTabLinks(product);
        // grab the subculture if available

        let subCulture = splits[0].split(/(?=[A-Z])/);
        if (subCulture.length > 1) {
            let test = subCulture.slice(1).join("");
            await showSubDiv(null, test);
        }
        // open div with type (lit after the subculture, whose ☰ unlights the rest)
        await openDiv(event, splits[0]);
        document.getElementById(splits[0] + "-button").className += " w3-red";
    } else if (document.querySelector(".subDiv") != null) {
        // no unit asked for: the first subculture's first unit
        showSubDiv(null, document.querySelector(".subDiv").id);
    } else if (document.querySelector(".tablink[data-tier]") != null) {
        // nothing asked for on a Units or Tomes page: its first entry
        OpenFirstEntry(document);
    } else {
        // no unit asked for: the full list is showing, so its ☰ is the one lit
        document.querySelector(".listViewButton")?.classList.add("w3-red");
    }
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}



function romanize(num) {
    if (isNaN(num)) return NaN;
    let digits = String(+num).split(""),
        key = [
            "",
            "C",
            "CC",
            "CCC",
            "CD",
            "D",
            "DC",
            "DCC",
            "DCCC",
            "CM",
            "",
            "X",
            "XX",
            "XXX",
            "XL",
            "L",
            "LX",
            "LXX",
            "LXXX",
            "XC",
            "",
            "I",
            "II",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX"
        ],
        roman = "",
        i = 3;
    while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

function deromanize(str) {
    str = str.toUpperCase();
    let validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/;
    let token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g;
    let key = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1
    };
    let num = -1;
    let m;

    if (!(str && validator.test(str))) return false;

    while ((m = token.exec(str)) !== null) {
        num += key[m[0]];
    }

    return num;
}

function doubleNumbers(inputString) {
    // Regular expression to match numbers
    let regex = /\b\d+\b/g;

    // Replace each matched number with its double
    let result = inputString.replace(regex, function (match) {
        // Convert the matched number to an integer and double it
        let doubledNumber = parseInt(match) * 2;
        // Return the doubled number as a string
        return doubledNumber.toString();
    });

    return result;
}


// A unit set by its units' names, as all_spawnsets.json gives them (aow4_diff_tools/spawnsets.py): "Ice Spider
// Matriarch", not ICE_SPIDER_MATRIARCH; a set the file names no units for keeps its own name, spaced
let spawnSetNames = null;
function SpawnSetName(set) {
    if (!spawnSetNames) {
        spawnSetNames = {};
        for (const t of jsonSpawnTables || []) (t.items || []).forEach((item, i) => t.names?.[i] && (spawnSetNames[item] = t.names[i]));
    }
    return spawnSetNames[set] || set.replace(/_/g, " ");
}

// a list of a spell's random summons, under its heading (a land or tier: SpellSpawnChances), none for a spell's only list.
// Each unit's chance of being summoned: its share of the list, whose repeats make a unit likelier. A recruit (offer: from
// SpellBook.json's offers) lets the player choose from a few of the list, so the chance is of being among them: drawn one
// by one, a unit not twice, each by its share times its pick weight (Call Wild Animal's Tier II animals are offered less);
// a list no longer than the offer is offered whole, as the game does (Call Greater Animal on water: its Kraken and Storm
// Rune Crab, once each)
function ConvertSpawnTable(input, heading, offer) {
    const tickets = new Map();
    for (const set of input.items) tickets.set(set, (tickets.get(set) || 0) + 1);
    const total = input.items.length;
    const chance = offer ? OfferedChances(new Map([...tickets].map(([set, n]) => [set, n * (offer.weights?.[set] ?? 100)])), offer.options) : null;
    const rows = [...tickets].map(([set, n]) => ({ name: SpawnSetName(set), p: chance ? chance.get(set) : n / total }));
    rows.sort((a, b) => b.p - a.p);

    const bulletList = document.createElement("DIV");
    let html = "<bulletList>" + (heading ? '<span class="Test">' + heading + "</span>" : "");
    const shown = new Set();
    for (const { name, p } of rows) {
        if (shown.has(name)) continue;
        shown.add(name);
        // not 100% unless it's sure, nor 0% when it can be
        const pct = Math.round(p * 100);
        html += "<bullet>" + (p < 1 && pct === 100 ? 99 : p > 0 && pct === 0 ? "<1" : pct) + "% - " + name + "</bullet>";
    }
    bulletList.innerHTML = html + "</bulletList>";
    return bulletList;
}

// {set: chance it is among n drawn one by one without repeats, each draw by the weights of those left}
function OfferedChances(weights, n) {
    const chance = new Map([...weights.keys()].map((set) => [set, weights.size <= n ? 1 : 0]));
    if (weights.size <= n) return chance;
    const draw = (left, sum, p, k) => {
        for (const set of left) {
            const q = (p * weights.get(set)) / sum;
            chance.set(set, chance.get(set) + q);
            if (k > 1) draw(left.filter((x) => x !== set), sum - weights.get(set), q, k - 1);
        }
    };
    draw([...weights.keys()], [...weights.values()].reduce((a, b) => a + b, 0), 1, n);
    return chance;
}

  function CreateParts(subcultures, icons, names) {
                const presetPoint = document.getElementById("presetPoint");

                // Create the main holder div for buttons
                const holder = document.createElement("div");
                holder.className = "subcultureHolder";

                // Generate the subculture buttons
                subcultures.forEach((sub) => {
                    const button = document.createElement("button");
                    button.className = "subscultureButton";
                    button.setAttribute("onclick", `showSubDiv(event,'${sub}')`);

                    const img = document.createElement("img");
                    img.src = `/evolved/Icons/FactionCreation/${sub.toLowerCase().replaceAll(" ","_")}.png`;
                    img.width = 50;

                    const span = document.createElement("span");
                    span.className = "subCultureName";
                    span.id = `subCultureName${sub}`;
                    span.textContent = `${names}${sub}`;

                    button.appendChild(img);
                    button.appendChild(span);
                    holder.appendChild(button);
                });

                // under the page title, above the cards
                presetPoint.querySelector(".textblocktitle").after(holder);

                // Generate subDiv sections
                subcultures.forEach((sub, i) => {
                    const div = document.createElement("div");
                    div.className = "subDiv";
                    div.id = sub;

                    div.innerHTML = `
    <div class="w3-container">
      <div id="buttonHolder${i}" class="w3-bar w3-black"></div>
      <div id="dataHolder${i}" class="dataholder"></div>
    </div>
  `;

                    presetPoint.append(div);
                });
            }


function addSpoiler(text) {
    const span = document.createElement("span");
    span.className = "spoiler";
    span.innerHTML = text;
    span.addEventListener("click", () => span.classList.toggle("revealed"));
    return span;
}
