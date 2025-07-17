"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { updateDefaultAccount } from "@/action/account";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;
  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent Link navigation

    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  const formattedBalance = isNaN(parseFloat(balance))
    ? "0.00"
    : parseFloat(balance).toFixed(2);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer">
          <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
          {/* Removed CardDescription for clarity */}
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">${formattedBalance}</div>
          <p className="text-xs text-muted-foreground ">
            {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>

        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>

      <Switch
        checked={isDefault}
        onCheckedChange={handleDefaultChange}
        disabled={updateDefaultLoading}
        aria-label={`Set ${name} as default account`}
        className="absolute top-4 right-4"
      />
    </Card>
  );
}

export default AccountCard;
