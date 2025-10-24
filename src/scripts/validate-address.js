import axios from 'axios';
import qs from 'qs';

import { USPS_KEY, USPS_SECRET } from "astro:env/server";
import { allStateNamesAndCodes, zipRegExp } from "@/scripts/states";
import { AddressStatus } from '@/scripts/letter-state'

const TOKEN_URL = 'https://apis.usps.com/oauth2/v3/token';
const USPS_API_BASE_URL = 'https://apis.usps.com';

async function getAccessToken() {
    try {
        const data = qs.stringify({
            grant_type: 'client_credentials',
            client_id: USPS_KEY,
            client_secret: USPS_SECRET,
            scope: 'addresses',
        });

        const response = await axios.post(TOKEN_URL, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export async function validateAddress(address) {
    try {
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
        const zipParts = zipRegExp.exec(address.zipcode);
        const accessToken = await getAccessToken();
        const uri = `${USPS_API_BASE_URL}/addresses/v3/address` +
            `?streetAddress=${encodeURIComponent(address.street)}` +
            `&city=${encodeURIComponent(address.city)}` +
            `&state=${encodeURIComponent(address.state)}` +
            `&ZIPCode=${encodeURIComponent(zipParts.groups['zip'] ? zipParts.groups['zip'] : zipParts.groups['zip5'])}` +
            (zipParts.groups['plus4'] ? `&ZIPPlus4=${encodeURIComponent(zipParts.groups['plus4'])}` : "");
        const response = await axios.get(
            uri,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
        });
        var zipcode = response.data.address.ZIPCode;
        if (response.data.address.ZIPPlus4.length == 4) {
            zipcode += '-' + response.data.address.ZIPPlus4;
        }
        var status = AddressStatus.ERROR;
        var notes = "We were unable to validate this address.";
        response.data.corrections.forEach((c) => {
            if (c.code == '22') {
                status = AddressStatus.AMBIGUOUS;
                notes = c.text;
            }
            if (c.code == '32') {
                status = AddressStatus.INCOMPLETE;
                notes = c.text;
            }
        });
        response.data.matches.forEach((m) => {
            if (m.code == '31') {
                status = AddressStatus.EXACT;
                notes = m.text;
            }
        });

        var retval = address;
        retval.name = address.name;
        retval.street = response.data.address.streetAddress + ' ' + response.data.address.secondaryAddress;
        retval.city = response.data.address.city;
        retval.state = response.data.address.state;
        retval.zipcode = zipcode;
        retval.status = status;
        retval.notes = notes;
        return retval;
    } catch (error) {
        console.error('Error validating address:', error.message);
        address.status = AddressStatus.ERROR;
        if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
            address.notes = error.response.data.error.message;
        } else {
            address.notes = "Technical Error, please try again later.";
        }
        return address;
    }
}
