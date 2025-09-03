import { allStateNamesAndCodes, zipRegExp } from "@/scripts/states"

export type Address = {   
    name: string;
    street: string;
    city: string;
    state: string;
    zipcode: string;
}; 
export type Rep = {
    id: string;
    fullName: string;
    salutation: string;
    photoURL: string;
    state: string;
    office: string;
};
export type Reps = Array<Rep>;
export type Envelope = {
    address: Address;
    reps: Reps;
    signature: string;
} | null;

export function isAddressValid(address: Address) {
    return (
        address["name"].length > 0 &&
        allStateNamesAndCodes.includes(address["state"].toUpperCase()) &&
        address["zipcode"].match(zipRegExp)
    );
}
