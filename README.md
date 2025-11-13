# 🌬️ WindBorne Constellation — Last 24 Hours  
### Real-Time Balloon Tracking Dashboard with Live Weather Integration  
**Created by: Megha Patel**

---

## 🚀 Overview

This project visualizes the **last 24 hours of WindBorne Systems' global weather balloon telemetry**.  
Each hour’s balloon snapshot is fetched from:

```
https://a.windbornesystems.com/treasure/00.json
https://a.windbornesystems.com/treasure/01.json
...
https://a.windbornesystems.com/treasure/23.json
```

Because the API is **undocumented, inconsistent, and sometimes corrupted**, a fully **robust normalization layer** is implemented to safely parse any data it returns.

To enrich the balloon data, the project also integrates the **Open-Meteo API**, which provides **real-time weather** at each balloon’s latest location.

The final result is an interactive dashboard showing:

- Balloon positions from the last 24 hours  
- Individual balloon history trails  
- Live temperature, windspeed, and weather codes  
- Refresh controls  
- Ability to filter by balloon ID  

---

## 🎈 Why Combine Balloon Telemetry with Weather?

WindBorne’s balloons float at various altitudes, collecting atmospheric data.  
Weather conditions such as **temperature, wind direction, and windspeed** influence balloon drift.

By combining both datasets, we can:

- Understand atmospheric behavior around each balloon  
- Visualize evolving weather systems  
- Inspect high-altitude dynamics vs. surface weather  
- Gain insight into environmental factors affecting balloon flight  

This project demonstrates the real-world challenge of **merging telemetry streams with external environmental datasets.**

---

## 📡 Data Pipeline Architecture

### **1. Fetch 24 hours of telemetry (00–23)**
The app requests all 24 endpoints in parallel.

Telemetry may be:

- Arrays like `[lat, lon, alt]`  
- Objects with inconsistent property names  
- Nested structures  
- Corrupted JSON  
- Empty files  

### **2. Robust normalization**
A custom normalization function safely:

- Parses malformed JSON  
- Detects the WindBorne array format  
- Extracts `lat`, `lon`, `alt`  
- Extracts or synthesizes IDs  
- Applies timestamps when available  
- Tags data with `hourIndex` for sorting  

### **3. Build balloon tracks**
Telemetry is grouped by balloon ID:

```json
{
  "id": "WB-5-0",
  "latestLat": -11.89,
  "latestLon": 63.25,
  "history": [
    { "lat": -11.89, "lon": 63.25, "ts": null, "h": 5 },
    ...
  ]
}
```

### **4. Fetch real-time weather for each balloon**
Using:

```
https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current_weather=true
```

Weather includes:

- temperature  
- windspeed  
- winddirection  
- weathercode  

### **5. Render results in React**
Components include:

- **Controls** → Refresh button + balloon filter  
- **BalloonList** → Display balloon entries  
- **ErrorBanner** → Show warnings for corrupted files  

---

## ☁️ Sample Weather Response

```json
{
  "latitude": 63.5,
  "longitude": -59.375,
  "current_weather": {
    "temperature": 1.3,
    "windspeed": 55.1,
    "winddirection": 187,
    "weathercode": 2
  }
}
```

---

## ⚠️ Important Note About CORS

WindBorne’s API **does not include CORS headers**, so:

- All data loads **perfectly when running locally**
- Browser fetches from deployed front-end apps are **blocked**
- This is a **limitation of the public API**, not the project

WindBorne engineers can test the code directly from GitHub without any restrictions.

This project intentionally remains **front-end–only**, as the challenge does not require implementing a backend proxy.

---

## 🛠 Tech Stack

- **React (CRA)**
- **JavaScript (ES6+)**
- **Open-Meteo API**
- **WindBorne Telemetry API**
- **CSS for styling**
- **Vercel for hosting**

---

## 📂 Project Structure

```
src/
 ├─ components/
 │   ├─ BalloonList.js
 │   ├─ Controls.js
 │   └─ ErrorBanner.js
 ├─ lib/
 │   ├─ windborneApi.js     ← robust WindBorne parser
 │   ├─ externalApi.js      ← Open-Meteo integration
 │   └─ dataUtils.js
 ├─ App.js
 └─ index.js
```

---

## ▶️ Running Locally

```bash
git clone https://github.com/Megha2707Patel/windborne-challenge.git
cd windborne-challenge
npm install
npm start
```

Open:

```
http://localhost:3000
```

Local runs avoid all CORS issues and show full data.

---

## 🔮 Future Improvements

- Interactive map using Leaflet or Mapbox  
- Altitude charts & weather trend graphs  
- Server-side proxy to bypass CORS (optional)  
- Global wind field visualization  
- Balloon drift prediction models  

---

## 🧑‍💻 About Me

I’m passionate about building **interactive, data-driven web applications** and solving real-world problems with clean engineering and thoughtful UI design.

This project was a perfect blend of:

- Real-time APIs  
- Geospatial data  
- Weather analytics  
- Resilient data parsing  
- Front-end engineering  

If you'd like to explore more of my work:  
**Portfolio:** https://megha-patel-portfolio.vercel.app/

