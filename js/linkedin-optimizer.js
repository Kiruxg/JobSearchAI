document.addEventListener("DOMContentLoaded", function () {
  const analyzeButton = document.getElementById("analyzeProfile");
  const profileScore = document.getElementById("profileScore");
  const tipsList = document.getElementById("tipsList");
  const keywordCloud = document.getElementById("keywordCloud");
  const keywordSuggestions = document.getElementById("keywordSuggestions");

  // Basic scoring weights
  const weights = {
    headline: 0.3,
    about: 0.4,
    skills: 0.3,
  };

  // Initialize checklists
  initializeChecklists();

  analyzeButton.addEventListener("click", function () {
    const headline = document.getElementById("profileHeadline").value.trim();
    const about = document.getElementById("aboutSection").value.trim();
    const skills = document.getElementById("skillsList").value.trim();

    if (!headline && !about && !skills) {
      alert("Please fill in at least one section to analyze");
      return;
    }

    // Calculate basic score
    const score = calculateProfileScore(headline, about, skills);
    animateScore(score);

    // Generate basic tips
    generateTips(headline, about, skills);

    // Show premium features as locked
    showPremiumFeatures();
  });

  // Handle LinkedIn URL import (Premium feature)
  const fetchProfileBtn = document.getElementById("fetchProfile");
  fetchProfileBtn.addEventListener("click", function () {
    const urlInput = document.getElementById("linkedinUrl");
    console.log("Premium import requested for URL:", urlInput.value);
    
    if (urlInput.value) {
      showPremiumUpgradeDialog("profile-import");
    } else {
      alert("Please enter a LinkedIn URL");
    }
  });
});

function calculateProfileScore(headline, about, skills) {
  let score = 0;

  // Headline scoring (30%)
  if (headline) {
    const headlineScore =
      Math.min(headline.length / 100, 1) * weights.headline * 100;
    score += headlineScore;
  }

  // About section scoring (40%)
  if (about) {
    const aboutScore = Math.min(about.length / 500, 1) * weights.about * 100;
    score += aboutScore;
  }

  // Skills scoring (30%)
  if (skills) {
    const skillsList = skills.split(",").filter((skill) => skill.trim());
    const skillsScore =
      Math.min(skillsList.length / 10, 1) * weights.skills * 100;
    score += skillsScore;
  }

  return Math.round(score);
}

function animateScore(targetScore) {
  const scoreElement = document.getElementById("profileScore");
  let currentScore = 0;
  const duration = 1000; // 1 second animation
  const interval = 16; // 60fps
  const steps = duration / interval;
  const increment = targetScore / steps;

  const animation = setInterval(() => {
    currentScore += increment;
    if (currentScore >= targetScore) {
      currentScore = targetScore;
      clearInterval(animation);
    }
    scoreElement.textContent = Math.round(currentScore);
  }, interval);
}

function generateTips(headline, about, skills) {
  const tips = [];

  // Headline tips
  if (!headline) {
    tips.push("Add a professional headline to increase visibility");
  } else if (headline.length < 50) {
    tips.push(
      "Make your headline more descriptive (aim for 50-100 characters)"
    );
  }

  // About tips
  if (!about) {
    tips.push('Add an "About" section to tell your professional story');
  } else if (about.length < 200) {
    tips.push('Expand your "About" section (aim for 200-2000 characters)');
  }

  // Skills tips
  if (!skills) {
    tips.push("Add relevant skills to improve searchability");
  } else {
    const skillsList = skills.split(",").filter((skill) => skill.trim());
    if (skillsList.length < 5) {
      tips.push("Add more skills (aim for at least 5 relevant skills)");
    }
  }

  // Display tips
  const tipsList = document.getElementById("tipsList");
  tipsList.innerHTML = tips
    .map((tip) => `<div class="tip-item">${tip}</div>`)
    .join("");
}

function initializeChecklists() {
  const checklists = document.querySelectorAll(".checklist");
  checklists.forEach((list) => {
    list.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("completed");
      });
    });
  });
}

function showPremiumFeatures() {
  // Gray out and add premium badge to advanced features
  const keywordCloud = document.getElementById("keywordCloud");
  const keywordSuggestions = document.getElementById("keywordSuggestions");

  keywordCloud.innerHTML = `
        <div style="text-align: center; color: #94a3b8; padding: 40px;">
            <span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-bottom: 12px; display: inline-block;">Premium</span>
            <p style="margin-top: 12px;">Upgrade to see your keyword analysis</p>
        </div>
    `;

  keywordSuggestions.innerHTML = `
        <div style="text-align: center; color: #94a3b8; padding: 20px;">
            <p>Upgrade to get personalized keyword suggestions</p>
        </div>
    `;
}

function showPremiumUpgradeDialog(feature) {
  console.log("Showing premium dialog for feature:", feature);
  
  let message = "";
  switch (feature) {
    case "profile-import":
      message = "Automatic profile import is a premium feature. Upgrade to JobGenie Pro to unlock:" +
               "\n\n✨ One-click profile import" +
               "\n✨ Automatic content analysis" +
               "\n✨ Advanced optimization tips" +
               "\n✨ Weekly performance tracking";
      break;
    default:
      message = "This is a premium feature. Upgrade to JobGenie Pro to unlock all features!";
  }
  
  alert(message);
}

// Add helper text for manual input
function enhanceManualInput() {
  console.log("Enhancing manual input experience");
  
  const helperText = document.createElement("div");
  helperText.className = "helper-text";
  helperText.innerHTML = `
      <p>Copy and paste your LinkedIn profile sections:</p>
      <ol>
          <li>Open your LinkedIn profile in another tab</li>
          <li>Copy your headline, about section, and skills</li>
          <li>Paste them in the corresponding fields below</li>
      </ol>
  `;
  
  const firstInput = document.getElementById("profileHeadline");
  firstInput.parentNode.insertBefore(helperText, firstInput);
}

// Call this when the page loads
document.addEventListener("DOMContentLoaded", function () {
  enhanceManualInput();
});
