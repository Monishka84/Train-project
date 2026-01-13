Train-tracking-project

## 📌 Project Summary

The **Train Tracking System** is a real-time application that shows the **live location of trains**, **exact platform number**, and **accurate arrival countdown** using GPS data.
Unlike existing apps that rely on fixed schedules, this system uses **actual GPS coordinates** to determine where the train is **right now**.

## 🎯 Problem Statement

Current train apps (like m-Indicator) mainly show **timetables**, not real-time positions.These systems rely mainly on fixed schedules and manual updates, which fail to reflect real-time train movements.
This leads to:
* Confusion about delays
* Uncertainty about platforms
* Poor travel planning
There is a need for a Train Tracking System that uses live GPS data to continuously monitor the actual position of trains and provide accurate, real-time information to passengers and railway authorities through a digital interface.
Our project solves this by using **live GPS data** to track trains accurately.

## 💡 Ideation & Research (with AI Tools)

### Idea Development

* Studied existing train information apps
* Identified lack of real-time tracking
* Designed a system based on live GPS input

### AI Tools Used

* **Claude AI** – Used to frame and refine the *problem statement*, identify gaps in existing systems, and define project objectives clearly
* **Bolt** – Used to rapidly generate and design the *frontend interface*, including layout, map integration, and UI components
* **ChatGPT** – Used for system planning, architecture explanation, and documentation support

## 💼 Business Model

* **Target Users:** Daily commuters, long-distance passengers
* **Value Proposition:** Accurate, real-time train location and platform detection
* **Cost to User:** Free
* **Future Scope:** Integration with official railway systems and premium alerts

## 🏗️ System Architecture

### Hardware

* GPS Sensor (installed on train / simulated)
* ESP32 Microcontroller
* Mobile phone for GPS data collection (for testing)

### Software

* Cloud Server (receives GPS data)
* Backend logic for platform & ETA calculation
* Web/Mobile application for users

## ⚙️ Technical Implementation Details

* **Backend:** Node.js server
* **Frontend:** Web application with live map
* **Data Format:** JSON-based GPS coordinates
* **Working Flow:**

  1. GPS sends live location data
  2. Server stores and processes data
  3. Algorithm calculates nearest platform
  4. Users see live train position and ETA

## 🔧 Hardware Simulation Details

* **Simulation Method:** GPS data collected using mobile phones
* **Simulator Used:** Custom software-based simulation
* **Approach:**

  * Real GPS data collected during train rides
  * Fake trains simulated using the same route patterns
  * Data sent to server for live demo

## ✅ Conclusion

The Train Tracking System demonstrates how real-time GPS data can improve train travel experience. With real-world data collection and a working simulation, this project is practical, innovative, and suitable for competitions and smart transportation systems.
