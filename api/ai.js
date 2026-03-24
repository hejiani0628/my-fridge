module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "API 已就绪，请发送 POST 请求" });
  }

  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "未收到图片数据" });

  try {
    const response = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.DASHSCOPE_API_KEY}`,
          "X-DashScope-SSE": "disable"
        },
        body: JSON.stringify({
          model: "qwen-vl-plus",
          input: {
            messages: [
              {
                role: "user",
                content: [
                  { text: "请识别图中的食物。仅返回 JSON 格式：{\"name\": \"食物名称\", \"days\": 建议天数, \"category\": \"类别\"}。不要包含任何解释或 Markdown 标签。" },
                  { image: image }
                ]
              }
            ]
          },
          parameters: { result_format: "message" }
        })
      }
    );

    const data = await response.json();
    
    // 如果阿里云报错，直接返回它的错误信息方便排查
    if (!response.ok) {
      return res.status(response.status).json({ error: "阿里云接口错误", details: data });
    }

    const text = data?.output?.choices?.[0]?.message?.content?.[0]?.text || "";
    
    // 更加稳健的 JSON 提取：只取 {} 之间的内容
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let result;
    
    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch (e) {
        throw new Error("AI 返回格式无法解析");
      }
    } else {
      throw new Error("AI 未返回有效的 JSON 对象");
    }

    res.status(200).json(result);

  } catch (err) {
    console.error("后端错误:", err);
    res.status(500).json({ 
      error: "识别失败", 
      message: err.message,
      tip: "请检查图片是否过大或 API Key 是否有效"
    });
  }
};
