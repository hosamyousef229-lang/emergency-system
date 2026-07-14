const express = require('express');
const mqtt = require('mqtt');

const app = express();
const port = process.env.PORT || 3000;

// السماح بقراءة النص الخام (Text) القادم من Postman
app.use(express.text()); 

// الاتصال بسيرفر MQTT
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

mqttClient.on('connect', () => {
    console.log('Connected to HiveMQ Broker successfully!');
});

// المسار الذي يستقبل الطلبات
app.post('/trigger-alarm', (req, res) => {
    const stationNumber = req.body.trim(); 

    console.log(`Received command for station: ${stationNumber}`);

    if (!stationNumber || isNaN(stationNumber)) {
        return res.status(400).send("Error: Please send a valid number.");
    }

    const topic = 'emergency/alert'; 

    // إرسال الرقم للـ ESP32
    mqttClient.publish(topic, stationNumber, (err) => {
        if (err) {
            console.error('MQTT error:', err);
            return res.status(500).send("Server Error.");
        }
        
        res.status(200).send(`Success: Command sent to station ${stationNumber}`);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
