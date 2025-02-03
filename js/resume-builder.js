class ResumeBuilder {
  constructor() {
    this.currentStep = 0;
    this.steps = [
      "personal",
      "summary",
      "experience",
      "education",
      "skills",
      "certifications",
    ];

    this.formData = {
      personal: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        state: "",
      },
      summary: "",
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    };
  }

  initializeBuilder() {
    this.renderProgressBar();
    this.renderCurrentStep();
    this.attachEventListeners();
  }

  renderProgressBar() {
    return `
            <div class="progress-container">
                <div class="progress-steps">
                    ${this.steps
                      .map(
                        (step, index) => `
                        <div class="step ${
                          index === this.currentStep ? "active" : ""
                        }">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-label">${
                              step.charAt(0).toUpperCase() + step.slice(1)
                            }</div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `;
  }

  renderCurrentStep() {
    const stepContent = {
      personal: `
                <div class="form-section">
                    <h2>Let's start with your personal information</h2>
                    <p class="helper-text">This information will appear at the top of your resume</p>
                    
                    <div class="name-row">
                        <div class="form-group">
                            <label for="firstName">First Name</label>
                            <input type="text" id="firstName" placeholder="e.g. John">
                        </div>
                        <div class="form-group">
                            <label for="lastName">Last Name</label>
                            <input type="text" id="lastName" placeholder="e.g. Smith">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" placeholder="e.g. john.smith@email.com">
                    </div>

                    <div class="location-row">
                        <div class="form-group">
                            <label for="city">City</label>
                            <input type="text" id="city" placeholder="e.g. Chicago">
                        </div>
                        <div class="form-group">
                            <label for="state">State</label>
                            <input type="text" id="state" placeholder="e.g. IL">
                        </div>
                    </div>
                </div>
            `,
      // Add other step templates...
    };

    return `
            <div class="step-container">
                ${stepContent[this.steps[this.currentStep]]}
                <div class="navigation-buttons">
                    ${
                      this.currentStep > 0
                        ? '<button class="btn-back">Back</button>'
                        : ""
                    }
                    <button class="btn-next">Next</button>
                </div>
            </div>
        `;
  }
}

// Store form data when switching sections
function saveFormData(form) {
  console.log("--- saveFormData started ---");
  console.log("Saving data for form:", form.id);

  const formData = new FormData(form);
  const data = {};

  // Handle regular form inputs
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  // Handle contenteditable fields if they exist
  const editableFields = form.querySelectorAll('[contenteditable="true"]');
  editableFields.forEach((field) => {
    data[field.id] = field.innerHTML;
  });

  // Save to sessionStorage
  const savedData = JSON.parse(sessionStorage.getItem("resumeData") || "{}");
  savedData[form.id] = data;
  sessionStorage.setItem("resumeData", JSON.stringify(savedData));

  console.log("Saved data:", data);
  console.log("--- saveFormData completed ---");
}

// Restore form data when switching sections
function restoreFormData(formId) {
  const savedData = JSON.parse(sessionStorage.getItem("resumeData") || "{}");
  const formData = savedData[formId];

  if (formData) {
    const form = document.getElementById(formId);
    if (form) {
      // Restore regular form inputs
      Object.keys(formData).forEach((key) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === "checkbox") {
            input.checked = formData[key] === "on";
          } else {
            input.value = formData[key];
          }
        }

        // Restore contenteditable fields
        const editableField = form.querySelector(`#${key}[contenteditable]`);
        if (editableField) {
          editableField.innerHTML = formData[key];
        }
      });
    }
  }
}

// Handle back navigation
function handleBackNavigation(previousSection) {
  console.log("--- handleBackNavigation started ---");
  console.log("Moving back to:", previousSection);

  const currentForm = document.querySelector(".section-form.active");
  if (currentForm) {
    // Save current form data before going back
    saveFormData(currentForm);

    // Get current section and update navigation
    const currentSection = currentForm.id.replace("Form", "");

    // Remove active class from current section item
    const currentNavItem = document.querySelector(
      `.section-item[data-section="${currentSection}"]`
    );
    console.log("Current Section::", currentSection);
    if (currentNavItem) {
      currentNavItem.classList.remove("active");
    }

    // Add active class to previous section item
    const prevNavItem = document.querySelector(
      `.section-item[data-section="${previousSection}"]`
    );
    if (prevNavItem) {
      prevNavItem.classList.add("active");
    }
  }

  // Switch to previous section
  switchSection(previousSection);

  console.log("--- handleBackNavigation completed ---");
}

// Switch between sections
function switchSection(sectionId) {
  console.log("Switching to section:", sectionId);

  // Get current and target forms
  const currentForm = document.querySelector(".section-form.active");
  const targetForm = document.getElementById(`${sectionId}Form`);

  console.log("Current form:", currentForm?.id);
  console.log("Target form:", targetForm?.id);

  if (!targetForm) {
    console.error(`Target form not found: ${sectionId}Form`);
    return;
  }

  // Hide current form
  if (currentForm) {
    currentForm.classList.remove("active");
    currentForm.style.display = "none";
  }

  // Show and restore target form
  targetForm.style.display = "block";
  setTimeout(() => targetForm.classList.add("active"), 0);
  restoreFormData(targetForm.id);

  // Update navigation - remove active class from all items first
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Add active class only to the target section
  const targetNavItem = document.querySelector(
    `.nav-item[data-section="${sectionId}"]`
  );
  if (targetNavItem) {
    console.log("Setting active nav item:", sectionId);
    targetNavItem.classList.add("active");
  }
}

// Initialize form data on page load
document.addEventListener("DOMContentLoaded", function () {
  // Restore data for the initial active form
  const activeForm = document.querySelector(".section-form.active");
  if (activeForm) {
    restoreFormData(activeForm.id);
  }

  // Hide all inactive forms
  document.querySelectorAll(".section-form:not(.active)").forEach((form) => {
    form.style.display = "none";
  });

  // Template selector click handling
  const templateButton = document.querySelector(".btn-template");
  const templateDropdown = document.querySelector(".template-dropdown");

  if (templateButton && templateDropdown) {
    // Toggle dropdown on button click
    templateButton.addEventListener("click", function (e) {
      e.stopPropagation();
      templateDropdown.classList.toggle("active");
      console.log(
        "Template button clicked, dropdown state:",
        templateDropdown.classList.contains("active")
      );
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !templateDropdown.contains(e.target) &&
        !templateButton.contains(e.target)
      ) {
        templateDropdown.classList.remove("active");
      }
    });

    // Keep dropdown open when clicking inside it
    templateDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  } else {
    console.error("Template selector elements not found:", {
      button: templateButton,
      dropdown: templateDropdown,
    });
  }

  // Back button click handler
  const backButtons = document.querySelectorAll('.btn-back');
  backButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const previousSection = this.dataset.previous;
      console.log('Back button clicked, going to:', previousSection);
      handleBackNavigation(previousSection);
    });
  });
});

// Update preview based on form data
function updatePreview(formId) {
  const savedData = JSON.parse(sessionStorage.getItem("resumeData") || "{}");
  const formData = savedData[formId];

  if (!formData) return;

  switch (formId) {
    case "personalForm":
      // Update personal details in preview
      const nameElement = document.querySelector(".preview-name");
      const titleElement = document.querySelector(".preview-title");

      if (nameElement) {
        nameElement.textContent = `${formData.firstName || ""} ${
          formData.lastName || ""
        }`.trim();
      }
      if (titleElement) {
        titleElement.textContent = formData.jobTitle || "";
      }
      break;

    case "contactForm":
      // Update contact information in preview
      const contactDetails = document.querySelector(".contact-details");
      if (contactDetails) {
        contactDetails.innerHTML = `
                    <div class="contact-row">
                        <span>${formData.email || ""}</span>
                    </div>
                    <div class="contact-row">
                        <span>${formData.phone || ""}</span>
                    </div>
                    <div class="contact-row">
                        <span>${formData.city || ""}, ${
          formData.country || ""
        }</span>
                    </div>
                `;
      }
      break;

    case "employmentForm":
      // Update employment history in preview
      const employmentEntries = document.querySelector(".employment-entries");
      if (employmentEntries) {
        let entriesHTML = "";

        // Loop through employment entries
        for (let i = 1; formData[`jobTitle${i}`]; i++) {
          entriesHTML += `
                        <div class="employment-entry">
                            <h3>${formData[`jobTitle${i}`] || ""}</h3>
                            <h4>${formData[`employer${i}`] || ""}</h4>
                            <p class="date-range">
                                ${formatDate(formData[`startDate${i}`])} - 
                                ${
                                  formData[`current${i}`]
                                    ? "Present"
                                    : formatDate(formData[`endDate${i}`])
                                }
                            </p>
                            <div class="job-description">
                                ${formData[`description${i}`] || ""}
                            </div>
                        </div>
                    `;
        }

        employmentEntries.innerHTML = entriesHTML;
      }
      break;
  }
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
// Handle form submissions and section navigation
function handleNextSection(event, nextSection) {
  event.preventDefault();
  console.log("--- handleNextSection started ---");
  console.log("Moving to:", nextSection);

  const form = event.target;

  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  // Save form data
  saveFormData(form);

  // Update navigation - remove active from current, add to next
  const currentSection = form.closest(".section-form").id.replace("Form", "");

  // Remove active class from current section item
  const currentNavItem = document.querySelector(
    `.section-item[data-section="${currentSection}"]`
  );
  console.log("test current Section:", currentSection);
  if (currentNavItem) {
    currentNavItem.classList.remove("active");
  }

  // Add active class to next section item
  const nextNavItem = document.querySelector(
    `.section-item[data-section="${nextSection}"]`
  );
  if (nextNavItem) {
    nextNavItem.classList.add("active");
  }

  // Update preview and switch to next section
  updatePreview(form.id);
  switchSection(nextSection);

  console.log("--- handleNextSection completed ---");
  return false;
}
