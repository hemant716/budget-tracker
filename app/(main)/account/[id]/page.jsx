import { getAccountWithTransactions } from '@/action/account';
import { notFound } from 'next/navigation';
import  TransactionTable  from '../_components/transaction-table';
import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import AccountChart from '../_components/account-chart';

export default async function AccountsPage({ params }) {
   const accountData = await getAccountWithTransactions(params.Id);
  //console.log("Account data:", accountData);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${parseFloat(account.balance || 0).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count?.transactions ?? 0} Transactions
          </p>
        </div>
      </div>

      {/* chart section */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
      <AccountChart  transactions={transactions}/>
      </Suspense>
      {/* transaction table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
}
