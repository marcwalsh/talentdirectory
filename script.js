// Load data from CSV (your link here)
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQpJRE4o2IWSM-aOR2b4q3Ky0B5DoJ2JFU4oc40KYK9AeSw1hRdCulGCHwRGOCbytU5RxdrQBT03nt5/pub?gid=1226224503&single=true&output=csv';

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
      <div class="linkedin-icon">
        ${person.linkedin ? `<a href="${person.linkedin}" target="_blank"><img src="linkedin.png" alt="LinkedIn";"></a>` : ''}
      </div>
      <h6>At Mozilla...</h6>
      <p>${person.atMozilla}</p>
      <h6>I'm looking for...</h6>
      <p>${person.lookingForRoles}</p>
      ${person.interestedInRelocation || person.interestedInRemote ? '<h6>Open To:</h6>' : ''}
      <div class="pucks-wrapper">
        ${person.interestedInRelocation ? '<span class="puck relocation">Relocation</span>' : ''}
        ${person.interestedInRemote ? '<span class="puck remote">Remote</span>' : ''}
      </div>
    `;
    grid.appendChild(item);
  });
}

// Populate dropdown options
function populateDropdownOptions(data) {
  const locationDropdown = document.getElementById('location-dropdown');
  const teamDropdown = document.getElementById('team-dropdown');

  // Get unique locations and teams
  const uniqueLocations = [...new Set(data.map(item => item.location))].filter(Boolean);
  const uniqueTeams = [...new Set(data.map(item => item.team))].filter(Boolean);

  // Populate location dropdown
  locationDropdown.innerHTML = '<option value="">All Locations</option>';
  uniqueLocations.forEach(location => {
    const option = document.createElement('option');
    option.value = location;
    option.textContent = location;
    locationDropdown.appendChild(option);
  });

  // Populate team dropdown
  teamDropdown.innerHTML = '<option value="">All Teams</option>';
  uniqueTeams.forEach(team => {
    const option = document.createElement('option');
    option.value = team;
    option.textContent = team;
    teamDropdown.appendChild(option);
  });
}

// Filter the data based on the selected filters
function filterData() {
  fetchCSVData().then(data => {
    const locationValue = document.querySelector('#location-dropdown').value.toLowerCase();
    const teamValue = document.querySelector('#team-dropdown').value.toLowerCase();
    const relocationFilter = document.getElementById('relocation-filter').classList.contains('active');
    const remoteFilter = document.getElementById('remote-filter').classList.contains('active');

    const filteredData = data.filter(person => {
      return (
        (locationValue === '' || person.location.toLowerCase() === locationValue) &&
        (teamValue === '' || person.team.toLowerCase() === teamValue) &&
        (!relocationFilter || person.interestedInRelocation) &&
        (!remoteFilter || person.interestedInRemote)
      );
    });

    populateDirectory(filteredData);
  });
}

// Toggle filter buttons
function toggleFilterButton(buttonId) {
  const button = document.getElementById(buttonId);
  button.addEventListener('click', () => {
    button.classList.toggle('active');
    filterData();
  });
}

// Initial loading of data
fetchCSVData().then(data => {
  populateDirectory(data);
  populateDropdownOptions(data);
  toggleFilterButton('relocation-filter');
  toggleFilterButton('remote-filter');

  // Add event listeners for dropdown changes
  document.getElementById('location-dropdown').addEventListener('change', filterData);
  document.getElementById('team-dropdown').addEventListener('change', filterData);
});