importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');
// importScripts('http://172.16.228.82:8069/bs_teq_base/static/js/firebase-config.js');
//importScripts('/bs_teq_base/static/js/firebase-config.js')


// firebase.initializeApp({
//   // 'messagingSenderId': '679555067387',
//   'messagingSenderId': ''
// });

messaging.setBackgroundMessageHandler(function(payload) {
  const notificationTitle = 'Data Message Title';
  const notificationOptions = {
    body: 'Data Message body',
    icon: 'alarm.png'
  };
  
  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});