/*let commitProgress = 100;

let timeScale = d3
  .scaleTime()
  .domain([
    d3.min(commits, (d) => d.datetime),
    d3.max(commits, (d) => d.datetime),
  ])
  .range([0, 100]);
let commitMaxTime = timeScale.invert(commitProgress);

function onTimeSliderChange() {
    const slider = document.getElementById("commit-progress");
    const timeDisplay = document.getElementById("commit-time");
  
    commitProgress = +slider.value; // Convert to number
    commitMaxTime = timeScale.invert(commitProgress);
  
    // Update the <time> display
    timeDisplay.textContent = commitMaxTime.toLocaleString();
    
    // You can also trigger filtering or rerendering here if needed
    // updateCommitsView();
  }
  
  // Add the event listener
  document
    .getElementById("commit-progress")
    .addEventListener("input", onTimeSliderChange);
  
  // Call once on load to initialize display
  onTimeSliderChange();*/