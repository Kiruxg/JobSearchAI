class CoverLetterGenerator {
    constructor() {
        // Initialize logger first
        this.log = {
            info: (msg) => console.log(`✨ [CoverLetter]: ${msg}`),
            error: (msg) => console.error(`❌ [CoverLetter]: ${msg}`),
            success: (msg) => console.log(`✅ [CoverLetter]: ${msg}`)
        };

        // Initialize after DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        try {
            this.initializeElements();
            if (this.isGeneratorPage()) {
                this.attachEventListeners();
                this.templates = {
                    corporate: {
                        name: "Corporate",
                        icon: "📌",
                        style: "formal",
                        description: "Professional format ideal for traditional industries"
                    },
                    creative: {
                        name: "Creative",
                        icon: "🎨",
                        style: "modern",
                        description: "Dynamic format for creative and marketing roles"
                    },
                    tech: {
                        name: "Tech",
                        icon: "💻",
                        style: "technical",
                        description: "Focused format for software and engineering positions"
                    }
                };
                this.log.info('Cover Letter Generator initialized');
            }
        } catch (error) {
            this.log.error('Initialization failed:', error);
        }
    }

    isGeneratorPage() {
        // Check if we're on the cover letter generator page
        return document.getElementById('coverLetterForm') !== null;
    }

    initializeElements() {
        // Only initialize elements if we're on the generator page
        if (!this.isGeneratorPage()) return;

        // Input elements
        this.jobTitleInput = document.getElementById('jobTitle');
        this.companyNameInput = document.getElementById('companyName');
        this.jobDescriptionInput = document.getElementById('jobDescription');
        this.keyAchievementsInput = document.getElementById('keyAchievements');
        this.generateButton = document.getElementById('generateButton');
        this.resumeFileInput = document.getElementById('resumeFile');
        this.uploadContainer = document.getElementById('uploadContainer');
        this.uploadPreview = document.getElementById('uploadPreview');

        // Preview elements
        this.previewContent = document.getElementById('coverLetterPreview');
        this.copyButton = document.getElementById('copyButton');
        this.downloadButton = document.getElementById('downloadButton');

        // Loading elements
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');

        // New elements
        this.resumeInput = document.getElementById('resumeText');
        this.templateSelector = document.getElementById('templateStyle');
        this.strengthMeter = document.getElementById('strengthMeter');
        this.keywordsList = document.getElementById('keywordsList');

        // Validate required elements
        if (!this.resumeFileInput) {
            throw new Error('Required elements not found');
        }
    }

    attachEventListeners() {
        // Only attach listeners if we're on the generator page
        if (!this.isGeneratorPage()) return;

        if (this.resumeFileInput && this.uploadContainer) {
            this.log.info('Attaching file input listener');
            
            // File upload listeners
            this.resumeFileInput.addEventListener('change', (e) => {
                this.log.info('File input change detected');
                this.handleFileUpload(e);
            });

            // Drag and drop listeners
            const uploadContainer = document.querySelector('.upload-container');
            if (uploadContainer) {
                uploadContainer.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadContainer.classList.add('dragging');
                });

                uploadContainer.addEventListener('dragleave', () => {
                    uploadContainer.classList.remove('dragging');
                });

                uploadContainer.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadContainer.classList.remove('dragging');
                    const files = e.dataTransfer.files;
                    if (files.length) {
                        this.resumeFileInput.files = files;
                        this.handleFileUpload({ target: { files } });
                    }
                });
            }
        } else {
            this.log.error('File input element not found');
        }

        // Other button listeners
        if (this.generateButton) {
            this.generateButton.addEventListener('click', () => this.generateCoverLetter());
        }
        if (this.copyButton) {
            this.copyButton.addEventListener('click', () => this.copyToClipboard());
        }
        if (this.downloadButton) {
            this.downloadButton.addEventListener('click', () => this.downloadCoverLetter());
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.log.info(`Attempting to upload file: ${file.name}`);

        // Validate file type
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!validTypes.includes(file.type)) {
            const error = `Invalid file type: ${file.type}. Please upload a PDF or Word document`;
            this.log.error(error);
            this.showError(error);
            this.resetFileUpload();
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            const error = `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 5MB`;
            this.log.error(error);
            this.showError(error);
            this.resetFileUpload();
            return;
        }

        // Store the uploaded file
        this.uploadedFile = file;
        this.log.success(`File validated and stored: ${file.name}`);
        this.updateFilePreview(file);
        this.showSuccess(`Resume uploaded successfully!`);
    }

    async generateCoverLetter() {
        try {
            this.log.info(`Current uploaded file: ${this.uploadedFile ? this.uploadedFile.name : 'none'}`);

            if (!this.validateInputs()) return;

            this.showLoading('Analyzing inputs...');
            this.log.info('Starting cover letter generation');

            // Get form data
            const data = {
                jobTitle: this.jobTitleInput.value.trim(),
                companyName: this.companyNameInput.value.trim(),
                jobDescription: this.jobDescriptionInput.value.trim(),
                keyAchievements: this.keyAchievementsInput.value.trim(),
                resumeFile: this.uploadedFile
            };

            this.log.info(`Generating cover letter with resume: ${this.uploadedFile.name}`);

            // Generate content with error checking
            let content;
            try {
                content = this.generateContent(data);
                this.log.info('Content generated:', content.substring(0, 50) + '...'); // Log first 50 chars
            } catch (error) {
                throw new Error(`Content generation failed: ${error.message}`);
            }

            // Update preview
            try {
                this.updatePreview(content);
                this.log.success('Cover letter generated successfully');
                this.showSuccess('Cover letter generated!');
            } catch (error) {
                throw new Error(`Preview update failed: ${error.message}`);
            }

        } catch (error) {
            this.log.error('Generation failed:', error);
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    validateInputs() {
        // Debug log
        this.log.info(`Validating inputs. File status: ${this.uploadedFile ? 'present' : 'missing'}`);

        const requiredFields = {
            'Job Title': this.jobTitleInput.value,
            'Company Name': this.companyNameInput.value,
            'Job Description': this.jobDescriptionInput.value
        };

        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value.trim()) {
                this.showError(`${field} is required`);
                this.log.error(`Validation failed: ${field} is empty`);
                return false;
            }
        }

        if (!this.uploadedFile) {
            this.showError('Please upload your resume');
            this.log.error('Validation failed: No resume uploaded');
            return false;
        }

        this.log.success(`Validation passed. Using resume: ${this.uploadedFile.name}`);
        return true;
    }

    resetFileUpload() {
        if (this.resumeFileInput) {
            this.resumeFileInput.value = '';
        }
        if (this.uploadPreview) {
            this.uploadPreview.classList.remove('active');
            this.uploadPreview.innerHTML = '';
        }
        this.uploadedFile = null;
        this.log.info('File upload reset');
    }

    analyzeJobDescription(text) {
        // Simple keyword extraction for now
        const keywords = this.extractKeywords(text);
        return {
            keywords: keywords,
            requirements: keywords, // Simplified for now
            responsibilities: keywords // Simplified for now
        };
    }

    extractKeywords(text) {
        // Basic keyword extraction
        const commonWords = new Set(['and', 'the', 'or', 'in', 'at', 'to', 'for']);
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !commonWords.has(word));
        
        return [...new Set(words)];
    }

    analyzeResume(text) {
        // Simple keyword extraction for now
        return {
            keywords: this.extractKeywords(text),
            skills: this.extractKeywords(text),
            experience: []
        };
    }

    findMatchingStrengths(jobInfo, resumeInfo) {
        // Find overlapping keywords
        const matchingKeywords = jobInfo.keywords.filter(keyword => 
            resumeInfo.keywords.includes(keyword)
        );

        return matchingKeywords;
    }

    generateContent(data) {
        if (!data || !data.jobTitle || !data.companyName) {
            throw new Error('Missing required data for content generation');
        }

        this.log.info('Generating content from template');
        
        let bodyContent = '';
        
        // Add achievements if provided
        if (data.keyAchievements && data.keyAchievements.trim()) {
            bodyContent += `Throughout my career, I have demonstrated expertise in digital media development. Some of my key achievements include:\n\n${data.keyAchievements}\n\n`;
        }

        // Add job-specific content
        bodyContent += `I am confident that my experience and skills make me an ideal candidate for this position. I am particularly drawn to ${data.companyName}'s commitment to innovation and excellence in the digital space.`;

        // Construct the full letter
        const content = `
${new Date().toLocaleDateString()}

Dear Hiring Manager,

I am writing to express my strong interest in the ${data.jobTitle} position at ${data.companyName}. With my background in digital media development and my passion for creating engaging content, I am confident in my ability to contribute effectively to your team.

${bodyContent}

I am particularly excited about the opportunity to join ${data.companyName} and would welcome the chance to discuss how my skills and experience align with your needs. Thank you for considering my application.

Sincerely,
[Your Name]`.trim();

        if (!content) {
            throw new Error('Generated content is empty');
        }

        this.log.info('Content generated successfully');
        return content;
    }

    updateStrengthMeter(data) {
        const score = this.calculateStrengthScore(data);
        this.strengthMeter.innerHTML = `
            <div class="strength-score">
                <span class="score">${score}%</span>
                <span class="label">Match</span>
            </div>
            <div class="strength-bar">
                <div class="bar-fill" style="width: ${score}%"></div>
            </div>
        `;
    }

    calculateStrengthScore(data) {
        const totalKeywords = this.analyzeJobDescription(data.jobDescription).keywords.length;
        const matchingKeywords = this.findMatchingStrengths(this.analyzeJobDescription(data.jobDescription), this.analyzeResume(data.resumeFile.name)).length;
        return Math.round((matchingKeywords / totalKeywords) * 100);
    }

    updateKeywordsList(jobKeywords, resumeKeywords) {
        const missing = jobKeywords.filter(keyword => !resumeKeywords.includes(keyword));
        this.keywordsList.innerHTML = `
            <h3>Missing Keywords</h3>
            <ul>
                ${missing.map(keyword => `<li>${keyword}</li>`).join('')}
            </ul>
        `;
    }

    updatePreview(content) {
        this.previewContent.innerHTML = content;
    }

    async copyToClipboard() {
        try {
            const content = this.previewContent.innerText;
            await navigator.clipboard.writeText(content);
            this.showSuccess('Copied to clipboard!');
        } catch (error) {
            this.showError('Failed to copy to clipboard');
        }
    }

    downloadCoverLetter() {
        try {
            const content = this.previewContent.innerText;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cover-letter-${this.companyNameInput.value}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            this.showError('Failed to download cover letter');
        }
    }

    showLoading(message = 'Processing...') {
        if (this.loadingOverlay && this.loadingText) {
            this.loadingText.textContent = message;
            this.loadingOverlay.classList.add('active');
        }
        if (this.generateButton) {
            this.generateButton.disabled = true;
        }
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('active');
        }
        if (this.generateButton) {
            this.generateButton.disabled = false;
        }
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            ${message}
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            ${message}
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    updateFilePreview(file) {
        if (!this.uploadPreview) {
            this.log.error('Upload preview element not found');
            return;
        }

        this.log.info(`Updating preview for file: ${file.name}`);
        
        this.uploadPreview.innerHTML = `
            <div class="file-info">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <span class="file-name">${file.name}</span>
                <span class="upload-success">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Uploaded
                </span>
            </div>
            <button type="button" class="remove-file" onclick="coverLetterGenerator.resetFileUpload()">
                ✕
            </button>
        `;
        this.uploadPreview.classList.add('active');
        this.log.info(`Preview updated for file: ${file.name}`);
    }
}

// Initialize when DOM is loaded
const coverLetterGenerator = new CoverLetterGenerator(); 