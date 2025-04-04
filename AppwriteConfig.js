import { Client, Account, ID, Databases } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1') // Change this to your Appwrite endpoint
  .setProject('67e937f6000cc5fcfca8'); // Replace with your Appwrite project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const COLLECTION_ID = '67ecb621003d9b423224'; 

export { ID };
