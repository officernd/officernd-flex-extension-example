import { createHmac } from 'crypto';
import * as dayjs from 'dayjs';
import { isNumber, last } from 'lodash';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

const TIMESTAMP_DRIFT_TOLERANCE_IN_SECONDS = 60;

@Injectable()
export class SignaturesService {
    private parseSignature(signatureString: string) {
        const [timestamp, signature] = signatureString
            .split(',')
            .map((segment) => segment.split('='))
            .map((splitSegments) => last(splitSegments));

        return { timestamp, signature };
    }

    public verifySignedData(
        signatureString: string,
        payload: any,
        secret: string,
    ) {
        const { timestamp, signature } = this.parseSignature(signatureString);

        if (!timestamp || !signature) {
            throw new HttpException(
                'The request is not signed. Make sure you send the "signature" query parameter',
                HttpStatus.UNAUTHORIZED,
            );
        }

        try {
            this.verifyTimestamp(timestamp);
            this.verifySignature(payload, signature, timestamp, secret);
        } catch (error) {
            throw new HttpException(
                `Failed to verify request signature: ${error.message}`,
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    private verifyTimestamp(timestamp: string) {
        const timestampInMS = Number(timestamp);
        if (!isNumber(timestampInMS) || isNaN(timestampInMS)) {
            throw new Error('Invalid timestamp');
        }

        const diffInSeconds = dayjs().diff(
            dayjs(timestampInMS * 1000),
            'seconds',
        );

        if (
            diffInSeconds < 0 ||
            diffInSeconds > TIMESTAMP_DRIFT_TOLERANCE_IN_SECONDS
        ) {
            throw new Error('Signature expired');
        }
    }

    private verifySignature(
        payload: any,
        signature: string,
        timestamp: string,
        secret: string,
    ) {
        // sanitize payload properties
        // the server may not send
        if (!payload.memberId) {
            delete payload.memberId;
        }

        const payloadToSign = `${JSON.stringify(payload)}.${timestamp}`;

        const mySignature = createHmac('sha256', secret)
            .update(payloadToSign)
            .digest('hex');

        if (mySignature !== signature) {
            throw new Error('Invalid signature');
        }
    }
}
