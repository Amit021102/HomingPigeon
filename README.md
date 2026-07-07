# 🐦 HomingPigeon

HomingPigeon is a lightweight, modular, and blazingly fast text-sharing platform. Built entirely from scratch using native web technologies, the engine is architected around minimal dependency footprints, strict separation of concerns, and guaranteed data integrity.

---

### Core Features:
* **Decoupled API Architecture:** Independent data routes feeding structural frontend shells.
* **Collision-Resistant ID Engine:** A custom random allocation loop leveraging an 8-character Base62 string space ($62^8$ permutations).
* **Zero Build-Step Frontend:** Operates natively in any modern web browser using Vanilla JavaScript, semantic HTML5, and isolated CSS tokens.
* **Different Expiration options:** You can chooe between numerous options of expiration for your paste, including burn-after-read, which deletes the paste after one viewing.
* **Text Highlighting:** The app suppotrs syntax highlighting to a limited number of programming languages. If the syntax is changed from None, the receiver would view the paste with the chosen syntax highlighted.
* **Garbage Cleaning Service:** The app comes with a garbage cleaning service. Activated every minute, the service searches for expired pastes and earases them from the DB, therefore removing access to them.

---

## 🚀 Installation & Setup


No local dependencies are required other than Docker. Run the following commands from the project root:

1. **Build the image:**
```bash
docker build -t homing-pigeon .
```


2. **Run the container:**
```bash
docker run -d -p 3000:3000 --name homing_pigeon_app homing-pigeon

```


*The application will be instantly live at `http://localhost:3000`.*