const express = require('express');
const mqtt = require('mqtt');

const app = express();
// المنفذ الافتراضي لـ Render أو المنفذ 3000 للتجريب المحلي
const port = process.env.PORT || 3000;

// تفعيل ميزة قراءة النصوص الخام (Plain Text) من جسم الطلب (Body) - أساسي لتجربة Postman
app.use(express.text());

// الاتصال بخادم وسيط MQTT (HiveMQ العام)
const brokerUrl = 'mqtt://broker.hivemq.com';
const mqttClient = mqtt.connect(brokerUrl);

// القناة الافتراضية في حال لم يتم إرسال قناة في الطلب
const defaultTopic = 'dev/emergency/225';

mqttClient.on('connect', () => {
    console.log('✅ تم الاتصال بخادم MQTT (HiveMQ) بنجاح واصبح جاهزاً لإرسال الأوامر!');
});

mqttClient.on('error', (err) => {
    console.error('❌ خطأ في الاتصال بخادم MQTT:', err);
});

// 1. مسار POST لتشغيل الإنذار (متوافق 100% مع تجربتك في Postman)
// الرابط: https://emergency-system-plyj.onrender.com/trigger-alarm
// الـ Body (Text): dev/emergency/225
app.post('/trigger-alarm', (req, res) => {
    const topic = req.body ? req.body.trim() : defaultTopic;

    if (!topic) {
        return res.status(400).send('خطأ: لم يتم إرسال اسم القناة في الـ Body');
    }

    if (mqttClient.connected) {
        // نشر أمر التشغيل ON على القناة المستلمة
        mqttClient.publish(topic, 'ON');
        console.log(`[POST] تم نشر أمر التشغيل (ON) على القناة: ${topic}`);
        res.send(`🚨 تم إطلاق الإنذار بنجاح! أرسلنا (ON) إلى القناة: ${topic}`);
    } else {
        res.status(500).send('خطأ: السيرفر غير متصل بـ MQTT Broker حالياً.');
    }
});

// 2. مسار POST لإيقاف الإنذار (مريح جداً ومطابق لطريقة التشغيل)
// الرابط: https://emergency-system-plyj.onrender.com/stop-alarm
// الـ Body (Text): dev/emergency/225
app.post('/stop-alarm', (req, res) => {
    const topic = req.body ? req.body.trim() : defaultTopic;

    if (!topic) {
        return res.status(400).send('خطأ: لم يتم إرسال اسم القناة في الـ Body');
    }

    if (mqttClient.connected) {
        // نشر أمر الإيقاف OFF على القناة المستلمة
        mqttClient.publish(topic, 'OFF');
        console.log(`[POST] تم نشر أمر الإيقاف (OFF) على القناة: ${topic}`);
        res.send(`✅ تم إيقاف الإنذار بنجاح! أرسلنا (OFF) إلى القناة: ${topic}`);
    } else {
        res.status(500).send('خطأ: السيرفر غير متصل بـ MQTT Broker حالياً.');
    }
});

// 3. مسارات GET السريعة (للتجربة المباشرة من المتصفح بدون Postman)
// تشغيل القناة الافتراضية
app.get('/turn-on', (req, res) => {
    if (mqttClient.connected) {
        mqttClient.publish(defaultTopic, 'ON');
        res.send(`[GET] تم إرسال أمر التشغيل (ON) إلى القناة الافتراضية: ${defaultTopic}`);
    } else {
        res.status(500).send('السيرفر غير متصل بـ MQTT Broker');
    }
});

// إيقاف القناة الافتراضية
app.get('/turn-off', (req, res) => {
    if (mqttClient.connected) {
        mqttClient.publish(defaultTopic, 'OFF');
        res.send(`[GET] تم إرسال أمر الإيقاف (OFF) إلى القناة الافتراضية: ${defaultTopic}`);
    } else {
        res.status(500).send('السيرفر غير متصل بـ MQTT Broker');
    }
});

// الصفحة الرئيسية للسيرفر
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align: center; font-family: Arial; padding-top: 50px;">
            <h1 style="color: #2c3e50;">📡 خادم نظام الطوارئ الذكي يعمل بنجاح!</h1>
            <p style="color: #7f8c8d; font-size: 18px;">جاهز لاستقبال الطلبات والتحكم بـ ESP32 عبر بروتوكول MQTT.</p>
        </div>
    `);
});

// تشغيل خادم الويب
app.listen(port, () => {
    console.log(`🚀 السيرفر يعمل الآن بنجاح على المنفذ: ${port}`);
});
