import { ethers } from "ethers";
import crypto from 'crypto';
import dotenv from 'dotenv';
import touristIdAbi from './touristIdAbi.json' assert { type: 'json' };

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, touristIdAbi, wallet);


export function hashTouristData(touristId, kycData) {
    const dataString = JSON.stringify({ touristId, ...kycData });
    return crypto.createHash('sha256').update(dataString).digest('hex');
}


export async function issueId(touristId, kycData) {
    const dataHash = hashTouristData(touristId, kycData);
    try {
        const tx = await contract.issueID(touristId, dataHash);
        await tx.wait(); 
        return tx.hash;
    } catch (error) {
        console.error("Error issuing ID:", error);
        throw error;
    }
}

export async function verifyId(touristId) {
    try {
        const result = await contract.getTouristID(touristId);
        return {
            isValid: result.isVerified,
            dataHash: result.dataHash,
            timestamp: result.timestamp
        };
    } catch (error) {
        console.error("Error verifying ID:", error);
        return { isValid: false, message: "ID not found or verification failed" };
    }
}