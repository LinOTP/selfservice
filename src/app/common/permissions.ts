export enum Permission {
    ENROLLPUSH = 'PUSH.ENROLL',
    ACTIVATEPUSH = 'PUSH.ACTIVATE',
    ENROLLQR = 'QR.ENROLL',
    ACTIVATEQR = 'QR.ACTIVATE',
    ENROLLHOTP = 'HOTP.ENROLL',
    ENROLLTOTP = 'TOTP.ENROLL',
    ENROLLPASSWORD = 'PW.ENROLL',
    DELETE = 'DELETE',
    SETPIN = 'SETPIN',
    ENABLE = 'ENABLE',
    DISABLE = 'DISABLE',
}

export const PoliciesToPermissionsMapping: { [policy: string]: Permission } = {
    'enrollPUSH': Permission.ENROLLPUSH,
    'activate_PushToken': Permission.ACTIVATEPUSH,
    'enrollQR': Permission.ENROLLQR,
    'activate_QRToken': Permission.ACTIVATEQR,
    'webprovisionGOOGLE': Permission.ENROLLHOTP,
    'webprovisionGOOGLEtime': Permission.ENROLLTOTP,
    'enrollPW': Permission.ENROLLPASSWORD,
    'delete': Permission.DELETE,
    'setOTPPIN': Permission.SETPIN,
    'enable': Permission.ENABLE,
    'disable': Permission.DISABLE,
};

export interface PermissionSet {
    [permissionScope: string]: Permission[];
}

export const PasswordPermissions: PermissionSet = {
    enroll: [Permission.ENROLLPASSWORD],
    delete: [Permission.DELETE],
    setPin: [Permission.SETPIN],
};

export const PushPermissions: PermissionSet = {
    enroll: [Permission.ENROLLPUSH],
    activate: [Permission.ENROLLPUSH],
    delete: [Permission.DELETE],
    setPin: [Permission.SETPIN],
};

export const QRPermissions: PermissionSet = {
    enroll: [Permission.ENROLLQR],
    activate: [Permission.ACTIVATEQR],
    delete: [Permission.DELETE],
    setPin: [Permission.SETPIN],
};

export const HOTPPermissions: PermissionSet = {
    enroll: [Permission.ENROLLHOTP],
    delete: [Permission.DELETE],
    setPin: [Permission.SETPIN],
};

export const TOTPPermissions: PermissionSet = {
    enroll: [Permission.ENROLLTOTP],
    delete: [Permission.DELETE],
    setPin: [Permission.SETPIN],
};

export const EnrollmentPermissions = [
    Permission.ENROLLPUSH,
    Permission.ENROLLQR,
    Permission.ENROLLHOTP,
    Permission.ENROLLTOTP,
    Permission.ENROLLPASSWORD,
];

export const ModifyTokenPermissions = [
    Permission.SETPIN,
    Permission.DELETE,
    Permission.ENABLE,
    Permission.DISABLE,
];
