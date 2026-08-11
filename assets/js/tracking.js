/**
 * 305CARGO - Tracking Logic (Phase 7 Live Automation)
 * Performs real-time mathematical interpolation of shipment routes.
 */

document.addEventListener('DOMContentLoaded', () => {
  const trackingForm = document.getElementById('trackingForm');
  const trackingInput = document.getElementById('trackingNumber');
  const resultsDiv = document.getElementById('tracking-results');
  const loadingDiv = document.getElementById('tracking-loading');
  const timelineContainer = document.getElementById('tracking-timeline');
  const displayId = document.getElementById('display-id');
  
  // Enriched UI Elements
  const statusBadge = document.getElementById('status-badge');
  const originText = document.getElementById('origin-text');
  const destText = document.getElementById('dest-text');
  const senderText = document.getElementById('sender-text');
  const sendAddressText = document.getElementById('send-address-text');
  const receiverText = document.getElementById('receiver-text');
  const recAddressText = document.getElementById('rec-address-text');
  const recPhoneText = document.getElementById('rec-phone-text');
  const recEmailText = document.getElementById('rec-email-text');
  const weightText = document.getElementById('weight-text');
  const qtyText = document.getElementById('qty-text');
  const currLocText = document.getElementById('curr-loc-text');
  const dimsText = document.getElementById('dims-text');
  const contentsText = document.getElementById('contents-text');
  const chargeText = document.getElementById('charge-text');
  const serviceText = document.getElementById('service-text');
  const vesselText = document.getElementById('vessel-text');
  
  const barcodeDisplay = document.getElementById('barcode-display');
  const serialDisplay = document.getElementById('serial-display');
  
  // Map Elements
  const mapWrapper = document.getElementById('map-wrapper');
  let trackingMap = null;
  let mapMarker = null;
  let polylinePast = null;
  let polylineFuture = null;
  
  let currentShipment = null;
  let animationFrameId = null;

  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get('id');
  if (idParam) {
    trackingInput.value = idParam;
    executeTracking(idParam);
  }

  if (trackingForm) {
    trackingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = trackingInput.value.trim();
      if (id) {
        window.history.pushState({}, '', `?id=${id}`);
        executeTracking(id);
      }
    });
  }

  // Handle PDF Generation
  document.getElementById('btn-pdf-manifest')?.addEventListener('click', () => {
    if(currentShipment) window.open(`manifest.html?id=${currentShipment.id}`, '_blank');
  });
  document.getElementById('btn-pdf-bol')?.addEventListener('click', () => {
    if(currentShipment) window.open(`bol.html?id=${currentShipment.id}`, '_blank');
  });

  function executeTracking(id) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    resultsDiv.style.display = 'none';
    mapWrapper.style.display = 'none'; // hidden while loading
    currentShipment = null;
    loadingDiv.style.display = 'block';
    
    setTimeout(() => {
      loadingDiv.style.display = 'none';
      displayId.textContent = id.toUpperCase();
      barcodeDisplay.textContent = `*${id.toUpperCase()}*`;

      const shipments = JSON.parse(localStorage.getItem('305cargo_shipments_v6')) || [];
      const foundShipment = shipments.find(s => s.id.toLowerCase() === id.toLowerCase());

      if (foundShipment) {
        currentShipment = foundShipment;
        
        // Static UI Data
        senderText.textContent = foundShipment.sender || 'Not Specified';
        if(sendAddressText) sendAddressText.textContent = foundShipment.sendAddress || 'Not Specified';
        receiverText.textContent = foundShipment.receiver || 'Not Specified';
        if(recAddressText) recAddressText.textContent = foundShipment.recAddress || 'Not Specified';
        if(recPhoneText) recPhoneText.textContent = foundShipment.recPhone || 'Not Specified';
        if(recEmailText) recEmailText.textContent = foundShipment.recEmail || 'Not Specified';
        weightText.textContent = foundShipment.weight ? `${foundShipment.weight} kg` : 'N/A';
        if(qtyText) qtyText.textContent = foundShipment.qty || '1';
        dimsText.textContent = foundShipment.dims || 'N/A';
        contentsText.textContent = foundShipment.contents || 'N/A';
        if(chargeText) chargeText.textContent = foundShipment.charge ? `${foundShipment.charge.toLocaleString()} ${foundShipment.currency}` : 'N/A';
        serviceText.textContent = foundShipment.serviceType || 'Standard';
        vesselText.textContent = foundShipment.vessel || 'TBA';
        serialDisplay.textContent = foundShipment.serialCode || 'S/N: N/A';

        // Prepare Base Map Setup
        mapWrapper.style.display = 'block';
        if (trackingMap) {
          trackingMap.remove();
          trackingMap = null;
        }
        const mapDiv = document.getElementById('tracking-map');
        trackingMap = L.map(mapDiv).setView([0,0], 2);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OSM contributors',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(trackingMap);

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="background-color: var(--primary-color); width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 12px rgba(255,107,0,0.6); animation: pulseGlow 2s infinite;"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        mapMarker = L.marker([0, 0], {icon: customIcon}).addTo(trackingMap);

        // Begin Simulation Loop
        if (foundShipment.isAutomated) {
          originText.textContent = foundShipment.waypoints[0].name;
          destText.textContent = foundShipment.waypoints[foundShipment.waypoints.length - 1].name;
          
          // Draw waypoints
          foundShipment.waypoints.forEach(wp => {
            L.circleMarker([wp.lat, wp.lng], { color: '#4A5568', fillColor: '#4A5568', fillOpacity: 1, radius: 5 })
             .addTo(trackingMap).bindPopup(wp.name);
          });

          // Fit bounds to all waypoints
          const wpLatLngs = foundShipment.waypoints.map(wp => [wp.lat, wp.lng]);
          
          setTimeout(() => {
            trackingMap.invalidateSize();
            trackingMap.fitBounds(L.latLngBounds(wpLatLngs), { padding: [50, 50] });
          }, 300);

          requestAnimationFrame(simulationLoop);
        } else {
          // Static Rendering
          originText.textContent = foundShipment.staticOrigin;
          destText.textContent = "See Destination"; // fallback
          currLocText.textContent = foundShipment.staticCurrLoc;
          statusBadge.textContent = foundShipment.staticStatus.toUpperCase();
          
          mapMarker.setLatLng([foundShipment.staticCurrLat, foundShipment.staticCurrLng]);
          mapMarker.bindPopup(`<b>📍 ${foundShipment.staticCurrLoc}</b>`).openPopup();
          
          setTimeout(() => {
            trackingMap.invalidateSize();
            trackingMap.setView([foundShipment.staticCurrLat, foundShipment.staticCurrLng], 4);
          }, 300);
        }

        const timelineData = generateDynamicTimeline(foundShipment);
        renderTimeline(timelineData);

      } else {
        alert('Shipment tracking ID not found. Please verify the ID or check the Admin Portal.');
      }
      
      resultsDiv.style.display = 'block';
    }, 800);
  }

  function simulationLoop() {
    if (!currentShipment || !currentShipment.isAutomated) return;

    // Calculate Elapsed Time
    let elapsed = currentShipment.accumulatedTime;
    if (currentShipment.autoState === 'playing') {
      elapsed += (Date.now() - currentShipment.lastPlayTime);
    }
    
    let progressRatio = elapsed / currentShipment.totalDurationMs;
    if (progressRatio >= 1) {
      progressRatio = 1;
      currentShipment.autoState = 'completed';
    }

    // Determine Status Text
    let currentStatus = 'IN TRANSIT';
    if (progressRatio === 1) currentStatus = 'DELIVERED';
    else if (progressRatio > 0.8) currentStatus = 'OUT FOR DELIVERY';
    else if (progressRatio > 0.5 && progressRatio < 0.6) currentStatus = 'CUSTOMS CLEARANCE';

    // Apply Manual Status Override
    if (currentShipment.manualStatusOverride && currentShipment.manualStatusOverride.trim() !== '') {
      currentStatus = currentShipment.manualStatusOverride.toUpperCase();
    }

    statusBadge.textContent = currentStatus;
    if (currentStatus === 'DELIVERED') {
      statusBadge.className = 'status-badge delivered';
    } else {
      statusBadge.className = 'status-badge in-transit';
    }

    // Interpolate Coordinates between waypoints
    const wp = currentShipment.waypoints;
    const numSegments = wp.length - 1;
    const scaledProgress = progressRatio * numSegments;
    const segmentIndex = Math.min(Math.floor(scaledProgress), numSegments - 1);
    const segmentProgress = scaledProgress - segmentIndex;

    const startWp = wp[segmentIndex];
    const endWp = wp[segmentIndex + 1];

    const currentLat = startWp.lat + (endWp.lat - startWp.lat) * segmentProgress;
    const currentLng = startWp.lng + (endWp.lng - startWp.lng) * segmentProgress;
    
    let locationText = startWp.name;
    if (segmentProgress > 0.5) locationText = `Approaching ${endWp.name}`;
    if (progressRatio === 1) locationText = endWp.name;
    
    currLocText.textContent = locationText;

    // Update Map Marker & Lines
    mapMarker.setLatLng([currentLat, currentLng]);

    // Popup logic
    const popupContent = `
      <div style="font-family: 'Inter', sans-serif; text-align:center;">
        <strong style="color:var(--primary-color); font-size:1.1rem;">📍 ${locationText}</strong><br>
        <span style="font-size:0.8rem; color:#718096;">Lat: ${currentLat.toFixed(2)}, Lng: ${currentLng.toFixed(2)}</span><br>
        <hr style="margin:5px 0; border:0; border-top:1px solid #E2E8F0;">
        <strong style="text-transform:uppercase; font-size:0.8rem;">Status: ${currentStatus}</strong>
      </div>
    `;
    if (!mapMarker.getPopup()) {
      mapMarker.bindPopup(popupContent).openPopup();
    } else {
      mapMarker.setPopupContent(popupContent);
    }

    // Draw Polylines
    if (polylinePast) trackingMap.removeLayer(polylinePast);
    if (polylineFuture) trackingMap.removeLayer(polylineFuture);

    // Past route
    let pastCoords = [];
    for(let i=0; i<=segmentIndex; i++) {
      pastCoords.push([wp[i].lat, wp[i].lng]);
    }
    pastCoords.push([currentLat, currentLng]);
    
    polylinePast = L.polyline(pastCoords, {
      color: 'var(--primary-color)', weight: 4, opacity: 0.9
    }).addTo(trackingMap);

    // Future route
    let futureCoords = [[currentLat, currentLng]];
    for(let i=segmentIndex+1; i<wp.length; i++) {
      futureCoords.push([wp[i].lat, wp[i].lng]);
    }
    
    polylineFuture = L.polyline(futureCoords, {
      color: '#A0AEC0', weight: 4, opacity: 0.8, dashArray: '5, 10'
    }).addTo(trackingMap);

    // Continue loop if not complete and not paused
    if (currentShipment.autoState === 'playing') {
      animationFrameId = requestAnimationFrame(simulationLoop);
    }
  }

  function renderTimeline(data) {
    timelineContainer.innerHTML = '';
    data.forEach((item) => {
      const itemEl = document.createElement('div');
      itemEl.className = `timeline-item ${item.status}`;
      itemEl.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="timeline-date">${item.date}</span>
          <div class="timeline-title">${item.title}</div>
          <div class="timeline-location">${item.location}</div>
        </div>
      `;
      timelineContainer.appendChild(itemEl);
    });
  }

  function generateDynamicTimeline(shipment) {
    const dateObj = new Date(shipment.timestamp);
    const dateStr = dateObj.toLocaleDateString() + ' • ' + dateObj.toLocaleTimeString();

    let events = [{
      status: 'completed', date: dateStr, title: 'Shipment Created', location: 'System Online'
    }];
    
    events.unshift({
      status: 'active', date: dateStr, title: 'Shipment Updated', location: 'Tracking Network'
    });
    
    // Add manual override event to timeline if present
    if (shipment.manualStatusOverride) {
      events.unshift({
        status: 'active', date: dateStr, title: 'Shipment Updated', location: shipment.manualStatusOverride.toUpperCase()
      });
    }

    return events;
  }
});
