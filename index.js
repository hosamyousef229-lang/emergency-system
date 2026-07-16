const express = require('express');
const mqtt = require('mqtt');
const app = express();

// تفعيل قراءة النصوص العادية (Plain Text) من الطلبات
app.use(express.text({ type: '*/*' })); 

// إعداد الاتصال بـ MQTT Broker
const MQTT_BROKER = "mqtt://broker.hivemq.com"; // ضع رابط الـ Broker الخاص بك هنا
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT Broker successfully!');
});

// المسار لاستقبال النص ونشره
app.post('/publish', (req, res) => {
    // قراءة النص المرسل في الـ Body
    const topic = req.body ? req.body.trim() : "";

    // التحقق من أن النص ليس فارغاً
    if (!topic) {
        return res.status(400).send("Error: Body is empty. Please send a valid topic text.");
    }

    const message = "ON"; // الرسالة الافتراضية المرسلة للـ ESP32

    // نشر العنوان المستلم عبر الـ MQTT إلى الـ ESP32
    mqttClient.publish(topic, message, (err) => {
        if (err) {
            console.error(`Failed to publish to ${topic}:`, err);
            return res.status(500).send("Failed to send message to ESP32");
        }
        
        console.log(`Published successfully to [${topic}] with message: "${message}"`);
        
        // إرجاع رد نصي لـ Postman
        res.status(200).send(`Success: Published "ON" to topic [${topic}]`);
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
