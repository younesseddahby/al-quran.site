import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(
      `You are an Islamic assistant. Answer the following question according to Islamic teachings and the Quran. Question: ${question}`
    );

    const text = result.response.text();

    res.status(200).json({ answer: text });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "AI assistant failed"
    });

  }

}