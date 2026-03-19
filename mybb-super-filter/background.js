// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateBadge' && sender.tab) {
        const count = message.count;
        // If count is greater than 0, show it. Otherwise, hide the badge.
        const badgeText = count > 0 ? count.toString() : '';
        
        chrome.action.setBadgeText({ 
            text: badgeText, 
            tabId: sender.tab.id 
        });
        
        // Match the badge color to your blue theme
        chrome.action.setBadgeBackgroundColor({ 
            color: '#0d6efd', 
            tabId: sender.tab.id 
        });
    }
});