FROM amazon/aws-lambda-python:3.13-x86_64 AS base
RUN microdnf install -y gcc gcc-c++ make rust cargo && microdnf clean all && rm -rf /var/cache/dnf

COPY v1-checks/requirements.txt .
RUN pip install -r requirements.txt -t /opt/python

FROM base AS final
WORKDIR ${LAMBDA_TASK_ROOT}
COPY v1-checks/src .
CMD ["app.lambda_handler"]
