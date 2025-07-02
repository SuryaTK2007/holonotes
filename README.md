📝 HoloNotes
HoloNotes is a decentralized, peer-to-peer note-taking app built on the Holochain framework. It allows users to create, edit, and manage personal notes — with all data stored locally and shared via a distributed hash table (DHT), not a central server.

Built with ❤️ by Surya

🌐 Live Demo (Coming Soon)
This app is fully local-first and works with Holochain conductor sandbox.

🚀 Features
✅ Create, view, update, and delete notes
🔐 Each note is linked to your agent (public key-based identity)
📡 Real-time signals: live updates from other agents
🌍 Fully decentralized — no central database
⚡ Built-in WebAssembly Zome logic (Rust) and React UI (TypeScript)
🧩 Modular, extensible design — ready for encryption, profiles, tags, etc.
📦 Tech Stack
Layer	Tech
Backend	Holochain DNA (Rust Zomes)
Frontend	React + TypeScript
Networking	Conductor WebSocket API
Packaging	.dna, .happ, and .webhapp bundles
Styling	Custom CSS (can upgrade to Tailwind)
📁 Project Structure
.
├── ui/              # React frontend
├── zomes/notes/     # Rust zome logic for note management
├── dnas/notes/      # DNA configuration
├── workdir/         # Built hApp files (.dna, .happ)
├── Cargo.toml       # Rust project config
├── README.md        # This file

🧪 Running Locally
Prerequisites:
🧬 Holochain + Holonix

🧱 nix and hc command

🌐 Node.js (for frontend)

Step 1: Build the DNA & hApp

CARGO_TARGET_DIR=target cargo build --release --target wasm32-unknown-unknown hc dna pack dnas/notes/workdir hc app pack workdir

Step 2: Run the Conductor

hc sandbox generate workdir/holonotes.happ --run

Step 3: Start the Frontend

cd ui npm install npm run dev

Frontend runs on http://localhost:5173/

🛠 Future Plans:
👤 Agent profile integration

🔐 End-to-end encryption

🏷️ Tag-based note filtering

🧪 UI test coverage

📦 Deploy as WebhApp

📄 License
MIT License — free to use, fork, and build on. Attribution appreciated.

👋 Let’s Connect
Built by Surya, an engineering student exploring decentralized systems and future-proof technologies.