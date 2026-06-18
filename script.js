// Interactivity logic for Spanish VIP Landing Page
document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initLearningPath();
});
/**
 * 1. Header Scroll Logic (Glassmorphism effect on scroll)
 */
function initHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}
/**
 * 2. Mobile Menu & Navigation Control
 */
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!mobileToggle || !navMenu) return;
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    // Handle mobile dropdown sub-menus
    const dropdowns = navMenu.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        
        link.addEventListener('click', (e) => {
            // Only trigger on mobile sizes
            if (window.innerWidth <= 768) {
                e.preventDefault();
                
                // Toggle active state
                const isActive = dropdown.classList.contains('active');
                
                // Close other dropdowns
                dropdowns.forEach(d => d.classList.remove('active'));
                
                if (!isActive) {
                    dropdown.classList.add('active');
                }
            }
        });
    });
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });
}
/**
 * 3. Learning Path Level Selector Logic
 */
function initLearningPath() {
    const levelsList = document.getElementById('levelsList');
    const pathDescription = document.getElementById('pathDescription');
    const detailSkills = document.getElementById('detailSkills');
    const detailLessons = document.getElementById('detailLessons');
    const detailActivities = document.getElementById('detailActivities');
    if (!levelsList || !pathDescription || !detailSkills || !detailLessons || !detailActivities) return;
    // Database containing specific details for each level
    const levelData = {
        'A0': {
            description: 'If, for example, your child is starting A0 (From Zero), we build base phonics, alphabet sounds, greetings, and basic noun categorization so they gain confidence in pronouncing words.',
            skills: 'Base Phonics & Basic Greetings',
            lessons: '15+ lessons',
            activities: '120+ items'
        },
        'A1': {
            description: 'At A1 (Beginner), kids learn common verbs in the present tense, descriptors like color/size, short simple sentences, and expressing basic needs and feelings directly.',
            skills: 'Simple sentence patterns & Daily words',
            lessons: '32+ lessons',
            activities: '240+ items'
        },
        'A2': {
            description: 'At A2 (Upper Beginner), we focus on simple past tense verb conjugations, describing family members, routines, asking directions, and short interactive roleplay dialogs.',
            skills: 'Past/future talking & Social roleplay',
            lessons: '40+ lessons',
            activities: '280+ items'
        },
        'B1': {
            description: 'At B1 (Intermediate), students understand the main points of clear standard input on familiar matters regularly encountered. They can express dreams, hopes, and opinions.',
            skills: 'Express opinions & Story narration',
            lessons: '45+ lessons',
            activities: '310+ items'
        },
        'B2': {
            description: 'At B2 (Upper-Intermediate), students interact with a degree of fluency and spontaneity. They understand the main ideas of complex text and speak without strain for either party.',
            skills: 'Spontaneous talks & Complex text read',
            lessons: '50+ lessons',
            activities: '340+ items'
        },
        'C1': {
            description: 'At C1 (Advanced), kids can express ideas fluently and spontaneously. They use language flexibly and effectively for social, academic, and professional purposes with native speakers.',
            skills: 'Express Yourself Like a Native!',
            lessons: '55+ lessons',
            activities: '380+ items'
        }
    };
    const levelButtons = levelsList.querySelectorAll('.level-item');
    
    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            levelButtons.forEach(b => b.classList.remove('active'));
            
            // Add active to current
            btn.classList.add('active');
            
            // Get level key
            const levelKey = btn.getAttribute('data-level');
            const data = levelData[levelKey];
            
            if (data) {
                // Update text content with subtle fading animation
                animateFadeOutIn(pathDescription, data.description);
                animateFadeOutIn(detailSkills, data.skills);
                animateFadeOutIn(detailLessons, data.lessons);
                animateFadeOutIn(detailActivities, data.activities);
            }
        });
    });
}
/**
 * Helper: Applies a quick fade-out, updates content, and fades back in.
 */
function animateFadeOutIn(element, newText) {
    element.style.transition = 'opacity 0.15s ease-out';
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.textContent = newText;
        element.style.opacity = '1';
    }, 150);
}
