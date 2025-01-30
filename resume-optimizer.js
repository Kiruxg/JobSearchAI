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
      "express",
      "django",
      "flask",
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
    this.initializeElements();
    this.attachEventListeners();
    this.resumeText = "";
    this.jobDescription = "";
    this.keywordExtractor = new KeywordExtractor();
    this.loadingOverlay = document.getElementById("loadingOverlay");
    this.loadingText = document.getElementById("loadingText");
    this.uploadSpinner = document.getElementById("uploadSpinner");
    this.isProcessing = false;
    console.log("ResumeOptimizer initialized");
  }

  initializeElements() {
    console.log("Initializing elements...");
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

    // Log if any elements are missing
    const elements = {
      resumeUpload: this.resumeUpload,
      resumeInput: this.resumeInput,
      jobDescriptionInput: this.jobDescriptionInput,
      analyzeButton: this.analyzeButton,
      resultsSection: this.resultsSection,
      matchScore: this.matchScore,
      missingKeywordsList: this.missingKeywordsList,
      foundKeywordsList: this.foundKeywordsList,
      loadingOverlay: this.loadingOverlay,
      loadingText: this.loadingText,
    };

    for (const [name, element] of Object.entries(elements)) {
      if (!element) {
        console.error(`Element not found: ${name}`);
      }
    }
    console.log("Elements initialized");
  }

  attachEventListeners() {
    console.log("Attaching event listeners...");

    // Handle file drops
    this.resumeUpload.addEventListener("dragover", (e) => {
      console.log("Drag over event");
      e.preventDefault();
      this.resumeUpload.classList.add("drag-over");
    });

    this.resumeUpload.addEventListener("dragleave", () => {
      console.log("Drag leave event");
      this.resumeUpload.classList.remove("drag-over");
    });

    this.resumeUpload.addEventListener("drop", (e) => {
      console.log("Drop event triggered");
      e.preventDefault();
      this.resumeUpload.classList.remove("drag-over");
      const file = e.dataTransfer.files[0];
      console.log("Dropped file:", file.name, file.type);
      this.handleFileUpload(file);
    });

    // Handle file selection
    this.resumeInput.addEventListener("change", (e) => {
      console.log("File input change event");
      const file = e.target.files[0];
      if (file) {
        console.log("Selected file:", file.name, file.type);
        this.handleFileUpload(file);
      }
    });

    // Handle analysis
    this.analyzeButton.addEventListener("click", () => {
      console.log("Analyze button clicked");
      this.analyzeResume();
    });

    console.log("Event listeners attached");
  }

  // Add loading state management methods
  showLoading(message = "Processing...") {
    console.log("Show loading:", message);
    this.isProcessing = true;
    this.loadingText.textContent = message;
    this.loadingOverlay.classList.add("active");
    this.analyzeButton.disabled = true;
  }

  hideLoading() {
    console.log("Hide loading");
    this.isProcessing = false;
    this.loadingOverlay.classList.remove("active");
    this.analyzeButton.disabled = false;
  }

  // Update handleFileUpload method
  async handleFileUpload(file) {
    console.log("Starting file upload process...", file);
    try {
      this.showLoading("Reading file...");
      this.resumeUpload.classList.add("processing");

      const fileExtension = file.name.split(".").pop().toLowerCase();
      console.log("Processing file with extension:", fileExtension);

      let text;
      switch (fileExtension) {
        case "pdf":
          this.loadingText.textContent = "Parsing PDF...";
          text = await this.parsePDF(file);
          break;
        case "doc":
        case "docx":
          this.loadingText.textContent = "Parsing Word document...";
          text = await this.parseWord(file);
          console.log("Word document parsed, text length:", text?.length);
          console.log("First 100 chars:", text?.substring(0, 100));
          break;
        default:
          throw new Error(
            "Unsupported file format. Please upload a PDF, DOC, or DOCX file."
          );
      }

      if (!text || text.trim().length === 0) {
        throw new Error("No text content found in the document.");
      }

      this.resumeText = text;
      console.log("Document parsed successfully. Text length:", text.length);

      // Show preview before success message
      try {
        console.log("Attempting to show preview...");
        this.showResumePreview(text);
        console.log("Preview shown successfully");
      } catch (previewError) {
        console.error("Error showing preview:", previewError);
        throw new Error(
          "Failed to display document preview: " + previewError.message
        );
      }

      this.showUploadSuccess(file.name);
    } catch (error) {
      console.error("File upload error:", error);
      this.showError(error.message);
    } finally {
      this.hideLoading();
      this.resumeUpload.classList.remove("processing");
    }
  }

  // Update analyzeResume method
  async analyzeResume() {
    if (!this.resumeText) {
      this.showError("Please upload a resume first");
      return;
    }

    this.jobDescription = this.jobDescriptionInput.value;
    if (!this.jobDescription) {
      this.showError("Please enter a job description");
      return;
    }

    try {
      this.showLoading("Analyzing resume...");
      const analysis = this.performAnalysis();
      this.displayResults(analysis);
      AnalyticsTracker.trackEvent("resume_analyzed", {
        score: analysis.score,
        keywordCategories: Object.keys(analysis.matches).length,
      });
    } catch (error) {
      this.showError("Error analyzing resume: " + error.message);
    } finally {
      this.hideLoading();
    }
  }

  // Update showError method
  showError(message) {
    console.error("Error:", message);
    alert(message); // We'll replace this with a better UI later
  }

  showResumePreview(text) {
    console.log("Showing resume preview...");
    // Remove existing preview if any
    const existingPreview = document.querySelector(".resume-preview");
    if (existingPreview) {
      console.log("Removing existing preview");
      existingPreview.remove();
    }

    // Format the text with sections
    console.log("Formatting text...");
    const formattedText = this.formatResumeText(text);
    console.log("Text formatted successfully");

    // Create new preview with enhanced viewer
    console.log("Creating preview element...");
    const previewSection = document.createElement("div");
    previewSection.className = "resume-preview";

    // Add the preview controls and content
    previewSection.innerHTML = `
        <div class="preview-header">
            <h3>Resume Preview</h3>
            <div class="preview-controls">
                <button class="preview-control-btn" title="Download PDF">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Download
                </button>
                <button class="preview-control-btn" title="Print">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    Print
                </button>
            </div>
        </div>
        <div class="preview-toolbar">
            <div class="zoom-controls">
                <button class="preview-control-btn" id="zoomOut">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                    </svg>
                </button>
                <span class="zoom-level">100%</span>
                <button class="preview-control-btn" id="zoomIn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="preview-wrapper">
            <div class="preview-content">
                ${formattedText}
            </div>
            <div class="page-number">Page 1</div>
        </div>
    `;

    console.log("Preview element created");

    // Insert after upload box
    console.log("Inserting preview into document...");
    this.resumeUpload.parentNode.insertBefore(
      previewSection,
      this.resumeUpload.nextSibling
    );
    console.log("Preview inserted successfully");

    // Initialize preview controls
    this.initializePreviewControls(previewSection);
  }

  initializePreviewControls(previewSection) {
    console.log("Initializing preview controls...");
    // Initialize zoom functionality
    let currentZoom = 100;
    const content = previewSection.querySelector(".preview-content");
    const zoomLevel = previewSection.querySelector(".zoom-level");

    if (content && zoomLevel) {
      previewSection.querySelector("#zoomIn")?.addEventListener("click", () => {
        if (currentZoom < 200) {
          currentZoom += 10;
          content.style.transform = `scale(${currentZoom / 100})`;
          zoomLevel.textContent = `${currentZoom}%`;
        }
      });

      previewSection
        .querySelector("#zoomOut")
        ?.addEventListener("click", () => {
          if (currentZoom > 50) {
            currentZoom -= 10;
            content.style.transform = `scale(${currentZoom / 100})`;
            zoomLevel.textContent = `${currentZoom}%`;
          }
        });
    }

    // Initialize other controls...
    console.log("Preview controls initialized");
  }

  downloadAsPDF() {
    // You'll need to implement PDF generation here
    // Could use libraries like jsPDF or html2pdf.js
    alert("PDF download functionality coming soon!");
  }

  showUploadSuccess(filename) {
    const label = this.resumeUpload.querySelector("label span");
    label.textContent = `File uploaded: ${filename}`;
    this.resumeUpload.classList.add("upload-success");

    const successMessage = `Successfully parsed resume: ${filename}`;
    console.log(successMessage);
  }

  exportResults(analysis) {
    const results = {
      score: analysis.score,
      missingKeywords: analysis.missingKeywords,
      matches: analysis.matches,
      timestamp: new Date().toISOString(),
      jobDescription: this.jobDescription,
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-analysis.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  async parsePDF(file) {
    console.log("Starting PDF parsing process...");
    try {
      // Check if PDF.js is loaded
      console.log("PDF.js loaded:", typeof pdfjsLib !== "undefined");

      // Read file as ArrayBuffer
      console.log("Reading file as ArrayBuffer...");
      const arrayBuffer = await file.arrayBuffer();
      console.log("File read as ArrayBuffer, size:", arrayBuffer.byteLength);

      // Load PDF document
      console.log("Loading PDF document...");
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log("PDF loaded, pages:", pdf.numPages);

      let fullText = "";

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i}/${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + " ";
        console.log(`Page ${i} text length:`, pageText.length);
      }

      // Clean up text
      fullText = fullText.replace(/\s+/g, " ").trim();
      console.log("PDF parsing complete. Total text length:", fullText.length);

      // Show preview
      this.showResumePreview(fullText);

      return fullText;
    } catch (error) {
      console.error("PDF parsing error:", error);
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  async parseWord(file) {
    console.log("Starting Word document parse...");
    try {
      // First, check if mammoth.js is loaded
      if (typeof mammoth === "undefined") {
        console.log("Loading mammoth.js...");
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
          script.onload = () => {
            console.log("mammoth.js loaded successfully");
            resolve();
          };
          script.onerror = (err) => {
            console.error("Failed to load mammoth.js:", err);
            reject(new Error("Failed to load document parser"));
          };
          document.head.appendChild(script);
        });
      }

      console.log("Converting file to ArrayBuffer...");
      const arrayBuffer = await file.arrayBuffer();
      console.log(
        "File converted to ArrayBuffer, size:",
        arrayBuffer.byteLength
      );

      console.log("Parsing document with mammoth...");
      const result = await mammoth.extractRawText({ arrayBuffer });
      console.log("Mammoth parsing result:", result);

      if (result.value) {
        console.log(
          "Document parsed successfully, text length:",
          result.value.length
        );
        return result.value;
      } else {
        console.error("No text content in parsing result");
        throw new Error("No text content found in the document");
      }
    } catch (error) {
      console.error("Word parsing error:", error);
      throw new Error(`Failed to parse Word document: ${error.message}`);
    }
  }

  formatResumeText(text) {
    console.log('Starting text formatting...');
    try {
      // Split text into lines and clean up
      const lines = text.split(/\n/).map(line => line.trim()).filter(line => line);
      console.log(`Found ${lines.length} lines to process`);

      let formattedText = '';
      let currentSection = '';
      let inBulletList = false;

      // Process each line
      lines.forEach((line, index) => {
        // Check if this is a header line
        const isHeader = /^(PROFILE|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|LINKS)/i.test(line);
        
        if (index === 0) {
          // First line is usually the name
          formattedText += `<h1 class="resume-name">${line}</h1>`;
        } else if (index === 1 || index === 2) {
          // Next lines are usually contact info
          formattedText += `<p class="resume-contact">${line}</p>`;
        } else if (isHeader) {
          // Close any open bullet list
          if (inBulletList) {
            formattedText += '</ul>';
            inBulletList = false;
          }
          
          currentSection = line.trim();
          formattedText += `<h2 class="resume-section">${currentSection}</h2>`;
        } else {
          // Handle bullet points and regular text
          const isBullet = line.startsWith('•') || line.startsWith('-');
          
          if (isBullet) {
            if (!inBulletList) {
              formattedText += '<ul class="resume-bullets">';
              inBulletList = true;
            }
            // Clean up the bullet point and add any special formatting
            let bulletText = line.replace(/^[•-]\s*/, '').trim();
            // Format dates
            bulletText = bulletText.replace(/(\w+\s+\d{4})/g, '<span class="resume-date">$1</span>');
            formattedText += `<li class="resume-bullet">${bulletText}</li>`;
          } else {
            if (inBulletList) {
              formattedText += '</ul>';
              inBulletList = false;
            }
            formattedText += `<p class="resume-line">${line}</p>`;
          }
        }
      });

      // Close any open bullet list
      if (inBulletList) {
        formattedText += '</ul>';
      }

      console.log('Text formatting completed successfully');
      return formattedText;

    } catch (error) {
      console.error('Error formatting resume text:', error);
      throw new Error('Failed to format resume text: ' + error.message);
    }
  }
}

class AnalyticsTracker {
  static trackEvent(eventName, data = {}) {
    // Basic event logging
    const event = {
      eventName,
      timestamp: new Date().toISOString(),
      data,
    };

    // Could send to backend or store locally
    console.log("Analytics Event:", event);

    // Store in localStorage for now
    const events = JSON.parse(localStorage.getItem("analytics") || "[]");
    events.push(event);
    localStorage.setItem("analytics", JSON.stringify(events));
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing ResumeOptimizer...");
  new ResumeOptimizer();
});
