export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { image } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "识别图片里的食物，并返回JSON：{name, days, category}"
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    const text = data.choices?.[0]?.message?.content;

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = {
        name: "未知",
        days: 3,
        category: "其他"
      };
    }

    res.status(200).json(result);

  } catch (e) {
    res.status(500).json({ error: "AI失败" });
  }
}
add ai api
