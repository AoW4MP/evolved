

// ---- stacked tooltips (Selectable Tooltips on) --------------------------------------------------------------------
// As in the game: a link inside a tooltip opens a new tooltip on top, the one under it stays, and so on. A tooltip
// closes once the mouse is on neither it, a tooltip above it, nor the link that opened it.
const TOOLTIP_STACK = [];

function tooltipLevel(el) {
    const dialog = el.closest && el.closest("dialog.tooltiptextnew");
    if (!dialog) return -1;
    return dialog.dataset.level !== undefined ? Number(dialog.dataset.level) : 0;
}

function OpenStackedTooltip(origin, span, event) {
    const level = tooltipLevel(origin) + 1;
    while (TOOLTIP_STACK.length > level - 1) TOOLTIP_STACK.pop().remove();
    const dialog = document.createElement("dialog");
    dialog.className = "tooltiptextnew";
    dialog.dataset.level = level;
    dialog.origin = origin;
    dialog.innerHTML = span.innerHTML;
    dialog.style.pointerEvents = "all";
    dialog.style.zIndex = 1000 + level;
    (TOOLTIP_STACK[TOOLTIP_STACK.length - 1] || document.getElementById("hoverDiv2")).after(dialog);
    dialog.inert = true;
    dialog.show();
    dialog.inert = false;
    WireTooltipLinks(dialog, origin);
    dialog.addEventListener("mouseleave", () => setTimeout(SettleTooltips, 150));
    TOOLTIP_STACK.push(dialog);
    PlaceBelow(dialog, origin);
}

// close what the mouse has left: a stacked tooltip is held by itself, a tooltip above it or the link under the mouse
function SettleTooltips() {
    const over = (el) => el && el.isConnected && el.matches(":hover");
    for (let i = TOOLTIP_STACK.length - 1; i >= 0; i--) {
        const d = TOOLTIP_STACK[i];
        if (over(d) || over(d.origin) || i < TOOLTIP_STACK.length - 1) break;
        TOOLTIP_STACK.pop().remove();
    }
    // the two base tooltips stay while one of theirs is stacked on them
    for (const id of ["hoverDiv", "hoverDiv2"]) {
        const base = document.getElementById(id);
        const held = over(base) || over(base.origin) || TOOLTIP_STACK.some((d) => base.contains(d.origin));
        if (base.open && !held) base.close();
    }
    if (!TOOLTIP_STACK.length) return;
    if (!document.getElementById("hoverDiv").open && !document.getElementById("hoverDiv2").open && !TOOLTIP_STACK.some(over))
        while (TOOLTIP_STACK.length) TOOLTIP_STACK.pop().remove();
}

// the links in a tooltip, wired to open their own; a status effect's tooltip is built as one big link to itself,
// which the box is not, and a tooltip does not link to itself ("Burning counters Wet" in Burning's)
function WireTooltipLinks(dialog, origin) {
    for (const outer of dialog.querySelectorAll(":scope > .statusEffectHandler")) outer.classList.remove("statusEffectHandler");
    const own = origin ? origin.textContent.trim().toLowerCase() : null;
    if (own) {
        for (const el of dialog.querySelectorAll(".statusEffectHandler")) {
            if (el.textContent.trim().toLowerCase() !== own) continue;
            el.classList.remove("statusEffectHandler");
            if (el.parentElement?.style.textDecoration.includes("underline")) el.parentElement.style.textDecoration = "none";
        }
        for (const el of dialog.querySelectorAll(".conceptTooltipHandler"))
            if ((el.previousElementSibling?.textContent || "").trim().toLowerCase() === own) el.remove();
    }
    HandleExtraTooltips(dialog);
}

function addTooltipListeners(tooltip, span, secondary) {
    let hoverDiv2 = document.getElementById("hoverDiv2");
    let hoverDiv = document.getElementById("hoverDiv");

    // a link inside a tooltip, with Selectable Tooltips on: a new tooltip on top of it
    tooltip.addEventListener("mouseenter", function (event) {
        if (span && typeof checkboxTooltip !== "undefined" && checkboxTooltip.checked && tooltipLevel(tooltip) >= 0) {
            event.stopImmediatePropagation();
            OpenStackedTooltip(tooltip, span, event);
        }
    });

    if (secondary != undefined) {
        tooltip.addEventListener("mouseenter", function (event) {
            if (event.cancelBubble) return; // opened on top instead
            if (tooltip != hoverDiv2) hoverDiv2.origin = tooltip;
            TurnOnTooltip(span, secondary);
            //  FillToolTip(span, secondary);

            hoverDiv2.style.visibility = "hidden"; // make it invisible
            hoverDiv2.inert = true;
            hoverDiv2.show();
            hoverDiv2.inert = false;
            if (tooltip != hoverDiv2) {
                 try { updateHoverDivPosition(event, secondary); } catch(e) {}
                //updateHoverDivPosition(event, secondary);
            }
            hoverDiv2.close(); // close and reset visiblity
            hoverDiv2.style.visibility = "";
            hoverDiv2.inert = true;
            hoverDiv2.show();
            hoverDiv2.inert = false;
        });

        tooltip.addEventListener("mouseleave", function () {
            // if (altHeld == false) {
            // Only hide if ALT is NOT active
            TurnOffTooltip(secondary, tooltip);
            //}
        });
    } else {
        tooltip.addEventListener("mouseenter", function (event) {
            if (event.cancelBubble) return; // opened on top instead
            if (tooltip != hoverDiv) hoverDiv.origin = tooltip;
            TurnOnTooltip(span, secondary);
            // hoverDiv.show();
            hoverDiv.style.visibility = "hidden";
            hoverDiv.inert = true;
            hoverDiv.show();
            hoverDiv.inert = false;
            if (tooltip != hoverDiv) {
                    try { updateHoverDivPosition(event, secondary); } catch(e) {}
              //  updateHoverDivPosition(event, secondary);
            }
            hoverDiv.close();
            hoverDiv.style.visibility = "";
            hoverDiv.inert = true;
            hoverDiv.show();
            hoverDiv.inert = false;
        });

        tooltip.addEventListener("mouseleave", function () {
            //  if (altHeld == false) {
            TurnOffTooltip(secondary);
            //  }
        });
    }
}

function removeToolTipListeners(tooltip) {
    tooltip.removeEventListener("mouseenter", tooltip);

    tooltip.removeEventListener("mouseleave", tooltip);
}

function TurnOnTooltip(spa, secondary) {
    // Configuration of the observer: observe changes to child nodes
    let hoverDiv2 = document.getElementById("hoverDiv2");
    let hoverDiv = document.getElementById("hoverDiv");
    if (secondary != undefined) {
        if (spa != null) {
            hoverDiv2.innerHTML = spa.innerHTML;
            if (checkboxTooltip.checked) WireTooltipLinks(hoverDiv2, hoverDiv2.origin);
        }
    } else {
        if (spa != null) {
            hoverDiv.innerHTML = spa.innerHTML;
            WireTooltipLinks(hoverDiv);
        }
    }
}


function TurnOffTooltip(secondary, origin) {
    let hoverDiv2 = document.getElementById("hoverDiv2");
    let hoverDiv = document.getElementById("hoverDiv");

    if (checkboxTooltip.checked) {
        setTimeout(SettleTooltips, 150);
        return;
    }

    if (secondary != undefined) {
        if (checkboxTooltip.checked) {
            if (origin == hoverDiv2 && hoverDiv2.open) hoverDiv2.close();
        } else {
            if (hoverDiv2.open) hoverDiv2.close();
        }
    } else {
        // Close hoverDiv on its own terms — don't let hoverDiv2's state block this indefinitely.
        if (hoverDiv.open) hoverDiv.close();
    }
}
/*function TurnOffTooltip(secondary, origin) {
    hoverDiv2 = document.getElementById("hoverDiv2");
    hoverDiv = document.getElementById("hoverDiv");
    
    // console.log("dialog 2 is open? " + hoverDiv2.open);
    if (secondary != undefined) {
        if (checkboxTooltip.checked) {
            if (origin == hoverDiv2) {
                 hoverDiv2.innerHTML = "";
                hoverDiv2.close();
            }
        } else {
              hoverDiv2.innerHTML = "";
            hoverDiv2.close();
        }

        // console.log("closed dialog 2");
    } else {
        if (hoverDiv2.open) {
            //   console.log("dialog is open ");
        } else {
              hoverDiv.innerHTML = "";
          
            hoverDiv.close();
            
            //  console.log("closed dialog 1");
        }
    }
}*/

function getNormalizedPosition(event) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // event.clientX and event.clientY give the position of the mouse
    const xPosition = event.clientX;
    const yPosition = event.clientY;

    // Normalize to a range of 0 to 1
    const normalizedX = xPosition / screenWidth;
    const normalizedY = yPosition / screenHeight;

    return {
        x: normalizedX,
        y: normalizedY
    };
}
function updateHoverDivPosition(event, secondary) {
    const settings = getUserSettings();
    const isTouch = window.matchMedia('(max-width: 800px), (hover: none)').matches;

    let hoverDiv = secondary != undefined
        ? document.getElementById("hoverDiv2")
        : document.getElementById("hoverDiv");

    if (settings.tooltipselectable) {
        hoverDiv.setAttribute("Style", "pointer-events: all;");
    } else {
        hoverDiv.setAttribute("Style", "pointer-events: none;");
    }

    // Mobile: CSS pins this as a fixed bottom sheet (see below) — no JS positioning needed.
    if (isTouch) {
         const vv = window.visualViewport;

        // Calculate current viewport dimensions considering zoom scale
        const currentWidth = vv.width;
        const currentHeight = vv.height;

        // Force layout size and position relative to current visual viewport offset
        hoverDiv.style.width = `${currentWidth}px`;
        hoverDiv.style.left = `${vv.offsetLeft}px`;
        hoverDiv.style.top = `${vv.offsetTop + currentHeight - hoverDiv.offsetHeight}px`;

        // Scale the inner content so text remains readable when zoomed out
        hoverDiv.style.transform = `scale(${1 / vv.scale})`;
        hoverDiv.style.transformOrigin = 'bottom left';
        hoverDiv.style.width = `${currentWidth * vv.scale}px`;
        
        return;
    }
       

    var selectionsHolder = document.getElementById("selectionsHolder");
    if (selectionsHolder && event.target.closest && event.target.closest("#selectionsHolder")) {
        // beside the popup's box, not the full-screen overlay holding it
        var box = selectionsHolder.querySelector(".selections") || selectionsHolder;
        var holderRect = box.getBoundingClientRect();
        var dialogRect = hoverDiv.getBoundingClientRect();

        var desiredLeft = (holderRect.right + 20 + dialogRect.width < window.innerWidth)
            ? holderRect.right + 20
            : holderRect.left - dialogRect.width - 20;

        clampToViewport(hoverDiv, desiredLeft, event.clientY - 50 );
        return;
    }

    // a tooltip to move the mouse into: below the word, so it never covers it
    if (settings.tooltipselectable && event.currentTarget && event.currentTarget.getBoundingClientRect) {
        PlaceBelow(hoverDiv, event.currentTarget);
        return;
    }
    var offset = secondary != undefined ? -5 : 10;
    clampToViewport(hoverDiv, event.clientX + offset, event.clientY + offset);
}
/*
function getNormalizedHeight(element) {
    const elementWidth = element.getBoundingClientRect().height;
    const viewportWidth = window.innerHeight;
    return elementWidth / viewportWidth;
}

function getNormalizedWidth(element) {
    const elementWidth = element.getBoundingClientRect().width;
    const viewportWidth = window.innerWidth;
    return elementWidth / viewportWidth;
}*/

// a tooltip just below the element it is for, starting at its left edge; above it where there is no room below
function PlaceBelow(dialog, el, gap = 3) {
    const word = el.getBoundingClientRect();
    const box = dialog.getBoundingClientRect();
    let top = word.bottom + gap;
    if (top + box.height > window.innerHeight - 8 && word.top - gap - box.height >= 8) top = word.top - gap - box.height;
    clampToViewport(dialog, word.left, top);
}

function clampToViewport(el, viewportLeft, viewportTop, margin = 8) {
    const rect = el.getBoundingClientRect(); // just need width/height
    const maxLeft = window.innerWidth - rect.width - margin;
    const maxTop = window.innerHeight - rect.height - margin;

    const clampedLeft = Math.min(Math.max(viewportLeft, margin), Math.max(maxLeft, margin));
    const clampedTop = Math.min(Math.max(viewportTop, margin), Math.max(maxTop, margin));

    el.style.left = (clampedLeft + window.pageXOffset) + "px";
    el.style.top = (clampedTop + window.pageYOffset) + "px";
}
