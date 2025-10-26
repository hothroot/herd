export const prerender = false;

import { validateAddress } from "@/scripts/validate-address"

export async function POST({ request }) {
    try {
        const data = await request.json();
        const result = await validateAddress(data);
        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        console.error('Error validating address:', error.response ? error.response.data : error.message);
        return new Response(error.message, { status: 400 });
    }
}