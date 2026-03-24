module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { image } = req.body; // 确保前端传过来的是图片的 URL

  try {
    const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 注意：环境变量名确保在 Vercel 后台配置一致
        "Authorization": `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        // 阿里云原生接口通常需要这个 header
        "X-DashScope-SSE": "disable" 
      },
      body: JSON.stringify({
        model: "qwen-vl-plus",
        input: {
          messages: [
            {
              role: "user",
              content: [
                { text: "请识别图片中的食物，仅返回如下格式的JSON数据，不要包含Markdown代码块或任何解释：{\"name\": \"食物名称\", \"days\": 建议存放天数, \"category\": \"分类\"}" },
                { image: image } // 阿里云支持 Base64 或 公网 URL
              ]
            }
          ]
        },
        parameters: {
          // 强制模型输出更像 JSON
          result_format: "message"
        }
      })
    });

    const data = await response.json();

    // 阿里云的返回路径通常是 data.output.choices[0].message.content[0].text
    const text = data?.output?.choices?.[0]?.message?.content?.[0]?.text;

    if (!text) {
      console.error("阿里云返回异常:", data);
      throw new Error("模型未返回有效文本");
    }

    let result;
    try {
      // 提取 JSON：防止模型返回 ```json { ... } ``` 
      const jsonString = text.replace(/```json|```/g, "").trim();
      result = JSON.parse(jsonString);
    } catch (parseError) {
      console.warn("JSON 解析失败，返回默认值:", text);
      result = {
        name: "识别失败",
        days: 0,
        category: "未知"
      };
    }

    res.status(200).json(result);

  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "AI识别失败", details: err.message });
  }
};
