const express = require('express');
const mqtt = require('mqtt');

const app = express();
const port = process.env.PORT || 3000;

// الاتصال بنفس خادم HiveMQ العام
const brokerUrl = 'mqtt://broker.hivemq.com';
const mqttClient = mqtt.connect(brokerUrl);

// القناة (Topic) المحددة التي طلبتها
const targetTopic = 'dev/emergency/225';

// مراقبة حالة اتصال السيرفر بالـ Broker
mqttClient.on('connect', () => {
    console.log('✅ تم الاتصال بخادم MQTT (HiveMQ) بنجاح');
});

mqttClient.on('error', (err) => {
    console.error('❌ خطأ في الاتصال بخادم MQTT:', err);
});

// 1. رابط تشغيل الريليه (يرسل نص ON)
// https://emergency-system-plyj.onrender.com/turn-on
app.get('/turn-on', (req, res) => {
    if (mqttClient.connected) {
        mqttClient.publish(targetTopic, 'ON');
        console.log(`تم نشر [ON] على القناة: ${targetTopic}`);
        res.send(`تم إرسال أمر التشغيل (ON) بنجاح إلى: ${targetTopic}`);
    } else {
        res.status(500).send('الخادم غير متصل بوسيط الـ MQTT حالياً.');
    }
});

// 2. رابط إيقاف الريليه (يرسل نص OFF)
// https://emergency-system-plyj.onrender.com/turn-off
app.get('/turn-off', (req, res) => {
    if (mqttClient.connected) {
        mqttClient.publish(targetTopic, 'OFF');
        console.log(`تم نشر [OFF] على القناة: ${targetTopic}`);
        res.send(`تم إرسال أمر الإيقاف (OFF) بنجاح إلى: ${targetTopic}`);
    } else {
        res.status(500).send('الخادم غير متصل بوسيط الـ MQTT حالياً.');
    }
});

// 3. مسار لإرسال أي نص مخصص (للمرونة والتجارب)
// مثال: https://emergency-system-plyj.onrender.com/send?text=HELLO
app.get('/send', (req, res) => {
    const customText = req.query.text || 'TEST_MESSAGE';
    if (mqttClient.connected) {
        mqttClient.publish(targetTopic, customText);
        res.send(`تم إرسال النص [${customText}] إلى القناة: ${targetTopic}`);
    } else {
        res.status(500).send('الخادم غير متصل بوسيط الـ MQTT حالياً.');
    }
});

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.send('خادم MQTT الخاص بنظام الطوارئ يعمل بنجاح!');
});

// تشغيل الخادم
app.listen(port, () => {
    console.log(`🚀 السيرفر يعمل على المنفذ ${port}`);
});
