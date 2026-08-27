import os
import json
import decimal
import boto3
import datetime
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

TABLE_NAME = os.environ.get('TABLE_NAME')
BUCKET_NAME = os.environ.get('BUCKET_NAME')
table = dynamodb.Table(TABLE_NAME) if TABLE_NAME else None

def lambda_handler(event, context):
    for record in event.get('Records', []):
        try:
            body_str = record.get('body', '{}')
            payload = json.loads(body_str, parse_float=decimal.Decimal)
            
            merchant_id = payload.get('merchant_id', 'UNKNOWN')
            transaction_ref = payload.get('transaction_ref', 'UNKNOWN')
            amount = payload.get('amount', 0)
            network = payload.get('network', 'UNKNOWN')
            
            pk = f"MERCHANT#{merchant_id}"
            sk = f"TX#{transaction_ref}"
            created_at = datetime.datetime.utcnow().isoformat()
            
            # Idempotent write to DynamoDB
            table.put_item(
                Item={
                    'PK': pk,
                    'SK': sk,
                    'Status': 'COMPLETED',
                    'CreatedAt': created_at,
                    'Amount': amount,
                    'Network': network,
                    'RawPayload': body_str
                },
                ConditionExpression='attribute_not_exists(PK) AND attribute_not_exists(SK)'
            )
            
            # Archive to S3
            s3_key = f"{merchant_id}/{datetime.datetime.utcnow().strftime('%Y/%m/%d')}/{transaction_ref}.json"
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=s3_key,
                Body=body_str,
                ContentType='application/json'
            )
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                # Idempotency hit: record already exists, so we just acknowledge the message (skip error)
                print(f"Transaction {transaction_ref} already processed (idempotency hit).")
            else:
                print(f"DynamoDB error: {e}")
                raise e # Throw to DLQ if max retries hit
        except Exception as e:
            print(f"Error processing record: {e}")
            raise e # Retries logic by SQS
            
    return {'statusCode': 200, 'body': 'Processed'}
