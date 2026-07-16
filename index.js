const express = require('express');
const mqtt = require('mqtt');

const app = express();
const port = process.env.PORT || 3000;

// قراءة النصوص الخام (Text) القادمة من Postman
app.use(express.text()); 

// الاتصال بسيرفر MQTT
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

mqttClient.on('connect', () => {
    console.log('Connected to HiveMQ Broker successfully!');
});

// المسار الثابت الذي يستقبل الطلبات
app.post('/trigger-alarm', (req, res) => {
    // استقبال المسار الكامل من الـ Body (مثال: dev/emergency/255)
    const topic = req.body ? req.body.trim() : ''; 

    console.log(`Received topic to publish to: "${topic}"`);

    // التحقق من أن النص المرسل ليس فارغاً
    if (!topic) {
        return res.status(400).send("Error: Please send a valid topic in the request body.");
    }

    // الرسالة التي تريد إرسالها إلى الـ ESP32 عبر هذا الـ Topic
    // يمكنك تعديل هذه الرسالة أو جعلها ديناميكية لاحقاً
    const payload = "ACTIVATE_ALARM"; 

    // إرسال الرسالة إلى الـ Topic المستلم
    mqttClient.publish(topic, payload, (err) => {
        if (err) {
            console.error('MQTT error:', err);
            return res.status(500).send("Server Error.");
        }
        
        res.status(200).send(`Success: Command sent to topic [${topic}]`);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
