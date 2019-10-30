<a name="0.3.0"></a>
## 0.3.0 (2019-10-31)


### Features:
* Multi-factor authentication login support:
  * 2-step MFA login requires second factor (OTP) after the first factor
    (username + password) is verified (LINOTP-1106)
  * 2-step MFA login allows token selection from a dropdown for the second
    step (LINOTP-1126)
  * 1-step MFA login allows to enter username, password and OTP on the same
    page (3-field mode)
  * Improved autofocus handling for login fields (LINOTP-1157)
* A more refined color theme with intermediate color steps is now supported
* Improved enrollment grid styling:
  * The token enrollment interface now shows enrollment buttons inside the
  cards to improve the workflow (LINOTP-1133)
  * If only one or two options are available, the card sizing is improved to
  utilize the full component width (LINOTP-1132)
* Reset token failcounter from within the token action menu (LINOTP-1128)
* Resync OATH tokens from within the token action menu (LINOTP-1129)


### Bug Fixes:
* Use correct input name and autocomplete attributes for the selfservice
  login to allow browsers to correctly autofill passwords and provide auto-
  completion hints.


### Translations:
* Added German translations for:
  * Token menu
  * Set pin dialog
  * Oath token enrollment workflow
  * Push token enrollment workflow
  * Enrollment grid
  * Token list
  (LINOTP-1192)



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


