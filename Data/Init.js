let searchParams = new URLSearchParams(window.location.search);
let searchKeyword = searchParams.get("u");


// The site's scripts, in the order they run, each needing those before it. All are downloaded at once, with the header,
// as this file runs, and from the browser's cache on the next page; they run in this order once the header is in
// (Builder.js reads its settings boxes as it runs). Until 2026-11-26 one after another, each asked for when the one
// before had run, and never from the cache (jQuery.getScript gave each a new address every time): about 0.17s on the
// local server before the data was asked for, a round trip per script online. The data is asked for as soon as
// dataloader.js has run (StartData), while the others are still read.
const SITE_SCRIPTS = [
    "/evolved/Data/src/settings.js",
    "/evolved/Data/src/dataloader.js",
    "/evolved/Data/src/tooltips.js",
    "/evolved/Data/src/lookuputils.js",
    "/evolved/Data/Search.js",
    "/evolved/Data/Faction.js",
    "/evolved/Data/Builder.js"
];
for (const src of SITE_SCRIPTS) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "script";
    link.href = src;
    document.head.append(link);
}
const headerHtml = fetch("/evolved/HTML/header.html").then((res) => res.text());

document.addEventListener("DOMContentLoaded", function () {
    headerHtml.then((html) => {
        document.body.insertAdjacentHTML("afterbegin", html);
        GetHamburgerMenu();
        // in order: a script added by a script runs as soon as it is in, unless it is not async
        for (const src of SITE_SCRIPTS) {
            const script = document.createElement("script");
            script.src = src;
            script.async = false;
            if (src.endsWith("/dataloader.js")) script.onload = () => StartData();
            if (src === SITE_SCRIPTS.at(-1)) {
                script.onload = () => {
                    CheckData();
                    // wait for a while and then  HandleExtraTooltips();
                    setTimeout(function () {
                        HandleExtraTooltips();
                    }, 2000);
                };
            }
            document.head.append(script);
        }
    });
});


function GetHamburgerMenu(){
   
    var isMobile = window.matchMedia('(max-width: 800px)');
    var menu = document.getElementById('menu');
    var toggle = document.getElementById('menuToggle');
    var backdrop = document.getElementById('menuBackdrop');
     var topbar = document.querySelector('.topbar');
    var anchor = document.getElementById('topbarAnchor');
    var extras = document.getElementById('menuExtras');

    function openMenu() {
        menu.classList.add('open');
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden'; // stop background scroll while menu is open
    }
    function closeMenu() {
        menu.classList.remove('open');
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
        // also collapse any open submenus so it resets clean next time
        menu.querySelectorAll('.open').forEach(function (el) {
            if (el !== menu) el.classList.remove('open');
        });
    }

    toggle.addEventListener('click', function () {
        menu.classList.contains('open') ? closeMenu() : openMenu();
    });
    backdrop.addEventListener('click', closeMenu);

    // Nested submenu toggling (mobile only; desktop keeps :hover)
    menu.addEventListener('click', function (e) {
        if (!isMobile.matches) return;

        var link = e.target.closest('#menu > li > a, .has-submenu > a');
        if (!link) return;

        var submenu = link.nextElementSibling;
        if (submenu && submenu.tagName === 'UL') {
            e.preventDefault();
            submenu.classList.toggle('open');
        }
        // else: it's a real link (like Search) — let it navigate normally,
        // closeMenu() isn't strictly needed since the page is about to unload
    });
    
     function placeTopbar(mobile) {
        if (mobile) {
            extras.appendChild(topbar);
        } else {
            anchor.parentNode.insertBefore(topbar, anchor.nextSibling);
        }
    }

    placeTopbar(isMobile.matches); // set correct position on load
    isMobile.addEventListener('change', function (e) {
        placeTopbar(e.matches);
    });
    
     var isTouch = window.matchMedia('(hover: none), (max-width: 800px)');
   

    extras.addEventListener('click', function (e) {
        if (!isTouch.matches) return;

        var title = e.target.closest('.dropdown-title');
        if (!title) return;

        var content = title.nextElementSibling; // the .dropdown-content right after it
        if (content && content.classList.contains('dropdown-content')) {
            content.classList.toggle('open');
        }
    });

}

