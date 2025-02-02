class CoverLetterGenerator {
  constructor() {
    // Initialize logger first
    this.log = {
      info: (msg) => console.log(`✨ [CoverLetter]: ${msg}`),
      error: (msg) => console.error(`❌ [CoverLetter]: ${msg}`),
      success: (msg) => console.log(`✅ [CoverLetter]: ${msg}`),
    };

    // Add mission-related patterns
    this.missionPatterns = [
      /(?:our|company|organization)?\s*mission\s*(?:is|:)\s*(.*?)(?:\.|\n|$)/i,
      /(?:we are|we're)\s+(?:dedicated|committed)\s+to\s+(.*?)(?:\.|\n|$)/i,
      /(?:our|company|organization)?\s*purpose\s*(?:is|:)\s*(.*?)(?:\.|\n|$)/i,
      /(?:our|company|organization)?\s*vision\s*(?:is|:)\s*(.*?)(?:\.|\n|$)/i,
      /(?:we|company|organization)?\s*strive[s]?\s+to\s+(.*?)(?:\.|\n|$)/i,
      /focused\s+on\s+(.*?)(?:\.|\n|$)/i
    ];

    this.missionIndicators = new Set([
      "mission",
      "vision",
      "purpose",
      "aim",
      "goal",
      "strive",
      "dedicated to",
      "committed to",
      "focused on",
      "seeks to",
      "working to",
      "aspires to"
    ]);

    // Initialize after DOM is fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    try {
      this.log.info("Initializing Cover Letter Generator...");

      // Initialize elements
      this.initializeElements();

      // Attach event listeners
      if (this.resumeFileInput) {
        this.log.info("Attaching file input listener");
        this.resumeFileInput.addEventListener("change", (event) =>
          this.handleFileUpload(event)
        );
      }

      if (this.generateButton) {
        this.generateButton.addEventListener("click", async () => {
          await this.generateCoverLetter();
        });
      }

      if (this.copyButton) {
        this.copyButton.addEventListener("click", () => this.copyToClipboard());
      }

      if (this.downloadButton) {
        this.downloadButton.addEventListener("click", () =>
          this.downloadCoverLetter()
        );
      }

      this.log.success("Cover Letter Generator initialized successfully");
    } catch (error) {
      this.log.error(`Initialization failed: ${error.message}`);
      console.error("Full initialization error:", error);
    }
  }

  initializeElements() {
    // Input elements
    this.firstNameInput = document.querySelector("#firstName");
    this.lastNameInput = document.querySelector("#lastName");
    this.jobTitleInput = document.querySelector("#jobTitle");
    this.companyNameInput = document.querySelector("#companyName");
    this.jobDescriptionInput = document.querySelector("#jobDescription");
    this.keyAchievementsInput = document.querySelector("#keyAchievements");
    this.resumeFileInput = document.querySelector("#resumeFile");

    // Buttons
    this.generateButton = document.querySelector("#generateButton");
    this.copyButton = document.querySelector("#copyButton");
    this.downloadButton = document.querySelector("#downloadButton");

    // Other elements
    this.uploadContainer = document.querySelector("#uploadContainer");
    this.uploadPreview = document.querySelector("#uploadPreview");
    this.loadingOverlay = document.querySelector("#loadingOverlay");
    this.loadingText = document.querySelector("#loadingText");

    // Validate critical elements
    const criticalElements = {
      "First Name Input": this.firstNameInput,
      "Last Name Input": this.lastNameInput,
      "Job Title Input": this.jobTitleInput,
      "Company Name Input": this.companyNameInput,
      "Job Description Input": this.jobDescriptionInput,
      "Generate Button": this.generateButton,
    };

    // Log initialization status
    Object.entries(criticalElements).forEach(([name, element]) => {
      if (!element) {
        this.log.error(`${name} not found`);
      }
    });

    // Log overall initialization status
    this.log.info("Elements initialized:", {
      firstName: !!this.firstNameInput,
      lastName: !!this.lastNameInput,
      jobTitle: !!this.jobTitleInput,
      companyName: !!this.companyNameInput,
      jobDescription: !!this.jobDescriptionInput,
      generateButton: !!this.generateButton,
    });
  }

  isGeneratorPage() {
    // Check if we're on the cover letter generator page by looking for the cover-letter-main class
    return document.querySelector(".cover-letter-main") !== null;
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    this.log.info(`Attempting to upload file: ${file.name}`);

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
      const error = `File too large: ${(file.size / 1024 / 1024).toFixed(
        2
      )}MB. Maximum size is 5MB`;
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
      this.log.info("Starting cover letter generation");

      if (!this.validateInputs()) return;

      this.showLoading("Analyzing inputs...");

      const data = {
        firstName: this.firstNameInput.value.trim(),
        lastName: this.lastNameInput.value.trim(),
        jobTitle: this.jobTitleInput.value.trim(),
        companyName: this.companyNameInput.value.trim(),
        jobDescription: this.jobDescriptionInput.value.trim(),
        keyAchievements: this.keyAchievementsInput?.value?.trim() || "",
        resumeFile: this.uploadedFile,
      };

      const content = await this.generateContent(data);

      if (content) {
        this.updatePreview(content);
        this.log.success("Cover letter generated successfully");
        this.showSuccess("Cover letter generated!");
      }
    } catch (error) {
      this.log.error(`Generation failed: ${error.message}`);
      console.error("Full error:", error);
      this.showError("Failed to generate cover letter");
    } finally {
      this.hideLoading();
    }
  }

  validateInputs() {
    // Debug log the actual elements first
    this.log.info("Input elements:", {
      firstNameElement: this.firstNameInput,
      lastNameElement: this.lastNameInput,
      jobTitleElement: this.jobTitleInput,
      companyNameElement: this.companyNameInput,
      jobDescriptionElement: this.jobDescriptionInput,
    });

    // Debug log current values
    this.log.info("Current input values:", {
      firstName: this.firstNameInput?.value,
      lastName: this.lastNameInput?.value,
      jobTitle: this.jobTitleInput?.value,
      companyName: this.companyNameInput?.value,
      jobDescription: this.jobDescriptionInput?.value,
    });

    // Make sure elements are initialized
    if (!this.firstNameInput || !this.lastNameInput) {
      this.log.error("Name input elements not initialized");
      this.showError("Form elements not properly initialized");
      return false;
    }

    const requiredFields = {
      "First Name": this.firstNameInput.value,
      "Last Name": this.lastNameInput.value,
      "Job Title": this.jobTitleInput.value,
      "Company Name": this.companyNameInput.value,
      "Job Description": this.jobDescriptionInput.value,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      this.log.info(`Checking ${field}: "${value}"`);
      if (!value || value.trim() === "") {
        this.showError(`${field} is required`);
        this.log.error(
          `Validation failed: ${field} is empty. Value: "${value}"`
        );
        return false;
      }
    }

    if (!this.uploadedFile) {
      this.showError("Please upload your resume");
      this.log.error("Validation failed: No resume uploaded");
      return false;
    }

    this.log.success("All inputs validated successfully");
    return true;
  }

  resetFileUpload() {
    if (this.resumeFileInput) {
      this.resumeFileInput.value = "";
    }
    if (this.uploadPreview) {
      this.uploadPreview.classList.remove("active");
      this.uploadPreview.innerHTML = "";
    }
    this.uploadedFile = null;
    this.log.info("File upload reset");
  }

  analyzeJobDescription(text) {
    // Simple keyword extraction for now
    const keywords = this.extractKeywords(text);
    return {
      keywords: keywords,
      requirements: keywords, // Simplified for now
      responsibilities: keywords, // Simplified for now
    };
  }

  extractKeywords(text) {
    // Basic keyword extraction
    const commonWords = new Set(["and", "the", "or", "in", "at", "to", "for"]);
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !commonWords.has(word));

    return [...new Set(words)];
  }

  analyzeResume(text) {
    // Simple keyword extraction for now
    return {
      keywords: this.extractKeywords(text),
      skills: this.extractKeywords(text),
      experience: [],
    };
  }

  findMatchingStrengths(jobInfo, resumeInfo) {
    // Find overlapping keywords
    const matchingKeywords = jobInfo.keywords.filter((keyword) =>
      resumeInfo.keywords.includes(keyword)
    );

    return matchingKeywords;
  }

  async extractCurrentRole(resumeFile) {
    try {
      if (!resumeFile) {
        this.log.info("No resume file provided");
        return "professional";
      }

      const resumeText = await this.extractTextFromFile(resumeFile);
      if (!resumeText) {
        this.log.info("Could not extract text from resume");
        return "professional";
      }

      // Look specifically for the experience section
      const experiencePattern = /Experience\s*(.*?)(?=\n\n|\n[A-Z]|$)/s;
      const experienceMatch = resumeText.match(experiencePattern);

      if (experienceMatch && experienceMatch[1]) {
        // Look for job title followed by comma
        const titlePattern = /([^,\n]+),/;
        const titleMatch = experienceMatch[1].match(titlePattern);

        if (titleMatch && titleMatch[1]) {
          const role = titleMatch[1].trim();
          this.log.success(`Found current role: ${role}`);
          return role;
        }
      }

      this.log.info("No role found, using default");
      return "professional";
    } catch (error) {
      this.log.error("Error in role extraction");
      return "professional";
    }
  }

  async extractProfessionalSkills(resumeFile, jobDescription) {
    try {
      if (!resumeFile || !jobDescription) {
        this.log.error("Missing resume or job description");
        return "web development and software engineering";
      }

      const resumeText = await this.extractTextFromFile(resumeFile);
      if (!resumeText) {
        throw new Error("Could not extract text from resume");
      }

      // Convert texts to lowercase for better matching
      const resumeLower = resumeText.toLowerCase();
      const jobLower = jobDescription.toLowerCase();

      // Create a map to count keyword occurrences
      const keywordCounts = new Map();

      // Extract actual skills from resume text
      const skillsPattern =
        /(?:skills|technologies|tools)[:]\s*(.*?)(?=\n\n|\n[A-Z]|$)/is;
      const skillsMatch = resumeText.match(skillsPattern);

      if (skillsMatch && skillsMatch[1]) {
        // Split skills by common delimiters and clean them
        const skills = skillsMatch[1]
          .toLowerCase()
          .split(/[,•]/)
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0);

        // Only count skills that appear in both resume and job description
        skills.forEach((skill) => {
          if (jobLower.includes(skill)) {
            const count = (resumeLower.match(new RegExp(skill, "g")) || [])
              .length;
            keywordCounts.set(skill, count);
          }
        });
      }

      // Sort by frequency and get top 2
      const topSkills = Array.from(keywordCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([skill]) => skill);

      if (topSkills.length > 0) {
        const skillsString = topSkills.join(" and ");
        this.log.success(`Extracted skills: ${skillsString}`);
        return skillsString;
      }

      // If no matching skills found, use web development as default
      this.log.warn("No matching skills found");
      return "web development and content management";
    } catch (error) {
      this.log.error("Error extracting skills:", error);
      return "web development and content management";
    }
  }

  async extractTextFromFile(file) {
    if (file.type === "application/pdf") {
      return await this.extractPdfText(file);
    } else if (file.type.includes("word")) {
      return await this.extractDocxText(file);
    }
    throw new Error("Unsupported file type");
  }

  async extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ");
    }

    return text;
  }

  async extractDocxText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (!result.value) {
      throw new Error("No text content found in document");
    }

    return result.value;
  }

  extractPreviousCompany(resumeFile) {
    try {
      if (!resumeFile) return "my previous company";

      this.log.info("Extracting previous company from resume");
      return "my previous company";
    } catch (error) {
      this.log.error("Error extracting previous company:", error);
      return "my previous company";
    }
  }

  extractJobResponsibilities(jobDescription) {
    try {
      if (!jobDescription) return "contribute to the team's success";

      // Look for key phrases in the job description
      const text = jobDescription.toLowerCase();

      if (text.includes("a/b test") || text.includes("optimizely")) {
        return "setting up and managing A/B tests using Optimizely";
      }

      // Default to first sentence if no specific responsibility found
      const firstSentence = jobDescription
        .split(/[.!?]/)
        .filter((s) => s.trim())[0]
        ?.trim();

      return firstSentence || "contribute to the team's success";
    } catch (error) {
      this.log.error("Error extracting responsibilities:", error);
      return "contribute to the team's success";
    }
  }

  extractCompanyMission(jobDescription) {
    try {
      if (!jobDescription) return "driving innovation";

      const text = jobDescription.toLowerCase();

      // Look for specific mission statements in the job description
      if (text.includes("a/b test") && text.includes("optimizely")) {
        return "driving experimentation through A/B testing";
      }

      // Look for the core purpose
      const purposePatterns = [
        /seeking .* to (.*?)(?:\.|\n|$)/i,
        /responsible for (.*?)(?:\.|\n|$)/i,
        /will be (.*?)(?:\.|\n|$)/i,
      ];

      for (const pattern of purposePatterns) {
        const match = jobDescription.match(pattern);
        if (match && match[1]) {
          // Clean and truncate the mission
          const mission = match[1]
            .trim()
            .replace(/\s+/g, " ")
            .split(/[,.]/)
            .shift() // Take first part only
            .trim();

          if (mission.split(" ").length <= 8) {
            this.log.success(`Extracted mission: ${mission}`);
            return mission;
          }
        }
      }

      return "driving digital innovation";
    } catch (error) {
      this.log.error("Error extracting company mission:", error);
      return "driving digital innovation";
    }
  }

  extractCurrentCompany(resumeFile) {
    try {
      if (!resumeFile) return "my current company";

      this.log.info("Extracting current company from resume");
      // Add your logic here to extract the current company
      // This is a placeholder - implement actual extraction logic
      return "my current company";
    } catch (error) {
      this.log.error("Error extracting current company:", error);
      return "my current company";
    }
  }

  async generateContent(data) {
    try {
      // Validate required data
      const missingFields = [];
      const requiredFields = [
        "firstName",
        "lastName",
        "jobTitle",
        "companyName",
        "jobDescription",
      ];

      requiredFields.forEach((field) => {
        if (!data?.[field]) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        this.log.error("Missing required fields:", missingFields);
        throw new Error(`Missing required data: ${missingFields.join(", ")}`);
      }

      // Extract information
      const professionalSkills =
        (await this.extractProfessionalSkills(
          data.resumeFile,
          data.jobDescription
        )) || "web development, problem solving";
      const currentRole =
        (await this.extractCurrentRole(data.resumeFile)) ||
        "Software Developer";
      const companyMission =
        this.extractCompanyMission(data.jobDescription) || "driving innovation";

      // Format achievements from input or use defaults
      let achievements = "";
      if (data.keyAchievements && data.keyAchievements.trim()) {
        achievements = data.keyAchievements
          .split("\n")
          .filter((achievement) => achievement.trim())
          .map((achievement) => `• ${achievement.trim()}`)
          .slice(0, 3)
          .join("\n");
      }

      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });

      const mission = this.extractMissionStatement(data.jobDescription);
      console.log('Extracted mission:', mission);

      const closingParagraph = mission 
        ? `I look forward to discussing how I can contribute to ${data.companyName}'s mission of ${mission}.`
        : `I look forward to discussing how I can contribute to ${data.companyName}'s success.`;

      return `${date}

Dear Hiring Manager,

I am excited to apply for the ${data.jobTitle} position with ${data.companyName}. I am confident that my expertise in ${professionalSkills} makes me an ideal candidate for this role.

As a ${currentRole}, I:
${achievements}

${closingParagraph}

Best regards,
${data.firstName} ${data.lastName}`.trim();
    } catch (error) {
      this.log.error(`Content generation failed: ${error.message}`);
      throw error;
    }
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
    const totalKeywords = this.analyzeJobDescription(data.jobDescription)
      .keywords.length;
    const matchingKeywords = this.findMatchingStrengths(
      this.analyzeJobDescription(data.jobDescription),
      this.analyzeResume(data.resumeFile.name)
    ).length;
    return Math.round((matchingKeywords / totalKeywords) * 100);
  }

  updateKeywordsList(jobKeywords, resumeKeywords) {
    const missing = jobKeywords.filter(
      (keyword) => !resumeKeywords.includes(keyword)
    );
    this.keywordsList.innerHTML = `
            <h3>Missing Keywords</h3>
            <ul>
                ${missing.map((keyword) => `<li>${keyword}</li>`).join("")}
            </ul>
        `;
  }

  updatePreview(content) {
    const formattedContent = content; // Remove the formatting since it's already formatted
    const previewElement = document.getElementById("coverLetterPreview");
    if (previewElement && formattedContent.trim()) {
      previewElement.innerText = formattedContent;
      // Only enable buttons if there's actual content
      document.getElementById("copyButton").disabled = false;
      document.getElementById("downloadButton").disabled = false;
    } else {
      document.getElementById("copyButton").disabled = true;
      document.getElementById("downloadButton").disabled = true;
    }
  }

  async copyToClipboard() {
    try {
      const content = this.previewContent.innerText;
      await navigator.clipboard.writeText(content);
      this.showSuccess("Copied to clipboard!");
    } catch (error) {
      this.showError("Failed to copy to clipboard");
    }
  }

  downloadCoverLetter() {
    const content = document.getElementById("coverLetterPreview").innerText;

    // Create PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configure PDF text settings
    doc.setFont("Helvetica");
    doc.setFontSize(12);

    // Split text to fit page width and add to PDF
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 15);

    // Save the PDF
    doc.save("cover-letter.pdf");
  }

  showLoading(message = "Processing...") {
    if (this.loadingOverlay && this.loadingText) {
      this.loadingText.textContent = message;
      this.loadingOverlay.classList.add("active");
    }
    if (this.generateButton) {
      this.generateButton.disabled = true;
    }
  }

  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove("active");
    }
    if (this.generateButton) {
      this.generateButton.disabled = false;
    }
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showSuccess(message) {
    this.showToast(message, 'success');
  }

  updateFilePreview(file) {
    if (!this.uploadPreview) {
      this.log.error("Upload preview element not found");
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
                      <button type="button" class="remove-file" onclick="coverLetterGenerator.resetFileUpload()">
                ✕
            </button>
                </span>
            </div>
          
        `;
    this.uploadPreview.classList.add("active");
    this.log.info(`Preview updated for file: ${file.name}`);
  }

  extractMissionStatement(jobDescription) {
    // Split text into paragraphs
    const paragraphs = jobDescription.split(/\n\n+/);
    
    // First, look for explicit mission statements
    for (const pattern of this.missionPatterns) {
      for (const paragraph of paragraphs) {
        const match = paragraph.match(pattern);
        if (match && match[1]) {
          console.log('Found explicit mission statement:', match[1].trim());
          return match[1].trim();
        }
      }
    }

    // Second, look for paragraphs with mission indicators
    for (const paragraph of paragraphs) {
      const words = paragraph.toLowerCase().split(/\s+/);
      const hasMissionIndicator = words.some(word => 
        this.missionIndicators.has(word) || 
        [...this.missionIndicators].some(indicator => 
          indicator.includes(' ') && paragraph.toLowerCase().includes(indicator)
        )
      );

      if (hasMissionIndicator) {
        console.log('Found mission-like statement:', paragraph.trim());
        return paragraph.trim();
      }
    }

    // Third, look for "about" section
    const aboutIndex = jobDescription.toLowerCase().indexOf('about');
    if (aboutIndex !== -1) {
      const aboutSection = jobDescription.slice(aboutIndex, aboutIndex + 500);
      const firstParagraph = aboutSection.split(/\n\n+/)[0];
      console.log('Using about section:', firstParagraph.trim());
      return firstParagraph.trim();
    }

    console.log('No mission statement found');
    return '';
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${type === 'success' 
                    ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
                    : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
                }
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize when DOM is loaded
const coverLetterGenerator = new CoverLetterGenerator();
