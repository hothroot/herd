import { USPSValidator } from "@/scripts/address-usps"
import { MapsValidator } from "@/scripts/address-maps"
import { AddressStatus } from '@/scripts/letter-state'
import { allStateNamesAndCodes, zipRegExp } from "@/scripts/states";
import { USPS_FIRST } from "astro:env/server";

export async function validateAddress(address) {
    if (!address.name
        || !address.street 
        || !address.city 
        || !address.state
        || !allStateNamesAndCodes.includes(address.state.toUpperCase())
        || !address.zipcode
        || !address["zipcode"].match(zipRegExp)) {
        address.status = AddressStatus.ERROR;
        address.notes = "Address is missing required information.";
        return address;
    }
    const usps = new USPSValidator();
    const maps = new MapsValidator();
    var validators = [ usps ];
    if (USPS_FIRST) {
        validators.push(maps);
    } else {
        validators.unshift(maps);
    }

    var result = await validators[0].validateAddress(address);
    if (result.status == AddressStatus.QUOTA || result.status == AddressStatus.ERROR) {
        result = await validators[1].validateAddress(address);
    }
    return result;
}
