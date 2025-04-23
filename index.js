const express = require("express");
const db = require("./db");
const app = express();
app.use(express.json());
require("dotenv").config();


app.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: "School added", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
});


app.get("/listSchools", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude and longitude required" });
  }

  try {
    const [schools] = await db.execute("SELECT * FROM schools");
    const withDistance = schools.map((school) => {
      const distance = Math.sqrt(
        Math.pow(school.latitude - lat, 2) + Math.pow(school.longitude - lng, 2)
      );
      return { ...school, distance };
    });

    withDistance.sort((a, b) => a.distance - b.distance);
    res.json(withDistance);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schools", error });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
