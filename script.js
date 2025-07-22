// Member Matcher Application
class MemberMatcher {
    constructor() {
        this.members = [];
        this.matches = [];
        this.introducedMatches = this.loadIntroducedMatches();
        this.currentPage = 0;
        this.matchesPerPage = 4;
        this.displayedMatches = 0;
        this.selectedMember = null; // Track selected member for one-at-a-time matching
        
        // Fairness controls
        this.maxMatchesPerMember = 15; // quota per cycle (increased from 10)
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
        this.setupMemberSelection(); // Add member selection setup
        this.setupInfiniteScroll();
    }

    setupInfiniteScroll() {
        const container = document.getElementById('matchesContainer');
        // Use window scroll if container is not scrollable
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

    setupMemberSelection() {
        // Create member selection interface
        const resultsSection = document.getElementById('resultsSection');
        const memberSelectionHTML = `
            <div class="member-selection-section" id="memberSelectionSection">
                <div class="member-selection-card">
                    <h3>Select a Member to Generate Matches</h3>
                    <div class="member-select-container">
                        <select id="memberSelect" class="member-select">
                            <option value="">Choose a member...</option>
                        </select>
                        <button id="generateMatchesBtn" class="generate-matches-btn" disabled>
                            Generate Matches
                        </button>
                    </div>
                    <div class="member-info" id="memberInfo" style="display: none;">
                        <div class="member-details">
                            <h4 id="selectedMemberName"></h4>
                            <p id="selectedMemberCompany"></p>
                            <p id="selectedMemberGoals"></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert before matches container
        resultsSection.insertAdjacentHTML('afterbegin', memberSelectionHTML);
        
        // Populate member dropdown
        this.populateMemberDropdown();
        
        // Add event listeners
        this.initializeMemberSelectionEvents();
    }

    populateMemberDropdown() {
        const memberSelect = document.getElementById('memberSelect');
        const validMembers = this.members.filter(member => 
            member['First Name'] && member['Last Name'] && 
            (member['Professional Goals'] || member['Company Goals'] || member['Industry'])
        );
        
        // Sort members alphabetically
        validMembers.sort((a, b) => {
            const nameA = `${a['First Name']} ${a['Last Name']}`;
            const nameB = `${b['First Name']} ${b['Last Name']}`;
            return nameA.localeCompare(nameB);
        });
        
        validMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = `${member['First Name']}_${member['Last Name']}`;
            option.textContent = `${member['First Name']} ${member['Last Name']} - ${this.getCompany(member) || 'No Company'}`;
            memberSelect.appendChild(option);
        });
        
        // Auto-select the first member if available
        if (validMembers.length > 0) {
            memberSelect.value = `${validMembers[0]['First Name']}_${validMembers[0]['Last Name']}`;
            this.selectedMember = validMembers[0];
            this.displaySelectedMemberInfo();
            document.getElementById('generateMatchesBtn').disabled = false;
        }
    }

    initializeMemberSelectionEvents() {
        const memberSelect = document.getElementById('memberSelect');
        const generateMatchesBtn = document.getElementById('generateMatchesBtn');
        const memberInfo = document.getElementById('memberInfo');
        
        memberSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                this.selectedMember = this.members.find(member => 
                    `${member['First Name']}_${member['Last Name']}` === e.target.value
                );
                this.displaySelectedMemberInfo();
                generateMatchesBtn.disabled = false;
            } else {
                this.selectedMember = null;
                memberInfo.style.display = 'none';
                generateMatchesBtn.disabled = true;
            }
        });
        
        generateMatchesBtn.addEventListener('click', () => {
            if (this.selectedMember) {
                this.generateMatchesForSelectedMember();
            }
        });
    }

    displaySelectedMemberInfo() {
        const memberInfo = document.getElementById('memberInfo');
        const selectedMemberName = document.getElementById('selectedMemberName');
        const selectedMemberCompany = document.getElementById('selectedMemberCompany');
        const selectedMemberGoals = document.getElementById('selectedMemberGoals');
        
        selectedMemberName.textContent = `${this.selectedMember['First Name']} ${this.selectedMember['Last Name']}`;
        selectedMemberCompany.textContent = this.getCompany(this.selectedMember) || 'No Company';
        selectedMemberGoals.textContent = this.selectedMember['Professional Goals'] || this.selectedMember['Company Goals'] || 'No goals specified';
        
        memberInfo.style.display = 'block';
    }

    generateMatchesForSelectedMember() {
        this.showLoading();
        setTimeout(() => {
            const rawMatches = this.findMatchesForSelectedMember();
            this.matches = this.applyMemberQuota(rawMatches);
            this.hideLoading();
            this.displayMatches();
        }, 300);
    }

    findMatchesForSelectedMember() {
        const matches = [];
        const validMembers = this.members.filter(member => 
            member['First Name'] && member['Last Name'] && 
            (member['Professional Goals'] || member['Company Goals'] || member['Industry']) &&
            member !== this.selectedMember // Exclude selected member from potential matches
        );
        
        // RANDOMIZE member order to get different people each time
        const shuffledMembers = [...validMembers].sort(() => Math.random() - 0.5);
        
        // Limit to top 200 for performance when matching one member
        const membersToProcess = shuffledMembers.length > 200 ? shuffledMembers.slice(0, 200) : shuffledMembers;
        
        // FAIL-SAFE MATCHING: Try multiple tiers to ensure minimum matches
        const minMatches = 5;
        const targetMatches = 8;
        
        // Tier 1: Standard criteria (score >= 0.05)
        const tier1Matches = this.findMatchesByTier(membersToProcess, 0.05, 'standard');
        
        // Tier 2: Relaxed criteria if we don't have enough (score >= 0.03)
        let allMatches = [...tier1Matches];
        if (allMatches.length < minMatches) {
            const tier2Matches = this.findMatchesByTier(membersToProcess, 0.03, 'relaxed');
            allMatches = this.mergeTiers(allMatches, tier2Matches);
        }
        
        // Tier 3: Safety net - ensure we have minimum matches (score >= 0.01)
        if (allMatches.length < minMatches) {
            const tier3Matches = this.findMatchesByTier(membersToProcess, 0.01, 'safety');
            allMatches = this.mergeTiers(allMatches, tier3Matches);
        }
        
        // Apply smart score normalization to ensure all scores are in 65-85% range
        allMatches.forEach(match => {
            match.score = this.normalizeScore(match.score, match.tier);
        });
        
        // Sort by score descending with some randomization for variety
        const sortedMatches = allMatches.sort((a, b) => {
            const scoreDiff = b.score - a.score;
            const randomFactor = (Math.random() - 0.5) * 0.02;
            return scoreDiff + randomFactor;
        });
        
        // Return top matches, ensuring minimum but not too many
        const finalCount = Math.min(Math.max(sortedMatches.length, minMatches), 25);
        return sortedMatches.slice(0, finalCount);
    }

    findMatchesByTier(membersToProcess, minScore, tier) {
        const matches = [];
        
        for (const potentialMatch of membersToProcess) {
            // Skip if same company
            if (this.getCompany(this.selectedMember) === this.getCompany(potentialMatch) && 
                this.getCompany(this.selectedMember) !== '') {
                continue;
            }
            
            let matchScore;
            if (tier === 'safety') {
                // Safety tier: more lenient matching
                matchScore = this.calculateSafetyTierScore(this.selectedMember, potentialMatch);
            } else if (tier === 'relaxed') {
                // Relaxed tier: moderately lenient
                matchScore = this.calculateRelaxedTierScore(this.selectedMember, potentialMatch);
            } else {
                // Standard tier: normal calculation
                matchScore = this.calculateMatchScore(this.selectedMember, potentialMatch);
            }
            
            if (matchScore >= minScore) {
                matches.push({
                    member1: this.selectedMember,
                    member2: potentialMatch,
                    score: matchScore,
                    tier: tier,
                    explanation: this.generateEnhancedMatchExplanation(this.selectedMember, potentialMatch, tier)
                });
            }
        }
        
        return matches;
    }

    mergeTiers(existingMatches, newMatches) {
        const existingIds = new Set(existingMatches.map(m => 
            `${m.member2['First Name']}_${m.member2['Last Name']}`
        ));
        
        const uniqueNewMatches = newMatches.filter(m => 
            !existingIds.has(`${m.member2['First Name']}_${m.member2['Last Name']}`)
        );
        
        return [...existingMatches, ...uniqueNewMatches];
    }

    calculateRelaxedTierScore(member1, member2) {
        let score = 0;
        let factors = 0;
        
        // More lenient goal matching (35% weight)
        const goalScore = this.calculateRelaxedGoalScore(member1, member2);
        score += goalScore * 0.35;
        factors++;
        
        // Industry alignment with broader categories (25% weight)
        const industryScore = this.calculateBroadIndustryAlignment(member1, member2);
        score += industryScore * 0.25;
        factors++;
        
        // Stage similarity (20% weight)
        const stageScore = this.calculateStageAlignment(member1, member2);
        score += stageScore * 0.2;
        factors++;
        
        // Geographic or business model similarity (20% weight)
        const contextScore = this.calculateContextualAlignment(member1, member2);
        score += contextScore * 0.2;
        factors++;
        
        return factors > 0 ? score / factors : 0;
    }

    calculateSafetyTierScore(member1, member2) {
        let score = 0.4; // Base score to ensure decent match quality
        let factors = 1;
        
        // Any shared characteristic gets points
        if (this.hasAnySharedCharacteristic(member1, member2)) {
            score += 0.3;
        }
        
        // Learning opportunity boost
        if (this.isLearningOpportunity(member1, member2)) {
            score += 0.2;
        }
        
        // Geographic expansion opportunity
        if (this.isGeographicExpansionOpportunity(member1, member2)) {
            score += 0.15;
        }
        
        return Math.min(score, 0.85); // Cap at reasonable level
    }

    calculateRelaxedGoalScore(member1, member2) {
        const goals1 = this.extractGoals(member1);
        const goals2 = this.extractGoals(member2);
        
        // If no goals, give a decent score instead of low score
        if (goals1.length === 0 && goals2.length === 0) return 0.7;
        if (goals1.length === 0 || goals2.length === 0) return 0.6;
        
        // Broader complementary goal matching
        const broadComplementaryPairs = [
            ['fundraising', 'investor'], ['fundraising', 'funding'], ['fundraising', 'capital'],
            ['sales', 'growth'], ['sales', 'gtm'], ['sales', 'marketing'],
            ['growth', 'expansion'], ['growth', 'scaling'], ['growth', 'user'],
            ['network', 'hiring'], ['network', 'partnership'], ['network', 'collaboration'],
            ['brand', 'marketing'], ['brand', 'awareness'], ['brand', 'user']
        ];
        
        let maxScore = 0;
        for (const [goal1, goal2] of broadComplementaryPairs) {
            const hasGoal1 = goals1.some(g => g.includes(goal1));
            const hasGoal2 = goals2.some(g => g.includes(goal2));
            if (hasGoal1 && hasGoal2) {
                maxScore = Math.max(maxScore, 0.9);
            }
        }
        
        // Check for any goal overlap
        const overlap = goals1.filter(goal => 
            goals2.some(g2 => g2.includes(goal) || goal.includes(g2))
        );
        if (overlap.length > 0) {
            maxScore = Math.max(maxScore, 0.8);
        }
        
        return Math.max(maxScore, 0.5); // Minimum decent score
    }

    calculateBroadIndustryAlignment(member1, member2) {
        const industry1 = (member1['Industry'] || '').toLowerCase();
        const industry2 = (member2['Industry'] || '').toLowerCase();
        
        if (!industry1 || !industry2) return 0.6; // Neutral score for missing data
        
        // Broader industry categories
        const broadCategories = [
            ['tech', 'software', 'saas', 'ai', 'machine learning', 'data', 'analytics'],
            ['finance', 'fintech', 'banking', 'investment', 'crypto', 'payment'],
            ['healthcare', 'health tech', 'medical', 'biotech', 'wellness', 'fitness'],
            ['ecommerce', 'retail', 'consumer', 'marketplace', 'shopping', 'commerce'],
            ['education', 'edtech', 'learning', 'training', 'development'],
            ['b2b', 'enterprise', 'business', 'corporate', 'professional'],
            ['marketing', 'advertising', 'content', 'media', 'creative']
        ];
        
        for (const category of broadCategories) {
            const hasCategory1 = category.some(term => industry1.includes(term));
            const hasCategory2 = category.some(term => industry2.includes(term));
            if (hasCategory1 && hasCategory2) return 0.8;
        }
        
        return 0.5; // Default score for different industries
    }

    calculateStageAlignment(member1, member2) {
        const stage1 = (member1['Company Stage'] || '').toLowerCase();
        const stage2 = (member2['Company Stage'] || '').toLowerCase();
        
        if (!stage1 || !stage2) return 0.6;
        
        // Group stages into broader categories
        const stageGroups = [
            ['pre-seed', 'seed', 'early'],
            ['series a', 'series b', 'growth'],
            ['series c', 'series d', 'late', 'mature']
        ];
        
        for (const group of stageGroups) {
            const inGroup1 = group.some(stage => stage1.includes(stage));
            const inGroup2 = group.some(stage => stage2.includes(stage));
            if (inGroup1 && inGroup2) return 0.8;
        }
        
        return 0.5;
    }

    calculateContextualAlignment(member1, member2) {
        let score = 0;
        let factors = 0;
        
        // Geographic alignment
        const location1 = (member1['Based In'] || '').toLowerCase();
        const location2 = (member2['Based In'] || '').toLowerCase();
        if (location1 && location2) {
            factors++;
            if (location1.includes(location2) || location2.includes(location1)) {
                score += 0.8;
            } else {
                score += 0.4; // Different locations can be expansion opportunities
            }
        }
        
        // Business model similarity
        const role1 = (member1['Role'] || '').toLowerCase();
        const role2 = (member2['Role'] || '').toLowerCase();
        if (role1 && role2) {
            factors++;
            if (role1.includes('founder') && role2.includes('founder')) {
                score += 0.8; // Founder-to-founder connections are valuable
            } else {
                score += 0.5;
            }
        }
        
        return factors > 0 ? score / factors : 0.5;
    }

    hasAnySharedCharacteristic(member1, member2) {
        const characteristics1 = this.extractAllCharacteristics(member1);
        const characteristics2 = this.extractAllCharacteristics(member2);
        
        return characteristics1.some(char => characteristics2.includes(char));
    }

    extractAllCharacteristics(member) {
        const characteristics = [];
        
        // Add all non-empty field values as characteristics
        Object.keys(member).forEach(key => {
            const value = (member[key] || '').toLowerCase().trim();
            if (value && value !== 'n/a' && value !== 'none') {
                characteristics.push(...value.split(/[,;]/).map(v => v.trim()));
            }
        });
        
        return characteristics.filter(char => char.length > 2);
    }

    isLearningOpportunity(member1, member2) {
        const industry1 = (member1['Industry'] || '').toLowerCase();
        const industry2 = (member2['Industry'] || '').toLowerCase();
        const stage1 = (member1['Company Stage'] || '').toLowerCase();
        const stage2 = (member2['Company Stage'] || '').toLowerCase();
        
        // Different industries but similar stages = learning opportunity
        return (industry1 !== industry2 && industry1 && industry2) ||
               (stage1 !== stage2 && stage1 && stage2);
    }

    isGeographicExpansionOpportunity(member1, member2) {
        const location1 = (member1['Based In'] || '').toLowerCase();
        const location2 = (member2['Based In'] || '').toLowerCase();
        
        if (!location1 || !location2) return false;
        
        // Different locations = potential expansion opportunity
        return !location1.includes(location2) && !location2.includes(location1);
    }

    normalizeScore(rawScore, tier) {
        let minScore, maxScore;
        
        switch (tier) {
            case 'standard':
                minScore = 0.75;
                maxScore = 0.90;
                break;
            case 'relaxed':
                minScore = 0.68;
                maxScore = 0.82;
                break;
            case 'safety':
                minScore = 0.65;
                maxScore = 0.78;
                break;
            default:
                minScore = 0.65;
                maxScore = 0.85;
        }
        
        // Map raw score to target range
        const normalizedScore = minScore + (rawScore * (maxScore - minScore));
        return Math.min(Math.max(normalizedScore, minScore), maxScore);
    }

    generateEnhancedMatchExplanation(member1, member2, tier) {
        const explanations = [];
        
        // Get standard explanation first
        const baseExplanation = this.generateMatchExplanation(member1, member2);
        if (baseExplanation && !baseExplanation.includes('Strong potential for collaboration')) {
            explanations.push(baseExplanation);
        }
        
        // Add tier-specific explanations
        switch (tier) {
            case 'relaxed':
                explanations.push(this.generateRelaxedTierExplanation(member1, member2));
                break;
            case 'safety':
                explanations.push(this.generateSafetyTierExplanation(member1, member2));
                break;
        }
        
        // Remove duplicates and empty explanations
        const uniqueExplanations = [...new Set(explanations.filter(exp => exp && exp.trim()))];
        
        return uniqueExplanations.length > 0 
            ? uniqueExplanations.join('. ')
            : 'Valuable networking opportunity for knowledge sharing and potential collaboration.';
    }

    generateRelaxedTierExplanation(member1, member2) {
        const explanations = [];
        
        // Geographic expansion
        if (this.isGeographicExpansionOpportunity(member1, member2)) {
            const location1 = member1['Based In'] || 'their region';
            const location2 = member2['Based In'] || 'another region';
            explanations.push(`Geographic expansion opportunity: ${location1} ↔ ${location2}`);
        }
        
        // Learning opportunity
        if (this.isLearningOpportunity(member1, member2)) {
            explanations.push('Cross-industry learning and best practices sharing');
        }
        
        // Stage mentorship
        const stage1 = (member1['Company Stage'] || '').toLowerCase();
        const stage2 = (member2['Company Stage'] || '').toLowerCase();
        if (stage1 && stage2 && stage1 !== stage2) {
            explanations.push('Stage-based mentorship and scaling insights');
        }
        
        return explanations.join('. ');
    }

    generateSafetyTierExplanation(member1, member2) {
        const explanations = [];
        
        // Always frame as valuable
        const role1 = member1['Role'] || 'founder';
        const role2 = member2['Role'] || 'founder';
        
        if (role1.toLowerCase().includes('founder') && role2.toLowerCase().includes('founder')) {
            explanations.push('Fellow founder connection for peer support and shared experiences');
        } else {
            explanations.push('Strategic networking opportunity for business growth');
        }
        
        // Add specific value propositions
        explanations.push('Potential for partnership development and resource sharing');
        
        return explanations.join('. ');
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
        
        // RANDOMIZE member order to get different people each time
        const shuffledMembers = [...validMembers].sort(() => Math.random() - 0.5);
        
        // If we have too many members, limit to top 300 for performance (increased from 100)
        const membersToProcess = shuffledMembers.length > 300 ? shuffledMembers.slice(0, 300) : shuffledMembers;
        
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
                
                // Only include matches with decent scores for better performance (lowered threshold)
                if (matchScore >= 0.05) {
                    matches.push({
                        member1,
                        member2,
                        score: matchScore,
                        explanation: this.generateMatchExplanation(member1, member2)
                    });
                }
            }
        }
        
        // Sort by score descending with some randomization for variety
        const sortedMatches = matches.sort((a, b) => {
            // Add small random factor to mix up matches with similar scores
            const scoreDiff = b.score - a.score;
            const randomFactor = (Math.random() - 0.5) * 0.02; // Small random adjustment
            return scoreDiff + randomFactor;
        });
        
        // Limit to top 1000 matches for performance (increased from 200)
        return sortedMatches.slice(0, 1000);
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

    generateMatchExplanation(member1, member2) {
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
            // Show all members as a fallback
            let membersHtml = '<h3>All Members</h3><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">';
            this.members.slice(0, 20).forEach(member => {
                membersHtml += `
                    <div style="background: #23243A; padding: 20px; border-radius: 12px; border: 1px solid #A18CD1;">
                        <h4>${member['First Name']} ${member['Last Name']}</h4>
                        <p>${member['Company Goals'] || member['Professional Goals'] || 'No goals specified'}</p>
                        <p>${member['Industry'] || 'No industry specified'}</p>
                    </div>
                `;
            });
            membersHtml += '</div>';
            
            container.innerHTML = `
                <div class="no-matches">
                    <h3>No matches found</h3>
                    <p>Showing all members instead:</p>
                    ${membersHtml}
                </div>
            `;
            paginationControls.style.display = 'none';
        } else {
            // Show only the first 4 matches initially
            const matchesToShow = this.matches.slice(0, this.matchesPerPage);
            this.displayedMatches = matchesToShow.length;
            
            matchesToShow.forEach((match, index) => {
                const matchId = `${match.member1['First Name']}_${match.member1['Last Name']}__${match.member2['First Name']}_${match.member2['Last Name']}`;
                const matchCard = this.createMatchCard(match, index, matchId);
                // No need to add intro-checked class - dimming is handled in createMatchCard
                container.appendChild(matchCard);
            });
            
            // Hide pagination controls for infinite scroll
            paginationControls.style.display = 'none';
        }
        
        document.getElementById('resultsSection').style.display = 'block';
        if (window.lucide) lucide.createIcons();
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
            // No need to add intro-checked class - dimming is handled in createMatchCard
            container.appendChild(matchCard);
        });
        
        this.displayedMatches = endIndex;
        
        // Hide pagination if we've shown all matches
        if (this.displayedMatches >= this.matches.length) {
            paginationControls.style.display = 'none';
        }
        if (window.lucide) lucide.createIcons();
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

        // Match quality labels (commented out as not currently used in UI)
        // let label = '';
        // if (match.score >= 0.18) label = 'Strong Match';
        // else if (match.score >= 0.15) label = 'Good Match';
        // else if (match.score >= 0.12) label = 'Potential Match';
        // else label = 'Interesting Connection';

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
                            ${member1Display} <i data-lucide="handshake" class="handshake-outline"></i> ${member2Display}
                        </h3>
                    </div>
                    <div class="match-score">
                        <span class="score-label">Match Score:</span>
                        <span class="score-value">${Math.round(match.score * 100)}%</span>
                    </div>
                </div>
                <span class="intro-check-icon" style="display:none; position:absolute; top:16px; right:20px; z-index:2; cursor:pointer;">
                    <i data-lucide="check" class="checkmark-white"></i>
                </span>
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
            </div>
        `;
        // Check icon logic
        const introCheckIcon = card.querySelector('.intro-check-icon');
        const checkIcon = introCheckIcon.querySelector('i');
        const introduceBtn = card.querySelector('.primary-action');
        // Show check if already introduced
        if (this.introducedMatches.includes(matchId)) {
            introCheckIcon.style.display = '';
            card.classList.add('dimmed');
        }
        // Show check and dim when intro is clicked
        introduceBtn.addEventListener('click', () => {
            if (!this.introducedMatches.includes(matchId)) {
                this.introducedMatches.push(matchId);
                this.saveIntroducedMatches();
                introCheckIcon.style.display = '';
                card.classList.add('dimmed');
                if (window.lucide) lucide.createIcons();
            }
        });
        // Toggle dim and icon when check is clicked
        introCheckIcon.addEventListener('click', () => {
            if (card.classList.contains('dimmed')) {
                card.classList.remove('dimmed');
                checkIcon.setAttribute('data-lucide', 'circle-check');
                checkIcon.classList.remove('checkmark-white');
                checkIcon.classList.add('checkmark-hollow');
                if (window.lucide) lucide.createIcons();
            } else {
                card.classList.add('dimmed');
                checkIcon.setAttribute('data-lucide', 'check');
                checkIcon.classList.remove('checkmark-hollow');
                checkIcon.classList.add('checkmark-white');
                if (window.lucide) lucide.createIcons();
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
window.addEventListener('DOMContentLoaded', () => {
    const csvUploadSection = document.getElementById('csvUploadSection');
    const mainAppContainer = document.getElementById('mainAppContainer');
    const csvFileInput = document.getElementById('csvFileInput');
    const startMatchingBtn = document.getElementById('startMatchingBtn');
    const customFileBtn = document.getElementById('customFileBtn');
    const selectedFileName = document.getElementById('selectedFileName');
    const changeCsvBtn = document.getElementById('changeCsvBtn');
    let csvText = '';

    // Helper to load matcher from CSV text
    function loadMatcherFromCsv(text) {
        console.log('Loading matcher from CSV...');
        const matcher = new MemberMatcher();
        matcher.members = matcher.parseCSV(text);
        console.log(`Matcher initialized with ${matcher.members.length} members`);
        
        // Show immediate feedback
        if (matcher.members.length === 0) {
            alert('No members found in CSV. Please check your file format.');
            return;
        }
        
        window.matcher = matcher; // for debugging
        csvUploadSection.style.display = 'none';
        mainAppContainer.style.display = '';
        changeCsvBtn.style.display = ''; // Show the Change CSV button
        
        // Force show the results section immediately
        document.getElementById('resultsSection').style.display = 'block';
        
        matcher.initializeApp();
        
        // Auto-generate matches immediately
        setTimeout(() => {
            matcher.generateMatchesForSelectedMember();
        }, 100);
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // On page load, check for CSV in localStorage
    const storedCsv = localStorage.getItem('uploadedMembersCsv');
    if (storedCsv) {
        csvText = storedCsv;
        loadMatcherFromCsv(csvText);
    } else {
        mainAppContainer.style.display = 'none';
        csvUploadSection.style.display = 'flex';
    }

    // Custom file button logic
    customFileBtn.addEventListener('click', () => {
        csvFileInput.click();
    });

    csvFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) {
            // Hide start button if no file selected
            startMatchingBtn.style.display = 'none';
            selectedFileName.textContent = '';
            return;
        }
        
        // Show loading state while reading file
        selectedFileName.textContent = 'Loading...';
        selectedFileName.style.color = '#A18CD1';
        
        try {
            csvText = await file.text();
            
            // Show file name with success styling
            selectedFileName.textContent = `✓ ${file.name}`;
            selectedFileName.style.color = '#FBC2EB';
            
            // Show Start Matching button with animation
            startMatchingBtn.style.display = 'block';
            startMatchingBtn.classList.add('slide-in-up');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                startMatchingBtn.classList.remove('slide-in-up');
            }, 400);
            
        } catch {
            // Handle error state
            selectedFileName.textContent = '❌ Error reading file';
            selectedFileName.style.color = '#FF6B6B';
            startMatchingBtn.style.display = 'none';
        }
    });

    startMatchingBtn.addEventListener('click', () => {
        if (!csvText) {
            alert('Please select a CSV file first.');
            return;
        }
        // Save CSV to localStorage and load matcher
        localStorage.setItem('uploadedMembersCsv', csvText);
        loadMatcherFromCsv(csvText);
    });

    // Change CSV button logic
    changeCsvBtn.addEventListener('click', () => {
        localStorage.removeItem('uploadedMembersCsv');
        // Reset upload state
        mainAppContainer.style.display = 'none';
        csvUploadSection.style.display = 'flex';
        changeCsvBtn.style.display = 'none'; // Hide the Change CSV button
        csvText = '';
        selectedFileName.textContent = '';
        selectedFileName.style.color = '#FBC2EB';
        csvFileInput.value = '';
        startMatchingBtn.style.display = 'none';
    });
}); 
