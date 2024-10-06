import AWS from 'aws-sdk';
import { commonMiddleware } from '../libs/commonMiddleware.mjs';
import createError from 'http-errors';


const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
   let auctions;
   const { status } = event.queryStringParameters;
   const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      IndexName: 'StatusAndEndDate',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeValues: {
         ':status': status,
      },
      ExpressionAttributeNames: {
         '#status': 'status',
      },
   };

   try {
      const result = await dynamoDb.query(params).promise();

      auctions = result.Items;
   } catch (err) {
      console.log(err);
      throw new createError.InternalServerError(err);
   }

   return {
      statusCode: 200,
      body: JSON.stringify(auctions),
   };
}

export const handler = commonMiddleware(getAuctions);


