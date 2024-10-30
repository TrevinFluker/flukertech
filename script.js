(function() {
    // Slider Functionality
    const sliderInner = document.getElementById('slider-inner');
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');
    const slides = sliderInner ? sliderInner.children.length : 0;
    let index = 0;

    function updateSlider() {
        sliderInner.style.transform = 'translateX(' + (-index * 100) + '%)';
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', function() {
            index = (index + 1) % slides;
            updateSlider();
        });

        prevBtn.addEventListener('click', function() {
            index = (index - 1 + slides) % slides;
            updateSlider();
        });
    }

    // Toggle Button Functionality
    const toggleButton = document.getElementById('toggle-button');
    const toggleOptions = toggleButton.querySelectorAll('.toggle-option');
    const gigSection = document.getElementById('gig-section');
    const extensionSection = document.getElementById('extension-section');
    const libraryText = document.getElementById('library-text');
    const developerText = document.getElementById('developer-text');
    const sliderNav = document.getElementById('slider-nav');

    toggleOptions.forEach(option => {
        option.addEventListener('click', function() {
            toggleOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            if (this.dataset.option === 'library') {
                extensionSection.style.display = 'flex';
                gigSection.style.display = 'none';
                sliderNav.style.display = 'none';
                libraryText.style.display = 'block';
                developerText.style.display = 'none';
            } else {
                extensionSection.style.display = 'none';
                gigSection.style.display = 'block';
                sliderNav.style.display = 'block';
                libraryText.style.display = 'none';
                developerText.style.display = 'block';
            }
        });
    });

    // Initialize the sections
    extensionSection.style.display = 'flex';
    gigSection.style.display = 'none';
    sliderNav.style.display = 'none';
    libraryText.style.display = 'block';
    developerText.style.display = 'none';

    // Hamburger Menu Functionality
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('overlay');

    function toggleMenu() {
        navMenu.classList.toggle('show');
        overlay.classList.toggle('show');
    }

    hamburger.addEventListener('click', function(event) {
        event.stopPropagation();
        toggleMenu();
    });

    overlay.addEventListener('click', function() {
        toggleMenu();
    });

    // Close menu when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isHamburger = hamburger.contains(event.target);

        if (!isClickInsideMenu && !isHamburger && navMenu.classList.contains('show')) {
            toggleMenu();
        }
    });
})();
