import okData from "@/scripts/dev-data"
import { type Address } from '@/scripts/letter-state.js';

const isDev = import.meta.env.DEV;
const apiKey = import.meta.env.FIVECALLS_API;

export default async function searchReps (address: Address) {
    var data = undefined;
    if (isDev && address["name"] !== "fetch") {
        if (address["name"] === "error") {
            console.log('using error dev data');
        } else {
            console.log('using ok dev data');
            data = okData;
        }
    } else {
        console.log('fetching real data');
        const location = encodeURIComponent(`${address["state"]} ${address["zipcode"]}`);
        const searchUrl = `https://api.5calls.org/v1/representatives?location=${location}`;
        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'X-5Calls-Token': apiKey,
            },
        });
        if (response.ok) {
            data = await response.json();
        }
    }
    const reps = (
        'representatives' in data
        ? data['representatives'].filter((rep:any) => rep['area'] === 'US Senate') 
        : []);
    console.log(reps);
    return(reps);
}