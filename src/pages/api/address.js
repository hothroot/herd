export const prerender = false;

import axios from 'axios';
import qs from 'qs';

import { USPS_KEY, USPS_SECRET } from "astro:env/server";

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

export async function POST({ request }) {
  const data = await request.json();  
    try {
        const accessToken = await getAccessToken();
        const response = await axios.get(
            `${USPS_API_BASE_URL}/addresses/v3/address` +
            `?streetAddress=${encodeURIComponent(data.street)}` +
            `&city=${encodeURIComponent(data.city)}` +
            `&state=${encodeURIComponent(data.state)}` +
            `&ZIPCode=${encodeURIComponent(data.zipcode)}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
        });
        return new Response(JSON.stringify(response.data), { status: 200 });
    } catch (error) {
        console.error('Error validating address:', error.response ? error.response.data : error.message);
        return new Response(error.response.data.error.message, { status: error.response.data.error.code });
    }
}