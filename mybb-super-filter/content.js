const runFilters = () => {
  chrome.storage.local.get({ blockedThreads: [], blockedSections: [], blockedUsers: [] }, (data) => {
    const threadIds = data.blockedThreads.map(t => String(t.id));
    const sectionIds = data.blockedSections.map(s => String(s.id));
    const users = data.blockedUsers.map(u => u.toLowerCase());

    // 1. Block Sections on Homepage
    sectionIds.forEach(id => {
      const node = document.querySelector(`.node--id${id}`);
      if (node) node.style.display = 'none';
    });

    // 2. Block Threads (in lists/new posts) based on ID, Section, or Author
    const threadItems = document.querySelectorAll('.structItem--thread');
    threadItems.forEach(el => {
      // Get Thread ID
      const threadIdMatch = el.className.match(/js-threadListItem-(\d+)/) || [null, el.getAttribute('data-content-id')];
      const tID = threadIdMatch[1];
      
      // Get Section ID from class list (e.g. node--id123)
      const classList = Array.from(el.classList);
      const isBlockedSection = sectionIds.some(sID => classList.includes(`node--id${sID}`));

      // Get Author
      const author = el.getAttribute('data-author');
      const isBlockedUser = author && users.includes(author.toLowerCase());

      if ((tID && threadIds.includes(tID)) || isBlockedSection || isBlockedUser) {
        el.style.display = 'none';
      }
    });

    // 3. Block Posts inside a thread (User Block)
    const posts = document.querySelectorAll('.message');
    posts.forEach(post => {
      const author = post.getAttribute('data-author');
      if (author && users.includes(author.toLowerCase())) {
        post.style.display = 'none';
      }
    });
  });
};

// Run immediately and watch for infinite scroll
runFilters();
const observer = new MutationObserver(runFilters);
observer.observe(document.body, { childList: true, subtree: true });