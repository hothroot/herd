import { USPSValidator } from "@/scripts/address-usps"
import { MapsValidator } from "@/scripts/address-maps"
import { AddressStatus } from '@/scripts/letter-state'
import { allStateNamesAndCodes, zipRegExp } from "@/scripts/states";

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
    var result = await new USPSValidator().validateAddress(address);
    if (result.status == AddressStatus.QUOTA || result.status == AddressStatus.ERROR) {
        result = await new MapsValidator().validateAddress(address);
    }
    return result;
}
