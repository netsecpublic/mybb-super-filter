// Tab Switching Logic
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Storage Keys
const KEYS = { threads: 'blockedThreads', sections: 'blockedSections', users: 'blockedUsers' };

// Render Lists
const render = (type, listId) => {
  const container = document.getElementById(listId);
  chrome.storage.local.get({ [KEYS[type]]: [] }, (data) => {
    const list = data[KEYS[type]];
    container.innerHTML = list.length ? '' : '<div style="padding:10px;text-align:center;color:#999;">No blocks active</div>';
    
    list.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'item';
      // Users are strings, others are objects
      const display = type === 'users' ? item : `${item.name || item.id} <span style="color:#999;font-size:10px;">(${item.id})</span>`;
      
      div.innerHTML = `<div>${display}</div><button class="remove-btn" data-type="${type}" data-index="${index}">X</button>`;
      container.appendChild(div);
    });
  });
};

// Add Item Logic
const addItem = (type, item) => {
  chrome.storage.local.get({ [KEYS[type]]: [] }, (data) => {
    const newList = [...data[KEYS[type]], item];
    chrome.storage.local.set({ [KEYS[type]]: newList }, () => render(type, type === 'users' ? 'user-list' : type === 'threads' ? 'thread-list' : 'section-list'));
  });
};

// Event Listeners for Adding
document.getElementById('btn-add-thread').onclick = () => {
  const id = document.getElementById('t-id').value.trim();
  const name = document.getElementById('t-name').value.trim();
  if (id) { addItem('threads', { id, name }); document.getElementById('t-id').value = ''; }
};

document.getElementById('btn-add-section').onclick = () => {
  const id = document.getElementById('s-id').value.trim();
  const name = document.getElementById('s-name').value.trim();
  if (id) { addItem('sections', { id, name }); document.getElementById('s-id').value = ''; }
};

document.getElementById('btn-add-user').onclick = () => {
  const name = document.getElementById('u-name').value.trim();
  if (name) { addItem('users', name); document.getElementById('u-name').value = ''; }
};

// Remove Item Logic
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const type = e.target.dataset.type;
    const index = e.target.dataset.index;
    chrome.storage.local.get({ [KEYS[type]]: [] }, (data) => {
      const newList = data[KEYS[type]].filter((_, i) => i != index);
      chrome.storage.local.set({ [KEYS[type]]: newList }, () => render(type, type === 'users' ? 'user-list' : type === 'threads' ? 'thread-list' : 'section-list'));
    });
  }
});

// Initial Render
render('threads', 'thread-list');
render('sections', 'section-list');
render('users', 'user-list');