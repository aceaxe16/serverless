import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import { commonMiddleware } from '../libs/commonMiddleware.mjs';
import createError from 'http-errors';
import { getAuctionById } from './getAuction.mjs';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import { schema as placeBidSchema } from '../libs/schemas/placeBidSchema.mjs';


const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    const { id } = event.pathParameters;
    const { amount } = event.body;

    const auction = await getAuctionById(id);

    if (auction.status !== 'OPEN') {
        throw new createError.Forbidden('You cant bid on a closed auction');
    }

    if (amount <= auction.highestBid.amount) {
        throw new createError.Forbidden(`Your bid should be higher than ${auction.highestBid.amount}`)
    }

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount
        },
        ReturnValues: 'ALL_NEW',
    }

    let updatedAuction
    try {
        const result = await dynamoDb.update(params).promise();
        updatedAuction = result.Attributes;
    } catch (err) {
        console.log(err);
        throw new createError.InternalServerError(err)
    }

    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction),
    };
}

export const handler = commonMiddleware(placeBid).use(validator({ eventSchema: transpileSchema(placeBidSchema) }));


