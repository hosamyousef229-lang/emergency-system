const express = require('express');
const mqtt = require('mqtt');

const app = express();
const port = process.env.PORT || 3000;

// دعم قراءة البيانات بصيغة JSON والصيغة النصية الخام (Text)
app.use(express.json()); 
app.use(express.text()); 

// الاتصال بسيرفر MQTT
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

mqttClient.on('connect', () => {
    console.log('Connected to HiveMQ Broker successfully!');
});

/**
 * المسار الجديد يستقبل الـ Topic كجزء من الرابط
 * رمز (*) يسمح باستقبال مسار كامل يحتوي على علامات "/" مثل: dev/emergency/225
 */
app.post('/trigger-alarm/:topic(*)', (req, res) => {
    const topic = req.params.topic; // سيحتوي على dev/emergency/225
    let payload;

    // تحضير البيانات المرسلة (Payload)
    if (typeof req.body === 'object') {
        payload = JSON.stringify(req.body); 
    } else {
        payload = req.body ? req.body.trim() : '';
    }

    console.log(`Sending to Topic: [${topic}] | Message: ${payload}`);

    // التحقق من وجود الـ Topic والبيانات
    if (!topic) {
        return res.status(400).send("Error: Topic is required in the URL.");
    }
    if (!payload) {
        return res.status(400).send("Error: Request body cannot be empty.");
    }

    // إرسال الرسالة إلى الـ Topic الديناميكي المستخرج من الرابط
    mqttClient.publish(topic, payload, (err) => {
        if (err) {
            console.error('MQTT error:', err);
            return res.status(500).send("Server Error.");
        }
        
        res.status(200).send(`Success: Sent message to topic [${topic}]`);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
