export const prerender = false;

import { validateAddress } from "@/scripts/validate-address"

export async function POST({ request }) {
    try {
        const data = await request.json();
        const result = await validateAddress(data);
        if (!result.matched) {
            if (result.incomplete) {
                return new Response("Query is missing information", { status: 400 });
            }
            return new Response("Address Not Found", { status: 404 });
        } 
        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        console.error('Error validating address:', error.response ? error.response.data : error.message);
        return new Response(error.message, { status: 400 });
    }
}