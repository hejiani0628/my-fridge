const DashScope = require('@alicloud/dashscope');

export default async function handler(req, res) {
    // 1. 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { type, image, items } = req.body;
    const apiKey = process.env.DASHSCOPE_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: '未配置 API Key，请在环境变量中设置' });
    }

    try {
        // --- 场景 A：识别食材 (Identify) ---
        if (type === 'identify') {
            if (!image) return res.status(400).json({ error: '缺少图片数据' });

            const response = await DashScope.MultiModalConversation.call({
                model: 'qwen-vl-max', // 使用多模态大模型
                apiKey: apiKey,
                input: {
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { image: image },
                                { text: "请识别图片中的食材。仅输出一个 JSON 对象，包含：name (名称), days (建议保质天数，数字), category (分类)。不要输出任何多余文字。" }
                            ]
                        }
                    ]
                }
            });

            // 提取并清洗 JSON
            const resultText = response.output.choices[0].message.content[0].text;
            const cleanJson = resultText.replace(/```json|```/g, '').trim();
            return res.status(200).json(JSON.parse(cleanJson));
        }

        // --- 场景 B：生成菜谱 (Recipe) ---
        else if (type === 'recipe') {
            if (!items) return res.status(400).json({ error: '冰箱空空如也，无法生成菜谱' });

            const response = await DashScope.Generation.call({
                model: 'qwen-turbo', // 生成文本建议用轻量模型，速度快
                apiKey: apiKey,
                input: {
                    prompt: `我的冰箱里有这些食材：${items}。请根据这些食材，为我推荐 2 道家常菜。要求：1. 菜名要有吸引力。2. 简述做法，步骤清晰。3. 语气要像专业的私厨管家。`
                }
            });

            const recipeText = response.output.text;
            return res.status(200).json({ recipe: recipeText });
        }

        else {
            return res.status(400).json({ error: '无效的请求类型' });
        }

    } catch (error) {
        console.error('AI 接口报错:', error);
        return res.status(500).json({ error: 'AI 服务暂时不可用，请稍后再试' });
    }
}
