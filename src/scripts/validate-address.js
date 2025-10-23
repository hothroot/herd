import axios from 'axios';
import qs from 'qs';

import { USPS_KEY, USPS_SECRET } from "astro:env/server";
import { zipRegExp } from "@/scripts/states"

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
        if (!address.name || !address.street || !address.city || !address.state || !address.zipcode) {
            address.error = true;
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
        const corrections = response.data.corrections.map((c) => c.code);
        const matches = response.data.matches.map((c) => c.code);
        var zipcode = response.data.address.ZIPCode;
        if (response.data.address.ZIPCode.length == 4) {
            zipcode += '-' + response.data.address.ZIPPlus4;
        }
        const retval = {
            name: address.name,
            street:  response.data.address.streetAddress,
            city: response.data.address.city,
            state: response.data.address.state,
            zipcode: zipcode,
            matched: true,
            exact: matches.includes('31'),
            incomplete: corrections.includes('32'),
            ambiguous: corrections.includes('22'),
            error: false,
        }
        return retval;
    } catch (error) {
        console.error('Error validating address:', error.message);
        address.error = true;
        return address;
    }
}
