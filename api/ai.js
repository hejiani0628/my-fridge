// Vercel Serverless Function
module.exports = async (req, res) => {
  // 1. 获取前端传来的参数
  const { type, image, items } = req.body;
  const apiKey = process.env.DASHSCOPE_API_KEY;

  // 检查 API Key 是否配置
  if (!apiKey) {
    return res.status(500).json({ error: "未配置 DASHSCOPE_API_KEY 环境变量" });
  }

  try {
    if (type === 'identify') {
      // --- 功能 A：AI 拍照识别食材 ---
      const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen-vl-max",
          input: {
            messages: [
              {
                role: "user",
                content: [
                  { text: "你是一个冰箱管家。请识别图中的食材，并严格按以下 JSON 格式返回，不要有其他文字：{\"name\":\"食材名称\",\"days\":建议保质天数,\"category\":\"分类(如蔬菜/肉类/水果/乳品)\"}" },
                  { image: image }
                ]
              }
            ]
          }
        })
      });

      const data = await response.json();
      
      if (data.output && data.output.choices) {
        let content = data.output.choices[0].message.content[0].text;
        // 核心修复：清理 AI 可能带出来的 Markdown 代码块标签
        const cleanJson = content.replace(/```json|```/g, '').trim();
        res.status(200).json(JSON.parse(cleanJson));
      } else {
        throw new Error("AI 识别未返回有效结果");
      }

    } else if (type === 'recipe') {
      // --- 功能 B：AI 智能菜谱生成 ---
      const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen-turbo",
          input: {
            prompt: `作为一名大厨，我有以下食材：${items}。请为我推荐一道简单好做的家常菜，要求有菜名、用料清单和简要步骤。`
          },
          parameters: {
            result_format: "text"
          }
        })
      });

      const data = await response.json();
      
      if (data.output && data.output.text) {
        res.status(200).json({ recipe: data.output.text });
      } else {
        throw new Error("菜谱生成失败");
      }
    }
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "服务器内部错误: " + err.message });
  }
};
