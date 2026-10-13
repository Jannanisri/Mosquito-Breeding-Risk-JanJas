# MosqGuard — Premium IoT Monitoring Platform

> **Tagline:** *"Monitor Stagnant Water. Identify Risk. Act Early."*

MosqGuard is an IoT-based mosquito-breeding risk monitoring prototype engineered for college project presentations and real-world environmental intelligence demonstrations. It connects with an **Arduino Uno R3**, **DHT11 temperature & humidity sensor**, **warning LED (Pin D7)**, and **piezo buzzer (Pin D8)**.

---

## 🌟 Monitored Features

The dashboard focuses exclusively on three environmental parameters:
1. **Temperature (°C)** — Real-time ambient temperature with threshold indicator at 25.0°C.
2. **Humidity (%)** — Relative ambient humidity percentage.
3. **Mosquito Breeding Risk** — Evaluated in real-time according to the exact prototype rule:
   - **`≥ 25.0 °C`** → **`RISK ALERT`** (Warm amber warning glow, alert banner, optional sound chime)
   - **`< 25.0 °C`** → **`NO RISK`** (Calm emerald status)
   - **`= 25.0 °C`** → **`RISK ALERT`** (Exact boundary condition)
   - **Missing / Invalid** → **`WAITING FOR VALID DATA`** (Never marked as safe on missing data)

---

## 🔬 Prototype Risk Logic & Scientific Disclaimer

- **Trigger Alert Message:**
  > *"Temperature-based mosquito-breeding risk detected. Check the area for stagnant water and take appropriate preventive action."*
- **Safe Message:**
  > *"No temperature-based risk detected by the current prototype rule."*
- **Academic Limitation Note:**
  > *"Important: This is a simplified temperature-based demonstration rule, not proof that water contains mosquito eggs or larvae. Temperature alone does not confirm mosquito breeding."*
- **Hardware Local Control Note:**
  > *"LED and buzzer are controlled locally by the Arduino."*

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, Glassmorphism, Deep forest green dark theme (`#050b07`)
- **Icons:** Lucide React
- **Animations:** Custom CSS physics & vector keyframes
- **Hardware Layer:** Web Serial API (`navigator.serial`) + WebSocket Bridge (`ws://`)
- **Sound Alert:** Web Audio API synthesizer (no external audio assets required)

---

## 🦟 Custom Mosquito Cursor

- Lightweight SVG mosquito silhouette rendered with wings, proboscis, thorax, and slender legs.
- Rotates smoothly in the direction of mouse movement using velocity interpolation (`requestAnimationFrame`).
- Interactive hover scaling and targeting ring over buttons and interactive controls.
- Automatically disabled on touchscreens, mobile devices, and systems with `prefers-reduced-motion`.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)

### 2. Installation
Open PowerShell or your terminal in the project directory:

```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open `http://localhost:5173` (or the port indicated in the terminal) in Google Chrome or Microsoft Edge.

### 4. Build for Production
```bash
npm run build
```

---

## 🔌 Hardware Architecture & Wiring

### Component Pin Mapping:
| Component | Component Pin | Arduino Uno R3 Pin | Function / Notes |
| :--- | :--- | :--- | :--- |
| **DHT11 Sensor** | DATA (Out) | **Digital Pin D2** | 10kΩ pull-up to 5V |
| **DHT11 Sensor** | VCC / GND | **5V & GND** | Power rails |
| **Warning LED** | Anode (+) | **Digital Pin D7** | 220Ω resistor |
| **Warning Buzzer** | Positive (+) | **Digital Pin D8** | Piezo buzzer |
| **Common Ground** | Cathodes (-) | **GND** | Shared ground |

### Arduino Uno Sketch (`.ino`):
A ready-to-flash sketch is included directly in the **"Arduino Uno R3"** modal in the web interface and in `src/components/HardwareModal.tsx`.

---

## 🧪 Demonstration Modes

### 1. Demo Mode (No Hardware Needed)
- **High Risk Preset (>25°C):** 28.4°C, 72% → Triggers `RISK ALERT` with amber banner and sound.
- **Safe Preset (<25°C):** 22.2°C, 58% → Displays `NO RISK`.
- **Exact Boundary Preset (25.0°C):** Demonstrates that 25.0°C immediately triggers `RISK ALERT`.
- **Faulty / Missing Data Preset:** Demonstrates that invalid readings transition to `WAITING FOR VALID DATA`.
- **Live Sliders:** Test any custom temperature or humidity in real time.

### 2. Live Hardware Mode
- Click **"Arduino Uno R3"** → **"Connect Arduino Uno (USB Serial)"**.
- Select the COM port corresponding to your Arduino Uno in Chrome/Edge.
- Live data from the DHT11 will update the cards in real time at 9600 baud!
