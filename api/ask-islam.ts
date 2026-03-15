export default async function handler(req, res) {
  res.status(410).json({ error: "This endpoint is deprecated. Gemini API calls must be made from the frontend." });
}
