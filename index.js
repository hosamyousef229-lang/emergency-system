const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const port = process.env.PORT || 3000;

// إنشاء خادم HTTP
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// إنشاء خادم WebSocket متصل بخادم HTTP
const wss = new WebSocketServer({ server });

let esp32Client = null;

wss.on('connection', (ws) => {
    console.log('تم اتصال جهاز ESP32 بنجاح!');
    esp32Client = ws; // تخزين مسار الاتصال الخاص باللوحة

    ws.on('close', () => {
        console.log('انقطع الاتصال مع ESP32');
        esp32Client = null;
    });
});

// واجهة برمجية (API) لتشغيل الريليه
app.get('/turn-on', (req, res) => {
    if (esp32Client) {
        esp32Client.send('RELAY_ON'); // إرسال رسالة التشغيل
        res.send('تم إرسال أمر التشغيل إلى ESP32 (الريليه يعمل)');
    } else {
        res.status(404).send('لوحة ESP32 غير متصلة بالخادم حالياً.');
    }
});

// واجهة برمجية (API) لإيقاف الريليه
app.get('/turn-off', (req, res) => {
    if (esp32Client) {
        esp32Client.send('RELAY_OFF'); // إرسال رسالة الإيقاف
        res.send('تم إرسال أمر الإيقاف إلى ESP32 (الريليه متوقف)');
    } else {
        res.status(404).send('لوحة ESP32 غير متصلة بالخادم حالياً.');
    }
});

// رسالة ترحيبية للصفحة الرئيسية
app.get('/', (req, res) => {
    res.send('خادم نظام الطوارئ يعمل بنجاح!');
});
