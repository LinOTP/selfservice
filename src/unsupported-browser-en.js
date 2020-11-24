isLegacy = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);

if (isLegacy) {
  document.body.innerHTML = ' \
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
      <h1>Unsupported Browser</h1>\
      <p>Your browser version is unsupported and the LinOTP Self Service does not work correctly.</p>\
      <p>The latest versions of following browsers are supported:</p>\
      <ul>\
        <li>Microsoft Edge</li>\
        <li>Mozilla Firefox</li>\
        <li>Google Chrome</li>\
      </ul>\
      <h2>Legacy Self Service</h2>\
      <p>You can use the legacy Self Service via <a href="/selfservice-legacy">/selfservice-legacy</a> if you cannot switch to a supported browser.</p>\
    </div>\
  ';
}
