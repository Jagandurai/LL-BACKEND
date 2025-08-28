app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS currentTime");
    res.json({ success: true, time: rows[0].currentTime });
  } catch (error) {
    console.error("DB test failed:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
