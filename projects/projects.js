import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
//renderProjects(latestProjects, projectsContainer, 'h2');
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
/*
let arc = arcGenerator({
    startAngle: 0,
    endAngle: 2 * Math.PI,
  });

d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');*/

let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
);
let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});
//let sliceGenerator = d3.pie();
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
//let colors = ['gold', 'purple'];
let colors = d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
})

function renderPieChart(projectsGiven) {
    /*let svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove();
    let legend = d3.select('.legend');
    legend.selectAll('li').remove();*/
    //let newSVG = d3.select('svg');
    //newSVG.selectAll('path').remove();
    const svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove(); // remove existing paths

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
  }

/*let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});*/
let legend = d3.select('.legend');

data.forEach((d, idx) => {
  legend.append('li')
        .attr('style', `--color: ${colors(idx)}`)
        .attr('class', 'legend-item')
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
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






