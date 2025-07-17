import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";


const checkUser = async () => {
  const user = await currentUser();

  if (!user) return null;

  try {
    const existingUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (existingUser) return existingUser;

    if (!user.emailAddresses || user.emailAddresses.length === 0) {
      throw new Error("User has no email addresses.");
    }

    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error.message);
    return null;
  }
};

export default checkUser;

