// GLO Introduction Matcher - Backend Logic
class GLOIntroductionMatcher {
    constructor() {
        this.members = [];
        this.introductions = [];
        this.categories = {
            HIGH_TRACTION_FOUNDERS: 'Fellow High-Traction Founders',
            ACTIVE_INVESTORS: 'Active Investors', 
            STRATEGIC_GTM: 'Strategic GTM Partners',
            SERVICE_PROVIDERS: 'GLO-Vetted Product & Service Providers'
        };
    }

    // Parse CSV and extract member data
    parseMembers(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        this.members = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = this.parseCSVLine(lines[i]);
            if (values.length < headers.length) continue;
            
            const member = {};
            headers.forEach((header, index) => {
                member[header] = values[index] || '';
            });
            
            if (member['First Name'] && member['Last Name']) {
                this.members.push(member);
            }
        }
        
        return this.members.length;
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

    // Generate 25 targeted introductions for a member
    generateIntroductions(targetMember) {
        this.introductions = [];
        const CATEGORY_TARGETS = [6, 7, 6, 6]; // 25 total
        const categoryKeys = [
            this.categories.HIGH_TRACTION_FOUNDERS,
            this.categories.ACTIVE_INVESTORS,
            this.categories.STRATEGIC_GTM,
            this.categories.SERVICE_PROVIDERS
        ];
        const finders = [
            this.findHighTractionMatches.bind(this),
            this.findInvestorMatches.bind(this),
            this.findGTMMatches.bind(this),
            this.findServiceMatches.bind(this)
        ];

        let introId = 1;
        for (let i = 0; i < 4; i++) {
            const matches = finders[i](targetMember);
            const category = categoryKeys[i];
            const targetCount = CATEGORY_TARGETS[i];
            // Only add real matches, up to the target count
            for (let j = 0; j < Math.min(matches.length, targetCount); j++) {
                const match = matches[j];
                this.introductions.push({
                    id: introId++,
                    contact: `${match['First Name']} ${match['Last Name']}`,
                    company: match['Company Website'] || match['Company'] || 'Company TBD',
                    category: category,
                    rationale: this.generateRationale(match, category),
                    value: this.generateValue(match, category),
                    email: match['Email'] || '',
                    linkedin: match['LinkedIn Profile'] || '',
                    score: this.calculateMatchScore(targetMember, match, category)
                });
            }
        }
        return this.introductions;
    }

    // Find high-traction founder matches
    findHighTractionMatches(targetMember) {
        return this.members.filter(member => 
            member !== targetMember &&
            member['First Name'] && member['Last Name'] &&
            this.isHighTractionFounder(member) &&
            this.hasComplementaryGoals(targetMember, member)
        );
    }

    // Find investor matches
    findInvestorMatches(targetMember) {
        return this.members.filter(member => 
            member !== targetMember &&
            member['First Name'] && member['Last Name'] &&
            this.isInvestor(member) &&
            this.isRelevantForFundraising(targetMember, member)
        );
    }

    // Find GTM partner matches
    findGTMMatches(targetMember) {
        return this.members.filter(member => 
            member !== targetMember &&
            member['First Name'] && member['Last Name'] &&
            this.isGTMPartner(member) &&
            this.hasGTMNeeds(targetMember)
        );
    }

    // Find service provider matches
    findServiceMatches(targetMember) {
        return this.members.filter(member => 
            member !== targetMember &&
            member['First Name'] && member['Last Name'] &&
            this.isServiceProvider(member) &&
            this.hasServiceNeeds(targetMember)
        );
    }

    // Helper methods to categorize members
    isHighTractionFounder(member) {
        const role = (member['Role'] || '').toLowerCase();
        const arr = member['Current MRR'] || member['Projected ARR'] || '';
        return role.includes('founder') || role.includes('ceo') || 
               arr.includes('$1M') || arr.includes('$5M') || arr.includes('$10M');
    }

    isInvestor(member) {
        const role = (member['Role'] || '').toLowerCase();
        const type = (member['Investor Type'] || '').toLowerCase();
        return role.includes('investor') || role.includes('vc') || 
               type.includes('investor') || type.includes('vc');
    }

    isGTMPartner(member) {
        const role = (member['Role'] || '').toLowerCase();
        const industry = (member['Industry'] || '').toLowerCase();
        return role.includes('sales') || role.includes('marketing') || 
               role.includes('gtm') || industry.includes('b2b') || 
               industry.includes('saas');
    }

    isServiceProvider(member) {
        const role = (member['Role'] || '').toLowerCase();
        const industry = (member['Industry'] || '').toLowerCase();
        return role.includes('legal') || role.includes('consultant') || 
               role.includes('agency') || industry.includes('legal') || 
               industry.includes('consulting');
    }

    // Check if member has complementary goals
    hasComplementaryGoals(member1, member2) {
        const goals1 = (member1['Professional Goals'] || member1['Company Goals'] || '').toLowerCase();
        const goals2 = (member2['Professional Goals'] || member2['Company Goals'] || '').toLowerCase();
        
        const complementaryPairs = [
            ['fundraising', 'investor'],
            ['sales growth', 'gtm'],
            ['partnership', 'founder'],
            ['hiring', 'network']
        ];
        
        return complementaryPairs.some(([goal1, goal2]) => 
            goals1.includes(goal1) && goals2.includes(goal2)
        );
    }

    // Check if member is relevant for fundraising
    isRelevantForFundraising(member, investor) {
        const memberStage = (member['Company Stage'] || '').toLowerCase();
        const investorStage = (investor['Investment Stage'] || '').toLowerCase();
        const memberIndustry = (member['Industry'] || '').toLowerCase();
        const investorIndustries = (investor['Industries Invested'] || '').toLowerCase();
        
        return (memberStage.includes('series') && investorStage.includes('series')) ||
               (investorIndustries.includes(memberIndustry));
    }

    // Check if member has GTM needs
    hasGTMNeeds(member) {
        const goals = (member['Professional Goals'] || member['Company Goals'] || '').toLowerCase();
        return goals.includes('sales') || goals.includes('growth') || 
               goals.includes('gtm') || goals.includes('marketing');
    }

    // Check if member has service needs
    hasServiceNeeds(member) {
        const goals = (member['Professional Goals'] || member['Company Goals'] || '').toLowerCase();
        return goals.includes('legal') || goals.includes('hiring') || 
               goals.includes('consulting') || goals.includes('support');
    }

    // Add introductions for a category
    addCategoryIntroductions(matches, category, count) {
        const shuffled = matches.sort(() => Math.random() - 0.5).slice(0, count);
        
        shuffled.forEach((match, index) => {
            const intro = {
                id: this.introductions.length + 1,
                contact: `${match['First Name']} ${match['Last Name']}`,
                company: match['Company Website'] || match['Company'] || 'Company TBD',
                category: category,
                rationale: this.generateRationale(match, category),
                value: this.generateValue(match, category),
                email: match['Email'] || '',
                linkedin: match['LinkedIn Profile'] || ''
            };
            this.introductions.push(intro);
        });
    }

    // Generate rationale for introduction
    generateRationale(match, category) {
        const name = `${match['First Name']} ${match['Last Name']}`;
        const company = match['Company Website'] || match['Company'] || 'their company';
        const industry = match['Industry'] || 'relevant industry';
        const goals = match['Professional Goals'] || match['Company Goals'] || 'business goals';
        
        switch(category) {
            case this.categories.HIGH_TRACTION_FOUNDERS:
                return `${name} has successfully scaled ${company} and can share valuable insights on ${goals}`;
            case this.categories.ACTIVE_INVESTORS:
                return `${name} invests in ${industry} companies and could provide strategic capital and guidance`;
            case this.categories.STRATEGIC_GTM:
                return `${name} specializes in ${industry} go-to-market strategies and can help accelerate growth`;
            case this.categories.SERVICE_PROVIDERS:
                return `${name} provides essential ${industry} services that could support your business needs`;
            default:
                return `Strong potential for collaboration based on complementary expertise`;
        }
    }

    // Generate value proposition
    generateValue(match, category) {
        switch(category) {
            case this.categories.HIGH_TRACTION_FOUNDERS:
                return 'Knowledge sharing, partnerships, social capital. GLO earns on partnership deals.';
            case this.categories.ACTIVE_INVESTORS:
                return 'Potential investment, strategic guidance. GLO earns investment commission.';
            case this.categories.STRATEGIC_GTM:
                return 'Sales growth, market expansion. GLO earns on GTM outcomes.';
            case this.categories.SERVICE_PROVIDERS:
                return 'Essential business services. GLO earns referral fees.';
            default:
                return 'Mutual value creation with commission potential.';
        }
    }

    // Calculate a match score (0-1) for a suggested match
    calculateMatchScore(member1, member2, category) {
        let score = 0;
        let total = 0;
        // Score on industry
        total++;
        if ((member1['Industry'] || '').toLowerCase() && (member2['Industry'] || '').toLowerCase() && (member1['Industry'] || '').toLowerCase() === (member2['Industry'] || '').toLowerCase()) score++;
        // Score on company stage
        total++;
        if ((member1['Company Stage'] || '').toLowerCase() && (member2['Company Stage'] || '').toLowerCase() && (member1['Company Stage'] || '').toLowerCase() === (member2['Company Stage'] || '').toLowerCase()) score++;
        // Score on goals
        total++;
        if ((member1['Professional Goals'] || '').toLowerCase() && (member2['Professional Goals'] || '').toLowerCase() && (member1['Professional Goals'] || '').toLowerCase() === (member2['Professional Goals'] || '').toLowerCase()) score++;
        // Score on intro preferences
        total++;
        if ((member1['Intro Preferences'] || '').toLowerCase() && (member2['Intro Preferences'] || '').toLowerCase() && (member1['Intro Preferences'] || '').toLowerCase() === (member2['Intro Preferences'] || '').toLowerCase()) score++;
        // Score on location
        total++;
        if ((member1['Based In'] || '').toLowerCase() && (member2['Based In'] || '').toLowerCase() && (member1['Based In'] || '').toLowerCase() === (member2['Based In'] || '').toLowerCase()) score++;
        // Score on category-specific logic
        total++;
        if (category === this.categories.ACTIVE_INVESTORS && (member2['Investor Type'] || '').toLowerCase().includes('investor')) score++;
        if (category === this.categories.HIGH_TRACTION_FOUNDERS && (member2['Role'] || '').toLowerCase().includes('founder')) score++;
        if (category === this.categories.STRATEGIC_GTM && (member2['Role'] || '').toLowerCase().includes('gtm')) score++;
        if (category === this.categories.SERVICE_PROVIDERS && (member2['Role'] || '').toLowerCase().includes('legal')) score++;
        // Normalize score
        return Math.round((score / total) * 100) / 100;
    }

    // Get all members
    getAllMembers() {
        return this.members;
    }

    // Get introductions
    getIntroductions() {
        return this.introductions;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GLOIntroductionMatcher;
} 