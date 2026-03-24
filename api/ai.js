module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "API 已就绪，请发送 POST 请求进行识别" });
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
                  { text: "识别图中的食物，只返回JSON：{\"name\": \"名称\", \"days\": 数字, \"category\": \"类别\"}" },
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
    const text = data?.output?.choices?.[0]?.message?.content?.[0]?.text || "";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    
    res.status(200).json(JSON.parse(cleanJson));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "识别失败", details: err.message });
  }
};
