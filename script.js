/* 
 * Samim Mobile Shop - Main Script
 * -------------------------------
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 50
    });

    // 2. Loader & Offer Popup
    const loader = document.getElementById('loader');
    const offerPopup = document.getElementById('offerPopup');
    const closePopupBtn = document.getElementById('closePopup');

    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            
            // Show popup after 3 seconds of load
            setTimeout(() => {
                if (!localStorage.getItem('popupShown')) {
                    offerPopup.classList.remove('hidden');
                }
            }, 3000);
        }, 800); // Minimum loader display time
    });

    closePopupBtn.addEventListener('click', () => {
        offerPopup.classList.add('hidden');
        localStorage.setItem('popupShown', 'true');
    });

    // 3. Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggle.querySelector('i');

    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    // 4. Sticky Header
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 5. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileBtn.querySelector('i').className = 'fas fa-bars';
        });
    });

    // 6. Products Management
    const productGrid = document.getElementById('productGrid');
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    const categoryBtns = document.querySelectorAll('.filter-btn');
    
    let allProducts = [];

    // Fetch Products
    fetch('products.json')
        .then(res => res.json())
        .then(data => {
            allProducts = data;
            renderProducts(data);
        })
        .catch(err => console.error('Error loading products:', err));

    // Render Function
    function renderProducts(products) {
        productGrid.innerHTML = '';
        
        if (products.length === 0) {
            productGrid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No products found matching your criteria.</p>';
            return;
        }

        products.forEach((product, index) => {
            // Determine badge class
            let badgeClass = 'product-badge';
            if (product.discount) {
                badgeClass += ' discount';
            }

            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', (index % 4) * 100);
            
            const badgeHTML = product.discount 
                ? `<div class="${badgeClass}">${product.discount} OFF</div>`
                : (product.badge ? `<div class="${badgeClass}">${product.badge}</div>` : '');

            card.innerHTML = `
                ${badgeHTML}
                <div class="product-img-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="product-img lazy">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category} | ${product.brand}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="price-current">₹${product.price}</span>
                        ${product.oldPrice ? `<span class="price-old">₹${product.oldPrice}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-add-cart" onclick="addToCart(${product.id})">Add to Cart</button>
                        <button class="btn-wa-enquire" onclick="enquireWhatsApp('${product.name}')" title="Enquire on WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    // Filter Logic
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedBrand = brandFilter.value;
        const activeCategoryBtn = document.querySelector('.filter-btn.active');
        const selectedCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-category') : 'all';

        const filtered = allProducts.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(searchTerm);
            const matchBrand = selectedBrand === 'all' || p.brand === selectedBrand;
            const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
            
            return matchSearch && matchBrand && matchCategory;
        });

        renderProducts(filtered);
    }

    searchInput.addEventListener('input', filterProducts);
    brandFilter.addEventListener('change', filterProducts);

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts();
        });
    });

    // 7. Cart System
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();

    window.addToCart = function(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            cart.push(product);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            
            // Simple visual feedback
            const cartBtn = document.querySelector('.cart-btn');
            cartBtn.style.transform = 'scale(1.2)';
            setTimeout(() => { cartBtn.style.transform = 'scale(1)'; }, 200);
            
            alert(`${product.name} added to cart!`);
        }
    };

    function updateCartCount() {
        document.getElementById('cartCount').textContent = cart.length;
    }

    // 8. WhatsApp Enquiry & Repair Booking
    const shopPhone = '919876543210'; // Replace with actual shop number

    window.enquireWhatsApp = function(productName) {
        const message = `Hi Samim Mobile Shop, I want details about the *${productName}*. Is it available?`;
        const url = `https://wa.me/${shopPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    window.bookRepair = function(serviceName) {
        const message = `Hi Samim Mobile Shop, I need to book a repair service for: *${serviceName}*. Can you provide details and pricing?`;
        const url = `https://wa.me/${shopPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // 9. Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            // Simulate form submission
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                formStatus.innerHTML = '<span style="color: var(--success);"><i class="fas fa-check-circle"></i> Message sent successfully! We will contact you soon.</span>';
                contactForm.reset();
                
                setTimeout(() => { formStatus.innerHTML = ''; }, 5000);
            }, 1500);
        });
    }

    // 10. Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for subscribing to our newsletter!');
            newsletterForm.reset();
        });
    }
});
