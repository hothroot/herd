import okData from "@/scripts/dev-data"
import { type Address } from '@/scripts/letter-state.js';

const isDev = import.meta.env.DEV;
const apiKey = import.meta.env.FIVECALLS_API;

export default async function searchReps (origin: string, address: Address) {
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
    var reps = (
        'representatives' in data
        ? data['representatives'].filter((rep:any) => rep['area'] === 'US Senate') 
        : []);
    
    reps = await Promise.all(reps.map(async (rep) => { 
        const state = rep['state'];
        const last = rep['name'].split(' ').slice(1).join("_");
        const response = await fetch(new URL(`/api/office_${last}_${state}.json`, origin));
        if (response.ok) {
            const details = await response.json();
            rep["name"] = details["fullname"];
            rep["street"] = details["office"];
        }
        return rep;
    }));
    
    return(reps);
}