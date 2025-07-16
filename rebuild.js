// Minimal rebuilt member matcher
let members = [];

const csvInput = document.getElementById('csvFileInput');
const startBtn = document.getElementById('startMatchingBtn');
const uploadStatus = document.getElementById('uploadStatus');
const resultsDiv = document.getElementById('results');

csvInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    uploadStatus.textContent = 'No file selected.';
    startBtn.disabled = true;
    return;
  }
  uploadStatus.textContent = 'Loading...';
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      members = results.data.filter(m => m['First Name'] && m['Last Name']);
      if (members.length === 0) {
        uploadStatus.textContent = 'No valid members found in CSV.';
        startBtn.disabled = true;
      } else {
        uploadStatus.textContent = `Loaded ${members.length} members.`;
        startBtn.disabled = false;
      }
    },
    error: function(err) {
      uploadStatus.textContent = 'Error parsing CSV: ' + err.message;
      startBtn.disabled = true;
    }
  });
});

startBtn.addEventListener('click', () => {
  if (members.length === 0) {
    resultsDiv.innerHTML = '<div class="error">No members loaded.</div>';
    return;
  }
  // Simple matching: show all members in a list
  let html = `<h2>Members (${members.length})</h2><ul>`;
  for (const m of members) {
    html += `<li>${m['First Name']} ${m['Last Name']} (${m['Email'] || 'No email'})</li>`;
  }
  html += '</ul>';
  // Show a simple match for each member (just pair with next)
  html += '<h2>Sample Matches</h2><ul>';
  for (let i = 0; i < members.length - 1; i += 2) {
    const a = members[i];
    const b = members[i+1];
    html += `<li>${a['First Name']} ${a['Last Name']} ↔ ${b['First Name']} ${b['Last Name']}</li>`;
  }
  if (members.length % 2 === 1) {
    const last = members[members.length-1];
    html += `<li>${last['First Name']} ${last['Last Name']} (no match)</li>`;
  }
  html += '</ul>';
  resultsDiv.innerHTML = html;
}); 