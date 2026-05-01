const authorizePOS = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  console.log(apiKey)
  if (!apiKey || apiKey !== "Supersitionshjkga123") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized webhook access",
    });
  }

  next();
};

module.exports = authorizePOS;