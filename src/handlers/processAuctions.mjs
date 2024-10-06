import { getEndedAuctions } from "../libs/getEndedAuctions.mjs";

async function processAuctions(event, context) {
    const auctionsToClose = await getEndedAuctions();     
    console.log(auctionsToClose);    
}

export const handler = processAuctions;