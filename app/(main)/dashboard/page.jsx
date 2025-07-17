import React, { Suspense } from 'react'
import  {getCurrentBudget}  from "@/action/budget"
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import AccountCard from './_components/account-card';
import { getDashboardData, getUserAccounts } from '@/action/dashboard';
import  BudgetProgress  from "./_components/budget-progress";
import { DashboardOverview } from './_components/transaction-overview';


export default async function DashboardPage() {
  const accounts = await getUserAccounts();
 // console.log("Accounts:", accounts);
  const defaultAccount = accounts?.find((account) => account.isDefault);
  //console.log("Default Account:", defaultAccount);

   // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }
  const transactions=await getDashboardData();
  return (
    <div className='px-5'>
      {/*buget progress*/}
      < BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      {/* overview*/}
      <Suspense fallback={"loading overview ...."}>
        <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
        />

      </Suspense>
    
      {/* account Grid*/}
      <div>
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {
          accounts.length > 0 && accounts?.map((accounts) => {
            return <AccountCard key={accounts.id} account={accounts} />
          })
        }
      </div>

    </div>
  )
}
