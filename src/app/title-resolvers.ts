import { ResolveFn } from "@angular/router";
import { tokenDisplayData } from "./api/token";

export const enrollTokenTitleResolver: ResolveFn<string> = (route) => {
    const typeParam = route.params["type"];
    if (enrollmentTitles[typeParam]) {
        return enrollmentTitles[typeParam] + " | Token Self Service - LinOTP";
    }
    const tokenType = tokenDisplayData.find(d => d.type === typeParam);
    return $localize`Add ${tokenType.name}:INTERPOLATION:` + " | Token Self Service - LinOTP";
};

export const getStandardTitleResolver = (pageTitle: string): ResolveFn<string> => {
    return () => {
        return `${pageTitle} | Token Self Service - LinOTP`;
    };
}

const enrollmentTitles: { [key: string]: string } = {
    "assign": $localize`Assign Token`,
    "yubico": $localize`Register YubiCloud Token`
}