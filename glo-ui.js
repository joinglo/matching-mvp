// GLO Introduction UI System
class GLOIntroductionUI {
    constructor() {
        this.matcher = new GLOIntroductionMatcher();
        this.currentMember = null;
        this.initializeUI();
    }

    initializeUI() {
        this.createUploadSection();
        this.createMemberSelection();
        this.createResultsSection();
        this.bindEvents();
    }

    createUploadSection() {
        const container = document.querySelector('.container');
        
        const uploadHTML = `
            <div id="upload-section" class="upload-section">
                <div class="upload-card">
                    <h2>Upload</h2>
                    <input type="file" id="csvFileInput" accept=".csv" style="display: none;">
                    <button id="uploadBtn" class="upload-button">Choose CSV File</button>
                    <div id="uploadStatus" class="upload-status"></div>
                </div>
            </div>
        `;
        
        container.innerHTML = uploadHTML;
    }

    createMemberSelection() {
        const container = document.querySelector('.container');
        
        const selectionHTML = `
            <div id="member-selection" class="member-selection" style="display: none;">
                <h2>Select Member for Introductions</h2>
                <select id="memberSelect" class="member-select">
                    <option value="">Choose a member...</option>
                </select>
                <button id="generateIntrosBtn" class="generate-button" disabled>
                    Generate Best Matches
                </button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', selectionHTML);
    }

    createResultsSection() {
        const container = document.querySelector('.container');
        
        const resultsHTML = `
            <div id="results-section" class="results-section" style="display: none;">
                <div class="results-header">
                    <h2>GLO Introduction Strategy</h2>
                    <div class="member-info" id="memberInfo"></div>
                </div>
                
                <div class="introductions-grid" id="introductionsGrid">
                    <!-- Introductions will be populated here -->
                </div>
                
                <div class="commission-summary" id="commissionSummary">
                    <!-- Commission potential will be shown here -->
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', resultsHTML);
    }

    bindEvents() {
        // File upload
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('csvFileInput').click();
        });

        document.getElementById('csvFileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });

        // Instructions button
        document.getElementById('instructionsBtn').addEventListener('click', () => {
            document.getElementById('instructionsModal').style.display = 'block';
        });

        // Close instructions modal
        document.querySelector('.close-instructions').addEventListener('click', () => {
            document.getElementById('instructionsModal').style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('instructionsModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Change CSV button
        document.getElementById('changeCsvBtn').addEventListener('click', () => {
            this.resetApp();
        });

        // Member selection
        document.getElementById('memberSelect').addEventListener('change', (e) => {
            this.handleMemberSelection(e);
        });

        // Generate introductions
        document.getElementById('generateIntrosBtn').addEventListener('click', () => {
            this.generateIntroductions();
        });
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const status = document.getElementById('uploadStatus');
        status.textContent = 'Loading CSV...';

        try {
            const csvText = await file.text();
            const memberCount = this.matcher.parseMembers(csvText);
            
            if (memberCount > 0) {
                status.textContent = `✓ Loaded ${memberCount} members`;
                this.populateMemberDropdown();
                document.getElementById('member-selection').style.display = 'block';
                document.getElementById('changeCsvBtn').style.display = 'block';
            } else {
                status.textContent = '❌ No valid members found in CSV';
            }
        } catch (error) {
            status.textContent = '❌ Error reading file: ' + error.message;
        }
    }

    populateMemberDropdown() {
        const select = document.getElementById('memberSelect');
        const members = this.matcher.getAllMembers();
        
        // Clear existing options
        select.innerHTML = '<option value="">Choose a member...</option>';
        
        // Add member options
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = `${member['First Name']}_${member['Last Name']}`;
            option.textContent = `${member['First Name']} ${member['Last Name']} - ${member['Company Website'] || 'Company TBD'}`;
            select.appendChild(option);
        });
    }

    handleMemberSelection(event) {
        const selectedValue = event.target.value;
        const generateBtn = document.getElementById('generateIntrosBtn');
        
        if (selectedValue) {
            const members = this.matcher.getAllMembers();
            this.currentMember = members.find(m => 
                `${m['First Name']}_${m['Last Name']}` === selectedValue
            );
            generateBtn.disabled = false;
        } else {
            this.currentMember = null;
            generateBtn.disabled = true;
        }
    }

    generateIntroductions() {
        if (!this.currentMember) return;

        const introductions = this.matcher.generateIntroductions(this.currentMember);
        this.displayIntroductions(introductions);
        this.displayMemberInfo();
        this.displayCommissionSummary(introductions);
        
        document.getElementById('results-section').style.display = 'block';
    }

    displayMemberInfo() {
        const member = this.currentMember;
        const infoDiv = document.getElementById('memberInfo');
        
        infoDiv.innerHTML = `
            <div class="member-card">
                <h3>${member['First Name']} ${member['Last Name']}</h3>
                <p><strong>Company:</strong> ${member['Company Website'] || 'TBD'}</p>
                <p><strong>Industry:</strong> ${member['Industry'] || 'TBD'}</p>
                <p><strong>Stage:</strong> ${member['Company Stage'] || 'TBD'}</p>
                <p><strong>Goals:</strong> ${member['Professional Goals'] || member['Company Goals'] || 'TBD'}</p>
            </div>
        `;
    }

    displayIntroductions(introductions) {
        const grid = document.getElementById('introductionsGrid');
        
        // Group by category
        const categories = {
            'Fellow High-Traction Founders': [],
            'Active Investors': [],
            'Strategic GTM Partners': [],
            'GLO-Vetted Product & Service Providers': []
        };
        
        introductions.forEach(intro => {
            categories[intro.category].push(intro);
        });
        
        let html = '';
        
        Object.entries(categories).forEach(([category, intros]) => {
            if (intros.length > 0) {
                html += `
                    <div class="category-section">
                        <h3>${category} (${intros.length})</h3>
                        <div class="introductions-list">
                `;
                
                intros.forEach(intro => {
                    html += `
                        <div class="introduction-card">
                            <div class="intro-header">
                                <h4>${intro.contact}</h4>
                                <span class="intro-id">#${intro.id}</span>
                            </div>
                            <p class="intro-company">${intro.company}</p>
                            <p class="intro-rationale"><strong>Why:</strong> ${intro.rationale}</p>
                            <p class="intro-value"><strong>Value:</strong> ${intro.value}</p>
                            <div class="intro-actions">
                                ${intro.email ? `<a href="mailto:${intro.email}" class="action-btn">Email</a>` : ''}
                                ${intro.linkedin ? `<a href="${intro.linkedin}" target="_blank" class="action-btn">LinkedIn</a>` : ''}
                            </div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
        });
        
        grid.innerHTML = html;
    }

    displayCommissionSummary(introductions) {
        const summary = document.getElementById('commissionSummary');
        
        const commissionTypes = {
            'Investment Commission': 0,
            'GTM Commission': 0,
            'Partnership Revenue': 0,
            'Referral Fees': 0
        };
        
        introductions.forEach(intro => {
            if (intro.value.includes('investment')) commissionTypes['Investment Commission']++;
            if (intro.value.includes('GTM')) commissionTypes['GTM Commission']++;
            if (intro.value.includes('partnership')) commissionTypes['Partnership Revenue']++;
            if (intro.value.includes('referral')) commissionTypes['Referral Fees']++;
        });
        
        let html = '<h3>Commission Potential Summary</h3><div class="commission-grid">';
        
        Object.entries(commissionTypes).forEach(([type, count]) => {
            html += `
                <div class="commission-item">
                    <span class="commission-type">${type}</span>
                    <span class="commission-count">${count} opportunities</span>
                </div>
            `;
        });
        
        html += '</div>';
        summary.innerHTML = html;
    }

    resetApp() {
        // Reset the matcher
        this.matcher = new GLOIntroductionMatcher();
        this.currentMember = null;
        
        // Reset UI elements
        document.getElementById('upload-section').style.display = 'block';
        document.getElementById('member-selection').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('changeCsvBtn').style.display = 'none';
        
        // Reset file input
        document.getElementById('csvFileInput').value = '';
        document.getElementById('uploadStatus').textContent = '';
        
        // Reset member selection
        document.getElementById('memberSelect').innerHTML = '<option value="">Choose a member...</option>';
        document.getElementById('generateIntrosBtn').disabled = true;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GLOIntroductionUI();
}); 