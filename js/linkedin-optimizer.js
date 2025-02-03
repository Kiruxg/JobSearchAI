class LinkedInOptimizer {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeChecklist();
        this.profileFetchLimit = 3; // Free user limit
        this.fetchCount = parseInt(localStorage.getItem('linkedinFetchCount') || 0);
    }

    initializeElements() {
        // Input elements
        this.linkedinUrl = document.getElementById('linkedinUrl');
        this.fetchButton = document.getElementById('fetchProfile');
        this.headlineInput = document.getElementById('profileHeadline');
        this.aboutInput = document.getElementById('aboutSection');
        this.skillsInput = document.getElementById('skillsList');
        this.analyzeButton = document.getElementById('analyzeProfile');

        // Results elements
        this.profileScore = document.getElementById('profileScore');
        this.tipsList = document.getElementById('tipsList');
        this.keywordCloud = document.getElementById('keywordCloud');
        this.keywordSuggestions = document.getElementById('keywordSuggestions');
    }

    attachEventListeners() {
        this.fetchButton.addEventListener('click', () => this.handleProfileFetch());
        this.analyzeButton.addEventListener('click', () => this.analyzeProfile());
        
        // Real-time analysis for free users (limited)
        this.headlineInput.addEventListener('input', debounce(() => this.quickAnalyze('headline'), 500));
        this.aboutInput.addEventListener('input', debounce(() => this.quickAnalyze('about'), 500));
        this.skillsInput.addEventListener('input', debounce(() => this.quickAnalyze('skills'), 500));

        // URL validation
        this.linkedinUrl.addEventListener('input', () => this.validateLinkedInUrl());
    }

    validateLinkedInUrl() {
        const url = this.linkedinUrl.value.trim();
        const isValid = url.match(/^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/);
        
        this.fetchButton.disabled = !isValid;
        
        if (url && !isValid) {
            this.showToast('Please enter a valid LinkedIn profile URL', 'error');
        }
    }

    async handleProfileFetch() {
        if (this.fetchCount >= this.profileFetchLimit) {
            this.showToast('Free user limit reached. Upgrade to Pro for unlimited profile imports!', 'info');
            return;
        }

        const url = this.linkedinUrl.value.trim();
        
        try {
            this.showLoadingState('fetchButton', 'Importing...');
            
            // Simulate API call for demo
            const profileData = await this.fetchProfileData(url);
            
            // Update inputs with fetched data
            this.headlineInput.value = profileData.headline;
            this.aboutInput.value = profileData.about;
            this.skillsInput.value = profileData.skills.join(', ');

            this.incrementFetchCount();
            this.showToast('Profile imported successfully!', 'success');
        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.hideLoadingState('fetchButton', 'Import Profile');
        }
    }

    async fetchProfileData(url) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real implementation, this would make an API call to fetch profile data
        // For demo, return mock data
        return {
            headline: "Software Engineer | Full Stack Developer | JavaScript Expert",
            about: "Passionate software engineer with 5+ years of experience...",
            skills: ["JavaScript", "React", "Node.js", "Python", "AWS"]
        };
    }

    incrementFetchCount() {
        this.fetchCount++;
        localStorage.setItem('linkedinFetchCount', this.fetchCount);
        
        if (this.fetchCount >= this.profileFetchLimit) {
            this.fetchButton.disabled = true;
            this.showToast(`You've reached the free import limit. Upgrade to Pro for unlimited imports!`, 'info');
        }
    }

    showLoadingState(buttonId, text) {
        const button = buttonId === 'fetchButton' ? this.fetchButton : this.analyzeButton;
        button.disabled = true;
        button.textContent = text;
    }

    hideLoadingState(buttonId, text) {
        const button = buttonId === 'fetchButton' ? this.fetchButton : this.analyzeButton;
        button.disabled = false;
        button.textContent = text;
    }

    initializeChecklist() {
        const checklists = {
            'basicsChecklist': this.getBasicChecklist(),
            'contentChecklist': this.getContentChecklist(),
            'networkChecklist': this.getNetworkChecklist(),
            'seoChecklist': this.getSEOChecklist()
        };

        // Initialize all checklists
        for (const [id, items] of Object.entries(checklists)) {
            const ul = document.getElementById(id);
            ul.innerHTML = items.map(item => `
                <li data-item="${item.id}">${item.text}</li>
            `).join('');
        }
    }

    async analyzeProfile() {
        this.showLoadingState();

        // Collect profile data
        const profileData = {
            headline: this.headlineInput.value,
            about: this.aboutInput.value,
            skills: this.skillsInput.value.split(',').map(s => s.trim())
        };

        try {
            // Basic analysis for free users
            const analysis = await this.performAnalysis(profileData);
            this.updateResults(analysis);
            this.showToast('Profile analysis completed!');
        } catch (error) {
            this.showToast('Error analyzing profile', 'error');
        }

        this.hideLoadingState();
    }

    async performAnalysis(profileData) {
        // Simulate API call for demo
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    score: this.calculateProfileScore(profileData),
                    tips: this.generateTips(profileData),
                    keywords: this.analyzeKeywords(profileData),
                    suggestions: this.generateKeywordSuggestions(profileData)
                });
            }, 1500);
        });
    }

    calculateProfileScore(profileData) {
        let score = 0;
        const maxScore = 100;

        // Headline analysis (max 25 points)
        if (profileData.headline) {
            score += Math.min(25, profileData.headline.length / 2);
        }

        // About section analysis (max 35 points)
        if (profileData.about) {
            score += Math.min(35, profileData.about.length / 20);
        }

        // Skills analysis (max 40 points)
        if (profileData.skills.length) {
            score += Math.min(40, profileData.skills.length * 4);
        }

        return Math.min(Math.round(score), maxScore);
    }

    generateTips(profileData) {
        const tips = [];

        // Headline tips
        if (!profileData.headline) {
            tips.push('Add a professional headline to increase visibility');
        } else if (profileData.headline.length < 50) {
            tips.push('Make your headline more descriptive (aim for 50-120 characters)');
        }

        // About section tips
        if (!profileData.about) {
            tips.push('Add an "About" section to tell your professional story');
        } else if (profileData.about.length < 200) {
            tips.push('Expand your "About" section with more details about your experience');
        }

        // Skills tips
        if (profileData.skills.length < 5) {
            tips.push('Add more relevant skills to improve searchability');
        }

        return tips;
    }

    analyzeKeywords(profileData) {
        // Extract and analyze keywords (limited for free users)
        const allText = `${profileData.headline} ${profileData.about}`;
        const words = allText.toLowerCase().match(/\b\w+\b/g) || [];
        const keywordCount = {};

        words.forEach(word => {
            if (word.length > 3) { // Ignore small words
                keywordCount[word] = (keywordCount[word] || 0) + 1;
            }
        });

        return Object.entries(keywordCount)
            .sort((a, b) => b[1] — a[1])
            .slice(0, 10); // Limit to top 10 keywords for free users
    }

    generateKeywordSuggestions(profileData) {
        // Basic industry-specific keywords (limited for free users)
        const commonKeywords = {
            'technology': ['innovative', 'technical', 'solutions', 'development'],
            'marketing': ['strategic', 'digital', 'growth', 'campaigns'],
            'sales': ['revenue', 'business development', 'relationship management'],
            'general': ['leadership', 'project management', 'analytics']
        };

        return commonKeywords.general; // Free users get general suggestions only
    }

    updateResults(analysis) {
        // Update profile score with animation
        this.animateScore(analysis.score);

        // Update tips
        this.tipsList.innerHTML = analysis.tips.map(tip => `
            <div class="tip-item">${tip}</div>
        `).join('');

        // Update keyword cloud (limited for free users)
        this.keywordCloud.innerHTML = analysis.keywords.map(([keyword, count]) => `
            <span class="keyword" style="font-size: ${12 + count * 2}px">${keyword}</span>
        `).join('');

        // Update keyword suggestions
        this.keywordSuggestions.innerHTML = analysis.suggestions.map(keyword => `
            <div class="suggestion-item">${keyword}</div>
        `).join('');
    }

    animateScore(targetScore) {
        const duration = 1000;
        const startScore = parseInt(this.profileScore.textContent);
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime — startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentScore = Math.round(startScore + (targetScore — startScore) * progress);
            this.profileScore.textContent = currentScore;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    quickAnalyze(section) {
        // Quick analysis for free users (limited functionality)
        const element = this[`${section}Input`];
        const value = element.value;

        if (section === 'headline') {
            if (value.length < 50) {
                this.showToast('Tip: Add more details to your headline', 'info');
            }
        } else if (section === 'about' && value.length > 0) {
            if (value.length < 200) {
                this.showToast('Tip: Expand your about section', 'info');
            }
        }
    }

    showToast(message, type = 'success') {
        const event = new CustomEvent('showToast', {
            detail: { message, type }
        });
        document.dispatchEvent(event);
    }

    // Helper methods for checklist items
    getBasicChecklist() {
        return [
            { id: 'photo', text: 'Professional profile photo' },
            { id: 'background', text: 'Custom background image' },
            { id: 'url', text: 'Customized URL' },
            { id: 'location', text: 'Location updated' }
        ];
    }

    getContentChecklist() {
        return [
            { id: 'headline', text: 'Compelling headline' },
            { id: 'about', text: 'Detailed about section' },
            { id: 'activity', text: 'Recent activity' },
            { id: 'media', text: 'Media attachments' }
        ];
    }

    getNetworkChecklist() {
        return [
            { id: 'connections', text: 'Industry connections' },
            { id: 'groups', text: 'Group participation' },
            { id: 'recommendations', text: 'Recommendations' },
            { id: 'endorsements', text: 'Endorsements' }
        ];
    }

    getSEOChecklist() {
        return [
            { id: 'keywords', text: 'Industry keywords' },
            { id: 'skills', text: 'Skills optimization' },
            { id: 'visibility', text: 'Search visibility' },
            { id: 'completeness', text: 'Profile completeness' }
        ];
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.linkedInOptimizer = new LinkedInOptimizer();
}); 