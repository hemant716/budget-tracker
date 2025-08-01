import { getUserAccounts } from '@/action/dashboard';
import { defaultCategories } from '@/data/categories';
import AddTransactionForm from '../_components/transaction-form';
import { getTransaction } from '@/action/transaction';
import React from 'react';

const AddTransactionPage = async ({ searchParams }) => {
  const params = await searchParams;   // <--- await here
  const accounts = await getUserAccounts();

  const editId = params?.edit;
  let initialData = null;

  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title">
          {editId ? 'Edit Transaction' : 'Add Transaction'}
        </h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
};

export default AddTransactionPage;