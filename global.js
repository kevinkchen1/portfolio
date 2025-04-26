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



export async function fetchJSON(url) {
    try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
    }
  }

  export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    // Check if the containerElement is a valid DOM element
    if (!(containerElement instanceof HTMLElement)) {
        console.error('Invalid container element provided.');
        return;
    }
  
    // Clear existing content in the container
    containerElement.innerHTML = '';
  
    // Validate heading level
    const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const headingTag = validHeadingLevels.includes(headingLevel) ? headingLevel : 'h2';
  
    // Loop through each project and create an article element
    projects.forEach(project => {
        const article = document.createElement('article');
  
        // Create the content with year information
        article.innerHTML = `
            <${headingTag}>${project.title || 'Untitled Project'}</${headingTag}>
            <img src="${project.image || 'path/to/default/image.png'}" alt="${project.title || 'Project Image'}" style="width: 300px; height: 200px; object-fit: cover;">
            <div class="project-content">
                <p class="project-description">${project.description || 'No description available.'}</p>
                <p class="project-year" style="margin-bottom: 0.2rem;">${project.year ? `Year: ${project.year}` : 'Year not specified'}</p>
                <p class="project-url">
                    <a href="${project.url}" target="_blank"></a>
                </p>
            </div>
        `;
  
        // Add CSS styles to the article element
        article.style.cssText = `
            display: grid;
            gap: 1rem;
        `;
  
        // Style the project content container
        const projectContent = article.querySelector('.project-content');
        if (projectContent) {
            projectContent.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            `;
        }
  
        // Style the year text
        const yearElement = article.querySelector('.project-year');
        if (yearElement) {
            yearElement.style.cssText = `
                font-style: italic;
                color: var(--text-color);
                opacity: 0.8;
                margin-top: 0.5rem;
            `;
        }
  
        // Append the article to the container
        containerElement.appendChild(article);
    });
  }

  export async function fetchGitHubData(username) {
    // return statement here
    return fetchJSON(`https://api.github.com/users/${username}`);
}
 /* export function renderProjects(project, containerElement, headingLevel = 'h2') {
    // Your code will go here
    if (!containerElement) {
        console.error('Invalid container element');
        return;
    }

    containerElement.innerHTML = '';

    const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (!validHeadings.includes(headingLevel)) {
        console.warn(`Invalid heading level "${headingLevel}". Falling back to "h2".`);
        headingLevel = 'h2';
    }

    for (const proj of project) {
        const article = document.createElement('article');

    
        article.innerHTML = `
            <h3>${proj.title}</h3>
            <img src="${proj.image}" alt="${proj.title}">
            <p>${proj.description}</p>`;

        containerElement.appendChild(article);
    }

  }*/
  
   
  