import json

from aws_lambda_powertools.utilities.data_classes import event_source, APIGatewayProxyEvent

from logger import logger


@event_source(data_class=APIGatewayProxyEvent)
@logger.inject_lambda_context(log_event=True)
def lambda_handler(event, context):
    try:
        return {
            "statusCode": 200,
            "headers": {
                'Content-Type': 'application/json',
            },
            "body": json.dumps({"message": 'v1.0.0 API INNOVA FAM'}),
        }
    except Exception as e:
        logger.error(f"Error en el authorizer: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                'Content-Type': 'application/json',
            },
            "body": json.dumps({"error": {"name": "GeneralError", "message": str(e)}}),
        }