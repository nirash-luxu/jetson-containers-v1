const OLLAMA_URL = "http://127.0.0.1:11434/api/generate"; // Replace the Real IP `hostname -I`
const MODEL_NAME = "qwen2.5:1.5b"; // Replace with a Existing Model

async function askOllama(promptText) {
  try {
    console.log(`Sending prompt to Jetson GPU: "${promptText}"\n`);

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: promptText,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("OLLAMA RESPONSE:\n", data.response);
  } catch (error) {
    console.error("Communication Error:", error.message);
  }
}

askOllama("Explain quantum computing in one short sentence.");
