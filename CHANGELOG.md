# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - UNRELEASED

### Added

- Custom app recommendations for hmac, totp, push and qr token.
- Add support for FIDO2 token.

### Changed

- Revamped QR / Push activation.
- Push and QR Token enrollment will have an extra activation step
  if the user has the permission `activate_PushToken` or `activate_QRToken`.
- Theme revamp and various UI improvements.
- Push token activation now shows the same "waiting for confirmation" prompt used for real authentication challenges, instead of instructing the user to tap the token in the app.

### Removed

- Debian packaging (`debian/` control files, the Apache site configuration, and
  the related build/CI scripts) has been removed. LinOTP Selfservice is now only
  built and distributed as a container image.

### Fixed

- Default token description for assign and enroll.
- Verify step of an assigned password token did not hide the password.
- Login form now retains username and realm after MFA cancellation.
- UI responsiveness for small-screen devices.
- Various a11y improvements across the app.

## [1.4.1] - 2026-04-08

### Security

- Container images now run with unprivileged (non-root) user `nginx` by default.

## [1.4] - 2025-06-16

### Added

- Implemented validation rules for `otp_pin_minlength`, `otp_pin_maxlength`, and `otp_pin_contents`.
- Added appropriate autofocus to every step of the enrollment process.
- Added OTP PIN enforcement during enrollment. The OTP PIN is now required if `setOTPPIN` and at least one `otp_pin_*` policy is set.

### Changed

- Revamped the enrollment process for the following tokens: Password, Push, QR, SMS, Email, MOTP, YubiCloud.
- Revamped the token assignment process.
- During the verification step, the phone number is shown for SMS token and the email for email token.

### Fixed

- Tokens don't show a token action menu if they don't have an available action.
- In revamped enrollment processes, the token list now updates in the final step rather than after token creation, preventing the premature display of warnings above the token list.
- Added the token description to the token overview in the final step of enrollment.
- Removed redundant text and adjusted the layout of certain enrollment steps.
- The new Self Service now correctly uses the intended parameter "pin" instead of "otppin", which was previously incorrectly defined as the default parameter for the token PIN.

## [1.3.1] - 2024-11-14

### Fixed

- Verify warning is removed when a token is enrolled with successful verification.
- Users can login with, test and verify forwarding tokens targeting any common token.

## [1.3] - 2024-09-16

### Added

- Added support for custom content placement in specific app sections.
- Introduced the ability to add custom page.
- Added a token card for the forwarding token.

### Fixed

- Show an error message when the permissions can not be loaded.

## [1.2] - 2024-06-25

### Added

- Display number of enrolled tokens.
- Display the number of remaining tokens that the user is still allowed to enroll.
- Display info about selected token in action dialogs.
- Dynamically change the theme based on the device's color scheme, without requiring a browser refresh.
- Display warnings about not verified tokens.

### Changed

- Update to Angular 16.
- Update to Node 18.18.
- Users get warned and have to confirm their action, if that action would prevent them from logging into the Selfservice.
- Users are prevented from enrolling a token, if the token limit has been reached. They're informed instead.
- Harmonize form behaviour. E.g. all forms can now be submitted by pressing the `enter` key.
- Improved enrollment for HOTP and TOTP tokens.
- Dockerfile has been improved in outlook of LinOTPs containerization.
- Improved enrollment for password tokens.
- Error messages and notifications have different styles.
- Show links and recommend the usage of LinOTP Authenticator app for OATH Tokens.

### Removed

- Removed non-public dependencies. LinOTP Selfservice can now be build by everyone.

### Fixed

- Show correct error messages after session timeout.

## [1.1.1] - 2024-01-18

### Fixed

- Language picker displays selected language correctly.

## [1.1] - 2024-01-11

### Added

- Dark-Mode based on browser/user preference.
- Deep-linking to token enrollment: `/tokens/enroll/:tokentype` opens the selfservice and directly shows the enrollment dialog for the given tokentype.

### Changed

- Update to Angular 15.
- Update to Node 14.21.1.
- Refined interfaces.

### Fixed

- Deep-linking to enrollment page for unauthenticated user after login.
- Logged in users are redirected from login page to token list.
- Apache config workaround for customization no longer needed with lseappliance 3.0.2.
- Testing a token via the tokens actions menu opens test dialog correctly.

## [1.0] - 2021-07-01

Final 1.0 release. No new changes.

## [1.0rc2] - 2021-03-29

### Fixed

- 2-step MFA login no longer fails if user has only one token.
- Token activation no longer fails for users not in the default realm.

## [1.0rc1] - 2021-01-08

### Changed
- Permissions are refreshed on every page load after the main requests are done. Previously this was only done once after successful login.
- Token list is registered as the fallback route that is redirected to if no other route was hit.

### Fixed

- Push and qr token activation was wrongly reported as failed in 1.0rc0. This is now fixed and the activation process is correctly performed.
- Non-fully activated push and qr tokens are handled equally now in the token list. This means that push tokens no longer show a primary delete action and the wording reflects whether the activation permission was granted or not.
- Push and qr token enrollment dialog now only allows to start activation if the correct permission was granted.
- Push and qr token enrollment dialog now correctly handles the links to the mobile apps and for pairing.
- Side margins are no longer missing on smaller screens. A minimal side margin is retained on screens smaller than the max-width of the token list.
- History search is no longer submitted implicitly when the pagination or sort order changes. The user now has to explicitly submit the search once it is happy with the selected column and search term. The "clear search" icon button is shown if the table does not show the unfiltered search. The search button is now only shown if the search form has changes that are not submitted.
- Cancelling Push and QR token activation no longer opens a pop-up informing of a successful activation.
- Prevent multiple submission of login requests in rapid succession.
- Push token MFA login UI is now correctly aligned.
- Cancelling Push and QR token activation now directly cancels status polling.

## [1.0rc0] - 2020-12-02

### Added

- Support for enrollHMAC and enrollTOTP policies. These policies are now the preferred way of enabling TOTP and HOTP token enrollment.
- Name and realm of logged-in user is displayed in the top bar.
- If a token is disabled without having the permission to reenable the token, it must be confirmed with a dialog.
- Unsupported browser message includes link to legacy Self Service.
- Display user history in a data table, provided the history policy is set.

### Changed

- Enhanced support for Yubikey and Yubico tokens in MFA login.
- Enhanced consitency between all dialogs for the enrollment of all supported token types.
- API polling for status checks is now slowing down with exponential backoff after some time for less load on the backend.
- The disable token action is no longer shown at all if permission is not available but the enable token action is shown disabled with a tooltip explaining that the user is not allowed to reenable disabled tokens.
- QR and Push tokens show an improved information if they are not yet paired based on the permissions a user has.
- The debian package now builds the selfservice to be available on the url "/selfservice" instead of "/selfservice-v2" in preparation for being the primary selfservice for LinOTP. This is a breaking change.

### Deprecated

- Policies "webprovisionGOOGLE" and "webprovisionGOOGLEtime" are replaced by "enrollHMAC" and "enrollTOTP" respectively. They are still available for compatibility reasons when running the legacy Self Service in parallel.

### Fixed

- Apache config files are now correctly linked into "/etc/linotp/" which was previously "/etc/linotp2/" with LinOTP 2.x.
- Login redirect to the token list can no longer fail because of redirect paramter stacking up mulitple times pointing to the login page.
- Tokens with a pending activation will no longer show an empty token action card if only actions are allowed that are only viable for fully-activated tokens.
- Assigning a password token when the verify permission is set now correctly opens the token test to verify that the user can use the token now.
- Pressing enter after successfully creating tokens no longer causes unintential duplicated tokens from being created.
- The enrollment grid now is ensured to be always shown if a token enrollment policy is set. Also the section will no longer be mistakenly shown if the verify policy is set but no enrollment policies are.
- No longer recognizing a MFA-login session as a valid session in SessionService.

## [0.7.0] - 2020-10-22

### Added

- Language picker to switch between available locales.
- Keyboard support for token selection on MFA login.
- Support unassigning tokens if the user has the right permission.
- MFA login supports challenge-response tokens (Push-Token and QR-Token).
- Display spinner while token list and permissions are loading after login.
- Inform users of Internet Explorer and legacy Edge browsers that their browser is unsupported.
- Warn users and disable all functionality if the backend version is incompatible.
- Display a footer with policy-defined copyright info, link to imprint and link to legal notice.

### Changed
- Hide navigation when user is logged out.
- Login uses new userservice API (requires LinOTP v3.0).
- Disable submission buttons while a request is being processed to prevent double submissions and display the pending status with a spinner.
- Improve error messages on enrollment failure due to max token policies.

### Fixed

- Display 3rd MFA field only if MFA login is enabled.
- When canceling enrollment and the user does not have permission to delete a token, the warning pop-up says the token will not be a usable state, instead of informing that it will be deleted.
- Cancelling enrollment of QR-Tokens correctly mentions the token type (it said Push Token before).
- Correctly use form submit handlers to submit forms, which also adds keyboard support.
- Correctly define auto-focus in enrollment dialogs.

## [0.6.0] - 2020-08-06

### Added

- Following token types can now be created:
  - QR Token
  - SMS
  - Email
  - MOTP
  - YubiCloud
- Password tokens are supported on MFA login and can be tested from the token card menu.
- When assigning a token, and if the policy `getserial` is enabled, the user can now determine its serial by entering a valid OTP.

### Fixed

- Push token can now be activated when the policy pin=password is enabled.

## [0.5.0] - 2020-03-26

### Added

- MFA login skips token selection if the user has exactly one token and displays token information in the last step.
- Inactive sessions are automatically logged out and the user gets redirected to the login page.
- Recognize and manage existing e-mail, SMS and mOTP tokens.
- Token tests are enabled with the LinOTP policy 'verify' in the selfservice scope.
- Token test is performed after a token is enrolled.
- Tokens can be tested from the token action menu.
- Set mOTP pin from the token action menu.
- Completed the German translation.

### Fixed

- Pin field is handled again as a password in the set pin dialog (broken since v0.3.0).

## [0.4.0] - 2019-12-19

### Added

- Token assignment with custom token description.
- Customization of logo, favicon and CSS.

### Fixed

- Closing set pin dialog is not treated as an error.

## [0.3.0] - 2019-10-31

### Added

- Multi-factor authentication login support:
  - 2-step MFA login requires second factor (OTP) after the first factor
    (username + password) is verified (LINOTP-1106).
  - 2-step MFA login allows token selection from a dropdown for the second
    step (LINOTP-1126).
  - 1-step MFA login allows to enter username, password and OTP on the same
    page (3-field mode).
  - Improved autofocus handling for login fields (LINOTP-1157).
- A more refined color theme with intermediate color steps is now supported.
- Reset token failcounter from within the token action menu (LINOTP-1128).
- Resync OATH tokens from within the token action menu (LINOTP-1129).
- Added German translations for (LINOTP-1192):
  - Token menu
  - Set pin dialog
  - Oath token enrollment workflow
  - Push token enrollment workflow
  - Enrollment grid
  - Token list

### Changed

- Improved enrollment grid styling:
  - The token enrollment interface now shows enrollment buttons inside the
    cards to improve the workflow (LINOTP-1133).
  - If only one or two options are available, the card sizing is improved to
    utilize the full component width (LINOTP-1132).

### Fixed

- Use correct input name and autocomplete attributes for the selfservice
  login to allow browsers to correctly autofill passwords and provide auto-
  completion hints.

## [0.2.0] - 2019-09-05

### Added

- Support realm selection for selfservice login.
- Show QR code content (OATH seed and enrollment url) on OATH token enrollment.
- Added translations for token type details.

### Removed

- Token test feature disabled because it is not yet supporting the diverse
  authentication scenarios linotp provides, it will become available again
  once it is working independently from the authentication workflow.

### Fixed

- Use correct linotp selfservice policy action to enable Push-Token activation.
  `activate_PushToken` is the correct action for the frontend permission.
- Selfservice login now works with special characters in username and password.
- Apache configuration now uses temporary redirects for i18n.
- Fix `a2enconf linotp-selfservice` with a correct module dependency list.

## [0.1.0] - 2019-07-18

### Added

- Set up new tokens of following type: OATH-compatible HOTP and TOTP, and
  KeyIdentity Push-Token.
- Activate KeyIdentity QR-Token and KeyIdentity Push-Token.
- Authentication test for aforementioned tokens, as well as password token.
- Set token pin.
- Disable and enable tokens.
- Delete a token.
- i18n: English and German added.
