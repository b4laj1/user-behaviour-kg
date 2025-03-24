require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Use routes
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// module.exports = app;