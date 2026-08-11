/**
 * 305CARGO - Admin Portal Logic (Phase 9)
 * Features: Auto-Coordinates Map, Alphabetical Status Dropdown, 
 * Advanced Receiver/Sender Data, Shipping Charges, Test Shipments Generator.
 */

document.addEventListener('DOMContentLoaded', () => {
  const adminForm = document.getElementById('admin-form');
  const tableBody = document.getElementById('shipment-table-body');
  const automationList = document.getElementById('automation-list');
  const waypointsContainer = document.getElementById('waypoints-container');
  
  const isAutomatedCb = document.getElementById('isAutomated');
  const autoConfig = document.getElementById('automation-config');
  const staticConfig = document.getElementById('static-config');
  const controllerSelect = document.getElementById('controller-shipment-select');

  let selectedControllerId = "";

  let shipments = JSON.parse(localStorage.getItem('305cargo_shipments_v6')) || [];
  if (localStorage.getItem('305cargo_shipments_v5')) localStorage.removeItem('305cargo_shipments_v5'); // Migrate

  // Country Coordinates Map for Auto-fill
  const countryCoords = {
    "Afghanistan": [33.9391, 67.7100], "Albania": [41.1533, 20.1683], "Algeria": [28.0339, 1.6596], "Andorra": [42.5063, 1.5218],
    "Angola": [-11.2027, 17.8739], "Argentina": [-38.4161, -63.6167], "Australia": [-25.2744, 133.7751], "Austria": [47.5162, 14.5501],
    "Bahamas": [25.0343, -77.3963], "Bangladesh": [23.6850, 90.3563], "Belgium": [50.5039, 4.4699], "Brazil": [-14.2350, -51.9253],
    "Canada": [56.1304, -106.3468], "China": [35.8617, 104.1954], "Colombia": [4.5709, -74.2973], "Denmark": [56.2639, 9.5018],
    "Egypt": [26.8206, 30.8025], "Finland": [61.9241, 25.7482], "France": [46.2276, 2.2137], "Germany": [51.1657, 10.4515],
    "Greece": [39.0742, 21.8243], "India": [20.5937, 78.9629], "Indonesia": [-0.7893, 113.9213], "Ireland": [53.1424, -7.6921],
    "Israel": [31.0461, 34.8516], "Italy": [41.8719, 12.5674], "Japan": [36.2048, 138.2529], "Kenya": [-1.2863, 36.8172],
    "Malaysia": [4.2105, 101.9758], "Mexico": [23.6345, -102.5528], "Netherlands": [52.1326, 5.2913], "New Zealand": [-40.9006, 174.8860],
    "Nigeria": [9.0820, 8.6753], "Norway": [60.4720, 8.4689], "Pakistan": [30.3753, 69.3451], "Philippines": [12.8797, 121.7740],
    "Poland": [51.9194, 19.1451], "Portugal": [39.3999, -8.2245], "Russia": [61.5240, 105.3188], "Saudi Arabia": [23.8859, 45.0792],
    "Singapore": [1.3521, 103.8198], "South Africa": [-30.5595, 22.9375], "South Korea": [35.9078, 127.7669], "Spain": [40.4637, -3.7492],
    "Sweden": [60.1282, 18.6435], "Switzerland": [46.8182, 8.2275], "Thailand": [15.8700, 100.9925], "Turkey": [38.9637, 35.2433],
    "United Arab Emirates": [23.4241, 53.8478], "United Kingdom": [55.3781, -3.4360], "United States": [37.0902, -95.7129]
  };

  const alphabeticalStatuses = [
    "Arrived at Destination", "Cleared Customs", "Customs Inspection", "Delivered", "Delivery Attempted", 
    "Departed Facility", "Held at Customs", "In Transit", "Out for Delivery", "Package Received", 
    "Shipment Created", "Shipment Delayed", "Shipment Picked Up", "Warehouse Processing"
  ];

  // Populate Status Dropdowns
  const staticStatusDropdown = document.getElementById('staticStatus');
  if (staticStatusDropdown) {
    alphabeticalStatuses.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      staticStatusDropdown.appendChild(opt);
    });
  }

  // Generate 4 dynamic waypoint rows for Country/Lat/Lng
  for (let i = 0; i < 4; i++) {
    const row = document.createElement('div');
    row.className = 'wp-row';
    row.innerHTML = `
      <input type="text" id="wpName_${i}" list="countryList" class="form-input wpName" placeholder="Country ${i+1}">
      <input type="number" id="wpLat_${i}" step="any" class="form-input wpLat" placeholder="Lat">
      <input type="number" id="wpLng_${i}" step="any" class="form-input wpLng" placeholder="Lng">
    `;
    waypointsContainer.appendChild(row);
    
    // Auto-fill logic
    document.getElementById(`wpName_${i}`).addEventListener('input', (e) => {
      const country = e.target.value.trim();
      if (countryCoords[country]) {
        document.getElementById(`wpLat_${i}`).value = countryCoords[country][0];
        document.getElementById(`wpLng_${i}`).value = countryCoords[country][1];
      }
    });
  }

  const staticCurrLocInput = document.getElementById('staticCurrLoc');
  if(staticCurrLocInput) {
    staticCurrLocInput.addEventListener('input', (e) => {
      const country = e.target.value.trim();
      if (countryCoords[country]) {
        document.getElementById(`staticCurrLat`).value = countryCoords[country][0];
        document.getElementById(`staticCurrLng`).value = countryCoords[country][1];
      }
    });
  }

  isAutomatedCb.addEventListener('change', (e) => {
    if (e.target.checked) {
      autoConfig.style.display = 'block';
      staticConfig.style.display = 'none';
    } else {
      autoConfig.style.display = 'none';
      staticConfig.style.display = 'block';
    }
  });

  function saveShipments() {
    localStorage.setItem('305cargo_shipments_v6', JSON.stringify(shipments));
  }

  function renderUI() {
    tableBody.innerHTML = '';
    
    // Update Select Dropdown
    const currentVal = controllerSelect.value;
    controllerSelect.innerHTML = '<option value="">-- Select a Shipment --</option>';
    
    if (shipments.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#718096;">No active shipments.</td></tr>';
      automationList.innerHTML = '<p style="color:#718096; font-size:0.875rem;">No automated shipments running.</p>';
      return;
    }

    shipments.forEach((shipment, index) => {
      // 1. Table
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${shipment.id}</strong></td>
        <td>${shipment.isAutomated ? '<span style="color:var(--success-color); font-weight:bold;">Automated</span>' : 'Static'}</td>
        <td>
          <button class="edit-btn" data-index="${index}" style="color:var(--accent-color); background:none; border:none; cursor:pointer; font-weight:600; margin-right:0.5rem;">Edit</button>
          <button class="delete-btn" data-index="${index}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);

      // 2. Add to Dropdown
      const opt = document.createElement('option');
      opt.value = shipment.id;
      opt.textContent = `${shipment.id} - ${shipment.isAutomated ? 'Automated' : 'Static'}`;
      controllerSelect.appendChild(opt);
    });

    controllerSelect.value = selectedControllerId;
    renderControllerBox();

    // Event Listeners for actions
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const shipment = shipments[e.target.getAttribute('data-index')];
        if(!shipment) return;
        
        // Populate form
        document.getElementById('trackId').value = shipment.id;
        document.getElementById('trackService').value = shipment.serviceType || 'Air Freight Premium';
        document.getElementById('trackSender').value = shipment.sender || '';
        document.getElementById('trackSendAddress').value = shipment.sendAddress || '';
        document.getElementById('trackReceiver').value = shipment.receiver || '';
        document.getElementById('trackRecAddress').value = shipment.recAddress || '';
        document.getElementById('trackRecPhone').value = shipment.recPhone || '';
        document.getElementById('trackRecEmail').value = shipment.recEmail || '';
        document.getElementById('trackContents').value = shipment.contents || '';
        document.getElementById('trackQty').value = shipment.qty || '';
        document.getElementById('trackWeight').value = shipment.weight || '';
        document.getElementById('trackDims').value = shipment.dims || '';
        document.getElementById('trackVessel').value = shipment.vessel || '';
        document.getElementById('trackCharge').value = shipment.charge || '';
        document.getElementById('trackCurrency').value = shipment.currency || 'USD';
        
        isAutomatedCb.checked = shipment.isAutomated;
        isAutomatedCb.dispatchEvent(new Event('change'));

        if (shipment.isAutomated) {
          shipment.waypoints.forEach((wp, i) => {
            if(i < 4) {
              document.getElementById(`wpName_${i}`).value = wp.name || '';
              document.getElementById(`wpLat_${i}`).value = wp.lat || '';
              document.getElementById(`wpLng_${i}`).value = wp.lng || '';
            }
          });
          document.getElementById('automationDuration').value = shipment.totalDurationMs ? (shipment.totalDurationMs / 3600000) : 30;
        } else {
          document.getElementById('staticCurrLoc').value = shipment.staticCurrLoc || '';
          document.getElementById('staticCurrLat').value = shipment.staticCurrLat || '';
          document.getElementById('staticCurrLng').value = shipment.staticCurrLng || '';
          document.getElementById('staticStatus').value = shipment.staticStatus || '';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        shipments.splice(e.target.getAttribute('data-index'), 1);
        saveShipments(); renderUI();
      });
    });
  }

  function renderControllerBox() {
    automationList.innerHTML = '';
    if (!selectedControllerId) return;

    const shipment = shipments.find(s => s.id === selectedControllerId);
    if (!shipment) return;

    const autoBox = document.createElement('div');
    autoBox.style.padding = '1rem';
    autoBox.style.border = '1px solid var(--border-color)';
    autoBox.style.borderRadius = '8px';
    autoBox.style.background = shipment.isAutomated && shipment.autoState === 'playing' ? 'rgba(0,168,107,0.05)' : 'rgba(255,107,0,0.05)';
    
    let statusText = shipment.isAutomated ? (shipment.autoState === 'playing' ? '🟢 RUNNING' : '⏸️ PAUSED') : '⚪ STATIC';
    if (shipment.manualStatusOverride) statusText = `⚠️ OVERRIDDEN: ${shipment.manualStatusOverride}`;

    let optsHTML = `<option value="">-- Clear Override / Status --</option>`;
    alphabeticalStatuses.forEach(s => {
      optsHTML += `<option value="${s}" ${shipment.manualStatusOverride === s ? 'selected' : ''}>${s}</option>`;
    });

    let autoControls = '';
    if (shipment.isAutomated) {
      autoControls = `
        <div style="margin-bottom:1rem;">
          <button class="control-btn btn-play" data-action="play" data-id="${shipment.id}">▶ Resume Math Auto</button>
          <button class="control-btn btn-pause" data-action="pause" data-id="${shipment.id}">⏸ Pause</button>
        </div>
      `;
    }

    autoBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
        <strong>${shipment.id}</strong>
        <span style="font-size:0.8rem; font-weight:bold;">${statusText}</span>
      </div>
      ${autoControls}
      <div>
        <label style="font-size:0.75rem; color:#4A5568;">Manual Status Dropdown</label>
        <div style="display:flex; gap:0.5rem; margin-top:0.25rem;">
          <select id="override_${shipment.id}" class="form-input" style="padding:0.5rem;">
            ${optsHTML}
          </select>
          <button class="btn btn-primary btn-override" data-id="${shipment.id}" style="padding:0.5rem 1rem;">Set</button>
        </div>
      </div>
    `;
    automationList.appendChild(autoBox);

    // Attach listeners for this specific box
    autoBox.querySelectorAll('.control-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const s = shipments.find(x => x.id === e.target.getAttribute('data-id'));
        if(!s) return;
        const now = Date.now();
        const action = e.target.getAttribute('data-action');
        if (action === 'play') {
          s.autoState = 'playing'; s.lastPlayTime = now; s.manualStatusOverride = '';
        } else if (action === 'pause' && s.autoState === 'playing') {
          s.autoState = 'paused'; s.accumulatedTime += (now - s.lastPlayTime);
        }
        saveShipments(); renderUI();
      });
    });

    autoBox.querySelectorAll('.btn-override').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const s = shipments.find(x => x.id === id);
        if(!s) return;
        s.manualStatusOverride = document.getElementById(`override_${id}`).value;
        if (s.manualStatusOverride && s.isAutomated && s.autoState === 'playing') {
          s.autoState = 'paused';
          s.accumulatedTime += (Date.now() - s.lastPlayTime);
        }
        saveShipments(); renderUI();
      });
    });
  }

  if (controllerSelect) {
    controllerSelect.addEventListener('change', (e) => {
      selectedControllerId = e.target.value;
      renderControllerBox();
    });
  }

  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const newId = document.getElementById('trackId').value.trim();
      const existingIdx = shipments.findIndex(s => s.id === newId);
      const isAuto = isAutomatedCb.checked;

      let waypoints = [];
      if (isAuto) {
        for (let i=0; i<4; i++) {
          const name = document.getElementById(`wpName_${i}`).value.trim();
          const lat = parseFloat(document.getElementById(`wpLat_${i}`).value);
          const lng = parseFloat(document.getElementById(`wpLng_${i}`).value);
          if (name && !isNaN(lat) && !isNaN(lng)) { waypoints.push({ name, lat, lng }); }
        }
      }

      const newShipment = {
        id: newId,
        serialCode: existingIdx >= 0 ? shipments[existingIdx].serialCode : 'S/N: ' + Math.floor(Math.random()*9000+1000) + '-305X',
        sender: document.getElementById('trackSender').value.trim(),
        sendAddress: document.getElementById('trackSendAddress').value.trim(),
        receiver: document.getElementById('trackReceiver').value.trim(),
        recAddress: document.getElementById('trackRecAddress').value.trim(),
        recPhone: document.getElementById('trackRecPhone').value.trim(),
        recEmail: document.getElementById('trackRecEmail').value.trim(),
        contents: document.getElementById('trackContents').value.trim(),
        qty: document.getElementById('trackQty').value.trim(),
        weight: parseFloat(document.getElementById('trackWeight').value),
        dims: document.getElementById('trackDims').value.trim(),
        serviceType: document.getElementById('trackService').value,
        vessel: document.getElementById('trackVessel').value.trim(),
        charge: parseFloat(document.getElementById('trackCharge').value),
        currency: document.getElementById('trackCurrency').value,
        isAutomated: isAuto,
        timestamp: new Date().toISOString()
      };

      if (isAuto) {
        newShipment.waypoints = waypoints;
        const hours = parseFloat(document.getElementById('automationDuration').value);
        newShipment.totalDurationMs = hours * 60 * 60 * 1000; 
        newShipment.autoState = 'paused';
        newShipment.accumulatedTime = 0;
        newShipment.lastPlayTime = 0;
        newShipment.manualStatusOverride = '';
      } else {
        newShipment.staticCurrLoc = document.getElementById('staticCurrLoc').value;
        newShipment.staticCurrLat = parseFloat(document.getElementById('staticCurrLat').value);
        newShipment.staticCurrLng = parseFloat(document.getElementById('staticCurrLng').value);
        newShipment.staticStatus = document.getElementById('staticStatus').value;
      }

      if (existingIdx >= 0) shipments[existingIdx] = newShipment;
      else shipments.push(newShipment);

      saveShipments(); renderUI(); adminForm.reset();
      const btn = adminForm.querySelector('button[type="submit"]');
      btn.textContent = 'Saved!';
      setTimeout(() => { btn.textContent = 'Save Shipment Record'; }, 2000);
    });
  }

  // Generate 3 Test Shipments format C305-XXXXXXXX
  if (shipments.length === 0) {
    const dummyNames = ["Tech Corp", "Logistics Inc", "Global Import"];
    const dummyCountries = ["China", "United States", "Germany", "Japan"];
    
    for(let i=0; i<3; i++) {
      let randId = 'C305-' + Math.floor(Math.random()*90000000 + 10000000);
      let randC1 = dummyCountries[Math.floor(Math.random()*dummyCountries.length)];
      let randC2 = dummyCountries[Math.floor(Math.random()*dummyCountries.length)];
      if (randC1 === randC2) randC2 = "Australia"; // Just offset
      
      shipments.push({
        id: randId,
        serialCode: 'S/N: 8492-305X',
        sender: dummyNames[i],
        sendAddress: '456 Origin Blvd, ' + randC1,
        receiver: 'Test Consignee ' + i,
        recAddress: '123 Ocean Blvd, Miami FL',
        recPhone: '+1 305-555-0192',
        recEmail: 'receiving@assemblycorp.com',
        contents: 'Test Cargo ' + i,
        qty: "50",
        weight: 1500,
        dims: '100x100x100 cm',
        serviceType: 'Air Freight Premium',
        vessel: 'CX-841',
        charge: 5000 + (i*1000),
        currency: 'USD',
        isAutomated: true,
        waypoints: [
          {name: randC1, lat: countryCoords[randC1]?.[0] || 0, lng: countryCoords[randC1]?.[1] || 0},
          {name: randC2, lat: countryCoords[randC2]?.[0] || 0, lng: countryCoords[randC2]?.[1] || 0}
        ],
        totalDurationMs: 30 * 60 * 60 * 1000, 
        autoState: 'playing', 
        accumulatedTime: 10 * 60 * 60 * 1000, 
        lastPlayTime: Date.now(),
        manualStatusOverride: '',
        timestamp: new Date().toISOString()
      });
    }
    saveShipments();
  }
  
  renderUI();
});
