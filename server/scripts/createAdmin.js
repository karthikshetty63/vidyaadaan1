// Create (or reset) a VIDYADAAN admin account from the command line.
// There is intentionally no public admin sign-up page.
//
// Usage:
//   npm run create-admin -- --email admin@example.com --name "Platform Admin"
//   npm run create-admin -- --email admin@example.com --reset-password
//
// The password is typed at a hidden prompt, or read from the ADMIN_PASSWORD
// environment variable for non-interactive use. It is never printed.
import dotenv from "dotenv";
import mongoose from "mongoose";
import process from "node:process";
import readline from "node:readline";
import connectDB from "../config/db.js";
import { createOrResetAdmin } from "../services/adminAccount.js";

const USAGE = 'Usage: npm run create-admin -- --email <email> --name "<name>" [--reset-password]';

const parseArgs = (argv) => {
    const args = { resetPassword: false };
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === "--email") args.email = argv[++i];
        else if (argv[i] === "--name") args.name = argv[++i];
        else if (argv[i] === "--reset-password") args.resetPassword = true;
        else if (argv[i] === "--help" || argv[i] === "-h") args.help = true;
        else throw new Error(`Unknown argument: ${argv[i]}\n${USAGE}`);
    }
    return args;
};

const askHidden = (question) =>
    new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
        let muted = false;
        rl._writeToOutput = (text) => {
            if (!muted) process.stdout.write(text);
        };
        rl.question(question, (answer) => {
            rl.close();
            process.stdout.write("\n");
            resolve(answer);
        });
        muted = true;
    });

const main = async () => {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        console.log(USAGE);
        return;
    }
    if (!args.email) throw new Error(`--email is required.\n${USAGE}`);

    let password = process.env.ADMIN_PASSWORD;
    if (!password) {
        if (!process.stdin.isTTY) throw new Error("Set ADMIN_PASSWORD or run this in an interactive terminal.");
        password = await askHidden("Admin password (min 8 characters): ");
        const confirm = await askHidden("Confirm password: ");
        if (password !== confirm) throw new Error("Passwords do not match.");
    }

    dotenv.config();
    await connectDB();
    try {
        const { created, user } = await createOrResetAdmin({ ...args, password });
        console.log(created ? `Admin account created for ${user.email}.` : `Password reset for admin ${user.email}.`);
    } finally {
        await mongoose.disconnect();
    }
};

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
