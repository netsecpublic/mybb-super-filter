function applyFilters() {
    chrome.storage.sync.get(['ignoredUsers', 'ignoredThreads', 'ignoredSections'], (data) => {
        const users = (data.ignoredUsers || []).map(u => u.toLowerCase().trim());
        const sections = (data.ignoredSections || []).map(s => s.toLowerCase().trim());
        // Threads are now objects: { id: "123456", desc: "Crypto stuff" }
        const threads = data.ignoredThreads || []; 

        // 1. Hide Messages from Ignored Users within an open thread
        if (users.length > 0) {
            document.querySelectorAll('.message').forEach(msg => {
                const userEl = msg.querySelector('.message-name');
                if (userEl && users.includes(userEl.textContent.trim().toLowerCase())) {
                    msg.style.display = 'none';
                } else {
                    msg.style.display = ''; 
                }
            });
        } else {
             document.querySelectorAll('.message').forEach(msg => msg.style.display = '');
        }

        // 2, 3 & 4. Hide Threads in listings (New Posts, Category views, etc.)
        document.querySelectorAll('.structItem--thread').forEach(threadItem => {
            let hideThread = false;

            // Feature: Hide ignored threads by exact Thread ID
            if (threads.length > 0) {
                const titleLinks = threadItem.querySelectorAll('.structItem-title a');
                const mainTitleLink = Array.from(titleLinks).find(a => !a.classList.contains('labelLink'));
                
                if (mainTitleLink) {
                    // XenForo URLs usually look like: /threads/title-goes-here.123456/
                    // This regex extracts those digits safely
                    const match = mainTitleLink.href.match(/(?:threads\/|\.)(\d+)\//);
                    if (match && match[1]) {
                        const threadId = match[1];
                        if (threads.some(t => t.id === threadId)) {
                            hideThread = true;
                        }
                    }
                }
            }

            // Feature: Hide threads belonging to ignored sections
            if (!hideThread && sections.length > 0) {
                const partsLinks = threadItem.querySelectorAll('.structItem-parts a');
                const sectionLink = Array.from(partsLinks).find(a => a.href.includes('/forums/'));
                
                if (sectionLink && sections.includes(sectionLink.textContent.trim().toLowerCase())) {
                    hideThread = true;
                }
            }

            // Feature: Hide thread in 'New Posts' if the last poster is ignored
            if (!hideThread && users.length > 0) {
                const latestUserEl = threadItem.querySelector('.structItem-cell--latest .username');
                if (latestUserEl && users.includes(latestUserEl.textContent.trim().toLowerCase())) {
                    hideThread = true;
                }
            }

            // Apply visibility
            threadItem.style.display = hideThread ? 'none' : '';
        });

        // Feature: Hide complete sections/nodes from the main forum index
        if (sections.length > 0) {
            document.querySelectorAll('.node').forEach(node => {
                const titleEl = node.querySelector('.node-title a');
                if (titleEl && sections.includes(titleEl.textContent.trim().toLowerCase())) {
                    node.style.display = 'none';
                } else {
                    node.style.display = '';
                }
            });
        } else {
            document.querySelectorAll('.node').forEach(node => node.style.display = '');
        }
    });
}

applyFilters();

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        applyFilters();
    }
});
