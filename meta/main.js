import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';
let data = [];
let commits = [];

// Declare scales globally
let xScale, yScale;
let brushSelection = null;

const timeDisplay = document.getElementById("commit-time");
const slider = document.getElementById("commit-progress");
slider.value = 100;
let commitProgress = 100;
let timeScale = d3
    .scaleTime()
    .domain([
      d3.min(commits, (d) => d.datetime),
      d3.max(commits, (d) => d.datetime),
    ])
    .range([0, 100]);
let commitMaxTime = timeScale.invert(commitProgress);
timeDisplay.textContent = commitMaxTime.toLocaleString();

const width = 1000;
const height = 600;

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  processCommits();
  renderCommitInfo(); 
  renderScatterplot();
  console.log(commits);


}

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit, // Replace YOUR_REPO with your actual repo name
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60, // Calculate hour as a decimal
        totalLines: lines.length, // Count of lines modified
      };

      // Define 'lines' as a hidden property
      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true, 
        writable: false,     
        enumerable: false, 
      });

      return ret;
    });
}

/*function renderCommitInfo() {

  const statsContainer = d3.select('#stats').append('div').attr('class', 'stats-container');

  statsContainer.append('h2').text('Summary').attr('class', 'summary-title');

  const statsFlex = statsContainer.append('div').attr('class', 'stats-flex');

  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').html('Total <abbr title="Lines of code">LOC</abbr>');
  statsFlex.append('div').attr('class', 'stat-value').text(data.length);

  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Total commits');
  statsFlex.append('div').attr('class', 'stat-value').text(commits.length);

  const numberOfFiles = d3.group(data, d => d.file).size;
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Number of files');
  statsFlex.append('div').attr('class', 'stat-value').text(numberOfFiles);

  const maxFileLength = d3.max(data, d => d.length);
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Maximum file length (lines)');
  statsFlex.append('div').attr('class', 'stat-value').text(maxFileLength);

  const averageFileLength = d3.mean(data, d => d.length);
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Average file length (lines)');
  statsFlex.append('div').attr('class', 'stat-value').text(averageFileLength.toFixed(2)); // Fixed to 2 decimal places

  const maxDepth = d3.max(data, d => d.depth);
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Maximum depth');
  statsFlex.append('div').attr('class', 'stat-value').text(maxDepth);
}*/
function renderCommitInfo() {
  const statsContainer = d3.select('#stats')
    .append('div')
    .attr('class', 'stats-container');

  statsContainer.append('h2')
    .text('Summary')
    .attr('class', 'summary-title');

  const statsFlex = statsContainer.append('div')
    .attr('class', 'stats-flex');

  function appendStat(label, value) {
    const statItem = statsFlex.append('div').attr('class', 'stat-item');
    statItem.append('div').attr('class', 'stat-label').html(label);
    statItem.append('div').attr('class', 'stat-value').text(value);
  }

  appendStat('Total <abbr title="Lines of code">LOC</abbr>', data.length);
  appendStat('Total commits', commits.length);

  const numberOfFiles = d3.group(data, d => d.file).size;
  appendStat('Number of files', numberOfFiles);

  const maxFileLength = d3.max(data, d => d.length);
  appendStat('Maximum file length (lines)', maxFileLength);

  const averageFileLength = d3.mean(data, d => d.length);
  appendStat('Average file length (lines)', averageFileLength.toFixed(2));

  const maxDepth = d3.max(data, d => d.depth);
  appendStat('Maximum depth', maxDepth);
}



function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) {
    document.getElementById('commit-tooltip').style.display = 'none';
    return;
  }

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  time.textContent = commit.datetime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;

  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.display = 'block';
  tooltip.style.top = `${d3.event.pageY + 10}px`;
  tooltip.style.left = `${d3.event.pageX + 10}px`;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX + 10}px`;
  tooltip.style.top = `${event.clientY + 10}px`;
}

function renderSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
  /*const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;*/
}

/*function renderLanguageBreakdown() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  container.innerHTML = '';

  const breakdownArray = Array.from(breakdown);
  
  const formattedLanguages = breakdownArray.map(([language, count]) => {
    const proportion = count / lines.length;
    const formatted = d3.format('.1%')(proportion);
    return `<strong>${language}</strong>\n${count} lines\n(${formatted})`;
  }).join('          ');
  
  container.innerHTML = formattedLanguages;

  return breakdown;
}*/

function brushed(event) {
    //console.log(event);
    brushSelection = event.selection;
    //d3.select(svg).call(d3.brush().on('start brush end', brushed));
    //const selection = event.selection;
    //d3.selectAll('circle').classed('selected', (d) =>
    //isCommitSelected(selection, d),
    //);
    renderSelection();
    renderSelectionCount();
    renderLanguageBreakdown();
}

function isCommitSelected(commit) {
  if (!brushSelection) return false;
  
  const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
  const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
  
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  
  return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function renderSelection() {
  d3.selectAll('circle')
    .classed('selected', (d) => isCommitSelected(d))
    .style('fill', d => isCommitSelected(d) ? '#D50000' : '#4A90E2');
}

function renderScatterplot() {
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));


  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  const dots = svg.append('g').attr('class', 'dots');

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

  const rScale = d3
    .scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);

  dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill', '#D5006D')
    .style('fill-opacity', 0.7)
    .on('mouseenter', function(event, d) {
        d3.select(this)
            .style('fill-opacity', 1)
            .style('cursor', 'pointer');
        renderTooltipContent(d);
        const tooltip = document.getElementById('commit-tooltip');
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
    })
    .on('mousemove', function(event) {
        const tooltip = document.getElementById('commit-tooltip');
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
    })
    .on('mouseleave', function() {
        d3.select(this)
            .style('fill-opacity', 0.7);
        renderTooltipContent({});
    });


  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .attr('class', 'x-axis')
    .call(xAxis);


  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .attr('class', 'y-axis')
    .call(yAxis);

    brushedSelect();
}

function brushedSelect() {
  const svg = document.querySelector('svg');
  
  d3.select(svg).call(d3.brush().on('start brush end', brushed));

  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
  renderSelection();
}

/*function renderLanguageBreakdown(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type,
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  }*/
  function renderLanguageBreakdown() {
        const selectedCommits = brushSelection
          ? commits.filter(isCommitSelected)
          : [];
        const container = document.getElementById('language-breakdown');
      
        if (selectedCommits.length === 0) {
          container.innerHTML = '';
          return;
        }
      
        const requiredCommits = selectedCommits.length ? selectedCommits : commits;
        const lines = requiredCommits.flatMap((d) => d.lines);
      
        // Use d3.rollup to count lines per language
        const breakdown = d3.rollup(
          lines,
          (v) => v.length,
          (d) => d.type
        );
      
        // Update DOM with breakdown
        container.innerHTML = '';
      
        // Convert breakdown to array and sort by language
        const breakdownArray = Array.from(breakdown);
        
        const formattedLanguages = breakdownArray.map(([language, count]) => {
          const proportion = count / lines.length;
          const formatted = d3.format('.1%')(proportion);
          return `<strong>${language}</strong>\n${count} lines\n(${formatted})`;
        }).join('          '); // Add spacing between language blocks
        
        container.innerHTML = formattedLanguages;
      
        return breakdown;
      }
function updateScatterPlot(data, commits) {
        const width = 1000;
        const height = 600;
        const margin = { top: 10, right: 10, bottom: 30, left: 20 };
        const usableArea = {
          top: margin.top,
          right: width - margin.right,
          bottom: height - margin.bottom,
          left: margin.left,
          width: width - margin.left - margin.right,
          height: height - margin.top - margin.bottom,
        };
      
        const svg = d3.select('#chart').select('svg');
      
        xScale = xScale.domain(d3.extent(commits, (d) => d.datetime));
      
        const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
        const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);
      
        const xAxis = d3.axisBottom(xScale);
      
        // CHANGE: we should clear out the existing xAxis and then create a new one.
        /*svg
          .append('g')
          .attr('transform', `translate(0, ${usableArea.bottom})`)
          .call(xAxis);*/

        /*const xAxisGroup = svg.select('g.x-axis');
        xAxisGroup.selectAll('*').remove();  // Clear old axis content
        xAxisGroup
          .attr('transform', `translate(0, ${usableArea.bottom})`)
          .call(xAxis);*/
        const xAxisGroup = svg.select('g.x-axis');
        xAxisGroup.selectAll('*').remove();
        xAxisGroup.call(xAxis);
      
        const dots = svg.select('g.dots');
      
        const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
        dots
          .selectAll('circle')
          .data(sortedCommits, (d) => d.id)
          .join('circle')
          .attr('cx', (d) => xScale(d.datetime))
          .attr('cy', (d) => yScale(d.hourFrac))
          .attr('r', (d) => rScale(d.totalLines))
          .attr('fill', 'steelblue')
          .style('fill-opacity', 0.7) // Add transparency for overlapping dots
          .on('mouseenter', (event, commit) => {
            d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
            renderTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
          })
          .on('mouseleave', (event) => {
            d3.select(event.currentTarget).style('fill-opacity', 0.7);
            updateTooltipVisibility(false);
          });
      }

function updateCommitInfo(filteredData, filteredCommits) {
  // clear existing stats first
  d3.select('#stats').selectAll('*').remove();

  const statsContainer = d3.select('#stats').append('div').attr('class', 'stats-container');

  statsContainer.append('h2').text('Summary').attr('class', 'summary-title');

  const statsFlex = statsContainer.append('div').attr('class', 'stats-flex');

  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').html('Total <abbr title="Lines of code">LOC</abbr>');
  statsFlex.append('div').attr('class', 'stat-value').text(filteredData.length);

  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Total commits');
  statsFlex.append('div').attr('class', 'stat-value').text(filteredCommits.length);

  const numberOfFiles = d3.group(filteredData, d => d.file).size;
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Number of files');
  statsFlex.append('div').attr('class', 'stat-value').text(numberOfFiles);

  const maxFileLength = d3.max(filteredData, d => d.length);
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Maximum file length (lines)');
  statsFlex.append('div').attr('class', 'stat-value').text(maxFileLength);

  const averageFileLength = d3.mean(filteredData, d => d.length);
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Average file length (lines)');
  statsFlex.append('div').attr('class', 'stat-value').text(averageFileLength.toFixed(2));

  const maxDepth = d3.max(filteredData, d => d.depth);
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Maximum depth');
  statsFlex.append('div').attr('class', 'stat-value').text(maxDepth);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  
  let commitProgress = 100;
  let timeScale = d3
    .scaleTime()
    .domain([
      d3.min(commits, (d) => d.datetime),
      d3.max(commits, (d) => d.datetime),
    ])
    .range([0, 100]);
  let commitMaxTime = timeScale.invert(commitProgress);
  let filteredCommits = commits;
  function onTimeSliderChange() {
      const slider = document.getElementById("commit-progress");
      const timeDisplay = document.getElementById("commit-time");
    
      commitProgress = +slider.value; // Convert to number
      commitMaxTime = timeScale.invert(commitProgress);
    
      // Update the <time> display
      timeDisplay.textContent = commitMaxTime.toLocaleString();
      filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
      let lines = filteredCommits.flatMap((d) => d.lines);
      /*let files = d3
        .groups(lines, (d) => d.file)
        .map(([name, lines]) => {
          return { name, lines };
        });*/
      
      let files = d3
        .groups(lines, (d) => d.file)
        .map(([name, lines]) => {
          return { name, lines };
        })
        .sort((a, b) => b.lines.length - a.lines.length);

      let filesContainer = d3
        .select('#files')
        .selectAll('div')
        .data(files, (d) => d.name)
        .join(
          // This code only runs when the div is initially rendered
          (enter) =>
            enter.append('div').call((div) => {
              div.append('dt').append('code');
              div.append('dd');
            }),
      );
      let colors = d3.scaleOrdinal(d3.schemeTableau10);
      // This code updates the div info
      filesContainer.select('dt > code').text((d) => d.name);
      filesContainer.select('dd').text((d) => `${d.lines.length} lines`);
      filesContainer
        .select('dd')
        .selectAll('div')
        .data((d) => d.lines)
        .join('div')
        .attr('class', 'loc')
        .attr('style', (d) => `--color: ${colors(d.type)}`);


        console.log('filtered', filteredCommits)
      // You can also trigger filtering or rerendering here if needed
      // updateCommitsView();
      updateCommitInfo(lines, filteredCommits);
      updateScatterPlot(data, filteredCommits);
  
    }
    
    // Add the event listener
    document
      .getElementById("commit-progress")
      .addEventListener("input", onTimeSliderChange);
    
    // Call once on load to initialize display
    onTimeSliderChange();

    
    d3.select('#scatter-story')
      .selectAll('.step')
      .data(commits)
      .join('div')
      .attr('class', 'step')
      .html(
        (d, i) => `
        On ${d.datetime.toLocaleString('en', {
          dateStyle: 'full',
          timeStyle: 'short',
        })},
        I made <a href="${d.url}" target="_blank">${
          i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'
        }</a>.
        I edited ${d.totalLines} lines across ${
          d3.rollups(
            d.lines,
            (D) => D.length,
            (d) => d.file,
          ).length
        } files.
        Then I looked over all I had made, and I saw that it was very good.
      `,
      );
    let userHasScrolled = false;
    window.addEventListener('scroll', () => (userHasScrolled = true));
      
    function onStepEnter(response) {
      if (!userHasScrolled) return;
      const stepCommit = response.element.__data__;
      commitMaxTime = stepCommit.datetime;
      commitProgress = timeScale(stepCommit.datetime);
      slider.value = commitProgress;
      timeDisplay.textContent = commitMaxTime.toLocaleString(undefined, {
        dateStyle: 'long',
        timeStyle: 'short'
      });
      //filterCommitsByTime();
      filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
      let lines = filteredCommits.flatMap((d) => d.lines);
      /*let files = d3
        .groups(lines, (d) => d.file)
        .map(([name, lines]) => {
          return { name, lines };
        });*/
      
      let files = d3
        .groups(lines, (d) => d.file)
        .map(([name, lines]) => {
          return { name, lines };
        })
        .sort((a, b) => b.lines.length - a.lines.length);

      let filesContainer = d3
        .select('#files')
        .selectAll('div')
        .data(files, (d) => d.name)
        .join(
          // This code only runs when the div is initially rendered
          (enter) =>
            enter.append('div').call((div) => {
              div.append('dt').append('code');
              div.append('dd');
            }),
      );
      let colors = d3.scaleOrdinal(d3.schemeTableau10);
      // This code updates the div info
      filesContainer.select('dt > code').text((d) => d.name);
      filesContainer.select('dd').text((d) => `${d.lines.length} lines`);
      filesContainer
        .select('dd')
        .selectAll('div')
        .data((d) => d.lines)
        .join('div')
        .attr('class', 'loc')
        .attr('style', (d) => `--color: ${colors(d.type)}`);


        console.log('filtered', filteredCommits)

      updateCommitInfo(lines, filteredCommits);
      updateScatterPlot(data, filteredCommits);
      //renderFileStats();
    }


    const scroller = scrollama();
    scroller
      .setup({
        container: '#scrolly-1',
        step: '#scrolly-1 .step',
      })
      .onStepEnter(onStepEnter);
        
});
