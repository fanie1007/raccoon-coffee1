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
        let startY = 0;
        let dragThreshold = 6; // px to differentiate drag vs click
        let wasDragged = false;
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
            wasDragged = false;
            galleryContainer.style.cursor = 'grabbing';
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            startY = e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;
            carousel.style.transition = 'none';
        };

        const handleDragMove = (e) => {
            if (!isDragging) return;
            const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;
            
            // Check if user dragged beyond threshold
            if (Math.abs(diffX) > dragThreshold || Math.abs(diffY) > dragThreshold) {
                wasDragged = true;
            }
            
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
                const lightbox = document.getElementById('galleryLightbox');
                const isLightboxActive = lightbox && lightbox.classList.contains('active');
                if (!isDragging && !isLightboxActive) autoRotate = true;
            }, 3000);
        };

        galleryContainer.addEventListener('mousedown', handleDragStart);
        galleryContainer.addEventListener('touchstart', handleDragStart, {passive: true});
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('touchmove', handleDragMove, {passive: true});
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);

        // Lightbox Logic inside the Carousel block to control auto-rotation
        const lightbox = document.getElementById('galleryLightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxClose = document.getElementById('lightboxClose');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');
        
        let activeImageIndex = 0;
        const imagesList = Array.from(items).map(item => item.querySelector('img').getAttribute('src'));
        
        const openLightbox = (index) => {
            activeImageIndex = index;
            if (lightboxImg) lightboxImg.src = imagesList[activeImageIndex];
            if (lightbox) lightbox.classList.add('active');
            autoRotate = false; // Pause 3D carousel rotation
        };
        
        const closeLightbox = () => {
            if (lightbox) lightbox.classList.remove('active');
            // Resume 3D carousel after 2 seconds
            setTimeout(() => {
                if (!isDragging && (!lightbox || !lightbox.classList.contains('active'))) {
                    autoRotate = true;
                }
            }, 2000);
        };
        
        const showNextImage = () => {
            activeImageIndex = (activeImageIndex + 1) % imagesList.length;
            if (lightboxImg) {
                lightboxImg.style.opacity = '0';
                setTimeout(() => {
                    lightboxImg.src = imagesList[activeImageIndex];
                    lightboxImg.style.opacity = '1';
                }, 150);
            }
        };
        
        const showPrevImage = () => {
            activeImageIndex = (activeImageIndex - 1 + imagesList.length) % imagesList.length;
            if (lightboxImg) {
                lightboxImg.style.opacity = '0';
                setTimeout(() => {
                    lightboxImg.src = imagesList[activeImageIndex];
                    lightboxImg.style.opacity = '1';
                }, 150);
            }
        };

        // Add opacity transition to lightbox image
        if (lightboxImg) {
            lightboxImg.style.transition = 'opacity 0.15s ease-in-out';
        }
        
        // Click on carousel items to open lightbox
        items.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                // If it was a drag, don't open
                if (wasDragged) return;
                openLightbox(index);
            });
        });
        
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);
        if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
        
        // Close on overlay background click
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
        }
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (!lightbox || !lightbox.classList.contains('active')) return;
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'Escape') closeLightbox();
        });
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

    // Select Product Buttons handler
    const selectProductButtons = document.querySelectorAll('.select-product-btn');
    const beanSelect = document.getElementById('beanSelect');
    
    selectProductButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            if (beanSelect && productName) {
                beanSelect.value = productName;
            }
        });
    });

    // Form submission & Modal logic
    const orderForm = document.getElementById('orderForm');
    const successModal = document.getElementById('successModal');
    const closeModal = document.getElementById('closeModal');
    const orderSummaryText = document.getElementById('orderSummaryText');
    const copyOrderBtn = document.getElementById('copyOrderBtn');
    const lineOrderBtn = document.getElementById('lineOrderBtn');
    const emailOrderBtn = document.getElementById('emailOrderBtn');
    
    let generatedOrderText = '';

    if (orderForm && successModal) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(orderForm);
            const bean = formData.get('bean');
            const grind = formData.get('grind');
            const quantity = formData.get('quantity');
            const delivery = formData.get('delivery');
            const name = formData.get('name');
            const phone = formData.get('phone');
            const address = formData.get('address');
            const notes = formData.get('notes') || '無';
            
            // Calculate pricing
            let pricePerBag = 0;
            if (bean.includes('夜行者濃縮')) pricePerBag = 450;
            else if (bean.includes('樹冠特調')) pricePerBag = 520;
            else if (bean.includes('神偷低因')) pricePerBag = 480;
            
            let shippingFee = 0;
            if (delivery === '宅配到府') shippingFee = 80;
            else if (delivery === '超商取貨付款') shippingFee = 60;
            
            const subtotal = pricePerBag * parseInt(quantity);
            const total = subtotal + shippingFee;

            generatedOrderText = `【 浣熊咖啡 Raccoon Coffee 訂單明細 】
----------------------------------
☕️ 訂購品項：${bean}
🐾 研磨需求：${grind}
📦 訂購數量：${quantity} 包 (半磅/包)
🚚 配送方式：${delivery}

👤 收件人姓名：${name}
📞 聯絡電話：${phone}
🏠 收件地址/門市：${address}
📝 備註：${notes}

----------------------------------
💰 商品金額：NT$ ${subtotal}
🚚 運費：NT$ ${shippingFee}
💳 應付總金額：NT$ ${total}
----------------------------------
※ 商家收到訊息後會盡快與您聯絡確認匯款及寄送資訊！`;

            if (orderSummaryText) {
                orderSummaryText.textContent = generatedOrderText;
            }
            
            successModal.classList.add('active');
        });
    }

    if (closeModal && successModal) {
        closeModal.addEventListener('click', () => {
            successModal.classList.remove('active');
        });
        
        // Close modal when clicking outside content
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }

    // Modal Action Buttons
    if (copyOrderBtn) {
        copyOrderBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(generatedOrderText)
                .then(() => {
                    const originalText = copyOrderBtn.textContent;
                    copyOrderBtn.textContent = '✅ 已複製！';
                    setTimeout(() => {
                        copyOrderBtn.textContent = originalText;
                    }, 2000);
                })
                .catch(err => {
                    alert('複製失敗，請手動選取複製！');
                });
        });
    }

    if (lineOrderBtn) {
        lineOrderBtn.addEventListener('click', () => {
            // Line share text endpoint: https://line.me/R/msg/text/?{encoded_text}
            const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(generatedOrderText)}`;
            window.open(lineUrl, '_blank');
        });
    }

    if (emailOrderBtn) {
        emailOrderBtn.addEventListener('click', () => {
            // Open user's default email client
            const mailtoUrl = `mailto:order@raccoon-coffee.com?subject=${encodeURIComponent('浣熊咖啡新訂單 - ' + document.getElementById('nameInput').value)}&body=${encodeURIComponent(generatedOrderText)}`;
            window.location.href = mailtoUrl;
        });
    }

    // --- Hero Ambient Canvas Background (Swirl Effect) ---
    const initHeroBackground = () => {
        const heroContainer = document.getElementById('heroCanvasContainer');
        if (!heroContainer) return;

        const { PI, cos, sin, abs, random } = Math;
        const TAU = 2 * PI;
        const rand = n => n * random();
        const randRange = n => n - rand(2 * n);
        const fadeInOut = (t, m) => {
            let hm = 0.5 * m;
            return abs((t + hm) % m - hm) / (hm);
        };
        const lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;

        const particleCount = 450;
        const particlePropCount = 9;
        const particlePropsLength = particleCount * particlePropCount;
        const rangeY = 150;
        const baseTTL = 60;
        const rangeTTL = 140;
        const baseSpeed = 0.2;
        const rangeSpeed = 1.8;
        const baseRadius = 0.8;
        const rangeRadius = 3.2;
        const baseHue = 12; // Orange / Red-orange base hue (HSL: ~12-47 degrees)
        const rangeHue = 35; 

        let canvas, ctx, center, tick, particleProps;

        function setup() {
            createCanvas();
            resize();
            initParticles();
            draw();
        }

        function initParticles() {
            tick = 0;
            particleProps = new Float32Array(particlePropsLength);
            for (let i = 0; i < particlePropsLength; i += particlePropCount) {
                initParticle(i);
            }
        }

        function initParticle(i) {
            let x = rand(canvas.a.width);
            let y = center[1] + randRange(rangeY);
            let vx = 0;
            let vy = 0;
            let life = 0;
            let ttl = baseTTL + rand(rangeTTL);
            let speed = baseSpeed + rand(rangeSpeed);
            let radius = baseRadius + rand(rangeRadius);
            let hue = baseHue + rand(rangeHue);

            particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
        }

        function drawParticles() {
            for (let i = 0; i < particlePropsLength; i += particlePropCount) {
                updateParticle(i);
            }
        }

        function updateParticle(i) {
            let i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i, i9=8+i;
            let x = particleProps[i];
            let y = particleProps[i2];
            
            // Mathematical flowing vector field (smooth wave harmonics simulating simplex noise)
            let angle = (
                sin(x * 0.002 + tick * 0.004) * 1.5 +
                cos(y * 0.003 - tick * 0.003) * 1.2 +
                sin((x + y) * 0.001 + tick * 0.002) * 0.8
            ) * PI;

            let vx = lerp(particleProps[i3], cos(angle), 0.5);
            let vy = lerp(particleProps[i4], sin(angle), 0.5);
            let life = particleProps[i5];
            let ttl = particleProps[i6];
            let speed = particleProps[i7];
            let x2 = x + vx * speed;
            let y2 = y + vy * speed;
            let radius = particleProps[i8];
            let hue = particleProps[i9];

            drawParticle(x, y, x2, y2, life, ttl, radius, hue);

            life++;

            particleProps[i] = x2;
            particleProps[i2] = y2;
            particleProps[i3] = vx;
            particleProps[i4] = vy;
            particleProps[i5] = life;

            if (checkBounds(x, y) || life > ttl) {
                initParticle(i);
            }
        }

        function drawParticle(x, y, x2, y2, life, ttl, radius, hue) {
            ctx.a.save();
            ctx.a.lineCap = 'round';
            ctx.a.lineWidth = radius;
            ctx.a.strokeStyle = `hsla(${hue}, 100%, 55%, ${fadeInOut(life, ttl)})`;
            ctx.a.beginPath();
            ctx.a.moveTo(x, y);
            ctx.a.lineTo(x2, y2);
            ctx.a.stroke();
            ctx.a.closePath();
            ctx.a.restore();
        }

        function checkBounds(x, y) {
            return (
                x > canvas.a.width ||
                x < 0 ||
                y > canvas.a.height ||
                y < 0
            );
        }

        function createCanvas() {
            canvas = {
                a: document.createElement('canvas'),
                b: document.createElement('canvas')
            };
            heroContainer.appendChild(canvas.b);
            ctx = {
                a: canvas.a.getContext('2d'),
                b: canvas.b.getContext('2d')
            };
            center = [];
        }

        function resize() {
            const heroSection = document.getElementById('hero');
            const width = window.innerWidth;
            const height = heroSection ? heroSection.offsetHeight : window.innerHeight;
            
            canvas.a.width = width;
            canvas.a.height = height;
            ctx.a.drawImage(canvas.b, 0, 0);

            canvas.b.width = width;
            canvas.b.height = height;
            ctx.b.drawImage(canvas.a, 0, 0);

            center[0] = 0.5 * width;
            center[1] = 0.5 * height;
        }

        function renderGlow() {
            ctx.b.save();
            ctx.b.filter = 'blur(8px) brightness(200%)';
            ctx.b.globalCompositeOperation = 'lighter';
            ctx.b.drawImage(canvas.a, 0, 0);
            ctx.b.restore();

            ctx.b.save();
            ctx.b.filter = 'blur(4px) brightness(200%)';
            ctx.b.globalCompositeOperation = 'lighter';
            ctx.b.drawImage(canvas.a, 0, 0);
            ctx.b.restore();
        }

        function renderToScreen() {
            ctx.b.save();
            ctx.b.globalCompositeOperation = 'lighter';
            ctx.b.drawImage(canvas.a, 0, 0);
            ctx.b.restore();
        }

        function draw() {
            tick++;
            ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
            ctx.b.clearRect(0, 0, canvas.b.width, canvas.b.height);

            drawParticles();
            renderGlow();
            renderToScreen();

            window.requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize);
        setup();
    };

    initHeroBackground();
});
