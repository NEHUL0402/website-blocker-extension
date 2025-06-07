const input = document.getElementById("siteInput");
const btn = document.getElementById("addBtn");
const siteList = document.getElementById("siteList");

function updateUI(sites) {
  siteList.innerHTML = "";
  sites.forEach((site, index) => {
    const li = document.createElement("li");
    li.textContent = site;

    const delBtn = document.createElement("button");
    delBtn.className = "delBtn";
    delBtn.textContent = "delete";
    delBtn.onclick = () => {
      sites.splice(index, 1);
      chrome.storage.local.set({ userBlockedSites: sites }, () => {
        chrome.runtime.sendMessage({ action: "updateRules", sites });
        updateUI(sites);
      });
    };

    li.appendChild(delBtn);
    siteList.appendChild(li);
  });
}

chrome.storage.local.get("userBlockedSites", (result) => {
  updateUI(result.userBlockedSites || []);
});

btn.onclick = () => {
  const site = input.value.trim();
  if (!site) return;

  chrome.storage.local.get("userBlockedSites", (result) => {
    let sites = result.userBlockedSites || [];
    if (!sites.includes(site)) {
      sites.push(site);
      chrome.storage.local.set({ userBlockedSites: sites }, () => {
        chrome.runtime.sendMessage({ action: "updateRules", sites });
        updateUI(sites);
        input.value = "";
      });
    }
  });
};
