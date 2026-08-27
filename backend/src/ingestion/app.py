import os
import json
import boto3
import uuid

sqs = boto3.client('sqs')
secrets_client = boto3.client('secretsmanager')

QUEUE_URL = os.environ.get('QUEUE_URL')
SECRET_ARN = os.environ.get('SECRET_ARN')

def get_secret():
    try:
        response = secrets_client.get_secret_value(SecretId=SECRET_ARN)
        return json.loads(response['SecretString'])
    except Exception as e:
        print(f"Error retrieving secret: {e}")
        return {}

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        headers = event.get('headers', {})
        
        # Determine network and validate (mock implementation)
        network = body.get('network', 'UNKNOWN')
        if network not in ['MTN', 'TELECEL', 'AT']:
            return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid network'})}
            
        # In a real app, we would validate the signature in the headers using the secret key
        # secrets = get_secret()
        # network_key = secrets.get(f"{network}_KEY")
        # validate_signature(headers.get('x-signature'), body, network_key)
        
        # Create a unique deduplication ID (usually from the transaction reference)
        transaction_ref = body.get('transaction_ref', str(uuid.uuid4()))
        merchant_id = body.get('merchant_id', 'UNKNOWN_MERCHANT')
        message_group_id = merchant_id # Group by merchant to ensure ordering per merchant
        
        # Enqueue to SQS FIFO
        response = sqs.send_message(
            QueueUrl=QUEUE_URL,
            MessageBody=json.dumps(body),
            MessageGroupId=message_group_id,
            MessageDeduplicationId=transaction_ref
        )
        
        return {
            'statusCode': 202,
            'body': json.dumps({'message': 'Accepted', 'messageId': response.get('MessageId')})
        }
        
    except json.JSONDecodeError:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid JSON'})}
    except Exception as e:
        print(f"Error processing webhook: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': 'Internal Server Error'})}
