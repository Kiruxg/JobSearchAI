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
    console.log("Initializing ResumeOptimizer...");

    // Initialize properties
    this.resumeText = "";
    this.jobDescription = "";
    this.keywordExtractor = new KeywordExtractor();

    // Bind DOM elements
    this.initializeElements();

    // Bind methods
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.analyzeResume = this.analyzeResume.bind(this);
    this.performAnalysis = this.performAnalysis.bind(this);
    this.displayResults = this.displayResults.bind(this);

    // Add debounced job description analysis
    this.debouncedAnalysis = this.debounce(this.analyzeResume.bind(this), 1000);

    // Attach event listeners
    this.attachEventListeners();

    console.log("ResumeOptimizer initialized");
  }

  initializeElements() {
    // Upload elements
    this.resumeUpload = document.getElementById("resumeUpload");
    this.resumeInput = document.getElementById("resumeFile");
    this.jobDescriptionInput = document.getElementById("jobDescription");
    this.analyzeButton = document.getElementById("analyzeButton");

    // Results elements
    this.resultsSection = document.getElementById("resultsSection");
    this.matchScore = document.getElementById("matchScore");
    this.missingKeywordsList = document.getElementById("missingKeywords");
    this.foundKeywordsList = document.getElementById("foundKeywords");

    // Loading elements
    this.loadingOverlay = document.getElementById("loadingOverlay");
    this.loadingText = document.getElementById("loadingText");
  }

  attachEventListeners() {
    // Handle file selection
    this.resumeInput.addEventListener("change", this.handleFileUpload);

    // Handle analysis
    this.analyzeButton.addEventListener("click", this.analyzeResume);

    // Add job description input listener
    this.jobDescriptionInput.addEventListener("input", () => {
      if (this.resumeText) {
        this.debouncedAnalysis();
      }
    });

    // Handle drag and drop
    this.resumeUpload.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.resumeUpload.classList.add("drag-over");
    });

    this.resumeUpload.addEventListener("dragleave", () => {
      this.resumeUpload.classList.remove("drag-over");
    });

    this.resumeUpload.addEventListener("drop", (e) => {
      e.preventDefault();
      this.resumeUpload.classList.remove("drag-over");
      const file = e.dataTransfer.files[0];
      this.handleFileUpload({ target: { files: [file] } });
    });
  }

  async handleFileUpload(event) {
    try {
      const file = event.target.files[0];
      if (!file) {
        throw new Error("No file selected");
      }

      // Validate file
      if (!this.isValidFileType(file)) {
        throw new Error("Invalid file type. Please upload a PDF or DOCX file");
      }

      if (!this.isValidFileSize(file)) {
        throw new Error("File too large. Maximum size is 5MB");
      }

      this.showLoading("Reading file...");
      this.resumeText = await this.extractTextFromFile(file);

      if (!this.hasValidContent(this.resumeText)) {
        throw new Error("Could not extract text from file");
      }

      // Show preview
      const previewDiv = document.getElementById("filePreview");
      previewDiv.textContent = `File loaded: ${file.name}`;
      previewDiv.classList.add("active");

      // Automatically run analysis if job description exists
      if (this.jobDescriptionInput.value.trim()) {
        await this.analyzeResume();
      }
    } catch (error) {
      this.handleError("File Upload Error", error);
    } finally {
      this.hideLoading();
    }
  }

  async analyzeResume() {
    try {
      if (!this.resumeText) {
        throw new Error("Please upload a resume first");
      }

      const jobDescription = this.jobDescriptionInput.value.trim();
      if (!jobDescription) {
        throw new Error("Please enter a job description");
      }

      this.showLoading("Analyzing resume...");
      const results = await this.performAnalysis();
      this.displayResults(results);
      this.resultsSection.style.display = "block";
    } catch (error) {
      this.handleError("Analysis Error", error);
    } finally {
      this.hideLoading();
    }
  }

  async performAnalysis() {
    try {
      console.log("Starting analysis...");

      // Log raw inputs
      console.log("Raw inputs:", {
        jobDescription: this.jobDescriptionInput.value.substring(0, 100),
        resumeText: this.resumeText.substring(0, 100)
      });

      // Extract keywords
      const jobKeywords = this.keywordExtractor.extractKeywords(
        this.jobDescriptionInput.value
      );
      const resumeKeywords = this.keywordExtractor.extractKeywords(
        this.resumeText
      );

      // Log extracted keywords before processing
      console.log("Extracted keywords:", {
        job: jobKeywords,
        resume: resumeKeywords
      });

      // Create Sets for unique keywords
      const allJobKeywords = [...new Set([
        ...jobKeywords.technical,
        ...jobKeywords.soft,
        ...jobKeywords.industry
      ])].map(kw => kw.toLowerCase());

      const allResumeKeywords = [...new Set([
        ...resumeKeywords.technical,
        ...resumeKeywords.soft,
        ...resumeKeywords.industry
      ])].map(kw => kw.toLowerCase());

      // Log processed keywords
      console.log("Processed keywords:", {
        job: allJobKeywords,
        resume: allResumeKeywords
      });

      // Find matching keywords (no duplicates)
      const matchingKeywords = [...new Set(
        allJobKeywords.filter(keyword => 
          allResumeKeywords.includes(keyword)
        )
      )];

      // Find missing keywords (no duplicates)
      const missingKeywords = [...new Set(
        allJobKeywords.filter(keyword => 
          !allResumeKeywords.includes(keyword)
        )
      )];

      // Log matching and missing keywords
      console.log("Keyword matching:", {
        matching: matchingKeywords,
        missing: missingKeywords
      });

      // Calculate match percentage
      const matchPercentage = allJobKeywords.length > 0
        ? Math.round((matchingKeywords.length / allJobKeywords.length) * 100)
        : 0;

      const results = {
        matchPercentage,
        matchingKeywords,
        missingKeywords,
        recommendations: this.generateRecommendations(
          matchPercentage,
          matchingKeywords,
          missingKeywords,
          resumeKeywords
        )
      };

      console.log("Final results:", results);
      return results;

    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    }
  }

  displayResults(results) {
    console.log("Displaying results:", results);

    // Update match score (ensure it's a number)
    const score = isNaN(results.matchPercentage) ? 0 : results.matchPercentage;
    if (this.matchScore) {
      this.matchScore.textContent = score;
    }

    // Update found keywords
    if (this.foundKeywordsList) {
      this.foundKeywordsList.innerHTML =
        Array.isArray(results.matchingKeywords) &&
        results.matchingKeywords.length > 0
          ? results.matchingKeywords
              .map((keyword) => `<li>${keyword}</li>`)
              .join("")
          : "<li>No matching keywords found</li>";
    }

    // Update missing keywords
    if (this.missingKeywordsList) {
      this.missingKeywordsList.innerHTML =
        Array.isArray(results.missingKeywords) &&
        results.missingKeywords.length > 0
          ? results.missingKeywords
              .map((keyword) => `<li>${keyword}</li>`)
              .join("")
          : "<li>No missing keywords found</li>";
    }

    // Update recommendations
    const recommendationsList = document.getElementById("recommendationsList");
    if (recommendationsList && Array.isArray(results.recommendations)) {
      recommendationsList.innerHTML =
        results.recommendations.map((rec) => `<li>${rec}</li>`).join("") ||
        "<li>No recommendations available</li>";
    }

    // Show results section
    if (this.resultsSection) {
      this.resultsSection.style.display = "block";
    }
  }

  generateRecommendations(
    matchPercentage,
    matchingKeywords,
    missingKeywords,
    resumeKeywords
  ) {
    const recommendations = [];

    // Match percentage recommendations
    if (matchPercentage < 40) {
      recommendations.push(
        "⚠️ Your resume needs significant improvements to match this job's requirements."
      );
    } else if (matchPercentage < 70) {
      recommendations.push(
        "📈 Your resume partially matches the job requirements but could be improved."
      );
    } else {
      recommendations.push(
        "✅ Your resume shows good alignment with the job requirements!"
      );
    }

    // Missing keywords recommendations
    if (missingKeywords.length > 0) {
      recommendations.push(
        `🔧 Consider adding experience with: ${missingKeywords.join(", ")}`
      );
    }

    // General recommendations
    recommendations.push(
      "📝 Ensure your resume highlights specific achievements"
    );
    recommendations.push("📊 Quantify your impact with metrics where possible");
    recommendations.push(
      "🎯 Make sure your technical skills section is prominent"
    );

    return recommendations;
  }

  showLoading(message = "Processing...") {
    // Add a loading class to the analyze button
    if (this.analyzeButton) {
      this.analyzeButton.classList.add("loading");
      this.analyzeButton.disabled = true;
    }

    if (this.loadingText) {
      this.loadingText.textContent = message;
    }
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add("active");
    }
  }

  hideLoading() {
    // Remove loading state from analyze button
    if (this.analyzeButton) {
      this.analyzeButton.classList.remove("loading");
      this.analyzeButton.disabled = false;
    }

    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove("active");
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

  // Debounce helper function
  debounce(func, wait) {
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

  handleError(title, error) {
    console.error(title, error);
    alert(`${title}: ${error.message}`);
  }

  isValidFileType(file) {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    return allowedTypes.includes(file.type);
  }

  isValidFileSize(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  }

  hasValidContent(text) {
    return text.trim() !== "";
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.optimizer = new ResumeOptimizer();
});
