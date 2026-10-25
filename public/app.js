const $ = (selector) => document.querySelector(selector);

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Load trusted contacts
async function loadContacts() {
  try {
    const contacts = await api("/api/contacts");

    $("#contacts").innerHTML = contacts.length
      ? contacts.map((contact) => `
          <li>
            ${esc(contact.name)} — ${esc(contact.phone)}
            <button
              data-remove="${contact.id}"
              type="button"
            >
              Remove
            </button>
          </li>
        `).join("")
      : "<li>No contacts yet.</li>";
  } catch (error) {
    $("#contacts").textContent = error.message;
  }
}

// Load saved trips
async function loadTrips() {
  try {
    const trips = await api("/api/trips");

    $("#trips").innerHTML = trips.length
      ? trips.map((trip) => `
          <li>
            ${esc(trip.destination)} —
            ${esc(trip.status)}
            ${trip.eta ? " · ETA " + esc(trip.eta) : ""}

            ${trip.status === "active"
              ? `<button
                   data-complete="${trip.id}"
                   type="button"
                 >Arrived</button>`
              : ""}
          </li>
        `).join("")
      : "<li>No trips yet.</li>";
  } catch (error) {
    $("#trips").textContent = error.message;
  }
}

// Load demo SOS alerts
async function loadAlerts() {
  try {
    const alerts = await api("/api/alerts");

    $("#alerts").innerHTML = alerts.length
      ? alerts.map((alert) => `
          <li>
            ${esc(alert.message)} —
            ${esc(new Date(alert.created_at).toLocaleString())}
            · ${esc(alert.status)}

            ${alert.latitude != null && alert.longitude != null
              ? `<a
                   target="_blank"
                   rel="noopener noreferrer"
                   href="https://maps.google.com/?q=${encodeURIComponent(
                     alert.latitude + "," + alert.longitude
                   )}"
                 >Map</a>`
              : ""}
          </li>
        `).join("")
      : "<li>No alerts yet.</li>";
  } catch (error) {
    $("#alerts").textContent = error.message;
  }
}

// Add a trusted contact
$("#contactForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await api("/api/contacts", {
      method: "POST",
      body: JSON.stringify({
        name: $("#name").value,
        phone: $("#phone").value
      })
    });

    event.target.reset();

    $("#contactStatus").textContent = "Contact saved.";
    await loadContacts();
  } catch (error) {
    $("#contactStatus").textContent = error.message;
  }
});

// Remove a contact
$("#contacts").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-remove]");

  if (!button) return;

  if (!confirm("Remove this demo contact?")) return;

  try {
    await api(
      "/api/contacts?id=" + encodeURIComponent(button.dataset.remove),
      { method: "DELETE" }
    );

    await loadContacts();
  } catch (error) {
    $("#contactStatus").textContent = error.message;
  }
});

// Create a trip
$("#tripForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await api("/api/trips", {
      method: "POST",
      body: JSON.stringify({
        destination: $("#destination").value,
        eta: $("#eta").value
      })
    });

    event.target.reset();

    $("#tripStatus").textContent =
      "Trip saved. It is not monitored automatically.";

    await loadTrips();
  } catch (error) {
    $("#tripStatus").textContent = error.message;
  }
});

// Mark a trip as completed
$("#trips").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-complete]");

  if (!button) return;

  try {
    await api(
      "/api/trip-complete?id=" +
        encodeURIComponent(button.dataset.complete),
      {
        method: "POST",
        body: "{}"
      }
    );

    $("#tripStatus").textContent = "Trip marked complete.";

    await loadTrips();
  } catch (error) {
    $("#tripStatus").textContent = error.message;
  }
});

// Record a demo SOS alert
$("#sos").addEventListener("click", async () => {
  const confirmed = confirm(
    "DEMO ONLY: this records an alert and does not notify anyone. Continue?"
  );

  if (!confirmed) return;

  const status = $("#sosStatus");

  status.textContent = "Saving demo alert…";

  const body = {
    message: "Demo SOS button pressed"
  };

  // Location is optional and requires browser permission.
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            timeout: 5000,
            maximumAge: 30000
          }
        );
      });

      body.latitude = position.coords.latitude;
      body.longitude = position.coords.longitude;
    } catch (error) {
      // Continue without location if unavailable or denied.
    }
  }

  try {
    const alert = await api("/api/alerts", {
      method: "POST",
      body: JSON.stringify(body)
    });

    status.textContent =
      `Demo alert #${alert.id} saved. Nobody was notified.`;

    await loadAlerts();
  } catch (error) {
    status.textContent = error.message;
  }
});

// Initialize the page
loadContacts();
loadTrips();
loadAlerts();
