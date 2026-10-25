const { getDb, send, text } = require("./_db");

module.exports = async function handler(req, res) {
  try {
    const db = getDb();

    if (req.method === "GET") {
      const { data, error } = await db
        .from("contacts")
        .select("id,name,phone,created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return send(res, 200, data);
    }

    if (req.method === "POST") {
      const name = text(req.body?.name, 80);
      const phone = text(req.body?.phone, 30);

      if (!name || !/^[+()\d\s.-]{5,30}$/.test(phone)) {
        return send(res, 400, {
          error: "Enter a name and valid phone number."
        });
      }

      const { data, error } = await db
        .from("contacts")
        .insert({ name, phone })
        .select("id,name,phone,created_at")
        .single();

      if (error) throw error;
      return send(res, 201, data);
    }

    if (req.method === "DELETE") {
      const id = text(req.query.id, 40);

      if (!id) {
        return send(res, 400, {
          error: "Contact id is required."
        });
      }

      const { error } = await db
        .from("contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return send(res, 200, { ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return send(res, 405, {
      error: "Method not allowed."
    });
  } catch (e) {
    console.error("contacts API error:", e.message);

    return send(res, e.status || 500, {
      error: e.status
        ? e.message
        : "Database request failed. Check Supabase configuration and table setup."
    });
  }
};
