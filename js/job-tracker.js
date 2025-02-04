class JobTracker {
    constructor() {
        this.jobs = [];
        this.currentEditIndex = null;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadSavedJobs();
                this.attachEventListeners();
                this.updateTable();
            });
        } else {
            this.loadSavedJobs();
            this.attachEventListeners();
            this.updateTable();
        }
    }

    loadSavedJobs() {
        const savedJobs = localStorage.getItem('jobs');
        this.jobs = savedJobs ? JSON.parse(savedJobs) : [];
    }

    saveJobs() {
        localStorage.setItem('jobs', JSON.stringify(this.jobs));
    }

    attachEventListeners() {
        const addJobBtn = document.getElementById('addJobBtn');
        if (addJobBtn) {
            addJobBtn.addEventListener('click', () => {
                const modal = document.getElementById('addJobModal');
                if (modal) {
                    modal.style.display = 'block';
                    const form = document.getElementById('addJobForm');
                    if (form) {
                        form.reset();
                    }
                    this.currentEditIndex = null;
                }
            });
        }

        const jobForm = document.getElementById('addJobForm');
        if (jobForm) {
            jobForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        const modal = document.getElementById('addJobModal');
        if (modal) {
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    updateTable() {
        const tableBody = document.getElementById('jobTableBody');
        if (!tableBody) return;

        if (this.jobs.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">No job applications yet</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.jobs.map((job, index) => this.createTableRow(job, index)).join('');
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
            applied: 'status-applied',
            interview: 'status-interview',
            offer: 'status-offer',
            rejected: 'status-rejected'
        };

        return `<span class="status-badge ${statusClasses[status]}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = {
            company: document.getElementById('companyName').value,
            position: document.getElementById('jobTitle').value,
            status: document.getElementById('jobStatus').value,
            dateApplied: document.getElementById('appliedDate').value,
            notes: document.getElementById('notes').value
        };

        if (this.currentEditIndex !== null) {
            this.updateJob(formData);
        } else {
            this.addJob(formData);
        }
    }

    addJob(job) {
        this.jobs.push(job);
        this.saveJobs();
        this.updateTable();
        this.closeModal();
        this.showToast('Job application added successfully!', 'success');
    }

    updateJob(job) {
        this.jobs[this.currentEditIndex] = job;
        this.saveJobs();
        this.updateTable();
        this.closeModal();
        this.showToast('Job application updated successfully!', 'success');
    }

    editJob(index) {
        const job = this.jobs[index];
        this.currentEditIndex = index;

        document.getElementById('companyName').value = job.company;
        document.getElementById('jobTitle').value = job.position;
        document.getElementById('jobStatus').value = job.status;
        document.getElementById('appliedDate').value = job.dateApplied;
        document.getElementById('notes').value = job.notes;

        const modal = document.getElementById('addJobModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    deleteJob(index) {
        if (confirm('Are you sure you want to delete this job application?')) {
            this.jobs.splice(index, 1);
            this.saveJobs();
            this.updateTable();
            this.showToast('Job application deleted successfully', 'success');
        }
    }

    openModal() {
        const modal = document.getElementById('addJobModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeModal() {
        const modal = document.getElementById('addJobModal');
        if (modal) {
            modal.style.display = 'none';
            const form = document.getElementById('addJobForm');
            if (form) {
                form.reset();
            }
            this.currentEditIndex = null;
        }
    }

    showToast(message, type = 'info') {
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        toast.offsetHeight;

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
}

// Initialize the tracker
const jobTracker = new JobTracker();

// Make methods globally available for onclick handlers
window.jobTracker = jobTracker; 