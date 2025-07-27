// Super User-Friendly GLO Introduction UI with Table-First Design
if (typeof GLOIntroductionMatcher !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        class GLOIntroductionUI {
            constructor() {
                this.matcher = new GLOIntroductionMatcher();
                this.currentMember = null;
                this.filteredMembers = [];
                this.currentView = 'upload';
                this.initializeUI();
            }

            initializeUI() {
                this.createHeader();
                this.createUploadSection();
                this.createMemberTable();
                this.createMemberProfile();
                this.createResultsSection();
                this.bindEvents();
            }

            createHeader() {
                const container = document.querySelector('.container');
                const headerHTML = `
                    <div class="app-header">
                        <div class="header-content">
                            <div class="logo-section">
                                <h1>🤝 GLO Introduction Engine</h1>
                                <p>AI-Powered Matchmaking for High-Value Connections</p>
                            </div>
                            <div class="header-stats" id="headerStats" style="display:none;">
                                <div class="stat-card">
                                    <span class="stat-number" id="totalMembers">0</span>
                                    <span class="stat-label">Total Members</span>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-number" id="highTractionCount">0</span>
                                    <span class="stat-label">High Traction</span>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-number" id="investorCount">0</span>
                                    <span class="stat-label">Investors</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.innerHTML = headerHTML;
            }

            createUploadSection() {
                const container = document.querySelector('.container');
                const uploadHTML = `
                    <div id="upload-section" class="upload-section">
                        <div class="upload-card">
                            <div class="upload-icon">📊</div>
                            <h2>Upload GLO Members Data</h2>
                            <p>Upload your CSV export from Airtable to start generating AI-powered introductions</p>
                            <div class="upload-area" onclick="document.getElementById('csvFileInput').click()">
                                <input type="file" id="csvFileInput" accept=".csv" style="display: none;">
                                <div class="upload-placeholder">
                                    <span class="upload-icon-small">📁</span>
                                    <p>Drag & drop your CSV file here or click to browse</p>
                                </div>
                            </div>
                            <div id="uploadStatus" class="upload-status"></div>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', uploadHTML);
            }

            createMemberTable() {
                const container = document.querySelector('.container');
                const tableHTML = `
                    <div id="member-dashboard" style="display:none;">
                        <div class="dashboard-header">
                            <h2>Member Dashboard</h2>
                            <div class="dashboard-actions">
                                <button id="backToUpload" class="action-btn secondary">
                                    ← Back to Upload
                                </button>
                            </div>
                        </div>

                        <div class="filters-panel">
                            <div class="search-section">
                                <div class="search-box">
                                    <input type="text" id="memberSearch" placeholder="🔍 Search by name, company, industry..." class="search-input">
                                    <button id="clearSearch" class="clear-btn">Clear</button>
                                </div>
                            </div>
                            
                            <div class="filter-section">
                                <select id="stageFilter" class="filter-select">
                                    <option value="">All Stages</option>
                                    <option value="Pre-Seed">Pre-Seed</option>
                                    <option value="Seed">Seed</option>
                                    <option value="Series A">Series A</option>
                                    <option value="Series B">Series B</option>
                                    <option value="Series B+">Series B+</option>
                                </select>
                                
                                <select id="industryFilter" class="filter-select">
                                    <option value="">All Industries</option>
                                    <option value="AI & ML">AI & ML</option>
                                    <option value="B2B Saas">B2B SaaS</option>
                                    <option value="Fintech">Fintech</option>
                                    <option value="D2C Consumer">D2C Consumer</option>
                                    <option value="Ecom">E-commerce</option>
                                </select>
                                
                                <select id="tractionFilter" class="filter-select">
                                    <option value="">All Traction Levels</option>
                                    <option value="high">High Traction ($1M+)</option>
                                    <option value="medium">Medium Traction ($100K+)</option>
                                    <option value="early">Early Stage</option>
                                </select>
                                
                                <select id="typeFilter" class="filter-select">
                                    <option value="">All Types</option>
                                    <option value="founder">Founders</option>
                                    <option value="investor">Investors</option>
                                    <option value="service">Service Providers</option>
                                </select>
                            </div>
                        </div>

                        <div class="table-info">
                            <span id="memberCount" class="member-count">0 members</span>
                            <span class="table-help">💡 Click any member name to view detailed profile and generate matches</span>
                        </div>

                        <div class="members-table-container">
                            <table class="members-table" id="membersTable">
                                <thead>
                                    <tr>
                                        <th class="sortable" data-column="name">
                                            Name <span class="sort-icon">↕️</span>
                                        </th>
                                        <th class="sortable" data-column="company">
                                            Company <span class="sort-icon">↕️</span>
                                        </th>
                                        <th class="sortable" data-column="role">
                                            Role <span class="sort-icon">↕️</span>
                                        </th>
                                        <th class="sortable" data-column="stage">
                                            Stage <span class="sort-icon">↕️</span>
                                        </th>
                                        <th class="sortable" data-column="industry">
                                            Industry <span class="sort-icon">↕️</span>
                                        </th>
                                        <th class="sortable" data-column="traction">
                                            Traction <span class="sort-icon">↕️</span>
                                        </th>
                                        <th class="sortable" data-column="location">
                                            Location <span class="sort-icon">↕️</span>
                                        </th>
                                        <th>Network</th>
                                        <th>Commission</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="membersTableBody">
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', tableHTML);
            }

            createMemberProfile() {
                const container = document.querySelector('.container');
                const profileHTML = `
                    <div id="member-profile" style="display:none;">
                        <div class="profile-header">
                            <button id="backToMembers" class="action-btn secondary">
                                ← Back to Members
                            </button>
                            <h2 id="profileName">Member Profile</h2>
                            <button id="generateMatchesBtn" class="action-btn primary large">
                                🎯 Generate Matches
                            </button>
                        </div>
                        
                        <div class="profile-content">
                            <div class="profile-grid">
                                <div class="profile-section">
                                    <h3>🏢 Company Information</h3>
                                    <div class="info-grid" id="companyInfo">
                                    </div>
                                </div>
                                
                                <div class="profile-section">
                                    <h3>📊 Metrics & Scores</h3>
                                    <div class="metrics-grid" id="metricsInfo">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="profile-section full-width">
                                <h3>🎯 Goals & Capabilities</h3>
                                <div class="goals-grid" id="goalsInfo">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', profileHTML);
            }

            createResultsSection() {
                const container = document.querySelector('.container');
                const resultsHTML = `
                    <div id="results-section" style="display:none;">
                        <div class="results-header">
                            <button id="backToProfile" class="action-btn secondary">
                                ← Back to Profile
                            </button>
                            <h2>Match Results</h2>
                            <div class="results-summary" id="resultsSummary">
                            </div>
                        </div>
                        
                        <div class="results-tabs">
                            <button class="tab-btn active" data-tab="all">All Matches</button>
                            <button class="tab-btn" data-tab="founders">Founders</button>
                            <button class="tab-btn" data-tab="investors">Investors</button>
                            <button class="tab-btn" data-tab="gtm">GTM Partners</button>
                            <button class="tab-btn" data-tab="services">Service Providers</button>
                        </div>
                        
                        <div class="matches-container">
                            <div class="matches-table-container">
                                <table class="matches-table" id="matchesTable">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Company</th>
                                            <th>Match Score</th>
                                            <th>Commission</th>
                                            <th>Rationale</th>
                                            <th>Next Steps</th>
                                            <th>Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody id="matchesTableBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', resultsHTML);
            }

            async handleFileUpload(event) {
                const file = event.target.files[0];
                if (!file) return;

                const status = document.getElementById('uploadStatus');
                status.innerHTML = '<div class="loading">📊 Analyzing CSV data...</div>';

                try {
                    const csvText = await file.text();
                    const memberCount = this.matcher.parseMembers(csvText);
                    
                    if (memberCount > 0) {
                        status.innerHTML = `<div class="success">✅ Successfully loaded ${memberCount} members</div>`;
                        this.filteredMembers = this.matcher.getAllMembers();
                        this.displayMembers();
                        this.updateHeaderStats();
                        this.currentView = 'members';
                        this.showView('members');
                    } else {
                        status.innerHTML = '<div class="error">❌ No valid members found in CSV</div>';
                    }
                } catch (error) {
                    status.innerHTML = `<div class="error">❌ Error reading file: ${error.message}</div>`;
                    console.error('Upload error:', error);
                }
            }

            displayMembers() {
                const tableBody = document.getElementById('membersTableBody');
                const countElement = document.getElementById('memberCount');
                countElement.textContent = `${this.filteredMembers.length} members`;
                
                let html = '';
                
                this.filteredMembers.forEach((member, index) => {
                    const profile = this.matcher.analyzeMemberProfile(member);
                    const name = profile.name;
                    const company = profile.company;
                    const role = profile.role;
                    const stage = profile.stage;
                    const industry = profile.industry;
                    const location = profile.location;
                    
                    const tractionBadge = this.getTractionBadge(profile);
                    const networkScore = profile.networkValue;
                    const commissionScore = profile.commissionPotential;
                    
                    html += `
                        <tr class="member-row" data-member-index="${index}">
                            <td class="name-cell">
                                <button class="name-btn" onclick="gloUI.showMemberProfile(${index})">${name}</button>
                            </td>
                            <td class="company-cell">${company}</td>
                            <td class="role-cell">${role}</td>
                            <td class="stage-cell">
                                <span class="stage-badge">${stage}</span>
                            </td>
                            <td class="industry-cell">
                                <span class="industry-badge">${industry}</span>
                            </td>
                            <td class="traction-cell">${tractionBadge}</td>
                            <td class="location-cell">${location}</td>
                            <td class="score-cell">
                                <div class="score-bar">
                                    <div class="score-fill" style="width: ${networkScore}%"></div>
                                    <span class="score-text">${networkScore}</span>
                                </div>
                            </td>
                            <td class="score-cell">
                                <div class="score-bar commission">
                                    <div class="score-fill" style="width: ${commissionScore}%"></div>
                                    <span class="score-text">${commissionScore}</span>
                                </div>
                            </td>
                            <td class="actions-cell">
                                <button class="action-btn small primary" onclick="gloUI.showMemberProfile(${index})">
                                    View Profile
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                tableBody.innerHTML = html;
            }

            getTractionBadge(profile) {
                const mrr = profile.mrr.toLowerCase();
                const arr = profile.arr.toLowerCase();
                
                if (mrr.includes('$1m') || mrr.includes('$5m') || mrr.includes('$10m') || 
                    arr.includes('$1m') || arr.includes('$5m') || arr.includes('$10m')) {
                    return '<span class="traction-badge high">🚀 $1M+</span>';
                } else if (mrr.includes('$100k') || mrr.includes('$250k') || 
                          arr.includes('$100k') || arr.includes('$250k')) {
                    return '<span class="traction-badge medium">📈 $100K+</span>';
                } else if (mrr || arr) {
                    return '<span class="traction-badge early">🌱 Early</span>';
                } else {
                    return '<span class="traction-badge unknown">❓ Unknown</span>';
                }
            }

            showMemberProfile(index) {
                this.currentMember = this.filteredMembers[index];
                this.currentView = 'profile';
                this.showView('profile');
                this.populateMemberProfile();
            }

            populateMemberProfile() {
                const profile = this.matcher.analyzeMemberProfile(this.currentMember);
                
                document.getElementById('profileName').textContent = profile.name;
                
                const companyInfo = document.getElementById('companyInfo');
                companyInfo.innerHTML = `
                    <div class="info-item">
                        <span class="info-label">Company:</span>
                        <span class="info-value">${profile.company}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Role:</span>
                        <span class="info-value">${profile.role}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Industry:</span>
                        <span class="info-value">${profile.industry}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Stage:</span>
                        <span class="info-value">${profile.stage}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Location:</span>
                        <span class="info-value">${profile.location}</span>
                    </div>
                `;
                
                const metricsInfo = document.getElementById('metricsInfo');
                metricsInfo.innerHTML = `
                    <div class="metric-item">
                        <span class="metric-label">MRR:</span>
                        <span class="metric-value">${profile.mrr || 'Not disclosed'}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">ARR:</span>
                        <span class="metric-value">${profile.arr || 'Not disclosed'}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Traction Score:</span>
                        <div class="score-display">
                            <div class="score-bar small">
                                <div class="score-fill" style="width: ${profile.tractionScore}%"></div>
                            </div>
                            <span class="score-number">${profile.tractionScore}/100</span>
                        </div>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Network Value:</span>
                        <div class="score-display">
                            <div class="score-bar small">
                                <div class="score-fill" style="width: ${profile.networkValue}%"></div>
                            </div>
                            <span class="score-number">${profile.networkValue}/100</span>
                        </div>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Commission Potential:</span>
                        <div class="score-display">
                            <div class="score-bar small commission">
                                <div class="score-fill" style="width: ${profile.commissionPotential}%"></div>
                            </div>
                            <span class="score-number">${profile.commissionPotential}/100</span>
                        </div>
                    </div>
                `;
                
                const goalsInfo = document.getElementById('goalsInfo');
                goalsInfo.innerHTML = `
                    <div class="goal-item">
                        <span class="goal-label">Professional Goals:</span>
                        <span class="goal-value">${profile.goals.professional || 'Not specified'}</span>
                    </div>
                    <div class="goal-item">
                        <span class="goal-label">Company Goals:</span>
                        <span class="goal-value">${profile.goals.company || 'Not specified'}</span>
                    </div>
                    <div class="goal-item">
                        <span class="goal-label">Key Needs:</span>
                        <span class="goal-value">${profile.needs.join(', ') || 'None identified'}</span>
                    </div>
                    <div class="goal-item">
                        <span class="goal-label">Strengths:</span>
                        <span class="goal-value">${profile.strengths.join(', ') || 'None identified'}</span>
                    </div>
                `;
            }

            generateMatches() {
                if (!this.currentMember) return;
                
                try {
                    const introductions = this.matcher.generateIntroductions(this.currentMember);
                    console.log('Generated introductions:', introductions);
                    this.currentView = 'results';
                    this.showView('results');
                    this.displayMatchResults(introductions);
                } catch (error) {
                    console.error('Error generating matches:', error);
                    alert('Error generating matches. Please try again.');
                }
            }

            displayMatchResults(introductions) {
                const summary = document.getElementById('resultsSummary');
                const tableBody = document.getElementById('matchesTableBody');
                
                if (!introductions || introductions.length === 0) {
                    summary.innerHTML = '<div class="summary-stats"><span class="summary-stat">No matches found</span></div>';
                    tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No matches found for this member.</td></tr>';
                    return;
                }
                
                const avgScore = introductions.length > 0 ? Math.round(introductions.reduce((sum, intro) => sum + (intro.score || 0), 0) / introductions.length) : 0;
                const avgCommission = introductions.length > 0 ? Math.round(introductions.reduce((sum, intro) => sum + (intro.commissionPotential || 0), 0) / introductions.length) : 0;
                
                summary.innerHTML = `
                    <div class="summary-stats">
                        <span class="summary-stat">${introductions.length} matches found</span>
                        <span class="summary-stat">Avg Score: ${avgScore}</span>
                        <span class="summary-stat">Commission Potential: ${avgCommission}%</span>
                    </div>
                `;
                
                let html = '';
                introductions.forEach((intro, index) => {
                    const categoryBadge = this.getCategoryBadge(intro.category);
                    
                    html += `
                        <tr class="match-row">
                            <td class="rank-cell">
                                <span class="rank-badge">#${index + 1}</span>
                            </td>
                            <td class="name-cell">
                                <strong>${intro.name}</strong>
                            </td>
                            <td class="category-cell">
                                ${categoryBadge}
                            </td>
                            <td class="company-cell">${intro.company}</td>
                            <td class="score-cell">
                                <div class="score-bar">
                                    <div class="score-fill" style="width: ${intro.score}%"></div>
                                    <span class="score-text">${intro.score}</span>
                                </div>
                            </td>
                            <td class="commission-cell">
                                <div class="score-bar commission">
                                    <div class="score-fill" style="width: ${intro.commissionPotential}%"></div>
                                    <span class="score-text">${intro.commissionPotential}</span>
                                </div>
                            </td>
                            <td class="rationale-cell">
                                <div class="expandable-text">
                                    <span class="text-preview">${intro.rationale.substring(0, 100)}...</span>
                                    <button class="expand-btn" onclick="this.parentElement.classList.toggle('expanded')">Show More</button>
                                    <span class="full-text">${intro.rationale}</span>
                                </div>
                            </td>
                            <td class="steps-cell">
                                <ul class="steps-list">
                                    ${intro.suggestedNextSteps.map(step => `<li>${step}</li>`).join('')}
                                </ul>
                            </td>
                            <td class="contact-cell">
                                <div class="contact-actions">
                                    <a href="mailto:${intro.email}" class="contact-btn email">📧</a>
                                    <a href="${intro.linkedin}" target="_blank" class="contact-btn linkedin">💼</a>
                                </div>
                            </td>
                        </tr>
                    `;
                });
                
                tableBody.innerHTML = html;
            }

            getCategoryBadge(category) {
                const badges = {
                    'Fellow High-Traction Founders': '<span class="category-badge founder">👥 Founder</span>',
                    'Active Investors': '<span class="category-badge investor">💰 Investor</span>',
                    'Strategic GTM Partners': '<span class="category-badge gtm">🚀 GTM</span>',
                    'GLO-Vetted Product & Service Providers': '<span class="category-badge service">🛠️ Service</span>',
                    // Fallback for old category names
                    'founder': '<span class="category-badge founder">👥 Founder</span>',
                    'investor': '<span class="category-badge investor">💰 Investor</span>',
                    'gtm': '<span class="category-badge gtm">🚀 GTM</span>',
                    'service': '<span class="category-badge service">🛠️ Service</span>'
                };
                return badges[category] || '<span class="category-badge">Other</span>';
            }

            showView(view) {
                document.getElementById('upload-section').style.display = 'none';
                document.getElementById('member-dashboard').style.display = 'none';
                document.getElementById('member-profile').style.display = 'none';
                document.getElementById('results-section').style.display = 'none';
                
                switch(view) {
                    case 'upload':
                        document.getElementById('upload-section').style.display = 'block';
                        document.getElementById('headerStats').style.display = 'none';
                        break;
                    case 'members':
                        document.getElementById('member-dashboard').style.display = 'block';
                        document.getElementById('headerStats').style.display = 'flex';
                        break;
                    case 'profile':
                        document.getElementById('member-profile').style.display = 'block';
                        document.getElementById('headerStats').style.display = 'flex';
                        break;
                    case 'results':
                        document.getElementById('results-section').style.display = 'block';
                        document.getElementById('headerStats').style.display = 'flex';
                        break;
                }
            }

            updateHeaderStats() {
                const members = this.matcher.getAllMembers();
                const highTraction = members.filter(m => this.isHighTraction(m)).length;
                const investors = members.filter(m => this.isInvestor(m)).length;
                
                document.getElementById('totalMembers').textContent = members.length;
                document.getElementById('highTractionCount').textContent = highTraction;
                document.getElementById('investorCount').textContent = investors;
            }

            isHighTraction(member) {
                const mrr = (member['Current MRR'] || '').toLowerCase();
                const arr = (member['Projected ARR'] || '').toLowerCase();
                return mrr.includes('$1m') || mrr.includes('$5m') || mrr.includes('$10m') ||
                       arr.includes('$1m') || arr.includes('$5m') || arr.includes('$10m');
            }

            isInvestor(member) {
                const role = (member['Role'] || '').toLowerCase();
                const type = (member['Investor Type'] || '').toLowerCase();
                return role.includes('investor') || role.includes('vc') || type.includes('investor');
            }

            bindEvents() {
                document.getElementById('csvFileInput').addEventListener('change', (e) => this.handleFileUpload(e));
                
                document.getElementById('backToUpload').addEventListener('click', () => {
                    this.currentView = 'upload';
                    this.showView('upload');
                });
                document.getElementById('backToMembers').addEventListener('click', () => {
                    this.currentView = 'members';
                    this.showView('members');
                });
                document.getElementById('backToProfile').addEventListener('click', () => {
                    this.currentView = 'profile';
                    this.showView('profile');
                });
                
                document.getElementById('generateMatchesBtn').addEventListener('click', () => this.generateMatches());
            }
        }

        window.gloUI = new GLOIntroductionUI();
    });
}
