# MyBroadband Super Filter 🛡️

**One plugin to rule them all.** A powerful, lightweight browser extension for MyBroadband.co.za that gives you complete control over your forum feed. Block specific threads, entire sections, or annoying spammers—all from a single, modern interface.

![MyBB Filter Icon](icon.svg)

## ✨ Features

* **🚫 Block Threads:** Hide specific discussions from the main list and "New Posts."
* **📂 Block Sections:** Wipe entire sub-forums (e.g., "Off-Topic") from your homepage and activity feeds.
* **👤 Block Users:** Completely vanish threads started by specific users, AND hide their posts inside other threads.
* **⚡ Lightweight:** Runs locally in your browser with no tracking or external ads.
* **🔁 Real-Time:** Content disappears instantly; no page refresh required.

---

## 📥 Installation Guide

This extension works on **Brave**, **Chrome**, **Edge**, and **Opera**.

### Step 1: Download
1.  Download the **`mybb-super-filter.zip`** file from the Releases section (or the button above).
2.  **Unzip** the file into a folder on your computer (e.g., in your `Documents` folder).
    * *Note: You cannot delete this folder after installation, so put it somewhere safe!*

### Step 2: Install in Browser
1.  Open your browser and navigate to the Extensions page:
    * **Chrome/Brave:** Copy/paste `chrome://extensions` into the address bar.
    * **Edge:** Copy/paste `edge://extensions` into the address bar.
2.  Enable **Developer Mode**:
    * Look for a toggle switch in the top-right (Chrome/Brave) or bottom-left (Edge) and turn it **ON**.
3.  Load the Extension:
    * Click the **"Load unpacked"** button.
    * Select the folder you just unzipped (the one containing `manifest.json`).

✅ **Success!** You should now see the blue MyBB Filter icon in your toolbar. Pin it for easy access!

---

## 📖 How to Use

Click the extension icon to open the **Super Filter Dashboard**. There are three tabs:

### 1. Threads Tab
* **What it does:** Hides specific threads from forum lists and "New Posts".
* **How to use:** 1.  Copy the **Thread ID** from the URL (e.g., in `threads/topic-name.123456/`, the ID is `123456`).
    2.  Paste it into the box and click **Block Thread**.

### 2. Sections Tab
* **What it does:** Hides entire forum categories from the homepage and filters their content out of "New Posts".
* **How to use:**
    1.  Hover over a forum title (e.g., "Hardware").
    2.  Look at the URL for the **Node ID** (e.g., in `forums/hardware.152/`, the ID is `152`).
    3.  Enter `152` and click **Block Section**.

### 3. Users Tab
* **What it does:** The "Nuclear Option". Hides any thread started by this user, and hides their replies in other threads.
* **How to use:**
    1.  Enter the **exact username** (spelling matters!).
    2.  Click **Block User**.

---

## 📂 Files Included
If you are a developer or just curious, here is what is inside the `mybb-super-filter.zip`:

* `manifest.json` - The extension configuration.
* `popup.html` - The user interface.
* `popup.js` - The logic for saving/loading your block lists.
* `content.js` - The engine that runs on My
