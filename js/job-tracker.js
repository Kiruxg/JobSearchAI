import { authService } from './auth.js';

class DatePicker {
  constructor(inputElement) {
    this.input = inputElement;

    // Set max attribute to today's date
    const today = new Date();
    const maxDate = today.toISOString().split("T")[0];
    this.input.setAttribute("max", maxDate);

    // Set default value to today
    this.input.value = maxDate;

    // Prevent manual entry and enforce max date
    this.input.addEventListener("input", (e) => {
      const selectedDate = new Date(e.target.value);
      const currentDate = new Date();

      if (selectedDate > currentDate) {
        e.target.value = maxDate;
      }
    });

    // Disable keyboard input
    this.input.addEventListener("keydown", (e) => {
      e.preventDefault();
    });
  }
}

class JobTracker {
  constructor() {
    this.jobs = [];
    this.currentEditIndex = null;
    this.platformConnections = { linkedin: false, indeed: false };
    this.init();
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.loadSavedJobs();
        this.attachEventListeners();
        this.updateTable();
        this.initializeDatePicker();
      });
    } else {
      this.loadSavedJobs();
      this.attachEventListeners();
      this.updateTable();
      this.initializeDatePicker();
    }
  }

  loadSavedJobs() {
    const savedJobs = localStorage.getItem("jobs");
    this.jobs = savedJobs ? JSON.parse(savedJobs) : [];
  }

  saveJobs() {
    localStorage.setItem("jobs", JSON.stringify(this.jobs));
  }

  attachEventListeners() {
    console.log('Attaching event listeners');
    
    // Form submission
    const form = document.getElementById("jobForm");
    if (form) {
      console.log('Found job form, attaching submit listener');
      form.addEventListener("submit", (e) => {
        console.log('Form submitted');
        this.handleFormSubmit(e);
      });
    } else {
      console.error('Job form not found in DOM');
    }

    // Add Job button
    const addJobBtn = document.getElementById("addJobBtn");
    const modal = document.getElementById("addJobModal");
    if (addJobBtn && modal) {
      console.log('Found add job button and modal');
      addJobBtn.addEventListener("click", () => {
        console.log('Add Job button clicked');
        modal.style.display = "block";
        if (form) form.reset();
        this.currentEditIndex = null;
      });
    }

    // Close button
    const closeBtn = document.querySelector(".close");
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        console.log('Close button clicked');
        this.closeModal();
      });
    }

    // Outside modal click
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        console.log('Clicked outside modal');
        this.closeModal();
      }
    });
  }

  updateTable() {
    const tableBody = document.getElementById("jobTableBody");
    if (!tableBody) return;

    if (this.jobs.length === 0) {
      tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">No job applications yet</td>
                </tr>
            `;
      return;
    }

    tableBody.innerHTML = this.jobs
      .map((job, index) => this.createTableRow(job, index))
      .join("");
  }

  createTableRow(job, index) {
    return `
            <tr>
                <td>${job.company}</td>
                <td>${job.position}</td>
                <td>${this.getStatusBadge(job.status)}</td>
                <td>${job.dateApplied}</td>
                <td>${job.notes}</td>
                <td>
                    <button class="edit-btn" onclick="jobTracker.editJob(${index})">Edit</button>
                    <button class="delete-btn" onclick="jobTracker.deleteJob(${index})">Delete</button>
                </td>
            </tr>
        `;
  }

  getStatusBadge(status) {
    const statusClasses = {
      applied: "status-applied",
      interview: "status-interview",
      offer: "status-offer",
      rejected: "status-rejected",
    };

    return `<span class="status-badge ${statusClasses[status]}">${
      status.charAt(0).toUpperCase() + status.slice(1)
    }</span>`;
  }

  handleFormSubmit(event) {
    event.preventDefault();
    console.log('Handling form submission');

    const formData = {
      company: document.getElementById("companyName")?.value?.trim(),
      position: document.getElementById("jobTitle")?.value?.trim(),
      status: document.getElementById("jobStatus")?.value,
      dateApplied: document.getElementById("dateApplied")?.value,
      notes: document.getElementById("notes")?.value?.trim() || '',
      timestamp: Date.now()
    };

    console.log('Collected form data:', formData);

    // Validate required fields
    if (!formData.company || !formData.position || !formData.status || !formData.dateApplied) {
      console.error('Missing required fields');
      alert('Please fill in all required fields');
      return;
    }

    if (this.currentEditIndex !== null) {
      console.log('Updating existing job');
      this.updateJob(formData);
    } else {
      console.log('Adding new job');
      this.addJob(formData);
    }

    console.log('Form submission completed');
  }

  addJob(job) {
    console.log('Adding new job to list:', job);
    this.jobs.push(job);
    console.log('Updated jobs list:', this.jobs);
    this.saveJobs();
    this.updateTable();
    this.closeModal();
    this.updateStats();
    this.showToast("Job application added successfully!", "success");
  }

  updateJob(job) {
    this.jobs[this.currentEditIndex] = job;
    this.saveJobs();
    this.updateTable();
    this.closeModal();
    this.showToast("Job application updated successfully!", "success");
  }

  editJob(index) {
    const job = this.jobs[index];
    this.currentEditIndex = index;

    document.getElementById("companyName").value = job.company;
    document.getElementById("jobTitle").value = job.position;
    document.getElementById("jobStatus").value = job.status;
    document.getElementById("dateApplied").value = job.dateApplied;
    document.getElementById("notes").value = job.notes;

    const modal = document.getElementById("addJobModal");
    if (modal) {
      modal.style.display = "block";
    }
  }

  deleteJob(index) {
    if (confirm("Are you sure you want to delete this job application?")) {
      this.jobs.splice(index, 1);
      this.saveJobs();
      this.updateTable();
      this.showToast("Job application deleted successfully", "success");
    }
  }

  openModal() {
    const modal = document.getElementById("addJobModal");
    if (modal) {
      modal.style.display = "block";
    }
  }

  closeModal() {
    const modal = document.getElementById("addJobModal");
    if (modal) {
      modal.style.display = "none";
      const form = document.getElementById("jobForm");
      if (form) {
        form.reset();
      }
      this.currentEditIndex = null;
    }
  }

  showToast(message, type = "info") {
    const existingToasts = document.querySelectorAll(".toast");
    existingToasts.forEach((toast) => toast.remove());

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    toast.offsetHeight;

    setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  initializeDatePicker() {
    const dateInput = document.getElementById("dateApplied");
    if (dateInput) {
      new DatePicker(dateInput);
    }
  }

  updateStats() {
    console.log('Updating dashboard stats');
    // Update total applications
    const totalApplications = document.getElementById('totalApplications');
    if (totalApplications) totalApplications.textContent = this.jobs.length;

    // Update interviews
    const totalInterviews = document.getElementById('totalInterviews');
    if (totalInterviews) {
      const interviewCount = this.jobs.filter(job => job.status === 'interview').length;
      totalInterviews.textContent = interviewCount;
    }

    // Update offers
    const totalOffers = document.getElementById('totalOffers');
    if (totalOffers) {
      const offerCount = this.jobs.filter(job => job.status === 'offer').length;
      totalOffers.textContent = offerCount;
    }

    // Update response rate
    const responseRate = document.getElementById('responseRate');
    if (responseRate) {
      const responses = this.jobs.filter(job => job.status !== 'applied').length;
      const rate = this.jobs.length ? Math.round((responses / this.jobs.length) * 100) : 0;
      responseRate.textContent = `${rate}%`;
    }
  }

  async connectLinkedIn() {
    try {
      const linkedinStatus = document.getElementById('linkedinStatus');
      linkedinStatus.textContent = 'Connecting...';
      
      // Initiate LinkedIn auth
      const token = await authService.initiateAuth('linkedin');
      
      // Store token securely
      await this.storeToken('linkedin', token);
      
      this.platformConnections.linkedin = true;
      linkedinStatus.textContent = 'Connected';
      linkedinStatus.classList.add('connected');
      
      // Fetch applications with token
      await this.fetchLinkedInApplications(token);
      
      this.showToast('Successfully connected to LinkedIn', 'success');
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      document.getElementById('linkedinStatus').textContent = 'Connection failed';
      document.getElementById('linkedinStatus').classList.add('error');
      this.showToast('Failed to connect to LinkedIn', 'error');
    }
  }

  async connectIndeed() {
    try {
      const indeedStatus = document.getElementById('indeedStatus');
      indeedStatus.textContent = 'Connecting...';
      
      // Initiate Indeed auth
      const token = await authService.initiateAuth('indeed');
      
      // Store token securely
      await this.storeToken('indeed', token);
      
      this.platformConnections.indeed = true;
      indeedStatus.textContent = 'Connected';
      indeedStatus.classList.add('connected');
      
      // Fetch applications with token
      await this.fetchIndeedApplications(token);
      
      this.showToast('Successfully connected to Indeed', 'success');
    } catch (error) {
      console.error('Indeed connection error:', error);
      document.getElementById('indeedStatus').textContent = 'Connection failed';
      document.getElementById('indeedStatus').classList.add('error');
      this.showToast('Failed to connect to Indeed', 'error');
    }
  }

  async storeToken(platform, token) {
    // Store token in secure HTTP-only cookie via backend
    await fetch(`/api/auth/${platform}/store-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
  }

  async syncApplications() {
    try {
      // ... sync logic ...
      window.toast.show('Applications synced successfully!', 'success');
    } catch (error) {
      window.toast.show('Failed to sync applications', 'error');
    }
  }
}

// Initialize the tracker
const jobTracker = new JobTracker();

// Make methods globally available for onclick handlers
window.jobTracker = jobTracker;
