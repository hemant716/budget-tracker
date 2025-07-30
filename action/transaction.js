"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { Buffer } from "buffer";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY": date.setDate(date.getDate() + 1); break;
    case "WEEKLY": date.setDate(date.getDate() + 7); break;
    case "MONTHLY": date.setMonth(date.getMonth() + 1); break;
    case "YEARLY": date.setFullYear(date.getFullYear() + 1); break;
  }
  return date;
}

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const req = await request();
    const decision = await aj.protect(req, { userId, requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error("Rate limit exceeded", { remaining, reset });
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked by ArcJet");
    }

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: { id: data.accountId, userId: user.id },
    });
    if (!account) throw new Error("Account not found");

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate: data.isRecurring && data.recurringInterval
            ? calculateNextRecurringDate(data.date, data.recurringInterval)
            : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    console.error("Create transaction error:", error);
    throw error;
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: { id, userId: user.id },
  });
  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const original = await db.transaction.findUnique({
      where: { id, userId: user.id },
      include: { account: true },
    });
    if (!original) throw new Error("Transaction not found");

    const oldChange = original.type === "EXPENSE" ? -original.amount.toNumber() : original.amount.toNumber();
    const newChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const netChange = newChange - oldChange;

    const updated = await db.$transaction(async (tx) => {
      const updatedTx = await tx.transaction.update({
        where: { id, userId: user.id },
        data: {
          ...data,
          nextRecurringDate: data.isRecurring && data.recurringInterval
            ? calculateNextRecurringDate(data.date, data.recurringInterval)
            : null,
        },
      });

      if (data.accountId !== original.accountId) {
        await tx.account.update({
          where: { id: original.accountId },
          data: { balance: { decrement: oldChange } },
        });
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: newChange } },
        });
      } else {
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: netChange } },
        });
      }

      return updatedTx;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(updated) };
  } catch (error) {
    console.error("Update transaction error:", error);
    throw error;
  }
}

export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: { userId: user.id, ...query },
      include: { account: true },
      orderBy: { date: "desc" },
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Get user transactions error:", error);
    throw error;
  }
}

export async function scanReceipt(file) {
  try {
    if (!file.type.startsWith("image/")) {
      throw new Error("Unsupported file type. Please upload an image.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
Analyze this receipt image and extract the following information in JSON format:
{
  "amount": number,
  "date": "ISO date string",
  "description": "string",
  "merchantName": "string",
  "category": "string"
}
If it's not a receipt, return an empty object.
`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = (await response.text()).trim();

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error("No valid JSON found");

    const data = JSON.parse(jsonMatch[0]);

    if (Object.keys(data).length === 0) return {};

    return {
      amount: parseFloat(data.amount),
      date: new Date(data.date),
      description: data.description,
      category: data.category,
      merchantName: data.merchantName,
    };
  } catch (error) {
    console.error("Scan receipt error:", error);
    throw new Error("Failed to scan receipt");
  }
}
