const path = require('path');

exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Construct URL
  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.json({ 
    success: true, 
    url: fileUrl,
    filename: req.file.filename
  });
};
