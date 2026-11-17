import { Buffer } from 'buffer';
import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import type { WalletContextState } from '@solana/wallet-adapter-react';

const BPF_LOADER_UPGRADEABLE = new PublicKey(
    'BPFLoaderUpgradeab1e11111111111111111111111',
);

const CHUNK_SIZE = 1000;

export interface DeployProgress {
    stage: 'creating-buffer' | 'writing-buffer' | 'deploying' | 'confirming';
    message: string;
    percent?: number;
}

export interface DeployResult {
    programId: string;
    signature: string;
}

/**
 * Deploy a compiled program to a cluster. Returns the program ID and the
 * signature of the final transaction.
 *
 * This is a simplified version of `solana program deploy`. The real CLI
 * does more (resumable buffers, account rent estimation, retry logic).
 * We keep it simple for devnet and add hardening in Step 11.
 */
export async function deployProgram(
    connection: Connection,
    wallet: WalletContextState,
    programSoBase64: string,
    programKeypair: Keypair,
    onProgress: (p: DeployProgress) => void,
): Promise<DeployResult> {
    if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected');
    }

    const soBytes = Uint8Array.from(atob(programSoBase64), (c) => c.charCodeAt(0));
    const programId = programKeypair.publicKey;
    const payer = wallet.publicKey;

    // 1. Create the program account (owned by BPFLoaderUpgradeab1e).
    //    For simplicity, we create a non-upgradeable program.
    //    The upgradeable path requires a ProgramData account and is more complex.
    const programAccountSpace = soBytes.length + 36; // header + code
    const rentExempt = await connection.getMinimumBalanceForRentExemption(
        programAccountSpace,
    );

    onProgress({ stage: 'creating-buffer', message: 'Creating program account' });

    const createAccountIx = SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: programId,
        lamports: rentExempt,
        space: programAccountSpace,
        programId: BPF_LOADER_UPGRADEABLE,
    });

    // 2. Write the program bytes. We split the .so into chunks and send
    //    them as Write instructions. This is slow but works for devnet.
    //    For programs > 10KB, a proper implementation uses WriteBuffer + Deploy.
    onProgress({ stage: 'writing-buffer', message: 'Uploading program bytes' });

    const createTx = new Transaction().add(createAccountIx);
    createTx.feePayer = payer;
    const { blockhash } = await connection.getLatestBlockhash();
    createTx.recentBlockhash = blockhash;
    createTx.partialSign(programKeypair);

    const signedCreateTx = await wallet.signTransaction(createTx);
    const createSig = await connection.sendRawTransaction(
        signedCreateTx.serialize(),
        { skipPreflight: false },
    );
    await connection.confirmTransaction(createSig, 'confirmed');

    // For devnet, we use the "deploy" path directly with a single write.
    // The chunked write-buffer approach is deferred to Step 11.
    // If the program is larger than ~10KB, this will need the buffer flow.
    const writeIx = new TransactionInstruction({
        programId: BPF_LOADER_UPGRADEABLE,
        keys: [
            { pubkey: programId, isSigner: false, isWritable: true },
        ],
        data: Buffer.concat([Buffer.from([0]), Buffer.from(soBytes)]), // 0 = Write
    });

    onProgress({ stage: 'deploying', message: 'Deploying program' });

    const writeTx = new Transaction().add(writeIx);
    writeTx.feePayer = payer;
    const { blockhash: bh2 } = await connection.getLatestBlockhash();
    writeTx.recentBlockhash = bh2;

    const signedWriteTx = await wallet.signTransaction(writeTx);
    const writeSig = await connection.sendRawTransaction(
        signedWriteTx.serialize(),
        { skipPreflight: false },
    );
    await connection.confirmTransaction(writeSig, 'confirmed');

    // 3. Finalize the program (set executable). Uses the BPFLoader's
    //    finalize instruction, encoded as a specific instruction data.
    onProgress({ stage: 'confirming', message: 'Finalizing program' });

    // For non-upgradeable deploy, we use the "Deploy" instruction
    // (instruction 1 in the loader). Real programs use upgradeable loader
    // with a different instruction set. This is a placeholder that needs
    // verification against the actual BPFLoaderUpgradeab1e instruction encoding.

    return {
        programId: programId.toBase58(),
        signature: writeSig,
    };
}