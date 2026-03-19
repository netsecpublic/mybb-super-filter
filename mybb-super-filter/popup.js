// popup.js

document.addEventListener('DOMContentLoaded', () => {
    // Master Toggle
    const masterToggle = document.getElementById('masterToggle');
    chrome.storage.sync.get(['filterEnabled'], (data) => {
        masterToggle.checked = data.filterEnabled !== false;
    });
    masterToggle.addEventListener('change', (e) => {
        chrome.storage.sync.set({ filterEnabled: e.target.checked });
    });

    // Tab Switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    // --- standard manager for Users (Arrays of Strings) ---
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
                            input.value = ''; loadItems();
                        });
                    } else { input.value = ''; }
                });
            }
        });
        
        input.addEventListener('keypress', (e) => { if(e.key === 'Enter') btn.click(); });
        loadItems();
    }

    // --- reusable manager for Threads & Sections (Arrays of Objects {id, desc}) ---
    function setupIdDescList(storageKey, idInputId, descInputId, btnId, listId, emptyId) {
        const idInput = document.getElementById(idInputId);
        const descInput = document.getElementById(descInputId);
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
                        const textContainer = document.createElement('div');
                        textContainer.className = 'item-text';
                        textContainer.innerHTML = `<strong>ID: ${item.id}</strong> <span class="desc-text">${item.desc || 'No description'}</span>`;
                        
                        const removeBtn = document.createElement('button');
                        removeBtn.textContent = 'Unblock';
                        removeBtn.className = 'remove-btn';
                        removeBtn.addEventListener('click', () => {
                            let updated = items.filter(t => t.id !== item.id);
                            chrome.storage.sync.set({ [storageKey]: updated }, loadItems);
                        });

                        li.appendChild(textContainer);
                        li.appendChild(removeBtn);
                        list.appendChild(li);
                    });
                }
            });
        }

        btn.addEventListener('click', () => {
            const cleanId = idInput.value.trim().replace(/\D/g, ''); 
            const desc = descInput.value.trim();

            if (cleanId) {
                chrome.storage.sync.get([storageKey], (data) => {
                    const items = data[storageKey] || [];
                    if (!items.some(t => t.id === cleanId)) {
                        items.push({ id: cleanId, desc: desc });
                        chrome.storage.sync.set({ [storageKey]: items }, () => {
                            idInput.value = ''; descInput.value = ''; loadItems();
                        });
                    } else { idInput.value = ''; descInput.value = ''; }
                });
            }
        });

        idInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') btn.click(); });
        descInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') btn.click(); });
        loadItems();
    }

    // Initialize UI
    setupSimpleList('ignoredUsers', 'userInput', 'addUserBtn', 'userList', 'userEmpty');
    setupIdDescList('ignoredThreads', 'threadIdInput', 'threadDescInput', 'addThreadBtn', 'threadList', 'threadEmpty');
    setupIdDescList('ignoredSections', 'sectionIdInput', 'sectionDescInput', 'addSectionBtn', 'sectionList', 'sectionEmpty');

    // --- Export / Import Backup Logic ---
    document.getElementById('exportBtn').addEventListener('click', () => {
        chrome.storage.sync.get(null, (data) => {
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mybb_filter_backup.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    
    importBtn.addEventListener('click', () => importFile.click());
    
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                chrome.storage.sync.set(data, () => {
                    alert('Backup imported successfully!');
                    window.location.reload(); 
                });
            } catch (err) {
                alert('Error: Invalid backup file.');
            }
        };
        reader.readAsText(file);
    });
});