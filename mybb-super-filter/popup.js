document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    // --- standard manager for Users and Sections (Arrays of Strings) ---
    function setupSimpleList(storageKey, inputId, btnId, listId, emptyId) {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        const list = document.getElementById(listId);
        const emptyMsg = document.getElementById(emptyId);

        function loadItems() {
            chrome.storage.sync.get([storageKey], (data) => {
                const items = data[storageKey] || [];
                list.innerHTML = '';
                if (items.length === 0) {
                    emptyMsg.style.display = 'block';
                } else {
                    emptyMsg.style.display = 'none';
                    items.forEach(item => {
                        const li = document.createElement('li');
                        li.innerHTML = `<span class="item-text">${item}</span>`;
                        const removeBtn = document.createElement('button');
                        removeBtn.textContent = 'Unblock';
                        removeBtn.className = 'remove-btn';
                        removeBtn.addEventListener('click', () => {
                            let updated = items.filter(i => i !== item);
                            chrome.storage.sync.set({ [storageKey]: updated }, loadItems);
                        });
                        li.appendChild(removeBtn);
                        list.appendChild(li);
                    });
                }
            });
        }

        btn.addEventListener('click', () => {
            const val = input.value.trim();
            if (val) {
                chrome.storage.sync.get([storageKey], (data) => {
                    const items = data[storageKey] || [];
                    if (!items.some(i => i.toLowerCase() === val.toLowerCase())) {
                        items.push(val);
                        chrome.storage.sync.set({ [storageKey]: items }, () => {
                            input.value = '';
                            loadItems();
                        });
                    } else {
                        input.value = ''; 
                    }
                });
            }
        });
        
        input.addEventListener('keypress', (e) => { if(e.key === 'Enter') btn.click(); });
        loadItems();
    }

    // --- custom manager for Threads (Array of Objects) ---
    function setupThreadList() {
        const idInput = document.getElementById('threadIdInput');
        const descInput = document.getElementById('threadDescInput');
        const btn = document.getElementById('addThreadBtn');
        const list = document.getElementById('threadList');
        const emptyMsg = document.getElementById('threadEmpty');

        function loadThreads() {
            chrome.storage.sync.get(['ignoredThreads'], (data) => {
                const threads = data.ignoredThreads || [];
                list.innerHTML = '';
                if (threads.length === 0) {
                    emptyMsg.style.display = 'block';
                } else {
                    emptyMsg.style.display = 'none';
                    threads.forEach(thread => {
                        const li = document.createElement('li');
                        
                        // Structure: ID bolded, description underneath
                        const textContainer = document.createElement('div');
                        textContainer.className = 'item-text';
                        textContainer.innerHTML = `<strong>ID: ${thread.id}</strong> <span class="thread-desc">${thread.desc || 'No description'}</span>`;
                        
                        const removeBtn = document.createElement('button');
                        removeBtn.textContent = 'Unblock';
                        removeBtn.className = 'remove-btn';
                        removeBtn.addEventListener('click', () => {
                            let updated = threads.filter(t => t.id !== thread.id);
                            chrome.storage.sync.set({ ignoredThreads: updated }, loadThreads);
                        });

                        li.appendChild(textContainer);
                        li.appendChild(removeBtn);
                        list.appendChild(li);
                    });
                }
            });
        }

        btn.addEventListener('click', () => {
            // strip out anything that isn't a number just in case you paste a URL by accident
            const rawId = idInput.value.trim();
            const cleanId = rawId.replace(/\D/g, ''); 
            const desc = descInput.value.trim();

            if (cleanId) {
                chrome.storage.sync.get(['ignoredThreads'], (data) => {
                    const threads = data.ignoredThreads || [];
                    if (!threads.some(t => t.id === cleanId)) {
                        threads.push({ id: cleanId, desc: desc });
                        chrome.storage.sync.set({ ignoredThreads: threads }, () => {
                            idInput.value = '';
                            descInput.value = '';
                            loadThreads();
                        });
                    } else {
                        idInput.value = '';
                        descInput.value = '';
                    }
                });
            }
        });

        idInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') btn.click(); });
        descInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') btn.click(); });

        loadThreads();
    }

    // Initialize all three
    setupSimpleList('ignoredUsers', 'userInput', 'addUserBtn', 'userList', 'userEmpty');
    setupSimpleList('ignoredSections', 'sectionInput', 'addSectionBtn', 'sectionList', 'sectionEmpty');
    setupThreadList();
});
