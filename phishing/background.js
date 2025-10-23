// background.js
const CHECK_API = "http://127.0.0.1:5000/check";     // from main.py
const ALERT_API = "http://127.0.0.1:4356/alert";     // from alert.py
const BLOCK_PAGE = chrome.runtime.getURL("block.html");

// Create a unique rule id for a URL (safe, deterministic)
function ruleIdFor(url) {
  // Simple 32-bit hash → positive integer
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (h << 5) - h + url.charCodeAt(i);
    h |= 0;
  }
  // Reserve a range (e.g., 100000..199999) to avoid collisions with your other rules
  return 100000 + (Math.abs(h) % 99999);
}

// Add a network-level block+redirect rule for this exact URL
async function addBlockRuleFor(url) {
  const id = ruleIdFor(url);
  const rule = {
    id,
    priority: 1000,
    action: {
      type: "redirect",
      redirect: { url: BLOCK_PAGE }
    },
    condition: {
      urlFilter: url,            // exact-match behavior when full URL used
      resourceTypes: ["main_frame"]  // block top-level navigations
    }
  };
  // Remove any old rule with same id and add the new one
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [id],
    addRules: [rule]
  });
  return id;
}

// Check a URL with your local checker
async function isSafeUrl(url) {
  const res = await fetch(CHECK_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });
  const data = await res.json();
  return Boolean(data.safe);
}

// Early hook: before navigation commits
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  try {
    // Only top-frame navigations with http(s)
    if (details.frameId !== 0) return;
    const url = details.url || "";
    if (!/^https?:\/\//i.test(url)) return;

    const safe = await isSafeUrl(url);
    if (!safe) {
      // 1) Log alert (non-blocking)
      fetch(ALERT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked_url: url })
      }).catch(() => {});

      // 2) Install a DNR block rule so this URL never opens
      await addBlockRuleFor(url);

      // 3) Proactively send the user to the local block page right now
      chrome.tabs.update(details.tabId, { url: BLOCK_PAGE });
    }
  } catch (e) {
    console.error("PhishStop error:", e);
  }
});

// Fallback (you already had this) – if URL changes after load, re-check.
// Keeps your existing behavior and logging in place.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (!changeInfo.url) return;
  try {
    const safe = await isSafeUrl(changeInfo.url);
    if (!safe) {
      fetch(ALERT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked_url: changeInfo.url })
      }).catch(() => {});
      await addBlockRuleFor(changeInfo.url);
      chrome.tabs.update(tabId, { url: BLOCK_PAGE });
    }
  } catch (e) {
    console.error(e);
  }
});
