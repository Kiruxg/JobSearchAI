// Add KeywordExtractor class definition first
class KeywordExtractor {
  constructor() {
    // Common technical skills
    this.technicalSkills = new Set([
      "python",
      "javascript",
      "java",
      "react",
      "angular",
      "vue",
      "node",
      "sql",
      "mongodb",
      "aws",
      "docker",
      "kubernetes",
      "ci/cd",
      "git",
      "agile",
      "scrum",
    ]);

    // Common soft skills
    this.softSkills = new Set([
      "leadership",
      "communication",
      "teamwork",
      "problem-solving",
      "analytical",
      "organization",
      "time management",
      "collaboration",
    ]);

    // Industry-specific terms
    this.industryTerms = new Set([
      "saas",
      "b2b",
      "b2c",
      "roi",
      "kpi",
      "analytics",
      "automation",
      "scalability",
      "optimization",
      "infrastructure",
    ]);

    // Common words to ignore
    this.stopWords = new Set([
      "and",
      "the",
      "for",
      "with",
      "this",
      "that",
      "will",
      "have",
      "about",
      "should",
      "could",
      "would",
      "been",
      "were",
      "they",
      // Add more stop words as needed
    ]);
  }

  extractKeywords(text) {
    // Extract phrases first (2-3 word combinations)
    const phrases = this.extractPhrases(text);

    // Then extract single words
    const words = this.extractWords(text);

    // Combine and categorize keywords
    return this.categorizeKeywords([...phrases, ...words]);
  }

  extractPhrases(text) {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/);

    const phrases = [];

    // Extract 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const twoWordPhrase = words[i] + " " + words[i + 1];
      if (this.isRelevantPhrase(twoWordPhrase)) {
        phrases.push(twoWordPhrase);
      }

      if (i < words.length - 2) {
        const threeWordPhrase = twoWordPhrase + " " + words[i + 2];
        if (this.isRelevantPhrase(threeWordPhrase)) {
          phrases.push(threeWordPhrase);
        }
      }
    }

    return phrases;
  }

  extractWords(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 &&
          !this.stopWords.has(word) &&
          this.isRelevantWord(word)
      );
  }

  isRelevantPhrase(phrase) {
    // Check if phrase is a known technical skill
    if (this.technicalSkills.has(phrase)) return true;

    // Check if phrase is a known soft skill
    if (this.softSkills.has(phrase)) return true;

    // Check if phrase is an industry term
    if (this.industryTerms.has(phrase)) return true;

    // Check for years of experience patterns
    if (phrase.match(/\d+[\s-]years?/)) return true;

    return false;
  }

  isRelevantWord(word) {
    // Ignore common words and short words
    if (this.stopWords.has(word) || word.length < 3) return false;

    // Check various keyword categories
    return (
      this.technicalSkills.has(word) ||
      this.softSkills.has(word) ||
      this.industryTerms.has(word)
    );
  }

  categorizeKeywords(keywords) {
    return {
      technical: keywords.filter((k) => this.technicalSkills.has(k)),
      soft: keywords.filter((k) => this.softSkills.has(k)),
      industry: keywords.filter((k) => this.industryTerms.has(k)),
      other: keywords.filter(
        (k) =>
          !this.technicalSkills.has(k) &&
          !this.softSkills.has(k) &&
          !this.industryTerms.has(k)
      ),
    };
  }

  getKeywordWeight(keyword, category) {
    const weights = {
      technical: 2.0, // Technical skills are most important
      soft: 1.2, // Soft skills are valuable
      industry: 1.5, // Industry knowledge is important
      other: 1.0, // Base weight for other keywords
    };

    // Additional weight for years of experience
    if (keyword.match(/\d+[\s-]years?/)) {
      return weights[category] * 1.5;
    }

    return weights[category];
  }
}

class ResumeOptimizer {
  constructor() {
    console.log("Initializing ResumeOptimizer");
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.attachEventListeners();
      });
    } else {
      this.attachEventListeners();
    }
  }

  attachEventListeners() {
    console.log("Attaching event listeners");

    // File input listener
    const fileInput = document.getElementById("resumeFile");
    if (fileInput) {
      console.log("Found resume file input");
      fileInput.addEventListener("change", (e) => this.handleFileUpload(e));
    } else {
      console.warn("Resume file input not found");
    }

    // Analyze button listener
    const analyzeBtn = document.getElementById("analyzeResume");
    if (analyzeBtn) {
      console.log("Found analyze button");
      analyzeBtn.addEventListener("click", () => this.handleAnalyzeClick());
    } else {
      console.warn("Analyze button not found");
    }
  }

  handleFileUpload(event) {
    console.log("File upload triggered");
    const file = event.target.files[0];

    if (!file) {
      this.showError("No file selected");
      return;
    }

    if (file.type !== "application/pdf") {
      this.showError("Please upload a PDF file");
      return;
    }

    console.log("Valid file selected:", file.name);
    this.currentFile = file; // Store the file for later use
    this.showSuccess("Resume uploaded successfully");
    this.showFilePreview(file);
  }

  handleAnalyzeClick() {
    console.log("Analyze button clicked");
    if (!this.currentFile) {
      this.showError("Please upload a resume first");
      return;
    }
    this.analyzeResume(this.currentFile);
  }

  simulateAnalysis() {
    return new Promise((resolve) => {
      console.log("Simulating analysis...");
      setTimeout(() => {
        console.log("Analysis simulation complete");
        resolve();
      }, 2000);
    });
  }

  async analyzeResume(file) {
    try {
      if (!file) {
        throw new Error("Please upload a resume first");
      }

      console.log("Starting resume analysis");
      this.showToast("Analyzing resume...", "info");

      // Show loading state
      const analyzeBtn = document.getElementById("analyzeBtn");
      if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
      }

      // Simulate analysis delay
      await this.simulateAnalysis();

      // Example results
      const results = {
        score: 85,
        keywords: ["JavaScript", "React", "Node.js", "Python"],
        missingKeywords: ["Docker", "AWS", "TypeScript"],
        suggestions: [
          "Add more details about your technical projects",
          "Include quantifiable achievements",
          "Add missing keywords: Docker, AWS, TypeScript",
        ],
      };

      // Update the dashboard with results
      this.updateDashboard(results);

      // Show the results section
      const resultsSection = document.getElementById("resultsSection");
      if (resultsSection) {
        resultsSection.style.display = "block";
      }

      // Update preview card to show completed state
      const previewCard = document.getElementById("filePreviewCard");
      if (previewCard) {
        previewCard.classList.add("analyzed");
      }

      this.showSuccess("Resume analyzed successfully!");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      this.showError("Error analyzing resume. Please try again.");
    } finally {
      // Reset button state
      const analyzeBtn = document.getElementById("analyzeBtn");
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = "<i class='fas fa-search'></i> Analyze";
      }
    }
  }

  updateDashboard(results) {
    console.log('Updating dashboard with results:', results);

    // Create results section if it doesn't exist
    let resultsSection = document.getElementById('resultsSection');
    if (!resultsSection) {
      resultsSection = document.createElement('div');
      resultsSection.id = 'resultsSection';
      resultsSection.className = 'results-section';
      
      // Insert after file preview card
      const filePreview = document.getElementById('filePreviewCard');
      if (filePreview) {
        filePreview.insertAdjacentElement('afterend', resultsSection);
      }
    }

    // Update results content
    resultsSection.innerHTML = `
      <div class="results-card">
        <h3>Resume Analysis Results</h3>
        
        <div class="score-section">
          <div class="score-circle">
            <span class="score-number">${results.score}</span>
            <span class="score-label">Score</span>
          </div>
        </div>

        <div class="keywords-section">
          <h4>Detected Keywords</h4>
          <div class="keyword-tags">
            ${results.keywords.map(keyword => 
              `<span class="keyword-tag">${keyword}</span>`
            ).join('')}
          </div>
        </div>

        <div class="missing-keywords-section">
          <h4>Missing Keywords</h4>
          <div class="keyword-tags">
            ${results.missingKeywords.map(keyword => 
              `<span class="keyword-tag missing">${keyword}</span>`
            ).join('')}
          </div>
        </div>

        <div class="suggestions-section">
          <h4>Suggestions</h4>
          <ul class="suggestions-list">
            ${results.suggestions.map(suggestion => 
              `<li>${suggestion}</li>`
            ).join('')}
          </ul>
        </div>
      </div>
    `;

    // Show the results section
    resultsSection.style.display = 'block';

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  showToast(message, type = "info") {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll(".toast");
    existingToasts.forEach((toast) => toast.remove());

    // Create new toast
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Force a reflow to trigger animation
    toast.offsetHeight;

    // Remove the toast after animation
    setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 500);
    }, 3000);

    console.log("Toast created:", message, type);
  }

  showError(message) {
    this.showToast(message, "error");
  }

  showSuccess(message) {
    this.showToast(message, "success");
  }

  showFilePreview(file) {
    console.log("Showing file preview for:", file.name);

    // Create or get the preview card
    let previewCard = document.getElementById("filePreviewCard");

    if (!previewCard) {
      previewCard = document.createElement("div");
      previewCard.id = "filePreviewCard";

      // Insert after the upload-box
      const uploadBox = document.querySelector(".upload-box");
      if (uploadBox) {
        uploadBox.insertAdjacentElement("afterend", previewCard);
      } else {
        console.warn("upload-box not found");
        return;
      }
    }

    // Update preview card content
    previewCard.className = "file-preview-card";
    previewCard.innerHTML = `
      <div class="file-info">
        <i class="fas fa-file-pdf file-icon"></i>
        <span class="file-name">${file.name}</span>
      </div>
      <div class="file-status">
        <i class="fas fa-check-circle success-icon"></i>
      </div>
    `;
  }
}

// Initialize only after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");
  try {
    window.resumeOptimizer = new ResumeOptimizer();
    console.log("ResumeOptimizer initialized");
  } catch (error) {
    console.error("Error initializing ResumeOptimizer:", error);
  }
});
