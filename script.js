const map = L.map("map", { zoomControl: false }).setView([-3.8006, 102.265], 13);

L.control.zoom({ position: "topright" }).addTo(map);

const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { maxZoom: 19, attribution: "Tiles &copy; Esri" }
);

L.control.layers(
  { "Peta jalan": street, "Satelit": satellite },
  null,
  { position: "topright", collapsed: true }
).addTo(map);

const pointLayer = L.layerGroup().addTo(map);
const userLayer = L.layerGroup().addTo(map);
const evacuationPoints = [];
let selectedPoint = null;

const statusMessage = document.getElementById("statusMessage");
const searchInput = document.getElementById("searchInput");
const infoCard = document.getElementById("infoCard");

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRadians = value => value * Math.PI / 180;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lon2 - lon1);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(deltaLng / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function formatCapacity(capacity) {
  return new Intl.NumberFormat("id-ID").format(capacity);
}

function createMarkerIcon(number, isSelected = false) {
  return L.divIcon({
    className: "",
    html: `<div class="evacuation-marker${isSelected ? " selected" : ""}"><span>${number}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 31]
  });
}

function positionInfoCard(point) {
  const position = map.latLngToContainerPoint([point.lat, point.lng]);
  infoCard.style.left = `${position.x}px`;
  infoCard.style.top = `${position.y}px`;
}

function selectPoint(point, message) {
  selectedPoint = point;
  evacuationPoints.forEach(item => {
    item.marker.setIcon(createMarkerIcon(item.number, item === point));
  });

  document.querySelectorAll("#list .item").forEach(item => {
    item.classList.toggle("is-selected", Number(item.dataset.pointId) === point.id);
  });

  document.getElementById("cardTitle").textContent = point.name;
  document.getElementById("cardAddress").textContent = point.area || "Kota Bengkulu (lokasi simulasi)";
  document.getElementById("cardCapacity").textContent = `${formatCapacity(point.capacity)} orang`;
  document.getElementById("cardCoords").textContent = `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
  document.getElementById("gmapsButton").href =
    `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
  positionInfoCard(point);
  infoCard.classList.add("show");
  infoCard.setAttribute("aria-hidden", "false");
  if (message) setStatus(message);
}

function hideInfoCard() {
  infoCard.classList.remove("show");
  infoCard.setAttribute("aria-hidden", "true");
}

function renderList(points) {
  const list = document.getElementById("list");
  list.replaceChildren();
  document.getElementById("listCount").textContent = `${points.length} titik`;

  if (points.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Tidak ada titik yang cocok dengan pencarian.";
    list.appendChild(emptyState);
    return;
  }

  points.forEach(point => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `item${point === selectedPoint ? " is-selected" : ""}`;
    item.dataset.pointId = String(point.id);
    item.innerHTML = `
      <span class="item-number">${point.number}</span>
      <span class="item-copy">
        <strong>${escapeHtml(point.name)}</strong>
        <span>${escapeHtml(point.area || "Kota Bengkulu")}</span>
      </span>
      <span class="item-capacity">${formatCapacity(point.capacity)} org</span>
    `;
    item.addEventListener("click", () => {
      map.flyTo([point.lat, point.lng], 15, { duration: 0.65 });
      selectPoint(point, `${point.name} dipilih — kapasitas simulasi ${formatCapacity(point.capacity)} orang.`);
    });
    list.appendChild(item);
  });
}

function updateDashboard(points) {
  const totalCapacity = points.reduce((total, point) => total + point.capacity, 0);
  const averageCapacity = points.length ? Math.round(totalCapacity / points.length) : 0;
  const highest = points.reduce((best, point) => point.capacity > best.capacity ? point : best, points[0]);
  const lowest = points.reduce((best, point) => point.capacity < best.capacity ? point : best, points[0]);
  document.getElementById("pointCount").textContent = formatCapacity(points.length);
  document.getElementById("totalCapacity").textContent = formatCapacity(totalCapacity);
  document.getElementById("averageCapacity").textContent = formatCapacity(averageCapacity);
  document.getElementById("highestCapacity").textContent =
    `${highest.name.replace("Titik Evakuasi ", "")} · ${formatCapacity(highest.capacity)} org`;
  document.getElementById("lowestCapacity").textContent =
    `${lowest.name.replace("Titik Evakuasi ", "")} · ${formatCapacity(lowest.capacity)} org`;
}

function displayPoints(data) {
  if (!data || data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    throw new Error("GeoJSON harus berupa FeatureCollection yang valid.");
  }

  data.features.forEach((feature, index) => {
    if (!feature.geometry || feature.geometry.type !== "Point" ||
        !Array.isArray(feature.geometry.coordinates) || feature.geometry.coordinates.length < 2) {
      throw new Error(`Geometri titik ke-${index + 1} tidak valid.`);
    }

    const [lng, lat] = feature.geometry.coordinates;
    const properties = feature.properties || {};
    const capacity = Number(properties.capacity);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(capacity) || capacity < 0) {
      throw new Error(`Koordinat atau kapasitas titik ke-${index + 1} tidak valid.`);
    }

    const point = {
      id: index + 1,
      number: index + 1,
      name: properties.name || `Titik Evakuasi ${index + 1}`,
      area: properties.area || "Kota Bengkulu (lokasi simulasi)",
      capacity,
      lat,
      lng
    };

    point.marker = L.marker([lat, lng], {
      title: point.name,
      icon: createMarkerIcon(point.number)
    }).addTo(pointLayer);

    point.marker.on("click", () => {
      map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 15), { duration: 0.5 });
      selectPoint(point, `${point.name} dipilih.`);
    });
    evacuationPoints.push(point);
  });

  if (evacuationPoints.length === 0) {
    throw new Error("GeoJSON tidak memuat titik evakuasi.");
  }

  const illustrativeLine = L.polyline(
    evacuationPoints.map(point => [point.lat, point.lng]),
    { color: "#ee8b55", weight: 2, opacity: 0.8, dashArray: "5 8", interactive: false }
  );
  illustrativeLine.addTo(map);
  updateDashboard(evacuationPoints);
  renderList(evacuationPoints);
  map.fitBounds(pointLayer.getBounds().pad(0.28));
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase("id");
  const filteredPoints = evacuationPoints.filter(point =>
    `${point.name} ${point.area}`.toLocaleLowerCase("id").includes(query)
  );
  renderList(filteredPoints);
});

document.getElementById("nearButton").addEventListener("click", event => {
  const button = event.currentTarget;
  if (!navigator.geolocation) {
    setStatus("Browser ini tidak mendukung fitur lokasi. Pilih titik dari daftar atau peta.");
    return;
  }

  button.disabled = true;
  setStatus("Meminta izin lokasi perangkat...");
  navigator.geolocation.getCurrentPosition(position => {
    button.disabled = false;
    const { latitude, longitude, accuracy } = position.coords;
    const nearest = evacuationPoints.reduce((best, point) => {
      const distance = distanceKm(latitude, longitude, point.lat, point.lng);
      return !best || distance < best.distance ? { point, distance } : best;
    }, null);

    userLayer.clearLayers();
    L.marker([latitude, longitude], {
      title: "Lokasi perangkat",
      icon: L.divIcon({
        className: "",
        html: '<div class="user-marker"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(userLayer);
    L.circle([latitude, longitude], {
      radius: accuracy || 50,
      color: "#4778d1",
      weight: 1,
      fillColor: "#4778d1",
      fillOpacity: 0.1
    }).addTo(userLayer);

    if (nearest) {
      const distance = `${nearest.distance.toFixed(2)} km garis lurus`;
      map.flyTo([nearest.point.lat, nearest.point.lng], 14, { duration: 0.7 });
      selectPoint(nearest.point, `Titik terdekat: ${nearest.point.name} (${distance}). Bukan rute perjalanan.`);
    }
  }, error => {
    button.disabled = false;
    const errorMessages = {
      1: "Izin lokasi ditolak. Aktifkan izin lokasi atau pilih titik dari daftar.",
      2: "Lokasi perangkat tidak tersedia. Coba lagi atau pilih titik dari daftar.",
      3: "Permintaan lokasi melewati batas waktu. Silakan coba lagi."
    };
    setStatus(errorMessages[error.code] || `Lokasi gagal diperoleh: ${error.message}`);
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
});

document.getElementById("closeCard").addEventListener("click", hideInfoCard);
document.addEventListener("click", event => {
  if (!infoCard.contains(event.target) &&
      !event.target.closest(".leaflet-marker-icon") &&
      !event.target.closest("#list")) {
    hideInfoCard();
  }
});
map.on("move zoom", () => {
  if (selectedPoint && infoCard.classList.contains("show")) positionInfoCard(selectedPoint);
});
window.addEventListener("resize", () => {
  if (selectedPoint && infoCard.classList.contains("show")) positionInfoCard(selectedPoint);
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"'`]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "`": "&#96;"
  })[character]);
}

fetch("data/titik_evakuasi.geojson")
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(displayPoints)
  .catch(error => {
    console.error("Gagal memuat data titik evakuasi:", error);
    setStatus("Data titik gagal dimuat. Jalankan proyek melalui Live Server dan periksa data GeoJSON.");
  });
