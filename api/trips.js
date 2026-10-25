const { getDb, send, text } = require("./_db");

module.exports = async function handler(req, res) {
  try {
    const db = getDb();

    if (req.method === "GET") {
      const { data, error } = await db
        .from("trips")
        .select(
          "id,destination,eta,status,created_at,completed_at"
        )
        .order("created_at", { ascending: false })
        .limit(25);

      if (error) throw error;
      return send(res, 200, data);
    }

    if (req.method === "POST") {
      const destination = text(
        req.body?.destination,
        160
      );

      const eta = text(req.body?.eta, 40) || null;

      if (!destination) {
        return send(res, 400, {
          error: "Enter a destination."
        });
      }

      const { data, error } = await db
        .from("trips")
        .insert({
          destination,
          eta,
          status: "active"
        })
        .select("*")
        .single();

      if (error) throw error;
      return send(res, 201, data);
    }

    res.setHeader("Allow", "GET, POST");
    return send(res, 405, {
      error: "Method not allowed."
    });
  } catch (e) {
    console.error("trips API error:", e.message);

    return send(res, e.status || 500, {
      error: e.status
        ? e.message
        : "Database request failed. Check Supabase configuration and table setup."
    });
  }
};
