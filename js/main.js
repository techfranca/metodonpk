/**
 * Escola de Adubação - Upsell Page
 * High-performance JavaScript for interactions
 */

(function() {
    'use strict';

    // ========================================
    // DOM Elements
    // ========================================
    
    const elements = {
        header: document.querySelector('.header'),
        urgencyBar: document.getElementById('urgencyBar'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        mobileMenu: document.getElementById('mobileMenu'),
        floatingCta: document.getElementById('floatingCta'),
        pricingSection: document.getElementById('investimento'),
        faqItems: document.querySelectorAll('.faq-item'),
        animatedElements: document.querySelectorAll('[data-aos]'),
        navLinks: document.querySelectorAll('.nav-link, .mobile-nav-link'),
        ctaButton: document.getElementById('cta-button')
    };

    // ========================================
    // State
    // ========================================
    
    let state = {
        urgencyBarClosed: false,
        mobileMenuOpen: false,
        lastScrollY: 0
    };

    // ========================================
    // Utility Functions
    // ========================================
    
    const debounce = (func, wait = 10) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const throttle = (func, limit = 100) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // ========================================
    // Urgency Bar
    // ========================================
    
    window.closeUrgencyBar = function() {
        if (elements.urgencyBar) {
            elements.urgencyBar.classList.add('hidden');
            state.urgencyBarClosed = true;
            
            // Adjust header position
            if (elements.header) {
                elements.header.style.top = '0';
            }
            
            // Update mobile menu position
            if (elements.mobileMenu) {
                elements.mobileMenu.style.top = '64px';
            }
            
            // Save preference in sessionStorage
            sessionStorage.setItem('urgencyBarClosed', 'true');
        }
    };

    const initUrgencyBar = () => {
        // Check if previously closed
        if (sessionStorage.getItem('urgencyBarClosed') === 'true') {
            closeUrgencyBar();
        }
    };

    // ========================================
    // Mobile Menu
    // ========================================
    
    const toggleMobileMenu = () => {
        state.mobileMenuOpen = !state.mobileMenuOpen;
        
        elements.mobileMenuBtn.classList.toggle('active', state.mobileMenuOpen);
        elements.mobileMenu.classList.toggle('active', state.mobileMenuOpen);
        elements.mobileMenuBtn.setAttribute('aria-expanded', state.mobileMenuOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = state.mobileMenuOpen ? 'hidden' : '';
    };

    const closeMobileMenu = () => {
        if (state.mobileMenuOpen) {
            state.mobileMenuOpen = false;
            elements.mobileMenuBtn.classList.remove('active');
            elements.mobileMenu.classList.remove('active');
            elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    };

    const initMobileMenu = () => {
        if (elements.mobileMenuBtn) {
            elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }

        // Close menu when clicking a link
        elements.navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.mobileMenuOpen) {
                closeMobileMenu();
            }
        });
    };

    // ========================================
    // Scroll Handling
    // ========================================
    
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        // Header scroll state
        if (elements.header) {
            if (currentScrollY > 50) {
                elements.header.classList.add('scrolled');
                if (!state.urgencyBarClosed && elements.urgencyBar) {
                    elements.urgencyBar.classList.add('hidden');
                }
            } else {
                elements.header.classList.remove('scrolled');
                if (!state.urgencyBarClosed && elements.urgencyBar) {
                    elements.urgencyBar.classList.remove('hidden');
                }
            }
        }

        // Floating CTA visibility
        if (elements.floatingCta && elements.pricingSection) {
            const pricingRect = elements.pricingSection.getBoundingClientRect();
            const showFloatingCta = currentScrollY > 500 && pricingRect.top > window.innerHeight;
            elements.floatingCta.classList.toggle('visible', showFloatingCta);
        }

        state.lastScrollY = currentScrollY;
    };

    const initScrollHandler = () => {
        window.addEventListener('scroll', throttle(handleScroll, 50), { passive: true });
        handleScroll(); // Initial check
    };

    // ========================================
    // Smooth Scroll
    // ========================================
    
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    
                    const headerHeight = elements.header ? elements.header.offsetHeight : 0;
                    const urgencyHeight = (elements.urgencyBar && !state.urgencyBarClosed) ? elements.urgencyBar.offsetHeight : 0;
                    const offset = headerHeight + urgencyHeight + 20;
                    
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // ========================================
    // Intersection Observer for Animations
    // ========================================
    
    const initAnimations = () => {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            elements.animatedElements.forEach(el => el.classList.add('aos-animate'));
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.aosDelay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('aos-animate');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        elements.animatedElements.forEach(el => observer.observe(el));
    };

    // ========================================
    // FAQ Accordion
    // ========================================
    
    const initFaqAccordion = () => {
        elements.faqItems.forEach(item => {
            const summary = item.querySelector('summary');
            
            summary.addEventListener('click', (e) => {
                // Optional: Close other items when opening one
                // elements.faqItems.forEach(otherItem => {
                //     if (otherItem !== item && otherItem.hasAttribute('open')) {
                //         otherItem.removeAttribute('open');
                //     }
                // });
            });
        });
    };

    // ========================================
    // CTA Button - Hotmart Integration Placeholder
    // ========================================
    
    const initCtaButton = () => {
        // Link já configurado diretamente no HTML
        // Função mantida apenas para possível tracking futuro
        if (elements.ctaButton) {
            elements.ctaButton.addEventListener('click', () => {
                // Tracking (opcional - para analytics)
                if (typeof gtag === 'function') {
                    gtag('event', 'click', {
                        event_category: 'CTA',
                        event_label: 'Upsell - Método NPK'
                    });
                }
            });
        }
    };

    // ========================================
    // Performance: Lazy Load Images
    // ========================================
    
    const initLazyLoad = () => {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // Fallback with Intersection Observer
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    };

    // ========================================
    // Accessibility: Focus Management
    // ========================================
    
    const initAccessibility = () => {
        // Skip to main content
        const skipLink = document.createElement('a');
        skipLink.href = '#hero';
        skipLink.className = 'sr-only';
        skipLink.textContent = 'Pular para o conteúdo principal';
        skipLink.style.cssText = `
            position: fixed;
            top: -100px;
            left: 10px;
            z-index: 9999;
            padding: 10px 20px;
            background: var(--color-primary);
            color: white;
            border-radius: 4px;
            transition: top 0.2s;
        `;
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '10px';
        });
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-100px';
        });
        document.body.prepend(skipLink);

        // Reduce motion for users who prefer it
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-fast', '0ms');
            document.documentElement.style.setProperty('--transition-base', '0ms');
            document.documentElement.style.setProperty('--transition-slow', '0ms');
        }
    };

    // ========================================
    // Initialize
    // ========================================
    
    const init = () => {
        initUrgencyBar();
        initMobileMenu();
        initScrollHandler();
        initSmoothScroll();
        initAnimations();
        initFaqAccordion();
        initCtaButton();
        initLazyLoad();
        initAccessibility();

        console.log('Escola de Adubação - Página de Upsell inicializada');
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();