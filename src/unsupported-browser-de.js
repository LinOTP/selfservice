isLegacy = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);

if (isLegacy) {
  document.body.innerHTML = '\
    <style>\
        body{\
            background: #f2f2f2;\
        }\
        .unsupported {\
            background: white;\
            border: 1px solid #d6d6d6;\
            margin: 35px 15px;\
            padding: 20px; 30px;\
        }\
    </style>\
    <div class="unsupported">\
      <h1>Nicht unterstützter Webbrowser</h1>\
      <p>Ihre Browser-Version wird nicht unterstützt und der LinOTP-Self-Service funktioniert nicht richtig.</p>\
      <p>Die folgenden Browser werden in ihrer aktuellsten Version offiziell unterstützt:</p>\
      <ul>\
        <li>Microsoft Edge</li>\
        <li>Mozilla Firefox</li>\
        <li>Google Chrome</li>\
      </ul>\
      <h2>Legacy Self-Service</h2>\
      <p>Sie können den alten Self-Service unter <a href="/selfservice-legacy">/selfservice-legacy</a> verwenden, wenn Sie nicht zu einem unterstützten Browser wechseln können.</p>\
    </div>\
  ';
}
