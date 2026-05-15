const PAGE_FRAGMENTS = {
    home: "pages/home.html",
    about: "pages/about.html",
    team: "pages/meet-the-mentors.html",
    season: "pages/season.html",
    resources: "pages/resources.html",
    contact: "pages/contact.html",
};

const UPCOMING_EVENTS_URL = "data/upcoming-events.json";

const MENTORS = [
    { name: "Tej Shah", role: "President", img: "assets/mugshots/Tej-Shah.jpg" },
    { name: "Yutong Zhu", role: "Lead Software", img: "assets/mugshots/Yutong-Zhu.jpg" },
    { name: "Xaiver Becerril", role: "Lead Mechanical", img: "assets/mugshots/Xaiver-Becerril.jpg" },
    { name: "Evan Grinnell", role: "Lead Stats", img: "assets/mugshots/Evan-Grinnell.jpg" },
    { name: "Nayeli Corrales", role: "Lead Media", img: "assets/mugshots/Nayeli-Corrales.jpg" },
    { name: "Adriana Chavis", role: "Co Head Media", img: "assets/mugshots/Adriana-Chavis.jpg" },
    { name: "Leonard Luna", role: "Mechanical", img: "assets/mugshots/Leonard-Luna.jpg" },
    { name: "Loyal Tillet", role: "Mechanical", img: "assets/mugshots/Loyal-Tillet.jpg" },
    { name: "Julia McPherson", role: "Design / Media", img: "assets/mugshots/Julia-McPherson.jpg" },
    { name: "Ariel", role: "Design", img: "assets/mugshots/Ariel.jpg" },
    { name: "Bee Darling", role: "Media", img: "assets/mugshots/Bee-Darling.jpg" },
];

function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0] ? parts[0][0] : "";
    const second = parts[1] ? parts[1][0] : "";
    return (first + second).toUpperCase();
}

function buildMentorCards() {
    const grid = document.getElementById("mentor-grid");

    if (!grid) {
        return;
    }

    grid.innerHTML = "";

    for (const mentor of MENTORS) {
        const card = document.createElement("div");
        card.className = "team-card";

        const avatar = document.createElement("img");
        avatar.className = "team-avatar";
        avatar.src = mentor.img;
        avatar.alt = mentor.name;

        const initials = document.createElement("div");
        initials.className = "team-avatar-initials";
        initials.textContent = getInitials(mentor.name);

        avatar.addEventListener("error", () => {
            avatar.style.display = "none";
            initials.style.display = "flex";
        });

        const name = document.createElement("div");
        name.className = "team-name";
        name.textContent = mentor.name;

        const role = document.createElement("div");
        role.className = "team-role";
        role.textContent = mentor.role;

        card.append(avatar, initials, name, role);
        grid.appendChild(card);
    }
}

function parseEventDate(value) {
    return new Date(`${value}T00:00:00`);
}

function formatEventDate(value) {
    const date = parseEventDate(value);

    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

async function renderUpcomingEvents() {
    const grid = document.getElementById("upcoming-events-grid");

    if (!grid) {
        return;
    }

    grid.innerHTML = '<div class="events-empty">Loading upcoming events.</div>';

    try {
        const response = await fetch(UPCOMING_EVENTS_URL);

        if (!response.ok) {
            throw new Error(`Failed to load ${UPCOMING_EVENTS_URL}`);
        }

        const events = await response.json();
        const now = new Date();

        const upcomingEvents = events
            .map((event) => ({
                ...event,
                startDate: parseEventDate(event.date),
            }))
            .filter((event) => event.startDate >= now)
            .sort((first, second) => first.startDate - second.startDate);

        if (!upcomingEvents.length) {
            grid.innerHTML = '<div class="events-empty">No upcoming events are currently listed on the team calendar.</div>';
            return;
        }

        const cardsFragment = document.createDocumentFragment();

        upcomingEvents.forEach((event, index) => {
            const isNext = index === 0;
            const card = document.createElement("article");
            const badge = document.createElement("div");
            const date = document.createElement("div");
            const title = document.createElement("div");
            const meta = document.createElement("div");

            card.className = `event-card${isNext ? " event-card--next" : ""}`;

            badge.className = "event-badge";
            badge.textContent = isNext ? "Next up" : `Event ${index + 1}`;

            date.className = "event-date";
            date.textContent = formatEventDate(event.date);

            title.className = "event-title";
            title.textContent = event.title;

            meta.className = "event-meta";
            meta.textContent = `${event.allDay ? "All day" : "Scheduled time"}${event.location ? ` · ${event.location}` : ""}`;

            card.appendChild(badge);
            card.appendChild(date);
            card.appendChild(title);
            card.appendChild(meta);
            cardsFragment.appendChild(card);
        });

        grid.replaceChildren(cardsFragment);
    } catch (error) {
        console.error(error);
        grid.innerHTML = '<div class="events-empty">The upcoming-events list could not be loaded.</div>';
    }
}

async function loadFragment(pageName, fragmentPath) {
    const page = document.getElementById(`page-${pageName}`);

    if (!page) {
        return;
    }

    const response = await fetch(fragmentPath);

    if (!response.ok) {
        throw new Error(`Failed to load ${fragmentPath}`);
    }

    page.innerHTML = await response.text();
}

function showPage(pageName) {
    const pages = document.querySelectorAll(".page");
    for (const page of pages) {
        page.classList.remove("active");
    }

    const links = document.querySelectorAll(".nav-links a");
    for (const link of links) {
        link.classList.remove("active");
    }

    const selectedPage = document.getElementById(`page-${pageName}`);
    const selectedLink = document.querySelector(`.nav-links a[data-page="${pageName}"]`);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    if (selectedLink) {
        selectedLink.classList.add("active");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    triggerReveal();
}

function triggerReveal() {
    setTimeout(() => {
        const elements = document.querySelectorAll(".page.active .reveal");
        for (const element of elements) {
            element.classList.add("visible");
        }
    }, 80);
}

function getPageNameFromHash() {
    const hash = window.location.hash.slice(1); // Remove the '#' character
    return hash && hash in PAGE_FRAGMENTS ? hash : "home";
}

function navigateTo(pageName) {
    // Update URL hash to sync page state with browser history
    if (pageName !== "home") {
        window.location.hash = pageName;
    } else {
        // Remove hash for home page (cleaner URL)
        window.history.pushState(null, "", window.location.pathname);
    }
    
    // showPage will be called by hashchange event listener
    // For home, manually call showPage since pushState doesn't trigger hashchange
    if (pageName === "home") {
        showPage(pageName);
    }
}

function wireNavigation() {
    const links = document.querySelectorAll(".nav-links a[data-page], .nav-logo[data-page]");

    for (const link of links) {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            navigateTo(link.dataset.page);
        });
    }

    // Handle hash changes (from back/forward buttons or direct hash navigation)
    window.addEventListener("hashchange", () => {
        const pageName = getPageNameFromHash();
        showPage(pageName);
    });
}

async function init() {
    wireNavigation();

    const fragmentEntries = Object.entries(PAGE_FRAGMENTS);
    const fragmentResults = await Promise.allSettled(
        fragmentEntries.map(([pageName, fragmentPath]) => loadFragment(pageName, fragmentPath))
    );

    fragmentResults.forEach((result, index) => {
        if (result.status === "rejected") {
            const [pageName, fragmentPath] = fragmentEntries[index];
            console.error(`Failed to load fragment "${pageName}" from "${fragmentPath}"`, result.reason);
        }
    });

    buildMentorCards();
    await renderUpcomingEvents();

    // Load the page based on the initial hash (enables deep-linking)
    const pageName = getPageNameFromHash();
    showPage(pageName);
}

document.addEventListener("DOMContentLoaded", () => {
    init().catch((error) => {
        console.error(error);
    });
});
