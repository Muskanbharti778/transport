let nextPaymentId = 1;

export const mockAddPayment = async (tripId, payload) => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  await delay(300);

  return {
    paymentid: nextPaymentId++,
    tripid: tripId,
    cid: payload.cid,
    amount: payload.amount,
    paymentdate: payload.paymentdate,
    paymentmode: payload.paymentmode || 'cash',
    remark: payload.remark || '',
  };
};
