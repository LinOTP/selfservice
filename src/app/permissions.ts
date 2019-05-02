export enum Permission {
    enrollPush = 'PUSH.ENROLL',
    activatePush = 'PUSH.ACTIVATE',
    enrollQR = 'QR.ENROLL',
    activateQR = 'QR.ACTIVATE',
    enrollHOTP = 'HOTP.ENROLL',
    enrollTOTP = 'TOTP.ENROLL',
    delete = 'DELETE',
    setPin = 'SETPIN'
}

export interface PermissionSet {
    [permissionScope: string]: Permission[];
}

export const PushPermissions: PermissionSet = {
    enroll: [Permission.enrollPush],
    activate: [Permission.activatePush],
    delete: [Permission.delete],
    setPin: [Permission.setPin],
};

export const QRPermissions: PermissionSet = {
    enroll: [Permission.enrollQR],
    activate: [Permission.activateQR],
    delete: [Permission.delete],
    setPin: [Permission.setPin],
};

export const HOTPPermissions: PermissionSet = {
    enroll: [Permission.enrollHOTP],
    delete: [Permission.delete],
    setPin: [Permission.setPin],
};

export const TOTPPermissions: PermissionSet = {
    enroll: [Permission.enrollTOTP],
    delete: [Permission.delete],
    setPin: [Permission.setPin],
};
