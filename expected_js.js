// ModHeader Extension JavaScript
class ModHeader {
    constructor() {
        this.init();
        this.bindEvents();
        this.loadStoredData();
    }

    init() {
        // Set initial active tab
        this.activeTab = 'mods';
        this.profiles = [
            {
                id: 1,
                name: 'Profile 1',
                active: true,
                requestHeaders: [],
                cookieAppends: [],
                redirectUrls: [],
                tabFilters: [],
                urlFilters: []
            }
        ];
        this.currentProfile = this.profiles[0];
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Close button
        document.querySelector('.close-btn').addEventListener('click', () => {
            console.log('Extension closed');
        });

        // Mod/Filter item clicks
        document.querySelectorAll('.mod-item:not(.disabled)').forEach(item => {
            item.addEventListener('click', (e) => this.handleModClick(e));
        });

        document.querySelectorAll('.filter-item:not(.disabled)').forEach(item => {
            item.addEventListener('click', (e) => this.handleFilterClick(e));
        });

        // Profile management
        document.querySelector('.add-profile-btn').addEventListener('click', () => this.addProfile());
        document.querySelector('.sort-profiles-btn').addEventListener('click', () => this.sortProfiles());

        // Add buttons
        document.querySelector('.add-header-btn')?.addEventListener('click', () => this.addRequestHeader());
        document.querySelector('.add-cookie-btn')?.addEventListener('click', () => this.addCookieAppend());
        document.querySelector('.add-redirect-btn')?.addEventListener('click', () => this.addRedirectUrl());

        // Delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                this.deleteRow(e.target);
            }
        });

        // Checkbox changes
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.handleCheckboxChange(e.target);
            }
        });

        // Input changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[type="text"]')) {
                this.handleInputChange(e.target);
            }
        });

        // Action buttons
        document.querySelector('.mod-btn')?.addEventListener('click', () => this.showModsTab());
        document.querySelector('.filter-btn')?.addEventListener('click', () => this.showFiltersTab());
        document.querySelector('.login-btn')?.addEventListener('click', () => this.handleLogin());
        document.querySelector('.browse-btn')?.addEventListener('click', () => this.browseProfiles());

        // Search functionality
        document.querySelector('.search-input')?.addEventListener('input', (e) => this.searchProfiles(e.target.value));
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.activeTab = tabName;
    }

    handleModClick(e) {
        const modItem = e.currentTarget;
        const modTitle = modItem.querySelector('.mod-title').textContent.split(' ')[0] + ' ' + modItem.querySelector('.mod-title').textContent.split(' ')[1];

        console.log(`Mod selected: ${modTitle}`);

        // Add visual feedback
        modItem.style.transform = 'scale(0.98)';
        setTimeout(() => {
            modItem.style.transform = 'scale(1)';
        }, 150);

        // Handle specific mod types
        switch(modTitle) {
            case 'Request header':
                this.addRequestHeader();
                break;
            case 'Response header':
                this.addResponseHeader();
                break;
            case 'Redirect URL':
                this.addRedirectUrl();
                break;
            case 'Cookie request':
                this.addCookieAppend();
                break;
            default:
                this.showNotification(`${modTitle} mod selected`);
        }
    }

    handleFilterClick(e) {
        const filterItem = e.currentTarget;
        const filterTitle = filterItem.querySelector('.filter-title').textContent.split(' ')[0] + ' ' + filterItem.querySelector('.filter-title').textContent.split(' ')[1];

        console.log(`Filter selected: ${filterTitle}`);

        // Add visual feedback
        filterItem.style.transform = 'scale(0.98)';
        setTimeout(() => {
            filterItem.style.transform = 'scale(1)';
        }, 150);

        // Handle specific filter types
        switch(filterTitle) {
            case 'Tab filter':
                this.addTabFilter();
                break;
            case 'Request URL':
                this.addUrlFilter();
                break;
            case 'Request domain':
                this.addDomainFilter();
                break;
            default:
                this.showNotification(`${filterTitle} filter selected`);
        }
    }

    addProfile() {
        const newId = Math.max(...this.profiles.map(p => p.id)) + 1;
        const newProfile = {
            id: newId,
            name: `Profile ${newId}`,
            active: false,
            requestHeaders: [],
            cookieAppends: [],
            redirectUrls: [],
            tabFilters: [],
            urlFilters: []
        };

        this.profiles.push(newProfile);
        this.updateProfilesList();
        this.showNotification('New profile created');
    }

    addRequestHeader() {
        const headerInputs = document.querySelector('.header-inputs');
        if (headerInputs) {
            const newRow = this.createHeaderRow('', '');
            const addButton = headerInputs.querySelector('.add-header-btn');
            headerInputs.insertBefore(newRow, addButton);
        }
    }

    addResponseHeader() {
        // Similar to addRequestHeader but for response headers
        this.showNotification('Response header mod added');
    }

    addCookieAppend() {
        const cookieInputs = document.querySelector('.cookie-inputs');
        if (cookieInputs) {
            const newRow = this.createCookieRow('', '');
            const addButton = cookieInputs.querySelector('.add-cookie-btn');
            cookieInputs.insertBefore(newRow, addButton);
        }
    }

    addRedirectUrl() {
        const redirectInputs = document.querySelector('.redirect-inputs');
        if (redirectInputs) {
            const newRow = this.createRedirectRow('', '');
            const addButton = redirectInputs.querySelector('.add-redirect-btn');
            redirectInputs.insertBefore(newRow, addButton);
        }
    }

    addTabFilter() {
        this.showNotification('Tab filter added');
    }

    addUrlFilter() {
        this.showNotification('URL filter added');
    }

    createHeaderRow(name, value) {
        const row = document.createElement('div');
        row.className = 'header-row';
        row.innerHTML = `
            <input type="checkbox" checked>
            <input type="text" placeholder="Name" class="name-input" value="${name}">
            <input type="text" placeholder="Value" class="value-input" value="${value}">
            <button class="delete-btn">×</button>
        `;
        return row;
    }

    createCookieRow(name, value) {
        const row = document.createElement('div');
        row.className = 'cookie-row';
        row.innerHTML = `
            <input type="checkbox" checked>
            <input type="text" placeholder="Name" class="name-input" value="${name}">
            <input type="text" placeholder="Value" class="value-input" value="${value}">
            <button class="delete-btn">×</button>
        `;
        return row;
    }

    createRedirectRow(originalUrl, redirectUrl) {
        const row = document.createElement('div');
        row.className = 'redirect-row';
        row.innerHTML = `
            <input type="checkbox" checked>
            <input type="text" placeholder="Original URL" class="original-url-input" value="${originalUrl}">
            <input type="text" placeholder="Redirect URL" class="redirect-url-input" value="${redirectUrl}">
            <button class="delete-btn">×</button>
        `;
        return row;
    }

    deleteRow(deleteBtn) {
        const row = deleteBtn.closest('.header-row, .cookie-row, .redirect-row');
        if (row) {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                row.remove();
            }, 200);
        }
    }

    handleCheckboxChange(checkbox) {
        const section = checkbox.closest('.config-section, .header-row, .cookie-row, .redirect-row');
        if (section) {
            if (checkbox.checked) {
                section.style.opacity = '1';
            } else {
                section.style.opacity = '0.6';
            }
        }
        this.saveData();
    }

    handleInputChange(input) {
        // Save changes in real-time
        this.saveData();

        // Add visual feedback for changes
        input.style.borderColor = '#4a90e2';
        setTimeout(() => {
            input.style.borderColor = '#444';
        }, 1000);
    }

    showModsTab() {
        this.switchTab('mods');
    }

    showFiltersTab() {
        this.switchTab('filters');
    }

    handleLogin() {
        this.showNotification('Login functionality not implemented');
    }

    browseProfiles() {
        this.showNotification('Browse profiles functionality');
    }

    searchProfiles(query) {
        // Filter profiles based on search query
        console.log(`Searching profiles: ${query}`);
    }

    sortProfiles() {
        this.profiles.sort((a, b) => a.name.localeCompare(b.name));
        this.updateProfilesList();
        this.showNotification('Profiles sorted alphabetically');
    }

    updateProfilesList() {
        // Update the profiles display
        console.log('Profiles updated:', this.profiles);
    }

    showNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4a90e2;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    saveData() {
        // Save current state to localStorage
        const data = {
            profiles: this.profiles,
            currentProfile: this.currentProfile,
            activeTab: this.activeTab
        };
        localStorage.setItem('modheader_data', JSON.stringify(data));
    }

    loadStoredData() {
        // Load saved state from localStorage
        const stored = localStorage.getItem('modheader_data');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.profiles = data.profiles || this.profiles;
                this.currentProfile = data.currentProfile || this.currentProfile;
                this.activeTab = data.activeTab || this.activeTab;

                // Restore UI state
                if (this.activeTab !== 'mods') {
                    this.switchTab(this.activeTab);
                }
            } catch (e) {
                console.error('Error loading stored data:', e);
            }
        }
    }

    // Keyboard shortcuts
    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    this.switchTab('mods');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchTab('filters');
                    break;
                case 'n':
                    e.preventDefault();
                    this.addProfile();
                    break;
            }
        }
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const modHeader = new ModHeader();

    // Add keyboard support
    document.addEventListener('keydown', (e) => modHeader.handleKeyboard(e));

    // Add some demo data for testing
    setTimeout(() => {
        // Simulate adding some default headers
        const headerInputs = document.querySelectorAll('.name-input');
        const valueInputs = document.querySelectorAll('.value-input');

        if (headerInputs.length >= 3) {
            headerInputs[0].value = 'Authorization';
            valueInputs[0].value = 'Bearer token123';
            headerInputs[1].value = 'Content-Type';
            valueInputs[1].value = 'application/json';
            headerInputs[2].value = 'X-Custom-Header';
            valueInputs[2].value = 'custom-value';
        }
    }, 500);

    console.log('ModHeader Extension initialized');
});

// Add some utility functions
function debounce(func, wait) {
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModHeader;
}