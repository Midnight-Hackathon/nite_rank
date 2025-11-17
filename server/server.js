const express = require('express');
const app = express();
app.use(express.json());
app.post('/game-data', (req, res) => {
  console.log('Game data:', req.body);  // See in terminal
  // Or log to file: fs.writeFileSync('logs.json', JSON.stringify(req.body));
  res.json({ status: 'received', echo: req.body });  // Return to game
});
app.listen(3000, () => console.log('Server on http://localhost:3000'));