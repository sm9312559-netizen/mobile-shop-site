document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    }

    mobileMenuBtn.addEventListener('click', toggleMenu);
    closeMenuBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu();
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all others
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // Active Link Highlight
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href*=${sectionId}]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    });

    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');

    function reveal() {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', reveal);
    
    // Trigger once on load
    reveal();

    // ==========================================
    // FREELANCING REQUIREMENT JAVASCRIPT LOGIC
    // ==========================================

    // 1. Dynamic Product Array
    const products = [
        { id: 1, name: "iPhone 15 Pro", category: "Smartphones", price: 134900, icon: "fa-mobile", image: "assets/hero_mobile_1777187933907.png" },
        { id: 2, name: "Samsung Galaxy S24", category: "Smartphones", price: 79999, icon: "fa-mobile-screen-button", image: "assets/hero_mobile_1777187933907.png" },
        { id: 3, name: "20W Fast Charger", category: "Chargers", price: 1900, icon: "fa-plug", image: "assets/hero_mobile_1777187933907.png" },
        { id: 4, name: "AirPods Pro 2", category: "Earphones", price: 24900, icon: "fa-headphones", image: "assets/hero_mobile_1777187933907.png" },
        { id: 5, name: "Silicon Cover", category: "Covers", price: 499, icon: "fa-mobile-retro", image: "assets/hero_mobile_1777187933907.png" },
        { id: 6, name: "Apple Watch S9", category: "Smart Watches", price: 39900, icon: "fa-clock", image: "assets/hero_mobile_1777187933907.png" },
        { id: 7, name: "JBL Flip 6", category: "Bluetooth Speakers", price: 8999, icon: "fa-speaker-deck", image: "assets/hero_mobile_1777187933907.png" },
        { id: 8, name: "Premium Headphones", category: "Earphones", price: 15000, icon: "fa-headphones", image: "assets/hero_mobile_1777187933907.png" },
        { id: 9, name: "Cables & Adapters", category: "Chargers", price: 899, icon: "fa-plug", image: "assets/hero_mobile_1777187933907.png" }
    ];

    let cart = []; // Store cart items

    // 2. Render Products Dynamically
    const productGrid = document.getElementById('product-grid');
    const searchInput = document.getElementById('searchInput');

    function renderProducts(items) {
        productGrid.innerHTML = ''; // Clear grid first
        if (items.length === 0) {
            productGrid.innerHTML = '<p style="color:white; text-align:center; width:100%; grid-column: 1 / -1;">No products found.</p>';
            return;
        }

        items.forEach((item, index) => {
            // Create a div with the existing CSS class to keep design consistent
            const card = document.createElement('div');
            card.className = `category-card reveal active`;
            // Set inner HTML matching the existing HTML structure
            card.innerHTML = `
                <div class="category-icon"><i class="fa-solid ${item.icon}"></i></div>
                <h3>${item.name}</h3>
                <p>₹${item.price.toLocaleString('en-IN')}</p>
                <button class="add-btn btn btn-primary" onclick="addToCart(${item.id})" style="margin-top: 15px; width: 100%; border-radius: 20px;">Add to Cart</button>
            `;
            productGrid.appendChild(card);
        });
    }

    // Initial Render
    renderProducts(products);

    // 3. Live Search Filter
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Filter the array based on name or category
        const filtered = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.category.toLowerCase().includes(searchTerm)
        );
        renderProducts(filtered); // Re-render the filtered items
    });

    // 4. Functional Shopping Cart
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const cartCountBadge = document.getElementById('cartCountBadge');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Make addToCart accessible globally since it's called from inline HTML (onclick)
    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        updateCartUI();
        alert(`${product.name} added to cart!`);
    };

    function updateCartUI() {
        // Update Badge Count
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCountBadge.textContent = totalItems;

        // Update Modal Items
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price * item.qty;
            const div = document.createElement('div');
            div.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;";
            div.innerHTML = `
                <div>
                    <h4 style="margin:0; font-size:16px;">${item.name}</h4>
                    <small class="text-muted">₹${item.price.toLocaleString('en-IN')} x ${item.qty}</small>
                </div>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            `;
            cartItemsContainer.appendChild(div);
        });

        // Update Total Price
        cartTotalPrice.textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    // Modal Event Listeners
    cartBtn.addEventListener('click', () => { cartModal.style.display = 'flex'; });
    closeCartBtn.addEventListener('click', () => { cartModal.style.display = 'none'; });
    
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return alert("Cart is empty!");
        alert("Payment Successful! Thank you for your order.");
        cart = [];
        updateCartUI();
        cartModal.style.display = 'none';
    });

    // 5. Booking Form Logic
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingBtn = document.getElementById('closeBookingBtn');
    const bookingForm = document.getElementById('bookingForm');
    const bookingSuccessMsg = document.getElementById('bookingSuccessMsg');

    // Make all 'Repair' links open the modal
    document.querySelectorAll('a[href="#repair"]').forEach(link => {
        link.addEventListener('click', (e) => {
            // Only trigger modal for links that look like action buttons (not navbar links)
            if(link.classList.contains('mobile-link') || link.closest('.nav-links')) return;
            e.preventDefault();
            bookingModal.style.display = 'flex';
        });
    });

    closeBookingBtn.addEventListener('click', () => { 
        bookingModal.style.display = 'none'; 
        bookingSuccessMsg.style.display = 'none';
        bookingForm.reset();
    });

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        
        // Simple Validation
        const phone = document.getElementById('bPhone').value;
        if (phone.length < 10) {
            alert("Please enter a valid phone number.");
            return;
        }

        // Show Success Message
        bookingSuccessMsg.style.display = 'block';
        
        // Hide modal after 2 seconds
        setTimeout(() => {
            bookingModal.style.display = 'none';
            bookingSuccessMsg.style.display = 'none';
            bookingForm.reset();
        }, 2000);
    });

});
