const express = require('express');
const mqtt = require('mqtt');

const app = express();
const port = process.env.PORT || 3000;

// قراءة النصوص الخام القادمة من Postman
app.use(express.text({ type: '*/*' })); 

// الاتصال بـ MQTT Broker مع وضع حد أقصى لمهلة الاتصال لمنع التعليق
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com', {
    connectTimeout: 4000, // 4 ثوانٍ كحد أقصى للاتصال
    reconnectPeriod: 1000 // إعادة المحاولة كل ثانية في حال الانقطاع
});

// متغير لمراقبة حالة الاتصال بالـ Broker
let isMqttConnected = false;

mqttClient.on('connect', () => {
    isMqttConnected = true;
    console.log('Connected to HiveMQ Broker successfully!');
});

mqttClient.on('close', () => {
    isMqttConnected = false;
    console.log('MQTT connection closed.');
});

mqttClient.on('error', (err) => {
    isMqttConnected = false;
    console.error('MQTT Connection Error:', err);
});

// استقبال الطلبات من Postman
app.post('/trigger-alarm', (req, res) => {
    const topic = req.body ? req.body.trim() : ''; 

    console.log(`Received request for topic: "${topic}"`);

    // 1. التحقق من صحة المدخلات
    if (!topic) {
        return res.status(400).send("Error: Request body (topic) is empty.");
    }

    // 2. التحقق الفوري من اتصال السيرفر بـ MQTT Broker قبل الإرسال
    if (!isMqttConnected) {
        console.error("MQTT Broker is offline. Cannot publish.");
        return res.status(503).send("Error: Server is currently disconnected from MQTT Broker. Please try again in seconds.");
    }

    const payload = "1"; 

    // 3. إرسال الرسالة مع وضع timeout احتياطي للطلب نفسه
    let callbackTriggered = false;

    // مهلة أمان لإنهاء طلب HTTP إذا تأخر الـ publish لأي سبب طارئ
    const safetyTimeout = setTimeout(() => {
        if (!callbackTriggered) {
            callbackTriggered = true;
            console.error("Publish action timed out internally.");
            res.status(504).send("Error: MQTT gateway timeout.");
        }
    }, 5000); // 5 ثوانٍ كحد أقصى

    mqttClient.publish(topic, payload, (err) => {
        if (callbackTriggered) return; // تم التعامل مع الرد مسبقاً عبر الـ timeout
        callbackTriggered = true;
        clearTimeout(safetyTimeout); // إلغاء مهلة الأمان

        if (err) {
            console.error('MQTT publish error:', err);
            return res.status(500).send("Server Error: Failed to publish message.");
        }
        
        console.log(`Published successfully to [${topic}]`);
        res.status(200).send(`Success: Trigger signal ("1") sent to topic [${topic}]`);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
