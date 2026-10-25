const { createClient } = require("@supabase/supabase-js");

function getDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const error = new Error(
      "Database is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
    error.status = 500;
    throw error;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function send(res, status, body) {
  return res.status(status).json(body);
}

function text(value, max = 160) {
  return typeof value === "string"
    ? value.trim().slice(0, max)
    : "";
}

module.exports = { getDb, send, text };
