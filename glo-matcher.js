// Enhanced GLO Introduction Matcher with Comprehensive AI-Powered Analysis
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
        
        // Commission potential weights (favor revenue-generating matches)
        this.commissionWeights = {
            [this.categories.HIGH_TRACTION_FOUNDERS]: 0.3, // Partnership deals
            [this.categories.ACTIVE_INVESTORS]: 0.4, // Investment commission
            [this.categories.STRATEGIC_GTM]: 0.5, // GTM outcomes
            [this.categories.SERVICE_PROVIDERS]: 0.2 // Referral fees
        };
    }

    // Enhanced member profile analysis
    analyzeMemberProfile(member) {
        const profile = {
            name: `${member['First Name']} ${member['Last Name']}`,
            company: member['Company Website'] || member['Company'] || 'Company TBD',
            industry: member['Industry'] || 'Industry TBD',
            stage: member['Company Stage'] || 'Stage TBD',
            role: member['Role'] || 'Role TBD',
            location: member['Based In'] || 'Location TBD',
            mrr: member['Current MRR'] || '',
            arr: member['Projected ARR'] || '',
            funding: member['Funding Amount'] || '',
            goals: this.extractGoals(member),
            needs: this.identifyNeeds(member),
            strengths: this.identifyStrengths(member),
            networkValue: this.calculateNetworkValue(member),
            commissionPotential: this.calculateCommissionPotential(member),
            tractionScore: this.calculateTractionScore(member),
            investorProfile: this.analyzeInvestorProfile(member),
            gtmCapabilities: this.analyzeGTMCapabilities(member),
            serviceOfferings: this.analyzeServiceOfferings(member)
        };
        
        return profile;
    }

    // Extract and categorize goals
    extractGoals(member) {
        const goals = {
            professional: member['Professional Goals'] || '',
            company: member['Company Goals'] || '',
            personal: member['Personal Goals'] || '',
            fundraising: this.hasFundraisingGoals(member),
            gtm: this.hasGTMGoals(member),
            partnerships: this.hasPartnershipGoals(member),
            hiring: this.hasHiringGoals(member),
            expansion: this.hasExpansionGoals(member)
        };
        
        return goals;
    }

    // Identify member needs based on goals, stage, and industry
    identifyNeeds(member) {
        const needs = [];
        const goals = this.extractGoals(member);
        const stage = (member['Company Stage'] || '').toLowerCase();
        const industry = (member['Industry'] || '').toLowerCase();
        
        if (goals.fundraising) needs.push('fundraising');
        if (goals.gtm) needs.push('gtm_partnerships');
        if (goals.hiring) needs.push('talent_acquisition');
        if (goals.expansion) needs.push('market_expansion');
        if (stage.includes('seed') || stage.includes('pre-seed')) needs.push('early_stage_support');
        if (industry.includes('ai') || industry.includes('ml')) needs.push('ai_expertise');
        if (industry.includes('fintech')) needs.push('fintech_networks');
        if (industry.includes('b2b') || industry.includes('saas')) needs.push('b2b_scaling');
        
        return needs;
    }

    // Identify member strengths and value proposition
    identifyStrengths(member) {
        const strengths = [];
        const role = (member['Role'] || '').toLowerCase();
        const industry = (member['Industry'] || '').toLowerCase();
        const mrr = member['Current MRR'] || '';
        const arr = member['Projected ARR'] || '';
        
        if (role.includes('founder') || role.includes('ceo')) strengths.push('founder_experience');
        if (mrr.includes('$1M') || arr.includes('$1M')) strengths.push('high_traction');
        if (mrr.includes('$5M') || arr.includes('$5M')) strengths.push('scale_expertise');
        if (industry.includes('b2b') || industry.includes('saas')) strengths.push('b2b_expertise');
        if (industry.includes('ai') || industry.includes('ml')) strengths.push('ai_expertise');
        if (industry.includes('fintech')) strengths.push('fintech_expertise');
        if (member['Investor Type']) strengths.push('investor_network');
        if (role.includes('sales') || role.includes('marketing')) strengths.push('gtm_expertise');
        
        return strengths;
    }

    // Calculate network value score (0-100)
    calculateNetworkValue(member) {
        let score = 0;
        const role = (member['Role'] || '').toLowerCase();
        const industry = (member['Industry'] || '').toLowerCase();
        const mrr = member['Current MRR'] || '';
        const arr = member['Projected ARR'] || '';
        const funding = member['Funding Amount'] || '';
        
        // High traction founders
        if (mrr.includes('$1M') || arr.includes('$1M')) score += 30;
        if (mrr.includes('$5M') || arr.includes('$5M')) score += 50;
        if (mrr.includes('$10M') || arr.includes('$10M')) score += 70;
        
        // Industry expertise value
        if (industry.includes('ai') || industry.includes('ml')) score += 20;
        if (industry.includes('fintech')) score += 20;
        if (industry.includes('b2b') || industry.includes('saas')) score += 15;
        
        // Investor connections
        if (member['Investor Type']) score += 25;
        if (member['Fund Size']) {
            if (funding.includes('$10M') || funding.includes('$25M')) score += 15;
            if (funding.includes('$100M')) score += 25;
        }
        
        // Leadership roles
        if (role.includes('founder') || role.includes('ceo')) score += 10;
        
        return Math.min(score, 100);
    }

    // Calculate commission potential score (0-100)
    calculateCommissionPotential(member) {
        let potential = 0;
        const role = (member['Role'] || '').toLowerCase();
        const mrr = member['Current MRR'] || '';
        const arr = member['Projected ARR'] || '';
        const funding = member['Funding Amount'] || '';
        const investorType = member['Investor Type'] || '';
        
        // High-value targets for fundraising commissions
        if (role.includes('investor') || role.includes('vc') || investorType) {
            if (funding.includes('$1M') || funding.includes('$5M')) potential += 40;
            if (funding.includes('$10M') || funding.includes('$25M')) potential += 60;
            if (funding.includes('$100M')) potential += 80;
        }
        
        // GTM partnership potential
        if (mrr.includes('$1M') || arr.includes('$1M')) potential += 30;
        if (mrr.includes('$5M') || arr.includes('$5M')) potential += 50;
        if (mrr.includes('$10M') || arr.includes('$10M')) potential += 70;
        
        // Service provider referral potential
        if (role.includes('legal') || role.includes('consultant') || role.includes('agency')) {
            potential += 20;
        }
        
        return Math.min(potential, 100);
    }

    // Calculate traction score (0-100)
    calculateTractionScore(member) {
        let score = 0;
        const mrr = member['Current MRR'] || '';
        const arr = member['Projected ARR'] || '';
        const stage = (member['Company Stage'] || '').toLowerCase();
        const funding = member['Funding Amount'] || '';
        
        // Revenue-based scoring
        if (mrr.includes('$100K') || arr.includes('$100K')) score += 20;
        if (mrr.includes('$250K') || arr.includes('$250K')) score += 30;
        if (mrr.includes('$1M') || arr.includes('$1M')) score += 50;
        if (mrr.includes('$5M') || arr.includes('$5M')) score += 70;
        if (mrr.includes('$10M') || arr.includes('$10M')) score += 90;
        
        // Stage-based scoring
        if (stage.includes('seed')) score += 10;
        if (stage.includes('series a')) score += 20;
        if (stage.includes('series b')) score += 30;
        if (stage.includes('series c')) score += 40;
        
        // Funding validation
        if (funding.includes('$1M')) score += 10;
        if (funding.includes('$5M')) score += 15;
        if (funding.includes('$10M')) score += 20;
        
        return Math.min(score, 100);
    }

    // Analyze investor profile
    analyzeInvestorProfile(member) {
        const profile = {
            isInvestor: false,
            investorType: member['Investor Type'] || '',
            investmentStage: member['Investment Stage'] || '',
            fundSize: member['Fund Size'] || '',
            averageCheck: member['Average Check Size'] || '',
            industries: member['Industries Invested'] || '',
            investmentFocus: []
        };
        
        const role = (member['Role'] || '').toLowerCase();
        profile.isInvestor = role.includes('investor') || role.includes('vc') || 
                            profile.investorType.toLowerCase().includes('investor');
        
        if (profile.industries) {
            profile.investmentFocus = profile.industries.split(',').map(i => i.trim().toLowerCase());
        }
        
        return profile;
    }

    // Analyze GTM capabilities
    analyzeGTMCapabilities(member) {
        const capabilities = {
            hasGTM: false,
            salesExpertise: false,
            marketingExpertise: false,
            channelPartnerships: false,
            industryExpertise: []
        };
        
        const role = (member['Role'] || '').toLowerCase();
        const industry = (member['Industry'] || '').toLowerCase();
        const goals = (member['Professional Goals'] || '').toLowerCase();
        
        capabilities.hasGTM = role.includes('sales') || role.includes('marketing') || 
                             role.includes('gtm') || goals.includes('gtm');
        capabilities.salesExpertise = role.includes('sales') || goals.includes('sales');
        capabilities.marketingExpertise = role.includes('marketing') || goals.includes('marketing');
        
        if (industry) {
            capabilities.industryExpertise = industry.split(',').map(i => i.trim().toLowerCase());
        }
        
        return capabilities;
    }

    // Analyze service offerings
    analyzeServiceOfferings(member) {
        const offerings = {
            isServiceProvider: false,
            legalServices: false,
            consultingServices: false,
            agencyServices: false,
            technicalServices: false,
            serviceCategories: []
        };
        
        const role = (member['Role'] || '').toLowerCase();
        const industry = (member['Industry'] || '').toLowerCase();
        
        offerings.isServiceProvider = role.includes('legal') || role.includes('consultant') || 
                                     role.includes('agency') || industry.includes('consulting');
        offerings.legalServices = role.includes('legal') || industry.includes('legal');
        offerings.consultingServices = role.includes('consultant') || industry.includes('consulting');
        offerings.agencyServices = role.includes('agency') || industry.includes('agency');
        offerings.technicalServices = role.includes('engineer') || role.includes('developer');
        
        return offerings;
    }

    // Enhanced match generation with comprehensive analysis
    generateIntroductions(targetMember) {
        this.introductions = [];
        const targetProfile = this.analyzeMemberProfile(targetMember);
        
        // Category targets optimized for commission potential
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
            const matches = finders[i](targetMember, targetProfile);
            const category = categoryKeys[i];
            const targetCount = CATEGORY_TARGETS[i];
            
            // Sort matches by comprehensive scoring
            const sortedMatches = this.sortMatchesByRelevance(matches, targetProfile, category);
            
            // Add top matches up to target count
            for (let j = 0; j < Math.min(sortedMatches.length, targetCount); j++) {
                const match = sortedMatches[j];
                const matchProfile = this.analyzeMemberProfile(match);
                
                this.introductions.push({
                    id: introId++,
                    name: `${match['First Name']} ${match['Last Name']}`,
                    contact: `${match['First Name']} ${match['Last Name']}`,
                    company: match['Company Website'] || match['Company'] || 'Company TBD',
                    category: category,
                    rationale: this.generateAdvancedRationale(targetProfile, matchProfile, category),
                    value: this.generateAdvancedValue(targetProfile, matchProfile, category),
                    email: match['Email'] || '',
                    linkedin: match['LinkedIn Profile'] || '',
                    score: Math.round(this.calculateAdvancedMatchScore(targetProfile, matchProfile, category) * 100),
                    commissionPotential: Math.round(matchProfile.commissionPotential),
                    networkValue: Math.round(matchProfile.networkValue),
                    tractionScore: Math.round(matchProfile.tractionScore),
                    matchReasons: this.generateMatchReasons(targetProfile, matchProfile, category),
                    suggestedNextSteps: this.generateNextSteps(targetProfile, matchProfile, category)
                });
            }
        }
        
        // Sort all introductions by overall value (score + commission potential)
        this.introductions.sort((a, b) => {
            const aValue = (a.score || 0) + (a.commissionPotential || 0) * 0.3;
            const bValue = (b.score || 0) + (b.commissionPotential || 0) * 0.3;
            return bValue - aValue;
        });
        
        return this.introductions;
    }

    // Enhanced matching algorithms
    findHighTractionMatches(targetMember, targetProfile) {
        return this.members.filter(member => {
            if (member === targetMember || !member['First Name'] || !member['Last Name']) return false;
            
            const memberProfile = this.analyzeMemberProfile(member);
            const isHighTraction = memberProfile.tractionScore >= 50;
            const hasComplementaryGoals = this.hasComplementaryGoals(targetProfile, memberProfile);
            const industryAlignment = this.hasIndustryAlignment(targetProfile, memberProfile);
            
            return isHighTraction && (hasComplementaryGoals || industryAlignment);
        });
    }

    findInvestorMatches(targetMember, targetProfile) {
        return this.members.filter(member => {
            if (member === targetMember || !member['First Name'] || !member['Last Name']) return false;
            
            const memberProfile = this.analyzeMemberProfile(member);
            const isInvestor = memberProfile.investorProfile.isInvestor;
            const isRelevantForFundraising = this.isRelevantForFundraising(targetProfile, memberProfile);
            const hasInvestmentCapacity = this.hasInvestmentCapacity(memberProfile);
            
            return isInvestor && (isRelevantForFundraising || hasInvestmentCapacity);
        });
    }

    findGTMMatches(targetMember, targetProfile) {
        return this.members.filter(member => {
            if (member === targetMember || !member['First Name'] || !member['Last Name']) return false;
            
            const memberProfile = this.analyzeMemberProfile(member);
            const hasGTMCapabilities = memberProfile.gtmCapabilities.hasGTM;
            const hasGTMNeeds = targetProfile.needs.includes('gtm_partnerships');
            const industryAlignment = this.hasIndustryAlignment(targetProfile, memberProfile);
            
            return hasGTMCapabilities && (hasGTMNeeds || industryAlignment);
        });
    }

    findServiceMatches(targetMember, targetProfile) {
        return this.members.filter(member => {
            if (member === targetMember || !member['First Name'] || !member['Last Name']) return false;
            
            const memberProfile = this.analyzeMemberProfile(member);
            const isServiceProvider = memberProfile.serviceOfferings.isServiceProvider;
            const hasServiceNeeds = this.hasServiceNeeds(targetProfile);
            const serviceRelevance = this.isServiceRelevant(targetProfile, memberProfile);
            
            return isServiceProvider && (hasServiceNeeds || serviceRelevance);
        });
    }

    // Enhanced scoring and matching logic
    sortMatchesByRelevance(matches, targetProfile, category) {
        return matches.sort((a, b) => {
            const aProfile = this.analyzeMemberProfile(a);
            const bProfile = this.analyzeMemberProfile(b);
            
            const aScore = this.calculateAdvancedMatchScore(targetProfile, aProfile, category);
            const bScore = this.calculateAdvancedMatchScore(targetProfile, bProfile, category);
            
            // Prioritize commission potential for revenue-generating categories
            const commissionWeight = this.commissionWeights[category] || 0.3;
            const aCommission = aProfile.commissionPotential * commissionWeight;
            const bCommission = bProfile.commissionPotential * commissionWeight;
            
            return (bScore + bCommission) - (aScore + aCommission);
        });
    }

    calculateAdvancedMatchScore(targetProfile, matchProfile, category) {
        let score = 0;
        let total = 0;
        
        // Industry alignment (30% weight)
        total += 30;
        if (this.hasIndustryAlignment(targetProfile, matchProfile)) score += 30;
        
        // Goal complementarity (25% weight)
        total += 25;
        if (this.hasComplementaryGoals(targetProfile, matchProfile)) score += 25;
        
        // Stage alignment (20% weight)
        total += 20;
        if (this.hasStageAlignment(targetProfile, matchProfile)) score += 20;
        
        // Location proximity (15% weight)
        total += 15;
        if (this.hasLocationProximity(targetProfile, matchProfile)) score += 15;
        
        // Network value (10% weight)
        total += 10;
        score += (matchProfile.networkValue / 100) * 10;
        
        return Math.round((score / total) * 100) / 100;
    }

    // Helper methods for enhanced matching
    hasIndustryAlignment(profile1, profile2) {
        const industry1 = profile1.industry.toLowerCase();
        const industry2 = profile2.industry.toLowerCase();
        
        if (industry1 === industry2) return true;
        
        // Check for related industries
        const relatedIndustries = {
            'ai & ml': ['b2b saas', 'fintech', 'hardware'],
            'b2b saas': ['ai & ml', 'fintech', 'ecom'],
            'fintech': ['ai & ml', 'b2b saas', 'blockchain'],
            'ecom': ['b2b saas', 'd2c consumer', 'fintech'],
            'd2c consumer': ['ecom', 'b2b saas', 'ai & ml']
        };
        
        return relatedIndustries[industry1]?.includes(industry2) || 
               relatedIndustries[industry2]?.includes(industry1);
    }

    hasComplementaryGoals(profile1, profile2) {
        const goals1 = profile1.goals;
        const goals2 = profile2.goals;
        
        // Fundraising + Investor
        if (goals1.fundraising && profile2.investorProfile.isInvestor) return true;
        
        // GTM + GTM Partner
        if (goals1.gtm && profile2.gtmCapabilities.hasGTM) return true;
        
        // Hiring + Service Provider
        if (goals1.hiring && profile2.serviceOfferings.isServiceProvider) return true;
        
        // Partnership goals alignment
        if (goals1.partnerships && goals2.partnerships) return true;
        
        return false;
    }

    hasStageAlignment(profile1, profile2) {
        const stage1 = profile1.stage.toLowerCase();
        const stage2 = profile2.stage.toLowerCase();
        
        // Similar stages
        if (stage1 === stage2) return true;
        
        // Adjacent stages for mentorship/advice
        const stageProgression = ['pre-seed', 'seed', 'series a', 'series b', 'series c'];
        const index1 = stageProgression.findIndex(s => stage1.includes(s));
        const index2 = stageProgression.findIndex(s => stage2.includes(s));
        
        return Math.abs(index1 - index2) <= 1;
    }

    hasLocationProximity(profile1, profile2) {
        const location1 = profile1.location.toLowerCase();
        const location2 = profile2.location.toLowerCase();
        
        if (location1 === location2) return true;
        
        // Check for same region/city
        const regions = {
            'san francisco': ['bay area', 'sf', 'silicon valley', 'palo alto'],
            'new york': ['nyc', 'manhattan', 'brooklyn', 'ny'],
            'los angeles': ['la', 'hollywood', 'santa monica', 'california']
        };
        
        for (const [region, cities] of Object.entries(regions)) {
            if ((location1.includes(region) || cities.some(c => location1.includes(c))) &&
                (location2.includes(region) || cities.some(c => location2.includes(c)))) {
                return true;
            }
        }
        
        return false;
    }

    // Enhanced rationale generation
    generateAdvancedRationale(targetProfile, matchProfile, category) {
        const targetName = targetProfile.name;
        const matchName = matchProfile.name;
        const targetCompany = targetProfile.company;
        const matchCompany = matchProfile.company;
        const targetIndustry = targetProfile.industry;
        const matchIndustry = matchProfile.industry;
        
        switch(category) {
            case this.categories.HIGH_TRACTION_FOUNDERS:
                return `${matchName} has successfully scaled ${matchCompany} in ${matchIndustry} (${matchProfile.tractionScore}/100 traction score) and can share valuable insights on ${targetProfile.goals.company || 'business growth'}. Both founders are in complementary stages and can collaborate on strategic partnerships and knowledge sharing.`;
                
            case this.categories.ACTIVE_INVESTORS:
                return `${matchName} invests in ${matchIndustry} companies at ${matchProfile.investorProfile.investmentStage} stage and could provide strategic capital and guidance for ${targetCompany}'s ${targetProfile.goals.fundraising ? 'fundraising' : 'growth'} needs. Investment focus aligns with your industry and stage.`;
                
            case this.categories.STRATEGIC_GTM:
                return `${matchName} specializes in ${matchIndustry} go-to-market strategies and can help ${targetCompany} accelerate growth through ${matchProfile.gtmCapabilities.salesExpertise ? 'sales expertise' : 'marketing strategies'}. Strong potential for revenue-generating partnerships.`;
                
            case this.categories.SERVICE_PROVIDERS:
                return `${matchName} provides essential ${matchIndustry} services that could support ${targetCompany}'s ${targetProfile.needs.join(', ')} needs and accelerate business development. Proven track record with similar companies.`;
                
            default:
                return `Strong potential for collaboration based on complementary expertise and aligned business objectives.`;
        }
    }

    // Enhanced value proposition generation
    generateAdvancedValue(targetProfile, matchProfile, category) {
        const commissionPotential = matchProfile.commissionPotential;
        const networkValue = matchProfile.networkValue;
        
        switch(category) {
            case this.categories.HIGH_TRACTION_FOUNDERS:
                return `Knowledge sharing, strategic partnerships, social capital expansion. GLO earns on partnership deals and revenue sharing agreements. High network value: ${networkValue}/100. Potential for cross-promotion and joint ventures.`;
                
            case this.categories.ACTIVE_INVESTORS:
                return `Potential investment, strategic guidance, network access to other portfolio companies. GLO earns investment commission (${commissionPotential}/100 potential). High-value connection for fundraising and strategic advice.`;
                
            case this.categories.STRATEGIC_GTM:
                return `Sales growth, market expansion, revenue acceleration through proven GTM strategies. GLO earns on GTM outcomes and performance-based commissions. Strong traction score: ${matchProfile.tractionScore}/100. Potential for significant revenue impact.`;
                
            case this.categories.SERVICE_PROVIDERS:
                return `Essential business services, operational support, and specialized expertise. GLO earns referral fees and ongoing service commissions. Reliable revenue stream with potential for long-term partnerships.`;
                
            default:
                return `Mutual value creation with commission potential and network expansion opportunities.`;
        }
    }

    // Generate specific match reasons
    generateMatchReasons(targetProfile, matchProfile, category) {
        const reasons = [];
        
        if (this.hasIndustryAlignment(targetProfile, matchProfile)) {
            reasons.push('Industry alignment');
        }
        
        if (this.hasComplementaryGoals(targetProfile, matchProfile)) {
            reasons.push('Complementary goals');
        }
        
        if (this.hasStageAlignment(targetProfile, matchProfile)) {
            reasons.push('Stage alignment');
        }
        
        if (matchProfile.tractionScore >= 70) {
            reasons.push('High traction potential');
        }
        
        if (matchProfile.networkValue >= 70) {
            reasons.push('Strong network value');
        }
        
        if (matchProfile.commissionPotential >= 60) {
            reasons.push('High commission potential');
        }
        
        if (this.hasLocationProximity(targetProfile, matchProfile)) {
            reasons.push('Geographic proximity');
        }
        
        return reasons;
    }

    // Generate suggested next steps
    generateNextSteps(targetProfile, matchProfile, category) {
        const steps = [];
        
        switch(category) {
            case this.categories.HIGH_TRACTION_FOUNDERS:
                steps.push('Schedule founder-to-founder call');
                steps.push('Explore partnership opportunities');
                steps.push('Share growth strategies and challenges');
                steps.push('Discuss potential collaboration areas');
                break;
                
            case this.categories.ACTIVE_INVESTORS:
                steps.push('Prepare pitch deck and financial projections');
                steps.push('Schedule investor meeting');
                steps.push('Discuss investment timeline and terms');
                steps.push('Leverage investor network for introductions');
                break;
                
            case this.categories.STRATEGIC_GTM:
                steps.push('Assess current GTM challenges and needs');
                steps.push('Plan collaboration strategy and metrics');
                steps.push('Set performance milestones and revenue targets');
                steps.push('Explore partnership or service agreements');
                break;
                
            case this.categories.SERVICE_PROVIDERS:
                steps.push('Evaluate specific service requirements');
                steps.push('Discuss engagement terms and pricing');
                steps.push('Plan implementation timeline');
                steps.push('Set up trial or pilot engagement');
                break;
        }
        
        return steps;
    }

    // Helper methods for goal analysis
    hasFundraisingGoals(member) {
        const goals = (member['Professional Goals'] || member['Company Goals'] || '').toLowerCase();
        return goals.includes('fundraising') || goals.includes('raise') || goals.includes('investment') || goals.includes('capital');
    }

    hasGTMGoals(member) {
        const goals = (member['Professional Goals'] || member['Company Goals'] || '').toLowerCase();
        return goals.includes('gtm') || goals.includes('sales') || goals.includes('growth') || goals.includes('marketing') || goals.includes('revenue');
    }

    hasPartnershipGoals(member) {
        const goals = (member['Professional Goals'] || member['Company Goals'] || '').toLowerCase();
        return goals.includes('partnership') || goals.includes('collaboration') || goals.includes('alliance') || goals.includes('network');
    }

    hasHiringGoals(member) {
        const goals = (member['Professional Goals'] || member['Company Goals'] || '').toLowerCase();
        return goals.includes('hiring') || goals.includes('talent') || goals.includes('team') || goals.includes('recruit');
    }

    hasExpansionGoals(member) {
        const goals = (member['Professional Goals'] || member['Company Goals'] || '').toLowerCase();
        return goals.includes('expansion') || goals.includes('scale') || goals.includes('growth') || goals.includes('market');
    }

    // Enhanced helper methods
    isRelevantForFundraising(targetProfile, investorProfile) {
        const targetStage = targetProfile.stage.toLowerCase();
        const investorStage = investorProfile.investorProfile.investmentStage.toLowerCase();
        const targetIndustry = targetProfile.industry.toLowerCase();
        const investorIndustries = investorProfile.investorProfile.investmentFocus;
        
        // Stage alignment
        const stageMatch = (targetStage.includes('seed') && investorStage.includes('seed')) ||
                          (targetStage.includes('series a') && investorStage.includes('series a')) ||
                          (targetStage.includes('series b') && investorStage.includes('series b'));
        
        // Industry alignment
        const industryMatch = investorIndustries.some(industry => 
            targetIndustry.includes(industry) || industry.includes(targetIndustry)
        );
        
        return stageMatch || industryMatch || targetProfile.goals.fundraising;
    }

    hasInvestmentCapacity(investorProfile) {
        const fundSize = investorProfile.investorProfile.fundSize.toLowerCase();
        const averageCheck = investorProfile.investorProfile.averageCheck.toLowerCase();
        return fundSize.includes('$') || averageCheck.includes('$') || investorProfile.investorProfile.isInvestor;
    }

    hasServiceNeeds(targetProfile) {
        return targetProfile.needs.some(need => 
            need.includes('legal') || need.includes('consulting') || need.includes('agency') || 
            need.includes('talent') || need.includes('technical')
        );
    }

    isServiceRelevant(targetProfile, serviceProfile) {
        const targetNeeds = targetProfile.needs;
        const serviceOfferings = serviceProfile.serviceOfferings;
        
        return (targetNeeds.includes('legal') && serviceOfferings.legalServices) ||
               (targetNeeds.includes('consulting') && serviceOfferings.consultingServices) ||
               (targetNeeds.includes('agency') && serviceOfferings.agencyServices) ||
               (targetNeeds.includes('technical') && serviceOfferings.technicalServices);
    }

    // Parse CSV and extract member data (keeping existing robust parsing)
    parseMembers(csvText) {
        const headers = this.extractHeaders(csvText);
        this.members = this.parseCSVRecords(csvText, headers);
        return this.members.length;
    }

    extractHeaders(csvText) {
        const firstLine = csvText.split('\n')[0];
        return this.parseCSVLine(firstLine).map(h => h.trim());
    }

    parseCSVRecords(csvText, headers) {
        const records = [];
        const lines = csvText.split('\n');
        let currentLine = '';

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const startsNewRecord = this.startsNewMemberRecord(line);
            
            if (startsNewRecord && currentLine.trim()) {
                const values = this.parseCSVLine(currentLine);
                if (values.length >= headers.length) {
                    const member = this.createMemberObject(headers, values);
                    if (member['First Name'] && member['Last Name']) {
                        records.push(member);
                    }
                }
                currentLine = line;
            } else {
                currentLine += (currentLine ? '\n' : '') + line;
            }
        }

        if (currentLine.trim()) {
            const values = this.parseCSVLine(currentLine);
            if (values.length >= headers.length) {
                const member = this.createMemberObject(headers, values);
                if (member['First Name'] && member['Last Name']) {
                    records.push(member);
                }
            }
        }

        return records;
    }

    startsNewMemberRecord(line) {
        const trimmed = line.trim();
        if (!trimmed) return false;
        
        const parts = trimmed.split(',');
        if (parts.length < 2) return false;
        
        const firstName = parts[0].trim();
        const lastName = parts[1].trim();
        
        const namePattern = /^[A-Za-z]+$/;
        return namePattern.test(firstName) && namePattern.test(lastName) && 
               firstName.length > 0 && lastName.length > 0 &&
               firstName.length < 20 && lastName.length < 20;
    }

    createMemberObject(headers, values) {
        const member = {};
        headers.forEach((header, index) => {
            member[header] = values[index] || '';
        });
        return member;
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