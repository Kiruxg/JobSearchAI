class JobTracker {
    constructor() {
        this.jobs = JSON.parse(localStorage.getItem('jobs')) || [];
        this.initializeElements();
        this.attachEventListeners();
        this.updateDashboard();
    }

    initializeElements() {
        // Modal elements
        this.modal = document.getElementById('addJobModal');
        this.addJobBtn = document.getElementById('addJobBtn');
        this.closeBtn = document.querySelector('.close');
        this.addJobForm = document.getElementById('addJobForm');

        // Table and filters
        this.tableBody = document.getElementById('applicationsTableBody');
        this.statusFilter = document.getElementById('statusFilter');
        this.searchInput = document.getElementById('searchJobs');

        // Stats elements
        this.totalApplications = document.getElementById('totalApplications');
        this.totalInterviews = document.getElementById('totalInterviews');
        this.totalOffers = document.getElementById('totalOffers');
        this.responseRate = document.getElementById('responseRate');
    }

    attachEventListeners() {
        // Modal events
        this.addJobBtn.addEventListener('click', () => this.openModal());
        this.closeBtn.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Form submission
        this.addJobForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Filter and search
        this.statusFilter.addEventListener('change', () => this.updateTable());
        this.searchInput.addEventListener('input', () => this.updateTable());
    }

    openModal() {
        this.modal.style.display = 'block';
        this.addJobForm.reset();
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    handleFormSubmit(event) {
        event.preventDefault();

        const newJob = {
            id: Date.now(),
            company: document.getElementById('companyName').value,
            title: document.getElementById('jobTitle').value,
            status: document.getElementById('jobStatus').value,
            appliedDate: document.getElementById('appliedDate').value,
            followUpDate: document.getElementById('followUpDate').value,
            notes: document.getElementById('notes').value
        };

        this.jobs.push(newJob);
        this.saveJobs();
        this.updateDashboard();
        this.closeModal();
        this.showToast('Job application added successfully!');
    }

    updateDashboard() {
        this.updateStats();
        this.updateTable();
        this.updateReminders();
    }

    updateStats() {
        const stats = {
            total: this.jobs.length,
            interviews: this.jobs.filter(job => job.status === 'interview').length,
            offers: this.jobs.filter(job => job.status === 'offer').length
        };

        this.totalApplications.textContent = stats.total;
        this.totalInterviews.textContent = stats.interviews;
        this.totalOffers.textContent = stats.offers;
        this.responseRate.textContent = stats.total ? 
            Math.round((stats.interviews / stats.total) * 100) + '%' : '0%';
    }

    updateTable() {
        const statusFilter = this.statusFilter.value;
        const searchTerm = this.searchInput.value.toLowerCase();

        const filteredJobs = this.jobs.filter(job => {
            const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
            const matchesSearch = job.company.toLowerCase().includes(searchTerm) || 
                                job.title.toLowerCase().includes(searchTerm);
            return matchesStatus && matchesSearch;
        });

        this.tableBody.innerHTML = filteredJobs.map(job => `
            <tr>
                <td>${job.company}</td>
                <td>${job.title}</td>
                <td><span class="status-badge status-${job.status}">${job.status}</span></td>
                <td>${this.formatDate(job.appliedDate)}</td>
                <td>${job.followUpDate ? this.formatDate(job.followUpDate) : '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button edit-button" onclick="jobTracker.editJob(${job.id})">Edit</button>
                        <button class="action-button delete-button" onclick="jobTracker.deleteJob(${job.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateReminders() {
        const remindersList = document.getElementById('remindersList');
        const upcomingReminders = this.jobs
            .filter(job => job.followUpDate && new Date(job.followUpDate) >= new Date())
            .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
            .slice(0, 5);

        remindersList.innerHTML = upcomingReminders.map(job => `
            <div class="reminder-item">
                <div>
                    <strong>${job.company}</strong> - ${job.title}
                    <div class="reminder-date">${this.formatDate(job.followUpDate)}</div>
                </div>
                <span class="status-badge status-${job.status}">${job.status}</span>
            </div>
        `).join('') || '<p>No upcoming reminders</p>';
    }

    editJob(id) {
        const job = this.jobs.find(job => job.id === id);
        if (!job) return;

        // Populate form with job data
        document.getElementById('companyName').value = job.company;
        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobStatus').value = job.status;
        document.getElementById('appliedDate').value = job.appliedDate;
        document.getElementById('followUpDate').value = job.followUpDate;
        document.getElementById('notes').value = job.notes;

        // Update form submission handler
        this.addJobForm.onsubmit = (e) => {
            e.preventDefault();
            Object.assign(job, {
                company: document.getElementById('companyName').value,
                title: document.getElementById('jobTitle').value,
                status: document.getElementById('jobStatus').value,
                appliedDate: document.getElementById('appliedDate').value,
                followUpDate: document.getElementById('followUpDate').value,
                notes: document.getElementById('notes').value
            });

            this.saveJobs();
            this.updateDashboard();
            this.closeModal();
            this.showToast('Job application updated successfully!');
            this.addJobForm.onsubmit = (e) => this.handleFormSubmit(e);
        };

        this.openModal();
    }

    deleteJob(id) {
        if (confirm('Are you sure you want to delete this job application?')) {
            this.jobs = this.jobs.filter(job => job.id !== id);
            this.saveJobs();
            this.updateDashboard();
            this.showToast('Job application deleted successfully!');
        }
    }

    saveJobs() {
        localStorage.setItem('jobs', JSON.stringify(this.jobs));
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jobTracker = new JobTracker();
}); 