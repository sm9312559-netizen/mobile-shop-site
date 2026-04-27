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
                    <img src="${product.image}" alt="${product.name}" class="product-img lazy" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category} | ${product.brand}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="price-current">₹${product.price}</span>
                        ${product.oldPrice ? `<span class="price-old">₹${product.oldPrice}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button type="button" class="btn btn-primary btn-add-cart" onclick="addToCart(event, ${product.id})">Add to Cart</button>
                        <button type="button" class="btn-wa-enquire" onclick="enquireWhatsApp('${product.name}', '${product.price}')" title="Enquire on WhatsApp">
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

    // 7. Cart System (Advanced Sidebar)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartIconBtn = document.getElementById('cartIconBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const toast = document.getElementById('toast');

    // UI Logic
    function openCart() {
        cartOverlay.classList.add('active');
        cartSidebar.classList.add('active');
        renderCartItems();
    }

    function closeCart() {
        cartOverlay.classList.remove('active');
        cartSidebar.classList.remove('active');
    }

    cartIconBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Cart Logic
    window.addToCart = function(event, productId) {
        event.preventDefault(); // Prevent any redirect/reload

        const product = allProducts.find(p => p.id === productId);
        if (product) {
            // Check if product already exists
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            
            saveCart();
            updateCartCount();
            
            // Visual feedback
            showToast();
            openCart();
        }
    };

    window.updateQuantity = function(productId, change) {
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== productId);
            }
            saveCart();
            renderCartItems();
            updateCartCount();
        }
    };

    window.removeCartItem = function(productId) {
        cart = cart.filter(i => i.id !== productId);
        saveCart();
        renderCartItems();
        updateCartCount();
    };

    clearCartBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to empty the cart?')) {
            cart = [];
            saveCart();
            renderCartItems();
            updateCartCount();
            closeCart();
        }
    });

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = totalItems;
    }

    function parsePrice(priceStr) {
        return parseInt(priceStr.replace(/,/g, '')) || 0;
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-muted" style="text-align: center; margin-top: 50px;">Your cart is empty.</p>';
            cartTotalPrice.textContent = '₹0';
            return;
        }

        cart.forEach(item => {
            const itemPrice = parsePrice(item.price);
            total += itemPrice * item.quantity;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="cart-quantity">
                        <button type="button" class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="qty-count">${item.quantity}</span>
                        <button type="button" class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button type="button" class="icon-btn remove-item" onclick="removeCartItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(div);
        });

        // Format total price
        cartTotalPrice.textContent = '₹' + total.toLocaleString('en-IN');
    }

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        let orderDetails = 'Hi Samim Mobile Shop, I want to order the following items:%0A%0A';
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemPrice = parsePrice(item.price);
            total += itemPrice * item.quantity;
            orderDetails += `${index + 1}. ${item.name} (x${item.quantity}) - ₹${(itemPrice * item.quantity).toLocaleString('en-IN')}%0A`;
        });
        
        orderDetails += `%0A*Total: ₹${total.toLocaleString('en-IN')}*%0A%0APlease let me know how to proceed.`;
        
        const url = `https://wa.me/919876543210?text=${orderDetails}`;
        window.open(url, '_blank');
        
        cart = [];
        saveCart();
        updateCartCount();
        closeCart();
    });

    // Initialize counts on load
    updateCartCount();

    // 8. WhatsApp Enquiry & Repair Booking
    const shopPhone = '919876543210'; // Replace with actual shop number

    window.enquireWhatsApp = function(productName, price) {
        const message = `Hi Samim, I am interested in ${productName} priced at ₹${price}. Is it available?`;
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

            // Send form using EmailJS
            // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual IDs from EmailJS
            emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
                .then(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    formStatus.innerHTML = '<span style="color: var(--success);"><i class="fas fa-check-circle"></i> Message sent successfully! We will contact you soon.</span>';
                    contactForm.reset();
                    
                    setTimeout(() => { formStatus.innerHTML = ''; }, 5000);
                }, (error) => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    formStatus.innerHTML = '<span style="color: var(--danger);"><i class="fas fa-exclamation-circle"></i> Failed to send. Please try again.</span>';
                    console.error('EmailJS Error:', error);
                });
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
