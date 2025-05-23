<a name="1.5-0dev"></a>
## 1.5-0dev (unreleased)

* dummy changelog entry for 1.5-0dev

<a name="1.4rc0"></a>
## 1.4rc0 (unreleased)

  ### Features:
  * Added OTP PIN enforcement during enrollment. The OTP PIN is now required if `setOTPPIN` and at least one `otp_pin_*` policy is set.
  * Implemented validation rules for `otp_pin_minlength`, `otp_pin_maxlength`, and `otp_pin_contents`.
  * Revamped the enrollment process for the following tokens: Password, Push, QR, SMS, Email, MOTP, YubiCloud.
  * Revamped the token assignment process.
  * During the verification step, the phone number is shown for SMS token and the email for email token.
  * Added appropriate autofocus to every step of the enrollment process.

  ### Fixes:
  * Tokens don't show a token action menu if they don't have an available action.
  * In revamped enrollment processes, the token list now updates in the final step rather than after token creation, preventing the premature display of warnings above the token list.
  * Added the token description to the token overview in the final step of enrollment.
  * Removed redundant text and adjusted the layout of certain enrollment steps.
  * The new Self Service now correctly uses the intended parameter "pin" instead of "otppin", which was previously incorrectly defined as the default parameter for the token PIN.



<a name="1.3.1"></a>
## 1.3.1 (2024-11-14)

  ### Fixes:
  * verify warning is removed when a token is enrolled with successful verification
  * users can login with, test and verify forwarding tokens targeting any common token


<a name="1.3"></a>
## 1.3 (2024-09-16)

  ### Features:
  * Added support for custom content placement in specific app sections
  * Introduced the ability to add custom page
  * Added a token card for the forwarding token

  ### Fixes:
  * Show an error message when the permissions can not be loaded


<a name="1.2"></a>
## 1.2 (2024-06-25)

  ### Features:
  * Users get warned and have to confirm their action, if that action would prevent them from logging into the Selfservice.
  * Display number of enrolled tokens.
  * Display the number of remaining tokens that the user is still allowed to enroll.
  * Users are prevented from enrolling a token, if the token limit has been reached. They're informed instead.
  * Harmonize form behaviour. E.g. all forms can now be submitted by pressing the `enter` key.
  * Error messages and notifications have different styles
  * Dockerfile has been improved in outlook of LinOTPs containerization
  * Display info about selected token in action dialogs
  * Show links and recommend the usage of LinOTP Authenticator app for OATH Tokens
  * Improved enrollment for HOTP and TOTP tokens
  * Removed non-public dependencies. LinOTP Selfservice can now be build by everyone.
  * Dynamically change the theme based on the device's color scheme, without requiring a browser refresh.
  * Display warnings about not verified tokens
  * Improved enrollment for password tokens

  ### Fixes:
  * Show correct error messages after session timeout

  ### Dependencies
  * Update to Angular 16
  * Update to Node 18.18

<a name="1.1.1"></a>
## 1.1.1 (2024-01-18)

  ### Fixes:
  * Language picker displays selected language correctly


<a name="1.1"></a>
## 1.1 (2024-01-11)

  ### Features:
  * Dark-Mode based on browser/user preference.
  * Deep-linking to token enrollment: `/tokens/enroll/:tokentype` opens the selfservice and directly shows the enrollment dialog for the given tokentype.
  * Refined interfaces.

  ### Fixes:
  * Deep-linking to enrollment page for unauthenticated user after login
  * Logged in users are redirected from login page to token list
  * Apache config workaround for customization no longer needed with lseappliance 3.0.2.
  * Testing a token via the tokens actions menu opens test dialog correctly.

  ### Dependencies
  * Update to Angular 15
  * Update to Node 14.21.1


<a name="1.0"></a>
## 1.0 (2021-07-01)

  Final 1.0 release. No new changes.


<a name="1.0rc2"></a>
## 1.0rc2 (2021-03-29)

  ### Fixes:
  * 2-step MFA login no longer fails if user has only one token.
  * Token activation no longer fails for users not in the default realm.


<a name="1.0rc1"></a>
## 1.0rc1 (2021-01-08)

  ### Features:
  * Permissions are refreshed on every page load after the main requests are done. Previously this was only done once after successful login.
  * Token list is registered as the fallback route that is redirected to if no other route was hit.

  ### Fixes:
  * Push and qr token activation was wrongly reported as failed in [1.0rc0](#1.0rc0). This is now fixed and the activation process is correctly performed.
  * Non-fully activated push and qr tokens are handled equally now in the token list. This means that push tokens no longer show a primary delete action and the wording reflects whether the activation permission was granted or not.
  * Push and qr token enrollment dialog now only allows to start activation if the correct permission was granted.
  * Push and qr token enrollment dialog now correctly handles the links to the mobile apps and for pairing.
  * Side margins are no longer missing on smaller screens. A minimal side margin is retained on screens smaller than the max-width of the token list.
  * History search is no longer submitted implicitly when the pagination or sort order changes. The user now has to explicitly submit the search once it is happy with the selected column and search term. The "clear search" icon button is shown if the table does not show the unfiltered search. The search button is now only shown if the search form has changes that are not submitted.
  * Cancelling Push and QR token activation no longer opens a pop-up informing of a successful activation.
  * Prevent multiple submission of login requests in rapid succession
  * Push token MFA login UI is now correctly aligned.
  * Cancelling Push and QR token activation now directly cancels status polling.


<a name="1.0rc0"></a>
## 1.0rc0 (2020-12-02)

  ### Features:
  * Support for enrollHMAC and enrollTOTP policies. These policies are now the preferred way of enabling TOTP and HOTP token enrollment.
  * Enhanced support for Yubikey and Yubico tokens in MFA login.
  * Name and realm of logged-in user is displayed in the top bar.
  * Enhanced consitency between all dialogs for the enrollment of all supported token types.
  * API polling for status checks is now slowing down with exponential backoff after some time for less load on the backend.
  * If a token is disabled without having the permission to reenable the token, it must be confirmed with a dialog.
  * The disable token action is no longer shown at all if permission is not available but the enable token action is shown disabled with a tooltip explaining that the user is not allowed to reenable disabled tokens.
  * QR and Push tokens show an improved information if they are not yet paired based on the permissions a user has.
  * Unsupported browser message includes link to legacy Self Service.
  * Display user history in a data table, provided the history policy is set.

  ### Breaking changes:
  * The debian package now builds the selfservice to be available on the url "/selfservice" instead of "/selfservice-v2" in preparation for being the primary selfservice for LinOTP.

  ### Deprecations:
  * Policies "webprovisionGOOGLE" and "webprovisionGOOGLEtime" are replaced by "enrollHMAC" and "enrollTOTP" respectively. They are still available for compatibility reasons when running the legacy Self Service in parallel.

  ### Fixes:
  * Apache config files are now correctly linked into "/etc/linotp/" which was previously "/etc/linotp2/" with LinOTP 2.x.
  * Login redirect to the token list can no longer fail because of redirect paramter stacking up mulitple times pointing to the login page.
  * Tokens with a pending activation will no longer show an empty token action card if only actions are allowed that are only viable for fully-activated tokens.
  * Assigning a password token when the verify permission is set now correctly opens the token test to verify that the user can use the token now.
  * Pressing enter after successfully creating tokens no longer causes unintential duplicated tokens from being created.
  * The enrollment grid now is ensured to be always shown if a token enrollment policy is set. Also the section will no longer be mistakenly shown if the verify policy is set but no enrollment policies are.
  * No longer recognizing a MFA-login session as a valid session in SessionService.


<a name="0.7.0"></a>
## 0.7.0 (2020-10-22)

  ### Features:
  * Language picker to switch between available locales
  * Keyboard support for token selection on MFA login
  * Hide navigation when user is logged out
  * Support unassigning tokens if the user has the right permission
  * Login uses new userservice API (requires LinOTP v3.0)
  * MFA login supports challenge-response tokens (Push-Token and QR-Token)
  * Display spinner while token list and permissions are loading after login
  * Disable submission buttons while a request is being processed to prevent double submissions and display the pending status with a spinner
  * Inform users of Internet Explorer and legacy Edge browsers that their browser is unsupported
  * Warn users and disable all functionality if the backend version is incompatible
  * Improve error messages on enrollment failure due to max token policies
  * Display a footer with policy-defined copyright info, link to imprint and link to legal notice

  ### Bug Fixes:
  * Display 3rd MFA field only if MFA login is enabled
  * When canceling enrollment and the user does not have permission to delete a token, the warning pop-up says the token will not be a usable state, instead of informing that it will be deleted
  * Cancelling enrollment of QR-Tokens correctly mentions the token type (it said Push Token before)
  * Correctly use form submit handlers to submit forms, which also adds keyboard support
  * Correctly define auto-focus in enrollment dialogs


<a name="0.6.0"></a>
## 0.6.0 (2020-08-06)

### Features:
* Following token types can now be created:
  * QR Token
  * SMS
  * Email
  * MOTP
  * YubiCloud
* Password tokens are supported on MFA login and can be tested from the token card menu
* When assigning a token, and if the policy `getserial` is enabled, the user can now determine its serial by entering a valid OTP

### Bug Fixes:
* Push token can now be activated when the policy pin=password is enabled


<a name="0.5.0"></a>
## 0.5.0 (2020-03-26)

### Features:
* MFA login skips token selection if the user has exactly one token and displays token information in the last step
* Inactive sessions are automatically logged out and the user gets redirected to the login page
* Recognize and manage existing e-mail, SMS and mOTP tokens
* Token tests are enabled with the LinOTP policy 'verify' in the selfservice scope
* Token test is performed  after a token is enrolled
* Tokens can be tested from the token action menu
* Set mOTP pin from the token action menu
* Completed the German translation

### Bug Fixes:
* Pin field is handled again as a password in the set pin dialog (broken since v0.3.0)



<a name="0.4.0"></a>
## 0.4.0 (2019-12-19)

### Features:
* Token assignment with custom token description
* Customization of logo, favicon and CSS

### Bug Fixes:
* Closing set pin dialog is not treated as an error



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


