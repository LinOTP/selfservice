<a name="0.2.0"></a>
## 0.2.0 (2019-09-05)


### Features:
* Support realm selection for selfservice login
* Token test feature disabled because it is not yet supporting the diverse
  authentication scenarios linotp provides, it will become available again
  once it is working independently from the authentication workflow
* Show QR code content (OATH seed and enrollment url) on OATH token enrollment


### Bug Fixes:
* Use correct linotp selfservice policy action to enable Push-Token activation
  `activate_PushToken` is the correct action for the frontend permission
* Selfservice login now works with special characters in username and password
* Apache configuration now uses temporary redirects for i18n
* Fix `a2enconf linotp-selfservice` with a correct module dependency list


### Translations:
* Added translations for token type details



<a name="0.1.0"></a>
## 0.1.0 (2019-07-18)


### Features

* Set up new tokens of following type: OATH-compatible HOTP and TOTP, and
  KeyIdentity Push-Token.
* Activate KeyIdentity QR-Token and KeyIdentity Push-Token.
* Authentication test for aforementioned tokens, as well as password token.
* Set token pin.
* Disable and enable tokens.
* Delete a token.
* i18n: English and German added.


