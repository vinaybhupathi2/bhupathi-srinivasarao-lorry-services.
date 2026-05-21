/* ==========================================================================
   SRINIVASARAO LORRY SERVICES - INTERACTIVITY ENGINE (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. STICKY HEADER & MOBILE NAVIGATION DRAWER
    // ==========================================================================
    const header = document.querySelector('.main-header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Scroll Action
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        highlightNavLink();
    });

    // Mobile Hamburger Toggle
    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        drawerOverlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'initial';
    };

    hamburger.addEventListener('click', toggleMenu);
    drawerOverlay.addEventListener('click', toggleMenu);

    // Close Menu on Link Click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Scroll-Spy: Active Nav Link Highlight
    function highlightNavLink() {
        const scrollPosition = window.scrollY + 120;
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ==========================================================================
    // 2. INTERACTIVE PRICING ESTIMATOR ENGINE
    // ==========================================================================
    const calcLeaseType = document.getElementById('calcLeaseType');
    const calcLorryType = document.getElementById('calcLorryType');
    const calcQuantity = document.getElementById('calcQuantity');
    const calcHuskWeight = document.getElementById('calcHuskWeight');
    const calcTarpaulin = document.getElementById('calcTarpaulin');
    const calcToll = document.getElementById('calcToll');
    const calcForm = document.getElementById('calcForm');

    // DOM Elements for Invoice Output
    const unitLabel = document.getElementById('unitLabel');
    const invoiceBaseText = document.getElementById('invoiceBaseText');
    const invoiceBaseValue = document.getElementById('invoiceBaseValue');
    const invoiceLorryText = document.getElementById('invoiceLorryText');
    const invoiceLorryValue = document.getElementById('invoiceLorryValue');
    const invoiceTollRow = document.getElementById('invoiceTollRow');
    const invoiceTollValue = document.getElementById('invoiceTollValue');
    const invoiceTotalValue = document.getElementById('invoiceTotalValue');
    const btnShareCalc = document.getElementById('btnShareCalc');

    // Pricing Config Matrix
    const RATES = {
        // Base Lease Rates (in INR)
        lease: {
            hourly: { rate: 2200, unit: 'Hours', min: 3, label: 'Hourly Lease' },
            daily: { rate: 11500, unit: 'Days', min: 1, label: 'Daily Contract' },
            trip: { rate: 42, unit: 'Kilometers', min: 10, label: 'Trip Route' }
        },
        // Lorry Capacity Factors
        lorry: {
            '10w': { multiplier: 1.0, name: '10-Wheeler Open-Body (16 Tons)' },
            '12w': { multiplier: 1.3, name: '12-Wheeler Tipper/Dumper (25 Tons)' },
            '6w': { multiplier: 0.8, name: '6-Wheeler Container (9 Tons)' }
        },
        tollEstimate: 1500
    };

    // Calculate & Refresh Invoice Results
    function updateCalculator() {
        const leaseType = calcLeaseType.value;
        const lorryType = calcLorryType.value;
        let quantity = parseInt(calcQuantity.value) || 1;
        const weight = parseInt(calcHuskWeight.value) || 15;
        const hasToll = calcToll.checked;

        const leaseConfig = RATES.lease[leaseType];
        const lorryConfig = RATES.lorry[lorryType];

        // Enforce Minimum quantity limits
        if (quantity < leaseConfig.min) {
            quantity = leaseConfig.min;
            calcQuantity.value = quantity;
        }

        // Update Label dynamically based on unit
        unitLabel.textContent = `Quantity (${leaseConfig.unit})`;

        // Calculate Cost Elements
        const baseCost = leaseConfig.rate * quantity;
        const subtotalCost = baseCost * lorryConfig.multiplier;
        const tollCost = hasToll ? RATES.tollEstimate : 0;
        const grandTotal = Math.round(subtotalCost + tollCost);

        // Update DOM
        invoiceBaseText.textContent = `${leaseConfig.label} Base (${quantity} ${leaseConfig.unit})`;
        invoiceBaseValue.textContent = `₹${baseCost.toLocaleString('en-IN')}`;
        
        invoiceLorryText.textContent = `Lorry Factor (${lorryConfig.name.split(' ')[0]})`;
        invoiceLorryValue.textContent = `${lorryConfig.multiplier}x`;

        if (hasToll) {
            invoiceTollRow.style.display = 'flex';
            invoiceTollValue.textContent = `₹${tollCost.toLocaleString('en-IN')}`;
        } else {
            invoiceTollRow.style.display = 'none';
        }

        invoiceTotalValue.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    }

    // Bind Event Listeners for Calculator inputs
    if (calcForm) {
        calcLeaseType.addEventListener('change', () => {
            // Update quantity default based on selection for better UX
            if (calcLeaseType.value === 'hourly') {
                calcQuantity.value = 8;
            } else if (calcLeaseType.value === 'daily') {
                calcQuantity.value = 2;
            } else if (calcLeaseType.value === 'trip') {
                calcQuantity.value = 180;
            }
            updateCalculator();
        });
        
        calcLorryType.addEventListener('change', updateCalculator);
        calcQuantity.addEventListener('input', updateCalculator);
        calcHuskWeight.addEventListener('input', updateCalculator);
        calcTarpaulin.addEventListener('change', updateCalculator);
        calcToll.addEventListener('change', updateCalculator);

        // Run on load
        updateCalculator();
    }

    // Share Estimate to WhatsApp
    if (btnShareCalc) {
        btnShareCalc.addEventListener('click', () => {
            const leaseLabel = RATES.lease[calcLeaseType.value].label;
            const unit = RATES.lease[calcLeaseType.value].unit;
            const qty = calcQuantity.value;
            const lorryName = RATES.lorry[calcLorryType.value].name;
            const weight = calcHuskWeight.value;
            const total = invoiceTotalValue.textContent;

            const text = `*Bhupathi Bhupathi Srinivasarao Lorry Services - Pricing Estimate*%0A%0A` +
                         `*Lease Model:* ${leaseLabel}%0A` +
                         `*Duration/Distance:* ${qty} ${unit}%0A` +
                         `*Vehicle Type:* ${lorryName}%0A` +
                         `*Cargo Load:* ${weight} Tons%0A` +
                         `*Estimated Price:* ${total}%0A%0A` +
                         `Please contact me to finalize this quote and schedule the lorry.`;

            window.open(`https://wa.me/918978367991?text=${text}`, '_blank');
        });
    }

    // ==========================================================================
    // 3. BOOKING PORTAL & LEAD GENERATION
    // ==========================================================================
    const lorryBookingForm = document.getElementById('lorryBookingForm');
    const customQuoteForm = document.getElementById('customQuoteForm');
    const receiptModal = document.getElementById('receiptModal');

    // Form Submission Actions
    if (lorryBookingForm) {
        lorryBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Capture Fields
            const name = document.getElementById('bookName').value;
            const phone = document.getElementById('bookPhone').value;
            const lorryVal = document.getElementById('bookLorryType').value;
            const lorryText = document.getElementById('bookLorryType').options[document.getElementById('bookLorryType').selectedIndex].text;
            const date = document.getElementById('bookDate').value;
            const pickup = document.getElementById('bookPickup').value;
            const dropoff = document.getElementById('bookDropoff').value;
            const cargo = document.getElementById('bookCargo').value;
            const tariff = document.getElementById('bookTariff').options[document.getElementById('bookTariff').selectedIndex].text;

            // Generate Mock Transaction ID
            const txId = 'SRL-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100);
            
            // Format loading date nicely
            const formattedDate = new Date(date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            // Log booking to local storage database mock
            const bookingRecord = {
                txId, name, phone, lorryVal, lorryText, date, formattedDate, pickup, dropoff, cargo, tariff, timestamp: new Date().toISOString()
            };
            
            let database = JSON.parse(localStorage.getItem('lorry_bookings')) || [];
            database.push(bookingRecord);
            localStorage.setItem('lorry_bookings', JSON.stringify(database));

            // Populate Modal Receipt Card
            document.getElementById('receiptId').textContent = txId;
            document.getElementById('receiptTimestamp').textContent = new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            document.getElementById('recName').textContent = name;
            document.getElementById('recPhone').textContent = phone;
            document.getElementById('recLorry').textContent = lorryText;
            document.getElementById('recDate').textContent = formattedDate;
            document.getElementById('recRoute').textContent = `${pickup} to ${dropoff}`;
            document.getElementById('recTariff').textContent = tariff;

            // Show Confirmation Receipt Modal
            receiptModal.classList.add('active');
            
            // Set WhatsApp action specific to this reservation
            const btnReceiptWhatsapp = document.getElementById('btnReceiptWhatsapp');
            btnReceiptWhatsapp.onclick = () => {
                const message = `*SRINIVASARAO LORRY SERVICES - BOOKING RESERVATION*%0A%0A` +
                                `*Booking ID:* ${txId}%0A` +
                                `*Customer Name:* ${name}%0A` +
                                `*Contact Phone:* ${phone}%0A` +
                                `*Vehicle Allocated:* ${lorryText}%0A` +
                                `*Loading Date:* ${formattedDate}%0A` +
                                `*Shipping Route:* ${pickup} ➔ ${dropoff}%0A` +
                                `*Tariff Rate:* ${tariff}%0A` +
                                `*Cargo Material:* ${cargo}%0A%0A` +
                                `Please confirm the driver dispatch details for my request.`;

                window.open(`https://wa.me/918978367991?text=${message}`, '_blank');
            };

            // Reset Form
            lorryBookingForm.reset();
        });
    }

    // Custom Quote Form Submit
    if (customQuoteForm) {
        customQuoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('quoteName').value;
            const phone = document.getElementById('quotePhone').value;
            const origin = document.getElementById('quoteOrigin').value;
            const dest = document.getElementById('quoteDest').value;
            const weight = document.getElementById('quoteWeight').value;
            const freq = document.getElementById('quoteFrequency').options[document.getElementById('quoteFrequency').selectedIndex].text;

            const text = `*Bhupathi Bhupathi Srinivasarao Lorry Services - Custom Freight Quote Inquiry*%0A%0A` +
                         `*Name:* ${name}%0A` +
                         `*Phone:* ${phone}%0A` +
                         `*Origin:* ${origin}%0A` +
                         `*Destination:* ${dest}%0A` +
                         `*Cargo Tonnage:* ${weight} Tons%0A` +
                         `*Shipping Frequency:* ${freq}%0A%0A` +
                         `Please calculate and send the customized freight rates.`;

            window.open(`https://wa.me/918978367991?text=${text}`, '_blank');
            customQuoteForm.reset();
        });
    }

    // Corporate Inquiry Form Submit
    const corporateInquiryForm = document.getElementById('corporateInquiryForm');
    if (corporateInquiryForm) {
        corporateInquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const corpName = document.getElementById('corpName').value;
            const corpPhone = document.getElementById('corpPhone').value;
            const corpCompany = document.getElementById('corpCompany').value;
            const corpReq = document.getElementById('corpRequirement').options[document.getElementById('corpRequirement').selectedIndex].text;
            const corpMsg = document.getElementById('corpMessage').value;

            alert(`Thank you, ${corpName}! Your corporate inquiry for ${corpCompany} has been received. Our freight logistics manager will contact you on +91 ${corpPhone} within 15 minutes to propose our bulk commercial tariff plans.`);

            const text = `*Bhupathi Bhupathi Srinivasarao Lorry Services - Bulk Factory Corporate Inquiry*%0A%0A` +
                         `*Contact Name:* ${corpName}%0A` +
                         `*Phone:* ${corpPhone}%0A` +
                         `*Company/Factory:* ${corpCompany}%0A` +
                         `*Volume Requirement:* ${corpReq}%0A` +
                         `*Details:* ${corpMsg}%0A%0A` +
                         `Please reach out to us with contract pricing details.`;

            window.open(`https://wa.me/918978367991?text=${text}`, '_blank');
            corporateInquiryForm.reset();
        });
    }

    // ==========================================================================
    // 4. MOCK DATA BINDERS & TAB SWITCHERS
    // ==========================================================================
    window.prefillBooking = (tariffType) => {
        const bookTariffSelect = document.getElementById('bookTariff');
        if (bookTariffSelect) {
            bookTariffSelect.value = tariffType;
        }
        
        // Sync custom quote frequency matching
        const quoteFreqSelect = document.getElementById('quoteFrequency');
        if (quoteFreqSelect) {
            if (tariffType === 'hourly') quoteFreqSelect.value = 'one-time';
            else if (tariffType === 'daily') quoteFreqSelect.value = 'weekly';
            else quoteFreqSelect.value = 'monthly';
        }
        
        scrollToSection('booking');
    };

    window.preselectLorry = (lorryType) => {
        const bookLorrySelect = document.getElementById('bookLorryType');
        if (bookLorrySelect) {
            bookLorrySelect.value = lorryType;
        }
        scrollToSection('booking');
    };

    // Modal Helper Closures
    window.closeReceiptModal = () => {
        receiptModal.classList.remove('active');
    };

    // Smooth Scroll Helper
    function scrollToSection(id) {
        const section = document.getElementById(id);
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    }

    // Toggle Booking Portal tab selections
    window.switchBookingTab = (tabName) => {
        const tabBooking = document.getElementById('tabBooking');
        const tabQuote = document.getElementById('tabQuote');

        if (tabName === 'booking') {
            tabBooking.classList.add('active');
            tabQuote.classList.remove('active');
            lorryBookingForm.classList.add('active');
            customQuoteForm.classList.remove('active');
        } else {
            tabBooking.classList.remove('active');
            tabQuote.classList.add('active');
            lorryBookingForm.classList.remove('active');
            customQuoteForm.classList.add('active');
        }
    };
});

// ==========================================================================
// 5. LIGHTBOX COMPONENT FOR GALLERY WORK
// ==========================================================================
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

window.openLightbox = (src, caption) => {
    if (lightboxModal && lightboxImg && lightboxCaption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption;
        lightboxModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
};

window.closeLightbox = () => {
    if (lightboxModal) {
        lightboxModal.style.display = 'none';
        document.body.style.overflow = 'initial';
    }
};

// Close lightbox on pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
        closeReceiptModal();
    }
});
