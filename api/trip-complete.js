const { getDb, send, text } = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return send(res, 405, {
      error: "Method not allowed."
    });
  }

  try {
    const id = text(req.query.id, 40);

    if (!id) {
      return send(res, 400, {
        error: "Trip id is required."
      });
    }

    const db = getDb();

    const { data, error } = await db
      .from("trips")
      .update({
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("status", "active")
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return send(res, 404, {
        error: "Active trip not found."
      });
    }

    return send(res, 200, data);
  } catch (e) {
    console.error("trip-complete API error:", e.message);

    return send(res, e.status || 500, {
      error: e.status
        ? e.message
        : "Database request failed. Check Supabase configuration and table setup."
    });
  }
};
