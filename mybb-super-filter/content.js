// content.js

function applyFilters() {
    chrome.storage.sync.get(['ignoredUsers', 'ignoredThreads', 'ignoredSections', 'filterEnabled'], (data) => {
        const isEnabled = data.filterEnabled !== false; 
        let hiddenCount = 0; 

        if (!isEnabled) {
            document.querySelectorAll('.message').forEach(msg => msg.style.display = '');
            document.querySelectorAll('.structItem--thread').forEach(thread => thread.style.display = '');
            document.querySelectorAll('.node').forEach(node => node.style.display = '');
            chrome.runtime.sendMessage({ action: 'updateBadge', count: 0 }).catch(() => {});
            return; 
        }

        const users = (data.ignoredUsers || []).map(u => u.toLowerCase().trim());
        const threads = data.ignoredThreads || []; 
        const sections = data.ignoredSections || []; // Now expects an array of {id, desc}

        // 1. Messages inside threads
        if (users.length > 0) {
            document.querySelectorAll('.message').forEach(msg => {
                const userEl = msg.querySelector('.message-name');
                if (userEl && users.includes(userEl.textContent.trim().toLowerCase())) {
                    msg.style.display = 'none';
                    hiddenCount++;
                } else {
                    msg.style.display = ''; 
                }
            });
        } else {
             document.querySelectorAll('.message').forEach(msg => msg.style.display = '');
        }

        // 2, 3, 4, & 5. Thread Listings (New Posts, Category views)
        document.querySelectorAll('.structItem--thread').forEach(threadItem => {
            let hideThread = false;

            // OP (Creator)
            if (users.length > 0) {
                const dataAuthor = threadItem.getAttribute('data-author');
                let opName = dataAuthor ? dataAuthor.trim().toLowerCase() : null;
                if (!opName) {
                    const opEl = threadItem.querySelector('.structItem-parts .username');
                    if (opEl) opName = opEl.textContent.trim().toLowerCase();
                }
                if (opName && users.includes(opName)) hideThread = true;
            }

            // By Thread ID
            if (!hideThread && threads.length > 0) {
                const titleLinks = threadItem.querySelectorAll('.structItem-title a');
                const mainTitleLink = Array.from(titleLinks).find(a => !a.classList.contains('labelLink'));
                if (mainTitleLink) {
                    const match = mainTitleLink.href.match(/(?:threads\/|\.)(\d+)\//);
                    if (match && match[1] && threads.some(t => t.id === match[1])) {
                        hideThread = true;
                    }
                }
            }

            // RESTORED: By Section ID
            if (!hideThread && sections.length > 0) {
                const partsLinks = threadItem.querySelectorAll('.structItem-parts a');
                const sectionLink = Array.from(partsLinks).find(a => a.href.includes('/forums/'));
                if (sectionLink) {
                    const match = sectionLink.href.match(/(?:forums\/|\.)(\d+)\//);
                    if (match && match[1] && sections.some(s => s.id === match[1])) {
                        hideThread = true;
                    }
                }
            }

            // Latest Poster
            if (!hideThread && users.length > 0) {
                const latestUserEl = threadItem.querySelector('.structItem-cell--latest .username');
                if (latestUserEl && users.includes(latestUserEl.textContent.trim().toLowerCase())) {
                    hideThread = true;
                }
            }

            if (hideThread) {
                threadItem.style.display = 'none';
                hiddenCount++;
            } else {
                threadItem.style.display = '';
            }
        });

        // RESTORED: Main Index Sections by ID
        if (sections.length > 0) {
            document.querySelectorAll('.node').forEach(node => {
                const titleEl = node.querySelector('.node-title a');
                if (titleEl) {
                    const match = titleEl.href.match(/(?:forums\/|\.)(\d+)\//);
                    if (match && match[1] && sections.some(s => s.id === match[1])) {
                        node.style.display = 'none';
                        hiddenCount++;
                    } else {
                        node.style.display = '';
                    }
                }
            });
        } else {
            document.querySelectorAll('.node').forEach(node => node.style.display = '');
        }

        // Send tally to badge
        chrome.runtime.sendMessage({ action: 'updateBadge', count: hiddenCount }).catch(() => {});
    });
}

applyFilters();

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') applyFilters();
});