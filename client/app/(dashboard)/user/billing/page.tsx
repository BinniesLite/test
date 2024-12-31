"use client"

import Loading from '@/components/loading';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';
import { useGetTransactionsQuery } from '@/state/api';
import { useUser } from '@clerk/nextjs';
import { SelectTrigger, SelectValue } from '@radix-ui/react-select';
import React, { useState } from 'react'

const UserBillingPage = () => {
    const [paymentType, setPaymentType] = useState("all");

    const { user, isLoaded } = useUser();
    const { data: transactions, isLoading: isLoadingTransactions } = useGetTransactionsQuery(user?.id || "", {
        skip: !isLoaded || !user
    })

    const filteredData =
        transactions?.filter((transaction) => {
            const matchesType = paymentType === "all" || transaction.paymentProvider === paymentType;

            return matchesType
        }) || [];

    if (!isLoaded) return <Loading />
    if (!user) return <div>Something</div>



    return (
        <div className='billing'>
            <div className='billing__container'>
                <div className='billing__title'>Payment History</div>
                <div className="billing__filters">
                    <Select value={paymentType} onValueChange={setPaymentType}>
                        <SelectTrigger className="billing__select">
                            <SelectValue placeholder="Payment Type" />
                        </SelectTrigger>

                        <SelectContent className="billing__select-content">
                            <SelectItem className="billing__select-item" value="all">
                                All Types
                            </SelectItem>
                            <SelectItem className="billing__select-item" value="stripe">
                                Stripe
                            </SelectItem>
                            <SelectItem className="billing__select-item" value="paypal">
                                Paypal
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className='billing-grid'>
                    {isLoadingTransactions ? <Loading /> :
                        (
                            <Table className='billing__table'>
                                <TableHeader className='billing__table-header'>
                                    <TableRow className='billing__table-header-row'>
                                        <TableHead className='billing__table-cell'>Date</TableHead>
                                        <TableHead className='billing__table-cell'>Amount</TableHead>
                                        <TableHead className='billing__table-cell'>Payment Method</TableHead>
                                    </TableRow>

                                </TableHeader>
                                <TableBody className='billing__table-body'>
                                    {filteredData.length > 0 &&
                                        filteredData.map((transaction) => (
                                            <TableRow
                                                className='billing__table-row'
                                                key={transaction.transactionId}

                                            >
                                                <TableCell className='billing__table-cell'>{new Date(transaction.dateTime).toLocaleDateString()}</TableCell>
                                                <TableCell className='billing__table-cell'>{formatPrice(transaction.amount)}</TableCell>
                                                <TableCell className='billing__table-cell'>{transaction.paymentProvider}</TableCell>

                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default UserBillingPage