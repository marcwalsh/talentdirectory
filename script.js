// Load data from CSV (your link here)
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4kW4_8Y9e6EqwQLL5nsfEuWD9HHHYixSHe63N4yb-KWG2-ZaL7l3riYU9N-HaCLhzwlAWecckBR8U/pub?gid=1919773618&single=true&output=csv';

// Function to parse CSV data into JSON
async function fetchCSVData() {
  const response = await fetch(csvUrl);
  const data = await response.text();
  const rows = data.split('\n').slice(1);
  return rows.map(row => {
    const cols = row.match(/("[^"]*"|[^,]+)/g) || [];
    return {
      name: cols[0]?.replace(/"/g, '').trim() || '',
      title: cols[1]?.replace(/"/g, '').trim() || '',
      team: cols[2]?.replace(/"/g, '').trim() || '',
      location: cols[3]?.replace(/"/g, '').trim() || '',
      linkedin: cols[4]?.replace(/"/g, '').trim() || '',
      atMozilla: cols[5]?.replace(/"/g, '').trim() || '',
      lookingForRoles: cols[6]?.replace(/"/g, '').trim() || '',
      interestedInRemote: cols[7]?.replace(/"/g, '').trim().toLowerCase() === 'yes',
      interestedInRelocation: cols[8]?.replace(/"/g, '').trim().toLowerCase() === 'yes'
    };
  }).filter(person => person.name); // Filter out empty rows
}

// Populate directory
function populateDirectory(data) {
  const grid = document.getElementById('directory-grid');
  grid.innerHTML = '';
  data.forEach(person => {
    const item = document.createElement('div');
    item.classList.add('col-md-4', 'grid-item');
    item.innerHTML = `
      <h2>${person.name}</h2>
      <h3>${person.title}<br>${person.team}</h3>
      <div class="pucks">
        ${person.interestedInRelocation ? '<span class="puck relocation">Open to Relocation</span>' : ''}
        ${person.interestedInRemote ? '<span class="puck remote">Open to Remote Roles</span>' : ''}
      </div>
      <h6>At Mozilla I...</h6>
      <p>${person.atMozilla}</p>
      <h6>I'm looking for...</h6>
      <p>${person.lookingForRoles}</p>
      ${person.linkedin ? `<div class="linkedin-icon"><a href="${person.linkedin}" target="_blank"><img src="linkedin-in.svg" alt="LinkedIn" style="width: 24px; height: 24px;"></a></div>` : ''}
    `;
    grid.appendChild(item);
  });
}

// Filter the data based on the selected filters
function applyFilters(data) {
  const locationFilter = document.getElementById('location-filter').value.toLowerCase();
  const teamFilter = document.getElementById('team-filter').value.toLowerCase();
  const relocationFilter = document.getElementById('relocation-filter').checked;
  const remoteFilter = document.getElementById('remote-filter').checked;

  return data.filter(person => {
    return (
      (locationFilter === '' || person.location.toLowerCase().includes(locationFilter)) &&
      (teamFilter === '' || person.team.toLowerCase().includes(teamFilter)) &&
      (!relocationFilter || person.interestedInRelocation) &&
      (!remoteFilter || person.interestedInRemote)
    );
  });
}

// Populate filters dynamically
function populateFilters(data) {
  const locations = [...new Set(data.map(person => person.location))].filter(Boolean);
  const teams = [...new Set(data.map(person => person.team))].filter(Boolean);
  const locationFilter = document.getElementById('location-filter');
  const teamFilter = document.getElementById('team-filter');

  locationFilter.innerHTML = '<option value="">All Locations</option>';
  teamFilter.innerHTML = '<option value="">All Teams</option>';

  locations.forEach(location => {
    const option = document.createElement('option');
    option.value = location;
    option.textContent = location;
    locationFilter.appendChild(option);
  });

  teams.forEach(team => {
    const option = document.createElement('option');
    option.value = team;
    option.textContent = team;
    teamFilter.appendChild(option);
  });
}

// Event listeners for filter change
document.getElementById('location-filter').addEventListener('change', () => {
  fetchCSVData().then(data => populateDirectory(applyFilters(data)));
});
document.getElementById('team-filter').addEventListener('change', () => {
  fetchCSVData().then(data => populateDirectory(applyFilters(data)));
});
document.getElementById('relocation-filter').addEventListener('change', () => {
  fetchCSVData().then(data => populateDirectory(applyFilters(data)));
});
document.getElementById('remote-filter').addEventListener('change', () => {
  fetchCSVData().then(data => populateDirectory(applyFilters(data)));
});

// Initial loading of data
fetchCSVData().then(data => {
  populateFilters(data);
  populateDirectory(data);
});
