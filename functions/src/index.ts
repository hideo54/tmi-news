import admin from 'firebase-admin'; // Default import required
import { getFirestore } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { App, ExpressReceiver } from '@slack/bolt';
import dotenv from 'dotenv';
dotenv.config();
import facultyNews from './facultyNews';
import notifier from './notifier';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const randomChannel = process.env.SLACK_RANDOM_CHANNEL!;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const facultyNewsChannel = process.env.SLACK_FACULTY_NEWS_CHANNEL!;

const receiver = new ExpressReceiver({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    processBeforeResponse: true,
});
const slackApp = new App({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    token: process.env.SLACK_TOKEN!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    receiver,
});

setGlobalOptions({
    region: 'asia-northeast1',
});

export const tmiSlackHourlyJob = onSchedule('every 1 hours', async () => {
    admin.initializeApp();
    const firestoreDb = getFirestore();
    await facultyNews({ slackApp, firestoreDb, channel: facultyNewsChannel });
});

export const tmiSlackEventsReceiver = onRequest(
    notifier({
        slackApp,
        receiver,
        channel: randomChannel,
    })
);
