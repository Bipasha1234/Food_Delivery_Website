const GetListedRequest = require('../models/getListed');

const submitRequest = async (req, res) => {
  const { ownerEmail, phone1 } = req.body;

  try {
    // Check if email already exists
    const existingEmail = await GetListedRequest.findOne({ ownerEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already used.' });
    }

    // Check if phone number already exists
    const existingPhone = await GetListedRequest.findOne({ phone1 });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number is already used.' });
    }

    // Save the new listing request
    const newRequest = new GetListedRequest(req.body);
    await newRequest.save();

    res.status(201).json({ message: 'Request submitted successfully' });
  } catch (err) {
    console.error('Submit Request Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitRequest };
