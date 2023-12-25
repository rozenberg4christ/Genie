const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function run(message: Object) {
  const modelsAvailable = ["gemini-pro", "gemini-pro-vision"];

  const modelChoice =
    Object.keys(message).length === 1 ? modelsAvailable[0] : modelsAvailable[1];

  const model = genAI.getGenerativeModel({ model: modelChoice });

  if (modelChoice === "gemini-pro-vision") {
    const prompt = (message as { text: string }).text;

    console.log("The Message is :", message);
    console.log("The Prompt is :", prompt);

    const imageParts = (message as { image: Array<Object> }).image;

    console.log("The Image Parts are :", imageParts);

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response?.text();
  } else {
    const prompt = (message as { text: string }).text;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response?.text();

    return text;
  }
}
