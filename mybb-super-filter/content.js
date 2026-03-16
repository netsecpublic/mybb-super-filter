function applyFilters() {
    chrome.storage.sync.get(['ignoredUsers', 'ignoredThreads', 'ignoredSections', 'filterEnabled'], (data) => {
        // Default to true if it hasn't been set yet
        const isEnabled = data.filterEnabled !== false; 

        // If the master toggle is OFF, unhide everything and stop processing
        if (!isEnabled) {
            document.querySelectorAll('.message').forEach(msg => msg.style.display = '');
            document.querySelectorAll('.structItem--thread').forEach(thread => thread.style.display = '');
            document.querySelectorAll('.node').forEach(node => node.style.display = '');
            return; 
        }

        const users = (data.ignoredUsers || []).map(u => u.toLowerCase().trim());
        const sections = (data.ignoredSections || []).map(s => s.toLowerCase().trim());
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

        // 2, 3, 4 & 5. Hide Threads in listings (New Posts, Category views, etc.)
        document.querySelectorAll('.structItem--thread').forEach(threadItem => {
            let hideThread = false;

            // RESTORED FEATURE: Hide if the Original Poster (Thread Creator) is ignored
            if (users.length > 0) {
                const dataAuthor = threadItem.getAttribute('data-author');
                let opName = dataAuthor ? dataAuthor.trim().toLowerCase() : null;
                
                if (!opName) {
                    const opEl = threadItem.querySelector('.structItem-parts .username');
                    if (opEl) opName = opEl.textContent.trim().toLowerCase();
                }

                if (opName && users.includes(opName)) {
                    hideThread = true;
                }
            }

            // Feature: Hide ignored threads by exact Thread ID
            if (!hideThread && threads.length > 0) {
                const titleLinks = threadItem.querySelectorAll('.structItem-title a');
                const mainTitleLink = Array.from(titleLinks).find(a => !a.classList.contains('labelLink'));
                
                if (mainTitleLink) {
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

            // RECENT FEATURE: Hide thread in 'New Posts' if the LAST poster is ignored
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
