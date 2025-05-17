## g7-chat

> "You wanted control. You got it."

**g7-chat** is *your* AI chat interface. No fluff. No nonsense. Just raw power behind a keyboard. Built to be fast, clean, and yours. It's like yet another AI chat wrapper — but stripped down, self-owned, and unapologetically efficient.



### Features

* **Pin Chats**
  Keep important conversations easily accessible by pinning them to the top.

* **Save Chat History**
  All past conversations are automatically saved and available for future reference.

* **Responsive Desktop UI**
  Designed for a seamless experience across various desktop environments and window managers.

* **Editable Chat Titles**
  Rename chats to stay organized and enhance discoverability.

* **Full CRUD Support**
  Create, read, update, and delete chats with a smooth and intuitive interface.

---
## Running Locally

1. Copy `.env.example` to `.env` and drop in your secrets — no excuses.
2. Run `pnpm install` — lock down your dependencies like you own this machine.
3. Run `pnpm dev` — fire up the server and take control.

Open [localhost:3000](http://localhost:3000) and start breaking the system… or building something better.

---
## Roadmap

### Phase 1: Core Enhancements

* Enable message editing and retrying AI responses
* Save user input locally to support persistence and recovery
* Add data export functionality in JSON format

### Phase 2: User Management

* Implement user profile management features:

  * Change user display name
  * Delete user accounts
  * Configure chatbot response styles and user display names (e.g., unopinionated, factual, friendly)

### Phase 3: Data Synchronization

* Build a robust sync system to keep client and server data in sync

### Phase 4: Project & Collaboration Features

* Introduce grouping of threads into Projects for better organization
* Enable sharing of threads or Projects with others
