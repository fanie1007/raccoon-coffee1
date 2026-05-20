document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once animation has triggered
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements to animate
    const animateElements = document.querySelectorAll('.fade-up, .fade-in-left, .fade-in-right');
    
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // JS Fallback for Parallax (for Safari/Firefox lacking animation-timeline)
    if (!CSS.supports('animation-timeline: scroll()')) {
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY <= window.innerHeight) {
                hero.style.backgroundPosition = `center ${scrollY * 0.5}px`;
                heroContent.style.transform = `translateY(${scrollY * 0.4}px)`;
                heroContent.style.opacity = Math.max(0, 1 - (scrollY / 400));
            }
        });
    }

    // 3D Carousel Logic
    const carousel = document.getElementById('carousel');
    const galleryContainer = document.querySelector('.gallery-container');
    const items = document.querySelectorAll('.carousel-item');
    
    if (carousel && items.length > 0) {
        const itemCount = items.length;
        const radius = 350; 
        
        items.forEach((item, i) => {
            const angle = (i * 360) / itemCount;
            item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
        });
        
        let isDragging = false;
        let startX = 0;
        let currentAngle = 0; 
        let rotationY = 0;    
        let autoRotate = true;
        let autoRotateAngle = 0;
        let autoRotateSpeed = 0.15;
        let animationFrameId;

        const render = () => {
            if (autoRotate && !isDragging) {
                autoRotateAngle -= autoRotateSpeed;
                carousel.style.transform = `rotateY(${autoRotateAngle}deg)`;
                currentAngle = autoRotateAngle;
            }
            animationFrameId = requestAnimationFrame(render);
        };
        
        render();

        const handleDragStart = (e) => {
            isDragging = true;
            autoRotate = false;
            galleryContainer.style.cursor = 'grabbing';
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            carousel.style.transition = 'none';
        };

        const handleDragMove = (e) => {
            if (!isDragging) return;
            const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            const diffX = currentX - startX;
            rotationY = currentAngle + (diffX * 0.5);
            carousel.style.transform = `rotateY(${rotationY}deg)`;
        };

        const handleDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            galleryContainer.style.cursor = 'grab';
            currentAngle = rotationY;
            autoRotateAngle = currentAngle;
            carousel.style.transition = 'transform 0.1s ease-out';
            
            setTimeout(() => {
                if (!isDragging) autoRotate = true;
            }, 3000);
        };

        galleryContainer.addEventListener('mousedown', handleDragStart);
        galleryContainer.addEventListener('touchstart', handleDragStart, {passive: true});
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('touchmove', handleDragMove, {passive: true});
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Adjust scroll position for fixed navbar
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
