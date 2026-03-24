export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { image } = req.body;

  // 优化：增加图片输入校验
  if (!image) {
    return res.status(400).json({ error: "No image data provided" });
  }

  try {
    const response = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.DASHSCOPE_API_KEY}`,
          // 建议显式关闭 SSE，确保拿到的是完整 JSON 响应
          "X-DashScope-SSE": "disable" 
        },
        body: JSON.stringify({
          model: "qwen-vl-plus",
          input: {
            messages: [
              {
                role: "user",
                content: [
                  { text: "你是一个专业的食品识别AI。请识别图片中的主要食物，并严格返回JSON：{\"name\": \"食物名称\", \"days\": 保质期天数, \"category\": \"分类\"}。不要解释，不要多余文字。" },
                  { image: image } // 确保前端传的是公网 URL 或 base64
                ]
              }
            ]
          },
          parameters: {
            // 优化：告诉阿里云我们要消息模式的输出
            result_format: "message"
          }
        })
      }
    );

    const data = await response.json();

    // 容错处理：如果阿里云 API 报错（如 Key 无效或余额不足）
    if (!response.ok) {
      console.error("Alibaba Cloud Error:", data);
      return res.status(response.status).json({ error: "API调用失败", details: data.message });
    }

    let text = data?.output?.choices?.[0]?.message?.content?.[0]?.text || "";

    // 清理 Markdown 代码块标签
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.warn("JSON Parse Failed, Raw Text:", text);
      result = { name: "识别失败", days: 3, category: "其他" };
    }

    res.status(200).json(result);

  } catch (err) {
    console.error("Server Crash:", err);
    res.status(500).json({ error: "AI识别失败", message: err.message });
  }
}
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
