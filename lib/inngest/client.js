import { Inngest } from "inngest";


//create a client to send and receive event
export const inngest = new Inngest({
    id: "welth", // Unique app ID
    name: "welth",
    retryFunction: async (attempt) => ({
        delay: Math.pow(2, attempt) * 1000, // Exponential backoff
        maxAttempts: 2,
    })
});