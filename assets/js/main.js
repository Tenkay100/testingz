/**
 * 305CARGO - Main JavaScript
 * Handles navigation, mobile menu, loader, and global interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Page Loader ---
  const loader = document.querySelector('.loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 500); // Simulate minimal load time for smoothness
  }

  // --- 2. Sticky Header ---
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- 3. Mobile Navigation Drawer ---
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav-overlay');
  
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
      // Change hamburger icon to close
      if (mobileNav.classList.contains('active')) {
        hamburger.innerHTML = '&#10005;'; // X symbol
        document.body.style.overflow = 'hidden'; // Prevent scrolling
      } else {
        hamburger.innerHTML = '&#9776;'; // Hamburger symbol
        document.body.style.overflow = '';
      }
    });

    // Close on link click
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        hamburger.innerHTML = '&#9776;';
        document.body.style.overflow = '';
      });
    });
  }

  // --- 4. Counter Animation (Statistics) ---
  const counters = document.querySelectorAll('.counter-value');
  const speed = 200; // The lower the slower

  const animateCounters = () => {
    counters.forEach(counter => {
      const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const inc = target / speed;

        if (count < target) {
          counter.innerText = Math.ceil(count + inc);
          setTimeout(updateCount, 1);
        } else {
          counter.innerText = target;
        }
      };
      
      // Only start if element is in view (handled by IntersectionObserver in animations.js)
      if (counter.classList.contains('is-revealed')) {
         updateCount();
      }
    });
  };

  // We can hook this into the reveal observer, or create a specific observer for counters
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');
        const count = 0;
        counter.innerText = count;
        
        const updateCount = () => {
          const currentCount = +counter.innerText;
          const inc = target / speed;
          if (currentCount < target) {
            counter.innerText = Math.ceil(currentCount + inc);
            setTimeout(updateCount, 15); // Adjust for smoothness
          } else {
            counter.innerText = target.toLocaleString(); // Add commas
          }
        };
        updateCount();
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    counterObserver.observe(counter);
  });

  // --- 5. Live Support Chat Widget ---
  const chatWidget = document.createElement('div');
  chatWidget.innerHTML = `
    <div id="live-chat-toggle" style="position:fixed; bottom:30px; right:30px; width:60px; height:60px; background-color:var(--primary-color); color:white; border-radius:50%; display:flex; justify-content:center; align-items:center; cursor:pointer; box-shadow:var(--shadow-lg); z-index:9999; transition:all 0.3s;">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
    </div>
    <div id="live-chat-window" style="position:fixed; bottom:100px; right:30px; width:350px; height:450px; background:white; border-radius:var(--radius-md); box-shadow:var(--shadow-xl); z-index:9999; display:none; flex-direction:column; overflow:hidden; border:1px solid var(--border-color);">
      <div style="background:var(--secondary-color); color:white; padding:15px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:10px; height:10px; background:var(--success-color); border-radius:50%;"></div>
          <strong>Live Support</strong>
        </div>
        <button id="close-chat" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
      </div>
      <div style="flex:1; padding:15px; background:var(--light-gray); overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
        <div style="background:white; padding:10px; border-radius:8px; max-width:80%; font-size:0.9rem; border:1px solid var(--border-color);">
          Hello! How can we assist you with your logistics needs today?
        </div>
      </div>
      <div style="padding:15px; border-top:1px solid var(--border-color); background:white; display:flex; gap:10px;">
        <input type="text" placeholder="Type a message..." style="flex:1; padding:10px; border:1px solid var(--border-color); border-radius:4px; outline:none;">
        <button style="background:var(--primary-color); color:white; border:none; padding:10px 15px; border-radius:4px; cursor:pointer;">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(chatWidget);

  const chatToggle = document.getElementById('live-chat-toggle');
  const chatWindow = document.getElementById('live-chat-window');
  const closeChat = document.getElementById('close-chat');

  chatToggle.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'none' || chatWindow.style.display === '' ? 'flex' : 'none';
  });

  closeChat.addEventListener('click', () => {
    chatWindow.style.display = 'none';
  });

  // --- 6. Floating Customer Reviews (Randomized) ---
  const reviewNames = ["John", "Sarah", "Michael", "Emma", "David", "Sophia", "James", "Olivia", "Daniel", "Mia"];
  const reviewCountries = ["Canada", "Germany", "Australia", "United Kingdom", "France", "Japan", "Brazil", "Spain", "Italy", "Mexico"];
  const reviewActions = [
    "recently received a shipment successfully.",
    "rated our service 5 stars.",
    "successfully tracked a package.",
    "just booked a premium freight service.",
    "cleared customs quickly with our help.",
    "experienced fast delivery times today."
  ];

  const reviewWidget = document.createElement('div');
  reviewWidget.style.cssText = `
    position: fixed; bottom: 30px; left: 30px; background: white; border-radius: 8px; 
    box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding: 15px; border-left: 4px solid var(--success-color);
    z-index: 9998; max-width: 300px; display: flex; align-items: center; gap: 10px;
    transform: translateY(150%); opacity: 0; transition: all 0.5s ease-in-out;
  `;
  reviewWidget.innerHTML = `
    <div style="font-size:1.5rem;">⭐</div>
    <div style="font-size:0.875rem; color:var(--text-color);" id="review-text"></div>
  `;
  document.body.appendChild(reviewWidget);

  setInterval(() => {
    // Check if chat is open, maybe don't show review if chat is overlapping, but it's on left side, so it's fine
    const n = reviewNames[Math.floor(Math.random() * reviewNames.length)];
    const c = reviewCountries[Math.floor(Math.random() * reviewCountries.length)];
    const a = reviewActions[Math.floor(Math.random() * reviewActions.length)];
    
    document.getElementById('review-text').innerHTML = `<strong>${n}</strong> from <strong>${c}</strong> ${a}`;
    
    // Show
    reviewWidget.style.transform = 'translateY(0)';
    reviewWidget.style.opacity = '1';
    
    // Hide after 4 seconds
    setTimeout(() => {
      reviewWidget.style.transform = 'translateY(150%)';
      reviewWidget.style.opacity = '0';
    }, 4000);
    
  }, 7000); // Trigger every 7s (4s show + 3s hidden gap)

  // --- 7. Visitor Country Detection Popup (Homepage Only) ---
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    if (!document.cookie.includes('305cargo_visitor_country=')) {
      const modalOverlay = document.createElement('div');
      modalOverlay.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8);
        z-index: 10000; display:flex; justify-content:center; align-items:center;
      `;
      modalOverlay.innerHTML = `
        <div style="background:white; padding:2rem; border-radius:8px; max-width:400px; width:90%; text-align:center; box-sizing:border-box;">
          <h3 style="margin-top:0;">Welcome to 305CARGO</h3>
          <p style="font-size:0.875rem; color:#4A5568; margin-bottom:1.5rem;">Please select your country to continue.</p>
          <input type="text" id="visitor-country-input" list="visitorCountryList" placeholder="Search Country..." style="width:100%; padding:0.75rem; border:1px solid #E2E8F0; border-radius:4px; margin-bottom:1rem; box-sizing:border-box;">
          <datalist id="visitorCountryList">
            <option value="Afghanistan"><option value="Albania"><option value="Algeria"><option value="Andorra"><option value="Angola"><option value="Antigua and Barbuda"><option value="Argentina"><option value="Armenia"><option value="Australia"><option value="Austria"><option value="Azerbaijan"><option value="Bahamas"><option value="Bahrain"><option value="Bangladesh"><option value="Barbados"><option value="Belarus"><option value="Belgium"><option value="Belize"><option value="Benin"><option value="Bhutan"><option value="Bolivia"><option value="Bosnia and Herzegovina"><option value="Botswana"><option value="Brazil"><option value="Brunei"><option value="Bulgaria"><option value="Burkina Faso"><option value="Burundi"><option value="Cabo Verde"><option value="Cambodia"><option value="Cameroon"><option value="Canada"><option value="Central African Republic"><option value="Chad"><option value="Chile"><option value="China"><option value="Colombia"><option value="Comoros"><option value="Congo"><option value="Costa Rica"><option value="Croatia"><option value="Cuba"><option value="Cyprus"><option value="Czech Republic"><option value="Denmark"><option value="Djibouti"><option value="Dominica"><option value="Dominican Republic"><option value="Ecuador"><option value="Egypt"><option value="El Salvador"><option value="Equatorial Guinea"><option value="Eritrea"><option value="Estonia"><option value="Eswatini"><option value="Ethiopia"><option value="Fiji"><option value="Finland"><option value="France"><option value="Gabon"><option value="Gambia"><option value="Georgia"><option value="Germany"><option value="Ghana"><option value="Greece"><option value="Grenada"><option value="Guatemala"><option value="Guinea"><option value="Guyana"><option value="Haiti"><option value="Honduras"><option value="Hungary"><option value="Iceland"><option value="India"><option value="Indonesia"><option value="Iran"><option value="Iraq"><option value="Ireland"><option value="Israel"><option value="Italy"><option value="Jamaica"><option value="Japan"><option value="Jordan"><option value="Kazakhstan"><option value="Kenya"><option value="Kiribati"><option value="Kuwait"><option value="Kyrgyzstan"><option value="Laos"><option value="Latvia"><option value="Lebanon"><option value="Lesotho"><option value="Liberia"><option value="Libya"><option value="Liechtenstein"><option value="Lithuania"><option value="Luxembourg"><option value="Madagascar"><option value="Malawi"><option value="Malaysia"><option value="Maldives"><option value="Mali"><option value="Malta"><option value="Marshall Islands"><option value="Mauritania"><option value="Mauritius"><option value="Mexico"><option value="Micronesia"><option value="Moldova"><option value="Monaco"><option value="Mongolia"><option value="Montenegro"><option value="Morocco"><option value="Mozambique"><option value="Myanmar"><option value="Namibia"><option value="Nauru"><option value="Nepal"><option value="Netherlands"><option value="New Zealand"><option value="Nicaragua"><option value="Niger"><option value="Nigeria"><option value="North Korea"><option value="North Macedonia"><option value="Norway"><option value="Oman"><option value="Pakistan"><option value="Palau"><option value="Panama"><option value="Papua New Guinea"><option value="Paraguay"><option value="Peru"><option value="Philippines"><option value="Poland"><option value="Portugal"><option value="Qatar"><option value="Romania"><option value="Russia"><option value="Rwanda"><option value="Samoa"><option value="San Marino"><option value="Saudi Arabia"><option value="Senegal"><option value="Serbia"><option value="Seychelles"><option value="Sierra Leone"><option value="Singapore"><option value="Slovakia"><option value="Slovenia"><option value="Solomon Islands"><option value="Somalia"><option value="South Africa"><option value="South Korea"><option value="South Sudan"><option value="Spain"><option value="Sri Lanka"><option value="Sudan"><option value="Suriname"><option value="Sweden"><option value="Switzerland"><option value="Syria"><option value="Tajikistan"><option value="Tanzania"><option value="Thailand"><option value="Timor-Leste"><option value="Togo"><option value="Tonga"><option value="Trinidad and Tobago"><option value="Tunisia"><option value="Turkey"><option value="Turkmenistan"><option value="Tuvalu"><option value="Uganda"><option value="Ukraine"><option value="United Arab Emirates"><option value="United Kingdom"><option value="United States"><option value="Uruguay"><option value="Uzbekistan"><option value="Vanuatu"><option value="Vatican City"><option value="Venezuela"><option value="Vietnam"><option value="Yemen"><option value="Zambia"><option value="Zimbabwe">
          </datalist>
          <button id="btn-save-country" class="btn btn-primary" style="width:100%; box-sizing:border-box;">Continue</button>
        </div>
      `;
      document.body.appendChild(modalOverlay);

      document.getElementById('btn-save-country').addEventListener('click', () => {
        const c = document.getElementById('visitor-country-input').value.trim() || 'Unknown';
        document.cookie = "305cargo_visitor_country=" + encodeURIComponent(c) + "; max-age=31536000; path=/";
        modalOverlay.style.display = 'none';
      });
    }
  }

});
