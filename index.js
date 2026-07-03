const express = require('express');
const mqtt = require('mqtt');
const app = express();
const port = process.env.PORT || 3000;

// الاتصال بوسيط MQTT العام
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log('Connected to MQTT Broker!');
});

app.use(express.json());

// نقطة اتصال لاستقبال الأمر من تطبيقك
app.post('/trigger-alarm', (req, res) => {
  const { stationId, action } = req.body;
  client.publish(`emergency/${stationId}`, action);
  res.send(`Command ${action} sent to station ${stationId}`);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
