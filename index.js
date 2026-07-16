const express = require('express');
const mqtt = require('mqtt'); // تأكد من استيراد مكتبة MQTT
const app = express();

app.use(express.json());
// لدعم قراءة النصوص العادية إذا كنت ترسل العنوان فقط من بوستمان
app.use(express.text({ type: '*/*' })); 

// إعداد الاتصال بـ MQTT Broker (مثل HiveMQ أو Shiftr.io أو Mosquitto)
const MQTT_BROKER = "mqtt://broker.hivemq.com"; // ضع رابط الـ Broker الخاص بك هنا
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT Broker successfully!');
});

// المسار لاستقبال طلب الـ POST ونشره للـ ESP32
app.post('/publish', (req, res) => {
    let topic = "dev/emergency/225"; // القيمة الافتراضية للعنوان
    let message = "ON"; // الرسالة الافتراضية (مثلاً لتشغيل التنبيه)

    // إذا أرسلت البيانات كـ JSON من Postman
    if (req.is('json')) {
        topic = req.body.topic || topic;
        message = req.body.message || message;
    } else if (typeof req.body === 'string' && req.body.trim() !== "") {
        // إذا أرسلت العنوان فقط كنص مجرد في الـ Body مثل صورتك السابقة
        topic = req.body.trim();
    }

    // نشر الرسالة عبر MQTT إلى الـ ESP32
    mqttClient.publish(topic, message, (err) => {
        if (err) {
            console.error(`Failed to publish to ${topic}:`, err);
            return res.status(500).send("Failed to send message to ESP32");
        }
        
        console.log(`Published successfully to [${topic}] with message: "${message}"`);
        res.status(200).send(`Message sent to ESP32 via topic: ${topic}`);
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
