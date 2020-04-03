export enum Permission {
    ENROLLPUSH = 'PUSH.ENROLL',
    ACTIVATEPUSH = 'PUSH.ACTIVATE',
    ENROLLQR = 'QR.ENROLL',
    ACTIVATEQR = 'QR.ACTIVATE',
    ENROLLHOTP = 'HOTP.ENROLL',
    ENROLLTOTP = 'TOTP.ENROLL',
    ENROLLPASSWORD = 'PW.ENROLL',
    ENROLLMOTP = 'MOTP.ENROLL',
    DELETE = 'DELETE',
    SETPIN = 'SETPIN',
    SETMOTPPIN = 'SETMOTPPIN',
    ENABLE = 'ENABLE',
    DISABLE = 'DISABLE',
    RESET = 'RESET',
    RESYNC = 'RESYNC',
    ASSIGN = 'ASSIGN',
    VERIFY = 'VERIFY',
    SETDESCRIPTION = 'SETDESCRIPTION',
}

export const PoliciesToPermissionsMapping: { [policy: string]: Permission } = {
    'enrollPUSH': Permission.ENROLLPUSH,
    'activate_PushToken': Permission.ACTIVATEPUSH,
    'enrollQR': Permission.ENROLLQR,
    'activate_QRToken': Permission.ACTIVATEQR,
    'webprovisionGOOGLE': Permission.ENROLLHOTP,
    'webprovisionGOOGLEtime': Permission.ENROLLTOTP,
    'enrollPW': Permission.ENROLLPASSWORD,
    'enrollMOTP': Permission.ENROLLMOTP,
    'delete': Permission.DELETE,
    'setOTPPIN': Permission.SETPIN,
    'setMOTPPIN': Permission.SETMOTPPIN,
    'enable': Permission.ENABLE,
    'disable': Permission.DISABLE,
    'reset': Permission.RESET,
    'resync': Permission.RESYNC,
    'assign': Permission.ASSIGN,
    'verify': Permission.VERIFY,
    'setDescription': Permission.SETDESCRIPTION,
};

export interface PermissionSet {
    [permissionScope: string]: Permission[];
}

export const EnrollmentPermissions = [
    Permission.ENROLLPUSH,
    Permission.ENROLLQR,
    Permission.ENROLLHOTP,
    Permission.ENROLLTOTP,
    Permission.ENROLLPASSWORD,
    Permission.ASSIGN,
    Permission.VERIFY,
];

export const ModifyTokenPermissions = [
    Permission.SETPIN,
    Permission.DELETE,
    Permission.ENABLE,
    Permission.DISABLE,
    Permission.RESET,
    Permission.RESYNC,
    Permission.VERIFY,
    Permission.SETMOTPPIN,
    Permission.SETDESCRIPTION,
];
