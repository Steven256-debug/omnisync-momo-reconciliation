import os
import json
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME) if TABLE_NAME else None

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    try:
        # Fetch up to 100 recent transactions using the GSI
        # In a production app, we would support pagination and filtering by merchant
        response = table.query(
            IndexName='Status-CreatedAt-Index',
            KeyConditionExpression='#st = :st',
            ExpressionAttributeNames={
                '#st': 'Status'
            },
            ExpressionAttributeValues={
                ':st': 'COMPLETED'
            },
            ScanIndexForward=False, # Descending by CreatedAt
            Limit=100
        )
        
        items = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'transactions': items}, cls=DecimalEncoder)
        }
    except Exception as e:
        print(f"Error fetching data: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Internal Server Error'})
        }
