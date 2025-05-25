document.addEventListener('DOMContentLoaded', function() {
    const settingsIcon = document.getElementById('settingsIcon');
    const sidepanel = document.getElementById('sidepanel');
    let imageUpload, profileImage;

    // Load sidepanel HTML
    fetch('sidepanel.html')
        .then(response => response.text())
        .then(html => {
            // Extract the sidepanel content from the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const sidepanelContent = doc.querySelector('.sidepanel');
            
            // Add the content to the sidepanel div
            sidepanel.innerHTML = sidepanelContent.innerHTML;
            sidepanel.className = sidepanelContent.className;

            // Initialize elements after content is loaded
            imageUpload = document.getElementById('imageUpload');
            profileImage = document.getElementById('profileImage');

            // Load profile image from localStorage
            const savedImage = localStorage.getItem('profileImage');
            if (profileImage) {
                profileImage.src = savedImage || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
            }

            // Username logic
            const usernameInput = document.getElementById('profileUsername');
            const usernameError = document.getElementById('profileUsernameError');
            if (usernameInput) {
                // Load username from localStorage
                const savedUsername = localStorage.getItem('profileUsername') || '';
                usernameInput.value = savedUsername;
                // Save on input
                usernameInput.addEventListener('input', function() {
                    const value = usernameInput.value.trim();
                    if (value) {
                        localStorage.setItem('profileUsername', value);
                    }
                });
            }

            // Initialize event listeners
            initializeEventListeners();
        })
        .catch(error => console.error('Error loading sidepanel:', error));

    function initializeEventListeners() {
        // Toggle sidepanel
        settingsIcon.addEventListener('click', () => {
            sidepanel.classList.toggle('open');
        });

        // Close button in header
        const closeBtn = document.getElementById('sidepanelClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                sidepanel.classList.remove('open');
            });
        }

        // Multiple accordions
        const accordionHeaders = sidepanel.querySelectorAll('.accordion-header');
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                content.classList.toggle('open');
                const icon = this.querySelector('.accordion-icon');
                icon.textContent = content.classList.contains('open') ? '▼' : '▲';
            });
        });

        // Handle image upload
        if (imageUpload) {
            imageUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imageData = e.target.result;
                        profileImage.src = imageData;
                        localStorage.setItem('profileImage', imageData);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Close sidepanel when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidepanel.contains(e.target) && !settingsIcon.contains(e.target)) {
                sidepanel.classList.remove('open');
            }
        });
    }
}); 