const { getDb, send, text } = require("./_db");

module.exports = async function handler(req, res) {
  try {
    const db = getDb();

    if (req.method === "GET") {
      const { data, error } = await db
        .from("alerts")
        .select(
          "id,message,latitude,longitude,status,created_at"
        )
        .order("created_at", { ascending: false })
        .limit(25);

      if (error) throw error;
      return send(res, 200, data);
    }

    if (req.method === "POST") {
      const message = text(
        req.body?.message || "Demo SOS pressed",
        300
      );

      const lat = req.body?.latitude;
      const lon = req.body?.longitude;

      const valid = (n, min, max) =>
        n === undefined ||
        n === null ||
        (
          typeof n === "number" &&
          Number.isFinite(n) &&
          n >= min &&
          n <= max
        );

      if (!valid(lat, -90, 90) || !valid(lon, -180, 180)) {
        return send(res, 400, {
          error: "Invalid location coordinates."
        });
      }

      const { data, error } = await db
        .from("alerts")
        .insert({
          message,
          latitude: lat ?? null,
          longitude: lon ?? null,
          status: "DEMO_ONLY_NOT_SENT"
        })
        .select(
          "id,message,latitude,longitude,status,created_at"
        )
        .single();

      if (error) throw error;
      return send(res, 201, data);
    }

    res.setHeader("Allow", "GET, POST");
    return send(res, 405, {
      error: "Method not allowed."
    });
  } catch (e) {
    console.error("alerts API error:", e.message);

    return send(res, e.status || 500, {
      error: e.status
        ? e.message
        : "Database request failed. Check Supabase configuration and table setup."
    });
  }
};
