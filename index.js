const express = require('express');
const mqtt = require('mqtt');

const app = express();
const port = process.env.PORT || 3000;

// هذا السطر يضمن قراءة النص القادم من Postman كـ Text مهما كان نوع الـ Content-Type المختار
app.use(express.text({ type: '*/*' })); 

// الاتصال بسيرفر MQTT
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

mqttClient.on('connect', () => {
    console.log('Connected to HiveMQ Broker successfully!');
});

// المسار الثابت لاستقبال الطلب
app.post('/trigger-alarm', (req, res) => {
    // استقبال المسار الكامل من الـ Body (مثل: dev/emergency/255)
    const topic = req.body ? req.body.trim() : ''; 

    console.log(`Target Topic received: "${topic}"`);

    // التحقق من أن النص ليس فارغاً
    if (!topic) {
        return res.status(400).send("Error: Please send a valid topic in the request body.");
    }

    // القيمة أو الرسالة التي ستصل للـ ESP32 لتشغيل الجرس/الإنذار
    const payload = "1"; // يمكنك تغييرها إلى "ON" أو "ACTIVATE" حسب برمجة الـ ESP32 لديك

    // إرسال الإشارة إلى المسار المطلوب
    mqttClient.publish(topic, payload, (err) => {
        if (err) {
            console.error('MQTT error:', err);
            return res.status(500).send("Server Error.");
        }
        
        res.status(200).send(`Success: Trigger signal sent to topic [${topic}]`);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
