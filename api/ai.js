module.exports = async function handler(req, res) {
  // 1. 限制请求方法
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { image } = req.body;

  // 检查是否传入了图片
  if (!image) {
    return res.status(400).json({ error: "缺少图片数据" });
  }

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
                text: "识别图片里的食物，并严格返回JSON格式：{\"name\": \"食物名\", \"days\": 数字, \"category\": \"类别\"}。不要包含任何Markdown标签或多余文字。"
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        // 强制要求模型输出 JSON 对象，增加稳定性
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    // 如果 OpenAI 返回错误（如 API Key 失效、余额不足等）
    if (!response.ok) {
      console.error("OpenAI Error:", data);
      return res.status(response.status).json({ error: "OpenAI 接口调用失败", details: data.error?.message });
    }

    const text = data.choices?.[0]?.message?.content;

    let result;
    try {
      // 解析 AI 返回的 JSON 字符串
      result = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON 解析失败:", text);
      result = {
        name: "识别失败",
        days: 3,
        category: "其他"
      };
    }

    // 返回最终结果
    res.status(200).json(result);

  } catch (e) {
    console.error("Server Error:", e);
    res.status(500).json({ error: "服务器内部错误", message: e.message });
  }
};
