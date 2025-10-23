const CHECK_API = "http://127.0.0.1:5000/check"; 
const tooltip = document.createElement("div");
tooltip.style.position = "fixed";
tooltip.style.padding = "8px 14px";
tooltip.style.borderRadius = "20px";
tooltip.style.fontSize = "14px";
tooltip.style.fontWeight = "bold";
tooltip.style.color = "#fff";
tooltip.style.backgroundColor = "#333";
tooltip.style.zIndex = "999999";
tooltip.style.pointerEvents = "none";
tooltip.style.display = "none";
tooltip.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
tooltip.style.transition = "background-color 0.2s ease";
document.body.appendChild(tooltip);


document.addEventListener("mousemove", (e) => {
  tooltip.style.top = e.clientY + 15 + "px";
  tooltip.style.left = e.clientX + 15 + "px";
});

let currentLink = null;

// Mouseover: check link
document.addEventListener("mouseover", async (e) => {
  const link = e.target.closest("a[href]");
  if (!link) {
    tooltip.style.display = "none";
    currentLink = null;
    return;
  }

  // If hovering a new link, reset tooltip state
  if (currentLink !== link) {
    currentLink = link;
    tooltip.style.display = "block";
    tooltip.textContent = "Checking...";
    tooltip.style.backgroundColor = "#6c757d"; // gray while loading
  }

  // Already checked before? Use cached status
  if (link.dataset.phishStatus) {
    showTooltip(link.dataset.phishStatus);
    return;
  }

  try {
    const res = await fetch(CHECK_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: link.href }),
    });
    const data = await res.json();
    const safe = Boolean(data.safe);
    link.dataset.phishStatus = safe ? "safe" : "unsafe";
    showTooltip(link.dataset.phishStatus);
  } catch (err) {
    tooltip.textContent = "Error checking link";
    tooltip.style.backgroundColor = "#ffc107"; // Yellow for error
    console.error("Hover check error:", err);
  }
});

// Hide tooltip when leaving any link
document.addEventListener("mouseout", (e) => {
  if (e.relatedTarget && e.relatedTarget.closest("a[href]")) return;
  tooltip.style.display = "none";
  currentLink = null;
});

function showTooltip(status) {
  if (status === "safe") {
    tooltip.textContent = "✅ Safe Link";
    tooltip.style.backgroundColor = "#28a745"; // Green
  } else {
    tooltip.textContent = "❌ Unsafe! Will be blocked!";
    tooltip.style.backgroundColor = "#dc3545"; // Red
  }
}
