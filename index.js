import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');

const githubData = await fetchGitHubData('kevinkchen1');
const profileStats = document.querySelector('#profile-stats');
if (profileStats) {
    profileStats.innerHTML = `
          <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
            <dt>Bio:</dt><dd>${githubData.bio}</dd>

          </dl>
      `;
  }

  async function loadProfileStats() {
    const response = await fetch('https://api.github.com/users/kevinkchen1');
    const data = await response.json();
  
    const statsHTML = `
      <dl>
        <dt>Repos</dt>
        <dt>Followers</dt>
        <dt>Following</dt>
        <dt>Gists</dt>
        <dd>${data.public_repos}</dd>
        <dd>${data.followers}</dd>
        <dd>${data.following}</dd>
        <dd>${data.public_gists}</dd>
      </dl>
    `;
  
    document.getElementById('profile-stats').innerHTML = statsHTML;
  }
  
  loadProfileStats();
