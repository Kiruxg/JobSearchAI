class BlogManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.currentPage = 1;
        this.postsPerPage = 9;
        this.currentCategory = 'all';
    }

    initializeElements() {
        this.categoryButtons = document.querySelectorAll('.category-btn');
        this.blogGrid = document.querySelector('.blog-grid');
        this.paginationContainer = document.querySelector('.pagination');
        this.prevButton = this.paginationContainer.querySelector('.pagination-btn:first-child');
        this.nextButton = this.paginationContainer.querySelector('.pagination-btn:last-child');
        this.pageNumbers = this.paginationContainer.querySelectorAll('.page-number');
    }

    attachEventListeners() {
        // Category filtering
        this.categoryButtons.forEach(button => {
            button.addEventListener('click', () => this.handleCategoryChange(button));
        });

        // Pagination
        this.prevButton.addEventListener('click', () => this.changePage('prev'));
        this.nextButton.addEventListener('click', () => this.changePage('next'));
        this.pageNumbers.forEach(number => {
            number.addEventListener('click', (e) => this.goToPage(parseInt(e.target.textContent)));
        });
    }

    handleCategoryChange(selectedButton) {
        // Update active state
        this.categoryButtons.forEach(button => button.classList.remove('active'));
        selectedButton.classList.add('active');

        // Get selected category
        this.currentCategory = selectedButton.dataset.category;
        
        // Reset to first page
        this.currentPage = 1;

        // Filter posts
        this.filterPosts();
        
        // Update pagination
        this.updatePagination();

        // Animate transition
        this.animateGridTransition();
    }

    filterPosts() {
        const posts = this.blogGrid.querySelectorAll('.blog-card');
        
        posts.forEach(post => {
            const category = post.querySelector('.blog-category').textContent.toLowerCase();
            const shouldShow = this.currentCategory === 'all' || category === this.currentCategory;
            
            post.style.display = shouldShow ? 'block' : 'none';
            
            if (shouldShow) {
                post.style.opacity = '0';
                setTimeout(() => {
                    post.style.opacity = '1';
                }, 50);
            }
        });

        // Update "no results" message
        this.updateNoResults(posts);
    }

    updateNoResults(posts) {
        const visiblePosts = Array.from(posts).filter(post => 
            post.style.display !== 'none'
        ).length;

        const noResultsEl = this.blogGrid.querySelector('.no-results');
        
        if (visiblePosts === 0) {
            if (!noResultsEl) {
                const message = document.createElement('div');
                message.className = 'no-results';
                message.textContent = 'No articles found in this category.';
                this.blogGrid.appendChild(message);
            }
        } else if (noResultsEl) {
            noResultsEl.remove();
        }
    }

    changePage(direction) {
        const totalPages = this.calculateTotalPages();
        
        if (direction === 'prev' && this.currentPage > 1) {
            this.currentPage--;
        } else if (direction === 'next' && this.currentPage < totalPages) {
            this.currentPage++;
        }

        this.updatePagination();
        this.updatePostsVisibility();
    }

    goToPage(pageNumber) {
        this.currentPage = pageNumber;
        this.updatePagination();
        this.updatePostsVisibility();
    }

    calculateTotalPages() {
        const visiblePosts = Array.from(this.blogGrid.querySelectorAll('.blog-card'))
            .filter(post => post.style.display !== 'none');
        return Math.ceil(visiblePosts.length / this.postsPerPage);
    }

    updatePagination() {
        const totalPages = this.calculateTotalPages();

        // Update page numbers
        this.pageNumbers.forEach(number => {
            const pageNum = parseInt(number.textContent);
            number.classList.toggle('active', pageNum === this.currentPage);
        });

        // Update navigation buttons
        this.prevButton.disabled = this.currentPage === 1;
        this.nextButton.disabled = this.currentPage === totalPages;

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updatePostsVisibility() {
        const posts = this.blogGrid.querySelectorAll('.blog-card');
        const startIndex = (this.currentPage — 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;

        posts.forEach((post, index) => {
            if (post.style.display !== 'none') {
                const shouldShow = index >= startIndex && index < endIndex;
                post.style.opacity = shouldShow ? '1' : '0';
                post.style.transform = shouldShow ? 'translateY(0)' : 'translateY(20px)';
            }
        });
    }

    animateGridTransition() {
        this.blogGrid.style.opacity = '0';
        this.blogGrid.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            this.blogGrid.style.opacity = '1';
            this.blogGrid.style.transform = 'translateY(0)';
        }, 50);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const blogManager = new BlogManager();

    // Add smooth scroll behavior for pagination clicks
    document.querySelectorAll('.pagination-btn, .page-number').forEach(element => {
        element.addEventListener('click', () => {
            const blogHeader = document.querySelector('.blog-header');
            blogHeader.scrollIntoView({ behavior: 'smooth' });
        });
    });
}); 