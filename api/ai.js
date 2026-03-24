module.exports = async function handler(req, res) {
  console.log("收到请求了！方法是:", req.method);
  res.status(200).json({ message: "后端是通的！", receivedMethod: req.method });
};
