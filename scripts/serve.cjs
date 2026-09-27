const {createApp}=require('../server.cjs');
createApp().listen(8001,'127.0.0.1',()=>console.log('Roam: http://localhost:8001/login\nPrototype username: user123\nPrototype password: password\nKeep this window open while using the app.'));
