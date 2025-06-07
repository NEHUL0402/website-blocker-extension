function buildRule(site, id) {
  return {
    id: id,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { extensionPath: "/blocked.html" }
    },
    condition: {
      urlFilter: "||" + site,
      resourceTypes: ["main_frame"]
    }
  };
}

async function updateDynamicRules(sites) {
  const rules = sites.map((site, index) => buildRule(site, 1000 + index));

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map(r => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: rules
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("userBlockedSites", (result) => {
    let sites = result.userBlockedSites || [];

    // Default block list on fresh install
    if (sites.length === 0) {
      sites = ["twitter.com", "facebook.com", "instagram.com"];
      chrome.storage.local.set({ userBlockedSites: sites });
    }

    updateDynamicRules(sites);
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "updateRules") {
    updateDynamicRules(msg.sites || []);
  }
});
