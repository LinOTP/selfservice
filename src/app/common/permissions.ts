export enum Permission {
    ENROLLPUSH = 'PUSH.ENROLL',
    ACTIVATEPUSH = 'PUSH.ACTIVATE',
    ENROLLQR = 'QR.ENROLL',
    ACTIVATEQR = 'QR.ACTIVATE',
    ENROLLHOTP = 'HOTP.ENROLL',
    ENROLLTOTP = 'TOTP.ENROLL',
    ENROLLPASSWORD = 'PW.ENROLL',
    ENROLLMOTP = 'MOTP.ENROLL',
    ENROLLEMAIL = 'EMAIL.ENROLL',
    ENROLLSMS = 'SMS.ENROLL',
    ENROLLYUBICO = 'YUBICO.ENROLL',
    DELETE = 'DELETE',
    SETPIN = 'SETPIN',
    SETMOTPPIN = 'SETMOTPPIN',
    ENABLE = 'ENABLE',
    DISABLE = 'DISABLE',
    RESET = 'RESET',
    RESYNC = 'RESYNC',
    ASSIGN = 'ASSIGN',
    UNASSIGN = 'UNASSIGN',
    VERIFY = 'VERIFY',
    SETDESCRIPTION = 'SETDESCRIPTION',
    GETSERIAL = 'GETSERIAL',
    HISTORY = 'HISTORY',
}

export const PoliciesToPermissionsMapping: { [policy: string]: Permission } = {
    'enrollPUSH': Permission.ENROLLPUSH,
    'activate_PushToken': Permission.ACTIVATEPUSH,
    'enrollQR': Permission.ENROLLQR,
    'activate_QRToken': Permission.ACTIVATEQR,
    'webprovisionGOOGLE': Permission.ENROLLHOTP,
    'webprovisionGOOGLEtime': Permission.ENROLLTOTP,
    'enrollHMAC': Permission.ENROLLHOTP,
    'enrollTOTP': Permission.ENROLLTOTP,
    'enrollPW': Permission.ENROLLPASSWORD,
    'enrollMOTP': Permission.ENROLLMOTP,
    'enrollSMS': Permission.ENROLLSMS,
    'enrollEMAIL': Permission.ENROLLEMAIL,
    'enrollYUBICO': Permission.ENROLLYUBICO,
    'delete': Permission.DELETE,
    'setOTPPIN': Permission.SETPIN,
    'setMOTPPIN': Permission.SETMOTPPIN,
    'enable': Permission.ENABLE,
    'disable': Permission.DISABLE,
    'reset': Permission.RESET,
    'resync': Permission.RESYNC,
    'assign': Permission.ASSIGN,
    'unassign': Permission.UNASSIGN,
    'verify': Permission.VERIFY,
    'setDescription': Permission.SETDESCRIPTION,
    'getserial': Permission.GETSERIAL,
    'history': Permission.HISTORY,
};

export interface PermissionSet {
    [permissionScope: string]: Permission[];
}

export const ModifyUnreadyTokenPermissions = [
    Permission.SETPIN,
    Permission.DELETE,
    Permission.SETDESCRIPTION,
    Permission.UNASSIGN,
];

export const ModifyTokenPermissions = [
    ...ModifyUnreadyTokenPermissions,
    Permission.ENABLE,
    Permission.DISABLE,
    Permission.RESET,
    Permission.RESYNC,
    Permission.VERIFY,
    Permission.SETMOTPPIN,
];
