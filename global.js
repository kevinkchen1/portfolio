console.log("IT'S ALIVE!");

// Helper function to select elements easily
function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/portfolio/";  
// Define the pages for navigation
let pages = [
    { url: "", title: "Home" },
    { url: "projects/", title: "Projects" },
    { url: "contact/", title: "Contact" },
    { url: "resume/", title: "Resume" },
    { url: "https://github.com/kevinkchen1", title: "GitHub" }
];

// Create the navigation menu
let nav = document.createElement('nav');
document.body.prepend(nav);

// Add links to the nav element
/*for (let p of pages) {
    let url = p.url;
    let title = p.title;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);
  
    
}*/
for (let p of pages) {
    let url = p.url;

    url = !url.startsWith('http') ? BASE_PATH + url : url;

    let a = document.createElement("a");
    a.href = url;
    a.textContent = p.title;


    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add("current");
    }

    nav.append(a);
}

let navLinks = $$("nav a");

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);

if (currentLink) {
    currentLink.classList.add("current");
}

function createThemeSwitcher() {
    document.body.insertAdjacentHTML(
        'afterbegin',
        `<label class="color-scheme">
            Theme:
            <select id="theme-switcher">
                <option value="light dark">Automatic</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </label>`
    );

    const select = document.getElementById("theme-switcher");
    const root = document.documentElement;

    const savedTheme = localStorage.getItem("preferred-theme");
    if (savedTheme) {
        root.style.colorScheme = savedTheme;
        select.value = savedTheme;
    }

    select.addEventListener("change", (e) => {
        const selected = e.target.value;
        root.style.colorScheme = selected;
        localStorage.setItem("preferred-theme", selected);
    });
}

function initializePage() {
    createThemeSwitcher();
}

initializePage();
