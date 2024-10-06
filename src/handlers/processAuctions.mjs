import { closeAuction } from "../libs/closeAuction.mjs";
import { getEndedAuctions } from "../libs/getEndedAuctions.mjs";

import createError from "http-errors";

async function processAuctions(event, context) {

    try {
        const auctionsToClose = await getEndedAuctions();
        const closePromises = auctionsToClose.map(auction => closeAuction(auction));
        await Promise.all(closePromises);

        return { clsoed: closePromises.length }
    } catch (err) {
        console.log(err);
        throw new createError.InternalServerError(err);

    }
}

export const handler = processAuctions;