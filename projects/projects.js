/*import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
//renderProjects(latestProjects, projectsContainer, 'h2');
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let selectedIndex = -1;
let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
);
let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
})

// old renderPieChart
/*function renderPieChart(projectsGiven) {
    //let newSVG = d3.select('svg');
    //newSVG.selectAll('path').remove();
    //const svg = d3.select('#projects-pie-plot');
    //svg.selectAll('*').remove(); // remove existing paths

    const legend = d3.select('.legend');
    legend.selectAll('*').remove();
    // 1. Roll up the data
    let rolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year
    );
  
    // 2. Convert into a usable format
    let data = rolledData.map(([year, count]) => ({
      label: year ?? 'Not Specified',
      value: count
    }));
  
    // 3. Setup pie and arc generators
    let pie = d3.pie().value(d => d.value);
    let arcData = pie(data);
    let arc = d3.arc().innerRadius(0).outerRadius(40);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    //let svg = d3.select('#projects-pie-plot');
    //svg.selectAll('path').remove();
    //d3.select('.legend').selectAll('*').remove();
  
    // 4. Clear old SVG paths and legend items
    //let svg = d3.select('#projects-pie-plot');
    //svg.selectAll('path').remove();
  
    //let legend = d3.select('.legend');
    //legend.selectAll('li').remove();
    const svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove();
    d3.select('.legend').selectAll('*').remove();
    // 5. Draw paths
    arcData.forEach((d, idx) => {
      svg.append('path')
        .attr('d', arc(d))
        .attr('fill', colors(idx));
    });
  
    // 6. Draw legend items
    data.forEach((d, idx) => {
      legend.append('li')
        .attr('class', 'legend-item')
        .attr('style', `--color: ${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
  }*/

// UNCOMMENT HERE
/*

function renderPieChart(projectsGiven) {
        // 1. Roll up the data
        let rolledData = d3.rollups(
          projectsGiven,
          (v) => v.length,
          (d) => d.year
        );
      
        // 2. Convert into a usable format
        let data = rolledData.map(([year, count]) => ({
          label: year ?? 'Not Specified',
          value: count
        }));
      
        // 3. Setup pie and arc generators
        let pie = d3.pie().value(d => d.value);
        let arcData = pie(data);
        let arc = d3.arc().innerRadius(0).outerRadius(40);
        let colors = d3.scaleOrdinal(d3.schemeTableau10);
      
        const svg = d3.select('#projects-pie-plot');
        const legend = d3.select('.legend');
      
        // Clear old SVG paths and legend items
        svg.selectAll('path').remove();
        legend.selectAll('*').remove();
      
        // 4. Draw paths with click event to highlight the selected wedge
        arcData.forEach((d, idx) => {
          let path = svg.append('path')
            .attr('d', arc(d))
            .attr('fill', colors(idx))
            .on('click', () => {
              // If the same wedge is clicked again, deselect it
              if (selectedIndex === idx) {
                selectedIndex = -1;
                path.attr('fill', colors(idx)); // Reset the color to the original color
                legend.selectAll('.legend-item').style('font-weight', 'normal');
              } else {
                // Deselect the previous selection if any
                if (selectedIndex !== -1) {
                  svg.selectAll('path').attr('fill', (d, i) => colors(i));
                  legend.selectAll('.legend-item').style('font-weight', 'normal');
                }
                
                // Highlight the clicked wedge
                selectedIndex = idx;
                path.attr('fill', 'orange'); // Change the color to indicate selection
                legend.selectAll('.legend-item').style('font-weight', 'normal');
                legend.select(`.legend-item:nth-child(${idx + 1})`).style('font-weight', 'bold');
              }
            });
        });
      
        // 5. Draw legend items
        data.forEach((d, idx) => {
          legend.append('li')
            .attr('class', 'legend-item')
            .attr('style', `--color: ${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
        });
      }
      

let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});

let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});
*/
import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

let query = '';
let selectedYear = null;

// Initial render of pie chart
renderPieChart(projects);

// Search bar filter
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
  query = event.target.value;
  applyFilters();
});

// Main filtering function
function applyFilters() {
  let filtered = projects;

  if (query) {
    filtered = filtered.filter((project) =>
      Object.values(project).join('\n').toLowerCase().includes(query.toLowerCase())
    );
  }

  if (selectedYear !== null) {
    filtered = filtered.filter((project) => project.year === selectedYear);
  }

  renderProjects(filtered, projectsContainer, 'h2');
  renderPieChart(filtered);
}

// Pie chart render function
function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let data = rolledData.map(([year, count]) => ({
    label: year ?? 'Not Specified',
    value: count
  }));

  let pie = d3.pie().value(d => d.value);
  let arcData = pie(data);
  let arc = d3.arc().innerRadius(0).outerRadius(40);
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');

  // Clear old SVG paths and legend items
  svg.selectAll('path').remove();
  legend.selectAll('*').remove();

  arcData.forEach((d, idx) => {
    let path = svg.append('path')
      .attr('d', arc(d))
      .attr('fill', colors(idx))
      .on('click', () => {
        if (selectedYear === data[idx].label) {
          selectedYear = null;
          path.attr('fill', colors(idx));
          legend.selectAll('.legend-item').style('font-weight', 'normal');
        } else {
          selectedYear = data[idx].label;
          svg.selectAll('path').attr('fill', (d, i) => colors(i));
          path.attr('fill', 'orange');
          legend.selectAll('.legend-item').style('font-weight', 'normal');
          legend.select(`.legend-item:nth-child(${idx + 1})`).style('font-weight', 'bold');
        }
        applyFilters();
      });
  });

  // Draw legend items
  data.forEach((d, idx) => {
    legend.append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color: ${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

