// Member Matcher Application
class MemberMatcher {
    constructor() {
        this.members = [];
        this.matches = [];
        this.introducedMatches = this.loadIntroducedMatches();
        this.currentPage = 0;
        this.matchesPerPage = 4;
        this.displayedMatches = 0;
        
        // Fairness controls
        this.maxMatchesPerMember = 3; // quota per cycle
        this.appearanceCount = {}; // memberId -> count
    }

    loadIntroducedMatches() {
        try {
            return JSON.parse(localStorage.getItem('introducedMatches') || '[]');
        } catch {
            return [];
        }
    }
    saveIntroducedMatches() {
        localStorage.setItem('introducedMatches', JSON.stringify(this.introducedMatches));
    }

    initializeApp() {
        this.initializeEventListeners();
        this.initializeModal();
        this.generateMatches();
        this.setupInfiniteScroll();
    }

    setupInfiniteScroll() {
        const container = document.getElementById('matchesContainer');
        // Use window scroll if container is not scrollable
        const scrollTarget = container;
        let loading = false;
        window.addEventListener('scroll', () => {
            if (loading) return;
            // Get the bottom of the matches container relative to the viewport
            const rect = container.getBoundingClientRect();
            // If the bottom is within 200px of the viewport bottom, load more
            if (rect.bottom - window.innerHeight < 200) {
                if (this.displayedMatches < this.matches.length) {
                    loading = true;
                    this.loadMoreMatches();
                    setTimeout(() => { loading = false; }, 200); // Prevent rapid firing
                }
            }
        });
    }

    initializeEventListeners() {
        // Show more matches button
        const showMoreBtn = document.getElementById('showMoreMatches');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                this.loadMoreMatches();
            });
        }
    }

    initializeModal() {
        const modal = document.getElementById('aboutModal');
        const closeBtn = modal.querySelector('.close');
        
        // Close modal when clicking X
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const members = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = this.parseCSVLine(lines[i]);
            if (values.length < headers.length) continue;
            
            const member = {};
            headers.forEach((header, index) => {
                member[header] = values[index] || '';
            });
            
            // Include members with at least a name
            if (member['First Name'] && member['Last Name']) {
                members.push(member);
            }
        }
        
        return members;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    generateMatches() {
        this.showLoading();
        // Reduce loading time for better UX
        setTimeout(() => {
            const rawMatches = this.findMatches(); // all possible good matches
            this.matches = this.applyMemberQuota(rawMatches); // enforce fairness
            this.hideLoading();
            this.displayMatches();
        }, 300); // Reduced from 800ms to 300ms
    }

    findMatches() {
        const matches = [];
        const processedPairs = new Set();
        
        // Optimize: Only create pairs for members with meaningful data
        const validMembers = this.members.filter(member => 
            member['First Name'] && member['Last Name'] && 
            (member['Professional Goals'] || member['Company Goals'] || member['Industry'])
        );
        
        // If we have too many members, limit to top 100 for performance
        const membersToProcess = validMembers.length > 100 ? validMembers.slice(0, 100) : validMembers;
        
        for (let i = 0; i < membersToProcess.length; i++) {
            for (let j = i + 1; j < membersToProcess.length; j++) {
                const member1 = membersToProcess[i];
                const member2 = membersToProcess[j];
                
                // Skip if same company
                if (this.getCompany(member1) === this.getCompany(member2) && 
                    this.getCompany(member1) !== '') {
                    continue;
                }
                
                const pairKey = `${i}-${j}`;
                if (processedPairs.has(pairKey)) continue;
                processedPairs.add(pairKey);
                
                const matchScore = this.calculateMatchScore(member1, member2);
                
                // Only include matches with decent scores for better performance
                if (matchScore >= 0.1) {
                    matches.push({
                        member1,
                        member2,
                        score: matchScore,
                        explanation: this.generateMatchExplanation(member1, member2, matchScore)
                    });
                }
            }
        }
        
        // Sort by score descending and limit to top 200 matches for performance
        return matches.sort((a, b) => b.score - a.score).slice(0, 200);
    }

    calculateMatchScore(member1, member2) {
        let score = 0;
        let factors = 0;
        
        // Goal complementarity (40% weight)
        const goalScore = this.calculateGoalComplementarity(member1, member2);
        score += goalScore * 0.4;
        factors++;
        
        // Industry alignment (30% weight)
        const industryScore = this.calculateIndustryAlignment(member1, member2);
        score += industryScore * 0.3;
        factors++;
        
        // Role complementarity (20% weight)
        const roleScore = this.calculateRoleComplementarity(member1, member2);
        score += roleScore * 0.2;
        factors++;
        
        // Location proximity (10% weight)
        const locationScore = this.calculateLocationProximity(member1, member2);
        score += locationScore * 0.1;
        factors++;
        
        return factors > 0 ? score / factors : 0;
    }

    calculateGoalComplementarity(member1, member2) {
        const goals1 = this.extractGoals(member1);
        const goals2 = this.extractGoals(member2);
        
        // If no goals, give a neutral score instead of 0
        if (goals1.length === 0 && goals2.length === 0) return 0.6;
        if (goals1.length === 0 || goals2.length === 0) return 0.5;
        
        // Check for complementary goals (case insensitive)
        const complementaryPairs = [
            ['fundraising', 'investor'],
            ['sales growth', 'strategic partners/gtm'],
            ['strategic partners/gtm', 'sales growth'],
            ['user growth', 'brand awareness'],
            ['hiring', 'network'],
            ['brand awareness', 'user growth'],
            ['network', 'hiring'],
            ['investor', 'fundraising'],
            ['Fundraising', 'Investor'],
            ['Sales Growth', 'Strategic Partners/GTM'],
            ['User Growth', 'Brand Awareness'],
            ['Hiring', 'Network']
        ];
        
        let maxScore = 0;
        for (const [goal1, goal2] of complementaryPairs) {
            if (goals1.includes(goal1) && goals2.includes(goal2)) {
                maxScore = Math.max(maxScore, 1.0);
            }
            if (goals1.includes(goal2) && goals2.includes(goal1)) {
                maxScore = Math.max(maxScore, 1.0);
            }
        }
        
        // Also check for goal overlap (same goals can be good for collaboration)
        const overlap = goals1.filter(goal => goals2.includes(goal));
        if (overlap.length > 0) {
            maxScore = Math.max(maxScore, 0.7);
        }
        
        return maxScore;
    }

    calculateIndustryAlignment(member1, member2) {
        const industry1 = member1['Industry'] || '';
        const industry2 = member2['Industry'] || '';
        
        if (!industry1 || !industry2) return 0.5;
        
        const industries1 = industry1.toLowerCase().split(',').map(i => i.trim());
        const industries2 = industry2.toLowerCase().split(',').map(i => i.trim());
        
        // Check for exact matches
        const exactMatches = industries1.filter(ind => industries2.includes(ind));
        if (exactMatches.length > 0) return 1.0;
        
        // Check for related industries
        const relatedIndustries = [
            ['tech', 'software', 'saas', 'ai', 'machine learning'],
            ['finance', 'fintech', 'banking', 'investment'],
            ['healthcare', 'health tech', 'medical', 'biotech'],
            ['ecommerce', 'retail', 'consumer', 'marketplace'],
            ['education', 'edtech', 'learning', 'training']
        ];
        
        for (const group of relatedIndustries) {
            const hasIndustry1 = industries1.some(ind => group.includes(ind));
            const hasIndustry2 = industries2.some(ind => group.includes(ind));
            if (hasIndustry1 && hasIndustry2) return 0.8;
        }
        
        return 0.3;
    }

    calculateRoleComplementarity(member1, member2) {
        const role1 = (member1['Role'] || '').toLowerCase();
        const role2 = (member2['Role'] || '').toLowerCase();
        
        if (!role1 || !role2) return 0.5;
        
        // Founder-Investor complementarity
        if ((role1.includes('founder') || role1.includes('ceo')) && role2.includes('investor')) {
            return 1.0;
        }
        if ((role2.includes('founder') || role2.includes('ceo')) && role1.includes('investor')) {
            return 1.0;
        }
        
        // Same role can be good for collaboration
        if (role1 === role2) return 0.8;
        
        // Marketing-Sales complementarity
        if ((role1.includes('marketing') && role2.includes('sales')) || 
            (role2.includes('marketing') && role1.includes('sales'))) {
            return 0.9;
        }
        
        return 0.5;
    }

    calculateLocationProximity(member1, member2) {
        const location1 = (member1['Based In'] || '').toLowerCase();
        const location2 = (member2['Based In'] || '').toLowerCase();
        
        if (!location1 || !location2) return 0.5;
        
        // Exact match
        if (location1 === location2) return 1.0;
        
        // Same country/region
        const countries1 = location1.split(',').map(l => l.trim());
        const countries2 = location2.split(',').map(l => l.trim());
        const countryOverlap = countries1.filter(c => countries2.includes(c));
        if (countryOverlap.length > 0) return 0.8;
        
        // Major tech hubs
        const techHubs = ['san francisco', 'new york', 'london', 'berlin', 'singapore', 'toronto', 'austin'];
        const hub1 = techHubs.some(hub => location1.includes(hub));
        const hub2 = techHubs.some(hub => location2.includes(hub));
        if (hub1 && hub2) return 0.7;
        
        return 0.3;
    }

    extractGoals(member) {
        const professionalGoals = member['Professional Goals'] || '';
        const companyGoals = member['Company Goals'] || '';
        const personalGoals = member['Personal Goals'] || '';
        
        const allGoals = `${professionalGoals}, ${companyGoals}, ${personalGoals}`;
        return allGoals.split(',')
            .map(goal => goal.trim().toLowerCase())
            .filter(goal => goal.length > 0);
    }

    getCompany(member) {
        return member['Company'] || member['Company Name'] || '';
    }

    generateMatchExplanation(member1, member2, score) {
        const explanations = [];
        const shownGoals = new Set();
        
        // Goal complementarity explanation
        const goals1 = this.extractGoals(member1);
        const goals2 = this.extractGoals(member2);
        
        const complementaryPairs = [
            ['fundraising', 'investor'],
            ['sales growth', 'strategic partners/gtm'],
            ['user growth', 'brand awareness'],
            ['hiring', 'network'],
        ];
        // Only show each complementary pair once, regardless of direction
        for (const [goal1, goal2] of complementaryPairs) {
            const key = [goal1, goal2].sort().join('-');
            if (!shownGoals.has(key)) {
                if ((goals1.includes(goal1) && goals2.includes(goal2)) || (goals1.includes(goal2) && goals2.includes(goal1))) {
                    explanations.push(`Complementary goals: ${goal1.replace(/\b\w/g, l => l.toUpperCase())} & ${goal2.replace(/\b\w/g, l => l.toUpperCase())}`);
                    shownGoals.add(key);
                }
            }
        }
        // Show shared goals only once
        const sharedGoals = goals1.filter(goal => goals2.includes(goal));
        if (sharedGoals.length > 0) {
            explanations.push(`Shared goals: ${sharedGoals.map(g => g.replace(/\b\w/g, l => l.toUpperCase())).join(', ')}`);
        }
        // Industry alignment explanation (only once)
        const industry1 = member1['Industry'] || '';
        const industry2 = member2['Industry'] || '';
        if (industry1 && industry2) {
            const industries1 = industry1.split(',').map(i => i.trim());
            const industries2 = industry2.split(',').map(i => i.trim());
            const overlap = industries1.filter(ind => industries2.includes(ind));
            if (overlap.length > 0) {
                explanations.push(`Both in: ${overlap.join(', ')}`);
            }
        }
        // Role complementarity explanation (only once)
        const role1 = member1['Role'] || '';
        const role2 = member2['Role'] || '';
        if (role1.includes('Founder') && role2.includes('Investor')) {
            explanations.push(`${member1['First Name']} (${role1}) could benefit from ${member2['First Name']}'s ${role2} perspective`);
        } else if (role2.includes('Founder') && role1.includes('Investor')) {
            explanations.push(`${member2['First Name']} (${role2}) could benefit from ${member1['First Name']}'s ${role1} perspective`);
        }
        // Remove any duplicate explanations
        const uniqueExplanations = Array.from(new Set(explanations));
        return uniqueExplanations.length > 0 ? uniqueExplanations.join('. ') : 'Strong potential for collaboration based on complementary skills and goals.';
    }

    displayMatches() {
        const container = document.getElementById('matchesContainer');
        const paginationControls = document.getElementById('paginationControls');
        
        container.innerHTML = '';
        
        if (this.matches.length === 0) {
            container.innerHTML = `<div class="no-matches"><h3>No matches found</h3></div>`;
            paginationControls.style.display = 'none';
        } else {
            // Show only the first 4 matches initially
            const matchesToShow = this.matches.slice(0, this.matchesPerPage);
            this.displayedMatches = matchesToShow.length;
            
            matchesToShow.forEach((match, index) => {
                const matchId = `${match.member1['First Name']}_${match.member1['Last Name']}__${match.member2['First Name']}_${match.member2['Last Name']}`;
                const matchCard = this.createMatchCard(match, index, matchId);
                if (this.introducedMatches.includes(matchId)) {
                    matchCard.classList.add('intro-checked');
                }
                container.appendChild(matchCard);
            });
            
            // Hide pagination controls for infinite scroll
            paginationControls.style.display = 'none';
        }
        
        document.getElementById('resultsSection').style.display = 'block';
    }

    loadMoreMatches() {
        const container = document.getElementById('matchesContainer');
        const paginationControls = document.getElementById('paginationControls');
        
        const startIndex = this.displayedMatches;
        const endIndex = Math.min(startIndex + this.matchesPerPage, this.matches.length);
        const newMatches = this.matches.slice(startIndex, endIndex);
        
        newMatches.forEach((match, index) => {
            const matchId = `${match.member1['First Name']}_${match.member1['Last Name']}__${match.member2['First Name']}_${match.member2['Last Name']}`;
            const matchCard = this.createMatchCard(match, startIndex + index, matchId);
            if (this.introducedMatches.includes(matchId)) {
                matchCard.classList.add('intro-checked');
            }
            container.appendChild(matchCard);
        });
        
        this.displayedMatches = endIndex;
        
        // Hide pagination if we've shown all matches
        if (this.displayedMatches >= this.matches.length) {
            paginationControls.style.display = 'none';
        }
    }

    // Ensure no member appears in more than maxMatchesPerMember matches
    applyMemberQuota(sortedMatches) {
        const result = [];
        this.appearanceCount = {}; // reset for this cycle
        const getId = (m) => `${m['First Name']}_${m['Last Name']}`;

        for (const match of sortedMatches) {
            const id1 = getId(match.member1);
            const id2 = getId(match.member2);
            const count1 = this.appearanceCount[id1] || 0;
            const count2 = this.appearanceCount[id2] || 0;

            if (count1 < this.maxMatchesPerMember && count2 < this.maxMatchesPerMember) {
                result.push(match);
                this.appearanceCount[id1] = count1 + 1;
                this.appearanceCount[id2] = count2 + 1;
            }
        }
        return result;
    }

    // Helper function to capitalize names
    formatName(name) {
        if (!name) return '';
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    createMatchCard(match, index, matchId) {
        const card = document.createElement('div');
        card.className = 'match-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const member1 = match.member1;
        const member2 = match.member2;

        let label = '';
        if (match.score >= 0.18) label = 'Strong Match';
        else if (match.score >= 0.15) label = 'Good Match';
        else if (match.score >= 0.12) label = 'Potential Match';
        else label = 'Interesting Connection';

        const member1Name = `${this.formatName(member1['First Name'])} ${this.formatName(member1['Last Name'])}`;
        const member2Name = `${this.formatName(member2['First Name'])} ${this.formatName(member2['Last Name'])}`;

        const member1Display = member1['LinkedIn Profile'] ? `<a href="${member1['LinkedIn Profile']}" target="_blank" class="member-name-link"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="linkedin-icon icon-left"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> ${member1Name}</a>` : member1Name;
        const member2Display = member2['LinkedIn Profile'] ? `<a href="${member2['LinkedIn Profile']}" target="_blank" class="member-name-link">${member2Name} <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="linkedin-icon icon-right"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>` : member2Name;

        // Prepare Email intro link
        const email1 = member1['Email'] || member1['email'] || '';
        const email2 = member2['Email'] || member2['email'] || '';
        const introSubject = `Introduction: ${member1Name} 🤝 ${member2Name}`;
        const introBody = `Hi ${member1['First Name']} and ${member2['First Name']},\n\n` +
                         `I wanted to introduce you both because I believe you have complementary goals and could benefit from connecting.\n\n` +
                         `Feel free to continue the conversation directly.\n\nBest regards,\n[Your Name]`;
        let mailtoUrl = '#';
        if (email1 || email2) {
            const emailList = [email1, email2].filter(Boolean).join(',');
            mailtoUrl = `mailto:${emailList}?subject=${encodeURIComponent(introSubject)}&body=${encodeURIComponent(introBody)}`;
        }
        // Create the match card HTML structure
        card.innerHTML = `
            <div class="match-card-header">
                <div class="match-info">
                    <div class="match-names">
                        <h3>
                            ${member1Display} &lt;&gt; ${member2Display}
                        </h3>
                    </div>
                    <div class="match-score" data-score-label="${label}">${label}</div>
                </div>
            </div>
            <div class="match-explanation">
                <div class="explanation-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M15.09 16.05A6.49 6.49 0 0 1 9 12c0-3.59 2.91-6.5 6.5-6.5a6.49 6.49 0 0 1 6.41 7.91L21 15h-3l-1.59-2.95"/><path d="M9 12a6.5 6.5 0 0 0-6.41-7.91L1 9h3l1.59 2.95"/><line x1="12" y1="22" x2="12" y2="18"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
                    Why This Match Works
                </div>
                <div class="explanation-list">
                    ${match.explanation.split('. ').map(reason => reason ? `<div class='explanation-item'>${reason}</div>` : '').join('')}
                </div>
            </div>
            <div class="match-actions">
                <a href="${mailtoUrl}" class="action-button primary-action">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    Intro
                </a>
                <label class="intro-checkbox-label">
                    <input type="checkbox" class="intro-checkbox" data-matchid="${matchId}">
                    <span class="checkbox-text">Introduced</span>
                </label>
            </div>
        `;
        
        // Checkbox logic
        const checkbox = card.querySelector('.intro-checkbox');
        const introduceBtn = card.querySelector('.primary-action');
        
        // Set initial state
        if (this.introducedMatches.includes(matchId)) {
            checkbox.checked = true;
            card.classList.add('intro-checked');
        }
        
        // Auto-check when introduce button is clicked
        introduceBtn.addEventListener('click', () => {
            if (!checkbox.checked) {
                checkbox.checked = true;
                this.introducedMatches.push(matchId);
                this.saveIntroducedMatches();
                card.classList.add('intro-checked');
            }
        });
        
        // Manual checkbox toggle
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (!this.introducedMatches.includes(matchId)) {
                    this.introducedMatches.push(matchId);
                    this.saveIntroducedMatches();
                }
                card.classList.add('intro-checked');
            } else {
                this.introducedMatches = this.introducedMatches.filter(id => id !== matchId);
                this.saveIntroducedMatches();
                card.classList.remove('intro-checked');
            }
        });
        return card;
    }

    showLoading() {
        document.getElementById('loadingSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingSection').style.display = 'none';
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('members.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const matcher = new MemberMatcher();
        matcher.members = matcher.parseCSV(text);
        
        // Call the new initialization method
        matcher.initializeApp();

    } catch (error) {
        console.error("Critical Error: Could not load or parse members.csv.", error);
        alert('Could not load member data. Please check the browser console (F12) for more details.');
    }
}); 
