const sendSuccess = (res, data, meta) => {
  if (meta) {
    return res.json({ data, meta });
  }
  return res.json({ data });
};

module.exports = { sendSuccess };
